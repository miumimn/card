import React from "react";
import { Phone, MapPin } from "lucide-react";

export type HandymanProps = {
  brand?: { name?: string; tagline?: string; avatar?: string };
  services?: { title: string; price?: string; desc?: string }[];
  area?: string;
  phone?: string;
  gallery?: string[];
  socials?: { whatsapp?: string; website?: string };
  ariaLabel?: string;
  onRequestVisit?: () => void;
};

const sample = ["/templates/handyman1.jpg", "/templates/handyman2.jpg", "/templates/handyman3.jpg"];

export default function HandymanTemplate({
  brand = {},
  services = [],
  area,
  phone,
  gallery = [],
  socials = {},
  ariaLabel = "Handyman profile",
  onRequestVisit,
}: HandymanProps) {
  const effectiveGallery = (gallery && gallery.length ? gallery : sample).slice(0, 6);

  return (
    <div className="handyman-page" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero" aria-label="Handyman hero">
          <div className="hero-image" style={{ backgroundImage: `url('${effectiveGallery[0]}')` }} />
          <div className="hero-card">
            <div className="brand" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effectiveGallery[1]}')` }} />
              <div>
                <h1 className="title">{brand.name || "FixUp Co."}</h1>
                <div className="subtitle">{brand.tagline || "Local Handyman — Electrical • Plumbing • Carpentry"}</div>
              </div>
            </div>

            <div className="quick" role="group" style={{ marginTop: 10 }}>
              <a className="urgent" href={phone ? `tel:${phone}` : "#"} aria-label="Call emergency">
                ⚠️ {phone ? phone : "Call"}
              </a>
              <button className="quick-button" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>Services</button>
              <button className="quick-button" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>Pricing</button>
              <button className="quick-button" onClick={() => { if (onRequestVisit) onRequestVisit(); else document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}>Request Visit</button>
            </div>

            <div id="services" className="services" aria-label="services list" style={{ marginTop: 12 }}>
              {(services && services.length > 0 ? services : [
                { title: "Small Repairs", price: "$45", desc: "From basic fixes" },
                { title: "Plumbing", price: "Varies", desc: "Leaks & installs" },
                { title: "Carpentry", price: "Varies", desc: "Fitting & repairs" },
              ]).map((s, i) => (
                <div className="service" key={i}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ color: "#ff7a2d" }}><path d="M3 21h18"/></svg>
                  <div>
                    <strong>{s.title}</strong>
                    {s.desc && <div className="sub" style={{ color: "var(--muted)" }}>{s.desc}</div>}
                    {s.price && <div style={{ marginTop: 6, fontWeight: 900 }}>{s.price}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="pricing" id="pricing" style={{ marginTop: 12 }}>
              <div className="price-card">$45/hr — Standard</div>
              <div className="price-card">$90 — Call‑out fee</div>
              <div className="price-card">Free estimate for big jobs</div>
            </div>

            <div id="contact" className="contact-strip" style={{ marginTop: 12 }}>
              <a className="call" href={phone ? `tel:${phone}` : "#"}><Phone size={16} /> {phone || "Call"}</a>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="urgent" onClick={() => onRequestVisit ? onRequestVisit() : alert("Request Visit stub")}>Request Visit</button>
                {socials.website && <a className="quick-button" href={socials.website} target="_blank" rel="noreferrer">Website</a>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}