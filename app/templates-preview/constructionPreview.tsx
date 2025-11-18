"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConstructionPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxSrc(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // defensive merge of extra_fields
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
    return out;
  }, [data]);

  function asArray(val: any): string[] {
    if (!val && val !== "") return [];
    if (Array.isArray(val)) return val.filter(Boolean).map(String);
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try {
        const p = JSON.parse(s);
        if (Array.isArray(p)) return p.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }

  function resolveFirstString(input: any): string | null {
    if (!input && input !== "") return null;
    if (Array.isArray(input)) {
      for (const v of input) if (v) return String(v);
    } else if (typeof input === "string") {
      if (input.trim()) return input.trim();
    } else if (typeof input === "object" && input !== null) {
      const c = input.url || input.src || input.path || input.publicURL || input.public_url || input.fileUrl || input.file_url || input.preview || input.filename;
      if (c) return String(c);
    }
    return null;
  }

  // logo resolution
  const profileImgs = asArray(merged.profileImage ?? merged.profile_image ?? merged.extra_fields?.profileImage);
  const logoCandidates = [
    merged.logo,
    merged.brandLogo,
    merged.brand_logo,
    merged.extra_fields?.logo,
    merged.extra_fields?.brandLogo,
    merged.profileImage,
    merged.profile_image,
    profileImgs,
  ];

  let logo: string | null = null;
  for (const cand of logoCandidates) {
    const v = resolveFirstString(cand);
    if (v) {
      logo = v;
      break;
    }
  }
  if (!logo && merged.extra_fields) {
    const ef = merged.extra_fields;
    if (ef.logo) logo = resolveFirstString(ef.logo);
    if (!logo && ef.profileImage) logo = resolveFirstString(ef.profileImage);
  }

  // brand name resolution
  const brandName = (() => {
    const candidates = [
      merged.company,
      merged.companyName,
      merged.company_name,
      merged.brandName,
      merged.brand_name,
      merged.name,
      merged.fullName,
      merged.full_name,
      merged.displayName,
      merged.display_name,
      merged.userName,
      merged.username,
      merged.user?.name,
      merged.ownerName,
      merged.owner_name,
    ];
    for (const c of candidates) {
      if (!c && c !== "") continue;
      if (Array.isArray(c) && c.length) {
        const s = String(c[0]).trim();
        if (s) return s;
      }
      if (typeof c === "string" && c.trim()) return c.trim();
    }
    if (merged.email && typeof merged.email === "string") {
      const local = merged.email.split("@")[0];
      if (local && local.trim()) return local.trim();
    }
    return showFooter ? "BuildRight Contractors" : "";
  })();

  const role = merged.tagline || merged.role || (showFooter ? "General Contracting • Renovation • Structural Works" : "");
  const bio = merged.bio || merged.about || merged.description || merged.extra_fields?.about || "";

  const heroImgs = asArray(merged.heroImage ?? merged.hero_image ?? merged.extra_fields?.heroImage);
  const heroUrl = heroImgs.length ? heroImgs[0] : null;

  let services = asArray(merged.services ?? merged.extra_fields?.services ?? merged.service_list);
  if (!services.length && merged.services && typeof merged.services === "string") {
    services = merged.services.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  const servicesToShow = services.length ? services : (showFooter ? ["Residential Renovation", "Project Management", "Commercial Fit-out"] : []);

  const projectsStructured = merged.extra_fields && Array.isArray(merged.extra_fields.projects) ? merged.extra_fields.projects : null;
  const portfolioImgs = asArray(merged.portfolioImages ?? merged.portfolio ?? merged.projectPhotos ?? merged.extra_fields?.projectPhotos ?? merged.extra_fields?.portfolioImages);

  const projectsFromTextRaw = merged.projects ?? merged.project_list ?? merged.portfolio;
  const projectsFromText: any[] = Array.isArray(projectsFromTextRaw) ? projectsFromTextRaw : asArray(projectsFromTextRaw);

  const projects: { title: string; desc?: string; image?: string }[] = [];

  if (projectsStructured && projectsStructured.length) {
    for (const p of projectsStructured.slice(0, 12)) {
      projects.push({
        title: p.title || p.name || "",
        desc: p.desc || p.description || "",
        image: Array.isArray(p.image) ? p.image[0] : (p.image || ""),
      });
    }
  } else if (projectsFromText.length) {
    for (const line of projectsFromText.slice(0, 12)) {
      if (typeof line === "string") {
        const [title, desc] = line.split("|").map((s) => s.trim());
        projects.push({ title: title || line, desc: desc || "" });
      } else if (typeof line === "object" && line !== null) {
        projects.push({
          title: (line.title as string) || (line.name as string) || "",
          desc: (line.desc as string) || (line.description as string) || "",
          image: Array.isArray(line.image) ? line.image[0] : (line.image || ""),
        });
      }
    }
  } else if (portfolioImgs.length) {
    for (let i = 0; i < Math.min(portfolioImgs.length, 12); i++) {
      projects.push({ title: "", desc: "", image: portfolioImgs[i] });
    }
  } else {
    if (showFooter) {
      projects.push({ title: "Lincoln Ave Renovation", desc: "Full kitchen & living overhaul" });
      projects.push({ title: "Riverside Offices", desc: "Commercial fit-out & MEP" });
      projects.push({ title: "Harbor Blvd Extension", desc: "Two-storey extension & landscaping" });
    }
  }

  // build contact href
  const phone = merged.phone || merged.contact || merged.extra_fields?.phone || "";
  const email = merged.email || merged.extra_fields?.email || "";
  const contactUrl = merged.contact_url || merged.extra_fields?.contact_url || "";
  const website = merged.website || merged.extra_fields?.website || "";
  const primaryHref = phone ? `tel:${String(phone).replace(/\s+/g, "")}` : (email ? `mailto:${email}` : (contactUrl || website || "#"));

  const openLightbox = (src: string | undefined | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{ --cc-bg:#0f1720; --cc-accent:#d97706; --cc-muted:#9aa4ad; --cc-text:#f8fafc }

/* Page */
.cc{ margin:0; font-family:Inter,system-ui,Arial; background:linear-gradient(180deg,#071322,#0b1720); color:var(--cc-text); min-height:100vh; padding:28px 12px; box-sizing:border-box }
.wrap{ max-width:1100px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 18px 60px rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.02) }

/* Header/hero */
.header-hero{ display:flex; gap:18px; align-items:center; padding:28px; min-height:130px; position:relative }
.header-hero::after{ content:""; position:absolute; inset:0; pointer-events:none }
/* Logo */
.logo{ width:112px;height:112px;border-radius:9999px;background-size:cover;background-position:center;box-shadow:0 6px 20px rgba(2,6,23,0.6), inset 0 2px 0 rgba(255,255,255,0.02);border:4px solid rgba(255,255,255,0.06);flex:0 0 112px; display:flex; align-items:center; justify-content:center; overflow:hidden }

/* Meta */
.meta{ flex:1; display:flex; flex-direction:column; gap:6px }
.brand-row{ display:flex; gap:12px; align-items:center }
.name{ font-size:22px; font-weight:900; color:var(--cc-text); margin:0; text-shadow:0 6px 20px rgba(3,7,12,0.6) }
.role{ font-size:13px; font-weight:700; color:var(--cc-accent); margin-top:2px }
.bio{ color:var(--cc-muted); margin-top:8px; font-size:14px; line-height:1.45; max-width:78% }

/* Controls (desktop) */
.controls{ margin-left:auto; display:flex; gap:10px; align-items:center; }

/* Services */
.services{ display:flex; gap:10px; flex-wrap:wrap; padding:18px 28px 0 28px }
.service{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); padding:10px 14px; border-radius:999px; color:var(--cc-text); font-weight:700; font-size:13px }

/* Projects */
.section-head{ display:flex; align-items:center; justify-content:space-between; padding:18px 28px 6px 28px }
.section-head h3{ margin:0; color:var(--cc-text); font-weight:800; font-size:16px }
.projects{ padding:10px 18px 28px 18px; display:grid; gap:14px; grid-template-columns:repeat(2,1fr) }
@media(min-width:720px){ .projects{ grid-template-columns:repeat(3,1fr); padding:18px; gap:18px } }
@media(min-width:1100px){ .projects{ grid-template-columns:repeat(4,1fr) } }
.project{ position:relative; border-radius:12px; overflow:hidden; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); transition:transform .28s, box-shadow .28s; display:flex; flex-direction:column }
.project:hover{ transform:translateY(-6px); box-shadow:0 24px 60px rgba(2,6,23,0.6) }
.imgwrap{ width:100%; aspect-ratio:16/10; background:#0b1220; display:block }
.project img{ width:100%; height:100%; object-fit:cover; display:block }
.info{ padding:12px; display:flex; flex-direction:column; gap:6px }
.title{ font-weight:800; color:var(--cc-text); font-size:14px }
.desc{ color:var(--cc-muted); font-size:13px; line-height:1.35 }

/* CTA buttons */
.cta{ display:flex; gap:12px; justify-content:flex-end; padding:10px 28px 28px 28px }
.primary-btn{ background:linear-gradient(90deg,#ffd39f,var(--cc-accent)); color:#07121a; padding:10px 16px; border-radius:10px; font-weight:900; border:none; cursor:pointer }
.secondary-btn{ background:transparent; border:1px solid rgba(255,255,255,0.05); color:var(--cc-text); padding:10px 14px; border-radius:10px; cursor:pointer }

/* Lightbox */
.lightbox{ position:fixed; inset:0; z-index:1400; display:flex; align-items:center; justify-content:center; background:rgba(3,6,12,0.85); padding:24px }
.lightbox img{ max-width:92%; max-height:92%; border-radius:10px; box-shadow:0 24px 80px rgba(0,0,0,0.7) }
.lightbox .close{ position:absolute; right:26px; top:26px; background:rgba(255,255,255,0.06); color:var(--cc-text); border:none; padding:8px 10px; border-radius:8px; cursor:pointer }

/* Responsive fixes: move controls into flow on mobile so buttons aren't stuck in corner */
@media (max-width:720px) {
  .header-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px;
    gap: 12px;
  }
  .logo {
    width: 88px;
    height: 88px;
    flex: 0 0 88px;
  }
  .meta { width: 100%; }
  .bio { max-width: 100%; }

  /* Controls should sit below the meta and stretch nicely */
  .controls {
    margin-left: 0;
    margin-top: 8px;
    width: 100%;
    display: flex;
    gap: 10px;
    justify-content: flex-start;
  }
  .controls button {
    flex: 1 1 0;
    min-width: 0;
  }
}

/* Very small screens: stack buttons vertically for comfortable tap targets */
@media (max-width:420px) {
  .controls {
    flex-direction: column;
    gap: 8px;
  }
  .controls button { width: 100%; }
}
` }} />

      <div className="cc">
        <div className="wrap" role="region" aria-label="Construction preview">
          <header
            className="header-hero"
            style={heroUrl ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.18)), url('${heroUrl}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <div
              className="logo"
              aria-hidden="true"
              style={
                logo
                  ? { backgroundImage: `url('${logo}')` }
                  : { display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(90deg,#0b1320,#071322)" }
              }
              onClick={() => logo && openLightbox(logo)}
              role={logo ? "button" : undefined}
              aria-label={logo ? "Open logo image" : undefined}
            >
              {!logo ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 12l3-3 4 4 7-7 4 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : null}
            </div>

            <div className="meta">
              <div className="brand-row">
                <h1 className="name">{brandName}</h1>
              </div>

              <div className="role">{role}</div>
              {bio ? <div className="bio" style={{ marginTop: 10 }}>{bio}</div> : null}
            </div>

            <div className="controls" aria-hidden="true">
              <button className="secondary-btn" onClick={() => window.open(primaryHref === "#" ? "mailto:hello@example.com" : primaryHref, "_blank")}>Contact</button>
              <button className="primary-btn" onClick={() => window.open(website || primaryHref || "#", "_blank")}>Visit site</button>
            </div>
          </header>

          <div className="services" aria-live="polite" aria-label="Services offered">
            {servicesToShow.map((s: string, i: number) => (
              <div className="service" key={i}>{s}</div>
            ))}
          </div>

          <div className="section-head">
            <h3>Recent projects</h3>
            <div style={{ color: "var(--cc-muted)", fontSize: 13 }}>{projects.length} items</div>
          </div>

          <section className="projects" aria-live="polite" aria-label="Project gallery">
            {projects.map((p, i) => (
              <article className="project" key={i}>
                <div className="imgwrap" onClick={() => openLightbox(p.image)} role={p.image ? "button" : undefined} aria-label={p.image ? `Open ${p.title || `project ${i+1}`}` : undefined}>
                  {p.image ? <img src={p.image} alt={p.title || `project-${i+1}`} /> : <div style={{ padding: 18, color: "var(--cc-muted)" }}>No image</div>}
                </div>

                <div className="info">
                  <div className="title">{p.title || `Project ${i + 1}`}</div>
                  {p.desc ? <div className="desc">{p.desc}</div> : null}
                </div>
              </article>
            ))}
          </section>

          {/* CTA is now rendered only when showFooter is true */}
          {showFooter ? (
            <div className="cta">
              <button className="secondary-btn" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="primary-btn" onClick={() => router.push("/onboarding/construction-contractor")}>Use this template</button>
            </div>
          ) : null}
        </div>
      </div>

      {lightboxSrc ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxSrc(null)}>
          <button className="close" onClick={(e) => { e.stopPropagation(); setLightboxSrc(null); }} aria-label="Close">Close</button>
          <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </>
  );
}