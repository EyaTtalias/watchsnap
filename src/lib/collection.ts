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
  // Deduplicate by brand+model+reference
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
