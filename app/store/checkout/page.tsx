import React from "react";
import "../styles.css";

/**
 * Checkout page (Server Component)
 * - Loads client CheckoutClient which manages payment & submission to /api/orders
 *
 * NOTE: CheckoutClient is a client component wrapper that mounts the client CheckoutForm.
 */

import CheckoutClient from "../components/CheckoutClient";

export default function CheckoutPage() {
  return (
    <div className="checkout-page">
      <div className="store-container">
        <h1>Checkout</h1>
        <p className="muted">Complete your NexCard order — we currently use a secure, simulated checkout for demo.</p>

        <CheckoutClient />
      </div>
    </div>
  );
}