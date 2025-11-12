import React from "react";
import "./store.css";

/**
 * StoreExtras
 * - Shows the Bulk / Shipping quick actions under product/store info.
 * - Links:
 *   - Contact sales -> /contact?topic=sales (preselects topic = sales)
 *   - Shipping & returns -> /shipping (fallback to /contact if /shipping isn't present)
 *
 * Drop <StoreExtras /> under the paragraphs you mentioned in the store page.
 */

export default function StoreExtras(): JSX.Element {
  return (
    <div className="store-extras" role="region" aria-label="Store quick actions">
      <div className="extra-card">
        <div className="extra-left">
          <h4>Bulk &amp; custom options</h4>
          <p className="muted">
            Need 10+ cards or custom artwork/engraving? Use the custom order at checkout or contact sales for a tailored quote.
          </p>
        </div>

        <div className="extra-cta">
          <a
            href="/contact?topic=sales"
            className="btn btn-primary"
            title="Contact sales for bulk orders"
            aria-label="Contact sales for bulk or custom orders"
          >
            Contact sales
          </a>
          <a
            href="/checkout?customOrder=true"
            className="btn btn-ghost"
            title="Start custom order at checkout"
            aria-label="Start custom order at checkout"
          >
            Start custom order
          </a>
        </div>
      </div>

      <div className="extra-card">
        <div className="extra-left">
          <h4>Shipping &amp; returns</h4>
          <p className="muted">
            Worldwide shipping. Cards are physical — allow 5–10 business days for delivery outside Ghana. Questions about shipping or returns?
          </p>
        </div>

        <div className="extra-cta">
          {/* Prefer a dedicated shipping page if you have one, otherwise fall back to contact */}
          <a
            href="/shipping"
            className="btn btn-ghost"
            title="Shipping & returns details"
            aria-label="Shipping and returns details"
          >
            Shipping & returns
          </a>
          <a
            href="/contact?topic=shipping"
            className="btn btn-primary"
            title="Contact support about shipping"
            aria-label="Contact support about shipping"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}