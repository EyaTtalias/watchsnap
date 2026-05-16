"""
WatchSnap - Google Play Store Screenshots (1080 x 1920 px each)
Screenshot 1: Home / landing screen
Screenshot 2: Scan results screen
"""

import math, os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920

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

OUT1 = r"C:\Users\eyalt\Desktop\screenshot1.png"
OUT2 = r"C:\Users\eyalt\Desktop\screenshot2.png"


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
    return bb[2]-bb[0]


def centered(d, y, txt, f, col):
    w2 = tw(d, txt, f)
    d.text(((W-w2)//2, y), txt, font=f, fill=col)


def rr(d, x0,y0,x1,y1, r, fill=None, outline=None, ow=2):
    d.rounded_rectangle([x0,y0,x1,y1], radius=r, fill=fill,
                         outline=outline, width=ow)


def status_bar(d):
    d.rectangle([0,0,W,80], fill=(*BG,255))
    d.text((60,22), "9:41", font=fnt(34,True), fill=(*WHITE,220))
    bx,by = W-130,24
    d.rounded_rectangle([bx,by,bx+66,by+32], radius=6, outline=(*WHITE,180), width=3)
    d.rectangle([bx+66,by+8,bx+73,by+24], fill=(*WHITE,180))
    d.rounded_rectangle([bx+4,by+4,bx+62,by+28], radius=3, fill=(*WHITE,180))
    d.text((bx-120,by-2), "WiFi", font=fnt(28), fill=(*WHITE,160))
    return 80


def bottom_nav(d, active=0):
    ny = H-160
    d.rectangle([0,ny,W,H], fill=(*CARD,255))
    d.line([(0,ny),(W,ny)], fill=(*GRAY2,80), width=1)
    tabs = [("Home","⌂"),("Scan","◉"),("Collection","☰")]
    tabw = W//3
    for i,(label,icon) in enumerate(tabs):
        cx = i*tabw + tabw//2
        is_a = (i==active)
        col = GOLD if is_a else GRAY
        if i==1:
            r2=42
            d.ellipse([cx-r2,ny+14,cx+r2,ny+14+r2*2],
                       fill=GOLD if is_a else CARD2,
                       outline=(*GOLD,150) if not is_a else None)
            d.text((cx-14,ny+22), icon, font=fnt(40,True),
                    fill=(*BG,255) if is_a else (*GOLD,200))
        else:
            d.text((cx-16,ny+18), icon, font=fnt(44), fill=(*col,255))
        lf2 = fnt(30, bold=is_a)
        lw2 = tw(d,label,lf2)
        d.text((cx-lw2//2, ny+85), label, font=lf2, fill=(*col,255))
    d.rounded_rectangle([W//2-70,H-24,W//2+70,H-10], radius=6, fill=(*WHITE,60))


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
        bkx3,bky3=wcx+int(WW*0.19),wcy-int(WW*0.19)
        bk3,bw3=int(WW*0.055),int(WW*0.017)
        sd.line([(bkx3-bk3,bky3),(bkx3,bky3)],fill=(*BLUE,200),width=bw3)
        sd.line([(bkx3,bky3),(bkx3,bky3+bk3)],fill=(*BLUE,200),width=bw3)
        bkx4,bky4=wcx-int(WW*0.19),wcy+int(WW*0.19)
        sd.line([(bkx4+bk3,bky4),(bkx4,bky4)],fill=(*BLUE,160),width=bw3)
        sd.line([(bkx4,bky4),(bkx4,bky4-bk3)],fill=(*BLUE,160),width=bw3)
        sl=sl.filter(ImageFilter.GaussianBlur(radius=WW*0.006))
        wi=Image.alpha_composite(wi,sl)

    ws=wi.resize((radius*2,radius*2),Image.LANCZOS)
    img.paste(ws,(cx-radius,cy-radius),ws)


# ─────────────────────────────────────────────────────────────────────────────
def make_s1():
    img=Image.new("RGBA",(W,H),(*BG,255))
    d=ImageDraw.Draw(img,"RGBA")

    for r2 in range(500,50,-4):
        a2=int(30*(1-(r2-50)/450))
        d.ellipse([W//2-r2,260-r2,W//2+r2,260+r2],fill=(*GOLD,max(0,a2)))
    b=img.filter(ImageFilter.GaussianBlur(radius=60))
    img.paste(b,(0,0))
    d=ImageDraw.Draw(img,"RGBA")

    sb=status_bar(d)

    nav_h=90; nav_y=sb
    d.rectangle([0,nav_y,W,nav_y+nav_h],fill=(*BG,240))
    d.line([(0,nav_y+nav_h),(W,nav_y+nav_h)],fill=(*GRAY2,60),width=1)
    lf2=fnt(44,True)
    lx=(W-tw(d,"WatchSnap",lf2))//2
    d.text((lx,nav_y+22),"Watch",font=lf2,fill=GOLD_LIGHT)
    d.text((lx+tw(d,"Watch",lf2),nav_y+22),"Snap",font=lf2,fill=GOLD)
    d.text((W-90,nav_y+22),"♛",font=fnt(44),fill=(*GOLD,200))
    y=nav_y+nav_h

    draw_watch(img,W//2,y+340,285,scan=True)
    d=ImageDraw.Draw(img,"RGBA")

    hy=y+700
    centered(d,hy,"AI Watch",fnt(88,True),WHITE)
    centered(d,hy+100,"Authentication",fnt(88,True),GOLD)
    centered(d,hy+220,"Identify · Authenticate · Value",fnt(42),GRAY)

    pills=[("30-Point AI Check",GREEN),("Instant Results",BLUE),("Market Value",GOLD)]
    pf=fnt(34,True); pill_y=hy+320
    total=sum(tw(d,p,pf)+60 for p,_ in pills)+40
    px=(W-total)//2
    for label,col in pills:
        pw2=tw(d,label,pf)+60; ph2=64
        rr(d,px,pill_y,px+pw2,pill_y+ph2,32,fill=(*col,25),outline=(*col,120))
        d.text((px+30,pill_y+14),label,font=pf,fill=col)
        px+=pw2+20

    btn_y=pill_y+130
    bx0=W//2-260; bx1=W//2+260; bh2=136; br=68
    for i in range(20,0,-1):
        rr(d,bx0-i,btn_y+i,bx1+i,btn_y+bh2+i,br+i,fill=(*GOLD_DARK,int(6*(20-i)/20)))
    rr(d,bx0,btn_y,bx1,btn_y+bh2,br,fill=GOLD)
    rr(d,bx0+6,btn_y+6,bx1-6,btn_y+bh2//2,br-4,fill=(*GOLD_LIGHT,40))
    bt="Scan a Watch"
    btf=fnt(52,True); btw2=tw(d,bt,btf)
    d.text(((W-btw2)//2,btn_y+42),bt,font=btf,fill=BG)

    steps=[("Take a Photo","Snap the watch dial"),
           ("AI Analysis","30-point auth check"),
           ("Get Results","Value & verdict")]
    card_y=btn_y+bh2+80
    cw=300; ch=200; gap=(W-3*cw)//4
    for i,(title,desc) in enumerate(steps):
        cx2=gap+i*(cw+gap)
        nums=["1","2","3"]
        rr(d,cx2,card_y,cx2+cw,card_y+ch,24,fill=(*CARD,255),outline=(*GOLD,40))
        nf=fnt(52,True)
        nw=tw(d,nums[i],nf)
        d.text((cx2+(cw-nw)//2,card_y+14),nums[i],font=nf,fill=(*GOLD,180))
        tf2=fnt(34,True)
        ttw=tw(d,title,tf2)
        d.text((cx2+(cw-ttw)//2,card_y+80),title,font=tf2,fill=GOLD_LIGHT)
        df2=fnt(28); dw=tw(d,desc,df2)
        if dw>cw-16:
            words2=desc.split(); line2=""; lines3=[]
            for ww2 in words2:
                test2=line2+(" " if line2 else "")+ww2
                if tw(d,test2,df2)>cw-16: lines3.append(line2); line2=ww2
                else: line2=test2
            if line2: lines3.append(line2)
            for li2,ln2 in enumerate(lines3):
                lw4=tw(d,ln2,df2)
                d.text((cx2+(cw-lw4)//2,card_y+128+li2*34),ln2,font=df2,fill=GRAY)
        else:
            d.text((cx2+(cw-dw)//2,card_y+128),desc,font=df2,fill=GRAY)

    bottom_nav(d,active=0)
    img.convert("RGB").save(OUT1,"PNG",optimize=True)
    print(f"Saved: {OUT1}  ({os.path.getsize(OUT1)//1024} KB)")


# ─────────────────────────────────────────────────────────────────────────────
def make_s2():
    img=Image.new("RGBA",(W,H),(*BG,255))
    d=ImageDraw.Draw(img,"RGBA")

    for r2 in range(400,50,-4):
        a2=int(18*(1-(r2-50)/350))
        d.ellipse([W//2-r2,480-r2,W//2+r2,480+r2],fill=(*GOLD,max(0,a2)))
    b=img.filter(ImageFilter.GaussianBlur(radius=50))
    img.paste(b,(0,0))
    d=ImageDraw.Draw(img,"RGBA")

    sb=status_bar(d)
    y=sb

    nav_h=90
    d.rectangle([0,y,W,y+nav_h],fill=(*BG,240))
    d.line([(0,y+nav_h),(W,y+nav_h)],fill=(*GRAY2,60),width=1)
    d.text((40,y+22),"<",font=fnt(52),fill=(*WHITE,200))
    ttl="Scan Result"; tf3=fnt(44,True)
    d.text(((W-tw(d,ttl,tf3))//2,y+24),ttl,font=tf3,fill=WHITE)
    d.text((W-90,y+24),"♡",font=fnt(48),fill=(*GOLD,200))
    y+=nav_h

    pad=40; cr2=32
    ics_h=520
    rr(d,pad,y+20,W-pad,y+20+ics_h,cr2,fill=(*CARD,255),outline=(*GOLD,40))
    draw_watch(img,W//2,y+20+ics_h//2,205,scan=True)
    d=ImageDraw.Draw(img,"RGBA")
    d.text((pad+30,y+30),"Rolex",font=fnt(38,True),fill=(*GOLD,220))
    d.text((pad+30,y+76),"Submariner Date",font=fnt(34),fill=(*WHITE,160))
    d.text((W-pad-220,y+30),"Ref. 116610LN",font=fnt(30),fill=(*GRAY,180))
    y+=20+ics_h+28

    bh3=130
    rr(d,pad,y,W-pad,y+bh3,cr2,fill=(34,120,60,45),outline=(*GREEN,130),ow=2)
    d.ellipse([pad+36,y+46,pad+62,y+72],fill=(*GREEN,255))
    for rrr in [16,26]:
        d.ellipse([pad+49-rrr,y+59-rrr,pad+49+rrr,y+59+rrr],outline=(*GREEN,55),width=2)
    d.text((pad+88,y+20),"Likely Authentic",font=fnt(52,True),fill=GREEN)
    d.text((pad+88,y+80),"Passed 30-point AI authentication check",font=fnt(30),fill=(*GREEN,160))
    y+=bh3+22

    vh=160
    rr(d,pad,y,W-pad,y+vh,cr2,fill=(*CARD,255),outline=(*GOLD,50))
    d.text((pad+36,y+22),"Market Value",font=fnt(32),fill=GOLD)
    d.text((pad+36,y+66),"$8,500 – $11,200",font=fnt(74,True),fill=WHITE)
    d.text((W-pad-180,y+28),"Rising",font=fnt(36,True),fill=GREEN)
    d.text((W-pad-196,y+28),"↑",font=fnt(36,True),fill=GREEN)
    d.text((pad+36,y+128),"USD  ·  Secondary market estimate",font=fnt(28),fill=GRAY)
    y+=vh+22

    conf_h=140
    rr(d,pad,y,W-pad,y+conf_h,cr2,fill=(*CARD,255),outline=(*GRAY2,60))
    d.text((pad+36,y+22),"AI Confidence Score",font=fnt(34),fill=GRAY)
    d.text((W-pad-120,y+18),"94%",font=fnt(44,True),fill=GREEN)
    bx5=pad+36; by5=y+76; bw5=W-pad*2-72; bh5=24
    rr(d,bx5,by5,bx5+bw5,by5+bh5,12,fill=(*GRAY2,80))
    fw=int(bw5*0.94)
    for i2 in range(fw):
        fr=i2/bw5
        rcc=int(52+fr*30); gcc=int(199-fr*20)
        d.line([(bx5+i2,by5),(bx5+i2,by5+bh5)],fill=(rcc,gcc,80,230),width=1)
    rr(d,bx5,by5,bx5+fw,by5+bh5,12,outline=(*GREEN,60))
    for rrr2 in range(14,0,-1):
        d.ellipse([bx5+fw-rrr2,by5+bh5//2-rrr2,bx5+fw+rrr2,by5+bh5//2+rrr2],
                   fill=(*GREEN,int(35*rrr2/14)))
    y+=conf_h+22

    specs=[("Production","1953 – Present"),("Movement","Automatic"),("Reference","116610LN")]
    sw2=(W-pad*2-48)//3
    for i3,(lbl,val) in enumerate(specs):
        sx=pad+i3*(sw2+24)
        rr(d,sx,y,sx+sw2,y+160,24,fill=(*CARD,255),outline=(*GRAY2,50))
        lbf=fnt(28,True); vf2=fnt(32,True)
        d.text((sx+16,y+18),lbl,font=lbf,fill=(*GRAY,200))
        d.text((sx+16,y+64),val,font=vf2,fill=WHITE)
        d.line([(sx+16,y+58),(sx+sw2-16,y+58)],fill=(*GOLD,40),width=1)
    y+=160+24

    btn_y3=y+10
    bx02=pad; bx12=W-pad
    rr(d,bx02,btn_y3,bx12,btn_y3+120,60,fill=GOLD)
    rr(d,bx02+4,btn_y3+4,bx12-4,btn_y3+56,56,fill=(*GOLD_LIGHT,50))
    bt2="+ Save to Collection"; bf3=fnt(48,True)
    btw3=tw(d,bt2,bf3)
    d.text(((W-btw3)//2,btn_y3+34),bt2,font=bf3,fill=BG)

    bottom_nav(d,active=1)
    img.convert("RGB").save(OUT2,"PNG",optimize=True)
    print(f"Saved: {OUT2}  ({os.path.getsize(OUT2)//1024} KB)")


make_s1()
make_s2()
print("Done!")
