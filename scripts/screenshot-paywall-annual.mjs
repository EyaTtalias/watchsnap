/**
 * Captures the WatchSnap paywall with the Annual plan visually selected.
 * - Uses a tablet-width viewport so both plan cards appear side-by-side.
 * - Injects a CSS highlight ring + "Selected ✓" badge on the Annual card.
 * - Dismisses the PWA install banner before shooting.
 */

import puppeteer from 'puppeteer';

const URL  = 'https://watchsnap.vercel.app/paywall';
const DEST = 'C:\\Users\\eyalt\\Desktop\\paywall_annual_screenshot.png';

// iPad Mini portrait — wide enough for sm:grid-cols-2, still "mobile" feel
const VIEWPORT = { width: 744, height: 1133, deviceScaleFactor: 2 };

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('🚀 Launching browser…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.setUserAgent(
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) ' +
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  );

  // ── Prime localStorage to suppress install banner ──
  await page.goto('https://watchsnap.vercel.app', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    ['watchsnap_install_dismissed','watchsnap_pwa_prompted',
     'ws_install_shown','installBannerDismissed','pwa_install_dismissed']
      .forEach(k => { try { localStorage.setItem(k, '1'); } catch(_){} });
  });

  // ── Navigate to paywall ──
  console.log('📸 Loading paywall…');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2000);

  // ── Dismiss any leftover banner ──
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(btn => {
      const t = btn.textContent?.trim().toLowerCase();
      if (t === 'maybe later' || t === 'close' || t === '×' || t === '✕') btn.click();
    });
  });
  await wait(500);

  // ── Visually "select" the Annual card ──
  // The Annual card has "Best Value" in its header and emerald styling.
  // We find it, add a glowing selection ring and a "✓ Selected" pill.
  await page.evaluate(() => {
    // Find the annual card — it contains "Best Value" text
    const cards = Array.from(document.querySelectorAll('[class*="rounded-3xl"]'));
    const annualCard = cards.find(el => el.textContent?.includes('Best Value'));
    if (!annualCard) return;

    // Apply a bright selection glow border
    annualCard.style.outline         = '3px solid #10b981';
    annualCard.style.outlineOffset   = '2px';
    annualCard.style.boxShadow       = '0 0 0 4px rgba(16,185,129,0.25), 0 0 32px rgba(16,185,129,0.18)';
    annualCard.style.transform       = 'translateY(-3px)';
    annualCard.style.transition      = 'none';

    // Inject a "✓ Selected" floating badge at the top-right of the card
    const badge = document.createElement('div');
    badge.textContent = '✓ Selected';
    Object.assign(badge.style, {
      position:        'absolute',
      top:             '-14px',
      right:           '16px',
      background:      'linear-gradient(135deg,#059669,#10b981)',
      color:           '#fff',
      fontSize:        '11px',
      fontWeight:      '800',
      letterSpacing:   '0.06em',
      padding:         '4px 12px',
      borderRadius:    '999px',
      boxShadow:       '0 4px 12px rgba(16,185,129,0.45)',
      zIndex:          '50',
      pointerEvents:   'none',
    });
    // annualCard needs relative positioning for the badge
    annualCard.style.position = 'relative';
    annualCard.appendChild(badge);

    // Also make the CTA button look "active / pressed"
    const btn = annualCard.querySelector('button');
    if (btn) {
      btn.style.background    = 'rgba(16,185,129,0.25)';
      btn.style.borderColor   = '#10b981';
      btn.style.color         = '#34d399';
      btn.style.boxShadow     = '0 0 14px rgba(16,185,129,0.3)';
    }

    // Slightly dim the monthly card so annual pops
    const monthlyCard = cards.find(el =>
      el.textContent?.includes('Most Popular') && el !== annualCard
    );
    if (monthlyCard) {
      monthlyCard.style.opacity = '0.72';
      monthlyCard.style.filter  = 'saturate(0.7)';
    }
  });

  await wait(400);

  // ── Scroll so the plan cards are centred in the viewport ──
  await page.evaluate(() => {
    const el = document.querySelector('[class*="grid-cols"]');
    if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await wait(300);

  // ── Capture ──
  await page.screenshot({ path: DEST, fullPage: false });
  console.log(`✅ Saved: ${DEST}`);

  // ── Preview metadata ──
  const { default: sharp } = await import('sharp');
  const m = await sharp(DEST).metadata();
  console.log(`   ${m.width}×${m.height} ${m.format}`);

  await browser.close();
}

run().catch(err => { console.error(err.message); process.exit(1); });
