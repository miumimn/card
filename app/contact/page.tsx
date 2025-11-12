import React from "react";
import "./styles.css";
import ContactFormEnhancer from "./ContactFormEnhancer";
import ThemeToggle from "../../components/ThemeToggle";

/**
 * ContactPage (Server Component)
 * - Server-rendered form markup (always visible)
 * - Client enhancer wires validation + submit (returns null)
 * - ThemeToggle is rendered inside a non-button wrapper
 *
 * UI: modern, cardy, glassmorphism, responsive.
 */

export default function ContactPage() {
  return (
    <div className="contact-root">
      <div className="top-controls">
        <div className="brand">
          <div className="brand-text">
            <div className="brand-title">NEXCARD</div>
            <div className="brand-sub">Support & Sales</div>
          </div>
        </div>

        <div className="right-controls">
          <div className="need-help">Need help? <span className="muted">Typical response within 24 hours</span></div>
          <div className="theme-toggle-wrap"><ThemeToggle /></div>
        </div>
      </div>

      <header className="contact-hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">Contact us</h1>
            <p className="hero-lead">
              Questions about ordering, custom printing, enterprise, or privacy? Fill the form and we'll get back to you.
            </p>
          </div>

          <div className="hero-visual" aria-hidden>
            {/* Replaced stylized preview with actual card image */}
            <img src="/thumbs/card.png" alt="NexCard preview" className="card-image" />
          </div>
        </div>
      </header>

      <main className="contact-main">
        <section className="panel form-panel" aria-label="Contact form">
          <h3 className="panel-title">Send us a message</h3>

          <form id="contactForm" className="contact-form" noValidate>
            <div className="row two">
              <div className="field">
                <label htmlFor="name" className="label">Full name</label>
                <input id="name" name="name" type="text" placeholder="Your full name" required />
              </div>
              <div className="field">
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" placeholder="you@domain.com" required />
              </div>
            </div>

            <div className="row two">
              <div className="field">
                <label htmlFor="subject" className="label">Subject</label>
                <input id="subject" name="subject" type="text" placeholder="Order question, pricing, etc." required />
              </div>
              <div className="field">
                <label htmlFor="topic" className="label">Topic</label>
                <select id="topic" name="topic" required>
                  <option value="">Select topic</option>
                  <option value="support">Support</option>
                  <option value="sales">Sales / Bulk order</option>
                  <option value="printing">Printing / Customization</option>
                  <option value="privacy">Privacy</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field full">
                <label htmlFor="message" className="label">Message</label>
                <textarea id="message" name="message" placeholder="Tell us what's up (be as detailed as you want)"></textarea>
              </div>
            </div>

            <div id="formMessage" className="form-message" role="status" aria-live="polite" />

            <div className="row actions">
              <button type="submit" className="btn btn-primary">Send message</button>
              <button type="button" id="resetBtn" className="btn btn-ghost">Reset</button>
            </div>

            <div className="small-note">
              By contacting us you agree to our <a href="/privacy">Privacy Policy</a>. We respond within one business day.
            </div>
          </form>
        </section>

        <aside className="panel info-panel" aria-label="Contact details">
          <h4 className="panel-title">Other ways to reach us</h4>

          <div className="info-block">
            <div className="info-icon">✉️</div>
            <div>
              <div className="info-title">Email</div>
              <div className="info-meta"><a href="mailto:hello@cybernerddd.com">hello@cybernerddd.com</a></div>
            </div>
          </div>

          <div className="info-block">
            <div className="info-icon">📞</div>
            <div>
              <div className="info-title">Phone</div>
              <div className="info-meta">+1 (555) 123-4567</div>
            </div>
          </div>

          <div className="info-block">
            <div className="info-icon">🏢</div>
            <div>
              <div className="info-title">Office</div>
              <div className="info-meta">Cybernerddd / NEXCARD<br/>PO Box 12345, Your City</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <a href="/editor" className="btn btn-primary block">Design a card</a>
          </div>
        </aside>
      </main>

      <footer className="contact-footer">
        © {new Date().getFullYear()} NEXCARD • <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
      </footer>

      {/* Client enhancer attaches behavior to the server-rendered form */}
      <ContactFormEnhancer />
    </div>
  );
}