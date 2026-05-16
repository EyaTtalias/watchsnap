import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

export const maxDuration = 60;
// "force-dynamic" is required for the live Vercel deployment (no caching).
// It must be omitted when BUILD_TARGET=capacitor because `output: "export"`
// is incompatible with force-dynamic — the API route is never included in the
// static bundle anyway; the native app calls it remotely via the Vercel URL.
export const dynamic =
  process.env.BUILD_TARGET === "capacitor" ? "auto" : "force-dynamic";

// ── CORS headers ─────────────────────────────────────────────────────────────
// Capacitor Android apps run on https://localhost — without these headers the
// WebView's CORS policy will block every response from the Vercel origin.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// Pre-flight handler (browser sends OPTIONS before the real POST)
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/* ─────────────────────────────────────────────────────────────────
   AUTHENTIC PRICE DATABASE
   Secondary-market medians (Chrono24/eBay, mid-2024).
───────────────────────────────────────────────────────────────── */
const PRICE_DB: Array<{ key: string; low: number; high: number; status: string }> = [
  // Rolex
  { key: "rolex submariner",       low: 8500,   high: 14000,  status: "stable"      },
  { key: "rolex daytona",          low: 25000,  high: 48000,  status: "high_demand" },
  { key: "rolex datejust",         low: 5200,   high: 9500,   status: "stable"      },
  { key: "rolex gmt-master",       low: 12000,  high: 22000,  status: "rising"      },
  { key: "rolex gmt master",       low: 12000,  high: 22000,  status: "rising"      },
  { key: "rolex explorer",         low: 6000,   high: 10500,  status: "stable"      },
  { key: "rolex sea-dweller",      low: 10000,  high: 16500,  status: "stable"      },
  { key: "rolex sky-dweller",      low: 18000,  high: 32000,  status: "stable"      },
  { key: "rolex milgauss",         low: 7000,   high: 11500,  status: "stable"      },
  { key: "rolex day-date",         low: 22000,  high: 55000,  status: "stable"      },
  { key: "rolex day date",         low: 22000,  high: 55000,  status: "stable"      },
  { key: "rolex oyster perpetual", low: 4500,   high: 7500,   status: "stable"      },
  { key: "rolex yacht-master",     low: 9000,   high: 18000,  status: "stable"      },
  { key: "rolex air-king",         low: 5500,   high: 8500,   status: "stable"      },
  // Patek Philippe
  { key: "patek philippe nautilus",  low: 80000,  high: 160000, status: "high_demand" },
  { key: "patek philippe aquanaut",  low: 32000,  high: 65000,  status: "high_demand" },
  { key: "patek philippe calatrava", low: 20000,  high: 55000,  status: "stable"      },
  { key: "patek philippe grand complications", low: 60000, high: 300000, status: "stable" },
  { key: "patek philippe",           low: 18000,  high: 80000,  status: "stable"      },
  // Audemars Piguet
  { key: "audemars piguet royal oak offshore", low: 22000, high: 50000, status: "stable" },
  { key: "audemars piguet royal oak",          low: 28000, high: 75000, status: "high_demand" },
  { key: "audemars piguet",                    low: 18000, high: 60000, status: "stable" },
  // Omega
  { key: "omega speedmaster moonwatch", low: 4000, high: 8000,  status: "stable" },
  { key: "omega speedmaster",           low: 3000, high: 7000,  status: "stable" },
  { key: "omega seamaster 300m",        low: 3000, high: 6000,  status: "stable" },
  { key: "omega seamaster planet ocean",low: 3500, high: 7000,  status: "stable" },
  { key: "omega seamaster",             low: 2500, high: 5500,  status: "stable" },
  { key: "omega constellation",         low: 1800, high: 4500,  status: "stable" },
  { key: "omega de ville",              low: 1200, high: 3500,  status: "stable" },
  // IWC
  { key: "iwc portugieser",        low: 5500,  high: 13000, status: "stable" },
  { key: "iwc pilot chronograph",  low: 5000,  high: 11000, status: "stable" },
  { key: "iwc pilot",              low: 4000,  high: 9500,  status: "stable" },
  { key: "iwc portofino",          low: 3500,  high: 8000,  status: "stable" },
  // Tag Heuer
  { key: "tag heuer carrera",      low: 1800,  high: 5000,  status: "stable"  },
  { key: "tag heuer monaco",       low: 3500,  high: 8000,  status: "rising"  },
  { key: "tag heuer aquaracer",    low: 1000,  high: 2800,  status: "stable"  },
  // Breitling
  { key: "breitling navitimer",    low: 3000,  high: 7500,  status: "stable" },
  { key: "breitling superocean",   low: 2500,  high: 5500,  status: "stable" },
  // Cartier
  { key: "cartier santos",         low: 4500,  high: 10000, status: "stable" },
  { key: "cartier tank",           low: 3500,  high: 9000,  status: "stable" },
  { key: "cartier ballon bleu",    low: 4500,  high: 11000, status: "stable" },
  { key: "cartier panthere",       low: 3000,  high: 7000,  status: "stable" },
  // Hublot
  { key: "hublot big bang",        low: 7000,  high: 18000, status: "stable" },
  { key: "hublot classic fusion",  low: 4500,  high: 10000, status: "stable" },
  // Richard Mille
  { key: "richard mille",          low: 90000, high: 600000,status: "high_demand" },
  // Panerai
  { key: "panerai luminor",        low: 3500,  high: 9000,  status: "stable" },
  { key: "panerai radiomir",       low: 3000,  high: 7500,  status: "stable" },
  // Vacheron Constantin
  { key: "vacheron constantin overseas", low: 28000, high: 60000, status: "stable" },
  { key: "vacheron constantin",          low: 18000, high: 80000, status: "stable" },
  // Jaeger-LeCoultre
  { key: "jaeger-lecoultre reverso",     low: 5000, high: 14000, status: "stable" },
  { key: "jaeger lecoultre reverso",     low: 5000, high: 14000, status: "stable" },
  { key: "jaeger-lecoultre master",      low: 4500, high: 12000, status: "stable" },
  // A. Lange & Söhne
  { key: "a. lange",               low: 20000, high: 120000, status: "stable" },
  { key: "lange sohne",            low: 20000, high: 120000, status: "stable" },
  // Tudor
  { key: "tudor black bay",        low: 2800,  high: 5500,  status: "rising" },
  { key: "tudor pelagos",          low: 3500,  high: 6500,  status: "stable" },
  { key: "tudor",                  low: 2000,  high: 5000,  status: "stable" },
  // Grand Seiko
  { key: "grand seiko",            low: 2200,  high: 9000,  status: "rising" },
  // Seiko
  { key: "seiko prospex",          low: 250,   high: 800,   status: "stable" },
  { key: "seiko presage",          low: 200,   high: 600,   status: "stable" },
  { key: "seiko",                  low: 100,   high: 500,   status: "stable" },
  // Casio
  { key: "casio g-shock",          low: 60,    high: 400,   status: "stable" },
  { key: "casio",                  low: 30,    high: 200,   status: "stable" },
  // Generic brand fallbacks
  { key: "rolex",                  low: 6000,  high: 20000, status: "stable" },
  { key: "generic",                low: 500,   high: 2000,  status: "stable" },
];

function lookupPrice(brand: string, model: string): { low: number; high: number; status: string } | null {
  const haystack = `${brand} ${model}`.toLowerCase();
  const sorted = [...PRICE_DB].sort((a, b) => b.key.length - a.key.length);
  for (const entry of sorted) {
    if (haystack.includes(entry.key)) return { low: entry.low, high: entry.high, status: entry.status };
  }
  const brandOnly = brand.toLowerCase();
  for (const entry of sorted) {
    if (brandOnly.includes(entry.key) || entry.key.includes(brandOnly)) {
      return { low: entry.low, high: entry.high, status: entry.status };
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────
   SYSTEM PROMPT — v6 (deep identification + new fields)
───────────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are a master horologist with 35+ years authenticating luxury timepieces at Christie's, Sotheby's, and leading auction houses. You have physically examined over 50,000 watches. Your analysis is surgical, specific, and always rooted in visible evidence — never in guesswork.

Analyze the provided watch photo and return ONLY a valid JSON object — no markdown, no commentary, just raw JSON.

═══════════════════════════════════════════════════
STEP 1 — BRAND IDENTIFICATION
═══════════════════════════════════════════════════
Examine the dial logo carefully. Key brand visual signatures:
• Rolex — Five-pointed crown at 12 o'clock, "ROLEX" in serif font, "OYSTER PERPETUAL" sub-text
• Omega — Greek Ω symbol, "OMEGA" in distinctive caps, hippocampus on caseback
• Patek Philippe — Calatrava cross, "PATEK PHILIPPE GENÈVE" in two lines, PP monogram
• Audemars Piguet — "AUDEMARS PIGUET" in small caps, integrated bracelet, AP signature
• IWC — "IWC SCHAFFHAUSEN" with schematic logo, clean dial layout
• TAG Heuer — Angled TAG Heuer logo, older pieces may show "HEUER" only
• Cartier — "CARTIER" in Roman caps, blued steel sword hands, Roman numeral chapters
• Panerai — Cushion case, crown at 9-10 o'clock position, sandwich dial construction
• Hublot — Porthole-shaped case, H-bolts on bezel, rubber integration
• Richard Mille — Tonneau/barrel-shaped case, skeletonized movement visible
• Breitling — "BREITLING" curved text on bezel or dial, rider tab on bezel
• Tudor — Tudor Rose/shield logo, "TUDOR" text, snowflake hands (Black Bay)
• Grand Seiko — "GRAND SEIKO" text, snowflake or Snowflake hands, no seconds sub-dial

═══════════════════════════════════════════════════
STEP 2 — EXACT MODEL IDENTIFICATION
═══════════════════════════════════════════════════
Do NOT just identify the brand collection — identify the SPECIFIC variant.

A) BEZEL TYPE — critical for model ID:
   • Smooth polished/fluted → Rolex Datejust, Day-Date, dress models
   • Unidirectional diver's bezel (120-click) → Submariner, Seamaster 300M, Sea-Dweller
   • Bidirectional GMT 24h bezel → GMT-Master II (note: black=Batman, blue/red=Pepsi, all-black=Stealth)
   • Tachymeter scale on bezel/crystal → Omega Speedmaster, Tag Carrera, Daytona
   • Compass/slide rule bezel → Breitling Navitimer, IWC Pilot
   • Octagonal bezel with 8 screws → AP Royal Oak (count the screws)
   • Bezel INSERT color: black ceramic, blue aluminum, green (Submariner Hulk/Kermit), brown/sand

B) DIAL DETAILS — look carefully:
   • Hour marker type: applied metal indices / Roman numerals / Arabic numerals / baton/stick
   • Sub-dials: 0 (no chronograph), 2 (bicompax), 3 (tricompax) — positions matter
   • Date window: 3 o'clock (most Rolex), 4.5 o'clock (Patek Annual Cal), 6 o'clock (some dress), none
   • Cyclops magnification lens over date → Rolex exclusive feature
   • Dial color and texture: sunburst, matte, guilloché, enamel, meteorite, skeleton
   • Lume plots shape: rectangular (Sub/GMT), round (Explorer), triangular pip at 12 (Sub)
   • Text lines: count the lines of text below brand name — helps distinguish models

C) HANDS SHAPE:
   • Mercedes/sword hands (3-pointed star) → Rolex sport (Sub, GMT, Explorer II)
   • Dauphine hands (pointed diamond shape) → Rolex Datejust, dress
   • Snowflake hands (thick rectangular) → Tudor Black Bay, Sea-Dweller
   • Leaf/Breguet hands → vintage and dress pieces
   • Skeleton/openwork hands → Richard Mille, dress complications
   • Baton/stick hands → AP Royal Oak, IWC, modern dress

D) CROWN & PUSHER POSITION:
   • Standard 3 o'clock crown → most models
   • Crown at 9 o'clock → Panerai signature
   • Triplock winding crown (tube visible) → Rolex dive/tool watches
   • Chronograph pushers at 2 and 4 → most chronographs
   • Push-button in crown → some IWC, some vintage

E) REFERENCE NUMBER — look in these places:
   • Printed on dial (rare but possible for some brands)
   • Between the lugs at 12 or 6 (need gap/angled shot)
   • On the caseback text
   • Common Rolex refs: 126610LN (Sub ceramic), 126710BLNR (Batman GMT), 116500LN (Daytona), 126300 (Datejust 41)
   • Common Omega refs: 310.30.42.50.01.001 (Moonwatch), 210.30.42.20.03.001 (Seamaster 300M)
   • If not clearly visible, leave empty string

F) PRODUCTION ERA — use case/dial features to date:
   • Rolex: Maxi dial indices vs older small indices; ceramic bezel (post-2010) vs aluminum (pre-2010)
   • Omega: co-axial escapement era (post-1999) vs older lever escapement

═══════════════════════════════════════════════════
STEP 3 — CASE MATERIAL IDENTIFICATION
═══════════════════════════════════════════════════
Determine from visual appearance:
• Stainless Steel (904L or 316L) — silver tone, mixed brushed/polished finishing
• Oystersteel (Rolex 904L) — slightly warmer silver than standard steel
• Yellow Gold (18k) — warm yellow-gold tone, polished
• White Gold (18k) — bright white silver, often more brilliant than steel
• Rose/Everose Gold — pinkish-warm gold tone
• Two-tone (Rolesor) — steel body with gold bezel and bracelet
• Titanium — slightly darker/cooler grey than steel, matte/brushed typical
• Ceramic (Cerachrom) — very dark/matte appearance (Rolex bezels, Hublot cases)
• Carbon fiber — dark with visible fiber weave texture
• Bronze — warm brownish-gold tone, often patinated

═══════════════════════════════════════════════════
STEP 4 — DIAL COLOR & CONDITION
═══════════════════════════════════════════════════
Describe the dial precisely:
• Color name: Black / White / Silver / Blue / Green / Grey / Champagne / Slate / Brown / Pink
• Finish: Sunburst (radiating from center) / Matte / Guilloché (engraved pattern) / Lacquered / Enamel
• Combined: "Black sunburst", "Blue wavy guilloché", "Silver opaline", "Green matte"
• Condition: Mint (no marks) / Excellent (minor wear) / Good (light patina acceptable) / Fair (notable aging) / Poor

═══════════════════════════════════════════════════
STEP 5 — BRACELET / STRAP IDENTIFICATION
═══════════════════════════════════════════════════
• Oyster bracelet — flat three-piece links, Rolex sport watches
• Jubilee bracelet — five-piece links, dressy, Rolex Datejust
• President bracelet — semi-circular individual links, Rolex Day-Date
• Integrated bracelet — flows seamlessly from case, AP Royal Oak, Patek Nautilus
• Rubber/silicone strap — Hublot, Richard Mille, Omega AT, modern dive
• Leather strap — brown/black/alligator texture, dress watches, Cartier
• NATO strap — single piece textile passing through lugs, Tudor, vintage
• Mesh/Milanese bracelet — woven metal links, Omega, vintage Rolex
• Oysterflex — black rubber with metal spine, modern Rolex sport on rubber
• Describe steel vs gold vs two-tone bracelet finish

═══════════════════════════════════════════════════
AUTHENTICATION — CONSERVATIVE 5-POINT INSPECTION
═══════════════════════════════════════════════════
After full identification, examine for authenticity. Remember: most watches are genuine.

1. DIAL TEXT & PRINTING QUALITY
   Authentic: crisp, consistent font weight, laser-sharp edges, correct typeface
   Replica tell (ONLY if OBVIOUS): visibly misspelled brand name (e.g. "ROIEX"), grossly blurred text that is clearly poor production (not camera blur)

2. LOGO & CROWN QUALITY
   Authentic: crown/logo present, correct proportions, sharp edges
   Replica tell (ONLY if OBVIOUS): logo clearly wrong shape or dramatically wrong size — not just camera angle distortion

3. BEZEL ALIGNMENT & FINISHING
   Authentic: bezel fitted flush, markings evenly spaced
   Replica tell (ONLY if OBVIOUS): bezel visibly misaligned by several millimetres, click markers clearly in wrong positions

4. HANDS & INDICES FINISHING
   Authentic: hands appropriate shape for the identified model, consistent lume application
   Replica tell (ONLY if OBVIOUS): hands clearly wrong shape for the specific model — e.g., stick hands on a model that should have Mercedes hands

5. BRACELET / CLASP QUALITY
   Authentic: bracelet style consistent with the identified model
   Replica tell (ONLY if OBVIOUS): completely wrong bracelet style for the claimed model — e.g., Jubilee on a Submariner that should only come on Oyster

═══════════════════════════════════════════════════
AUTHENTICITY DECISION RULES — READ CAREFULLY
═══════════════════════════════════════════════════
DEFAULT = "likely_authentic". Always start from this assumption.

"likely_authentic" when:
  - Watch looks consistent with the identified brand/model
  - No obvious authentication failures visible
  - Image quality limits inspection — always give benefit of doubt
  - You are uncertain — uncertainty = likely_authentic, NOT replica

"indeterminate" when:
  - Image too blurry/dark/small to identify the brand
  - Watch face/dial not visible
  - Truly cannot assess from the photo
  - Poor image quality → ALWAYS indeterminate, NEVER replica

"replica" ONLY when ALL are true:
  - 2 or more UNAMBIGUOUS red flags simultaneously visible:
    * Brand name visibly misspelled on dial
    * Logo proportions severely and obviously wrong
    * Text quality clearly poor production quality (not focus blur)
  - Impossible to explain by photo quality or camera angle
  - You are 80%+ confident these are genuine replica indicators

NEVER flag replica for: blur, poor lighting, cannot verify details, looks worn/cheap, uncertainty.

═══════════════════════════════════════════════════
WHEN UNCERTAIN BETWEEN MODELS — USE PROBABILITIES
═══════════════════════════════════════════════════
If the watch could be multiple models, populate "possible_models" array:
[
  {"model": "Submariner Date 126610LN", "ref": "126610LN", "probability": 65},
  {"model": "Submariner Date 114060", "ref": "114060", "probability": 35}
]
Set "model" and "reference_number" to the MOST LIKELY option.
Always base probabilities on specific visible evidence — bezel color, hand type, dial indices, etc.
If highly confident (80%+), use possible_models: [] (empty).

═══════════════════════════════════════════════════
PRICING RULES — CRITICAL
═══════════════════════════════════════════════════
IF authenticity = "replica":
  - value_low and value_high = replica market value ($30–$500 typical)
  - DO NOT show authentic price — that is misleading
  - is_replica_price = true

IF authenticity = "likely_authentic" or "indeterminate":
  - value_low and value_high = authentic secondary-market (Chrono24/eBay)
  - is_replica_price = false
  - NEVER return 0 when a brand is identified
  - Rolex Submariner: $8,500–$14,000 | Rolex Daytona: $25,000–$48,000
  - Rolex Datejust: $5,200–$9,500 | Rolex GMT-Master II: $12,000–$22,000
  - Patek Philippe Nautilus: $80,000–$160,000 | AP Royal Oak: $28,000–$75,000
  - Omega Speedmaster: $3,000–$7,000 | Omega Seamaster: $2,500–$5,500

═══════════════════════════════════════════════════
CONFIDENCE SCORING
═══════════════════════════════════════════════════
- Watch face clearly visible + brand logo readable → minimum 65%
- Brand AND specific model identifiable → minimum 70%
- Reference number also visible → 80–90%
- Partial view / low angle → 50–65%
- Blurry / dark / obstructed → 20–45% (set needs_clearer_image = true)
- Cannot determine brand → under 30%
- Clear wrist shot with readable dial → typically 70–85%

═══════════════════════════════════════════════════
JSON STRUCTURE — RETURN EXACTLY THIS
═══════════════════════════════════════════════════
{
  "brand": "exact manufacturer name (e.g. Rolex, Omega, Patek Philippe)",
  "model": "specific model + variant (e.g. Submariner Date, GMT-Master II Batman, Speedmaster Moonwatch)",
  "reference_number": "ref number if visible (e.g. 126610LN), else empty string",
  "possible_models": [{"model": "...", "ref": "...", "probability": integer}] or [],
  "dial_color": "specific description e.g. Black sunburst / Blue wavy / Silver opaline / Green matte",
  "dial_condition": "Mint | Excellent | Good | Fair | Not clearly visible",
  "bracelet_type": "e.g. Oyster bracelet stainless steel / Jubilee bracelet / Rubber strap / Leather strap",
  "authenticity": "likely_authentic | replica | indeterminate",
  "authenticity_reason": "2–3 sentences MAX naming specific visible evidence",
  "replica_flags": ["specific issue 1"] or [],
  "value_low": integer (NEVER 0 when brand identified),
  "value_high": integer,
  "is_replica_price": true | false,
  "currency": "USD",
  "market_status": "stable | rising | high_demand | declining",
  "confidence": integer 0–100,
  "production_years": "e.g. 2020–present, or estimated range, or empty",
  "movement_type": "Automatic / Manual / Quartz + calibre number if known (e.g. Cal. 3235)",
  "case_material": "precise material e.g. Oystersteel 904L / 18k Yellow Gold / Titanium",
  "needs_clearer_image": false,
  "disclaimer": "This is an AI estimate only. Always seek professional authentication before any high-value purchase or sale."
}

═══════════════════════════════════════════════════
AUTHENTICITY REASON — STRICT FORMAT
═══════════════════════════════════════════════════
Exactly 2–3 sentences. Name specific visual evidence.

✓ GOOD (authentic): "This is a Rolex Submariner Date, consistent with ref. 126610LN based on the black ceramic bezel, Mercedes hands, and cyclops lens at 3 o'clock. The crown logo, Maxi dial indices, and Oyster bracelet all match authentic specifications for this reference."

✓ GOOD (uncertain model): "This appears to be a genuine Rolex GMT-Master II. The two-tone blue/black ceramic bezel and Mercedes hands are consistent with either the Batman (126710BLNR) or an earlier 116710BLNR — the ceramic bezel suggests post-2013 production."

✓ GOOD (indeterminate): "Image resolution is insufficient for reliable model identification. Please upload a sharper, well-lit photo focused on the dial and bezel for an accurate result."

✓ GOOD (replica — only truly obvious): "This watch displays clear signs of being a replica. The brand name on the dial is visibly misspelled and the crown logo proportions are grossly incorrect. These are unambiguous indicators of a counterfeit."

✗ FORBIDDEN: More than 3 sentences | Replica from blur/photo quality | "cannot verify" as replica reason | Technical jargon | Starting with "I" or "As an AI"

IMPORTANT: Return ONLY the JSON object. No text before or after.`;

/* ─────────────────────────────────────────────────────────────────
   ROUTE HANDLER
───────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500, headers: CORS });
  }

  /* ── Rate limit: 10 identify requests / hour per IP ── */
  const ip = getClientIp(req);
  const rl = checkRateLimit(`identify:${ip}`, 10);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSec);

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) return NextResponse.json({ error: "No image provided" }, { status: 400, headers: CORS });
    if (imageFile.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image too large — max 10MB" }, { status: 400, headers: CORS });

    const bytes     = await imageFile.arrayBuffer();
    const base64    = Buffer.from(bytes).toString("base64");
    const allowed   = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const mediaType = allowed.includes(imageFile.type)
      ? (imageFile.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
      : "image/jpeg";

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: "Examine this watch photo in detail. Follow all 5 identification steps: brand → exact model/variant → case material → dial color → bracelet type. Then perform authentication. Identify the most specific model possible — not just 'Submariner' but which reference and era. If between two models, populate possible_models with probabilities. Return the complete JSON. If replica, set value_low/value_high to replica market price and is_replica_price=true. Never return 0 for prices if a brand is identified." },
        ],
      }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Model did not return valid JSON");

    const r = JSON.parse(jsonMatch[0]);

    /* ── Sanitize & enforce rules ── */
    r.brand            = String(r.brand || "Unknown").trim();
    r.model            = String(r.model || "Unknown").trim();
    r.reference_number = String(r.reference_number || "").trim();

    // Validate authenticity
    r.authenticity = ["likely_authentic", "replica", "indeterminate"].includes(r.authenticity)
      ? r.authenticity : "likely_authentic";

    // Enforce: confidence < 60 forces indeterminate + needs_clearer_image
    let conf = parseInt(r.confidence) || 0;
    const isKnownBrand = r.brand !== "Unknown" && r.brand !== "Not a watch";
    const isKnownModel = r.model !== "Unknown";
    if (isKnownBrand && isKnownModel && conf < 60) conf = 60;
    if (isKnownBrand && !isKnownModel && conf < 40) conf = 40;
    r.confidence = Math.min(100, Math.max(0, conf));

    if (r.confidence < 60) {
      r.authenticity = "indeterminate";
      r.needs_clearer_image = true;
    } else {
      r.needs_clearer_image = !!r.needs_clearer_image;
    }

    // Clean auth reason
    let authReason = String(r.authenticity_reason || "").trim();
    if (authReason) {
      const FORBIDDEN = /\b(lighting|illumination|lume|luminova|superluminova|tritium|\d+(\.\d+)?\s*mm|millimetre|millimeter|patina|infrared|IR spectrum|time of day|photograph|photo quality|image quality|cannot\s+verify|unable\s+to\s+verify|hard\s+to\s+tell|low\s+resolution)\b/i;
      const sentences = authReason.match(/[^.!?]+[.!?]+/g) ?? [authReason];
      const clean = sentences.filter((s) => !FORBIDDEN.test(s)).slice(0, 3);
      authReason = clean.join(" ").replace(/\s{2,}/g, " ").trim();
    }
    // Fallback for indeterminate with low confidence
    if (!authReason && r.confidence < 60) {
      authReason = "Image quality is insufficient for reliable authentication. Please upload a clearer, well-lit photo focusing on the dial and crown.";
    }
    r.authenticity_reason = authReason;

    // Replica flags array
    r.replica_flags = Array.isArray(r.replica_flags) ? r.replica_flags.slice(0, 5) : [];

    r.currency     = "USD";
    r.market_status = ["stable", "rising", "high_demand", "declining"].includes(r.market_status)
      ? r.market_status : "stable";

    // ── PRICE LOGIC ──
    let valueLow  = Math.max(0, parseInt(r.value_low)  || 0);
    let valueHigh = Math.max(0, parseInt(r.value_high) || 0);
    const isReplica = r.authenticity === "replica";
    r.is_replica_price = isReplica ? true : !!r.is_replica_price;

    if (isReplica) {
      // For replicas: show replica market price, not authentic price
      // If AI gave something reasonable ($30–$600), keep it; otherwise default
      if (valueLow < 20 || valueLow > 800) valueLow = 50;
      if (valueHigh < valueLow || valueHigh > 800) valueHigh = Math.min(800, valueLow * 3);
      // Make sure replica prices don't look like authentic prices
      if (valueLow > 600) valueLow = 150;
      if (valueHigh > 800) valueHigh = 500;
    } else {
      // For authentic/indeterminate: use secondary market prices
      if (valueHigh < valueLow) [valueLow, valueHigh] = [valueHigh, valueLow];
      if (valueHigh === valueLow && valueLow > 0) valueHigh = Math.round(valueLow * 1.4);

      const watchIdentified = isKnownBrand && r.brand !== "Not a watch";
      if (watchIdentified && (valueLow === 0 || valueHigh === 0 || valueHigh < 50)) {
        const fallback = lookupPrice(r.brand, r.model);
        if (fallback) {
          valueLow  = fallback.low;
          valueHigh = fallback.high;
          if (r.market_status === "stable" || !r.market_status) r.market_status = fallback.status;
        } else {
          valueLow  = 800;
          valueHigh = 3000;
        }
      }
    }

    r.value_low  = valueLow;
    r.value_high = valueHigh;

    r.production_years = String(r.production_years || "").trim();
    r.movement_type    = String(r.movement_type    || "").trim();
    r.case_material    = String(r.case_material    || "").trim();

    // ── New fields (v6) ──
    r.dial_color      = String(r.dial_color      || "").trim();
    r.dial_condition  = ["Mint", "Excellent", "Good", "Fair", "Not clearly visible"].includes(r.dial_condition)
      ? r.dial_condition : String(r.dial_condition || "").trim() || "Not clearly visible";
    r.bracelet_type   = String(r.bracelet_type   || "").trim();

    // possible_models: validate array of {model, ref, probability}
    if (Array.isArray(r.possible_models)) {
      r.possible_models = r.possible_models
        .filter((m: unknown) => m && typeof m === "object")
        .map((m: Record<string, unknown>) => ({
          model:       String(m.model       || "").trim(),
          ref:         String(m.ref         || "").trim(),
          probability: Math.min(100, Math.max(0, parseInt(String(m.probability)) || 0)),
        }))
        .filter((m: { model: string }) => m.model)
        .slice(0, 4);
    } else {
      r.possible_models = [];
    }

    r.disclaimer       = "This is an AI estimate only. Always seek professional authentication before any high-value purchase or sale.";

    return NextResponse.json(r, { headers: CORS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[identify]", msg);
    return NextResponse.json({ error: msg }, { status: 500, headers: CORS });
  }
}
