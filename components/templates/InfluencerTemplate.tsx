import React from "react";
import { Instagram, Youtube, Link as LinkIcon } from "lucide-react";

export type InfluencerProps = {
  name?: string;
  tagline?: string;
  avatar?: string;
  followers?: string;
  monthlyViews?: string;
  links?: { title: string; url: string }[];
  media?: string[];
  socials?: { instagram?: string; youtube?: string; tiktok?: string; website?: string };
  ariaLabel?: string;
  onContact?: () => void;
};

export default function InfluencerTemplate({
  name = "Rae Monroe",
  tagline = "Lifestyle & Travel",
  avatar,
  followers = "120k",
  monthlyViews = "1.2M",
  links = [],
  media = [],
  socials = {},
  ariaLabel = "Influencer profile",
  onContact,
}: InfluencerProps) {
  const sampleMedia = media.length ? media : ["/templates/c1.jpg", "/templates/c2.jpg", "/templates/c3.jpg"];
  const sampleLinks = links.length ? links : [{ title: "Instagram", url: socials.instagram || "#" }, { title: "YouTube", url: socials.youtube || "#" }];

  return (
    <div className="influencer-layout theme-influencer" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || sampleMedia[0]}')` }} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="role">{tagline}</div>
            <div className="stats-row">
              <div className="stat"><strong>{followers}</strong><small>Followers</small></div>
              <div className="stat"><strong>{monthlyViews}</strong><small>Views / Mo</small></div>
            </div>
          </div>
        </section>

        <section className="link-grid">
          {sampleLinks.map((l, i) => (
            <a key={i} className="link-card" href={l.url} target="_blank" rel="noreferrer"><strong>{l.title}</strong><small>Visit</small></a>
          ))}
        </section>

        <h3 style={{ marginTop: 12 }}>Featured Content</h3>
        <div className="gallery" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {sampleMedia.map((m, i) => <img key={i} src={m} alt={`media ${i+1}`} />)}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="primary-btn" onClick={() => onContact ? onContact() : alert("Work with me (stub)")}>Work with me — Sponsorships</button>
        </div>
      </main>
    </div>
  );
}