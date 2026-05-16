"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X, ImagePlus, Zap, ZapOff, Grid3X3 } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose:   () => void;
}

const RING = 260;

/* ─────────────────────────────────────────────────────────────────
   Extended types — torch & focusMode are not in lib.dom.d.ts yet
───────────────────────────────────────────────────────────────── */
interface ExtCapabilities extends MediaTrackCapabilities {
  torch?:     boolean;
  focusMode?: string[];
}
interface ExtConstraintSet extends MediaTrackConstraintSet {
  torch?:     boolean;
  focusMode?: ConstrainDOMString;
}

/* ─────────────────────────────────────────────────────────────────
   Resize blob to maxDim × maxDim (keeping aspect ratio), JPEG 0.95
───────────────────────────────────────────────────────────────── */
async function resizeBlob(blob: Blob, maxDim: number): Promise<Blob> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale   = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w       = Math.round(img.width  * scale);
      const h       = Math.round(img.height * scale);
      const canvas  = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((b) => resolve(b ?? blob), "image/jpeg", 0.95);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
}

/* ─────────────────────────────────────────────────────────────────
   Megapixel label from pixel dimensions
───────────────────────────────────────────────────────────────── */
function mpLabel(w: number, h: number): string {
  if (!w || !h) return "";
  const mp = (w * h) / 1_000_000;
  return mp >= 1 ? `${mp.toFixed(0)}MP` : `${(mp * 1000).toFixed(0)}KP`;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const galleryRef  = useRef<HTMLInputElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const trackRef    = useRef<MediaStreamTrack | null>(null);

  const [videoVisible, setVideoVisible] = useState(false);
  const [ready,        setReady]        = useState(false);
  const [capturing,    setCapturing]    = useState(false);
  const [flash,        setFlash]        = useState(false);
  const [error,        setError]        = useState("");

  // Torch
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn,        setTorchOn]        = useState(false);

  // Grid overlay
  const [showGrid,  setShowGrid]  = useState(false);

  // Resolution
  const [resolution, setResolution] = useState("");

  // Autofocus animation — shows briefly while camera locks focus
  const [focusing, setFocusing] = useState(false);

  /* ─── Camera initialisation — 4K → 1080p → 720p fallback ─── */
  const startCamera = useCallback(async () => {
    const resolutions = [
      { width: { ideal: 4096 }, height: { ideal: 2160 } },
      { width: { ideal: 1920 }, height: { ideal: 1080 } },
      { width: { ideal: 1280 }, height: { ideal: 720  } },
    ];

    let stream: MediaStream | null = null;

    for (const res of resolutions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, ...res },
          audio: false,
        });
        break;
      } catch {
        // try next resolution
      }
    }

    if (!stream) {
      // Last-resort: no constraints
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err) {
        const msg = (err instanceof Error ? err.message : "").toLowerCase();
        if (msg.includes("permission") || msg.includes("denied") || msg.includes("notallowed")) {
          setError("Camera permission denied. Please allow camera access in your device settings.");
        } else if (msg.includes("notfound") || msg.includes("devices")) {
          setError("No camera found on this device.");
        } else {
          setError("Camera unavailable. Please choose a photo from your gallery.");
        }
        return;
      }
    }

    streamRef.current = stream;
    const track = stream.getVideoTracks()[0] as MediaStreamTrack;
    trackRef.current  = track;

    /* ── Apply continuous autofocus if supported ── */
    try {
      const caps = track.getCapabilities() as ExtCapabilities;
      if (caps.focusMode?.includes("continuous")) {
        await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as ExtConstraintSet] });
      }
      // Check torch support
      if (caps.torch !== undefined) setTorchSupported(true);
    } catch { /* older browsers — ignore */ }

    const vid = videoRef.current;
    if (!vid) return;
    vid.srcObject = stream;

    vid.oncanplay = () => {
      vid.play().catch(() => {});
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVideoVisible(true);
          setReady(true);

          // Show resolution badge
          setResolution(mpLabel(vid.videoWidth, vid.videoHeight));

          // Brief autofocus animation
          setFocusing(true);
          setTimeout(() => setFocusing(false), 1200);
        });
      });
    };

    if (vid.readyState >= 3) {
      vid.play().catch(() => {});
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVideoVisible(true);
          setReady(true);
          setResolution(mpLabel(vid.videoWidth, vid.videoHeight));
          setFocusing(true);
          setTimeout(() => setFocusing(false), 1200);
        });
      });
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  /* ─── Torch toggle ─── */
  const toggleTorch = useCallback(async () => {
    const track = trackRef.current;
    if (!track || !torchSupported) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as ExtConstraintSet] });
      setTorchOn(next);
    } catch { /* some devices fail silently */ }
  }, [torchOn, torchSupported]);

  /* ─── Capture at full resolution ─── */
  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !ready) return;
    setCapturing(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const vid    = videoRef.current;
    const canvas = canvasRef.current;

    // Full native resolution
    canvas.width  = vid.videoWidth  || 1920;
    canvas.height = vid.videoHeight || 1080;
    canvas.getContext("2d")!.drawImage(vid, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) { setCapturing(false); return; }

      // Resize if over 5MB to keep API transfer fast, but keep 2048px detail
      let finalBlob = blob;
      if (blob.size > 5 * 1024 * 1024) {
        finalBlob = await resizeBlob(blob, 2048);
      }

      streamRef.current?.getTracks().forEach((t) => t.stop());
      onCapture(new File([finalBlob], `watch-${Date.now()}.jpg`, { type: "image/jpeg" }));
      setCapturing(false);
    }, "image/jpeg", 0.95); // maximum quality
  }, [ready, onCapture]);

  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { streamRef.current?.getTracks().forEach((t) => t.stop()); onCapture(file); }
    e.target.value = "";
  };

  /* ─── Corner bracket helper ─── */
  function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
    const size = 22, thick = 3, color = "#C9A84C";
    const top  = pos === "tl" || pos === "tr";
    const left = pos === "tl" || pos === "bl";
    return (
      <div style={{
        position: "absolute",
        width: size, height: size,
        top:    top  ? -1 : undefined,
        bottom: !top ? -1 : undefined,
        left:   left  ? -1 : undefined,
        right:  !left ? -1 : undefined,
        borderTop:    top    ? `${thick}px solid ${color}` : undefined,
        borderBottom: !top   ? `${thick}px solid ${color}` : undefined,
        borderLeft:   left   ? `${thick}px solid ${color}` : undefined,
        borderRight:  !left  ? `${thick}px solid ${color}` : undefined,
        borderRadius: pos === "tl" ? "8px 0 0 0" : pos === "tr" ? "0 8px 0 0"
                    : pos === "bl" ? "0 0 0 8px"  : "0 0 8px 0",
      }} />
    );
  }

  return (
    <>
      {/* Shutter flash */}
      {flash && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 70,
          background: "white", pointerEvents: "none",
          animation: "camFlash 0.2s ease-out forwards",
        }} />
      )}

      <div style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "#000",
        display: "flex", flexDirection: "column",
        userSelect: "none",
        animation: "camEnter 0.18s ease-out both",
      }}>

        {/* ── Viewfinder ── */}
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>

          {/* Live video */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity:    videoVisible ? 1 : 0,
              transition: videoVisible ? "opacity 0.28s ease" : "none",
              willChange: "opacity",
            }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* ── Rule-of-thirds grid overlay ── */}
          {showGrid && (
            <div style={{
              position: "absolute", inset: 0,
              pointerEvents: "none",
              opacity: videoVisible ? 0.35 : 0,
              transition: "opacity 0.3s ease",
            }}>
              {/* Vertical lines */}
              {[33.33, 66.66].map((pct) => (
                <div key={`v${pct}`} style={{
                  position: "absolute",
                  top: 0, bottom: 0,
                  left: `${pct}%`,
                  width: 1,
                  background: "rgba(255,255,255,0.6)",
                }} />
              ))}
              {/* Horizontal lines */}
              {[33.33, 66.66].map((pct) => (
                <div key={`h${pct}`} style={{
                  position: "absolute",
                  left: 0, right: 0,
                  top: `${pct}%`,
                  height: 1,
                  background: "rgba(255,255,255,0.6)",
                }} />
              ))}
              {/* Intersection dots */}
              {[33.33, 66.66].flatMap((y) =>
                [33.33, 66.66].map((x) => (
                  <div key={`d${x}${y}`} style={{
                    position: "absolute",
                    left: `${x}%`, top: `${y}%`,
                    transform: "translate(-50%,-50%)",
                    width: 6, height: 6,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.7)",
                  }} />
                ))
              )}
            </div>
          )}

          {/* ── Spotlight + gold ring viewfinder ── */}
          {!error && (
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -52%)",
              width: RING, height: RING,
              borderRadius: "50%",
              boxShadow: "0 0 0 2000px rgba(0,0,0,0.62)",
            }}>
              {/* Gold ring */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "2.5px solid #C9A84C",
                boxShadow: "0 0 0 1px rgba(201,168,76,0.12), 0 0 22px rgba(201,168,76,0.4)",
                animation: "camRingPulse 2.8s ease-in-out infinite",
              }} />

              {/* Autofocus animation — appears briefly when camera locks */}
              {focusing && (
                <div style={{
                  position: "absolute",
                  inset: -12,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.6)",
                  animation: "camFocus 1.2s ease-out forwards",
                  pointerEvents: "none",
                }} />
              )}

              <Bracket pos="tl" /><Bracket pos="tr" />
              <Bracket pos="bl" /><Bracket pos="br" />

              {/* Scan line */}
              {ready && (
                <div style={{
                  position: "absolute", inset: 0,
                  borderRadius: "50%", overflow: "hidden",
                  pointerEvents: "none",
                }}>
                  <div style={{
                    position: "absolute",
                    left: 10, right: 10, height: 2, borderRadius: 2,
                    background: "linear-gradient(90deg,transparent 0%,rgba(201,168,76,0.5) 20%,#C9A84C 50%,rgba(201,168,76,0.5) 80%,transparent 100%)",
                    boxShadow: "0 0 8px 2px rgba(201,168,76,0.55)",
                    animation: "camScan 2s ease-in-out infinite",
                  }} />
                </div>
              )}
            </div>
          )}

          {/* ── Resolution badge ── */}
          {resolution && videoVisible && !error && (
            <div style={{
              position: "absolute",
              bottom: 14, left: 14,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              borderRadius: 8,
              padding: "3px 8px",
              animation: "camFadeIn 0.4s ease 0.2s both",
            }}>
              <span style={{
                color: "#C9A84C",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.06em",
              }}>
                {resolution}
              </span>
            </div>
          )}

          {/* Instruction text */}
          {!error && (
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: "calc(50% + 112px)",
              display: "flex", justifyContent: "center",
              opacity: videoVisible ? 1 : 0,
              transition: "opacity 0.4s ease 0.1s",
            }}>
              <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11, fontWeight: 600,
                letterSpacing: "0.13em", textTransform: "uppercase",
              }}>
                Hold steady&nbsp;&nbsp;•&nbsp;&nbsp;Good lighting&nbsp;&nbsp;•&nbsp;&nbsp;Fill the frame
              </p>
            </div>
          )}

          {/* Camera error */}
          {error && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 20, padding: "0 40px", textAlign: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ImagePlus size={26} color="rgba(255,255,255,0.35)" />
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6, maxWidth: 240 }}>
                {error}
              </p>
              <button
                onClick={() => galleryRef.current?.click()}
                style={{
                  padding: "12px 32px", borderRadius: 16,
                  background: "linear-gradient(135deg,#C9A84C,#A8882F)",
                  color: "#000", fontWeight: 900, fontSize: 13,
                  border: "none", cursor: "pointer",
                }}
              >
                Choose from Gallery
              </button>
            </div>
          )}

          {/* ── Top bar: Torch (left) + Close (right) ── */}
          <div style={{
            position: "absolute", top: 14, left: 14, right: 14,
            display: "flex", justifyContent: "space-between",
            alignItems: "center", zIndex: 20,
          }}>
            {/* Torch button */}
            {torchSupported ? (
              <button
                onClick={toggleTorch}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: torchOn ? "rgba(201,168,76,0.35)" : "rgba(0,0,0,0.55)",
                  border: torchOn ? "1.5px solid rgba(201,168,76,0.7)" : "none",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.2s ease",
                }}
              >
                {torchOn
                  ? <Zap    size={20} color="#C9A84C" fill="#C9A84C" />
                  : <ZapOff size={20} color="rgba(255,255,255,0.7)" />
                }
              </button>
            ) : (
              <div style={{ width: 44, height: 44 }} /> /* spacer */
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <X size={20} color="white" />
            </button>
          </div>
        </div>

        {/* ── Bottom controls ── */}
        <div style={{
          background: "#000",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingLeft: 44, paddingRight: 44,
          paddingTop: 24, paddingBottom: 36,
        }}>
          {/* Gallery */}
          <button
            onClick={() => galleryRef.current?.click()}
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ImagePlus size={20} color="rgba(255,255,255,0.6)" />
          </button>

          {/* Shutter */}
          <button
            onClick={capture}
            disabled={!ready || capturing}
            style={{
              width: 76, height: 76, borderRadius: "50%",
              border: "3px solid rgba(201,168,76,0.55)",
              background: "transparent",
              cursor: ready && !capturing ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: ready ? "0 0 0 1px rgba(201,168,76,0.12), 0 0 22px rgba(201,168,76,0.28)" : "none",
              opacity: ready ? 1 : 0.35,
              transition: "opacity 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            <div style={{
              width:  capturing ? 40 : 56,
              height: capturing ? 40 : 56,
              borderRadius: "50%",
              background: capturing ? "linear-gradient(135deg,#C9A84C,#E2C06D)" : "#fff",
              transition: "all 0.13s ease",
            }} />
          </button>

          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid((v) => !v)}
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: showGrid ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)",
              border: showGrid
                ? "1px solid rgba(201,168,76,0.5)"
                : "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Grid3X3
              size={20}
              color={showGrid ? "#C9A84C" : "rgba(255,255,255,0.6)"}
            />
          </button>
        </div>

        <input ref={galleryRef} type="file" accept="image/*"
          style={{ display: "none" }} onChange={onGalleryChange} />

        <style jsx global>{`
          @keyframes camEnter {
            from { opacity: 0; transform: scale(1.015); }
            to   { opacity: 1; transform: scale(1);     }
          }
          @keyframes camScan {
            0%   { top: 9%;   opacity: 1;   }
            50%  { top: 83%;  opacity: 0.6; }
            100% { top: 9%;   opacity: 1;   }
          }
          @keyframes camRingPulse {
            0%,100% { box-shadow: 0 0 0 1px rgba(201,168,76,0.10), 0 0 16px rgba(201,168,76,0.28); }
            50%      { box-shadow: 0 0 0 3px rgba(201,168,76,0.06), 0 0 30px rgba(201,168,76,0.52); }
          }
          @keyframes camFlash {
            0%   { opacity: 0.9; }
            100% { opacity: 0;   }
          }
          @keyframes camFocus {
            0%   { opacity: 1;   transform: scale(1.05); }
            60%  { opacity: 0.8; transform: scale(1.0);  }
            100% { opacity: 0;   transform: scale(0.97); }
          }
          @keyframes camFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
