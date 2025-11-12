import React from "react";
import { Instagram } from "lucide-react";

export type HairdresserProps = {
  brand?: { name?: string; tagline?: string; avatar?: string };
  portfolio?: string[];
  services?: { name: string; price?: string }[];
  socials?: { instagram?: string; website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function HairdresserTemplate({
  brand = {},
  portfolio = [],
  services = [],
  socials = {},
  ariaLabel = "Hairdresser",
  onBook,
}: HairdresserProps) {
  const sample = ["/templates/hair1.jpg", "/templates/hair2.jpg", "/templates/hair3.jpg"];
  const effective = (portfolio && portfolio.length ? portfolio : sample).slice(0, 6);

  return (
    <div className="ides" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effective[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Studio Luxe"}</h1>
            <div className="role">{brand.tagline || "Hairdresser — Styling & Coloring"}</div>
            <nav className="social-row">
              {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="social"><Instagram className="icon" /></a>}
            </nav>
          </div>
        </section>

        <nav className="tabs">
          <button className="tab active" data-tab="portfolio">Portfolio</button>
          <button className="tab" data-tab="services">Services</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="portfolio" className="panel active">
            <div className="gallery" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
              {effective.map((s, i) => <img key={i} src={s} alt={`Style ${i + 1}`} />)}
            </div>
          </article>

          <article id="services" className="panel">
            <div style={{ display: "grid", gap: 8 }}>
              {(services && services.length ? services : [{ name: "Cut & Style", price: "$45" }, { name: "Color", price: "$80+" }]).map((s, i) => (
                <div className="service" key={i}><strong>{s.name}</strong> {s.price && <span style={{ float: "right", fontWeight: 900 }}>{s.price}</span>}</div>
              ))}
            </div>
          </article>

          <article id="contact" className="panel">
            <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book stub")}>Book Appointment</button>
          </article>
        </section>
      </main>
    </div>
  );
}