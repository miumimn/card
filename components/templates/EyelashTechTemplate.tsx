import React from "react";
import { Instagram } from "lucide-react";

export type EyelashTechProps = {
  brand?: { name?: string; avatar?: string };
  gallery?: string[];
  services?: { name: string; price?: string }[];
  socials?: { instagram?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function EyelashTechTemplate(props: EyelashTechProps) {
  const { brand = {}, gallery = [], services = [], socials = {}, ariaLabel = "Eyelash Tech", onBook } = props;
  const sample = ["/templates/eyelash1.jpg", "/templates/eyelash2.jpg"];
  const effective = (gallery && gallery.length ? gallery : sample).slice(0, 6);

  return (
    <div className="artist-layout" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effective[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Lash Studio"}</h1>
            <div className="role">Eyelash Extensions & Lifts</div>
            <nav className="social-row">{socials.instagram && <a href={socials.instagram}><Instagram className="icon" /></a>}</nav>
          </div>
        </section>

        <nav className="tabs">
          <button className="tab active" data-tab="services">Services</button>
          <button className="tab" data-tab="portfolio">Portfolio</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="services" className="panel active">
            {(services && services.length ? services : [{ name: "Classic Lash", price: "$60" }, { name: "Volume Lash", price: "$90" }]).map((s, i) => (
              <div className="service" key={i}><strong>{s.name}</strong><div className="sub">{s.price}</div></div>
            ))}
          </article>

          <article id="portfolio" className="panel">
            <div className="gallery mosaic">{effective.map((g, i) => <img src={g} key={i} alt={`Portfolio ${i+1}`} />)}</div>
          </article>

          <article id="contact" className="panel">
            <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book stub")}>Book Appointment</button>
          </article>
        </section>
      </main>
    </div>
  );
}