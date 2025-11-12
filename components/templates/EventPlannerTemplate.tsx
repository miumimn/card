import React from "react";
import { Calendar, MapPin } from "lucide-react";

export type PackageItem = { name: string; blurb?: string; price?: string };

export type EventPlannerProps = {
  brand?: { name?: string; tagline?: string; logo?: string };
  packages?: PackageItem[];
  checklist?: string[];
  gallery?: string[];
  socials?: { instagram?: string; website?: string };
  ariaLabel?: string;
  onRequestProposal?: () => void;
};

const sampleGallery = ["/templates/event1.jpg", "/templates/event2.jpg", "/templates/event3.jpg"];

export default function EventPlannerTemplate({
  brand = {},
  packages = [],
  checklist = [],
  gallery = [],
  socials = {},
  ariaLabel = "Event Planner",
  onRequestProposal,
}: EventPlannerProps) {
  const effectiveGallery = (gallery && gallery.length ? gallery : sampleGallery).slice(0, 6);
  return (
    <div className="ep" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.logo || effectiveGallery[0]}')` }} />
          <div className="meta">
            <h1 className="brand">{brand.name || "Luxe Events Co."}</h1>
            <div className="tag">{brand.tagline || "Weddings • Corporate Events • Private Parties"}</div>
            <div style={{ marginTop: 8 }}>
              <button className="primary-btn" onClick={() => onRequestProposal ? onRequestProposal() : alert("request proposal stub")}>Request Proposal</button>
              <a className="ghost-btn" href="#packages" style={{ marginLeft: 8 }}>See Packages</a>
            </div>
          </div>
        </section>

        <nav className="tabs">
          <button className="tab active" data-tab="overview">Overview</button>
          <button className="tab" data-tab="packages">Packages</button>
          <button className="tab" data-tab="checklist">Checklist</button>
          <button className="tab" data-tab="gallery">Gallery</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="overview" className="panel active">
            <p>Full-service event planning with in-house styling, vendor management and day-of coordination.</p>
          </article>

          <article id="packages" className="panel">
            <div className="packages" id="packages">
              {(packages && packages.length ? packages : [
                { name: "Essentials", blurb: "Venue coordination & day support", price: "$2,500+" },
                { name: "Signature", blurb: "Full planning, styling & vendor management", price: "$7,500+" },
              ]).map((p, i) => (
                <div className="package" key={i}>
                  <strong>{p.name}</strong>
                  {p.blurb && <div className="sub">{p.blurb}</div>}
                  {p.price && <div style={{ marginTop: 8, fontWeight: 900, color: "var(--ep-accent)" }}>{p.price}</div>}
                </div>
              ))}
            </div>
          </article>

          <article id="checklist" className="panel">
            <div className="checklist">
              {(checklist && checklist.length ? checklist : ["Secure venue & date", "Confirm vendors", "Finalise floor plan"]).map((c, i) => (
                <div className="check" key={i}>{c}</div>
              ))}
            </div>
          </article>

          <article id="gallery" className="panel">
            <div className="gallery" aria-live="polite">
              {effectiveGallery.map((s, idx) => <img src={s} key={idx} alt={`Event ${idx + 1}`} />)}
            </div>
          </article>

          <article id="contact" className="panel">
            <p>Email: <a href={`mailto:hello@${(brand.name || "luxeevents").replace(/\s+/g, "").toLowerCase()}.co`}>hello@{(brand.name || "luxeevents").replace(/\s+/g, "").toLowerCase()}.co</a></p>
          </article>
        </section>
      </main>
    </div>
  );
}