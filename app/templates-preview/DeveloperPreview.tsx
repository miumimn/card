"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DevData = {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: string | string[];
  github?: string;
  npm?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  tech?: string[] | string;
  projects?: any;
  projectImages?: string[] | string;
  snippets?: string;
  resume?: string;
  hire_link?: string;
  profile_url?: string;
  extra_fields?: any;
};

export default function DeveloperPreview({ data, showFooter = true }: { data?: DevData; showFooter?: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState<string>("overview");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
        }
      } catch {}
    }
    return out as DevData;
  }, [data]);

  function asArray(val: any): string[] {
    if (!val && val !== "") return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try { const p = JSON.parse(s); if (Array.isArray(p)) return p.map(String).filter(Boolean); } catch {}
      if (s.includes("\n")) return s.split("\n").map(x => x.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }
  function asString(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length) return String(val[0]).trim();
    if (typeof val === "object") {
      const candidates = ["url","href","handle","username","value","link"];
      for (const k of candidates) if ((val as any)[k]) return String((val as any)[k]).trim();
      try { return JSON.stringify(val); } catch { return ""; }
    }
    return String(val).trim();
  }

  // primary fields and fallbacks only when showFooter is true
  const name = merged.name || (showFooter ? "Your Name" : "");
  const role = merged.role || (showFooter ? "Full‑Stack Developer • React / Node.js" : "");
  const bio = merged.bio || (showFooter ? "Building reliable, tested web apps — love DX, observability and clear APIs." : "");

  const avatarArr = asArray(merged.avatar ?? merged.profileImage ?? merged.extra_fields?.avatar);
  const avatar = avatarArr.length ? avatarArr[0] : "";

  // socials
  const github = asString(merged.github || merged.extra_fields?.github || "");
  const npm = asString(merged.npm || merged.extra_fields?.npm || "");
  const website = asString(merged.website || merged.extra_fields?.website || "");
  const twitter = asString(merged.twitter || merged.extra_fields?.twitter || "");
  const linkedin = asString(merged.linkedin || merged.extra_fields?.linkedin || "");
  const hireHref = asString(merged.hire_link || merged.extra_fields?.hire_link || merged.website || "");

  // tech & projects
  const tech = asArray(merged.tech ?? merged.extra_fields?.tech ?? []);
  const projectsStructured = merged.extra_fields && Array.isArray(merged.extra_fields.projects) ? merged.extra_fields.projects : null;
  const projectText = asArray(merged.projects ?? merged.extra_fields?.projects_text ?? []);
  const projectImgs = asArray(merged.projectImages ?? merged.extra_fields?.projectImages ?? merged.extra_fields?.project_images ?? []);

  // limit to 3 screenshots
  const projectScreens = projectImgs.slice(0, 3);

  // build projects array
  const projects: { title: string; desc?: string; image?: string }[] = [];
  if (projectsStructured && projectsStructured.length) {
    for (const p of projectsStructured.slice(0, 6)) {
      projects.push({ title: p.title || p.name || "", desc: p.desc || p.description || "", image: Array.isArray(p.image) ? p.image[0] : p.image });
    }
  } else if (projectText.length) {
    projectText.slice(0, 6).forEach(line => {
      const parts = String(line).split("|").map(s => s.trim());
      projects.push({ title: parts[0] || line, desc: parts[1] || "", image: parts[2] || "" });
    });
  } else if (projectScreens.length) {
    projectScreens.forEach((img, i) => projects.push({ title: `Project ${i + 1}`, desc: "", image: img }));
  }

  const snippetsRaw = merged.snippets ?? merged.extra_fields?.snippets ?? "";
  const snippets = typeof snippetsRaw === "string" ? snippetsRaw : (Array.isArray(snippetsRaw) ? snippetsRaw.join("\n\n") : "");

  const qrData = asString(merged.profile_url) || clientHref || "";

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{ --bg:#0b0f1a; --card:#0f1724; --accent:#6ee7b7; --muted:#9aa6b2; --text:#e6f7f1 }
body.dev-page{ margin:0; font-family:Inter,system-ui,Arial; background:linear-gradient(180deg,#06070a,#0b0f1a); color:var(--text); -webkit-font-smoothing:antialiased; }
.wrap{ max-width:980px; margin:14px auto; padding:14px; }
.header{ display:flex; gap:14px; align-items:center; border-radius:12px; padding:16px; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); box-shadow: 0 18px 40px rgba(2,6,23,0.6); }
.avatar{ width:88px; height:88px; border-radius:12px; background-size:cover; background-position:center; border:3px solid rgba(255,255,255,0.04); }
.meta{ flex:1; }
.name{ margin:0; font-weight:900; font-size:20px; color:var(--accent); }
.role{ margin:6px 0 0; color:var(--muted); font-weight:700; font-size:13px; }
.links{ display:flex; gap:8px; align-items:center; margin-top:8px; flex-wrap:wrap; }
.link{ color:var(--muted); background:transparent; border:1px solid rgba(255,255,255,0.02); padding:8px 10px; border-radius:8px; text-decoration:none; font-weight:700; font-size:13px; display:inline-flex; gap:8px; align-items:center; }
.tabs{ display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
.tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(255,255,255,0.03); color:var(--muted); font-weight:800; cursor:pointer; }
.tab.active{ background:linear-gradient(90deg,var(--accent), rgba(110,231,183,0.12)); color:#02110b; border:none; box-shadow:0 8px 24px rgba(110,231,183,0.05) }
.content{ margin-top:12px; display:block; }
.panel{ display:none; color:var(--muted); line-height:1.6; }
.panel.active{ display:block; }
.tech-list{ display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
.chip{ padding:6px 10px; border-radius:999px; background:rgba(255,255,255,0.02); color:var(--muted); font-weight:700; font-size:13px; }
.projects{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); margin-top:12px; }
.project{ background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.02); }
.project img{ width:100%; height:160px; object-fit:cover; border-radius:8px; margin-top:8px; cursor:pointer; }
.code-block{ background:#071018; padding:12px; border-radius:8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; color:#9fe3c6; font-size:13px; overflow:auto; }
.cta-row{ display:flex; gap:10px; margin-top:14px; align-items:center; flex-wrap:wrap; justify-content:space-between }
.primary-btn{ padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,#00d4a4,#6ee7b7); color:#02110b; font-weight:800; text-decoration:none; }
.lightbox{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(6,6,6,0.85); z-index:1200; }
.lightbox img{ max-width:100%; max-height:100%; border-radius:8px; }
@media (max-width:880px){ .header{ flex-direction:column; align-items:flex-start } .avatar{ width:72px; height:72px } }
` }} />

      <div className="dev-page" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <header className="header" aria-label="Developer header">
            <div className="avatar" aria-hidden="true" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
            <div className="meta">
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>
              {bio ? <div style={{ marginTop: 8, color: "var(--muted)" }}>{bio}</div> : null}

              <div className="links" aria-label="social links">
                {github ? <a className="link" href={github} target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 .5A12 12 0 0 0 0 12.6c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 1.9 2.8 2.7 1.6.7 3.3.5 4-.4 0-.5.3-1 .5-1.4-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.3-3.3-.1-.3-.6-1.7.1-3.6 0 0 1-.3 3.3 1.3a11 11 0 0 1 6 0c2.3-1.6 3.3-1.3 3.3-1.3.7 1.9.2 3.3.1 3.6.8.9 1.3 2 1.3 3.3 0 4.6-2.8 5.6-5.4 5.9.3.3.6.8.6 1.6v2.4c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/></svg> GitHub</a> : null}
                {npm ? <a className="link" href={npm} target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M3 3v18h18V3H3zm14 5v9h-2V8h2zm-4 0v9H9V8h4zM6 6h2v9H6V6z"/></svg> npm</a> : null}
                {website ? <a className="link" href={website} target="_blank" rel="noreferrer">WWW</a> : null}
                {twitter ? <a className="link" href={twitter} target="_blank" rel="noreferrer">Twitter</a> : null}
                {linkedin ? <a className="link" href={linkedin} target="_blank" rel="noreferrer">LinkedIn</a> : null}
              </div>
            </div>
          </header>

          <div className="tabs" role="tablist" aria-label="Profile tabs">
            <button className={`tab ${active === "overview" ? "active" : ""}`} onClick={() => setActive("overview")}>Overview</button>
            <button className={`tab ${active === "projects" ? "active" : ""}`} onClick={() => setActive("projects")}>Projects</button>
            <button className={`tab ${active === "snippets" ? "active" : ""}`} onClick={() => setActive("snippets")}>Snippets</button>
            <button className={`tab ${active === "resume" ? "active" : ""}`} onClick={() => setActive("resume")}>Resume</button>
          </div>

          <div className="content">
            <section className={`panel ${active === "overview" ? "active" : ""}`} aria-hidden={active !== "overview"}>
              {tech && tech.length ? (
                <>
                  <h3 style={{ margin: 0 }}>Tech</h3>
                  <div className="tech-list">
                    {tech.map((t, i) => <div className="chip" key={i}>{t}</div>)}
                  </div>
                </>
              ) : (showFooter ? (<div style={{ color: "var(--muted)" }}>Add your tech stack in onboarding (e.g. React, TypeScript, GraphQL)</div>) : null)}

              <div style={{ marginTop: 12 }} className="cta-row">
                <div>
                  {hireHref ? <a className="primary-btn" href={hireHref}>Hire Me</a> : (showFooter ? <a className="primary-btn" href="#">Hire Me</a> : null)}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`} alt="QR" style={{ width: 72, height: 72, borderRadius: 8, background: "#fff" }} />
                </div>
              </div>
            </section>

            <section className={`panel ${active === "projects" ? "active" : ""}`} aria-hidden={active !== "projects"}>
              {projects.length ? (
                <>
                  <h3 style={{ margin: 0 }}>Featured Projects</h3>
                  <div className="projects">
                    {projects.map((p, idx) => (
                      <div className="project" key={idx}>
                        <strong>{p.title}</strong>
                        {p.desc ? <div style={{ color: "var(--muted)", marginTop: 6 }}>{p.desc}</div> : null}
                        {p.image ? <img src={p.image} alt={p.title || `project-${idx}`} onClick={() => setLightbox(p.image)} /> : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : (showFooter ? <div style={{ color: "var(--muted)" }}>Add projects (Title | Description | image) in onboarding</div> : <div style={{ color: "var(--muted)" }}>No projects yet.</div>)}
            </section>

            <section className={`panel ${active === "snippets" ? "active" : ""}`} aria-hidden={active !== "snippets"}>
              {snippets ? (
                <>
                  <h3 style={{ margin: 0 }}>Snippets</h3>
                  <pre className="code-block" aria-hidden="true">{snippets}</pre>
                </>
              ) : (showFooter ? <div style={{ color: "var(--muted)" }}>Share some useful code snippets or examples here.</div> : null)}
            </section>

            <section className={`panel ${active === "resume" ? "active" : ""}`} aria-hidden={active !== "resume"}>
              {merged.resume ? (
                <>
                  <h3 style={{ margin: 0 }}>Resume</h3>
                  <div style={{ marginTop: 8 }}>
                    <a className="link" href={merged.resume} download>Download resume</a>
                  </div>
                </>
              ) : null}
              {!merged.resume && showFooter ? <div style={{ color: "var(--muted)" }}>Upload your resume (PDF) in onboarding</div> : null}
            </section>
          </div>

          {showFooter ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="primary-btn" onClick={() => router.push("/onboarding/developer")}>Use this template</button>
            </div>
          ) : null}
        </main>

        {lightbox ? (
          <div className="lightbox" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}