-- =====================================================================
-- WatchSnap — Supabase schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────
-- 1. USERS table
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id              uuid UNIQUE,                          -- maps to auth.users.id (if using Supabase Auth)
  email                text UNIQUE NOT NULL,
  subscription_status  text NOT NULL DEFAULT 'free'
                        CHECK (subscription_status IN ('free','trial','active','cancelled','past_due')),
  subscription_plan    text                                   -- 'monthly' | 'annual' | null
                        CHECK (subscription_plan IN ('monthly','annual') OR subscription_plan IS NULL),
  paddle_customer_id   text UNIQUE,
  paddle_subscription_id text UNIQUE,
  trial_ends_at        timestamptz,
  current_period_end   timestamptz,
  scan_count           integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx           ON public.users(email);
CREATE INDEX IF NOT EXISTS users_paddle_customer_idx ON public.users(paddle_customer_id);

-- ─────────────────────────────────────────────────────────────────────
-- 2. SCANS table
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scans (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES public.users(id) ON DELETE CASCADE,
  image_url    text,
  result_json  jsonb NOT NULL,
  brand        text,
  model        text,
  confidence   integer,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scans_user_id_idx     ON public.scans(user_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx  ON public.scans(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 3. COLLECTION table
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collection (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scan_id           uuid REFERENCES public.scans(id) ON DELETE SET NULL,
  brand             text NOT NULL,
  model             text NOT NULL,
  reference_number  text,
  production_years  text,
  value_low         integer NOT NULL DEFAULT 0,
  value_high        integer NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'USD',
  authenticity      text NOT NULL DEFAULT 'indeterminate'
                     CHECK (authenticity IN ('likely_authentic','replica','indeterminate')),
  confidence        integer NOT NULL DEFAULT 0,
  thumbnail         text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS collection_user_id_idx     ON public.collection(user_id);
CREATE INDEX IF NOT EXISTS collection_created_at_idx  ON public.collection(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 4. Row Level Security (RLS) — each user sees only their own rows
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection ENABLE ROW LEVEL SECURITY;

-- USERS policies
DROP POLICY IF EXISTS "users_select_own"  ON public.users;
DROP POLICY IF EXISTS "users_update_own"  ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- SCANS policies
DROP POLICY IF EXISTS "scans_select_own" ON public.scans;
DROP POLICY IF EXISTS "scans_insert_own" ON public.scans;
DROP POLICY IF EXISTS "scans_delete_own" ON public.scans;
CREATE POLICY "scans_select_own" ON public.scans
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "scans_insert_own" ON public.scans
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "scans_delete_own" ON public.scans
  FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- COLLECTION policies
DROP POLICY IF EXISTS "collection_select_own" ON public.collection;
DROP POLICY IF EXISTS "collection_insert_own" ON public.collection;
DROP POLICY IF EXISTS "collection_delete_own" ON public.collection;
CREATE POLICY "collection_select_own" ON public.collection
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "collection_insert_own" ON public.collection
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
CREATE POLICY "collection_delete_own" ON public.collection
  FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────
-- 5. updated_at trigger for users
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
