/**
 * WatchSnap Icon Generator
 * Generates all required app icons from an inline SVG design.
 * Run: node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

// ── SVG source ─────────────────────────────────────────────────────────────
// Gold watch face on black background — matches app brand palette #C9A84C
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- Black background (rounded square for Play Store) -->
  <rect width="1024" height="1024" fill="#0A0A0A" rx="220"/>

  <!-- Gold outer ring -->
  <circle cx="512" cy="512" r="385" fill="#C9A84C"/>

  <!-- Black watch face -->
  <circle cx="512" cy="512" r="336" fill="#111111"/>

  <!-- Hour markers: 12 positions, small gold rectangles -->
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(0 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(30 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(60 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(90 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(120 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(150 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(180 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(210 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(240 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(270 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(300 512 512)"/>
  <rect x="501" y="178" width="22" height="52" rx="4" fill="#C9A84C" transform="rotate(330 512 512)"/>

  <!-- Minute hand (10 o'clock position ~300°) — wide gold bar -->
  <rect x="497" y="248" width="30" height="210" rx="15" fill="#C9A84C" transform="rotate(-60 512 512)"/>

  <!-- Hour hand (pointing toward 2 o'clock ~60°) — shorter wide gold bar -->
  <rect x="497" y="310" width="30" height="160" rx="15" fill="#C9A84C" transform="rotate(60 512 512)"/>

  <!-- Red second hand -->
  <rect x="509" y="248" width="6" height="264" rx="3" fill="#EF4444" transform="rotate(180 512 512)"/>

  <!-- Center cap -->
  <circle cx="512" cy="512" r="20" fill="#C9A84C"/>
</svg>`;

// ── Output targets ──────────────────────────────────────────────────────────
const PUBLIC_ICONS = [
  { file: "icon-72.png",  size: 72  },
  { file: "icon-96.png",  size: 96  },
  { file: "icon-128.png", size: 128 },
  { file: "icon-144.png", size: 144 },
  { file: "icon-152.png", size: 152 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-384.png", size: 384 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-512-maskable.png", size: 512 },
];

// Android mipmap directories → launcher icon sizes
const ANDROID_ICONS = [
  { dir: "mipmap-mdpi",    size: 48  },
  { dir: "mipmap-hdpi",    size: 72  },
  { dir: "mipmap-xhdpi",   size: 96  },
  { dir: "mipmap-xxhdpi",  size: 144 },
  { dir: "mipmap-xxxhdpi", size: 192 },
];

// ── Generate ────────────────────────────────────────────────────────────────
const svgBuf = Buffer.from(SVG);

async function gen(outPath, size) {
  await sharp(svgBuf)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`  ✓  ${outPath.replace(ROOT, ".")}  (${size}×${size})`);
}

async function main() {
  console.log("\n🎨  WatchSnap Icon Generator\n");

  // Public icons (PWA / web)
  console.log("── Public icons ──");
  for (const { file, size } of PUBLIC_ICONS) {
    const out = path.join(ROOT, "public", "icons", file);
    await gen(out, size);
  }

  // Apple touch icon
  await gen(path.join(ROOT, "public", "apple-touch-icon.png"), 180);
  console.log();

  // Android mipmap launchers
  const resDir = path.join(ROOT, "android", "app", "src", "main", "res");
  if (fs.existsSync(resDir)) {
    console.log("── Android launcher icons ──");
    for (const { dir, size } of ANDROID_ICONS) {
      const folder = path.join(resDir, dir);
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
      for (const name of ["ic_launcher.png", "ic_launcher_round.png"]) {
        await gen(path.join(folder, name), size);
      }
    }

    // Foreground for adaptive icon (same design, slightly padded)
    console.log("\n── Adaptive icon foreground ──");
    for (const { dir, size } of ANDROID_ICONS) {
      const folder = path.join(resDir, dir);
      await gen(path.join(folder, "ic_launcher_foreground.png"), size);
    }
    console.log();
  } else {
    console.log("⚠  Android res directory not found — skipping Android icons");
  }

  // Play Store 512×512 (separate file, high-contrast)
  console.log("── Play Store upload icon ──");
  const playOut = path.join(ROOT, "public", "icons", "play-store-icon-512.png");
  await gen(playOut, 512);

  console.log("\n✅  All icons generated successfully!\n");
  console.log("📋  For Google Play Store upload:");
  console.log("    Use: public/icons/play-store-icon-512.png\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
