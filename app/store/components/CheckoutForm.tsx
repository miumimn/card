"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * CheckoutForm (Client)
 * - Single canonical POST to /api/orders
 * - Snapshots cart + total on success so modal/receipt show correct values even after cart is cleared
 * - Preserves the "notes" field and includes it in payload + modal + receipt
 * - Robust printable receipt: tries new tab, falls back to in-page print if popups blocked
 * - ALWAYS uses the site logo at /thumbs/logo.png for the receipt (ignores any custom logo URL)
 */

type CartItem = { id: string; title: string; price: number; qty: number; cardCategory?: string };

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("nexcart:v1");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function generateOrderId() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  const tail = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
  return `NX-${rand}-${tail}`;
}

export default function CheckoutForm() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [cardCategory, setCardCategory] = useState<"personal" | "business" | "">("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customText, setCustomText] = useState("");
  // keep a local input for logo if you want, but it will NOT be used by receipt
  const [logo, setLogo] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // snapshot of the cart and total to show in modal/print after cart cleared
  const [orderSnapshot, setOrderSnapshot] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // derived state: whether all cart items share same category
  const [uniformCategory, setUniformCategory] = useState<null | string>(null);

  useEffect(() => {
    const c = readCart();
    setCart(c);

    if (!c || c.length === 0) {
      router.replace("/store");
      return;
    }

    // ensure we only keep string categories (filter type-guard), so cats[0] is string (not string|undefined)
    const cats = Array.from(
      new Set(
        c
          .map((i) => i.cardCategory)
          .filter((x): x is string => !!x && typeof x === "string")
      )
    );

    if (cats.length === 1) {
      setUniformCategory(cats[0]);
      setCardCategory(cats[0] as "personal" | "business");
    } else {
      setUniformCategory(null);
      if (!cardCategory) setCardCategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function postOrderToApi(payload: any) {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      let parsedBody: any = null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        parsedBody = await res.json().catch(() => null);
      } else {
        const text = await res.text().catch(() => "");
        parsedBody = { rawText: text };
      }

      return { ok: res.ok, status: res.status, body: parsedBody };
    } catch (err) {
      console.error("postOrderToApi network error:", err);
      return { ok: false, error: String(err) };
    }
  }

  function buildPayload() {
    const cardType = cardCategory || (cart[0] && cart[0].cardCategory) || "";

    // include common variants so Apps Script accepts fields
    return {
      name,
      fullName: name,
      email,
      emailAddress: email,
      phone,
      street,
      address: street,
      city,
      state,
      country,
      cardCategory: cardType,
      cardType,
      paymentMethod,
      customText,
      // logo field kept in payload for other uses, but receipt WILL NOT use it
      logo,
      logoUrl: logo,
      notes,
      cart,
      total: subtotal(),
      meta: { source: "web-store", createdAt: new Date().toISOString() },
    };
  }

  // Simplified: single canonical POST to /api/orders
  async function placeOrder(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setMessage(null);

    if (!name || !email || cart.length === 0) {
      setError("Please provide your name, email and add at least one card to the cart.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    const hasCategoryInCart = cart.some((it) => !!it.cardCategory);
    if (!cardCategory && !hasCategoryInCart) {
      setError("Please choose a card category: Business or Personal.");
      return;
    }

    setProcessing(true);

    const generatedOrderId = generateOrderId();
    // cast payload to any so we can add orderId without widening the return type of buildPayload
    const payload = buildPayload() as any;
    payload.orderId = generatedOrderId;

    try {
      const apiResult = await postOrderToApi(payload);

      if (!apiResult.ok) {
        const statusText = apiResult.status ? ` (${apiResult.status})` : "";
        const backendMsg =
          apiResult.body?.error ||
          apiResult.body?.scriptResponse?.error ||
          apiResult.body?.scriptResponse?.raw ||
          "";
        setError(backendMsg || `Server error${statusText}. Please try again.`);
        if (apiResult.body) {
          console.error("Orders API raw response (truncated):", JSON.stringify(apiResult.body).slice(0, 2000));
        }
        setProcessing(false);
        return;
      }

      const serverId = apiResult.body?.orderId || apiResult.body?.id;
      const finalId = serverId || generatedOrderId;
      setOrderId(finalId);

      // Snapshot cart and subtotal BEFORE clearing the cart so the modal/receipt show the real values
      const finalTotal = subtotal();
      setOrderTotal(finalTotal);
      setOrderSnapshot(cart.slice()); // shallow copy

      // Clear cart after snapshot
      localStorage.removeItem("nexcart:v1");
      setCart([]);
      setMessage("Order received — preparing confirmation...");
      setShowModal(true);

      window.dispatchEvent(new CustomEvent("nexcard:orderSuccess", { detail: { orderId: finalId, result: apiResult.body } }));
    } catch (err: any) {
      console.error("Order submit error:", err);
      setError(err?.message || "Network error while placing order");
    } finally {
      setProcessing(false);
    }
  }

  function retryPlaceOrder() {
    setError(null);
    placeOrder();
  }

  function closeModal() {
    setShowModal(false);
  }

  // Robust printReceipt: ALWAYS uses the site's logo at /thumbs/logo.png (absolute URL),
  // tries new tab first, falls back to in-page print if popup blocked.
  function printReceipt() {
    // Build absolute default logo path (so new tab can load it)
    const defaultLogoPath =
      typeof window !== "undefined" && window.location && window.location.origin
        ? `${window.location.origin}/thumbs/logo.png`
        : "/thumbs/logo.png";

    // IMPORTANT: Ignore any user-provided logo value. Always use defaultLogoPath.
    const logoUrl = defaultLogoPath;

    const orderDate = new Date().toLocaleString();
    const companyName = "NEXCARD";

    function escapeHtml(str: any) {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    const itemsHtml = (orderSnapshot && orderSnapshot.length)
      ? orderSnapshot
          .map((it) => {
            const lineTotal = (it.price * it.qty).toFixed(2);
            const unit = it.price.toFixed(2);
            return `<tr>
              <td style="padding:8px 10px; text-align:center; width:64px;">${it.qty}</td>
              <td style="padding:8px 10px; font-size:13px;">${escapeHtml(it.title)}</td>
              <td style="padding:8px 10px; text-align:right; width:90px;">$${unit}</td>
              <td style="padding:8px 10px; text-align:right; width:90px; font-weight:700;">$${lineTotal}</td>
            </tr>`;
          })
          .join("")
      : `<tr><td colspan="4" style="padding:12px; text-align:center; color: #666;">No items</td></tr>`;

    // fallback inline SVG if logo fails to load
    const fallbackSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60' viewBox='0 0 200 60'><rect width='200' height='60' fill='%23f0f3ff'/><text x='100' y='36' font-family='Arial, sans-serif' font-size='18' fill='%23675bff' text-anchor='middle'>NEXCARD</text></svg>`;
    const encodedFallback = encodeURIComponent(fallbackSvg);
    const imgOnError = `this.onerror=null;this.src='data:image/svg+xml;utf8,${encodedFallback}';`;

    const receiptHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Receipt — ${escapeHtml(orderId || "")}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
      :root{--accent:#222;--muted:#666;--bg:#fff;--paper:#f7f7f9}
      html,body{height:100%;margin:0;padding:0;background:var(--paper);font-family:Inter, "Helvetica Neue", Arial, sans-serif;color:#111}
      .wrap{max-width:480px;margin:28px auto;padding:18px;background:var(--bg);border-radius:8px;border:1px solid #e9e9ef}
      .head{display:flex;align-items:center;gap:12px;border-bottom:1px dashed #eee;padding-bottom:12px}
      .logo{width:64px;height:64px;border-radius:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;overflow:hidden}
      .logo img{width:100%;height:100%;object-fit:contain;display:block}
      .title{flex:1}
      .title h2{margin:0;font-size:16px}
      .meta{font-size:12px;color:var(--muted);text-align:right}
      .meta .id{font-family: ui-monospace, SFMono-Regular, Menlo, monospace;letter-spacing:0.6px}
      .body{padding-top:14px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      thead th{font-size:12px;color:var(--muted);text-align:left;padding:8px 0;border-bottom:1px dashed #eee}
      tbody td{padding:6px 0;border-bottom:1px solid #fafafb}
      .totals{display:flex;justify-content:flex-end;margin-top:12px;gap:8px;align-items:center}
      .totals .label{font-size:13px;color:var(--muted);min-width:120px;text-align:right}
      .totals .value{font-weight:800;font-size:16px;min-width:120px;text-align:right}
      .notes{margin-top:14px;padding:10px;border-radius:6px;background:#fbfbff;color:var(--muted);font-size:13px}
      .footer{margin-top:16px;padding-top:12px;border-top:1px dashed #eee;font-size:12px;color:var(--muted);display:flex;justify-content:space-between}
      @media print{
        body{background:white}
        .wrap{box-shadow:none;border:none;margin:0;border-radius:0}
      }
    </style>
  </head>
  <body>
    <div class="wrap" role="document">
      <div class="head">
        <div class="logo">
          <img src="${escapeHtml(logoUrl)}" alt="NEXCARD logo" onerror="${imgOnError}">
        </div>
        <div class="title">
          <h2>${escapeHtml(companyName)}</h2>
          <div style="font-size:13px;color:var(--muted)">Order Receipt</div>
        </div>
        <div class="meta">
          <div>${escapeHtml(orderDate)}</div>
          <div class="id">#${escapeHtml(orderId || "")}</div>
        </div>
      </div>

      <div class="body">
        <div style="display:flex;justify-content:space-between;gap:12px;margin-top:12px">
          <div>
            <div style="font-size:13px;color:var(--muted)">Billed to</div>
            <div style="font-weight:700">${escapeHtml(name || "")}</div>
            <div style="font-size:13px;color:var(--muted)">${escapeHtml(email || "")}</div>
            <div style="font-size:13px;color:var(--muted);margin-top:6px">${escapeHtml([street, city, country].filter(Boolean).join(", "))}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;color:var(--muted)">Payment</div>
            <div style="font-weight:700;margin-top:6px">${escapeHtml(paymentMethod || "—")}</div>
          </div>
        </div>

        <div style="margin-top:14px">
          <table aria-label="Items">
            <thead>
              <tr>
                <th style="width:64px;text-align:center">Qty</th>
                <th>Description</th>
                <th style="width:90px;text-align:right">Unit</th>
                <th style="width:90px;text-align:right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="totals" aria-hidden="true">
          <div style="text-align:right">
            <div class="label">Subtotal</div>
            <div class="label" style="margin-top:6px">Tax</div>
            <div class="label" style="margin-top:10px">Total</div>
          </div>
          <div>
            <div class="value">$${orderTotal.toFixed(2)}</div>
            <div class="value" style="margin-top:6px">$0.00</div>
            <div class="value" style="margin-top:10px">$${orderTotal.toFixed(2)}</div>
          </div>
        </div>

        ${notes ? `<div class="notes"><strong>Notes</strong><div style="margin-top:6px">${escapeHtml(notes)}</div></div>` : ""}

        <div class="footer">
          <div>Thank you for your purchase</div>
          <div>Order ID: <strong>${escapeHtml(orderId||"")}</strong></div>
        </div>
      </div>
    </div>

    <script>
      (function(){ 
        function tryPrint(){ try{ window.focus(); window.print(); }catch(e){ window.print(); } }
        var imgs = document.images;
        if(imgs && imgs.length){ var loaded=0, done=false; for(var i=0;i<imgs.length;i++){ imgs[i].onload=imgs[i].onerror=function(){ loaded++; if(!done && loaded>=imgs.length){ done=true; tryPrint(); } } } setTimeout(function(){ if(!done){ tryPrint(); done=true } }, 1500); } else { setTimeout(tryPrint, 200); }
      })();
    </script>
  </body>
  </html>`;

    // Try opening a new tab synchronously. If blocked, fallback to in-page print container.
    let newWin: Window | null = null;
    try {
      newWin = window.open("", "_blank", "noopener");
    } catch (e) {
      newWin = null;
    }

    if (newWin) {
      // new tab opened — write and let it auto-print
      try {
        newWin.document.open();
        newWin.document.write(receiptHtml);
        newWin.document.close();
        return;
      } catch (err) {
        // if writing failed, close tab and fallback
        try { newWin.close(); } catch (e) {}
        newWin = null;
      }
    }

    // Fallback: inject a print-only container into current document and print
    const containerId = "nexcard-receipt-print-container";
    // remove existing if present
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = containerId;
    container.style.display = "block";
    container.innerHTML = receiptHtml;
    document.body.appendChild(container);

    // Insert print-only CSS that hides everything except the receipt container while printing
    const styleId = "nexcard-receipt-print-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #${containerId}, #${containerId} * { visibility: visible !important; }
        #${containerId} { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `;
      document.head.appendChild(styleEl);
    }

    // Give browser a tick to render then print, then cleanup
    setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.warn("print failed:", e);
      }
      // cleanup after print (give some time)
      setTimeout(() => {
        try { container.remove(); } catch (e) {}
        try { styleEl && styleEl.remove(); } catch (e) {}
      }, 500);
    }, 200);
  }

  if (showModal && orderId) {
    return (
      <>
        <div style={modalOverlayStyle} role="dialog" aria-modal="true" aria-label="Order confirmation">
          <div style={modalStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={successBadgeStyle}>✓</div>
              <div>
                <h2 style={{ margin: 0 }}>Order submitted</h2>
                <p style={{ margin: 0, color: "var(--muted)" }}>Thanks — your NexCard order is being processed.</p>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ color: "var(--muted)", marginBottom: 6 }}>Order ID</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{orderId}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ color: "var(--muted)", marginBottom: 6 }}>Summary</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {orderSnapshot.length === 0 ? (
                  <li style={{ color: "var(--muted)" }}>No items (cart cleared)</li>
                ) : (
                  orderSnapshot.map((it, i) => (
                    <li key={i}>
                      {it.qty} × {it.title} — ${(it.price * it.qty).toFixed(2)}
                    </li>
                  ))
                )}
              </ul>
              <div style={{ marginTop: 10, fontWeight: 800 }}>Total: ${orderTotal.toFixed(2)}</div>
              {notes ? <div style={{ marginTop: 6, color: "var(--muted)" }}>Notes: {notes}</div> : null}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="primary-btn" onClick={() => { closeModal(); window.location.href = "/templates-preview"; }}>
                Browse templates
              </button>
              <button className="primary-btn alt" onClick={() => { printReceipt(); }}>
                Print / Save
              </button>
              <button className="primary-btn alt" onClick={() => { closeModal(); }}>
                Close
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: 12 }}>
          <div className="muted">Order submitted — confirmation modal open.</div>
        </div>
      </>
    );
  }

  const categoriesInCart = Array.from(new Set(cart.map((i) => i.cardCategory).filter(Boolean)));
  const showCategorySelect = categoriesInCart.length > 1 || categoriesInCart.length === 0;

  return (
    <form className="checkout-form" onSubmit={placeOrder} id="checkoutForm" noValidate>
      <div className="checkout-grid">
        <div>
          <label className="muted">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>

        <div>
          <label className="muted">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
        </div>

        <div>
          <label className="muted">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
        </div>

        <div>
          <label className="muted">Street</label>
          <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St" />
        </div>

        <div>
          <label className="muted">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        </div>

        <div>
          <label className="muted">State / Province</label>
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State / Province" />
        </div>

        <div>
          <label className="muted">Country</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
        </div>

        <div>
          <label className="muted">Card category</label>

          {!showCategorySelect ? (
            <div style={{ padding: "8px 10px", borderRadius: 8, background: "var(--card)", display: "inline-block", fontWeight: 700 }}>
              {uniformCategory === "business" ? "Business" : "Personal"}
            </div>
          ) : (
            <select value={cardCategory} onChange={(e) => setCardCategory(e.target.value as "personal" | "business" | "")}>
              <option value="">Select</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          )}
        </div>

        <div>
          <label className="muted">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Select</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Money">Mobile Money</option>
          </select>
        </div>

        <div>
          <label className="muted">Custom text (optional)</label>
          <input value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Text to print on card (optional)" />
        </div>

        <div>
          <label className="muted">Logo URL (optional)</label>
          <input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://example.com/logo.png" />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label className="muted">Additional notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <h4>Order summary</h4>
      {cart.length === 0 ? <div className="muted">Your cart is empty.</div> : (
        <ul className="cart-list">
          {cart.map((it, i) => (
            <li key={i} className="cart-item">
              <div>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                <div className="muted">{it.qty} × ${it.price.toFixed(2)}</div>
                {it.cardCategory ? <div className="muted" style={{ fontSize: 12 }}>{it.cardCategory}</div> : null}
              </div>
              <div style={{ fontWeight: 800 }}>${(it.price * it.qty).toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-footer">
        <div className="muted">Subtotal</div>
        <div style={{ fontWeight: 900, fontSize: 18 }}>${subtotal().toFixed(2)}</div>
      </div>

      {message ? <p id="form-message" className="form-message" style={{ color: "#0b1720", marginTop: 8 }}>{message}</p> : null}
      {error ? (
        <div className="error" role="alert" style={{ marginTop: 8 }}>
          {error}
          <div style={{ marginTop: 8 }}>
            <button className="primary-btn alt" onClick={retryPlaceOrder} disabled={processing}>
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="primary-btn" type="submit" disabled={processing || cart.length === 0}>
          {processing ? "Processing…" : `Confirm & Submit`}
        </button>
        <button
          type="button"
          className="primary-btn alt"
          onClick={() => {
            router.push("/store");
          }}
        >
          Back to shop
        </button>
      </div>
    </form>
  );
}

/* inline modal styles */
const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(2,6,23,0.5)",
  zIndex: 2000,
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "var(--card)",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 20px 60px rgba(2,6,23,0.5)",
  border: "1px solid var(--border-weak)",
  color: "var(--text)",
};

const successBadgeStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 12,
  background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
  color: "#06101a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 20,
};