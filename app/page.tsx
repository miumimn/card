"use client";
import React from "react";
import Link from "next/link";
import Hero from "./home/Hero";
import Features from "./home/Features";
import Footer from "./home/Footer";
import "./home/styles.css";

/**
 * NexCard homepage (Server Component)
 * - Mobile-first, accessible, theme-aware (uses CSS vars from globals.css)
 * - Composed from client components for interactive parts (Hero, Features)
 *
 * NOTE: The header is provided by app/layout.tsx (global layout). Removed the duplicated header here.
 *
 * Changes:
 * - All CTAs now point to /store (no links to /onboarding)
 * - Kept styling and copy mostly unchanged
 */

export default function HomePage() {
  return (
    <div className="nx-home">
      <main>
        <Hero />

        <section className="nx-container nx-section nx-intro">
          <h2 className="nx-h2">Why NexCard?</h2>
          <p className="nx-lead">
            NexCard is the future of personal branding — a smart NFC card that connects to your live digital profile.
            Tap, share, and grow your network instantly. No apps required; works with tap or QR scan.
          </p>
        </section>

        <Features />

        <section className="nx-container nx-section nx-cta-large" aria-labelledby="get-started">
          <h3 id="get-started">Ready to build your NexCard profile?</h3>
          <p className="nx-muted">Pick a template, customize, and go live in minutes.</p>
          <div className="nx-cta-row">
            <Link href="/store" className="nx-cta nx-cta-lg">Browse templates</Link>
            <Link href="/store" className="nx-cta nx-cta-outline">Customize & Shop</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}