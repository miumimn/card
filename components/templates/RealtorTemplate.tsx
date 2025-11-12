import React from "react";

export type Listing = { title: string; subtitle?: string; image?: string; price?: string };
export type RealtorProps = {
  name?: string;
  role?: string;
  avatar?: string;
  intro?: string;
  listings?: Listing[];
  socials?: { facebook?: string; instagram?: string; linkedin?: string };
  ariaLabel?: string;
};

export default function RealtorTemplate({
  name = "Morgan Smith",
  role = "Licensed Realtor — Metro Area",
  avatar,
  intro,
  listings = [],
  socials = {},
  ariaLabel = "Realtor profile",
}: RealtorProps) {
  const sampleListings = listings.length ? listings : [
    { title: "Modern 3BR", subtitle: "Downtown • 2,200 sqft", image: "https://picsum.photos/id/1025/800/600", price: "$420,000" },
    { title: "Cozy Bungalow", subtitle: "Tree-lined street", image: "https://picsum.photos/id/1032/800/600", price: "$315,000" },
  ];
  return (
    <div className="realtor-page" aria-label={ariaLabel}>
      <div className="realtor-wrap">
        <section className="hero">
          <img className="hero-img" src="https://picsum.photos/id/1018/1600/900" alt="Featured" />
        </section>

        <div className="agent-card">
          <div className="agent-meta">
            <div className="agent-name">{name}</div>
            <div className="agent-role">{role}</div>
            <div className="intro">{intro || "Helping clients find their dream home — residential sales, luxury listings and portfolio advisory."}</div>
          </div>
          <div className="agent-avatar" style={{ backgroundImage: `url('${avatar || "https://picsum.photos/id/1005/400/400"}')` }} />
        </div>

        <div className="social-row-hero">
          {socials.facebook && <a className="social" href={socials.facebook}>FB</a>}
          {socials.instagram && <a className="social" href={socials.instagram}>IG</a>}
          {socials.linkedin && <a className="social" href={socials.linkedin}>in</a>}
        </div>

        <div className="tabs-wrap">
          <div className="tabs">
            <button className="tab active" data-tab="about">About</button>
            <button className="tab" data-tab="listings">Listings</button>
            <button className="tab" data-tab="contact">Contact</button>
          </div>

          <div className="panels">
            <div id="about" className="panel active">
              <h3>About</h3>
              <p className="intro">{intro}</p>
            </div>

            <div id="listings" className="panel">
              <h3>Highlighted Listings</h3>
              <div className="listings-grid">
                {sampleListings.map((l, i) => (
                  <article className="listing-card" key={i}>
                    <img src={l.image} alt={l.title} />
                    <div className="meta">
                      <div className="listing-title">{l.title} • {l.price}</div>
                      <div className="listing-sub">{l.subtitle}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div id="contact" className="panel">
              <h3>Contact</h3>
              <p className="intro">Phone: <a href="tel:+1234567890">+1 (234) 567-890</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}