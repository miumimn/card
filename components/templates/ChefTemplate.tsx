import React from "react";
import { Phone, MapPin } from "lucide-react";

export type MenuItem = { name: string; desc?: string; price?: string; image?: string };
export type ChefProps = {
  name?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  menu?: MenuItem[];
  testimonials?: { who: string; text: string }[];
  location?: string;
  socials?: { instagram?: string; facebook?: string; website?: string };
  ariaLabel?: string;
  onRequestBooking?: () => void;
};

const sampleMenu: MenuItem[] = [
  { name: "Private Tasting Menu", desc: "6-course chef's tasting • bespoke menus", price: "$240pp" },
  { name: "Event Catering", desc: "Small events up to 60 guests", price: "Custom" },
];

export default function ChefTemplate({
  name = "Chef Antonio Ruiz",
  role = "Private Chef • Seasonal Mediterranean",
  avatar,
  bio,
  menu = [],
  testimonials = [],
  location,
  socials = {},
  ariaLabel = "Chef profile",
  onRequestBooking,
}: ChefProps) {
  const effectiveMenu = menu.length ? menu : sampleMenu;
  return (
    <div className="chef-page" aria-label={ariaLabel}>
      <main className="card">
        <section className="hero" aria-label="Chef hero">
          <div className="hero-meta" role="region" aria-label="Profile">
            <div
              className="avatar"
              style={{ backgroundImage: `url('${avatar || "https://picsum.photos/id/1005/400/400"}')` }}
            />
            <div>
              <h2 className="name">{name}</h2>
              <p className="role">{role}</p>

              <nav className="social-row" aria-label="social links">
                {socials.instagram && (
                  <a className="social" href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <svg className="icon" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
                  </a>
                )}
                {socials.facebook && <a className="social" href={socials.facebook} target="_blank" rel="noopener noreferrer">FB</a>}
                {socials.website && <a className="social" href={socials.website} target="_blank" rel="noopener noreferrer">Site</a>}
              </nav>
            </div>
          </div>
        </section>

        <div className="tabs" role="tablist" aria-label="Profile tabs">
          <button className="tab active" data-tab="about">About</button>
          <button className="tab" data-tab="menu">Menu & Services</button>
          <button className="tab" data-tab="reviews">Reviews</button>
          <button className="tab" data-tab="location">Location</button>
          <button className="tab" data-tab="contact">Contact</button>
        </div>

        <section className="panels">
          <article id="about" className="panel active" role="tabpanel">
            <h3>About</h3>
            <p>{bio || "Michelin-trained private chef focusing on seasonal Mediterranean cuisine — in-home dinners, events and tasting menus."}</p>
          </article>

          <article id="menu" className="panel" role="tabpanel">
            <h3>Menu & Services</h3>
            <div className="menu-grid" aria-live="polite">
              {effectiveMenu.map((d, idx) => (
                <div className="dish" key={idx}>
                  <h4>{d.name} {d.price && <span style={{ float: "right", fontWeight: 900 }}>{d.price}</span>}</h4>
                  {d.desc && <p>{d.desc}</p>}
                </div>
              ))}
            </div>
          </article>

          <article id="reviews" className="panel" role="tabpanel">
            <h3>Reviews</h3>
            <div className="testimonials">
              {(testimonials.length ? testimonials : [
                { who: "Emma R.", text: "Incredible meal and service — guests are still talking about it." },
                { who: "Catering Manager", text: "Professional, timely and the food was outstanding." },
              ]).map((t, i) => (
                <div className="testimonial" key={i}><div className="who">{t.who}</div>{t.text}</div>
              ))}
            </div>
          </article>

          <article id="location" className="panel" role="tabpanel">
            <h3>Service Area</h3>
            {location && <p>{location}</p>}
            <div className="map" aria-hidden="true">
              <iframe title="location" src="https://www.openstreetmap.org/export/embed.html?bbox=2.15%2C41.36%2C2.23%2C41.40&amp;layer=mapnik" style={{ width: "100%", height: "100%", border: 0 }} />
            </div>
          </article>

          <article id="contact" className="panel" role="tabpanel">
            <h3>Contact</h3>
            <div className="cta-row">
              <button className="primary-btn" onClick={() => onRequestBooking ? onRequestBooking() : alert("Request Booking (stub)")}>Request Booking</button>
              <div className="qr">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(socials.website || "https://example.com")}`} alt="QR"/>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}