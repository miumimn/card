import React from "react";
import { MapPin, Phone } from "lucide-react";

export type MechanicProps = {
  brand?: { name?: string; tagline?: string; avatar?: string };
  services?: { title: string; desc?: string }[];
  address?: string;
  phone?: string;
  gallery?: string[];
  socials?: { website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

const sample = ["/templates/garage1.jpg", "/templates/garage2.jpg", "/templates/garage3.jpg"];

export default function MechanicTemplate({
  brand = {},
  services = [],
  address,
  phone,
  gallery = [],
  socials = {},
  ariaLabel = "Mechanic profile",
  onBook,
}: MechanicProps) {
  const effectiveGallery = (gallery && gallery.length ? gallery : sample).slice(0, 6);
  return (
    <div className="me-page" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero" aria-label="Garage hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effectiveGallery[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Torque Garage"}</h1>
            <div className="role">{brand.tagline || "Servicing, Diagnostics & Repairs"}</div>
            <div style={{ marginTop: 8, color: "var(--muted)" }}>{address}</div>
          </div>
        </section>

        <nav className="tabs" role="tablist">
          <button className="tab active" data-tab="services">Services</button>
          <button className="tab" data-tab="pricing">Pricing</button>
          <button className="tab" data-tab="reviews">Reviews</button>
          <button className="tab" data-tab="location">Location</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="services" className="panel active">
            {(services && services.length ? services : [
              { title: "Diagnostics & Repairs", desc: "Full engine diagnostics" },
              { title: "Brakes & Suspension", desc: "Pads, discs & alignment" },
              { title: "Servicing", desc: "Full & interim services" },
            ]).map((s, i) => (
              <div className="service" key={i} style={{ marginTop: 8 }}>
                <strong>{s.title}</strong>
                {s.desc && <div className="sub" style={{ color: "var(--muted)" }}>{s.desc}</div>}
              </div>
            ))}
          </article>

          <article id="pricing" className="panel">
            <p style={{ color: "var(--muted)" }}>Labour + parts — transparent estimates available.</p>
          </article>

          <article id="reviews" className="panel">
            <div style={{ marginTop: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8 }}> "Quick and honest." — P</div>
            </div>
          </article>

          <article id="location" className="panel">
            <h3 style={{ marginTop: 0 }}>Location</h3>
            <div style={{ marginTop: 8 }}>
              <MapPin size={16} /> {address || "5 Mechanic Row, Industrial Park"}
            </div>
          </article>

          <article id="contact" className="panel">
            <h3>Contact</h3>
            <p style={{ margin: 0 }}>Phone: <a href={phone ? `tel:${phone}` : "#"}>{phone || "Call us"}</a></p>
            <div style={{ marginTop: 10 }}>
              <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book service stub")}>Book Service</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}