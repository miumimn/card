import React from "react";
import { Phone } from "lucide-react";

export type DoctorProps = {
  name?: string;
  role?: string;
  avatar?: string;
  specialties?: string[];
  bio?: string;
  address?: string;
  phone?: string;
  socials?: { website?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function DoctorTemplate({
  name = "Dr. Avery Clarke",
  role = "General Practitioner",
  avatar,
  specialties = [],
  bio,
  address,
  phone,
  socials = {},
  ariaLabel = "Doctor profile",
  onBook,
}: DoctorProps) {
  return (
    <div className="card-page" aria-label={ariaLabel}>
      <main className="card-wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "https://picsum.photos/id/1009/400/400"}')` }} />
          <h2 className="name">{name}</h2>
          <p className="role">{role}</p>

          <nav className="social-row" aria-label="social links">
            {socials.website && <a className="social" href={socials.website} target="_blank" rel="noopener noreferrer">Site</a>}
          </nav>
        </section>

        <div className="tabs" role="tablist">
          <button className="tab active" data-tab="about">About</button>
          <button className="tab" data-tab="services">Services</button>
          <button className="tab" data-tab="contact">Contact</button>
        </div>

        <section className="tab-panels">
          <article id="about" className="panel active">
            <h3>About</h3>
            <p>{bio || "Board-certified physician offering primary care, preventive medicine and telehealth visits."}</p>

            {specialties.length > 0 && <div className="mini-info"><strong>Specialties</strong><p className="muted">{specialties.join(" • ")}</p></div>}
          </article>

          <article id="services" className="panel">
            <h3>Services</h3>
            <p className="muted">Appointments, vaccinations, telehealth consultations and referrals.</p>
          </article>

          <article id="contact" className="panel">
            <h3>Contact</h3>
            <p>{address}</p>
            <p>Phone: <a href={phone ? `tel:${phone}` : "#"}>{phone || "Call"}</a></p>
            <div style={{ marginTop: 8 }}>
              <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book appointment (stub)")}>Book Appointment</button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}