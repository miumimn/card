import React from "react";
import { Globe } from "lucide-react";

export type FreelancerProps = {
  brand?: { name?: string; role?: string; avatar?: string };
  portfolio?: { title: string; image?: string }[];
  services?: string[];
  socials?: { website?: string; linkedin?: string };
  ariaLabel?: string;
  onContact?: () => void;
};

export default function FreelancerTemplate({
  brand = {},
  portfolio = [],
  services = [],
  socials = {},
  ariaLabel = "Freelancer profile",
  onContact,
}: FreelancerProps) {
  const sample = ["/templates/freelance1.jpg", "/templates/freelance2.jpg"];
  return (
    <div className="wrap">
      <main>
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || sample[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Alex Freelance"}</h1>
            <div className="role">{brand.role || "Product Designer"}</div>
            <div style={{ marginTop: 8 }}>
              {socials.website && <a href={socials.website}><Globe size={16} /></a>}
              <button className="primary-btn" onClick={() => onContact ? onContact() : alert("Contact stub")} style={{ marginLeft: 8 }}>Contact</button>
            </div>
          </div>
        </section>

        <section>
          <h3>Portfolio</h3>
          <div className="gallery" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
            {(portfolio && portfolio.length ? portfolio : sample.map((s, i) => ({ title: `Project ${i+1}`, image: s }))).map((p, i) => (
              <div key={i} style={{ padding: 8 }}>
                <img src={p.image} alt={p.title} style={{ width: "100%", borderRadius: 8 }} />
                <div style={{ marginTop: 8 }}>{p.title}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}