"use client";
import { useCallback, useState } from "react";

/**
 * useOrderSubmit
 * - Generates orderId (if not provided)
 * - Posts payload to /api/order (recommended server proxy). Falls back to direct URL if needed.
 * - Shows a polished success overlay with orderId on success.
 * - Dispatches a CustomEvent "nexcard:orderSuccess" with { orderId, result } for other parts of the app to react.
 *
 * Integration:
 * - In your Shop.tsx place-order handler:
 *    const { submitOrder, submitting } = useOrderSubmit();
 *    const orderId = await submitOrder(payload);
 *    // then clear cart state, redirect, etc.
 */

function generateOrderId() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  const tail = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
  return `NX-${rand}-${tail}`;
}

export default function useOrderSubmit() {
  const [submitting, setSubmitting] = useState(false);

  const showSuccessOverlay = useCallback((orderId: string) => {
    // create overlay and append to document.body
    try {
      const overlay = document.createElement("div");
      overlay.className = "order-success-overlay";
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      overlay.innerHTML = `
        <div class="order-success-card" tabindex="-1">
          <svg class="order-checkmark" viewBox="0 0 52 52" aria-hidden="true">
            <circle class="order-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="order-check" fill="none" d="M14 27l7 7 17-17"/>
          </svg>

          <h3 class="order-title">Order submitted</h3>
          <p class="order-sub">Thanks — your NexCard order is being processed.</p>

          <div class="order-meta">
            <div><strong>Order ID</strong></div>
            <div class="order-id">${orderId}</div>
          </div>

          <div class="order-actions">
            <a class="btn btn-ghost order-print" href="#" role="button">Print / Save</a>
            <button class="btn btn-primary order-continue">Continue</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Print / Save button -> open printable window of order id
      const printBtn = overlay.querySelector<HTMLAnchorElement>(".order-print");
      if (printBtn) {
        printBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const w = window.open("", "_blank", "width=600,height=480");
          if (!w) return;
          w.document.write(`<pre style="font-family:Inter,system-ui; padding:18px;">Order ID: ${orderId}\n\nPlease keep this ID for payment confirmation and support.\n\nNEXCARD</pre>`);
          w.document.title = `NEXCARD Order ${orderId}`;
          w.document.close();
        });
      }

      // Continue button closes overlay and optionally navigate to editor
      const contBtn = overlay.querySelector<HTMLButtonElement>(".order-continue");
      if (contBtn) {
        contBtn.addEventListener("click", () => {
          overlay.remove();
          // example redirect (optional)
          // window.location.href = "/editor";
        });
      }

      // focus for accessibility
      const card = overlay.querySelector<HTMLElement>(".order-success-card");
      if (card) card.focus();

      // auto-remove after 12 seconds
      setTimeout(() => {
        try { overlay.remove(); } catch {}
      }, 12000);
    } catch (err) {
      console.warn("showSuccessOverlay error:", err);
    }
  }, []);

  const submitOrder = useCallback(async (payload: Record<string, any>) => {
    setSubmitting(true);
    try {
      // ensure there's an orderId
      if (!payload.orderId) payload.orderId = generateOrderId();

      // prefer your internal proxy so the Apps Script URL is hidden
      const apiPath = "/api/order";
      let res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // if proxy not configured and returns 5xx/404, optionally fallback to direct script URL
      if (!res.ok) {
        // attempt fallback to direct Apps Script URL if you want (set DIRECT_SCRIPT_URL)
        const DIRECT_SCRIPT_URL = (window as any).__NEXCARD_DIRECT_SCRIPT_URL || "";
        if (DIRECT_SCRIPT_URL) {
          res = await fetch(DIRECT_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }

      const text = await res.text().catch(() => "");
      // Try parse JSON response if present
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }

      // on success show overlay
      const orderId = payload.orderId;
      showSuccessOverlay(orderId);

      // notify other parts of the app (e.g., to clear cart state)
      const ev = new CustomEvent("nexcard:orderSuccess", { detail: { orderId, result: json } });
      window.dispatchEvent(ev);

      return orderId;
    } catch (err) {
      console.error("submitOrder error:", err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [showSuccessOverlay]);

  return { submitOrder, submitting };
}