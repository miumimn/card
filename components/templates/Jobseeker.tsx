import React from "react";
import { Linkedin, Mail } from "lucide-react";

export type JobseekerProps = {
  name?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  cvUrl?: string;
  projects?: { title: string; image?: string; blurb?: string }[];
  socials?: { linkedin?: string; github?: string; website?: string };
  ariaLabel?: string;
};

export default function JobseekerTemplate({
  name = "Jordan Blake",
  role = "Product Designer — UX / UI",
  avatar,
  bio,
  cvUrl,
  projects = [],
  socials = {},
  ariaLabel = "Job Seeker profile",
}: JobseekerProps) {
  return (
    <div className="jobseek" aria-label={ariaLabel}>
      <main className="wrap">
        <header className="hero" aria-label="Candidate summary">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "/templates/job-avatar.jpg"}')` }} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="role">{role}</div>

            <div style={{ marginTop: 8 }}>
              <a className="primary-btn" href={`mailto:${socials.website ? `hello@${socials.website}` : "jordan@example.com"}`}>Email</a>
              {cvUrl && <a className="primary-btn" href={cvUrl} download style={{ marginLeft: 8 }}>Download CV</a>}
            </div>
          </div>
        </header>

        <nav className="tabs" role="tablist">
          <button className="tab active" data-tab="about">About</button>
          <button className="tab" data-tab="resume">Resume</button>
          <button className="tab" data-tab="projects">Projects</button>
          <button className="tab" data-tab="skills">Skills</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="about" className="panel active">
            <h3>Profile</h3>
            <p style={{ margin: 0 }}>{bio || "Product designer focusing on human-centred interfaces and delightful micro-interactions."}</p>
          </article>

          <article id="projects" className="panel">
            <h3>Selected Projects</h3>
            <div className="projects">
              {projects.map((p, i) => (
                <div className="project" key={i}>
                  {p.image && <img src={p.image} alt={p.title} />}
                  <div style={{ marginTop: 8 }}>
                    <strong>{p.title}</strong>
                    {p.blurb && <div className="sub" style={{ color: "var(--muted)" }}>{p.blurb}</div>}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article id="contact" className="panel">
            <h3>Contact</h3>
            <p>Email: <a href={`mailto:${socials.website ? `hello@${socials.website}` : "jordan@example.com"}`}>{socials.website ? `hello@${socials.website}` : "jordan@example.com"}</a></p>

            <div style={{ display: "flex", gap: 12 }}>
              {socials.linkedin && <a href={socials.linkedin}><Linkedin size={18} /></a>}
              {socials.github && <a href={socials.github}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .296a12 12 0 00-3.797 23.4c.6.11.82-.26.82-.58v-2.28c-3.34.73-4.04-1.61-4.04-1.61-.546-1.38-1.333-1.75-1.333-1.75-1.09-.74.083-.726.083-.726 1.205.085 1.84 1.28 1.84 1.28 1.07 1.83 2.81 1.3 3.497.995.11-.776.42-1.3.763-1.6-2.665-.3-5.466-1.33-5.466-5.9 0-1.3.468-2.363 1.235-3.194-.124-.303-.536-1.523.117-3.175 0 0 1.007-.322 3.3 1.22a11.42 11.42 0 016 0c2.29-1.54 3.295-1.22 3.295-1.22.655 1.652.243 2.872.12 3.175.77.83 1.233 1.894 1.233 3.194 0 4.582-2.805 5.596-5.476 5.89.431.37.81 1.096.81 2.21v3.277c0 .318.216.694.825.577A12 12 0 0012 .296"/></svg></a>}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}