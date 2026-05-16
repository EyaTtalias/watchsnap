"""
WatchSnap — Google Play Store Feature Graphic  (1024 x 500 px)
Dark background, watch on right, gold text on left, blue AI scan lines.
"""

import math, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = r"C:\Users\eyalt\Desktop\watchsnap-feature-graphic.png"
W, H = 1024, 500

# ── colours ──────────────────────────────────────────────────────────────────
BG         = (10,  10,  10)
GOLD       = (201, 168,  76)
GOLD_LIGHT = (226, 192, 109)
GOLD_DARK  = (120,  96,  40)
FACE       = ( 17,  17,  17)
RED        = (239,  68,  68)
SCAN_BLUE  = ( 80, 200, 255)
WHITE      = (255, 255, 255)
GRAY       = (160, 160, 160)


def pt(cx, cy, angle_deg, radius):
    a = math.radians(angle_deg - 90)
    return (cx + radius * math.cos(a), cy + radius * math.sin(a))


# ─────────────────────────────────────────────────────────────────────────────
# 1. Base canvas
# ─────────────────────────────────────────────────────────────────────────────
img = Image.new("RGBA", (W, H), (*BG, 255))
d   = ImageDraw.Draw(img, "RGBA")

# ─────────────────────────────────────────────────────────────────────────────
# 2. Background texture: faint grid lines
# ─────────────────────────────────────────────────────────────────────────────
grid_alpha = 18
for x in range(0, W, 40):
    d.line([(x, 0), (x, H)], fill=(*GOLD, grid_alpha), width=1)
for y in range(0, H, 40):
    d.line([(0, y), (W, y)], fill=(*GOLD, grid_alpha), width=1)

# ─────────────────────────────────────────────────────────────────────────────
# 3. Right-side radial glow (behind watch)
# ─────────────────────────────────────────────────────────────────────────────
glow_cx, glow_cy = int(W * 0.73), H // 2
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd   = ImageDraw.Draw(glow, "RGBA")
for r in range(260, 60, -3):
    alpha = int(55 * (1 - (r - 60) / 200))
    gd.ellipse([glow_cx-r, glow_cy-r, glow_cx+r, glow_cy+r],
               fill=(*GOLD, max(0, alpha)))
glow = glow.filter(ImageFilter.GaussianBlur(radius=28))
img  = Image.alpha_composite(img, glow)
d    = ImageDraw.Draw(img, "RGBA")

# ─────────────────────────────────────────────────────────────────────────────
# 4. Left-side blue glow (behind text)
# ─────────────────────────────────────────────────────────────────────────────
blue_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bgd = ImageDraw.Draw(blue_glow, "RGBA")
for r in range(200, 40, -3):
    alpha = int(30 * (1 - (r - 40) / 160))
    bgd.ellipse([int(W*0.18)-r, H//2-r, int(W*0.18)+r, H//2+r],
                fill=(*SCAN_BLUE, max(0, alpha)))
blue_glow = blue_glow.filter(ImageFilter.GaussianBlur(radius=30))
img = Image.alpha_composite(img, blue_glow)
d   = ImageDraw.Draw(img, "RGBA")

# ─────────────────────────────────────────────────────────────────────────────
# 5. Diagonal separator line (left panel / right panel)
# ─────────────────────────────────────────────────────────────────────────────
sep_x = int(W * 0.455)
d.line([(sep_x - 30, 0), (sep_x + 30, H)],
       fill=(*GOLD, 35), width=1)

# ─────────────────────────────────────────────────────────────────────────────
# 6. Draw the watch  (centre: glow_cx, glow_cy)
# ─────────────────────────────────────────────────────────────────────────────
SC   = 4
WW   = H * SC                            # square working canvas
wimg = Image.new("RGBA", (WW, WW), (0, 0, 0, 0))
wd   = ImageDraw.Draw(wimg, "RGBA")
wcx  = wcy = WW // 2

R_outer = int(WW * 0.440)
R_inner = int(WW * 0.385)

# outer gold ring
wd.ellipse([wcx-R_outer, wcy-R_outer, wcx+R_outer, wcy+R_outer], fill=GOLD)
wd.arc([wcx-R_outer+4, wcy-R_outer+4, wcx+R_outer-4, wcy+R_outer-4],
       start=-150, end=-30, fill=GOLD_LIGHT, width=int(WW*0.012))

# face
wd.ellipse([wcx-R_inner, wcy-R_inner, wcx+R_inner, wcy+R_inner], fill=FACE)
wd.ellipse([wcx-R_inner, wcy-R_inner, wcx+R_inner, wcy+R_inner],
           outline=(0,0,0,180), width=int(WW*0.008))

# hour markers
for i in range(12):
    ang    = i * 30
    is_main = (i % 3 == 0)
    r_out  = int(WW * 0.355)
    r_in   = int(WW * (0.295 if is_main else 0.312))
    mw     = int(WW * (0.022 if is_main else 0.014))
    x1, y1 = pt(wcx, wcy, ang, r_in)
    x2, y2 = pt(wcx, wcy, ang, r_out)
    wd.line([x1, y1, x2, y2], fill=GOLD_LIGHT if is_main else GOLD, width=mw)

# minute dots
for i in range(60):
    if i % 5 == 0: continue
    x, y = pt(wcx, wcy, i*6, int(WW*0.337))
    dr   = int(WW * 0.006)
    wd.ellipse([x-dr,y-dr,x+dr,y+dr], fill=(*GOLD, 100))

# hands
hw = int(WW * 0.025)
def hand(cx, cy, angle, length, width, colour, tail=0):
    x1, y1 = pt(cx, cy, angle+180, tail)
    x2, y2 = pt(cx, cy, angle, length)
    wd.line([x1,y1,x2,y2], fill=colour, width=width)
    cr = width // 2
    for px, py in [(x1,y1),(x2,y2)]:
        wd.ellipse([px-cr,py-cr,px+cr,py+cr], fill=colour)

hand(wcx, wcy, 300, int(WW*0.215), hw+int(WW*0.010), GOLD_LIGHT, tail=int(WW*0.04))
hand(wcx, wcy,  62, int(WW*0.290), hw,               GOLD_LIGHT, tail=int(WW*0.05))
hand(wcx, wcy, 180, int(WW*0.310), int(WW*0.011),    RED,        tail=int(WW*0.07))

pip = int(WW*0.024)
wd.ellipse([wcx-pip,wcy-pip,wcx+pip,wcy+pip], fill=GOLD)
wd.ellipse([wcx-pip//2,wcy-pip//2,wcx+pip//2,wcy+pip//2], fill=GOLD_LIGHT)

# AI scan lines on watch
scan_l = Image.new("RGBA", (WW, WW), (0,0,0,0))
sd = ImageDraw.Draw(scan_l, "RGBA")
for off_frac, alpha in [(-0.07, 80), (0.02, 120), (0.11, 65)]:
    ys   = int(wcy + off_frac * WW)
    dy   = abs(ys - wcy)
    if dy >= R_inner: continue
    hw_s = int(math.sqrt(R_inner**2 - dy**2))
    lw   = int(WW * 0.009)
    sd.line([(wcx-hw_s+int(WW*0.02), ys),(wcx+hw_s-int(WW*0.02), ys)],
            fill=(*SCAN_BLUE, alpha), width=lw)

# scan brackets
bkx, bky = wcx+int(WW*0.19), wcy-int(WW*0.19)
bk, bw   = int(WW*0.055), int(WW*0.016)
sd.line([(bkx-bk,bky),(bkx,bky)],       fill=(*SCAN_BLUE,220), width=bw)
sd.line([(bkx,bky),(bkx,bky+bk)],       fill=(*SCAN_BLUE,220), width=bw)
bkx2,bky2 = wcx-int(WW*0.19), wcy+int(WW*0.19)
sd.line([(bkx2+bk,bky2),(bkx2,bky2)],   fill=(*SCAN_BLUE,180), width=bw)
sd.line([(bkx2,bky2),(bkx2,bky2-bk)],   fill=(*SCAN_BLUE,180), width=bw)
# reticle dots
rtx,rty = wcx+int(WW*0.12), wcy-int(WW*0.04)
rtr,rtg = int(WW*0.011), int(WW*0.019)
for dx,dy in [(0,-rtg),(0,rtg),(-rtg,0),(rtg,0)]:
    sd.ellipse([rtx+dx-rtr,rty+dy-rtr,rtx+dx+rtr,rty+dy+rtr],
               fill=(*SCAN_BLUE,160))

scan_l = scan_l.filter(ImageFilter.GaussianBlur(radius=WW*0.005))
wimg   = Image.alpha_composite(wimg, scan_l)

# ring shine
wd2 = ImageDraw.Draw(wimg,"RGBA")
wd2.arc([wcx-R_outer+6,wcy-R_outer+6,wcx+R_outer-6,wcy+R_outer-6],
        start=-140,end=-40, fill=(255,245,200,70), width=int(WW*0.016))

# downscale watch to H×H then paste onto banner
watch_sq = wimg.resize((H, H), Image.LANCZOS)
paste_x  = glow_cx - H // 2
img.paste(watch_sq, (paste_x, 0), watch_sq)
d = ImageDraw.Draw(img, "RGBA")

# ─────────────────────────────────────────────────────────────────────────────
# 7. Horizontal scan lines extending across full banner
# ─────────────────────────────────────────────────────────────────────────────
for y_frac, alpha, lw in [(0.36, 55, 2), (0.50, 80, 2), (0.64, 45, 1)]:
    y = int(H * y_frac)
    d.line([(0, y), (int(W*0.48), y)], fill=(*SCAN_BLUE, alpha), width=lw)

# ─────────────────────────────────────────────────────────────────────────────
# 8. Text — WatchSnap + subtitle
# ─────────────────────────────────────────────────────────────────────────────
# Try to load a system font; fall back gracefully
def load_font(size, bold=False):
    candidates_bold = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/trebucbd.ttf",
    ]
    candidates_reg = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/trebuc.ttf",
    ]
    pool = candidates_bold if bold else candidates_reg
    for path in pool:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

text_x   = int(W * 0.065)
title_y  = int(H * 0.26)
sub_y    = int(H * 0.56)
tag_y    = int(H * 0.74)

font_title = load_font(102, bold=True)
font_sub   = load_font(36,  bold=False)
font_tag   = load_font(26,  bold=False)

# ── "WatchSnap" — draw twice for subtle shadow ────────────────────────────
shadow_off = 3
d.text((text_x + shadow_off, title_y + shadow_off),
       "WatchSnap", font=font_title, fill=(0, 0, 0, 160))

# Gold gradient text effect: draw "Watch" in GOLD_LIGHT, "Snap" in GOLD
# Measure each part
watch_w  = font_title.getlength("Watch")
snap_w   = font_title.getlength("Snap")

d.text((text_x, title_y), "Watch", font=font_title, fill=GOLD_LIGHT)
d.text((text_x + int(watch_w), title_y), "Snap", font=font_title, fill=GOLD)

# ── Subtitle ─────────────────────────────────────────────────────────────
d.text((text_x, sub_y), "AI Watch Authentication",
       font=font_sub, fill=(*WHITE, 210))

# ── Tag line ─────────────────────────────────────────────────────────────
d.text((text_x, tag_y), "Identify · Authenticate · Value",
       font=font_tag, fill=(*GOLD, 160))

# ── Decorative gold line under title ─────────────────────────────────────
line_y = title_y - 12
d.line([(text_x, line_y), (text_x + int(W*0.30), line_y)],
       fill=(*GOLD, 90), width=2)

# ── Small scan-dot accent next to subtitle ────────────────────────────────
dot_x = text_x - 18
dot_y = sub_y + 16
d.ellipse([dot_x-5, dot_y-5, dot_x+5, dot_y+5], fill=(*SCAN_BLUE, 200))

# ─────────────────────────────────────────────────────────────────────────────
# 9. Bottom gold accent bar
# ─────────────────────────────────────────────────────────────────────────────
bar_h = 4
d.rectangle([0, H-bar_h, W, H], fill=(*GOLD, 180))

# thin bright line above bar
d.line([(0, H-bar_h-1), (W, H-bar_h-1)], fill=(*GOLD_LIGHT, 60), width=1)

# ─────────────────────────────────────────────────────────────────────────────
# 10. Convert to RGB and save
# ─────────────────────────────────────────────────────────────────────────────
final = img.convert("RGB")
final.save(OUT, "PNG", optimize=True)

size_kb = os.path.getsize(OUT) // 1024
print(f"Saved: {OUT}")
print(f"Size : {W}x{H} px  ({size_kb} KB)")
