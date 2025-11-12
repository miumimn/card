import React from "react";
import { Monitor } from "lucide-react";

export type WebDesignerProps = {
  brand?: { name?: string; avatar?: string };
  projects?: { title: string; image?: string; blurb?: string }[];
  socials?: { website?: string; dribbble?: string };
  ariaLabel?: string;
};

export default function WebDesignerTemplate({
  brand = {},
  projects = [],
  socials = {},
  ariaLabel = "Web Designer",
}: WebDesignerProps) {
  const sample = ["/templates/web1.jpg", "/templates/web2.jpg"];
  const effective = projects.length ? projects : [{ title: "Device Mock Hero", image: sample[0], blurb: "UI portfolio" }];
  return (
    <div className="wrap" aria-label={ariaLabel}>
      <main>
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || sample[0]}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "UI / Web Designer"}</h1>
            <div className="role">Device mock hero, portfolio</div>
          </div>
        </section>

        <section style={{ marginTop: 12 }}>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            {effective.map((p, i) => (
              <div key={i} className="card">
                <img src={p.image} alt={p.title} style={{ width: "100%", borderRadius: 8 }} />
                <div style={{ marginTop: 8 }}><strong>{p.title}</strong><div style={{ color: "var(--muted)" }}>{p.blurb}</div></div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}