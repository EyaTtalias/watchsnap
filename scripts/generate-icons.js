/**
 * generate-icons.js
 * Pure Node.js (no external deps) — creates WatchSnap PWA icons as PNG files.
 * Uses only built-in: zlib, fs, path, Buffer.
 *
 * Run: node scripts/generate-icons.js
 */
const zlib = require("zlib");
const fs   = require("fs");
const path = require("path");

/* ─── CRC-32 ─── */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const crcInput  = Buffer.concat([typeBytes, data]);
  const header    = Buffer.allocUnsafe(4);
  const trailer   = Buffer.allocUnsafe(4);
  header.writeUInt32BE(data.length);
  trailer.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([header, typeBytes, data, trailer]);
}

/* ─── PNG builder ─── */
function buildPNG(size, pixelFn) {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8; // bit depth
  ihdr[9]  = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines: filter-byte(0) + 4 bytes/pixel
  const stride  = size * 4 + 1;
  const rawData = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    rawData[y * stride] = 0; // None filter
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y, size);
      const off = y * stride + 1 + x * 4;
      rawData[off]     = r;
      rawData[off + 1] = g;
      rawData[off + 2] = b;
      rawData[off + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 6 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ─── Watch icon pixel function ─── */
function watchPixel(x, y, S) {
  const cx = S / 2, cy = S / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const r    = S * 0.46; // outer edge

  // Outside circle → transparent
  if (dist > r) return [0, 0, 0, 0];

  // Gold bezel ring
  if (dist > r * 0.84) return [201, 168, 76, 255];

  // Watch face background
  const face = [14, 14, 14, 255];

  // Hour markers at 12, 3, 6, 9 — small gold rectangles
  const angle = Math.atan2(dy, dx); // -PI to PI (0 = right / 3 o'clock)
  const normAngle = ((angle + Math.PI * 2.5) % (Math.PI * 2)); // 0 = 12 o'clock
  const quarterFrac = normAngle / (Math.PI / 2);
  const nearQuarter = Math.abs(quarterFrac - Math.round(quarterFrac));
  if (nearQuarter < 0.045 && dist > r * 0.64 && dist < r * 0.80) {
    return [201, 168, 76, 230];
  }

  // Minor hour dots at each hour
  const hourFrac = normAngle / (Math.PI / 6);
  const nearHour = Math.abs(hourFrac - Math.round(hourFrac));
  if (nearHour < 0.06 && dist > r * 0.70 && dist < r * 0.78) {
    return [180, 150, 60, 180];
  }

  // Hour hand — pointing toward 10 o'clock (300° from 12, i.e. -60° from top)
  // In our coords: 10 o'clock = normAngle ≈ 300° → angle from right ≈ 30° → atan2 ≈ -π*2/3
  const hourHandAngle = -Math.PI * 2 / 3;  // 10 o'clock from right
  const dHour = angle - hourHandAngle;
  const normDHour = Math.atan2(Math.sin(dHour), Math.cos(dHour));
  const perpHour = Math.abs(dx * Math.sin(hourHandAngle) - dy * Math.cos(hourHandAngle));
  const projHour = dx * Math.cos(hourHandAngle) + dy * Math.sin(hourHandAngle);
  if (perpHour < S * 0.022 && projHour > 0 && projHour < r * 0.52) {
    return [230, 195, 90, 255];
  }

  // Minute hand — pointing toward 2 o'clock (60° from 12 → angle from right = -30° = -π/6)
  const minHandAngle = -Math.PI / 6; // 2 o'clock from right
  const perpMin = Math.abs(dx * Math.sin(minHandAngle) - dy * Math.cos(minHandAngle));
  const projMin = dx * Math.cos(minHandAngle) + dy * Math.sin(minHandAngle);
  if (perpMin < S * 0.016 && projMin > 0 && projMin < r * 0.68) {
    return [230, 195, 90, 255];
  }

  // Second hand (red) — pointing toward 6 o'clock
  const secHandAngle = Math.PI / 2; // 6 o'clock from right
  const perpSec = Math.abs(dx * Math.sin(secHandAngle) - dy * Math.cos(secHandAngle));
  const projSec = dx * Math.cos(secHandAngle) + dy * Math.sin(secHandAngle);
  if (perpSec < S * 0.010 && projSec > -r * 0.15 && projSec < r * 0.72) {
    return [220, 60, 60, 255];
  }

  // Center hub
  if (dist < r * 0.055) return [201, 168, 76, 255];

  return face;
}

/* ─── Generate all sizes ─── */
const SIZES  = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of SIZES) {
  const png  = buildPNG(size, watchPixel);
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, png);
  console.log(`✓ icon-${size}.png  (${Math.round(png.length / 1024)}KB)`);
}

// Also copy 192 as apple-touch-icon.png
fs.copyFileSync(
  path.join(outDir, "icon-192.png"),
  path.join(__dirname, "..", "public", "apple-touch-icon.png")
);
console.log("✓ apple-touch-icon.png");

// Copy 512 as maskable icon (same image, separate entry for manifest)
fs.copyFileSync(
  path.join(outDir, "icon-512.png"),
  path.join(outDir, "icon-512-maskable.png")
);
console.log("✓ icon-512-maskable.png");
console.log("\nAll PWA icons generated successfully.");
