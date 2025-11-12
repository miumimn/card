import React from "react";

export type LawyerProps = {
  name?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  services?: string[];
  testimonials?: { who: string; text: string }[];
  contact?: { email?: string; location?: string; phone?: string };
  socials?: { linkedin?: string; twitter?: string; website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function LawyerTemplate({
  name = "Jordan Malik",
  role = "Attorney • Civil & Corporate Law",
  avatar,
  bio,
  services = [],
  testimonials = [],
  contact = {},
  socials = {},
  ariaLabel = "Lawyer profile",
  onBook,
}: LawyerProps) {
  const sampleServices = services.length ? services : ["Civil Litigation", "Contract Law", "Corporate Advisory", "Estate Planning"];
  const sampleTestimonials = testimonials.length ? testimonials : [
    { who: "Acme Inc.", text: "Jordan's advice was essential to our successful merger. Highly recommended." },
    { who: "S. Ahmed", text: "Resolved my dispute quickly and professionally." },
  ];

  return (
    <div className="lawyer-page" aria-label={ariaLabel}>
      <main className="lawyer-wrap">
        <section className="hero-lawyer">
          <svg className="law-bg-decor" viewBox="0 0 88 88" aria-hidden="true">
            <ellipse cx="44" cy="76" rx="38" ry="10" fill="#2d2f49" />
            <g stroke="#f4c06a" strokeWidth="2" fill="none" opacity="0.9">
              <line x1="44" y1="12" x2="44" y2="70" />
              <circle cx="44" cy="24" r="7" />
              <path d="M25 38 Q44 16 63 38" />
              <ellipse cx="25" cy="54" rx="7" ry="5" />
              <ellipse cx="63" cy="54" rx="7" ry="5" />
            </g>
          </svg>

          <div className="lawyer-avatar" style={{ backgroundImage: `url('${avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&q=80"}')` }} aria-label={`${name} avatar`} />

          <h2 className="lawyer-name">{name}</h2>
          <p className="lawyer-role">{role}</p>

          <nav className="social-row-lawyer" aria-label="social links">
            {socials.linkedin && <a className="social-lawyer" href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">in</a>}
            {socials.twitter && <a className="social-lawyer" href={socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">tw</a>}
            {socials.website && <a className="social-lawyer" href={socials.website} target="_blank" rel="noopener noreferrer" aria-label="Website">web</a>}
          </nav>

          <div className="tabs-lawyer" role="tablist" aria-label="lawyer tabs">
            <button className="tab-lawyer active" data-tab="about">About</button>
            <button className="tab-lawyer" data-tab="services">Practice Areas</button>
            <button className="tab-lawyer" data-tab="testimonials">Testimonials</button>
            <button className="tab-lawyer" data-tab="contact">Contact</button>
          </div>
        </section>

        <section className="lawyer-panels">
          <article id="about" className="panel-lawyer active">
            <h3>About</h3>
            <p>{bio || "15+ years of legal expertise in civil and corporate law. Strategic counsel, negotiation and client care."}</p>
          </article>

          <article id="services" className="panel-lawyer">
            <h3>Practice Areas</h3>
            <div className="lawyer-services">
              {sampleServices.map((s, i) => <div className="lawyer-service-card" key={i}>{s}</div>)}
            </div>
          </article>

          <article id="testimonials" className="panel-lawyer">
            <h3>Testimonials</h3>
            <div className="lawyer-testimonials">
              {sampleTestimonials.map((t, i) => (
                <blockquote key={i} style={{ marginBottom: 9 }}>
                  {t.text} <br />
                  <strong style={{ color: "var(--law-accent)" }}>— {t.who}</strong>
                </blockquote>
              ))}
            </div>
          </article>

          <article id="contact" className="panel-lawyer">
            <h3>Contact</h3>
            <p>Email: <a href={`mailto:${contact.email || "jordan@maliklaw.com"}`}>{contact.email || "jordan@maliklaw.com"}</a></p>
            <p>Location: <span>{contact.location || "Atlanta, GA"}</span></p>
            <div className="qr-row">
              <img className="qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=58x58&data=${encodeURIComponent(socials.website || "https://maliklaw.com")}`} alt="QR code" />
              <a className="download-qr-btn" href={socials.website ? `${socials.website}/?qr=1` : "#"} onClick={(e) => { if (!socials.website) e.preventDefault(); }} download>Download my QR code</a>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="download-qr-btn" onClick={() => onBook ? onBook() : alert("Book a Consultation (stub)")}>Book a Consultation</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}