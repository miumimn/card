import React from "react";
import { Instagram, Globe } from "lucide-react";

export type Project = { image?: string; title?: string };

export type InteriorDesignerProps = {
  brand?: { name?: string; tagline?: string; avatar?: string };
  moodboard?: string[];
  projects?: Project[];
  services?: string[];
  socials?: { instagram?: string; website?: string };
  ariaLabel?: string;
};

const sample = ["/templates/room1.jpg", "/templates/room2.jpg", "/templates/room3.jpg"];

export default function InteriorDesignerTemplate({
  brand = {},
  moodboard = [],
  projects = [],
  services = [],
  socials = {},
  ariaLabel = "Interior Designer",
}: InteriorDesignerProps) {
  const effectiveMood = (moodboard && moodboard.length ? moodboard : sample).slice(0, 6);
  return (
    <div className="ides-enh" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="profile">
            <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effectiveMood[0]}')` }} />
            <div>
              <h1 className="title">{brand.name || "Nora Hayes Studio"}</h1>
              <div className="subtitle">{brand.tagline || "Residential & Boutique Hospitality Interiors"}</div>
              <nav className="social-row" style={{ marginTop: 8 }}>
                {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="social"><Instagram className="icon" /></a>}
                {socials.website && <a href={socials.website} target="_blank" rel="noreferrer" className="social"><Globe className="icon" /></a>}
              </nav>
            </div>
          </div>

          <div className="moodboard" aria-hidden>
            {effectiveMood.map((m, i) => <div className="swatch" key={i} style={{ backgroundImage: `url('${m}')` }} />)}
          </div>
        </section>

        <nav className="tabs">
          <button className="tab active" data-tab="portfolio">Portfolio</button>
          <button className="tab" data-tab="services">Services</button>
          <button className="tab" data-tab="process">Process</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="portfolio" className="panel active">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
              {(projects && projects.length ? projects : [{ image: sample[0], title: "Project A" }]).map((p, i) => (
                <img src={p.image} alt={p.title || `Project ${i + 1}`} key={i} style={{ width: "100%", borderRadius: 10, objectFit: "cover" }} />
              ))}
            </div>
          </article>

          <article id="services" className="panel">
            <div className="services">
              {(services && services.length ? services : ["Full Home Renovation", "Space Planning", "Styling & Procurement"]).map((s, i) => (
                <div className="service" key={i}><strong>{s}</strong></div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}