import React from "react";
import Link from "next/link";

/**
 * Footer (Server Component) — simple and accessible
 */

export default function Footer() {
  return (
    <footer className="nx-footer" role="contentinfo">
      <div className="nx-container nx-footer-inner">
        <div>
          <strong>NexCard</strong>
          <div className="nx-muted">One card to showcase you or your business.</div>
        </div>

        <nav aria-label="Footer links" className="nx-footer-nav">
          <Link href="/templates-preview" className="nx-footer-link">Templates</Link>
          <Link href="/onboarding" className="nx-footer-link">Onboarding</Link>
          <a className="nx-footer-link" href="https://docs.example.com">Docs</a>
        </nav>
      </div>
    </footer>
  );
}