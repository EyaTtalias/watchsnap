"""
WatchSnap - Tablet Screenshots
  tablet7-screenshot.png   1200 x 1920   (7-inch, home screen)
  tablet10-screenshot.png  1600 x 2560   (10-inch, results screen)
"""

import math, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BG         = (10,  10,  10)
CARD       = (17,  17,  17)
CARD2      = (22,  22,  22)
GOLD       = (201, 168,  76)
GOLD_LIGHT = (226, 192, 109)
GOLD_DARK  = (120,  96,  40)
WHITE      = (255, 255, 255)
GRAY       = (140, 140, 140)
GRAY2      = ( 80,  80,  80)
GREEN      = ( 52, 199, 120)
RED_C      = (239,  68,  68)
BLUE       = ( 80, 200, 255)
FACE       = ( 17,  17,  17)

OUT7  = r"C:\Users\eyalt\Desktop\tablet7-screenshot.png"
OUT10 = r"C:\Users\eyalt\Desktop\tablet10-screenshot.png"


# ── helpers ──────────────────────────────────────────────────────────────────
def fnt(size, bold=False):
    pool_b = ["C:/Windows/Fonts/arialbd.ttf","C:/Windows/Fonts/calibrib.ttf",
              "C:/Windows/Fonts/segoeuib.ttf","C:/Windows/Fonts/trebucbd.ttf"]
    pool_r = ["C:/Windows/Fonts/arial.ttf","C:/Windows/Fonts/calibri.ttf",
              "C:/Windows/Fonts/segoeui.ttf","C:/Windows/Fonts/trebuc.ttf"]
    for p in (pool_b if bold else pool_r):
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: pass
    return ImageFont.load_default()

def tw(d, txt, f):
    bb = d.textbbox((0,0), txt, font=f)
    return bb[2] - bb[0]

def th(d, txt, f):
    bb = d.textbbox((0,0), txt, font=f)
    return bb[3] - bb[1]

def centered(d, y, txt, f, col, img_w=1200):
    w2 = tw(d, txt, f)
    d.text(((img_w - w2)//2, y), txt, font=f, fill=col)

def rr(d, x0,y0,x1,y1, r, fill=None, outline=None, ow=2):
    if x1 <= x0 or y1 <= y0: return
    d.rounded_rectangle([x0,y0,x1,y1], radius=r,
                         fill=fill, outline=outline, width=ow)

def status_bar(d, W, bar_h=88):
    d.rectangle([0,0,W,bar_h], fill=(*BG,255))
    d.text((70, 24), "9:41", font=fnt(36,True), fill=(*WHITE,220))
    bx = W-140
    d.rounded_rectangle([bx,26,bx+68,26+34], radius=6, outline=(*WHITE,180), width=3)
    d.rectangle([bx+68,26+9,bx+76,26+25], fill=(*WHITE,180))
    d.rounded_rectangle([bx+4,30,bx+64,56], radius=3, fill=(*WHITE,180))
    d.text((bx-130, 28), "WiFi", font=fnt(30), fill=(*WHITE,160))
    return bar_h

def bottom_nav(d, W, H, active=0):
    ny = H - 180
    d.rectangle([0,ny,W,H], fill=(*CARD,255))
    d.line([(0,ny),(W,ny)], fill=(*GRAY2,80), width=1)
    tabs = [("Home","⌂"),("Scan","◉"),("Collection","☰")]
    tabw = W//3
    for i,(label,icon) in enumerate(tabs):
        cx = i*tabw + tabw//2
        is_a = (i==active)
        col = GOLD if is_a else GRAY
        if i == 1:
            r2 = 46
            d.ellipse([cx-r2,ny+16,cx+r2,ny+16+r2*2],
                       fill=GOLD if is_a else CARD2,
                       outline=(*GOLD,150) if not is_a else None)
            d.text((cx-15,ny+25), icon, font=fnt(42,True),
                    fill=(*BG,255) if is_a else (*GOLD,200))
        else:
            d.text((cx-18,ny+20), icon, font=fnt(48), fill=(*col,255))
        lf2 = fnt(32, bold=is_a)
        lw2 = tw(d,label,lf2)
        d.text((cx-lw2//2, ny+100), label, font=lf2, fill=(*col,255))
    d.rounded_rectangle([W//2-80,H-26,W//2+80,H-10], radius=7, fill=(*WHITE,60))


def draw_watch(img, cx, cy, radius, scan=True):
    SC2 = 4
    WW  = radius*2*SC2
    wi  = Image.new("RGBA",(WW,WW),(0,0,0,0))
    wd  = ImageDraw.Draw(wi,"RGBA")
    wcx = wcy = WW//2
    Ro  = int(WW*0.480)
    Ri  = int(WW*0.390)

    for r2 in range(Ro+30,Ro-10,-3):
        a2=int(40*(1-(r2-Ro+10)/40))
        wd.ellipse([wcx-r2,wcy-r2,wcx+r2,wcy+r2],fill=(*GOLD,max(0,a2)))
    wd.ellipse([wcx-Ro,wcy-Ro,wcx+Ro,wcy+Ro],fill=GOLD)
    wd.arc([wcx-Ro+4,wcy-Ro+4,wcx+Ro-4,wcy+Ro-4],
           start=-150,end=-20,fill=GOLD_LIGHT,width=int(WW*0.014))
    wd.ellipse([wcx-Ri,wcy-Ri,wcx+Ri,wcy+Ri],fill=FACE)

    for i in range(12):
        a3=math.radians(i*30-90)
        main=(i%3==0)
        r1=int(WW*(0.295 if main else 0.312))
        r2b=int(WW*0.355)
        mw2=int(WW*(0.022 if main else 0.013))
        x1=wcx+r1*math.cos(a3); y1=wcy+r1*math.sin(a3)
        x2=wcx+r2b*math.cos(a3); y2=wcy+r2b*math.sin(a3)
        wd.line([x1,y1,x2,y2],fill=GOLD_LIGHT if main else GOLD,width=mw2)

    for i in range(60):
        if i%5==0: continue
        a4=math.radians(i*6-90)
        rd=int(WW*0.336); ddr=int(WW*0.007)
        xd=wcx+rd*math.cos(a4); yd=wcy+rd*math.sin(a4)
        wd.ellipse([xd-ddr,yd-ddr,xd+ddr,yd+ddr],fill=(*GOLD,90))

    def hand(ang,length,width,col,tail=0):
        a5=math.radians(ang-90)
        x1h=wcx-tail*math.cos(a5); y1h=wcy-tail*math.sin(a5)
        x2h=wcx+length*math.cos(a5); y2h=wcy+length*math.sin(a5)
        wd.line([x1h,y1h,x2h,y2h],fill=col,width=width)
        crh=width//2
        for pxh,pyh in [(x1h,y1h),(x2h,y2h)]:
            wd.ellipse([pxh-crh,pyh-crh,pxh+crh,pyh+crh],fill=col)

    hw2=int(WW*0.026)
    hand(300,int(WW*0.22),hw2+int(WW*0.010),GOLD_LIGHT,int(WW*0.04))
    hand( 62,int(WW*0.29),hw2,              GOLD_LIGHT,int(WW*0.05))
    hand(180,int(WW*0.31),int(WW*0.012),   RED_C,      int(WW*0.07))

    pip2=int(WW*0.025)
    wd.ellipse([wcx-pip2,wcy-pip2,wcx+pip2,wcy+pip2],fill=GOLD)
    wd.ellipse([wcx-pip2//2,wcy-pip2//2,wcx+pip2//2,wcy+pip2//2],fill=GOLD_LIGHT)

    if scan:
        sl=Image.new("RGBA",(WW,WW),(0,0,0,0))
        sd=ImageDraw.Draw(sl,"RGBA")
        for off,alp in [(-0.07,70),(0.02,110),(0.11,55)]:
            ys2=int(wcy+off*WW); dy2=abs(ys2-wcy)
            if dy2>=Ri: continue
            hws=int(math.sqrt(Ri**2-dy2**2)); lws=int(WW*0.009)
            sd.line([(wcx-hws+int(WW*0.02),ys2),(wcx+hws-int(WW*0.02),ys2)],
                    fill=(*BLUE,alp),width=lws)
        bkx3=wcx+int(WW*0.19); bky3=wcy-int(WW*0.19)
        bk3=int(WW*0.055); bw3=int(WW*0.017)
        sd.line([(bkx3-bk3,bky3),(bkx3,bky3)],fill=(*BLUE,200),width=bw3)
        sd.line([(bkx3,bky3),(bkx3,bky3+bk3)],fill=(*BLUE,200),width=bw3)
        bkx4=wcx-int(WW*0.19); bky4=wcy+int(WW*0.19)
        sd.line([(bkx4+bk3,bky4),(bkx4,bky4)],fill=(*BLUE,160),width=bw3)
        sd.line([(bkx4,bky4),(bkx4,bky4-bk3)],fill=(*BLUE,160),width=bw3)
        sl=sl.filter(ImageFilter.GaussianBlur(radius=WW*0.006))
        wi=Image.alpha_composite(wi,sl)

    ws=wi.resize((radius*2,radius*2),Image.LANCZOS)
    img.paste(ws,(cx-radius,cy-radius),ws)


# ─────────────────────────────────────────────────────────────────────────────
#  TABLET 7-inch  1200 x 1920  —  Home screen, wider layout
# ─────────────────────────────────────────────────────────────────────────────
def make_tablet7():
    W, H = 1200, 1920
    img = Image.new("RGBA",(W,H),(*BG,255))
    d   = ImageDraw.Draw(img,"RGBA")

    # bg glow
    for r2 in range(560,60,-4):
        a2=int(28*(1-(r2-60)/500))
        d.ellipse([W//2-r2,300-r2,W//2+r2,300+r2],fill=(*GOLD,max(0,a2)))
    b=img.filter(ImageFilter.GaussianBlur(radius=70))
    img.paste(b,(0,0))
    d=ImageDraw.Draw(img,"RGBA")

    sb = status_bar(d, W)

    # top nav
    nav_h=100; nav_y=sb
    d.rectangle([0,nav_y,W,nav_y+nav_h],fill=(*BG,240))
    d.line([(0,nav_y+nav_h),(W,nav_y+nav_h)],fill=(*GRAY2,60),width=1)
    lf2=fnt(50,True)
    lx=(W-tw(d,"WatchSnap",lf2))//2
    d.text((lx,nav_y+24),"Watch",font=lf2,fill=GOLD_LIGHT)
    d.text((lx+tw(d,"Watch",lf2),nav_y+24),"Snap",font=lf2,fill=GOLD)
    d.text((W-100,nav_y+24),"♛",font=fnt(50),fill=(*GOLD,200))
    y = nav_y+nav_h

    # watch — slightly larger on tablet
    draw_watch(img, W//2, y+380, 320, scan=True)
    d=ImageDraw.Draw(img,"RGBA")

    # headline
    hy = y+780
    centered(d, hy,      "AI Watch",        fnt(96,True), WHITE,   W)
    centered(d, hy+114,  "Authentication",  fnt(96,True), GOLD,    W)
    centered(d, hy+248,  "Identify · Authenticate · Value", fnt(48), GRAY, W)

    # pills — wider tablet can fit them all in one row more comfortably
    pills=[("30-Point AI Check",GREEN),("Instant Results",BLUE),("Market Value",GOLD)]
    pf=fnt(38,True); pill_y=hy+340
    total=sum(tw(d,p,pf)+70 for p,_ in pills)+60
    px=(W-total)//2
    for label,col in pills:
        pw2=tw(d,label,pf)+70; ph2=72
        rr(d,px,pill_y,px+pw2,pill_y+ph2,36,fill=(*col,25),outline=(*col,130))
        d.text((px+35,pill_y+16),label,font=pf,fill=col)
        px+=pw2+30

    # CTA button
    btn_y = pill_y+140
    bx0=W//2-300; bx1=W//2+300; bh2=148; br=74
    for i in range(22,0,-1):
        rr(d,bx0-i,btn_y+i,bx1+i,btn_y+bh2+i,br+i,fill=(*GOLD_DARK,int(5*(22-i)/22)))
    rr(d,bx0,btn_y,bx1,btn_y+bh2,br,fill=GOLD)
    rr(d,bx0+6,btn_y+6,bx1-6,btn_y+bh2//2,br-4,fill=(*GOLD_LIGHT,40))
    bt="Scan a Watch"; btf=fnt(58,True)
    btw2=tw(d,bt,btf)
    d.text(((W-btw2)//2,btn_y+44),bt,font=btf,fill=BG)

    # how-it-works: 3 cards wider
    steps=[("1","Take a Photo","Snap the watch dial clearly"),
           ("2","AI Analysis","30-point authentication"),
           ("3","Get Results","Value & authenticity report")]
    card_y=btn_y+bh2+90
    cw=320; ch=220; gap=(W-3*cw)//4
    for i,(num,title,desc) in enumerate(steps):
        cx2=gap+i*(cw+gap)
        rr(d,cx2,card_y,cx2+cw,card_y+ch,28,fill=(*CARD,255),outline=(*GOLD,45))
        nf=fnt(58,True); nw=tw(d,num,nf)
        d.text((cx2+(cw-nw)//2,card_y+16),num,font=nf,fill=(*GOLD,180))
        tf2=fnt(36,True); ttw=tw(d,title,tf2)
        d.text((cx2+(cw-ttw)//2,card_y+84),title,font=tf2,fill=GOLD_LIGHT)
        df2=fnt(30); dw2=tw(d,desc,df2)
        if dw2>cw-20:
            words2=desc.split(); line2=""; lines3=[]
            for ww2 in words2:
                test2=line2+(" " if line2 else "")+ww2
                if tw(d,test2,df2)>cw-20: lines3.append(line2); line2=ww2
                else: line2=test2
            if line2: lines3.append(line2)
            for li2,ln2 in enumerate(lines3):
                lw4=tw(d,ln2,df2)
                d.text((cx2+(cw-lw4)//2,card_y+136+li2*38),ln2,font=df2,fill=GRAY)
        else:
            d.text((cx2+(cw-dw2)//2,card_y+136),desc,font=df2,fill=GRAY)

    # feature row  (tablet extra space)
    feat_y = card_y + ch + 70
    feats=[("✓","Luxury Watch Database","10,000+ references"),
           ("✓","Real-Time Valuation","Live market data"),
           ("✓","Expert AI Model","Claude Vision API")]
    fw2=(W-80)//3; fpad=26
    for i,(chk,ftitle,fsub) in enumerate(feats):
        fx=40+i*(fw2+20)
        rr(d,fx,feat_y,fx+fw2,feat_y+160,24,fill=(*CARD,255),outline=(*GOLD,30))
        d.text((fx+fpad,feat_y+22),chk,font=fnt(44,True),fill=(*GREEN,220))
        d.text((fx+fpad+54,feat_y+24),ftitle,font=fnt(36,True),fill=GOLD_LIGHT)
        d.text((fx+fpad+54,feat_y+76),fsub,font=fnt(30),fill=GRAY)

    bottom_nav(d, W, H, active=0)
    img.convert("RGB").save(OUT7,"PNG",optimize=True)
    print(f"Saved: {OUT7}  ({os.path.getsize(OUT7)//1024} KB)")


# ─────────────────────────────────────────────────────────────────────────────
#  TABLET 10-inch  1600 x 2560  —  Results, split two-column layout
# ─────────────────────────────────────────────────────────────────────────────
def make_tablet10():
    W, H = 1600, 2560
    img = Image.new("RGBA",(W,H),(*BG,255))
    d   = ImageDraw.Draw(img,"RGBA")

    # bg glow
    for r2 in range(600,60,-4):
        a2=int(22*(1-(r2-60)/540))
        d.ellipse([W//2-r2,700-r2,W//2+r2,700+r2],fill=(*GOLD,max(0,a2)))
    b=img.filter(ImageFilter.GaussianBlur(radius=70))
    img.paste(b,(0,0))
    d=ImageDraw.Draw(img,"RGBA")

    sb = status_bar(d, W, bar_h=100)

    # top nav
    nav_h=110; nav_y=sb
    d.rectangle([0,nav_y,W,nav_y+nav_h],fill=(*BG,240))
    d.line([(0,nav_y+nav_h),(W,nav_y+nav_h)],fill=(*GRAY2,60),width=1)
    lf3=fnt(60,True)
    lx=(W-tw(d,"WatchSnap",lf3))//2
    d.text((lx,nav_y+26),"Watch",font=lf3,fill=GOLD_LIGHT)
    d.text((lx+tw(d,"Watch",lf3),nav_y+26),"Snap",font=lf3,fill=GOLD)
    d.text((W-120,nav_y+26),"♛",font=fnt(60),fill=(*GOLD,200))
    y = nav_y+nav_h

    pad = 50
    col_gap = 60
    left_w  = int(W*0.44)          # left column: watch image
    right_x = pad + left_w + col_gap
    right_w = W - right_x - pad

    # ── LEFT COLUMN: watch card ──────────────────────────────────────────
    watch_card_h = 900
    rr(d, pad, y+40, pad+left_w, y+40+watch_card_h, 40,
       fill=(*CARD,255), outline=(*GOLD,50))
    draw_watch(img, pad+left_w//2, y+40+watch_card_h//2-20, 310, scan=True)
    d=ImageDraw.Draw(img,"RGBA")

    d.text((pad+36,y+56),"Rolex",font=fnt(48,True),fill=(*GOLD,230))
    d.text((pad+36,y+114),"Submariner Date",font=fnt(40),fill=(*WHITE,170))
    d.text((pad+36,y+166),"Ref. 116610LN",font=fnt(34),fill=(*GRAY,160))

    # scan label
    sl_y=y+40+watch_card_h-80
    d.text((pad+36,sl_y),"AI Scan Complete",font=fnt(34,True),fill=(*BLUE,200))
    for xi in range(pad+36, pad+left_w-36, 18):
        col_a=int(100*math.sin((xi-pad-36)/(left_w-72)*math.pi))
        d.line([(xi,sl_y+46),(xi+10,sl_y+46)],fill=(*BLUE,col_a),width=3)

    # ── RIGHT COLUMN: all detail cards ───────────────────────────────────
    rx = right_x; rw = right_w; cr2 = 36
    cur_y = y+40

    # auth badge
    auth_h = 160
    rr(d,rx,cur_y,rx+rw,cur_y+auth_h,cr2,fill=(34,120,60,45),outline=(*GREEN,130),ow=3)
    d.ellipse([rx+40,cur_y+58,rx+74,cur_y+92],fill=(*GREEN,255))
    for rrr in [18,30]:
        d.ellipse([rx+57-rrr,cur_y+75-rrr,rx+57+rrr,cur_y+75+rrr],outline=(*GREEN,55),width=2)
    d.text((rx+96,cur_y+22),"Likely Authentic",font=fnt(62,True),fill=GREEN)
    d.text((rx+96,cur_y+96),"Passed 30-point AI authentication check",font=fnt(36),fill=(*GREEN,170))
    cur_y += auth_h + 30

    # market value
    val_h = 200
    rr(d,rx,cur_y,rx+rw,cur_y+val_h,cr2,fill=(*CARD,255),outline=(*GOLD,60))
    d.text((rx+40,cur_y+28),"Market Value",font=fnt(38),fill=GOLD)
    d.text((rx+40,cur_y+82),"$8,500 – $11,200",font=fnt(90,True),fill=WHITE)
    d.text((rx+rw-220,cur_y+36),"Rising",font=fnt(42,True),fill=GREEN)
    d.text((rx+rw-246,cur_y+36),"↑",font=fnt(42,True),fill=GREEN)
    d.text((rx+40,cur_y+160),"USD  ·  Secondary market estimate",font=fnt(32),fill=GRAY)
    cur_y += val_h + 30

    # confidence bar
    conf_h = 170
    rr(d,rx,cur_y,rx+rw,cur_y+conf_h,cr2,fill=(*CARD,255),outline=(*GRAY2,60))
    d.text((rx+40,cur_y+26),"AI Confidence Score",font=fnt(40),fill=GRAY)
    d.text((rx+rw-140,cur_y+22),"94%",font=fnt(54,True),fill=GREEN)
    bx5=rx+40; by5=cur_y+88; bw5=rw-80; bh5=30
    rr(d,bx5,by5,bx5+bw5,by5+bh5,15,fill=(*GRAY2,80))
    fw=int(bw5*0.94)
    for i2 in range(fw):
        fr=i2/bw5
        rcc=int(52+fr*30); gcc=int(199-fr*20)
        d.line([(bx5+i2,by5),(bx5+i2,by5+bh5)],fill=(rcc,gcc,80,230),width=1)
    rr(d,bx5,by5,bx5+fw,by5+bh5,15,outline=(*GREEN,60))
    for rrr2 in range(16,0,-1):
        d.ellipse([bx5+fw-rrr2,by5+bh5//2-rrr2,bx5+fw+rrr2,by5+bh5//2+rrr2],
                   fill=(*GREEN,int(35*rrr2/16)))
    cur_y += conf_h + 30

    # specs: 3 cards in row
    specs=[("Production","1953 – Present"),("Movement","Automatic"),("Reference","116610LN")]
    sw2=(rw-50)//3
    for i3,(lbl,val) in enumerate(specs):
        sx=rx+i3*(sw2+25)
        rr(d,sx,cur_y,sx+sw2,cur_y+190,28,fill=(*CARD,255),outline=(*GRAY2,55))
        d.text((sx+18,cur_y+20),lbl,font=fnt(32,True),fill=(*GRAY,200))
        d.line([(sx+18,cur_y+68),(sx+sw2-18,cur_y+68)],fill=(*GOLD,50),width=1)
        d.text((sx+18,cur_y+82),val,font=fnt(40,True),fill=WHITE)
    cur_y += 190+30

    # save button
    rr(d,rx,cur_y,rx+rw,cur_y+140,70,fill=GOLD)
    rr(d,rx+5,cur_y+5,rx+rw-5,cur_y+64,65,fill=(*GOLD_LIGHT,50))
    bt2="+ Save to Collection"; bf3=fnt(56,True)
    btw3=tw(d,bt2,bf3)
    d.text((rx+(rw-btw3)//2,cur_y+42),bt2,font=bf3,fill=BG)
    cur_y += 140+30

    # extra: similar watches row (tablet bonus space)
    similar_y = cur_y
    d.text((rx,similar_y),"Similar Models",font=fnt(40,True),fill=GRAY)
    similar_y += 56
    sm_items=[("Submariner\nNo Date","$7,200–$9,800"),
              ("Sea-Dweller\n126600","$11,000–$14,500"),
              ("GMT Master II\n126710BLNR","$13,500–$17,000")]
    sw3=(rw-50)//3
    for i4,(model,price) in enumerate(sm_items):
        sx2=rx+i4*(sw3+25)
        rr(d,sx2,similar_y,sx2+sw3,similar_y+180,24,fill=(*CARD,255),outline=(*GOLD,35))
        lines4=model.split("\n")
        for li4,ln4 in enumerate(lines4):
            d.text((sx2+16,similar_y+16+li4*44),ln4,font=fnt(34,True),fill=WHITE)
        d.text((sx2+16,similar_y+120),price,font=fnt(30),fill=(*GOLD,180))

    bottom_nav(d, W, H, active=1)
    img.convert("RGB").save(OUT10,"PNG",optimize=True)
    print(f"Saved: {OUT10}  ({os.path.getsize(OUT10)//1024} KB)")


make_tablet7()
make_tablet10()
print("Done!")
