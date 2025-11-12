import React from "react";
import { Instagram } from "lucide-react";

export type MakeupProps = {
  brand?: { name?: string; avatar?: string };
  gallery?: string[];
  services?: { name: string; price?: string }[];
  socials?: { instagram?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function MakeupTemplate({
  brand = {},
  gallery = [],
  services = [],
  socials = {},
  ariaLabel = "Makeup Artist",
  onBook,
}: MakeupProps) {
  const sample = ["/templates/makeup1.jpg", "/templates/makeup2.jpg"];
  const effective = (gallery && gallery.length ? gallery : sample).slice(0, 6);
  return (
    <div className="artist-new" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effective[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Glam Artist"}</h1>
            <div className="role">Makeup Artist — Bridal & Editorial</div>
            <nav className="social-row">{socials.instagram && <a href={socials.instagram}><Instagram className="icon" /></a>}</nav>
          </div>
        </section>

        <div className="tabs">
          <button className="tab active">Portfolio</button>
          <button className="tab">Services</button>
          <button className="tab">Contact</button>
        </div>

        <section className="panels">
          <article className="panel active">
            <div className="portfolio-grid">{effective.map((g, i) => <div className="item" key={i}><img src={g} alt={`Work ${i+1}`} /></div>)}</div>
          </article>
        </section>

        <div style={{ marginTop: 12 }}>
          <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book stub")}>Book Makeup</button>
        </div>
      </main>
    </div>
  );
}