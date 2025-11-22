"use client";
import React, { useEffect, useState } from "react";

/**
 * TemplateLoader
 * - Full-screen, pleasant animation shown while the page is loading.
 * - Uses window 'load' event or a short fallback timeout so it never gets stuck.
 * - Accessible: role=status, aria-live polite. Respects prefers-reduced-motion.
 *
 * Usage: drop <TemplateLoader /> at top-level of the templates preview page.
 */
export default function TemplateLoader({ minMs = 600, maxMs = 2400 }: { minMs?: number; maxMs?: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    let loaded = false;
    const t0 = performance.now();

    const finish = () => {
      const elapsed = Math.max(0, performance.now() - t0);
      const wait = Math.max(0, minMs - elapsed);
      setTimeout(() => {
        if (mounted) setReady(true);
      }, wait);
    };

    const onLoad = () => {
      loaded = true;
      finish();
    };

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad, { once: true });
      }
    }

    // safety fallback: reveal content after maxMs
    const fallback = setTimeout(() => {
      if (!loaded && mounted) finish();
    }, maxMs);

    return () => {
      mounted = false;
      clearTimeout(fallback);
      try {
        window.removeEventListener("load", onLoad as any);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ready) return null;

  return (
    <>
      <div className="tp-loader" role="status" aria-live="polite" aria-label="Loading templates">
        <div className="tp-inner">
          <div className="tp-card-wrap" aria-hidden>
            <div className="tp-card front">
              <div className="tp-chip" />
              <div className="tp-lines">
                <div className="tp-line short" />
                <div className="tp-line long" />
              </div>
            </div>
            <div className="tp-card back">
              <div className="tp-logo">N</div>
            </div>
            <div className="tp-spark tp-spark-1" />
            <div className="tp-spark tp-spark-2" />
            <div className="tp-spark tp-spark-3" />
          </div>

          <div className="tp-caption">
            <strong>Loading templates</strong>
            <span className="tp-dots" aria-hidden>
              <b className="dot" /><b className="dot" /><b className="dot" />
            </span>
          </div>
        </div>
      </div>

      <style>{`
.tp-loader {
  position: fixed;
  inset: 0;
  z-index: 8000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(6,10,16,0.72), rgba(6,10,16,0.5));
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  pointer-events: auto;
}

/* inner panel */
.tp-inner {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
  padding: 18px 22px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  color: #e6f3fb;
  transform: translateZ(0);
  max-width: 92%;
}

/* card animation wrapper: slow tilt + orbit on sparks */
.tp-card-wrap {
  position: relative;
  width: 220px;
  height: 140px;
  perspective: 900px;
  transform-style: preserve-3d;
  display:flex;
  align-items:center;
  justify-content:center;
  animation: tp-tilt 3.6s ease-in-out infinite;
}

/* card faces */
.tp-card {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  padding: 14px;
  display:flex;
  align-items:center;
  gap: 10px;
  box-sizing: border-box;
  transition: transform .28s ease, opacity .28s ease;
}

/* front */
.tp-card.front {
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.06);
  transform: translateZ(8px);
  display:flex;
  align-items:center;
}

/* back glimmer */
.tp-card.back {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.03);
  transform: rotateY(180deg) translateZ(4px);
  display:flex;
  align-items:center;
  justify-content:center;
  color: rgba(255,255,255,0.85);
}

/* chip + lines */
.tp-chip {
  width: 44px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(90deg,#ffd54f,#ffb86b);
  box-shadow: inset 0 -6px 12px rgba(0,0,0,0.12);
}
.tp-lines { display:flex; flex-direction:column; gap:6px; flex:1; margin-left:10px; }
.tp-line { height:8px; border-radius:6px; background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); }
.tp-line.short { width: 40%; }
.tp-line.long { width: 80%; }

/* back logo */
.tp-logo { font-weight:900; font-size:36px; }

/* flip front/back */
.tp-card.front  { animation: tp-flip 2.6s ease-in-out infinite; }
.tp-card.back   { animation: tp-flip 2.6s ease-in-out infinite; animation-delay: 1.3s; }

/* floating sparkles/orbit */
.tp-spark {
  position: absolute;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.4) 35%, transparent 60%);
  border-radius: 50%;
  filter: blur(6px);
  opacity: 0.9;
}
.tp-spark-1 { left: 8%; top: 18%; animation: tp-orbit-1 3.6s linear infinite; }
.tp-spark-2 { right: 10%; top: 10%; animation: tp-orbit-2 4.2s linear infinite; }
.tp-spark-3 { right: 18%; bottom: 6%; animation: tp-orbit-3 3.8s linear infinite; }

/* caption + dots */
.tp-caption { text-align:center; font-size:14px; display:flex; flex-direction:column; gap:8px; align-items:center; }
.tp-dots { display:flex; gap:8px; }
.tp-dots .dot { width:8px; height:8px; border-radius:50%; background:#9fb0c2; opacity:0.18; animation: tp-dot 1s infinite; }
.tp-dots .dot:nth-child(2) { animation-delay: 0.12s; }
.tp-dots .dot:nth-child(3) { animation-delay: 0.24s; }

/* keyframes */
@keyframes tp-tilt {
  0% { transform: rotateX(5deg) rotateY(-8deg); }
  50% { transform: rotateX(3deg) rotateY(8deg); }
  100% { transform: rotateX(5deg) rotateY(-8deg); }
}
@keyframes tp-flip {
  0% { opacity: 1; transform: translateZ(8px) rotateY(0deg); }
  45% { opacity: 1; transform: translateZ(8px) rotateY(0deg); }
  55% { opacity: 0; transform: translateZ(0) rotateY(90deg); }
  100% { opacity: 1; transform: translateZ(8px) rotateY(0deg); }
}
@keyframes tp-orbit-1 { 0% { transform: translate(0,0) } 50% { transform: translate(18px, -8px) } 100% { transform: translate(0,0) } }
@keyframes tp-orbit-2 { 0% { transform: translate(0,0) } 50% { transform: translate(-12px, 14px) } 100% { transform: translate(0,0) } }
@keyframes tp-orbit-3 { 0% { transform: translate(0,0) } 50% { transform: translate(-8px, -14px) } 100% { transform: translate(0,0) } }
@keyframes tp-dot { 0% { transform: translateY(0); opacity: 0.18 } 40% { transform: translateY(-8px); opacity:1 } 80% { transform: translateY(0); opacity:0.18 } }

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .tp-card-wrap, .tp-card, .tp-spark, .tp-dots .dot { animation: none !important; transform: none !important; }
  .tp-spark { opacity: 0.75; }
}

/* responsive sizing */
@media (max-width: 520px) {
  .tp-card-wrap { width: 180px; height: 120px; }
  .tp-inner { padding: 14px; }
  .tp-caption { font-size:13px; }
}
      `}</style>
    </>
  );
}