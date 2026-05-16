"""
WatchSnap Icon Generator
Luxury watch + AI scan element on dark background.
Uses only Pillow — no external dependencies.
"""

import math
import os
from PIL import Image, ImageDraw

# ── Brand colours ──────────────────────────────────────────────────────────
BG         = (10,  10,  10)          # #0A0A0A
GOLD       = (201, 168, 76)          # #C9A84C
GOLD_DARK  = (168, 136, 47)          # #A8882F
GOLD_LIGHT = (226, 192, 109)         # #E2C06D
WHITE      = (255, 255, 255)
RED        = (239,  68,  68)         # second hand
FACE_BG    = (17,  17,  17)          # #111111
SCAN_BLUE  = (96, 200, 255)          # AI scan accent

# ── Output paths ───────────────────────────────────────────────────────────
RES = "C:/Users/eyalt/Desktop/MyApp/watchsnap/android/app/src/main/res"
SIZES = {
    "mipmap-mdpi":    48,
    "mipmap-hdpi":    72,
    "mipmap-xhdpi":   96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

def lerp(a, b, t):
    return a + (b - a) * t

def draw_icon(size: int) -> Image.Image:
    """Draw the WatchSnap icon at the given pixel size."""
    S = size
    # Work at 4× for anti-aliasing, then downscale
    SCALE = 4
    W = S * SCALE

    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d   = ImageDraw.Draw(img)

    cx = cy = W // 2
    R  = W // 2          # full radius

    # ── 1. Background: black rounded square ───────────────────────────────
    corner = int(W * 0.22)   # ~22 % corner radius — matches Play Store style
    d.rounded_rectangle([0, 0, W - 1, W - 1], radius=corner,
                        fill=BG + (255,))

    # ── 2. Outer gold ring ────────────────────────────────────────────────
    ring_r  = int(W * 0.415)
    ring_w  = max(2, int(W * 0.045))
    d.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
              fill=GOLD + (255,))

    # ── 3. Watch face (dark) ──────────────────────────────────────────────
    face_r = ring_r - ring_w
    d.ellipse([cx - face_r, cy - face_r, cx + face_r, cy + face_r],
              fill=FACE_BG + (255,))

    # ── 4. Hour markers (12 gold rectangles) ─────────────────────────────
    marker_outer = int(W * 0.355)
    marker_inner = int(W * 0.295)
    marker_w     = max(2, int(W * 0.028))
    for i in range(12):
        angle = math.radians(i * 30 - 90)
        x1 = cx + marker_inner * math.cos(angle)
        y1 = cy + marker_inner * math.sin(angle)
        x2 = cx + marker_outer * math.cos(angle)
        y2 = cy + marker_outer * math.sin(angle)
        d.line([x1, y1, x2, y2], fill=GOLD + (255,), width=marker_w)

    # ── 5. Watch hands ────────────────────────────────────────────────────
    hand_w = max(2, int(W * 0.030))

    # Hour hand  (~10 o'clock → -60° from 12)
    h_len = int(W * 0.20)
    ha    = math.radians(-60 - 90)
    d.line([cx, cy,
            cx + h_len * math.cos(ha),
            cy + h_len * math.sin(ha)],
           fill=GOLD_LIGHT + (255,), width=hand_w + 2)

    # Minute hand (~2 o'clock → +60° from 12)
    m_len = int(W * 0.27)
    ma    = math.radians(60 - 90)
    d.line([cx, cy,
            cx + m_len * math.cos(ma),
            cy + m_len * math.sin(ma)],
           fill=GOLD_LIGHT + (255,), width=hand_w)

    # Second hand (straight down)
    s_len  = int(W * 0.30)
    s_tail = int(W * 0.08)
    sa     = math.radians(180 - 90)
    d.line([cx - s_tail * math.cos(sa),
            cy - s_tail * math.sin(sa),
            cx + s_len * math.cos(sa),
            cy + s_len * math.sin(sa)],
           fill=RED + (255,), width=max(1, hand_w - 2))

    # Centre pip
    pip_r = max(2, int(W * 0.022))
    d.ellipse([cx - pip_r, cy - pip_r, cx + pip_r, cy + pip_r],
              fill=GOLD + (255,))

    # ── 6. AI scan accent — three arc ticks at 2 o'clock position ─────────
    scan_r = int(W * 0.455)            # just outside the gold ring
    tick_len = int(W * 0.06)
    tick_w   = max(1, int(W * 0.018))
    # Draw 3 small dashes at ~45°–75° (lower-right quadrant → "scan corner")
    for offset_deg in [-12, 0, 12]:
        base_angle = 45                # degrees from 12 o'clock
        a1 = math.radians(base_angle + offset_deg - 90)
        a2 = math.radians(base_angle + offset_deg + 2.5 - 90)
        # arc approximated as short line on the outer circle
        x1 = cx + (scan_r - tick_len // 2) * math.cos(a1)
        y1 = cy + (scan_r - tick_len // 2) * math.sin(a1)
        x2 = cx + (scan_r + tick_len // 2) * math.cos(a2)
        y2 = cy + (scan_r + tick_len // 2) * math.sin(a2)
        d.line([x1, y1, x2, y2], fill=SCAN_BLUE + (220,), width=tick_w)

    # ── 7. Downscale with LANCZOS for clean anti-aliasing ─────────────────
    icon = img.resize((S, S), Image.LANCZOS)
    return icon


def draw_icon_round(size: int) -> Image.Image:
    """Round version: same icon but with circular mask."""
    icon = draw_icon(size)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    result.paste(icon, mask=mask)
    return result


def save(img: Image.Image, path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")
    kb = os.path.getsize(path) // 1024
    print(f"  OK  {path.split('res/')[-1]:55s}  ({img.width}x{img.height}  {kb} KB)")


def main():
    print("\nWatchSnap Icon Generator - Pillow\n")
    for folder, size in SIZES.items():
        base = f"{RES}/{folder}"
        save(draw_icon(size),       f"{base}/ic_launcher.png")
        save(draw_icon_round(size), f"{base}/ic_launcher_round.png")
    print("\nDone! All icons replaced.\n")


if __name__ == "__main__":
    main()
