import React from "react";
import { ShoppingCart, Globe, Instagram } from "lucide-react";

export type Listing = {
  id?: string | number;
  name: string;
  price?: string;
  image?: string;
  desc?: string;
  url?: string;
};

export type SellerProps = {
  brand?: { name?: string; tagline?: string; avatar?: string; website?: string };
  listings?: Listing[];
  socials?: { instagram?: string; website?: string; whatsapp?: string };
  ariaLabel?: string;
  onBuy?: (listing: Listing) => void;
};

const sampleListings: Listing[] = [
  { name: "Soy Candle — Citrus", price: "$14", image: "/templates/product1.jpg", desc: "40+ hour burn." },
  { name: "Lavender Soap", price: "$8", image: "/templates/product2.jpg", desc: "Cold processed." },
  { name: "Stoneware Mug", price: "$28", image: "/templates/product3.jpg", desc: "Wheel-thrown mug." },
];

export default function SellerTemplate({
  brand = {},
  listings = [],
  socials = {},
  ariaLabel = "Seller storefront",
  onBuy,
}: SellerProps) {
  const items = listings && listings.length ? listings : sampleListings;
  return (
    <div className="seller" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero" aria-label="Store hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || items[0].image}')` }} />
          <div className="meta">
            <h1 className="brand">{brand.name || "Corner Craft Co."}</h1>
            <div className="tagline">{brand.tagline || "Handmade goods & daily essentials"}</div>

            <div className="stats" aria-hidden="true" style={{ marginTop: 8 }}>
              <div className="stat">4.9 ★ (324)</div>
              <div className="stat">Free pickup</div>
            </div>

            <div className="seller-search" role="search" aria-label="Search products" style={{ marginTop: 10 }}>
              <input type="search" placeholder="Search products..." className="input" />
              <button className="btn buy" onClick={() => window.alert("Search stub")}>Search</button>
            </div>

            <div className="categories" aria-hidden="true" style={{ marginTop: 8 }}>
              <button className="cat active">All</button>
              <button className="cat">Home</button>
              <button className="cat">Gifts</button>
            </div>
          </div>
        </section>

        <section className="listings" aria-live="polite">
          {items.map((it, i) => (
            <article className="listing" key={i} data-name={it.name}>
              <img src={it.image} alt={it.name} />
              <div className="listing-body">
                <h4 className="listing-title">{it.name}</h4>
                <p className="listing-desc">{it.desc}</p>
                <div className="price-row">
                  <div className="price">{it.price}</div>
                  <div className="btn-row">
                    <button className="btn details" onClick={() => it.url ? window.open(it.url, "_blank") : alert("details stub")}>Details</button>
                    <button className="btn buy" onClick={() => onBuy ? onBuy(it) : alert("buy stub for " + it.name)}>Buy</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="store-info" aria-label="Store info">
          <div className="store-meta">
            <div><strong>{brand.name || "Corner Craft Co."}</strong></div>
            <div className="muted">Open: Mon–Sat • 9:00–18:00</div>
            <div className="muted">Address: 88 Market Lane</div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="qr" aria-hidden>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${brand.website || "https://example.com"}`} alt="QR to store" />
            </div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>Download store link</div>
              <a className="btn buy" href={brand.website || "#"}>Visit</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}