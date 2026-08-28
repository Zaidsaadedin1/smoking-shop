


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."discount_type" AS ENUM (
    'percentage',
    'fixed'
);


ALTER TYPE "public"."discount_type" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'failed',
    'refunded'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'cash_on_delivery',
    'card',
    'bank_transfer',
    'apple_pay',
    'google_pay'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'authorized',
    'paid',
    'failed',
    'cancelled',
    'partially_refunded',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."product_status" AS ENUM (
    'draft',
    'active',
    'inactive',
    'archived'
);


ALTER TYPE "public"."product_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'customer',
    'admin',
    'super_admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."checkout_cart"("p_shipping_address_id" "uuid", "p_billing_address_id" "uuid" DEFAULT NULL::"uuid", "p_payment_method" "public"."payment_method" DEFAULT 'cash_on_delivery'::"public"."payment_method", "p_coupon_code" "text" DEFAULT NULL::"text", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$

DECLARE

  v_user_id UUID;

  v_cart_id UUID;

  v_order_id UUID;

  v_shipping_address JSONB;

  v_billing_address JSONB;

  v_customer_name TEXT;

  v_customer_phone TEXT;

  v_customer_email TEXT;

  v_subtotal NUMERIC(12,2) := 0;

  v_discount NUMERIC(12,2) := 0;

  v_shipping NUMERIC(12,2) := 0;

  v_tax NUMERIC(12,2) := 0;

  v_total NUMERIC(12,2) := 0;

  v_tax_percent NUMERIC(12,2) := 0;

  v_free_shipping_threshold NUMERIC(12,2) := 0;

  v_unit_price NUMERIC(12,2);

  v_coupon public.coupons%ROWTYPE;

  v_coupon_usage_count INTEGER := 0;

  v_item RECORD;

BEGIN

  -- ----------------------------------------------------------
  -- USER
  -- ----------------------------------------------------------

  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;


  IF EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = v_user_id
      AND is_blocked = TRUE
  ) THEN

    RAISE EXCEPTION 'This user account is blocked';

  END IF;


  -- ----------------------------------------------------------
  -- CUSTOMER INFORMATION
  -- ----------------------------------------------------------

  SELECT
    p.full_name,
    p.phone,
    u.email

  INTO
    v_customer_name,
    v_customer_phone,
    v_customer_email

  FROM public.profiles p

  LEFT JOIN auth.users u
    ON u.id = p.id

  WHERE p.id = v_user_id;


  -- ----------------------------------------------------------
  -- SHIPPING ADDRESS
  -- ----------------------------------------------------------

  SELECT
    TO_JSONB(a)
      - 'id'
      - 'user_id'
      - 'created_at'
      - 'updated_at'

  INTO v_shipping_address

  FROM public.addresses a

  WHERE a.id = p_shipping_address_id
    AND a.user_id = v_user_id;


  IF v_shipping_address IS NULL THEN
    RAISE EXCEPTION 'Shipping address not found';
  END IF;


  -- ----------------------------------------------------------
  -- BILLING ADDRESS
  -- ----------------------------------------------------------

  IF p_billing_address_id IS NULL THEN

    v_billing_address := v_shipping_address;

  ELSE

    SELECT
      TO_JSONB(a)
        - 'id'
        - 'user_id'
        - 'created_at'
        - 'updated_at'

    INTO v_billing_address

    FROM public.addresses a

    WHERE a.id = p_billing_address_id
      AND a.user_id = v_user_id;


    IF v_billing_address IS NULL THEN
      RAISE EXCEPTION 'Billing address not found';
    END IF;

  END IF;


  -- ----------------------------------------------------------
  -- CART
  -- ----------------------------------------------------------

  SELECT id
  INTO v_cart_id

  FROM public.carts

  WHERE user_id = v_user_id;


  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'Cart not found';
  END IF;


  IF NOT EXISTS (
    SELECT 1
    FROM public.cart_items
    WHERE cart_id = v_cart_id
  ) THEN

    RAISE EXCEPTION 'Cart is empty';

  END IF;


  -- ----------------------------------------------------------
  -- VALIDATE STOCK + CALCULATE SUBTOTAL
  -- Lock variants to prevent overselling.
  -- ----------------------------------------------------------

  FOR v_item IN

    SELECT
      ci.variant_id,
      ci.quantity,

      v.stock_quantity,
      v.track_inventory,
      v.allow_backorder,
      v.is_active AS variant_active,

      p.status AS product_status

    FROM public.cart_items ci

    JOIN public.product_variants v
      ON v.id = ci.variant_id

    JOIN public.products p
      ON p.id = v.product_id

    WHERE ci.cart_id = v_cart_id

    FOR UPDATE OF v

  LOOP

    IF v_item.product_status <> 'active' THEN
      RAISE EXCEPTION 'A product in your cart is unavailable';
    END IF;


    IF v_item.variant_active = FALSE THEN
      RAISE EXCEPTION 'A product variant in your cart is unavailable';
    END IF;


    IF
      v_item.track_inventory = TRUE
      AND
      v_item.allow_backorder = FALSE
      AND
      v_item.stock_quantity < v_item.quantity
    THEN

      RAISE EXCEPTION
        'Not enough stock for variant %',
        v_item.variant_id;

    END IF;


    v_unit_price :=
      public.get_variant_effective_price(
        v_item.variant_id
      );


    IF v_unit_price IS NULL THEN
      RAISE EXCEPTION 'Unable to calculate product price';
    END IF;


    v_subtotal :=
      v_subtotal +
      (
        v_unit_price *
        v_item.quantity
      );

  END LOOP;


  -- ----------------------------------------------------------
  -- COUPON
  -- ----------------------------------------------------------

  IF p_coupon_code IS NOT NULL
     AND TRIM(p_coupon_code) <> ''
  THEN

    SELECT *
    INTO v_coupon

    FROM public.coupons

    WHERE UPPER(code) = UPPER(TRIM(p_coupon_code))
      AND is_active = TRUE
      AND (
        starts_at IS NULL
        OR NOW() >= starts_at
      )
      AND (
        ends_at IS NULL
        OR NOW() <= ends_at
      )

    FOR UPDATE;


    IF NOT FOUND THEN
      RAISE EXCEPTION 'Coupon is invalid or expired';
    END IF;


    IF v_subtotal < v_coupon.minimum_order_amount THEN

      RAISE EXCEPTION
        'Minimum order amount for this coupon is %',
        v_coupon.minimum_order_amount;

    END IF;


    IF
      v_coupon.max_uses IS NOT NULL
      AND
      v_coupon.used_count >= v_coupon.max_uses
    THEN

      RAISE EXCEPTION 'Coupon usage limit reached';

    END IF;


    SELECT COUNT(*)
    INTO v_coupon_usage_count

    FROM public.coupon_usages

    WHERE coupon_id = v_coupon.id
      AND user_id = v_user_id;


    IF
      v_coupon.max_uses_per_user IS NOT NULL
      AND
      v_coupon_usage_count >= v_coupon.max_uses_per_user
    THEN

      RAISE EXCEPTION
        'You already used this coupon';

    END IF;


    IF v_coupon.discount_type = 'percentage' THEN

      v_discount :=
        ROUND(
          v_subtotal *
          (
            LEAST(
              v_coupon.discount_value,
              100
            ) / 100
          ),
          2
        );

    ELSE

      v_discount :=
        LEAST(
          v_subtotal,
          v_coupon.discount_value
        );

    END IF;


    IF v_coupon.maximum_discount IS NOT NULL THEN

      v_discount :=
        LEAST(
          v_discount,
          v_coupon.maximum_discount
        );

    END IF;

  END IF;


  -- ----------------------------------------------------------
  -- SHIPPING SETTINGS
  -- ----------------------------------------------------------

  SELECT
    COALESCE(
      (value #>> '{}')::NUMERIC,
      0
    )

  INTO v_shipping

  FROM public.store_settings

  WHERE key = 'shipping_flat_rate';


  v_shipping := COALESCE(v_shipping, 0);


  SELECT
    COALESCE(
      (value #>> '{}')::NUMERIC,
      0
    )

  INTO v_free_shipping_threshold

  FROM public.store_settings

  WHERE key = 'free_shipping_threshold';


  v_free_shipping_threshold :=
    COALESCE(
      v_free_shipping_threshold,
      0
    );


  IF
    v_free_shipping_threshold > 0
    AND
    (v_subtotal - v_discount)
      >= v_free_shipping_threshold
  THEN

    v_shipping := 0;

  END IF;


  -- ----------------------------------------------------------
  -- TAX
  -- ----------------------------------------------------------

  SELECT
    COALESCE(
      (value #>> '{}')::NUMERIC,
      0
    )

  INTO v_tax_percent

  FROM public.store_settings

  WHERE key = 'tax_percent';


  v_tax_percent :=
    COALESCE(
      v_tax_percent,
      0
    );


  v_tax :=
    ROUND(
      (
        v_subtotal -
        v_discount +
        v_shipping
      )
      *
      (
        v_tax_percent / 100
      ),
      2
    );


  -- ----------------------------------------------------------
  -- TOTAL
  -- -------------------------------- --------------------------

  v_total :=
    GREATEST(
      0,
      v_subtotal -
      v_discount +
      v_shipping +
      v_tax
    );


  -- ----------------------------------------------------------
  -- CREATE ORDER
  -- ----------------------------------------------------------

  INSERT INTO public.orders
  (
    order_number,

    user_id,

    payment_method,

    customer_name,
    customer_email,
    customer_phone,

    shipping_address,
    billing_address,

    subtotal,
    discount_amount,
    shipping_amount,
    tax_amount,
    total_amount,

    coupon_id,
    coupon_code,

    notes
  )
  VALUES
  (
    '',

    v_user_id,

    p_payment_method,

    v_customer_name,
    v_customer_email,
    v_customer_phone,

    v_shipping_address,
    v_billing_address,

    v_subtotal,
    v_discount,
    v_shipping,
    v_tax,
    v_total,

    CASE
      WHEN p_coupon_code IS NOT NULL
      THEN v_coupon.id
      ELSE NULL
    END,

    CASE
      WHEN p_coupon_code IS NOT NULL
      THEN v_coupon.code
      ELSE NULL
    END,

    p_notes
  )

  RETURNING id
  INTO v_order_id;


  -- ----------------------------------------------------------
  -- INITIAL STATUS HISTORY
  -- ----------------------------------------------------------

  INSERT INTO public.order_status_history
  (
    order_id,
    status,
    changed_by
  )
  VALUES
  (
    v_order_id,
    'pending',
    v_user_id
  );


  -- ----------------------------------------------------------
  -- CREATE ORDER ITEMS + DECREASE STOCK
  -- ----------------------------------------------------------

  FOR v_item IN

    SELECT
      ci.variant_id,
      ci.quantity,

      v.product_id,
      v.sku,
      v.track_inventory,

      p.name AS product_name,

      s.name AS size_name,

      c.name AS color_name,

      (
        SELECT pi.image_url

        FROM public.product_images pi

        WHERE pi.product_id = p.id

        ORDER BY
          pi.is_primary DESC,
          pi.sort_order ASC

        LIMIT 1
      ) AS image_url

    FROM public.cart_items ci

    JOIN public.product_variants v
      ON v.id = ci.variant_id

    JOIN public.products p
      ON p.id = v.product_id

    LEFT JOIN public.sizes s
      ON s.id = v.size_id

    LEFT JOIN public.colors c
      ON c.id = v.color_id

    WHERE ci.cart_id = v_cart_id

  LOOP

    v_unit_price :=
      public.get_variant_effective_price(
        v_item.variant_id
      );


    INSERT INTO public.order_items
    (
      order_id,

      product_id,
      variant_id,

      product_name,

      sku,
      size_name,
      color_name,

      image_url,

      unit_price,
      quantity,
      line_total
    )
    VALUES
    (
      v_order_id,

      v_item.product_id,
      v_item.variant_id,

      v_item.product_name,

      v_item.sku,
      v_item.size_name,
      v_item.color_name,

      v_item.image_url,

      v_unit_price,
      v_item.quantity,

      ROUND(
        v_unit_price *
        v_item.quantity,
        2
      )
    );


    IF v_item.track_inventory = TRUE THEN

      UPDATE public.product_variants

      SET stock_quantity =
        stock_quantity -
        v_item.quantity

      WHERE id = v_item.variant_id;

    END IF;

  END LOOP;


  -- ----------------------------------------------------------
  -- PAYMENT RECORD
  -- ----------------------------------------------------------

  INSERT INTO public.payments
  (
    order_id,
    method,
    status,
    amount,
    currency
  )
  VALUES
  (
    v_order_id,
    p_payment_method,
    'pending',
    v_total,
    'JOD'
  );


  -- ----------------------------------------------------------
  -- COUPON USAGE
  -- ----------------------------------------------------------

  IF p_coupon_code IS NOT NULL
     AND TRIM(p_coupon_code) <> ''
  THEN

    INSERT INTO public.coupon_usages
    (
      coupon_id,
      user_id,
      order_id,
      discount_amount
    )
    VALUES
    (
      v_coupon.id,
      v_user_id,
      v_order_id,
      v_discount
    );


    UPDATE public.coupons

    SET used_count =
      used_count + 1

    WHERE id = v_coupon.id;

  END IF;


  -- ----------------------------------------------------------
  -- CLEAR CART
  -- ----------------------------------------------------------

  DELETE FROM public.cart_items
  WHERE cart_id = v_cart_id;


  RETURN v_order_id;

END;
$$;


ALTER FUNCTION "public"."checkout_cart"("p_shipping_address_id" "uuid", "p_billing_address_id" "uuid", "p_payment_method" "public"."payment_method", "p_coupon_code" "text", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
declare
  claims jsonb;
  jwt_role text;
  admin_allowed boolean;
begin
  claims := auth.jwt();
  jwt_role := coalesce(
    claims ->> 'user_role',
    claims -> 'app_metadata' ->> 'role',
    claims -> 'user_metadata' ->> 'role'
  );

  if jwt_role in ('admin', 'super_admin') then
    return true;
  end if;

  if to_regclass('public.profiles') is null then
    return false;
  end if;

  execute $sql$
    select exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('admin', 'super_admin')
        and coalesce(is_blocked, false) = false
    )
  $sql$
  into admin_allowed;

  return coalesce(admin_allowed, false);
end;
$_$;


ALTER FUNCTION "public"."current_user_is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN

  IF NEW.order_number IS NULL
     OR NEW.order_number = ''
  THEN

    NEW.order_number :=
      'ORD-' ||
      TO_CHAR(CURRENT_DATE, 'YYYYMMDD') ||
      '-' ||
      LPAD(
        NEXTVAL('public.order_number_seq')::TEXT,
        8,
        '0'
      );

  END IF;

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_variant_effective_price"("p_variant_id" "uuid") RETURNS numeric
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

WITH base_product AS (

  SELECT
    v.id AS variant_id,
    v.product_id,

    COALESCE(
      v.price,
      p.base_price
    )::NUMERIC(12,2) AS normal_price

  FROM public.product_variants v

  JOIN public.products p
    ON p.id = v.product_id

  WHERE v.id = p_variant_id

),

sale_prices AS (

  SELECT

    CASE

      WHEN fsp.sale_price IS NOT NULL THEN
        fsp.sale_price

      WHEN fs.discount_type = 'percentage' THEN

        ROUND(
          bp.normal_price *
          (
            1 -
            (
              LEAST(fs.discount_value, 100) / 100
            )
          ),
          2
        )

      WHEN fs.discount_type = 'fixed' THEN

        GREATEST(
          0,
          bp.normal_price - fs.discount_value
        )

      ELSE
        bp.normal_price

    END AS sale_price

  FROM base_product bp

  JOIN public.flash_sale_products fsp
    ON fsp.product_id = bp.product_id

  JOIN public.flash_sales fs
    ON fs.id = fsp.flash_sale_id

  WHERE fs.is_active = TRUE
    AND NOW() >= fs.starts_at
    AND NOW() <= fs.ends_at

)

SELECT

  ROUND(
    LEAST(
      bp.normal_price,
      COALESCE(
        (
          SELECT MIN(sp.sale_price)
          FROM sale_prices sp
        ),
        bp.normal_price
      )
    ),
    2
  )

FROM base_product bp;

$$;


ALTER FUNCTION "public"."get_variant_effective_price"("p_variant_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN

  INSERT INTO public.profiles
  (
    id,
    full_name,
    phone
  )
  VALUES
  (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(
      NULLIF(NEW.phone, ''),
      NEW.raw_user_meta_data->>'phone'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$

  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_blocked = FALSE
  );

$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_profile_admin_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN

  IF auth.uid() IS NOT NULL
     AND NOT public.is_admin()
  THEN

    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_blocked IS DISTINCT FROM OLD.is_blocked
    THEN

      RAISE EXCEPTION
        'Only administrators can modify role or blocked status';

    END IF;

  END IF;

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."protect_profile_admin_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_review_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN

  IF auth.uid() IS NOT NULL
     AND NOT public.is_admin()
  THEN

    IF TG_OP = 'INSERT' THEN
      NEW.is_approved := FALSE;

    ELSIF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
      NEW.is_approved := OLD.is_approved;

    END IF;

  END IF;

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."protect_review_approval"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."record_order_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN

  IF NEW.status IS DISTINCT FROM OLD.status THEN

    INSERT INTO public.order_status_history
    (
      order_id,
      status,
      changed_by
    )
    VALUES
    (
      NEW.id,
      NEW.status,
      auth.uid()
    );

    IF NEW.status = 'cancelled'
       AND OLD.status <> 'cancelled'
    THEN
      NEW.cancelled_at = NOW();
    END IF;

    IF NEW.status = 'delivered'
       AND OLD.status <> 'delivered'
    THEN
      NEW.delivered_at = NOW();
    END IF;

  END IF;

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."record_order_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_coupon_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_coupon_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_delivery_zones_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_delivery_zones_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_navigation_item_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_navigation_item_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "label" "text",
    "full_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "country" "text" DEFAULT 'Jordan'::"text" NOT NULL,
    "city" "text" NOT NULL,
    "area" "text",
    "street" "text",
    "building" "text",
    "floor" "text",
    "apartment" "text",
    "postal_code" "text",
    "latitude" double precision,
    "longitude" double precision,
    "notes" "text",
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name_ar" "text",
    "slug_ar" "text",
    "description_ar" "text"
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cart_id" "uuid" NOT NULL,
    "variant_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."carts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_id" "uuid",
    "name" "text" NOT NULL,
    "name_ar" "text",
    "slug" "text" NOT NULL,
    "description" "text",
    "description_ar" "text",
    "image_url" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug_ar" "text"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."colors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "hex_code" character varying(9),
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name_ar" "text"
);


ALTER TABLE "public"."colors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupon_usages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "coupon_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "order_id" "uuid" NOT NULL,
    "discount_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."coupon_usages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "discount_type" "public"."discount_type" NOT NULL,
    "discount_value" numeric(12,2) NOT NULL,
    "minimum_order_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "maximum_discount" numeric(12,2),
    "max_uses" integer,
    "max_uses_per_user" integer DEFAULT 1,
    "used_count" integer DEFAULT 0 NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "min_subtotal" numeric(10,2),
    CONSTRAINT "coupons_check" CHECK ((("ends_at" IS NULL) OR ("starts_at" IS NULL) OR ("ends_at" > "starts_at"))),
    CONSTRAINT "coupons_date_range_check" CHECK ((("ends_at" IS NULL) OR ("starts_at" IS NULL) OR ("ends_at" >= "starts_at"))),
    CONSTRAINT "coupons_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"public"."discount_type", 'fixed'::"public"."discount_type"]))),
    CONSTRAINT "coupons_discount_value_check" CHECK (("discount_value" >= (0)::numeric))
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."delivery_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country" "text" NOT NULL,
    "country_ar" "text",
    "city" "text",
    "city_ar" "text",
    "fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "delivery_zones_fee_non_negative" CHECK (("fee" >= (0)::numeric))
);


ALTER TABLE "public"."delivery_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enum_labels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "enum_key" "text" NOT NULL,
    "enum_value" "text" NOT NULL,
    "label_en" "text" NOT NULL,
    "label_ar" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."enum_labels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flash_sale_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "flash_sale_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "sale_price" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "flash_sale_products_sale_price_check" CHECK ((("sale_price" IS NULL) OR ("sale_price" >= (0)::numeric)))
);


ALTER TABLE "public"."flash_sale_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flash_sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "title_ar" "text",
    "description" "text",
    "description_ar" "text",
    "discount_type" "public"."discount_type" NOT NULL,
    "discount_value" numeric(12,2) DEFAULT 0 NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "show_as_modal" boolean DEFAULT false NOT NULL,
    "modal_title" "text",
    "modal_title_ar" "text",
    "modal_description" "text",
    "modal_description_ar" "text",
    "modal_image_url" "text",
    "button_text" "text",
    "button_text_ar" "text",
    "button_url" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    CONSTRAINT "flash_sales_check" CHECK (("ends_at" > "starts_at")),
    CONSTRAINT "flash_sales_date_range_check" CHECK (("ends_at" >= "starts_at")),
    CONSTRAINT "flash_sales_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"public"."discount_type", 'fixed'::"public"."discount_type"]))),
    CONSTRAINT "flash_sales_discount_value_check" CHECK (("discount_value" >= (0)::numeric))
);


ALTER TABLE "public"."flash_sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hero_slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "eyebrow" "text",
    "eyebrow_ar" "text",
    "title" "text" NOT NULL,
    "title_ar" "text",
    "description" "text",
    "description_ar" "text",
    "button_text" "text",
    "button_text_ar" "text",
    "button_url" "text",
    "image_en_url" "text",
    "image_ar_url" "text",
    "display_seconds" integer DEFAULT 6 NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "hero_slides_display_seconds_check" CHECK (("display_seconds" >= 2))
);


ALTER TABLE "public"."hero_slides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."navigation_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_id" "uuid",
    "label" "text" NOT NULL,
    "label_ar" "text",
    "path" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."navigation_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "source" "text",
    "locale" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "variant_id" "uuid",
    "product_name" "text" NOT NULL,
    "sku" "text",
    "size_name" "text",
    "color_name" "text",
    "image_url" "text",
    "unit_price" numeric(12,2) NOT NULL,
    "quantity" integer NOT NULL,
    "line_total" numeric(12,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_number_seq"
    START WITH 100001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "status" "public"."order_status" NOT NULL,
    "changed_by" "uuid",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "user_id" "uuid",
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "payment_method" "public"."payment_method" DEFAULT 'cash_on_delivery'::"public"."payment_method" NOT NULL,
    "customer_name" "text",
    "customer_email" "text",
    "customer_phone" "text",
    "shipping_address" "jsonb" NOT NULL,
    "billing_address" "jsonb",
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "discount_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "shipping_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "tax_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "total_amount" numeric(12,2) DEFAULT 0 NOT NULL,
    "currency" character(3) DEFAULT 'JOD'::"bpchar" NOT NULL,
    "coupon_id" "uuid",
    "coupon_code" "text",
    "notes" "text",
    "admin_notes" "text",
    "tracking_number" "text",
    "shipping_carrier" "text",
    "cancelled_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "provider" "text",
    "provider_transaction_id" "text",
    "method" "public"."payment_method" NOT NULL,
    "status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "currency" character(3) DEFAULT 'JOD'::"bpchar" NOT NULL,
    "response" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "alt_text" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_option_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "name_ar" "text",
    "description" "text",
    "description_ar" "text",
    "selection_type" "text" DEFAULT 'checkbox'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_option_groups_selection_type_check" CHECK (("selection_type" = ANY (ARRAY['radio'::"text", 'checkbox'::"text"])))
);


ALTER TABLE "public"."product_option_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_option_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "name_ar" "text",
    "image_url" "text",
    "price_delta" numeric(12,2) DEFAULT 0 NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "track_inventory" boolean DEFAULT false NOT NULL,
    "allow_backorder" boolean DEFAULT true NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_option_items_price_delta_check" CHECK (("price_delta" >= (0)::numeric)),
    CONSTRAINT "product_option_items_stock_quantity_check" CHECK (("stock_quantity" >= 0))
);


ALTER TABLE "public"."product_option_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_option_group_links" (
    "product_id" "uuid" NOT NULL,
    "option_group_id" "uuid" NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "min_selections" integer,
    "max_selections" integer,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_option_group_links_min_check" CHECK ((("min_selections" IS NULL) OR ("min_selections" >= 0))),
    CONSTRAINT "product_option_group_links_max_check" CHECK ((("max_selections" IS NULL) OR ("max_selections" >= 1))),
    CONSTRAINT "product_option_group_links_range_check" CHECK ((("min_selections" IS NULL) OR ("max_selections" IS NULL) OR ("min_selections" <= "max_selections")))
);


ALTER TABLE "public"."product_option_group_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "size_id" "uuid",
    "color_id" "uuid",
    "sku" "text" NOT NULL,
    "barcode" "text",
    "price" numeric(12,2),
    "compare_at_price" numeric(12,2),
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "low_stock_threshold" integer DEFAULT 5 NOT NULL,
    "track_inventory" boolean DEFAULT true NOT NULL,
    "allow_backorder" boolean DEFAULT false NOT NULL,
    "weight_grams" integer,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "product_variants_compare_at_price_check" CHECK ((("compare_at_price" IS NULL) OR ("compare_at_price" >= (0)::numeric))),
    CONSTRAINT "product_variants_price_check" CHECK ((("price" IS NULL) OR ("price" >= (0)::numeric)))
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "brand_id" "uuid",
    "name" "text" NOT NULL,
    "name_ar" "text",
    "slug" "text" NOT NULL,
    "short_description" "text",
    "short_description_ar" "text",
    "description" "text",
    "description_ar" "text",
    "base_price" numeric(12,2) NOT NULL,
    "compare_at_price" numeric(12,2),
    "currency" character(3) DEFAULT 'JOD'::"bpchar" NOT NULL,
    "status" "public"."product_status" DEFAULT 'draft'::"public"."product_status" NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "seo_title" "text",
    "seo_description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug_ar" "text",
    CONSTRAINT "products_base_price_check" CHECK (("base_price" >= (0)::numeric)),
    CONSTRAINT "products_compare_at_price_check" CHECK ((("compare_at_price" IS NULL) OR ("compare_at_price" >= (0)::numeric)))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "avatar_url" "text",
    "role" "public"."user_role" DEFAULT 'customer'::"public"."user_role" NOT NULL,
    "is_blocked" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "title" "text",
    "comment" "text",
    "is_approved" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sizes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name_ar" "text"
);


ALTER TABLE "public"."sizes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "is_public" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."store_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_variant_id_key" UNIQUE ("cart_id", "variant_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."colors"
    ADD CONSTRAINT "colors_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."colors"
    ADD CONSTRAINT "colors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupon_usages"
    ADD CONSTRAINT "coupon_usages_coupon_id_order_id_key" UNIQUE ("coupon_id", "order_id");



ALTER TABLE ONLY "public"."coupon_usages"
    ADD CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."delivery_zones"
    ADD CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enum_labels"
    ADD CONSTRAINT "enum_labels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enum_labels"
    ADD CONSTRAINT "enum_labels_unique" UNIQUE ("enum_key", "enum_value");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."flash_sale_products"
    ADD CONSTRAINT "flash_sale_products_flash_sale_id_product_id_key" UNIQUE ("flash_sale_id", "product_id");



ALTER TABLE ONLY "public"."flash_sale_products"
    ADD CONSTRAINT "flash_sale_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flash_sales"
    ADD CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hero_slides"
    ADD CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."navigation_items"
    ADD CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscribers"
    ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_option_group_links"
    ADD CONSTRAINT "product_option_group_links_pkey" PRIMARY KEY ("product_id", "option_group_id");



ALTER TABLE ONLY "public"."product_option_groups"
    ADD CONSTRAINT "product_option_groups_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."product_option_groups"
    ADD CONSTRAINT "product_option_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_option_items"
    ADD CONSTRAINT "product_option_items_group_code_key" UNIQUE ("group_id", "code");



ALTER TABLE ONLY "public"."product_option_items"
    ADD CONSTRAINT "product_option_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_product_id_user_id_key" UNIQUE ("product_id", "user_id");



ALTER TABLE ONLY "public"."sizes"
    ADD CONSTRAINT "sizes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."sizes"
    ADD CONSTRAINT "sizes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_settings"
    ADD CONSTRAINT "store_settings_pkey" PRIMARY KEY ("key");



CREATE INDEX "brands_slug_ar_idx" ON "public"."brands" USING "btree" ("slug_ar");



CREATE INDEX "cart_items_cart_idx" ON "public"."cart_items" USING "btree" ("cart_id");



CREATE INDEX "categories_slug_ar_idx" ON "public"."categories" USING "btree" ("slug_ar");



CREATE UNIQUE INDEX "coupons_code_upper_idx" ON "public"."coupons" USING "btree" ("upper"("code"));



CREATE INDEX "coupons_is_active_idx" ON "public"."coupons" USING "btree" ("is_active", "starts_at", "ends_at");



CREATE INDEX "delivery_zones_active_sort_idx" ON "public"."delivery_zones" USING "btree" ("is_active", "sort_order", "country", "city");



CREATE UNIQUE INDEX "delivery_zones_country_city_unique_idx" ON "public"."delivery_zones" USING "btree" ("lower"("country"), "lower"(COALESCE("city", ''::"text")));



CREATE INDEX "enum_labels_enum_key_idx" ON "public"."enum_labels" USING "btree" ("enum_key");



CREATE INDEX "favorites_product_idx" ON "public"."favorites" USING "btree" ("product_id");



CREATE INDEX "favorites_user_idx" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "flash_sale_products_product_idx" ON "public"."flash_sale_products" USING "btree" ("product_id");



CREATE INDEX "flash_sales_active_window_idx" ON "public"."flash_sales" USING "btree" ("is_active", "starts_at", "ends_at", "sort_order");



CREATE INDEX "flash_sales_dates_idx" ON "public"."flash_sales" USING "btree" ("starts_at", "ends_at");



CREATE INDEX "hero_slides_sort_order_idx" ON "public"."hero_slides" USING "btree" ("sort_order", "created_at");



CREATE INDEX "navigation_items_parent_sort_idx" ON "public"."navigation_items" USING "btree" ("parent_id", "sort_order", "created_at");



CREATE UNIQUE INDEX "newsletter_subscribers_email_lower_idx" ON "public"."newsletter_subscribers" USING "btree" ("lower"("email"));



CREATE UNIQUE INDEX "one_primary_image_per_product" ON "public"."product_images" USING "btree" ("product_id") WHERE ("is_primary" = true);



CREATE INDEX "order_items_order_idx" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "order_status_history_order_idx" ON "public"."order_status_history" USING "btree" ("order_id");



CREATE INDEX "orders_created_at_idx" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "orders_status_idx" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "orders_user_idx" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "product_images_product_sort_idx" ON "public"."product_images" USING "btree" ("product_id", "sort_order");



CREATE INDEX "product_option_group_links_product_idx" ON "public"."product_option_group_links" USING "btree" ("product_id");



CREATE INDEX "product_option_items_group_idx" ON "public"."product_option_items" USING "btree" ("group_id");



CREATE UNIQUE INDEX "product_images_product_sort_unique" ON "public"."product_images" USING "btree" ("product_id", "sort_order");



CREATE INDEX "products_brand_idx" ON "public"."products" USING "btree" ("brand_id");



CREATE INDEX "products_category_idx" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "products_featured_idx" ON "public"."products" USING "btree" ("is_featured");



CREATE INDEX "products_slug_ar_idx" ON "public"."products" USING "btree" ("slug_ar");



CREATE INDEX "products_status_idx" ON "public"."products" USING "btree" ("status");



CREATE INDEX "reviews_product_idx" ON "public"."reviews" USING "btree" ("product_id");



CREATE UNIQUE INDEX "unique_product_variant_options" ON "public"."product_variants" USING "btree" ("product_id", COALESCE("size_id", '00000000-0000-0000-0000-000000000001'::"uuid"), COALESCE("color_id", '00000000-0000-0000-0000-000000000002'::"uuid"));



CREATE INDEX "variants_color_idx" ON "public"."product_variants" USING "btree" ("color_id");



CREATE INDEX "variants_product_idx" ON "public"."product_variants" USING "btree" ("product_id");



CREATE INDEX "variants_size_idx" ON "public"."product_variants" USING "btree" ("size_id");



CREATE OR REPLACE TRIGGER "addresses_updated_at" BEFORE UPDATE ON "public"."addresses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "brands_updated_at" BEFORE UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "cart_items_updated_at" BEFORE UPDATE ON "public"."cart_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "carts_updated_at" BEFORE UPDATE ON "public"."carts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "categories_updated_at" BEFORE UPDATE ON "public"."categories" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "coupons_updated_at" BEFORE UPDATE ON "public"."coupons" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "delivery_zones_set_updated_at" BEFORE UPDATE ON "public"."delivery_zones" FOR EACH ROW EXECUTE FUNCTION "public"."set_delivery_zones_updated_at"();



CREATE OR REPLACE TRIGGER "flash_sales_updated_at" BEFORE UPDATE ON "public"."flash_sales" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "generate_order_number_trigger" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."generate_order_number"();



CREATE OR REPLACE TRIGGER "order_status_change_trigger" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."record_order_status_change"();



CREATE OR REPLACE TRIGGER "orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "product_option_groups_updated_at" BEFORE UPDATE ON "public"."product_option_groups" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "product_option_items_updated_at" BEFORE UPDATE ON "public"."product_option_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



CREATE OR REPLACE TRIGGER "protect_profile_admin_fields_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."protect_profile_admin_fields"();



CREATE OR REPLACE TRIGGER "protect_review_approval_trigger" BEFORE INSERT OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."protect_review_approval"();



CREATE OR REPLACE TRIGGER "reviews_updated_at" BEFORE UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_coupon_updated_at" BEFORE UPDATE ON "public"."coupons" FOR EACH ROW EXECUTE FUNCTION "public"."set_coupon_updated_at"();



CREATE OR REPLACE TRIGGER "set_navigation_item_updated_at" BEFORE UPDATE ON "public"."navigation_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_navigation_item_updated_at"();



CREATE OR REPLACE TRIGGER "variants_updated_at" BEFORE UPDATE ON "public"."product_variants" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."coupon_usages"
    ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coupon_usages"
    ADD CONSTRAINT "coupon_usages_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."coupon_usages"
    ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flash_sale_products"
    ADD CONSTRAINT "flash_sale_products_flash_sale_id_fkey" FOREIGN KEY ("flash_sale_id") REFERENCES "public"."flash_sales"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flash_sale_products"
    ADD CONSTRAINT "flash_sale_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."navigation_items"
    ADD CONSTRAINT "navigation_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_option_group_links"
    ADD CONSTRAINT "product_option_group_links_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "public"."product_option_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_option_group_links"
    ADD CONSTRAINT "product_option_group_links_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_option_items"
    ADD CONSTRAINT "product_option_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."product_option_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."sizes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "address_delete" ON "public"."addresses" FOR DELETE USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "address_insert" ON "public"."addresses" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "address_select" ON "public"."addresses" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "address_update" ON "public"."addresses" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admins_can_delete_coupons" ON "public"."coupons" FOR DELETE TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_delete_hero_slides" ON "public"."hero_slides" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND (COALESCE("profiles"."is_blocked", false) = false)))));



CREATE POLICY "admins_can_delete_navigation_items" ON "public"."navigation_items" FOR DELETE TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_insert_coupons" ON "public"."coupons" FOR INSERT TO "authenticated" WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_insert_hero_slides" ON "public"."hero_slides" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND (COALESCE("profiles"."is_blocked", false) = false)))));



CREATE POLICY "admins_can_insert_navigation_items" ON "public"."navigation_items" FOR INSERT TO "authenticated" WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_read_all_coupons" ON "public"."coupons" FOR SELECT TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_read_all_hero_slides" ON "public"."hero_slides" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND (COALESCE("profiles"."is_blocked", false) = false)))));



CREATE POLICY "admins_can_read_all_navigation_items" ON "public"."navigation_items" FOR SELECT TO "authenticated" USING ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_update_coupons" ON "public"."coupons" FOR UPDATE TO "authenticated" USING ("public"."current_user_is_admin"()) WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "admins_can_update_hero_slides" ON "public"."hero_slides" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND (COALESCE("profiles"."is_blocked", false) = false))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'super_admin'::"public"."user_role"])) AND (COALESCE("profiles"."is_blocked", false) = false)))));



CREATE POLICY "admins_can_update_navigation_items" ON "public"."navigation_items" FOR UPDATE TO "authenticated" USING ("public"."current_user_is_admin"()) WITH CHECK ("public"."current_user_is_admin"());



ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "brands_admin" ON "public"."brands" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "brands_read" ON "public"."brands" FOR SELECT USING ((("is_active" = true) OR "public"."is_admin"()));



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cart_items_delete" ON "public"."cart_items" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."carts" "c"
  WHERE (("c"."id" = "cart_items"."cart_id") AND ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "cart_items_insert" ON "public"."cart_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."carts" "c"
  WHERE (("c"."id" = "cart_items"."cart_id") AND ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "cart_items_select" ON "public"."cart_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."carts" "c"
  WHERE (("c"."id" = "cart_items"."cart_id") AND (("c"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



CREATE POLICY "cart_items_update" ON "public"."cart_items" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."carts" "c"
  WHERE (("c"."id" = "cart_items"."cart_id") AND ("c"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."carts" "c"
  WHERE (("c"."id" = "cart_items"."cart_id") AND ("c"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "carts_delete" ON "public"."carts" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "carts_insert" ON "public"."carts" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "carts_select" ON "public"."carts" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "carts_update" ON "public"."carts" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "categories_admin" ON "public"."categories" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "categories_read" ON "public"."categories" FOR SELECT USING ((("is_active" = true) OR "public"."is_admin"()));



ALTER TABLE "public"."colors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "colors_admin" ON "public"."colors" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "colors_read" ON "public"."colors" FOR SELECT USING ((("is_active" = true) OR "public"."is_admin"()));



ALTER TABLE "public"."coupon_usages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "coupon_usages_admin" ON "public"."coupon_usages" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "coupon_usages_select" ON "public"."coupon_usages" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "coupons_admin" ON "public"."coupons" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "customers_can_insert_own_order_items" ON "public"."order_items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "customers_can_insert_own_orders" ON "public"."orders" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "customers_can_view_own_order_items" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "customers_can_view_own_orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."delivery_zones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delivery_zones_admin_manage" ON "public"."delivery_zones" USING ("public"."current_user_is_admin"()) WITH CHECK ("public"."current_user_is_admin"());



CREATE POLICY "delivery_zones_public_read_active" ON "public"."delivery_zones" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."enum_labels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "favorites_delete" ON "public"."favorites" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "favorites_insert" ON "public"."favorites" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "favorites_select" ON "public"."favorites" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."flash_sale_products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "flash_sale_products_admin" ON "public"."flash_sale_products" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "flash_sale_products_read" ON "public"."flash_sale_products" FOR SELECT USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."flash_sales" "fs"
  WHERE (("fs"."id" = "flash_sale_products"."flash_sale_id") AND ("fs"."is_active" = true) AND ("now"() >= "fs"."starts_at") AND ("now"() <= "fs"."ends_at"))))));



ALTER TABLE "public"."flash_sales" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "flash_sales_admin" ON "public"."flash_sales" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "flash_sales_read" ON "public"."flash_sales" FOR SELECT USING (("public"."is_admin"() OR (("is_active" = true) AND ("now"() >= "starts_at") AND ("now"() <= "ends_at"))));



ALTER TABLE "public"."hero_slides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."navigation_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_items_select" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND (("o"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_status_history_admin" ON "public"."order_status_history" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "order_status_history_select" ON "public"."order_status_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_status_history"."order_id") AND (("o"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."product_option_group_links" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_option_group_links_admin" ON "public"."product_option_group_links" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


CREATE POLICY "product_option_group_links_read" ON "public"."product_option_group_links" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_option_group_links"."product_id") AND ("p"."status" = 'active'::"public"."product_status")))) OR "public"."is_admin"());



ALTER TABLE "public"."product_option_groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_option_groups_admin" ON "public"."product_option_groups" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


CREATE POLICY "product_option_groups_read" ON "public"."product_option_groups" FOR SELECT USING ((("is_active" = true) OR "public"."is_admin"()));



ALTER TABLE "public"."product_option_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_option_items_admin" ON "public"."product_option_items" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


CREATE POLICY "product_option_items_read" ON "public"."product_option_items" FOR SELECT USING (((("is_active" = true) AND (EXISTS ( SELECT 1
   FROM "public"."product_option_groups" "g"
  WHERE (("g"."id" = "product_option_items"."group_id") AND ("g"."is_active" = true))))) OR "public"."is_admin"()));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders_admin_update" ON "public"."orders" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "orders_select" ON "public"."orders" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_admin" ON "public"."payments" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "payments_select" ON "public"."payments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "payments"."order_id") AND (("o"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_images_admin" ON "public"."product_images" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "product_images_read" ON "public"."product_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_images"."product_id") AND (("p"."status" = 'active'::"public"."product_status") OR "public"."is_admin"())))));



ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_variants_admin" ON "public"."product_variants" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "product_variants_read" ON "public"."product_variants" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."products" "p"
  WHERE (("p"."id" = "product_variants"."product_id") AND ((("p"."status" = 'active'::"public"."product_status") AND ("product_variants"."is_active" = true)) OR "public"."is_admin"())))));



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "products_admin" ON "public"."products" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "products_read" ON "public"."products" FOR SELECT USING ((("status" = 'active'::"public"."product_status") OR "public"."is_admin"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));


CREATE POLICY "profiles_insert_self" ON "public"."profiles" FOR INSERT TO authenticated WITH CHECK ((("id" = "auth"."uid"()) AND ("role" = 'customer'::public.user_role) AND (COALESCE("is_blocked", false) = false)));



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "public_can_insert_newsletter_subscribers" ON "public"."newsletter_subscribers" FOR INSERT TO "authenticated", "anon" WITH CHECK ((("email" IS NOT NULL) AND ("length"(TRIM(BOTH FROM "email")) > 3)));



CREATE POLICY "public_can_read_active_coupons" ON "public"."coupons" FOR SELECT TO "authenticated", "anon" USING ((("is_active" = true) AND (("starts_at" IS NULL) OR ("starts_at" <= "now"())) AND (("ends_at" IS NULL) OR ("ends_at" >= "now"()))));



CREATE POLICY "public_can_read_active_hero_slides" ON "public"."hero_slides" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "public_can_read_active_navigation_items" ON "public"."navigation_items" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_delete" ON "public"."reviews" FOR DELETE USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "reviews_insert" ON "public"."reviews" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "reviews_select" ON "public"."reviews" FOR SELECT USING ((("is_approved" = true) OR ("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "reviews_update" ON "public"."reviews" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."sizes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sizes_admin" ON "public"."sizes" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "sizes_read" ON "public"."sizes" FOR SELECT USING ((("is_active" = true) OR "public"."is_admin"()));



ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "store_settings_admin" ON "public"."store_settings" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "store_settings_read" ON "public"."store_settings" FOR SELECT USING ((("is_public" = true) OR "public"."is_admin"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."checkout_cart"("p_shipping_address_id" "uuid", "p_billing_address_id" "uuid", "p_payment_method" "public"."payment_method", "p_coupon_code" "text", "p_notes" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."checkout_cart"("p_shipping_address_id" "uuid", "p_billing_address_id" "uuid", "p_payment_method" "public"."payment_method", "p_coupon_code" "text", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."checkout_cart"("p_shipping_address_id" "uuid", "p_billing_address_id" "uuid", "p_payment_method" "public"."payment_method", "p_coupon_code" "text", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."checkout_cart"("p_shipping_address_id" "uuid", "p_billing_address_id" "uuid", "p_payment_method" "public"."payment_method", "p_coupon_code" "text", "p_notes" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."current_user_is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_variant_effective_price"("p_variant_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_variant_effective_price"("p_variant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_variant_effective_price"("p_variant_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_profile_admin_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_profile_admin_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_profile_admin_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_review_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_review_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_review_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."record_order_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."record_order_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."record_order_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_coupon_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_coupon_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_coupon_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_delivery_zones_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_delivery_zones_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_delivery_zones_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_navigation_item_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_navigation_item_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_navigation_item_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."carts" TO "anon";
GRANT ALL ON TABLE "public"."carts" TO "authenticated";
GRANT ALL ON TABLE "public"."carts" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."colors" TO "anon";
GRANT ALL ON TABLE "public"."colors" TO "authenticated";
GRANT ALL ON TABLE "public"."colors" TO "service_role";



GRANT ALL ON TABLE "public"."coupon_usages" TO "anon";
GRANT ALL ON TABLE "public"."coupon_usages" TO "authenticated";
GRANT ALL ON TABLE "public"."coupon_usages" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_zones" TO "anon";
GRANT ALL ON TABLE "public"."delivery_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_zones" TO "service_role";



GRANT ALL ON TABLE "public"."enum_labels" TO "anon";
GRANT ALL ON TABLE "public"."enum_labels" TO "authenticated";
GRANT ALL ON TABLE "public"."enum_labels" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."flash_sale_products" TO "anon";
GRANT ALL ON TABLE "public"."flash_sale_products" TO "authenticated";
GRANT ALL ON TABLE "public"."flash_sale_products" TO "service_role";



GRANT ALL ON TABLE "public"."flash_sales" TO "anon";
GRANT ALL ON TABLE "public"."flash_sales" TO "authenticated";
GRANT ALL ON TABLE "public"."flash_sales" TO "service_role";



GRANT ALL ON TABLE "public"."hero_slides" TO "anon";
GRANT ALL ON TABLE "public"."hero_slides" TO "authenticated";
GRANT ALL ON TABLE "public"."hero_slides" TO "service_role";



GRANT ALL ON TABLE "public"."navigation_items" TO "anon";
GRANT ALL ON TABLE "public"."navigation_items" TO "authenticated";
GRANT ALL ON TABLE "public"."navigation_items" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscribers" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."order_status_history" TO "anon";
GRANT ALL ON TABLE "public"."order_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."product_option_group_links" TO "anon";
GRANT ALL ON TABLE "public"."product_option_group_links" TO "authenticated";
GRANT ALL ON TABLE "public"."product_option_group_links" TO "service_role";



GRANT ALL ON TABLE "public"."product_option_groups" TO "anon";
GRANT ALL ON TABLE "public"."product_option_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."product_option_groups" TO "service_role";



GRANT ALL ON TABLE "public"."product_option_items" TO "anon";
GRANT ALL ON TABLE "public"."product_option_items" TO "authenticated";
GRANT ALL ON TABLE "public"."product_option_items" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."sizes" TO "anon";
GRANT ALL ON TABLE "public"."sizes" TO "authenticated";
GRANT ALL ON TABLE "public"."sizes" TO "service_role";



GRANT ALL ON TABLE "public"."store_settings" TO "anon";
GRANT ALL ON TABLE "public"."store_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."store_settings" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
