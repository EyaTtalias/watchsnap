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

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Background: rich near-black with very subtle warm undertone -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#111010"/>
      <stop offset="100%" stop-color="#0A0905"/>
    </linearGradient>

    <!-- Ambient gold glow behind the star -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="52%">
      <stop offset="0%"   stop-color="#C9A84C" stop-opacity="0.22"/>
      <stop offset="55%"  stop-color="#C9A84C" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
    </radialGradient>

    <!-- Star fill: warm gold gradient top-to-bottom -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#F0D080"/>
      <stop offset="40%"  stop-color="#D4A940"/>
      <stop offset="100%" stop-color="#9A6E1A"/>
    </linearGradient>

    <!-- Star inner highlight (top-left sheen) -->
    <radialGradient id="starSheen" cx="36%" cy="28%" r="55%">
      <stop offset="0%"   stop-color="#FFF4C2" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#FFF4C2" stop-opacity="0"/>
    </radialGradient>

    <!-- Bezel ring gradient -->
    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#888070"/>
      <stop offset="30%"  stop-color="#D4B86A"/>
      <stop offset="60%"  stop-color="#7A6840"/>
      <stop offset="100%" stop-color="#C0A050"/>
    </linearGradient>

    <!-- Soft drop-shadow for the star -->
    <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${(size * 0.012).toFixed(1)}" stdDeviation="${(size * 0.025).toFixed(1)}"
        flood-color="#000000" flood-opacity="0.7"/>
    </filter>
    <filter id="starGlow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="${(size * 0.018).toFixed(1)}" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>

    <!-- Clip to rounded square (iOS icon shape, r ≈ 22.5%) -->
    <clipPath id="roundedRect">
      <rect x="0" y="0" width="${size}" height="${size}"
        rx="${(size * 0.225).toFixed(1)}" ry="${(size * 0.225).toFixed(1)}"/>
    </clipPath>
  </defs>

  <g clip-path="url(#roundedRect)">
    <!-- Background -->
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#bgGrad)"/>

    <!-- Ambient glow -->
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#glowGrad)"/>

    <!-- Watch bezel ring (outer) -->
    <circle cx="${cx}" cy="${cy}" r="${bezelR}"
      fill="none" stroke="url(#bezelGrad)"
      stroke-width="${bezelW}" opacity="0.55"/>

    <!-- Inner bezel accent (subtle) -->
    <circle cx="${cx}" cy="${cy}" r="${(bezelR - bezelW * 1.8).toFixed(1)}"
      fill="none" stroke="#C9A84C"
      stroke-width="${(bezelW * 0.35).toFixed(1)}" opacity="0.18"/>

    <!-- Star shadow layer -->
    <path d="${starD}" fill="#000000" opacity="0.45"
      filter="url(#starShadow)"
      transform="translate(0,${(size * 0.018).toFixed(1)})"/>

    <!-- Star gold fill -->
    <path d="${starD}" fill="url(#starGrad)" filter="url(#starGlow)"/>

    <!-- Star top-sheen overlay -->
    <path d="${starD}" fill="url(#starSheen)"/>

    <!-- Thin outer stroke on the star for crispness -->
    <path d="${starD}" fill="none"
      stroke="#C9A84C" stroke-width="${(size * 0.004).toFixed(1)}"
      opacity="0.6"/>
  </g>
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

  // Render SVG → PNG at 1024×1024
  await sharp(svgBuffer)
    .resize(SIZE, SIZE)
    .png({ compressionLevel: 9 })
    .toFile(destPath);

  console.log(`✅ Saved to Xcode assets: ${destPath}`);

  // Also save a copy to Desktop for App Store Connect upload
  await sharp(svgBuffer)
    .resize(SIZE, SIZE)
    .png({ compressionLevel: 9 })
    .toFile(deskPath);

  console.log(`✅ Saved to Desktop:      ${deskPath}`);

  // ── Verify the output is sane ──────────────────────────────
  const meta = await sharp(destPath).metadata();
  console.log(`   Format: ${meta.format}  Size: ${meta.width}×${meta.height}  Channels: ${meta.channels}`);
}

generateIcon().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
