/**
 * WatchSnap — iOS App Icon Generator
 *
 * Produces a 1024×1024 PNG that Xcode uses to derive all smaller sizes.
 * Design: near-black background, layered gold radial glow, bold 5-pointed
 * star (the WatchSnap logo-mark), and a thin watch-bezel ring for context.
 *
 * Run: node scripts/generate-icon.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

const SIZE = 1024;

/* ────────────────────────────────────────────────────────────────
   Build the icon as an SVG — sharp renders SVG natively via librsvg,
   so we get crisp vector output at any resolution.
──────────────────────────────────────────────────────────────── */
function makeSVG(size) {
  const cx  = size / 2;
  const cy  = size / 2;
  const r   = size * 0.44;   // star outer radius
  const ri  = size * 0.195;  // star inner radius
  const pts = 5;

  // ── 5-pointed star path ──────────────────────────────────────
  function starPath(cx, cy, outerR, innerR, points) {
    const step = Math.PI / points;
    let d = '';
    for (let i = 0; i < points * 2; i++) {
      const angle = i * step - Math.PI / 2;
      const radius = i % 2 === 0 ? outerR : innerR;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      d += (i === 0 ? 'M' : 'L') + `${x.toFixed(3)},${y.toFixed(3)}`;
    }
    return d + 'Z';
  }

  const starD = starPath(cx, cy, r, ri, pts);

  // Bezel ring: thin circle suggesting a watch case
  const bezelR    = size * 0.46;
  const bezelW    = size * 0.012;

  // ── NOTE: NO clipPath / rounded corners here. ──────────────────────────
  // Apple applies its own squircle mask at render time. The submitted PNG
  // must be a full 1024×1024 square with ZERO transparent pixels — any
  // alpha channel causes App Store error 90717.
  //
  // Transparency-free strategy:
  //   • Every gradient uses solid stop-colors (no stop-opacity < 1).
  //   • The ambient glow is baked as a blended solid colour, not semi-transparent.
  //   • sharp's .flatten({ background:'#000000' }) below is a final safety net
  //     that composites everything onto black and strips the alpha channel.

  // Pre-blend glow colour onto #0A0905 background so we get a solid hex:
  // rgba(201,168,76,0.18) over #0A0905  ≈  #201d0e
  // rgba(201,168,76,0.22) over #111010  ≈  #252011

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Background: rich near-black, fully opaque -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#131210"/>
      <stop offset="100%" stop-color="#0A0905"/>
    </linearGradient>

    <!-- Ambient glow: pre-blended onto background — NO stop-opacity -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="52%">
      <stop offset="0%"   stop-color="#252011"/>
      <stop offset="55%"  stop-color="#161410"/>
      <stop offset="100%" stop-color="#0A0905"/>
    </radialGradient>

    <!-- Star fill: warm gold gradient, fully opaque -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#F0D080"/>
      <stop offset="40%"  stop-color="#D4A940"/>
      <stop offset="100%" stop-color="#9A6E1A"/>
    </linearGradient>

    <!-- Star sheen: pre-blended highlight — NO stop-opacity -->
    <radialGradient id="starSheen" cx="36%" cy="28%" r="55%">
      <stop offset="0%"   stop-color="#F8EDA0"/>
      <stop offset="100%" stop-color="#D4A940"/>
    </radialGradient>

    <!-- Bezel ring gradient, fully opaque -->
    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#888070"/>
      <stop offset="30%"  stop-color="#D4B86A"/>
      <stop offset="60%"  stop-color="#7A6840"/>
      <stop offset="100%" stop-color="#C0A050"/>
    </linearGradient>

    <!-- Drop-shadow: flood-opacity kept as SVG attribute (not PNG alpha) -->
    <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${(size * 0.012).toFixed(1)}"
        stdDeviation="${(size * 0.025).toFixed(1)}"
        flood-color="#000000" flood-opacity="0.7"/>
    </filter>
    <filter id="starGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="${(size * 0.018).toFixed(1)}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Solid black base — guarantees no transparent corner pixels -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="#000000"/>

  <!-- Background gradient over solid base -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#bgGrad)"/>

  <!-- Ambient glow (solid pre-blended colours) -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#glowGrad)"/>

  <!-- Watch bezel ring -->
  <circle cx="${cx}" cy="${cy}" r="${bezelR}"
    fill="none" stroke="url(#bezelGrad)"
    stroke-width="${bezelW}" opacity="0.55"/>

  <!-- Inner bezel accent -->
  <circle cx="${cx}" cy="${cy}" r="${(bezelR - bezelW * 1.8).toFixed(1)}"
    fill="none" stroke="#C9A84C"
    stroke-width="${(bezelW * 0.35).toFixed(1)}" opacity="0.18"/>

  <!-- Star shadow -->
  <path d="${starD}" fill="#000000" opacity="0.45"
    filter="url(#starShadow)"
    transform="translate(0,${(size * 0.018).toFixed(1)})"/>

  <!-- Star gold fill -->
  <path d="${starD}" fill="url(#starGrad)" filter="url(#starGlow)"/>

  <!-- Star sheen (opaque highlight, looks like light catching the surface) -->
  <path d="${starD}" fill="url(#starSheen)" opacity="0.28"/>

  <!-- Star crisp edge -->
  <path d="${starD}" fill="none"
    stroke="#C9A84C" stroke-width="${(size * 0.004).toFixed(1)}"
    opacity="0.6"/>
</svg>`;
}

/* ────────────────────────────────────────────────────────────────
   Render and save
──────────────────────────────────────────────────────────────── */
async function generateIcon() {
  const svgBuffer = Buffer.from(makeSVG(SIZE));

  const iconDir  = path.join(ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
  const destPath = path.join(iconDir, 'AppIcon-512@2x.png');
  const deskPath = 'C:\\Users\\eyalt\\Desktop\\watchsnap_icon_1024.png';

  // Render SVG → PNG at 1024×1024.
  // .flatten() composites every semi-transparent pixel onto solid black
  // and converts RGBA → RGB, eliminating the alpha channel entirely.
  // Apple rejects icons with alpha (error 90717).
  const rendered = await sharp(svgBuffer)
    .resize(SIZE, SIZE)
    .flatten({ background: { r: 0, g: 0, b: 0 } })   // ← removes alpha
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(rendered).toFile(destPath);
  console.log(`✅ Saved to Xcode assets: ${destPath}`);

  // Also save a copy to Desktop for App Store Connect upload
  await sharp(rendered).toFile(deskPath);

  console.log(`✅ Saved to Desktop:      ${deskPath}`);

  // ── Verify the output is sane ──────────────────────────────
  const meta = await sharp(destPath).metadata();
  console.log(`   Format: ${meta.format}  Size: ${meta.width}×${meta.height}  Channels: ${meta.channels}`);
}

generateIcon().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
