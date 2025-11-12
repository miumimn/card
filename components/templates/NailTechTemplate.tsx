import React from "react";
import { Instagram } from "lucide-react";

export type NailTechProps = {
  brand?: { name?: string; avatar?: string };
  gallery?: string[];
  services?: { name: string; price?: string }[];
  socials?: { instagram?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function NailTechTemplate({
  brand = {},
  gallery = [],
  services = [],
  socials = {},
  ariaLabel = "Nail Tech",
  onBook,
}: NailTechProps) {
  const sample = ["/templates/nail1.jpg", "/templates/nail2.jpg", "/templates/nail3.jpg"];
  const effective = (gallery && gallery.length ? gallery : sample).slice(0, 6);

  return (
    <div className="hm" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || effective[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Nora Nails"}</h1>
            <div className="role">Manicure & Nail Art</div>
            <nav className="social-row">{socials.instagram && <a href={socials.instagram}><Instagram className="icon" /></a>}</nav>
          </div>
        </section>

        <div className="services" aria-hidden>
          {(services && services.length ? services : [{ name: "Classic Manicure", price: "$25" }, { name: "Gel", price: "$35" }]).map((s, i) => (
            <div className="service" key={i}><strong>{s.name}</strong><div className="sub">{s.price}</div></div>
          ))}
        </div>

        <section className="gallery mosaic">
          {effective.map((g, i) => <img src={g} key={i} alt={`Nail ${i + 1}`} />)}
        </section>

        <div style={{ marginTop: 12 }}>
          <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book stub")}>Book Now</button>
        </div>
      </main>
    </div>
  );
}