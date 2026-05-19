import sharp from 'sharp';

const SIZE = 1024;
const DEST = 'C:\\Users\\eyalt\\Desktop\\subscription_image.png';

function makeSVG(size) {
  const cx = size / 2;
  const cy = size / 2;

  // Star path for the watch logo
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

  // Watch dial details — hour tick marks around the circle
  function hourTicks(cx, cy, radius, tickLen, count) {
    let g = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const isMajor = i % 3 === 0;
      const len = isMajor ? tickLen * 1.7 : tickLen;
      const strokeW = isMajor ? 3.5 : 1.8;
      const x1 = cx + Math.cos(angle) * radius;
      const y1 = cy + Math.sin(angle) * radius;
      const x2 = cx + Math.cos(angle) * (radius - len);
      const y2 = cy + Math.sin(angle) * (radius - len);
      g += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"
        stroke="url(#goldGrad)" stroke-width="${strokeW}" stroke-linecap="round" opacity="${isMajor ? '0.9' : '0.5'}"/>`;
    }
    return g;
  }

  const starD = starPath(cx, cy - 38, size * 0.13, size * 0.058, 5);

  // Watch hands at 10:10 position
  const hourAngle  = (-60) * Math.PI / 180;   // 10 o'clock
  const minAngle   = (60)  * Math.PI / 180;   // 2 o'clock (10:10)
  const watchCX = cx;
  const watchCY = cy - 38;
  const dialR   = size * 0.22;
  const hourLen = dialR * 0.55;
  const minLen  = dialR * 0.75;

  const hx2 = watchCX + Math.sin(hourAngle) * hourLen;
  const hy2 = watchCY - Math.cos(hourAngle) * hourLen;
  const mx2 = watchCX + Math.sin(minAngle) * minLen;
  const my2 = watchCY - Math.cos(minAngle) * minLen;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Rich dark background -->
    <radialGradient id="bgGrad" cx="50%" cy="42%" r="70%">
      <stop offset="0%"   stop-color="#1a1508"/>
      <stop offset="60%"  stop-color="#0d0c08"/>
      <stop offset="100%" stop-color="#050404"/>
    </radialGradient>

    <!-- Subtle gold ambient glow -->
    <radialGradient id="glowOuter" cx="50%" cy="42%" r="55%">
      <stop offset="0%"   stop-color="#C9A84C" stop-opacity="0.18"/>
      <stop offset="60%"  stop-color="#C9A84C" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
    </radialGradient>

    <!-- Gold gradient (general) -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#F5E090"/>
      <stop offset="35%"  stop-color="#D4A940"/>
      <stop offset="70%"  stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#8A6318"/>
    </linearGradient>

    <!-- Brighter gold for star fill -->
    <linearGradient id="starGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#FFF0A0"/>
      <stop offset="30%"  stop-color="#E8C050"/>
      <stop offset="70%"  stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#7A5510"/>
    </linearGradient>

    <!-- Dial face gradient -->
    <radialGradient id="dialFace" cx="40%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#1e1c10"/>
      <stop offset="100%" stop-color="#080706"/>
    </radialGradient>

    <!-- Bezel gradient — polished look -->
    <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#A08030"/>
      <stop offset="22%"  stop-color="#F0D878"/>
      <stop offset="45%"  stop-color="#8A6820"/>
      <stop offset="68%"  stop-color="#E8C860"/>
      <stop offset="100%" stop-color="#907030"/>
    </linearGradient>

    <!-- Text gradient -->
    <linearGradient id="textGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#FFF4C0"/>
      <stop offset="40%"  stop-color="#D4A940"/>
      <stop offset="100%" stop-color="#A07820"/>
    </linearGradient>

    <!-- PRO badge gradient -->
    <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#C9A030"/>
      <stop offset="50%"  stop-color="#F0D060"/>
      <stop offset="100%" stop-color="#C9A030"/>
    </linearGradient>

    <!-- Drop shadow for watch -->
    <filter id="watchShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="28" flood-color="#000" flood-opacity="0.85"/>
    </filter>

    <!-- Glow filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- Subtle text glow -->
    <filter id="textGlow" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- ── Background ── -->
  <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>
  <rect width="${size}" height="${size}" fill="url(#glowOuter)"/>

  <!-- ── Decorative thin horizontal line above text ── -->
  <line x1="${cx - 160}" y1="${cy + 248}" x2="${cx + 160}" y2="${cy + 248}"
    stroke="url(#goldGrad)" stroke-width="0.8" opacity="0.35"/>

  <!-- ══════════ WATCH ══════════ -->
  <g filter="url(#watchShadow)">

    <!-- Outer case / lug shadow ring -->
    <circle cx="${watchCX}" cy="${watchCY}" r="${dialR + 54}"
      fill="none" stroke="#000" stroke-width="18" opacity="0.6"/>

    <!-- Outer bezel ring — polished chamfer effect -->
    <circle cx="${watchCX}" cy="${watchCY}" r="${dialR + 48}"
      fill="url(#bezelGrad)" />
    <circle cx="${watchCX}" cy="${watchCY}" r="${dialR + 38}"
      fill="#0d0c08"/>
    <!-- Inner bezel accent ring -->
    <circle cx="${watchCX}" cy="${watchCY}" r="${dialR + 34}"
      fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.5"/>

    <!-- Dial face -->
    <circle cx="${watchCX}" cy="${watchCY}" r="${dialR + 28}"
      fill="url(#dialFace)"/>

    <!-- Hour tick marks -->
    ${hourTicks(watchCX, watchCY, dialR + 22, 14, 60)}

    <!-- Crown (right side) -->
    <rect x="${watchCX + dialR + 44}" y="${watchCY - 11}" width="22" height="22" rx="4"
      fill="url(#bezelGrad)" stroke="#6a5010" stroke-width="0.5"/>
    <rect x="${watchCX + dialR + 46}" y="${watchCY - 7}" width="18" height="14" rx="2"
      fill="none" stroke="url(#goldGrad)" stroke-width="0.7" opacity="0.5"/>

    <!-- Crystal glare (subtle reflection) -->
    <ellipse cx="${watchCX - dialR * 0.18}" cy="${watchCY - dialR * 0.38}" rx="${dialR * 0.28}" ry="${dialR * 0.12}"
      fill="rgba(255,255,255,0.035)" transform="rotate(-30,${watchCX - dialR * 0.18},${watchCY - dialR * 0.38})"/>

    <!-- ── Star logo-mark on dial ── -->
    <path d="${starD}" fill="url(#starGold)" filter="url(#glow)" opacity="0.92"/>
    <path d="${starD}" fill="none" stroke="#FFF0A0" stroke-width="1" opacity="0.4"/>

    <!-- ── Watch hands ── -->
    <!-- Hour hand -->
    <line x1="${watchCX}" y1="${watchCY}" x2="${hx2.toFixed(2)}" y2="${hy2.toFixed(2)}"
      stroke="url(#goldGrad)" stroke-width="7" stroke-linecap="round"
      filter="url(#glow)"/>
    <!-- Minute hand -->
    <line x1="${watchCX}" y1="${watchCY}" x2="${mx2.toFixed(2)}" y2="${my2.toFixed(2)}"
      stroke="url(#goldGrad)" stroke-width="4.5" stroke-linecap="round"
      filter="url(#glow)"/>
    <!-- Seconds hand (sweeping) -->
    <line x1="${watchCX}" y1="${watchCY}"
      x2="${(watchCX - Math.sin(0.7) * dialR * 0.72).toFixed(2)}"
      y2="${(watchCY + Math.cos(0.7) * dialR * 0.72).toFixed(2)}"
      stroke="#FF4422" stroke-width="2" stroke-linecap="round" opacity="0.85"/>

    <!-- Centre jewel -->
    <circle cx="${watchCX}" cy="${watchCY}" r="7" fill="url(#goldGrad)"/>
    <circle cx="${watchCX}" cy="${watchCY}" r="3.5" fill="#FFF8E0"/>
  </g>

  <!-- ══════════ TEXT ══════════ -->

  <!-- "WatchSnap" — main wordmark -->
  <text
    x="${cx}"
    y="${cy + 318}"
    text-anchor="middle"
    font-family="'Georgia', 'Times New Roman', serif"
    font-size="86"
    font-weight="400"
    letter-spacing="6"
    fill="url(#textGold)"
    filter="url(#textGlow)">WatchSnap</text>

  <!-- Thin separator line below wordmark -->
  <line x1="${cx - 120}" y1="${cy + 345}" x2="${cx + 120}" y2="${cy + 345}"
    stroke="url(#goldGrad)" stroke-width="0.7" opacity="0.4"/>

  <!-- PRO badge -->
  <rect x="${cx - 72}" y="${cy + 362}" width="144" height="46" rx="23"
    fill="url(#proGrad)" opacity="0.15"/>
  <rect x="${cx - 72}" y="${cy + 362}" width="144" height="46" rx="23"
    fill="none" stroke="url(#goldGrad)" stroke-width="1.2" opacity="0.7"/>
  <text
    x="${cx}"
    y="${cy + 394}"
    text-anchor="middle"
    font-family="'Georgia', 'Times New Roman', serif"
    font-size="22"
    font-weight="400"
    letter-spacing="8"
    fill="url(#textGold)"
    opacity="0.92">PRO</text>

</svg>`;
}

const svgBuffer = Buffer.from(makeSVG(SIZE));

await sharp(svgBuffer)
  .resize(SIZE, SIZE)
  .png({ compressionLevel: 9 })
  .toFile(DEST);

const meta = await sharp(DEST).metadata();
console.log(`✅ Saved: ${DEST}`);
console.log(`   ${meta.width}×${meta.height} ${meta.format}`);
