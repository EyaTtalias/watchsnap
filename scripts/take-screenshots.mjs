/**
 * WatchSnap — App Store screenshot capture
 * Takes home + paywall screenshots at iPhone 14 Pro Max viewport.
 * Run: node scripts/take-screenshots.mjs
 */

import puppeteer from 'puppeteer';
import path from 'path';

const BASE_URL = 'https://watchsnap.vercel.app';
const DEST     = 'C:\\Users\\eyalt\\Desktop';
const VIEWPORT = { width: 430, height: 932, deviceScaleFactor: 3 };

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Dismiss any install / cookie / modal banners visible on the page */
async function dismissBanners(page) {
  // 1. Suppress the PWA install banner via localStorage before navigation
  //    (so it never mounts in the first place on subsequent loads)
  await page.evaluate(() => {
    try {
      // Common keys used by PWA install banners to remember "dismissed"
      localStorage.setItem('watchsnap_install_dismissed', '1');
      localStorage.setItem('watchsnap_pwa_prompted', '1');
      localStorage.setItem('pwa_install_dismissed', 'true');
      localStorage.setItem('installBannerDismissed', 'true');
      localStorage.setItem('ws_install_shown', '1');
    } catch (_) {}
  });

  // 2. If a banner / modal is still visible, try clicking its close / dismiss button
  const dismissSelectors = [
    // Text-based: "Maybe Later", "No thanks", "×", "Close"
    'button ::-p-text(Maybe Later)',
    'button ::-p-text(No thanks)',
    '[aria-label="Close"]',
    '[aria-label="close"]',
    // Generic modal close — small button in top-right corner
    'button[class*="close"]',
    'button[class*="Close"]',
    // Any button whose text is just ×/✕
    'button ::-p-text(×)',
  ];

  for (const sel of dismissSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        await el.click();
        await wait(400);
        break;
      }
    } catch (_) {}
  }

  // 3. Fallback: click the first visible fixed/absolute overlay button we can find
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(btn => {
      const txt = btn.textContent?.trim().toLowerCase();
      if (txt === 'maybe later' || txt === 'close' || txt === 'no thanks' || txt === '×' || txt === '✕') {
        btn.click();
      }
    });
  });

  await wait(600);
}

async function run() {
  console.log('🚀 Launching browser…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  );

  /* ── Prime localStorage so banners never appear ── */
  // Load any page first to get the origin's localStorage
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    try {
      localStorage.setItem('watchsnap_install_dismissed', '1');
      localStorage.setItem('watchsnap_pwa_prompted', '1');
      localStorage.setItem('ws_install_shown', '1');
      localStorage.setItem('installBannerDismissed', 'true');
      localStorage.setItem('pwa_install_dismissed', 'true');
    } catch (_) {}
  });

  /* ─── Screenshot 1: Home / Scan screen ─── */
  console.log('📸 Navigating to home/scan screen…');
  await page.goto(`${BASE_URL}/scan`, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2000);
  await dismissBanners(page);
  await wait(800);

  const homePath = path.join(DEST, 'home_screenshot.png');
  await page.screenshot({ path: homePath, fullPage: false });
  console.log(`✅ Home screenshot saved: ${homePath}`);

  /* ─── Screenshot 2: Paywall / Upgrade screen ─── */
  console.log('📸 Navigating to paywall…');
  await page.goto(`${BASE_URL}/paywall`, { waitUntil: 'networkidle0', timeout: 30000 });
  await wait(2000);
  await dismissBanners(page);
  await wait(800);

  const paywallPath = path.join(DEST, 'paywall_screenshot.png');
  await page.screenshot({ path: paywallPath, fullPage: false });
  console.log(`✅ Paywall screenshot saved: ${paywallPath}`);

  await browser.close();
  console.log('\n✅ Done — both screenshots saved to Desktop.');
}

run().catch(err => {
  console.error('Screenshot capture failed:', err.message);
  process.exit(1);
});
