"use client";
import React, { useEffect, useState } from "react";
import ShopClient from "./ShopClient";

/**
 * StoreClientShell
 * - Shows a full-screen NexCard-style animated loader while the page/assets are loading.
 * - Once the window 'load' event fires (or after a short fallback timeout) it reveals the ShopClient.
 *
 * This avoids editing your main styles file and keeps the loader markup scoped to the component.
 */
export default function StoreClientShell() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let loaded = false;
    const onLoad = () => {
      loaded = true;
      // small delay so the loader doesn't flash too briefly
      setTimeout(() => { if (mounted) setReady(true); }, 240);
    };

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad, { once: true });
      }
    }

    // Safety fallback: after 4s show content even if load didn't fire (avoids stuck loaders)
    const fallback = setTimeout(() => {
      if (!loaded && mounted) setReady(true);
    }, 4000);

    return () => {
      mounted = false;
      clearTimeout(fallback);
      try { window.removeEventListener("load", onLoad as any); } catch {}
    };
  }, []);

  return (
    <>
      {/* Loader overlay */}
      {!ready ? (
        <div className="store-loader" role="status" aria-live="polite" aria-label="Loading NexCard">
          <div className="loader-inner" >
            <div className="loader-card-wrap" aria-hidden>
              <div className="loader-card-front card-face">
                <div className="loader-chip" />
                <div className="loader-lines">
                  <div className="line short" />
                  <div className="line long" />
                </div>
              </div>
              <div className="loader-card-back card-face">
                <div className="loader-back-icon">N</div>
              </div>
            </div>

            <div className="loader-text">
              <strong>Preparing your NexCard</strong>
              <div className="loader-dots" aria-hidden>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          </div>

          {/* Scoped styles for loader to avoid touching global CSS */}
          <style>{`
.store-loader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6200;
  background: linear-gradient(180deg, rgba(2,6,23,0.6), rgba(2,6,23,0.4));
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  pointer-events: auto;
}
.loader-inner {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
  padding: 18px 22px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  box-shadow: 0 12px 40px rgba(2,6,23,0.6);
  border: 1px solid rgba(255,255,255,0.04);
  transform: translateZ(0);
}

/* card wrap - scales and rotates while inner card animates */
.loader-card-wrap {
  width: 220px;
  height: 140px;
  position: relative;
  perspective: 900px;
  transform-style: preserve-3d;
  animation: loader-card-tilt 3.2s linear infinite;
  display:flex;
  align-items:center;
  justify-content:center;
}
@keyframes loader-card-tilt {
  0% { transform: rotateX(6deg) rotateY(-8deg) rotateZ(0deg); }
  50% { transform: rotateX(4deg) rotateY(8deg) rotateZ(0deg); }
  100% { transform: rotateX(6deg) rotateY(-8deg) rotateZ(0deg); }
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 16px;
  gap: 10px;
  box-sizing: border-box;
}

/* front/back visuals */
.loader-card-front {
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.06);
  color: #fff;
  transform: translateZ(8px);
  display:flex;
  align-items:center;
}
.loader-card-back {
  transform: rotateY(180deg) translateZ(4px);
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.85);
  display:flex;
  align-items:center;
  justify-content:center;
}

/* subtle chip and lines */
.loader-chip {
  width: 44px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(90deg,#ffd54f, #ffb86b);
  box-shadow: inset 0 -6px 12px rgba(0,0,0,0.12);
}
.loader-lines { display:flex; flex-direction:column; gap:6px; flex:1; margin-left:12px; }
.loader-lines .line { height:8px; border-radius:6px; background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); }
.loader-lines .line.short { width: 40%; }
.loader-lines .line.long { width: 80%; }

/* back icon */
.loader-back-icon {
  font-weight:900;
  font-size:32px;
  color: rgba(255,255,255,0.85);
}

/* rotation animation: flip between front/back (works together with tilt on wrapper) */
.loader-card-front { animation: loader-face 2.6s ease-in-out infinite; }
.loader-card-back  { animation: loader-face 2.6s ease-in-out infinite; animation-delay: 1.3s; transform: rotateY(180deg) translateZ(4px); }
@keyframes loader-face {
  0% { opacity:1; transform: translateZ(8px) rotateY(0deg); }
  45% { opacity:1; transform: translateZ(8px) rotateY(0deg); }
  55% { opacity:0; transform: translateZ(0) rotateY(90deg); }
  100% { opacity:1; transform: translateZ(8px) rotateY(0deg); }
}

/* loader text + dots */
.loader-text { text-align:center; color: #e6f3fb; font-size:14px; display:flex; flex-direction:column; gap:8px; align-items:center; }
.loader-dots { display:flex; gap:6px; align-items:center; justify-content:center; margin-top:2px; }
.loader-dots .dot { width:8px; height:8px; border-radius:50%; background: #9fb0c2; opacity:0.14; animation: loader-dot 1s infinite; }
.loader-dots .dot:nth-child(2) { animation-delay: 0.12s; }
.loader-dots .dot:nth-child(3) { animation-delay: 0.24s; }
@keyframes loader-dot {
  0% { transform: translateY(0); opacity:0.12; }
  40% { transform: translateY(-8px); opacity:1; }
  80% { transform: translateY(0); opacity:0.12; }
  100% { transform: translateY(0); opacity:0.12; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .loader-card-wrap, .loader-card-front, .loader-card-back, .loader-dots .dot { animation: none !important; transform: none !important; }
}
          `}</style>
        </div>
      ) : null}

      {/* Render the real client once ready */}
      <div style={{ display: ready ? undefined : "none" }}>
        <ShopClient />
      </div>
    </>
  );
}