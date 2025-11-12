"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * MobileNav
 * - Shows hamburger on small screens.
 * - On click opens a slide-up panel (touch friendly) with nav links and theme toggle.
 * - On large screens it renders inline full nav.
 */

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // prevent background scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <>
      {/* Desktop nav (visible on wide screens via CSS) */}
      <nav className="nx-nav-desktop" aria-hidden>
        <Link href="/templates-preview" className="nx-nav-link">Templates</Link>
        <Link href="/onboarding" className="nx-cta nx-cta-sm">Create</Link>
        <div style={{ marginLeft: 6 }}><ThemeToggle /></div>
      </nav>

      {/* Mobile hamburger */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="nx-hamburger"
        onClick={() => setOpen((s) => !s)}
      >
        <span className={`nx-hamburger-bar ${open ? "open" : ""}`} />
        <span className={`nx-hamburger-bar ${open ? "open" : ""}`} />
        <span className={`nx-hamburger-bar ${open ? "open" : ""}`} />
      </button>

      {/* Slide-up panel */}
      <div
        ref={panelRef}
        className={`nx-mobile-panel ${open ? "nx-mobile-panel-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="nx-mobile-panel-inner">
          <div className="nx-mobile-panel-header">
            <div className="nx-mobile-brand">
              <img src="/thumbs/logo.png" alt="NexCard" className="nx-mobile-logo" />
              <strong>NexCard</strong>
            </div>
            <button className="nx-panel-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
          </div>

          <div className="nx-mobile-links">
            <Link href="/templates-preview" onClick={() => setOpen(false)} className="nx-mobile-link">Browse templates</Link>
            <Link href="/onboarding" onClick={() => setOpen(false)} className="nx-mobile-link nx-mobile-cta">Create your card</Link>

            <div style={{ padding: "12px 0" }}>
              <div style={{ marginBottom: 8, color: "var(--muted)", fontSize: 13 }}>Theme</div>
              <ThemeToggle />
            </div>

            <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-weak)", marginTop: 12 }}>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                Tap your NexCard, share instantly, or scan the QR — one tap to your live profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* panel backdrop */}
      <div className={`nx-panel-backdrop ${open ? "nx-panel-backdrop-open" : ""}`} onClick={() => setOpen(false)} aria-hidden />
    </>
  );
}