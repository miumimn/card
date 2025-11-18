"use client";
import React, { useState } from "react";

/**
 * Snippet: integrate into your ShopClient submit flow.
 * - generateOrderId()
 * - post to /api/orders (server proxy that forwards to Apps Script)
 * - show success UI with orderId
 */

function generateOrderId() {
  // NX-<8char base36>-<4digit>
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  const tail = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
  return `NX-${rand}-${tail}`;
}

export default function ExampleOrderSubmit({ cart, customer }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<null | { orderId: string; result?: any }>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitOrder() {
    setSubmitting(true);
    setError(null);

    const orderId = generateOrderId();

    // Build payload - adapt fields to your real data shape
    const payload = {
      orderId,
      fullName: customer.name,
      email: customer.email,
      phone: customer.phone,
      street: customer.street,
      city: customer.city,
      country: customer.country,
      cardType: cart.cardType,
      customText: cart.customText,
      logo: cart.logoUrl,
      paymentMethod: "pending",
      notes: cart.notes,
      items: cart.items, // optional: include items array
      total: cart.total
    };

    try {
      // Post to your server proxy (note: plural "orders")
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({ ok: res.ok, status: res.status, raw: "" }));

      if (!res.ok || !data.ok) {
        const message = data?.error || data?.scriptResponse?.error || JSON.stringify(data).slice(0, 2000);
        throw new Error(message || "Failed to submit order");
      }

      // Success: show advanced success UI including orderId
      setSuccess({ orderId, result: data });
      // Clear/empty cart in your app state here
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="order-success">
        <h3>Order submitted</h3>
        <p>Thanks, your NexCard order is being processed.</p>

        <div className="order-meta">
          <div><strong>Order ID</strong></div>
          <div className="order-id">{success.orderId}</div>
        </div>

        <div className="order-actions" style={{ marginTop: 12 }}>
          <a href={`/order/${success.orderId}`} className="btn btn-ghost">Print / Save</a>
          <button className="btn btn-primary" onClick={() => {
            // optionally redirect to a "Continue order" or editor page
            window.location.href = "/editor"; //will return to this
          }}>Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Render your real checkout form / summary */}
      <button onClick={submitOrder} disabled={submitting} className="btn btn-primary">
        {submitting ? "Submitting..." : "Place order"}
      </button>
      {error && <div role="alert" style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
    </div>
  );
}