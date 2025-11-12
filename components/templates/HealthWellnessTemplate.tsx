import React from "react";

export type HealthProps = {
  name?: string;
  role?: string;
  avatar?: string;
  services?: string[];
  bio?: string;
  booking?: string;
  socials?: { website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function HealthWellnessTemplate({
  name = "Wellness Clinic",
  role = "Health & Wellness",
  avatar,
  services = [],
  bio,
  booking,
  socials = {},
  ariaLabel = "Health & Wellness",
  onBook,
}: HealthProps) {
  return (
    <div className="card-page" aria-label={ariaLabel}>
      <main className="card-wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "https://picsum.photos/id/1005/400/400"}')` }} />
          <h2 className="name">{name}</h2>
          <p className="role">{role}</p>
        </section>

        <div className="tabs" role="tablist">
          <button className="tab active" data-tab="about">About</button>
          <button className="tab" data-tab="services">Services</button>
          <button className="tab" data-tab="contact">Contact</button>
        </div>

        <section className="tab-panels">
          <article id="about" className="panel active">
            <h3>About</h3>
            <p>{bio || "Credentials, booking and safety notes."}</p>
          </article>

          <article id="services" className="panel">
            <h3>Services</h3>
            <div className="services">{(services.length ? services : ["Consultation", "Therapy Session", "Holistic Care"]).map((s, i) => <div className="service" key={i}><strong>{s}</strong></div>)}</div>
          </article>

          <article id="contact" className="panel">
            <h3>Contact</h3>
            <div style={{ marginTop: 8 }}>
              <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book (stub)")}>{booking || "Book Appointment"}</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}