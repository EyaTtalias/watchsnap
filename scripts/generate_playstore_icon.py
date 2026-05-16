"""
WatchSnap — Google Play Store icon  (512 x 512 px)
Luxury watch + AI scan lines, dark background, gold accents, blue scan effect.
"""

import math, os, sys
from PIL import Image, ImageDraw, ImageFilter

OUT = r"C:\Users\eyalt\Desktop\watchsnap-icon-512.png"
S   = 512          # final canvas size
SC  = 4            # super-sampling scale (render at 2048, then downscale)
W   = S * SC       # working canvas: 2048 x 2048

# ---------- colours ----------
BG         = (10,  10,  10, 255)
GOLD       = (201, 168,  76, 255)
GOLD_LIGHT = (226, 192, 109, 255)
GOLD_DARK  = (120,  96,  40, 255)
WHITE      = (255, 255, 255, 255)
FACE       = ( 17,  17,  17, 255)
RED        = (239,  68,  68, 255)
SCAN_BLUE  = ( 80, 200, 255)      # no alpha yet — added per use


def pt(angle_deg, radius, cx=None, cy=None):
    """Polar → cartesian, angle 0 = 12 o'clock."""
    if cx is None: cx = cy = W // 2
    a = math.radians(angle_deg - 90)
    return (cx + radius * math.cos(a), cy + radius * math.sin(a))


def draw_icon():
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d   = ImageDraw.Draw(img, "RGBA")
    cx  = cy = W // 2

    # ── 1. Rounded-square background ─────────────────────────────────────
    corner = int(W * 0.22)
    d.rounded_rectangle([0, 0, W-1, W-1], radius=corner, fill=BG)

    # ── 2. Subtle radial glow behind watch ────────────────────────────────
    glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    gd   = ImageDraw.Draw(glow, "RGBA")
    for r in range(int(W * 0.52), int(W * 0.30), -4):
        alpha = int(60 * (1 - (r - W*0.30) / (W*0.22)))
        gd.ellipse([cx-r, cy-r, cx+r, cy+r],
                   fill=(201, 168, 76, max(0, alpha)))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=W*0.04))
    img  = Image.alpha_composite(img, glow)
    d    = ImageDraw.Draw(img, "RGBA")

    # ── 3. Outer gold ring ────────────────────────────────────────────────
    R_outer = int(W * 0.440)
    R_inner = int(W * 0.385)
    d.ellipse([cx-R_outer, cy-R_outer, cx+R_outer, cy+R_outer], fill=GOLD)

    # fine highlight arc (top-left, lighter gold)
    d.arc([cx-R_outer+4, cy-R_outer+4, cx+R_outer-4, cy+R_outer-4],
          start=-150, end=-30, fill=GOLD_LIGHT, width=int(W*0.012))

    # ── 4. Watch face ─────────────────────────────────────────────────────
    d.ellipse([cx-R_inner, cy-R_inner, cx+R_inner, cy+R_inner], fill=FACE)

    # subtle inner shadow ring
    d.ellipse([cx-R_inner, cy-R_inner, cx+R_inner, cy+R_inner],
              outline=(0,0,0,180), width=int(W*0.008))

    # ── 5. Hour markers ───────────────────────────────────────────────────
    for i in range(12):
        angle   = i * 30
        is_main = (i % 3 == 0)          # 12, 3, 6, 9
        r_out   = int(W * 0.355)
        r_in    = int(W * (0.295 if is_main else 0.310))
        mw      = int(W * (0.024 if is_main else 0.016))
        x1, y1  = pt(angle, r_in)
        x2, y2  = pt(angle, r_out)
        col     = GOLD_LIGHT if is_main else GOLD
        d.line([x1, y1, x2, y2], fill=col, width=mw)

    # ── 6. Minute track dots (60 ticks) ───────────────────────────────────
    for i in range(60):
        if i % 5 == 0: continue          # skip where hour markers are
        angle  = i * 6
        r_dot  = int(W * 0.338)
        dot_r  = int(W * 0.006)
        x, y   = pt(angle, r_dot)
        d.ellipse([x-dot_r, y-dot_r, x+dot_r, y+dot_r],
                  fill=(201, 168, 76, 120))

    # ── 7. Watch hands ────────────────────────────────────────────────────
    hw = int(W * 0.026)          # hand width base

    def hand(angle, length, width, colour, tail=0):
        x1, y1 = pt(angle + 180, tail)
        x2, y2 = pt(angle, length)
        d.line([x1, y1, x2, y2], fill=colour, width=width)
        # round cap
        cr = width // 2
        for px, py in [(x1,y1),(x2,y2)]:
            d.ellipse([px-cr,py-cr,px+cr,py+cr], fill=colour)

    # hour  → 10:10 pose: hour  at ~300° (10 o'clock)
    hand(300, int(W*0.215), hw+int(W*0.010), GOLD_LIGHT, tail=int(W*0.04))
    # minute → ~60° (2 o'clock)
    hand( 62, int(W*0.290), hw,              GOLD_LIGHT, tail=int(W*0.05))
    # second → straight down (180°)
    hand(180, int(W*0.315), int(W*0.012),    RED,        tail=int(W*0.07))

    # centre pip
    pip = int(W * 0.024)
    d.ellipse([cx-pip, cy-pip, cx+pip, cy+pip], fill=GOLD)
    d.ellipse([cx-pip//2, cy-pip//2, cx+pip//2, cy+pip//2], fill=GOLD_LIGHT)

    # ── 8. AI Scan effect — animated-style lines over the face ───────────
    scan_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scan_layer, "RGBA")

    # three horizontal scan lines across the face
    face_r = R_inner
    for offset_frac, alpha in [(-0.08, 90), (0.0, 130), (0.10, 70)]:
        y_scan = int(cy + offset_frac * W)
        # clip to face circle width at that y
        dy    = abs(y_scan - cy)
        if dy >= face_r: continue
        hw_scan = int(math.sqrt(face_r**2 - dy**2))
        lw    = int(W * 0.010)
        sd.line([(cx - hw_scan + int(W*0.02), y_scan),
                 (cx + hw_scan - int(W*0.02), y_scan)],
                fill=(*SCAN_BLUE, alpha), width=lw)

    # scan corner brackets (top-right of face)
    bk_cx = cx + int(W * 0.19)
    bk_cy = cy - int(W * 0.19)
    bk    = int(W * 0.055)
    bw    = int(W * 0.016)
    # top-right bracket
    sd.line([(bk_cx - bk, bk_cy), (bk_cx, bk_cy)],
            fill=(*SCAN_BLUE, 220), width=bw)
    sd.line([(bk_cx, bk_cy), (bk_cx, bk_cy + bk)],
            fill=(*SCAN_BLUE, 220), width=bw)
    # bottom-left bracket (mirrored)
    bk_cx2 = cx - int(W * 0.19)
    bk_cy2 = cy + int(W * 0.19)
    sd.line([(bk_cx2 + bk, bk_cy2), (bk_cx2, bk_cy2)],
            fill=(*SCAN_BLUE, 180), width=bw)
    sd.line([(bk_cx2, bk_cy2), (bk_cx2, bk_cy2 - bk)],
            fill=(*SCAN_BLUE, 180), width=bw)

    # small "AI" dots: 4-point cross reticle at centre-right
    rt_cx = cx + int(W * 0.13)
    rt_cy = cy - int(W * 0.05)
    rt_r  = int(W * 0.012)
    rt_gap = int(W * 0.020)
    for dx, dy in [(0,-rt_gap),(0,rt_gap),(-rt_gap,0),(rt_gap,0)]:
        sd.ellipse([rt_cx+dx-rt_r, rt_cy+dy-rt_r,
                    rt_cx+dx+rt_r, rt_cy+dy+rt_r],
                   fill=(*SCAN_BLUE, 180))

    # soft blur on scan layer for glow effect
    scan_layer = scan_layer.filter(ImageFilter.GaussianBlur(radius=W*0.006))
    img = Image.alpha_composite(img, scan_layer)

    # ── 9. Outer ring shine (top arc highlight) ───────────────────────────
    d2 = ImageDraw.Draw(img, "RGBA")
    d2.arc([cx-R_outer+int(W*0.008), cy-R_outer+int(W*0.008),
            cx+R_outer-int(W*0.008), cy+R_outer-int(W*0.008)],
           start=-140, end=-40,
           fill=(255, 245, 200, 80), width=int(W*0.018))

    # ── 10. Downscale with LANCZOS ────────────────────────────────────────
    icon = img.resize((S, S), Image.LANCZOS)
    return icon


icon = draw_icon()
icon.save(OUT, "PNG")

size_kb = os.path.getsize(OUT) // 1024
print(f"Saved: {OUT}")
print(f"Size : {S}x{S} px  ({size_kb} KB)")
