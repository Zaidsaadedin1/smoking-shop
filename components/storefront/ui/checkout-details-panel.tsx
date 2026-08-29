"use client";

import { Alert, Grid, Group, Paper, Radio, Stack, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import {
  StoreSelect,
  StoreTextarea,
  StoreTextInput,
} from "@/components/storefront/ui/store-form-controls";

export type CheckoutFormState = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  area: string;
  street: string;
  building: string;
  notes: string;
  paymentMethod: string;
};

type Option = {
  value: string;
  label: string;
};

export function CheckoutDetailsPanel({
  form,
  setForm,
  countryOptions,
  cityOptions,
  hasConfiguredDelivery,
  deliveryFee,
  t,
}: {
  form: CheckoutFormState;
  setForm: Dispatch<SetStateAction<CheckoutFormState>>;
  countryOptions: Option[];
  cityOptions: Option[];
  hasConfiguredDelivery: boolean;
  deliveryFee: string;
  t: (text: string) => string;
}) {
  return (
    <Stack gap="sm">
      {/* Delivery fields */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <StoreTextInput
            label={t("Full Name")}
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <StoreTextInput
            label={t("Phone")}
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <StoreSelect
            label={t("Country")}
            value={form.country}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                country: value ?? "",
                city: "",
              }))
            }
            data={countryOptions}
            placeholder={t("Select country")}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <StoreSelect
            label={t("City")}
            value={form.city}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                city: value ?? "",
              }))
            }
            data={cityOptions}
            placeholder={t("Select city")}
            disabled={!form.country || cityOptions.length === 0}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <StoreTextInput
            label={t("Area")}
            value={form.area}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                area: event.target.value,
              }))
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 5 }}>
          <StoreTextInput
            label={t("Street")}
            value={form.street}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                street: event.target.value,
              }))
            }
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 3 }}>
          <StoreTextInput
            label={t("Building")}
            value={form.building}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                building: event.target.value,
              }))
            }
          />
        </Grid.Col>
      </Grid>

      {/* Delivery availability */}
      {form.city && hasConfiguredDelivery ? (
        <Alert
          color="green"
          radius="sm"
          py={6}
          px="sm"
          styles={{
            body: {
              gap: 0,
            },
            message: {
              fontSize: 12,
            },
          }}
        >
          {t("Delivery available")} · {deliveryFee}
        </Alert>
      ) : null}

      {/* Payment + notes */}
      <Grid align="flex-start">
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Text size="xs" fw={600} mb={5}>
            {t("Payment Method")}
          </Text>

          <Paper
            component="button"
            type="button"
            withBorder
            radius="sm"
            px="sm"
            py={8}
            onClick={() =>
              setForm((current) => ({
                ...current,
                paymentMethod: "cash_on_delivery",
              }))
            }
            style={{
              width: "100%",
              textAlign: "start",
              cursor: "pointer",
              background:
                form.paymentMethod === "cash_on_delivery"
                  ? "var(--mantine-color-default-hover)"
                  : undefined,
            }}
          >
            <Group gap="xs" wrap="nowrap">
              <Radio
                size="xs"
                checked={form.paymentMethod === "cash_on_delivery"}
                readOnly
              />

              <Stack gap={0}>
                <Text size="xs" fw={600}>
                  {t("Cash on Delivery")}
                </Text>

                <Text size="xs" c="dimmed">
                  {t("Pay on arrival")}
                </Text>
              </Stack>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 7 }}>
          <StoreTextarea
            id="checkout-notes"
            label={t("Delivery instructions")}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            placeholder={t("Optional note")}
            minRows={1}
            autosize
            maxRows={2}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
