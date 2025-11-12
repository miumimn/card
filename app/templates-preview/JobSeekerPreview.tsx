"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type JobSeekerData = {
  name?: string;
  role?: string;
  about?: string;
  experience?: string[] | string;
  projects?: { title?: string; description?: string; image?: string }[] | string[] | string;
  skills?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  cv?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function JobSeekerPreview({
  data,
  showFooter = true,
}: {
  data?: JobSeekerData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "resume" | "projects" | "skills" | "contact">("about");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  // tolerant parsing helpers
  const parseList = (val: any): string[] => {
    if (val == null) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map((p) => p.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  const parseProjects = (val: any): { title?: string; description?: string; image?: string }[] => {
    if (!val) return [];
    if (Array.isArray(val) && val.length && typeof val[0] === "object") return val as any;
    if (Array.isArray(val)) return (val as string[]).map((t) => ({ title: String(t) }));
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => (typeof p === "string" ? { title: p } : p));
        }
      } catch {}
      const lines = val.split("\n").map((l) => l.trim()).filter(Boolean);
      return lines.map((l) => {
        const parts = l.split("|").map((p) => p.trim());
        return { title: parts[0], description: parts[1] };
      });
    }
    return [];
  };

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (out[k] === undefined) out[k] = v;
          });
        }
      } catch {}
    }
    return out as JobSeekerData;
  }, [data]);

  // data-driven fields (no template fallbacks when showFooter === false)
  const name = merged.name ?? (showFooter ? "Jordan Blake" : "");
  const role = merged.role ?? merged.title ?? (showFooter ? "Product Designer — UX / UI • Remote" : "");
  const about = merged.about ?? (showFooter ? "Product designer focusing on human-centred interfaces and delightful micro-interactions." : "");
  const experience = parseList(merged.experience ?? merged.experiences ?? merged.resume);
  const projectsParsed = parseProjects(merged.projects ?? merged.portfolio ?? merged.project_list);
  const skills = parseList(merged.skills ?? merged.skill_list ?? merged.tags);

  const avatarCandidates = parseList(merged.avatar ?? merged.avatar_url ?? merged.profileImage);
  const heroCandidates = parseList(merged.heroImage ?? merged.hero_image ?? merged.banner);
  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  // --- NEW: if user uploaded portfolio images during onboarding, use them as projects when no structured projects provided ---
  const portfolioRaw = parseList(
    merged.portfolio ??
      merged.portfolio_images ??
      merged.project_images ??
      merged.extra_fields?.portfolio ??
      merged.extra_fields?.portfolio_images ??
      []
  );

  if (projectsParsed.length === 0 && portfolioRaw.length) {
    // map portfolio image URLs into simple project objects so Projects tab shows them
    portfolioRaw.forEach((imgUrl) => {
      if (!imgUrl) return;
      projectsParsed.push({
        title: "",
        description: "",
        image: imgUrl,
      });
    });
  }
  // --------------------------------------------------------------------------------

  // placeholders only when template preview
  if (showFooter) {
    if (!avatar) avatar = "https://picsum.photos/seed/job-avatar/400/400";
    if (!heroImage) heroImage = "https://picsum.photos/seed/job-hero/1400/420";
    if (!projectsParsed.length) {
      projectsParsed.push(
        { title: "Onboardly — Mobile Onboarding", description: "Design & prototype, research-led improvements", image: "https://picsum.photos/seed/j1/800/600" },
        { title: "Shopflow — Checkout UX", description: "Reduced checkout abandonments by 16%", image: "https://picsum.photos/seed/j2/800/600" }
      );
    }
    if (!experience.length) experience.push("Senior Product Designer — Nova Labs | 2021 — Present", "Product Designer — PixelWave | 2017 — 2021");
    if (!skills.length) skills.push("UX Research", "Figma", "Design Systems", "Accessibility");
  }

  // coerce social/cv fields safely
  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const linkedinRaw = merged.linkedin ?? merged.extra_fields?.linkedin ?? "";
  const linkedin = Array.isArray(linkedinRaw) ? String(linkedinRaw[0]) : String(linkedinRaw ?? "");
  const githubRaw = merged.github ?? merged.extra_fields?.github ?? "";
  const github = Array.isArray(githubRaw) ? String(githubRaw[0]) : String(githubRaw ?? "");
  const cvRaw = merged.cv ?? merged.extra_fields?.cv ?? "";
  const cv = Array.isArray(cvRaw) ? String(cvRaw[0]).trim() : String(cvRaw ?? "");
  const profileUrlRaw = merged.profile_url ?? merged.extra_fields?.profile_url ?? "";
  const profileUrl = Array.isArray(profileUrlRaw) ? String(profileUrlRaw[0]).trim() : String(profileUrlRaw ?? "");

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (merged.whatsapp && String(merged.whatsapp).toString().startsWith("http") ? String(merged.whatsapp) : "");

  const makeUrl = (u?: string) => {
    if (!u) return "";
    try {
      if (/^https?:\/\//.test(u)) return u;
      return u;
    } catch {
      return String(u);
    }
  };

  useEffect(() => {
    // initial sensible tab: prefer resume/projects/skills in that order
    if (!showFooter) {
      if (experience.length) setTab("resume");
      else if (projectsParsed.length) setTab("projects");
      else if (skills.length) setTab("skills");
      else setTab("about");
    } else {
      setTab("about");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, showFooter]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --bg: #f6f7fb;
  --card: #ffffff;
  --accent: #0ea5a4;
  --muted: #6b7280;
  --text: #0b1320;
  --glass: rgba(255,255,255,0.7);
  --radius: 14px;
  --shadow-1: 0 6px 20px rgba(8,18,36,0.06);
  --shadow-2: 0 8px 36px rgba(8,18,36,0.08);
}

/* Mobile-first layout */
.jobwrap{
  max-width:920px;
  margin:14px auto;
  padding:14px;
  background:var(--bg);
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  color:var(--text);
  -webkit-font-smoothing:antialiased;
}

/* Hero: card look with subtle glass layer and soft shadow */
.hero{
  background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.78));
  border-radius: var(--radius);
  box-shadow: var(--shadow-1);
  padding:14px;
  display:flex;
  gap:12px;
  flex-direction:column;
  align-items:flex-start;
  border: 1px solid rgba(10,12,16,0.03);
}

/* top area */
.hero-top{
  width:100%;
  display:flex;
  gap:12px;
  align-items:flex-start;
}

/* avatar as nice circular card */
.avatar{
  width:76px;
  height:76px;
  border-radius:12px;
  background-size:cover;
  background-position:center;
  flex:0 0 76px;
  box-shadow: var(--shadow-2);
  border: 2px solid rgba(10,12,16,0.04);
}

/* meta vertical stack */
.meta{ flex:1; display:flex; gap:6px; align-items:flex-start; flex-direction:column; }

/* main name/role */
.name{ margin:0; font-size:18px; font-weight:800; letter-spacing:-0.2px; color:var(--text); }
.role{ margin:0; font-size:13px; color:var(--muted); font-weight:700; }

/* action row: stacked on mobile */
.actions{
  display:flex;
  gap:10px;
  width:100%;
  margin-top:6px;
  flex-direction:column;
}
.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:12px 14px;
  border-radius:12px;
  font-weight:800;
  text-decoration:none;
  cursor:pointer;
  border: none;
  width:100%;
  box-shadow: none;
}
.btn-primary{ background: linear-gradient(90deg,var(--accent), #34d399); color: #041018; }
.btn-ghost{ background: transparent; color: var(--text); border: 1px solid rgba(8,18,36,0.06); }

.stats{
  display:flex;
  gap:8px;
  margin-top:10px;
  flex-wrap:wrap;
}
.stat{
  background:var(--card);
  border-radius:10px;
  padding:8px 10px;
  color:var(--muted);
  font-weight:700;
  border: 1px solid rgba(8,18,36,0.03);
  font-size:13px;
}

/* Tabs - horizontal scroll with subtle underline indicator */
.tabs{
  display:flex;
  gap:8px;
  margin-top:14px;
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  padding-bottom:6px;
}
.tab{
  padding:10px 14px;
  border-radius:999px;
  background:transparent;
  border:1px solid rgba(8,18,36,0.04);
  color:var(--muted);
  font-weight:800;
  white-space:nowrap;
  cursor:pointer;
  transition: all .18s ease;
  font-size:13px;
}
.tab.active{
  background: linear-gradient(90deg,var(--accent), rgba(58,196,170,0.14));
  color:#041018;
  box-shadow: 0 8px 20px rgba(14,165,164,0.06);
  transform: translateY(-2px);
}

/* Panels */
.panels{ margin-top:14px; }
.panel{ display:none; color:var(--muted); line-height:1.6; }
.panel.active{ display:block; }

/* Timeline */
.timeline{
  list-style:none; padding:0; margin:8px 0 0; display:flex; flex-direction:column; gap:10px;
}
.timeline li{
  background:var(--card);
  border-radius:12px;
  padding:12px;
  border:1px solid rgba(8,18,36,0.03);
  display:flex; gap:12px; align-items:flex-start;
}
.timeline li strong{ display:block; color:var(--text); font-weight:800; }

/* Projects grid - mobile-first single column */
.projects{
  display:grid;
  gap:12px;
  grid-template-columns: 1fr;
  margin-top:10px;
}
.project{
  background:var(--card);
  border-radius:12px;
  padding:10px;
  border:1px solid rgba(8,18,36,0.03);
  box-shadow: 0 6px 18px rgba(8,18,36,0.03);
  overflow:hidden;
}
.project img{ width:100%; height:140px; object-fit:cover; border-radius:8px; display:block; }

/* Skills chips */
.chips{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
.chip{
  background: rgba(14,165,164,0.08);
  color: var(--text);
  padding:8px 10px;
  border-radius:999px;
  font-weight:700;
  font-size:13px;
  border: 1px solid rgba(14,165,164,0.08);
}

/* Contact panel styles */
.contact-list{ display:flex; flex-direction:column; gap:8px; margin-top:8px; color:var(--muted); }

/* Lightbox */
.lightbox{
  position:fixed; inset:0; z-index:1400; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.85);
}
.lightbox img{ max-width:92%; max-height:92%; border-radius:12px; box-shadow: 0 18px 40px rgba(8,18,36,0.6); }

/* Larger screens: hero horizontal with actions to the right */
@media (min-width:720px){
  .hero{ flex-direction:row; align-items:center; padding:18px; gap:18px; }
  .hero-top{ display:flex; gap:18px; align-items:center; width:100%; }
  .meta{ flex:1; }
  .actions{ width:auto; flex-direction:column; gap:10px; align-items:flex-end; }
  .btn{ width:auto; min-width:150px; }
  .projects{ grid-template-columns: repeat(2, 1fr); }
}
@media (min-width:980px){
  .projects{ grid-template-columns: repeat(3, 1fr); }
  .jobwrap{ padding:20px; }
}
` }} />

      <div className="jobwrap" role="main">
        <header className="hero" aria-label="Candidate summary">
          <div className="hero-top" style={{ width: "100%" }}>
            <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
            <div className="meta">
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>

              <div className="actions" aria-hidden={false}>
                <div style={{ display: "flex", gap: 8, flexDirection: "row", width: "100%" }}>
                  {email ? <a className="btn btn-primary" href={`mailto:${email}`} aria-label={`Email ${name}`}>Email</a> : null}
                  {phone ? <a className="btn btn-ghost" href={`tel:${phone.replace(/\s+/g, "")}`} aria-label={`Call ${name}`}>Call</a> : null}
                </div>
              </div>

              <div className="stats" aria-hidden="true">
                <div className="stat">{experience.length ? `${experience.length}+ roles` : "—"}</div>
                <div className="stat">{skills.length ? skills.slice(0, 3).join(" • ") : "—"}</div>
              </div>
            </div>

            <div className="actions" style={{ alignItems: "flex-end" }}>
              {cv ? (
                <a className="btn btn-primary" href={makeUrl(cv)} download aria-label="Download CV">Download CV</a>
              ) : (
                showFooter ? <a className="btn btn-primary" href="#" onClick={() => router.push("/onboarding/jobseeker")}>Use this template</a> : null
              )}
            </div>
          </div>
        </header>

        <nav className="tabs" role="tablist" aria-label="Profile tabs">
          <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
          <button className={`tab ${tab === "resume" ? "active" : ""}`} onClick={() => setTab("resume")}>Resume</button>
          <button className={`tab ${tab === "projects" ? "active" : ""}`} onClick={() => setTab("projects")}>Projects</button>
          <button className={`tab ${tab === "skills" ? "active" : ""}`} onClick={() => setTab("skills")}>Skills</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
        </nav>

        <section className="panels" aria-live="polite">
          <article id="about" className={`panel ${tab === "about" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Profile</h3>
            <p style={{ marginTop: 0 }}>{about}</p>
          </article>

          <article id="resume" className={`panel ${tab === "resume" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Work Experience</h3>
            <ul className="timeline" aria-live="polite">
              {experience.length ? experience.map((row, i) => (
                <li key={i}><div><strong>{row}</strong></div></li>
              )) : (showFooter ? <li className="project">No experience listed yet — sample only</li> : null)}
            </ul>
          </article>

          <article id="projects" className={`panel ${tab === "projects" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Selected Projects</h3>
            <div className="projects" aria-live="polite">
              {projectsParsed.length ? projectsParsed.map((p, i) => (
                <div className="project" key={i}>
                  {p.image ? <img src={p.image} alt={p.title || `project ${i + 1}`} onClick={() => openLightbox(p.image)} /> : null}
                  <div style={{ marginTop: 8 }}><strong>{p.title}</strong>{p.description ? <div className="sub">{p.description}</div> : null}</div>
                </div>
              )) : (showFooter ? <div className="project">No projects — sample only</div> : null)}
            </div>
          </article>

          <article id="skills" className={`panel ${tab === "skills" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Skills</h3>
            <div className="chips">
              {skills.length ? skills.map((s, i) => <div key={i} className="chip">{s}</div>) : (showFooter ? <div className="chip">Figma</div> : null)}
            </div>
          </article>

          <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
            <div className="contact-list">
              {email ? <div>Email: <a href={`mailto:${email}`}>{email}</a></div> : null}
              {phone ? <div>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></div> : null}
              {linkedin ? <div>LinkedIn: <a href={linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin.replace(/^@/, "")}`} target="_blank" rel="noreferrer">{linkedin}</a></div> : null}
              {github ? <div>GitHub: <a href={github.startsWith("http") ? github : `https://github.com/${github.replace(/^@/, "")}`} target="_blank" rel="noreferrer">{github}</a></div> : null}
              {cv ? <div><a className="btn btn-primary" href={makeUrl(cv)} download>Download CV</a></div> : null}
              {profileUrl ? <div><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR" style={{ width: 84, height: 84, borderRadius: 8 }} /></div> : null}
            </div>
          </article>
        </section>

        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
            <img src={lightboxSrc} alt="full" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}