import React from "react";
import { GitHub, Monitor } from "lucide-react";

export type ITPersonnelProps = {
  name?: string;
  role?: string;
  avatar?: string;
  skills?: string[];
  projects?: { title: string; blurb?: string }[];
  socials?: { github?: string; linkedin?: string; website?: string };
  ariaLabel?: string;
  onHire?: () => void;
};

export default function ITPersonnelTemplate({
  name = "Adeel Khan",
  role = "Senior DevOps Engineer",
  avatar,
  skills = [],
  projects = [],
  socials = {},
  ariaLabel = "IT personnel",
  onHire,
}: ITPersonnelProps) {
  return (
    <div className="it-page" aria-label={ariaLabel}>
      <main className="wrap">
        <header className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "/templates/it-avatar.jpg"}')` }} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="role">{role}</div>
            <div style={{ marginTop: 8 }}>
              <button className="primary-btn" onClick={() => onHire ? onHire() : alert("Hire stub")}>Hire Me</button>
              {socials.github && <a href={socials.github} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}><GitHub size={16} /></a>}
            </div>
          </div>
        </header>

        <div className="grid">
          <div className="left">
            <div className="projects">
              {(projects && projects.length ? projects : [{ title: "Platform Infra", blurb: "IaC + onboarding" }]).map((p, i) => (
                <div className="project" key={i}><strong>{p.title}</strong><div className="sub" style={{ color: "var(--muted)" }}>{p.blurb}</div></div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <h3>Case Study — Atlas API</h3>
              <p style={{ color: "var(--muted)" }}>Designed infra to support high throughput with safe deploys and observability.</p>
            </div>
          </div>

          <aside className="card">
            <div style={{ fontWeight: 900 }}>Skills</div>
            <div style={{ marginTop: 8 }}>
              {(skills && skills.length ? skills : ["Kubernetes", "Terraform", "CI/CD"]).map((s, idx) => <div className="chip" key={idx}>{s}</div>)}
            </div>

            <div style={{ marginTop: 12 }}>
              <a className="primary-btn" href={socials.website || "#"} target="_blank" rel="noreferrer"><Monitor size={16} /> Portfolio</a>
            </div>
          </aside>
        </div>

        <nav className="tabs">
          <button className="tab active" data-tab="about">About</button>
          <button className="tab" data-tab="skills">Skills</button>
          <button className="tab" data-tab="projects">Projects</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>
      </main>
    </div>
  );
}