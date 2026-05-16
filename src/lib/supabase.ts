import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ─────────────────────────────────────────────────────────────────
   Types — mirror the SQL schema in supabase/schema.sql
───────────────────────────────────────────────────────────────── */
export interface DbUser {
  id:                     string;
  email:                  string;
  subscription_status:    "free" | "trial" | "active" | "cancelled" | "past_due";
  subscription_plan:      "monthly" | "annual" | null;
  paddle_customer_id:     string | null;
  paddle_subscription_id: string | null;
  trial_ends_at:          string | null;
  current_period_end:     string | null;
  scan_count:             number;
  created_at:             string;
}

export interface DbScan {
  id:          string;
  user_id:     string;
  image_url:   string | null;
  result_json: Record<string, unknown>;
  brand:       string;
  model:       string;
  confidence:  number;
  created_at:  string;
}

export interface DbCollectionItem {
  id:               string;
  user_id:          string;
  scan_id:          string | null;
  brand:            string;
  model:            string;
  reference_number: string;
  production_years: string;
  value_low:        number;
  value_high:       number;
  currency:         string;
  authenticity:     "likely_authentic" | "replica" | "indeterminate";
  confidence:       number;
  thumbnail:        string;
  created_at:       string;
}

/* ─────────────────────────────────────────────────────────────────
   Scans
───────────────────────────────────────────────────────────────── */
export async function saveScan(userId: string, scan: {
  brand: string;
  model: string;
  confidence: number;
  result_json: Record<string, unknown>;
  image_url?: string;
}) {
  return supabase.from("scans").insert({ user_id: userId, ...scan });
}

export async function getUserScans(userId: string) {
  return supabase
    .from("scans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

/* ─────────────────────────────────────────────────────────────────
   Collection
───────────────────────────────────────────────────────────────── */
export async function saveCollectionItem(item: Omit<DbCollectionItem, "id" | "created_at">) {
  return supabase.from("collection").insert(item);
}

export async function getUserCollection(userId: string) {
  return supabase
    .from("collection")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function deleteCollectionItem(itemId: string, userId: string) {
  return supabase.from("collection").delete().eq("id", itemId).eq("user_id", userId);
}

/* ─────────────────────────────────────────────────────────────────
   User helpers
───────────────────────────────────────────────────────────────── */
export async function getUserByEmail(email: string) {
  return supabase.from("users").select("*").eq("email", email).maybeSingle();
}

export function isProStatus(status: DbUser["subscription_status"] | undefined | null) {
  return status === "active" || status === "trial";
}
