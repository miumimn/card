"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Shop (Client) - simplified
 * - Only two card categories: "personal" | "business"
 * - Single physical finish (no variants)
 * - Pricing differs by category (constants at top)
 * - Cart items include cardCategory so Checkout prefills and receives it
 */

type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  cardCategory?: "personal" | "business";
};

const PRICES = {
  personal: 10.0,
  business: 20.0, // change this to whatever business price you prefer
};

const PRODUCT = {
  id: "nexcard-standard",
  title: "NexCard",
  desc:
    "Smart NFC card that links to your live NexCard profile — one tap, instant sharing. Choose Personal or Business templates.",
  images: ["/thumbs/normal-profile.png"],
};

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("nexcart:v1");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem("nexcart:v1", JSON.stringify(items));
}

export default function Shop() {
  const [qty, setQty] = useState<number>(1);
  const [cardCategory, setCardCategory] = useState<"personal" | "business">("personal");
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCart(readCart());
  }, []);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  function addToCart() {
    const price = PRICES[cardCategory];
    const existingIndex = cart.findIndex(
      (c) => c.id === PRODUCT.id && c.cardCategory === cardCategory
    );

    if (existingIndex >= 0) {
      const copy = [...cart];
      copy[existingIndex].qty += qty;
      setCart(copy);
    } else {
      setCart([
        ...cart,
        {
          id: PRODUCT.id,
          title: `${PRODUCT.title} — ${cardCategory === "business" ? "Business" : "Personal"}`,
          price,
          qty,
          cardCategory,
        },
      ]);
    }
  }

  function removeItem(index: number) {
    const copy = [...cart];
    copy.splice(index, 1);
    setCart(copy);
  }

  function total() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  // Add to cart and go to checkout (Buy now behavior)
  function handleBuyNow() {
    addToCart();
    // give localStorage a tick to update, then navigate
    setTimeout(() => {
      router.push("/store/checkout");
    }, 60);
  }

  return (
    <div className="shop">
      <div className="product-card">
        <div className="product-media" style={{ backgroundImage: `url(${PRODUCT.images[0]})` }} />
        <div className="product-body">
          <h3>{PRODUCT.title}</h3>
          <p className="muted">{PRODUCT.desc}</p>

          <div style={{ marginTop: 12 }}>
            <label className="muted" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>Card category</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={`primary-btn ${cardCategory === "personal" ? "" : "alt"}`}
                onClick={() => setCardCategory("personal")}
                aria-pressed={cardCategory === "personal"}
              >
                Personal — ${PRICES.personal.toFixed(2)}
              </button>
              <button
                type="button"
                className={`primary-btn ${cardCategory === "business" ? "" : "alt"}`}
                onClick={() => setCardCategory("business")}
                aria-pressed={cardCategory === "business"}
              >
                Business — ${PRICES.business.toFixed(2)}
              </button>
            </div>
            <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
              Business templates are optimized for company profiles; Personal templates for creators.
            </div>
          </div>

          <div className="row" style={{ marginTop: 12, alignItems: "center", gap: 8 }}>
            <label className="muted" style={{ fontSize: 13 }}>Qty</label>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
              <input value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} />
              <button onClick={() => setQty(qty + 1)} aria-label="Increase">+</button>
            </div>

            <div style={{ marginLeft: "auto", fontWeight: 800 }}>
              ${(PRICES[cardCategory] * qty).toFixed(2)}
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button className="primary-btn" onClick={() => { addToCart(); }}>
              Add to cart
            </button>

            <button className="primary-btn alt" onClick={handleBuyNow} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              Buy now
            </button>
          </div>
        </div>
      </div>

      <aside className="cart-panel">
        <h4>Your cart</h4>
        {cart.length === 0 ? (
          <div className="muted">Cart is empty</div>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((it, i) => (
                <li key={i} className="cart-item">
                  <div>
                    <div style={{ fontWeight: 700 }}>{it.title}</div>
                    <div className="muted">{it.qty} × ${it.price.toFixed(2)}</div>
                    {it.cardCategory ? <div className="muted" style={{ fontSize: 12 }}>{it.cardCategory === "business" ? "Business" : "Personal"}</div> : null}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800 }}>${(it.price * it.qty).toFixed(2)}</div>
                    <button className="btn-ghost" onClick={() => removeItem(i)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              <div className="muted">Total</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>${total().toFixed(2)}</div>
              <Link href="/store/checkout" className="primary-btn" style={{ marginTop: 10 }}>
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}