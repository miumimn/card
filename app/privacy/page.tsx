import React from "react";
import "./styles.css";
import PrivacyClient from "./PrivacyClient";
import ThemeToggle from "../../components/ThemeToggle";

/**
 * Privacy page (Server Component)
 * - Server-rendered policy content
 * - Uses PrivacyClient for accordion, smooth scroll and scrollspy
 * - ThemeToggle is rendered inside a non-button wrapper (no nested buttons)
 *
 * Updated: hero visual now uses the real card image at /thumbs/card.png
 */

export default function PrivacyPage() {
  const now = new Date();
  const isoDate = now.toISOString().split("T")[0];
  const year = now.getFullYear();

  return (
    <div className="privacy-root">
      <div className="top-fixed">
        <div className="theme-toggle-wrap">
          <ThemeToggle />
        </div>
      </div>

      <header className="privacy-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="brand">
              <div className="brand-text">
                <div className="brand-title">NEXCARD</div>
                <div className="brand-sub">Privacy & Data. Your control, our responsibility</div>
              </div>
            </div>

            <h1 id="policy-title" className="hero-h1">Privacy Policy</h1>
            <p className="lead">
              We keep your data usage simple and transparent. This policy explains what we collect, why we collect it,
              how we use it, and how you can control it.
            </p>

            <div className="hero-actions">
              <a href="/store" className="btn btn-ghost">Get a card</a>
              <a href="/contact" className="btn btn-primary">Contact privacy</a>
            </div>
          </div>

          <div className="hero-visual" aria-hidden>
            {/* Replaced decorative SVG with the real card image */}
            <img src="/thumbs/card.png" alt="NEXCARD preview" className="hero-card-image" />
          </div>
        </div>
      </header>

      <main className="container" role="main">
        <aside className="toc-col" aria-label="Table of contents">
          <div className="toc-card" id="tocCard">
            <div className="toc-mobile-header">
              <button id="tocToggle" className="toc-toggle" aria-expanded="false" aria-controls="tocNav" aria-label="Open table of contents">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden focusable="false">
                  <path d="M1 1h16M1 6h16M1 11h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="toc-toggle-label">Contents</span>
              </button>
            </div>

            <div className="toc-meta">
              <div className="badge">Effective</div>
              <div className="date">{isoDate}</div>
            </div>

            <nav className="toc" id="tocNav" aria-label="Table of contents">
              <a href="#what-we-collect">What we collect</a>
              <a href="#how-we-use">How we use it</a>
              <a href="#sharing">Sharing</a>
              <a href="#cookies">Cookies</a>
              <a href="#security">Security</a>
              <a href="#your-rights">Your rights</a>
              <a href="#contact">Contact</a>
              <a href="#changes">Changes</a>
            </nav>

            <div className="toc-footer">
              <a href="/store" className="btn btn-primary block">Design a card</a>
            </div>
          </div>
        </aside>

        <section className="content-panel card-panel" aria-labelledby="policy-title">
          <div className="policy-meta">
            <div className="badge">Policy</div>
            <div className="muted-inline">Last updated: <span id="updatedAt">{isoDate}</span></div>
          </div>

          <article className="policy-section" id="what-we-collect">
            <h3>What data we collect</h3>
            <p>
              We collect the minimum necessary data to provide the service: account info, card designs, order and
              shipping details, and analytics about scans/taps.
            </p>
            <ul>
              <li>Account information: email, name (if provided), password hash (if you create an account later to edit your info).</li>
              <li>Card design data: text, colors, profile picture (you upload), template choices — saved so your card displays correctly.</li>
              <li>Order & shipping: purchaser name, shipping address, phone number, order history.</li>
              <li>Usage & analytics: scan timestamps, approximate location derived from IP, device type and browser user agent.</li>
            </ul>
          </article>

          <article className="policy-section" id="how-we-use">
            <h3>How we use your data</h3>
            <p>We use your data to:</p>
            <ul>
              <li>Process orders and ship physical cards;</li>
              <li>Serve your public profile when someone scans or taps your card;</li>
              <li>Provide analytics (scan counts, locations) so you can measure performance;</li>
              <li>Communicate (order confirmations, shipment updates, support).</li>
            </ul>
          </article>

          <article className="policy-section" id="sharing">
            <h3>When we share data</h3>
            <p>We do not sell your personal data. We may share limited data with:</p>
            <ul>
              <li>Payment processors (Stripe, PayPal) to complete payments;</li>
              <li>Fulfillment partners (printers/shippers) to print and ship cards — only the data they need (name, address, logo if printed);</li>
              <li>Analytics providers (if you opt-in) for aggregated insights.</li>
            </ul>
          </article>

          <article className="policy-section" id="cookies">
            <h3>Cookies & tracking</h3>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Maintain session and login state;</li>
              <li>Measure usage and improve the product;</li>
              <li>Support third-party services (analytics, payment widgets).</li>
            </ul>
            <p>If you prefer, you can block cookies in your browser; some features (like sessions) may be affected.</p>
          </article>

          <article className="policy-section" id="security">
            <h3>Security</h3>
            <p>
              We take reasonable measures to protect your data (HTTPS, server-side protections, secure key storage).
              However, no system is 100% secure — if you discover a vulnerability, please contact us immediately.
            </p>

            <div className="accordion-item" id="breach">
              <div className="accordion-head" data-target="breach-body" role="button" aria-expanded="false" tabIndex={0}>
                <h4>Data breach response</h4>
                <div className="muted-inline">Click to expand</div>
              </div>
              <div className="accordion-body" id="breach-body" aria-hidden="true">
                <p>
                  In the unlikely event of a security incident, we will promptly investigate, contain the issue, notify
                  affected users and authorities as required by law, and publish an incident report describing actions taken.
                </p>
              </div>
            </div>
          </article>

          <article className="policy-section" id="your-rights">
            <h3>Your rights</h3>
            <p>You have rights over your information. Depending on your jurisdiction, you may be able to:</p>
            <ul>
              <li>Access a copy of the data we hold about you;</li>
              <li>Request correction or deletion of your data;</li>
              <li>Export your card designs and analytics;</li>
              <li>Opt out of marketing emails (link at the bottom of emails).</li>
            </ul>
            <p>To exercise rights, contact us at the address below. We may need to verify your identity before processing certain requests.</p>
          </article>

          <article className="policy-section" id="contact">
            <h3>Contact</h3>
            <p>For privacy requests, questions, or concerns:</p>
            <ul>
              <li>Email: <a className="link-small" href="mailto:privacy@cybernerddd.com">privacy@cybernerddd.com</a></li>
              <li>Mail: Cybernerddd / NEXCARD, PO Box 12345, Your City</li>
            </ul>
          </article>

          <article className="policy-section" id="changes">
            <h3>Changes to this policy</h3>
            <p>
              We may update this policy periodically. When we make material changes, we'll post a notice on the site
              and update the "Last updated" date above. Your continued use of our service after changes constitutes acceptance.
            </p>
          </article>

          <footer className="policy-foot">
            <div>Thank you for trusting NEXCARD with your data — we take that seriously.</div>
          </footer>
        </section>
      </main>

      <footer className="site-foot" aria-hidden>
        © <span>{year}</span> NEXCARD • <a href="/terms" className="link-small">Terms</a> • <a href="/privacy" className="link-small">Privacy</a>
      </footer>

      <PrivacyClient />
    </div>
  );
}