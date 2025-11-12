import "./globals.css";
import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Root layout updated so the header is transparent and page background is controlled entirely by CSS theme variables.
 * ThemeToggle component should set data-theme on <html> when toggling.
 *
 * NOTE: This file is a Server Component (no "use client" directive) so we can export `metadata`.
 * ThemeToggle itself should remain a client component (it can include "use client").
 */

export const metadata = {
  title: "Template Card Studio",
  description: "Preview and onboard templates, personalize and preview templates",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Header background forced to white so it remains white in all themes */}
        <header style={{ borderBottom: "1px solid var(--border-weak)", background: "#ffffff" }}>
          <div className="app-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link href="/templates-preview" style={{ textDecoration: "none", color: "inherit", fontWeight: 900 }}>
                {/* larger logo so it's prominent in the header */}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src="/thumbs/logo.png"
                    alt="Logo"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              </Link>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link href="/templates-preview">
                <button className="btn btn-ghost" style={{ color: "var(--text)", borderColor: "var(--border-weak)" }}>Templates</button>
              </Link>
              <Link href="/onboarding">
                <button className="btn btn-primary" style={{ background: "linear-gradient(90deg,var(--accent),var(--accent-2))", color: "#fff" }}>Create</button>
              </Link>

              {/* Theme toggle (client) */}
              <div style={{ marginLeft: 8 }}>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer style={{ borderTop: "1px solid var(--border-weak)", marginTop: 28, background: "transparent" }}>
          <div className="app-container" style={{ padding: "20px 0", fontSize: 13, color: "var(--muted)" }}>
            © {new Date().getFullYear()} NexCard • One Card to showcase you or your business.
            <div style={{ float: "right" }}>
              <Link href="/templates-preview" style={{ marginRight: 12, color: "var(--muted)" }}>Templates</Link>
              <Link href="/onboarding" style={{ color: "var(--muted)" }}>Onboarding</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}