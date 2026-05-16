# WatchSnap — Setup Guide

## Quick Start

```bash
cd watchsnap
npm install
npm run dev
# → http://localhost:3000
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project Settings → API |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com → Developers → API Keys |

## Supabase Setup

Run this SQL in your Supabase SQL editor:

```sql
create table scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  brand text,
  model text,
  reference text,
  year text,
  value_low integer,
  value_high integer,
  authentication text check (authentication in ('likely_authentic','suspicious','cannot_determine')),
  confidence integer,
  image_url text,
  raw_result jsonb
);

-- Enable Row Level Security
alter table scans enable row level security;

create policy "Users see own scans"
  on scans for select using (auth.uid() = user_id);

create policy "Users insert own scans"
  on scans for insert with check (auth.uid() = user_id);

create policy "Users delete own scans"
  on scans for delete using (auth.uid() = user_id);
```

## Stripe Setup

1. Create two products in Stripe Dashboard:
   - **WatchSnap Pro Monthly** → $9.99/month recurring
   - **WatchSnap Pro Annual** → $59.99/year recurring
2. Copy the Price IDs and add to `.env.local`:
   ```
   STRIPE_PRICE_MONTHLY=price_xxx
   STRIPE_PRICE_ANNUAL=price_yyy
   ```

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/scan` | Upload photo + AI results |
| `/paywall` | Subscription page |
| `/history` | Past scans (premium) |
| `/api/identify` | POST — Claude vision AI endpoint |
| `/api/stripe/checkout` | POST — Create Stripe checkout session |

## Free Scan Logic

Scan count is stored in `localStorage` (key: `watchsnap_scan_count`).
After 3 scans, the paywall modal appears automatically.
Wire to Supabase for server-side enforcement in production.

## App Store Deployment

This is a Next.js web app. For iOS/Android:
- Use **Capacitor** (`npm install @capacitor/core @capacitor/cli`) to wrap as native
- Or deploy to Vercel and submit as a PWA via Progressier

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.
