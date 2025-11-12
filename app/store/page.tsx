import React from "react";
import Link from "next/link";
import "./styles.css";
import RotatingCard from "./components/RotatingCard";

/**
 * Store landing (Server Component)
 * - Shows product (NexCard) details and includes the client ShopClient component that manages cart state.
 * - Mobile-first layout and quick add-to-cart actions.
 *
 * NOTE: ShopClient is a client component (wraps the real Shop client component).
 */

import ShopClient from "./components/ShopClient";

export default function StorePage() {
  return (
    <div className="store-page">
      <header className="store-hero">
        <div className="store-container">
          <div className="hero-inner" style={{ display: "flex", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="store-title">Order your NexCard</h1>
              <p className="store-lead">
                Smart NFC cards that link to your live NexCard profile. <b>Tap, share, grow</b> no apps required. Scan with <b>QR</b> if needed.
                no apps required. Scan with QR if needed.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Rotating physical NexCard for visual polish (uses thumbs/card.png) */}
              <RotatingCard size={220} imgSrc="/thumbs/card.png" />
            </div>
          </div>
        </div>
      </header>

      <main className="store-container">
        <section className="product-area">
          <ShopClient />
        </section>

        <section className="info-area" style={{ marginTop: 22 }}>
          <h2>Bulk & Custom Options</h2>
          <p className="muted">
            Need 10+ cards or custom artwork/engraving? Use the custom order at checkout or contact sales. <b><a href="/contact">Contact</a></b>
          </p>

          <h3>Shipping & Returns</h3>
          <p className="muted">Worldwide shipping. Cards are physical — allow 5–10 business days for delivery outside Ghana.</p>
        </section>
      </main>
    </div>
  );
}