import React from "react";
import { Monitor } from "lucide-react";

export type WebProject = { title: string; image?: string; desc?: string };

export type WebDesignerProps = {
  name?: string;
  role?: string;
  avatar?: string;
  projects?: WebProject[];
  socials?: { dribbble?: string; website?: string };
  ariaLabel?: string;
};

export default function WebDesignerTemplate2({
  name = "Atlas UI — Jordan Blake",
  role = "Product Designer — Design Systems & UX",
  avatar,
  projects = [],
  socials = {},
  ariaLabel = "Web Designer",
}: WebDesignerProps) {
  const sample = projects.length ? projects : [{ title: "Onboardly — Mobile", image: "/templates/ui1.jpg", desc: "Mobile onboarding redesign" }];
  return (
    <div className="ux" aria-label={ariaLabel}>
      <main className="wrap">
        <header className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "/templates/ui-avatar.jpg"}')` }} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="role">{role}</div>
          </div>
        </header>

        <div className="grid">
          <section className="left">
            <div className="card">
              <h3>Case Studies</h3>
              <div className="case-grid">
                {sample.map((p, i) => (
                  <div key={i} style={{ padding: 8, borderRadius: 8, background: "#fff" }}>
                    <strong>{p.title}</strong>
                    {p.desc && <div style={{ color: "var(--muted)" }}>{p.desc}</div>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside>
            <div className="card">
              <h4>Design Tokens</h4>
              <div className="tokens"><div className="token">--color-primary</div><div className="token">--space-16</div></div>
              <div style={{ marginTop: 12 }}>
                <a className="primary-btn" href={socials.website || "#"}><Monitor size={16} /> View Portfolio</a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}