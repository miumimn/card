"use client";
import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Hero (Client Component)
 * - Strong mobile-first layout with very large CTAs and full-width input.
 * - Adds a sticky bottom CTA on small screens for quick access to Create/Browse.
 */

export default function Hero() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email) {
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 1200);
  }

  return (
    <section className="nx-hero" aria-label="NexCard hero">
      <div className="nx-hero-inner nx-container">
        <div className="nx-hero-left">
          <h1 className="nx-title">Your NexCard. One tap. Infinite possibilities.</h1>
          <p className="nx-desc">
            Tap, share, and grow your network instantly — a smart NFC card that links to your live profile. No apps required, QR supported.
          </p>

          <form className="nx-inline-form" onSubmit={handleSubmit} aria-label="Get early access">
            <label htmlFor="nc-email" className="sr-only">Email address</label>
            <input
              id="nc-email"
              type="email"
              inputMode="email"
              placeholder="you@yourdomain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="nx-input"
              aria-label="Email for early access"
            />
            <button className="nx-cta" onClick={handleSubmit} aria-pressed={submitted}>
              {submitted ? "Saved ✓" : "Get early access"}
            </button>
          </form>

          <div className="nx-hero-links">
            <Link href="/templates-preview" className="nx-link">Browse templates</Link>
            <Link href="/onboarding" className="nx-link nx-link-strong">Start a card</Link>
          </div>

          <div className="nx-compact-meta">
            <div className="nx-stat">
              <strong>100k+</strong>
              <span>cards created</span>
            </div>
            <div className="nx-stat">
              <strong>Instant</strong>
              <span>tap & share</span>
            </div>
            <div className="nx-stat">
              <strong>No apps</strong>
              <span>QR & NFC</span>
            </div>
          </div>
        </div>

        {/* preview shown below hero on small screens (improved layout) */}
        <aside className="nx-hero-right" aria-hidden>
          <div className="nx-card-preview">
            <div className="nx-card-topbar">
              <img src="/thumbs/logo.png" alt="" className="nx-card-logo small" />
              <div className="nx-card-actions">
                <ThemeToggle />
              </div>
            </div>

            <div className="nx-card-body">
              <div className="nx-avatar" style={{ backgroundImage: "url('https://picsum.photos/id/1005/400/400')" }} />
              <h4 className="nx-card-name">Alex Moreno</h4>
              <p className="nx-card-role">Freelance Photographer</p>

              <div className="nx-links">
                <a className="nx-link-card" href="#">Portfolio</a>
                <a className="nx-link-card" href="#">Book me</a>
                <a className="nx-link-card" href="#">Instagram</a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* sticky bottom CTA for mobile - very tactile */}
      <div className="nx-sticky-cta" role="region" aria-label="Quick actions">
        <Link href="/onboarding" className="nx-sticky-btn nx-cta-lg">Create your NexCard</Link>
        <Link href="/templates-preview" className="nx-sticky-btn nx-cta-outline">Browse templates</Link>
      </div>
    </section>
  );
}