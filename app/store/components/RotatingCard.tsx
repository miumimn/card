"use client";
import React, { useEffect, useRef } from "react";

/**
 * RotatingCard (image front)
 * - Shows a photographic/graphic card front using thumbs/card.png and a styled back.
 * - Auto-rotates in 3D, with pointer tilt on desktop and tap-to-pause on mobile.
 * - Respects prefers-reduced-motion: animation is disabled for users who prefer reduced motion.
 *
 * Props:
 * - size?: number (width in px) default 240
 * - imgSrc?: string path to card image (default "/thumbs/card.png")
 * - link?: string optional href to go to when card clicked (keeps tap-to-pause if not provided)
 */

type Props = {
  size?: number;
  imgSrc?: string;
  brandText?: string;
  link?: string;
};

export default function RotatingCard({
  size = 240,
  imgSrc = "/thumbs/card.png",
  brandText = "NEXCARD",
  link,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const elRaw = wrapRef.current;
    if (!elRaw) return;
    // assert non-null for the remainder of this effect so nested functions don't need to repeat checks
    const el = elRaw;

    // don't animate if user requested reduced motion
    const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      el.classList.add("reduced-motion");
      return;
    }

    let bounding = el.getBoundingClientRect();
    let isPointerDown = false;

    function onMove(x: number, y: number) {
      const cx = bounding.left + bounding.width / 2;
      const cy = bounding.top + bounding.height / 2;
      const dx = (x - cx) / (bounding.width / 2);
      const dy = (y - cy) / (bounding.height / 2);

      const rx = Math.max(-0.6, Math.min(0.6, -dy));
      const ry = Math.max(-0.6, Math.min(0.6, dx));

      const rxDeg = rx * 12;
      const ryDeg = ry * 12;

      el.style.setProperty("--rx", `${rxDeg}deg`);
      el.style.setProperty("--ry", `${ryDeg}deg`);
      el.style.setProperty("--spinIntensity", isPointerDown ? "0.08" : "1");
    }

    function pointerMove(e: PointerEvent) {
      isPointerDown = e.buttons !== 0;
      onMove(e.clientX, e.clientY);
    }

    function pointerEnter(e: PointerEvent) {
      el.classList.add("interactive");
      bounding = el.getBoundingClientRect();
      onMove(e.clientX, e.clientY);
    }

    function pointerLeave() {
      el.classList.remove("interactive");
      el.style.setProperty("--rx", `0deg`);
      el.style.setProperty("--ry", `0deg`);
      el.style.setProperty("--spinIntensity", "1");
    }

    function touchHandler(e: TouchEvent) {
      if (!e.touches || e.touches.length === 0) return;
      const t = e.touches[0];
      onMove(t.clientX, t.clientY);
    }

    function handleClick(e: MouseEvent) {
      // if link provided, let navigation happen; otherwise toggle pause
      if (link) return;
      pausedRef.current = !pausedRef.current;
      el.classList.toggle("paused", pausedRef.current);
    }

    el.addEventListener("pointermove", pointerMove);
    el.addEventListener("pointerenter", pointerEnter);
    el.addEventListener("pointerleave", pointerLeave);
    el.addEventListener("touchmove", touchHandler, { passive: true } as any);
    el.addEventListener("click", handleClick as any);

    // keep bounding updated on resize/scroll
    function refresh() {
      bounding = el.getBoundingClientRect();
      rafRef.current = requestAnimationFrame(refresh);
    }
    rafRef.current = requestAnimationFrame(refresh);

    return () => {
      // use the same el captured above
      el.removeEventListener("pointermove", pointerMove);
      el.removeEventListener("pointerenter", pointerEnter);
      el.removeEventListener("pointerleave", pointerLeave);
      el.removeEventListener("touchmove", touchHandler as any);
      el.removeEventListener("click", handleClick as any);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [link]);

  const wrapperStyle: React.CSSProperties = {
    width: size,
    height: Math.round(size * 0.62),
    perspective: `${Math.max(600, size * 4)}px`,
  };

  const cardInner = (
    <div className="rotating-card" aria-hidden>
      <div className="card-face card-front">
        <img src={imgSrc} alt="NexCard preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
      </div>

      <div className="card-face card-back">
        <div className="nfc-mark">NFC</div>
        <div className="card-back-meta">Tap to share • NexCard</div>
      </div>
    </div>
  );

  return (
    <div className="rotating-card-wrap" ref={wrapRef} style={wrapperStyle}>
      {link ? (
        <a href={link} aria-label="View NexCard preview" style={{ display: "inline-block", width: "100%", height: "100%" }}>
          {cardInner}
        </a>
      ) : (
        cardInner
      )}
    </div>
  );
}