import React from "react";

export type TherapistProps = {
  name?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  specialties?: string[];
  fees?: string;
  socials?: { website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function TherapistTemplate({
  name = "CalmCare Therapy",
  role = "Licensed Therapist — CBT • Couples • Anxiety",
  avatar,
  bio,
  specialties = [],
  fees,
  socials = {},
  ariaLabel = "Therapist profile",
  onBook,
}: TherapistProps) {
  return (
    <div className="th" aria-label={ariaLabel}>
      <main className="wrap">
        <header className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "https://picsum.photos/id/1013/400/400"}')` }} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="role">{role}</div>
          </div>
        </header>

        <nav className="tabs" role="tablist">
          <button className="tab active" data-tab="about">About</button>
          <button className="tab" data-tab="approach">Approach</button>
          <button className="tab" data-tab="fees">Fees</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="about" className="panel active">
            <p>{bio || "Private, confidential therapy in-person and via secure video. Evidence-based approaches tailored to your needs."}</p>
            {specialties.length > 0 && <div className="specialties">{specialties.map((s, i) => <div className="spec" key={i}>{s}</div>)}</div>}
          </article>

          <article id="approach" className="panel">
            <h3>Approach</h3>
            <p className="muted">Client-led, collaborative therapy with measurable goals and paced exposure.</p>
          </article>

          <article id="fees" className="panel">
            <h3>Fees</h3>
            <p className="muted">{fees || "Sessions: $120 / 50min. Sliding scale available — contact for details."}</p>
          </article>

          <article id="contact" className="panel">
            <h3>Contact & Book</h3>
            <div style={{ marginTop: 12 }}>
              <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book Session (stub)")}>Book Session</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}