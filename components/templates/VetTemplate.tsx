import React from "react";
import { Phone } from "lucide-react";

export type VetProps = {
  brand?: { name?: string; tagline?: string; avatar?: string };
  services?: { title: string; desc?: string }[];
  address?: string;
  phone?: string;
  gallery?: string[];
  socials?: { website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

const sample = ["/templates/vet1.jpg", "/templates/vet2.jpg", "/templates/vet3.jpg"];

export default function VetTemplate({
  brand = {},
  services = [],
  address,
  phone,
  gallery = [],
  socials = {},
  ariaLabel = "Veterinarian profile",
  onBook,
}: VetProps) {
  const effective = (gallery && gallery.length ? gallery : sample).slice(0, 6);

  return (
    <div className="vet-page" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effective[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "GreenPaw Clinic"}</h1>
            <div className="role">{brand.tagline || "Veterinarian — Small Animals & Exotics"}</div>
            <div style={{ marginTop: 8, color: "var(--muted)" }}>{address}</div>
          </div>
        </section>

        <nav className="tabs" role="tablist">
          <button className="tab active" data-tab="services">Services</button>
          <button className="tab" data-tab="booking">Booking</button>
          <button className="tab" data-tab="testimonials">Testimonials</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="services" className="panel active">
            {(services && services.length ? services : [
              { title: "Wellness Check", desc: "Vaccines & general exam" },
              { title: "Surgery", desc: "Soft tissue & routine ops" },
              { title: "Emergency Care", desc: "On-call support" },
            ]).map((s, i) => (
              <div className="service" key={i}>
                <strong>{s.title}</strong>
                {s.desc && <div className="sub" style={{ color: "var(--muted)" }}>{s.desc}</div>}
              </div>
            ))}
          </article>

          <article id="booking" className="panel">
            <p style={{ color: "var(--muted)" }}>Online booking available. Walk-ins accepted for minor issues.</p>
            <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book appointment stub")}>Book Appointment</button>
          </article>

          <article id="testimonials" className="panel">
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ background: "#fff", padding: 10, borderRadius: 8 }}> "Saved our pup's life." — R</div>
            </div>
          </article>

          <article id="contact" className="panel">
            <p style={{ margin: 0 }}>Phone: <a href={phone ? `tel:${phone}` : "#"}>{phone || "Call Clinic"}</a></p>
            <div style={{ marginTop: 8 }}>
              <button className="primary-btn" onClick={() => phone ? window.location.href = `tel:${phone}` : alert("call stub")}><Phone size={14} /> Call Clinic</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}