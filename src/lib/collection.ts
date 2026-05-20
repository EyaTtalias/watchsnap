import { supabase } from "./supabase";

export interface CollectionItem {
  id: string;
  brand: string;
  model: string;
  reference_number: string;
  production_years: string;
  value_low: number;
  value_high: number;
  currency: string;
  authenticity: string;
  confidence: number;
  thumbnail: string; // base64 jpeg ~120×120
  savedAt: number;
}

const COLLECTION_KEY = "watchsnap_collection";
export const PRO_KEY = "watchsnap_pro";
export const SCAN_COUNT_KEY = "watchsnap_scans_used";   // unified key
export const FREE_SCAN_LIMIT = 3;

export function getScanCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(SCAN_COUNT_KEY) ?? "0", 10);
}

export function incrementScanCount(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCAN_COUNT_KEY, String(getScanCount() + 1));
}

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRO_KEY) === "1";
}

/* ── localStorage helpers (unchanged) ── */

export function getCollection(): CollectionItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveToCollection(item: CollectionItem): void {
  const existing = getCollection();
  const filtered = existing.filter(
    (e) => !(e.brand === item.brand && e.model === item.model && e.reference_number === item.reference_number)
  );
  localStorage.setItem(COLLECTION_KEY, JSON.stringify([item, ...filtered]));
}

export function removeFromCollection(id: string): void {
  const updated = getCollection().filter((e) => e.id !== id);
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
}

export async function compressToThumbnail(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const SIZE = 120;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL("image/jpeg", 0.5));
    };
    img.onerror = () => resolve("");
  });
}

/* ─────────────────────────────────────────────────────────────────
   Supabase sync helpers
   All functions are fire-and-forget — they silently fall back to
   localStorage on any error (RLS not configured, network failure, etc.)
───────────────────────────────────────────────────────────────── */

/** Map Supabase DB row → CollectionItem */
function dbRowToItem(row: Record<string, unknown>): CollectionItem {
  return {
    id:               String(row.id),
    brand:            String(row.brand ?? ""),
    model:            String(row.model ?? ""),
    reference_number: String(row.reference_number ?? ""),
    production_years: String(row.production_years ?? ""),
    value_low:        Number(row.value_low  ?? 0),
    value_high:       Number(row.value_high ?? 0),
    currency:         String(row.currency   ?? "USD"),
    authenticity:     String(row.authenticity ?? "indeterminate"),
    confidence:       Number(row.confidence ?? 0),
    thumbnail:        String(row.thumbnail  ?? ""),
    savedAt:          row.created_at
      ? new Date(String(row.created_at)).getTime()
      : Date.now(),
  };
}

/**
 * Load the user's collection from Supabase and merge it with
 * whatever is in localStorage (Supabase wins on conflict).
 */
export async function syncCollectionFromSupabase(userId: string): Promise<CollectionItem[]> {
  try {
    const { data, error } = await supabase
      .from("collection")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return getCollection();

    const remote: CollectionItem[] = data.map(dbRowToItem);

    // Merge: remote items are authoritative; add local-only items that don't exist remotely
    const remoteIds = new Set(remote.map((i) => i.id));
    const localOnly = getCollection().filter((i) => !remoteIds.has(i.id));
    const merged    = [...remote, ...localOnly];

    // Write back to localStorage so the app works offline too
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return getCollection();
  }
}

/** Save a single item to Supabase (called right after saveToCollection) */
export async function saveToCollectionRemote(
  item:   CollectionItem,
  userId: string,
): Promise<void> {
  try {
    await supabase.from("collection").upsert(
      {
        id:               item.id,
        user_id:          userId,
        scan_id:          null,
        brand:            item.brand,
        model:            item.model,
        reference_number: item.reference_number,
        production_years: item.production_years,
        value_low:        item.value_low,
        value_high:       item.value_high,
        currency:         item.currency,
        authenticity:     item.authenticity,
        confidence:       item.confidence,
        thumbnail:        item.thumbnail,
        created_at:       new Date(item.savedAt).toISOString(),
      },
      { onConflict: "id" },
    );
  } catch {
    /* silently ignore — item is already in localStorage */
  }
}

/** Delete a single item from Supabase */
export async function removeFromCollectionRemote(
  id:     string,
  userId: string,
): Promise<void> {
  try {
    await supabase.from("collection").delete().eq("id", id).eq("user_id", userId);
  } catch {
    /* silently ignore */
  }
}
