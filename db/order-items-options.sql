-- Run this migration by itself in Supabase SQL Editor.
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '{}'::jsonb;

