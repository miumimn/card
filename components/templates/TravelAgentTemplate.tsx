import React from "react";
import { Globe, MapPin } from "lucide-react";

export type Trip = { title: string; blurb?: string; image?: string };

export type TravelAgentProps = {
  brand?: { name?: string; tagline?: string; avatar?: string };
  packages?: Trip[];
  deals?: string[];
  gallery?: string[];
  socials?: { instagram?: string; whatsapp?: string; website?: string };
  ariaLabel?: string;
  onRequestQuote?: () => void;
};

const sample = ["/templates/travel1.jpg", "/templates/travel2.jpg", "/templates/travel3.jpg"];

export default function TravelAgentTemplate({
  brand = {},
  packages = [],
  deals = [],
  gallery = [],
  socials = {},
  ariaLabel = "Travel Agent",
  onRequestQuote,
}: TravelAgentProps) {
  const effectiveGallery = (gallery && gallery.length ? gallery : sample).slice(0, 6);
  return (
    <div className="travel-page" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero" style={{ backgroundImage: `url('${effectiveGallery[0]}')` }}>
          <div className="hero-left">
            <div className="brand">
              <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effectiveGallery[1]}')` }} />
              <div>
                <h1 className="title">{brand.name || "WanderWize"}</h1>
                <div className="subtitle">{brand.tagline || "Curated escapes & boutique trips"}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, color: "var(--ta-muted)" }}>Dream trips, small-group adventures and luxury escapes.</div>
          </div>

          <aside className="hero-right" aria-hidden>
            <div style={{ fontWeight: 900 }}>Find packages</div>
            <div style={{ marginTop: 8 }}>
              <input placeholder="Search destinations or themes" style={{ padding: 8, borderRadius: 8, width: "100%", background: "rgba(255,255,255,0.03)", border: "none", color: "var(--ta-text)" }} />
              <button style={{ marginTop: 8 }} onClick={() => onRequestQuote ? onRequestQuote() : alert("Find stub")}>Find</button>
            </div>
          </aside>
        </section>

        <nav className="tabs">
          <button className="tab active" data-tab="itineraries">Itineraries</button>
          <button className="tab" data-tab="deals">Deals</button>
          <button className="tab" data-tab="testimonials">Testimonials</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="itineraries" className="panel active">
            <div className="it-grid">
              {(packages && packages.length ? packages : [
                { title: "7‑Day Island Escape", blurb: "Snorkel & sunset dinners", image: effectiveGallery[1] },
                { title: "European Rail Loop", blurb: "City stays & rail pass", image: effectiveGallery[2] },
              ]).map((p, i) => (
                <div className="it-card" key={i}>
                  <h4>{p.title}</h4>
                  {p.blurb && <div style={{ color: "var(--ta-muted)" }}>{p.blurb}</div>}
                </div>
              ))}
            </div>
          </article>

          <article id="deals" className="panel">
            <h3>Seasonal Offers</h3>
            <p style={{ color: "var(--ta-muted)" }}>{(deals && deals.length ? deals.join(" • ") : "Sign up for early-bird discounts.")}</p>
          </article>

          <article id="contact" className="panel">
            <p>Email: <a href={`mailto:hello@${(brand.name || "wanderwize").replace(/\s+/g, "").toLowerCase()}.com`}>hello@{(brand.name || "wanderwize").replace(/\s+/g, "").toLowerCase()}.com</a></p>
          </article>
        </section>
      </main>
    </div>
  );
}