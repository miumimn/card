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

  // Merge top-level and extra_fields
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

  const brandName = merged.company || merged.brandName || merged.name || (showFooter ? "BuildRight Contractors" : "");
  const role = merged.tagline || merged.role || (showFooter ? "General Contracting • Renovation • Structural Works" : "");
  const bio = merged.bio || merged.about || merged.description || "";

  const profileImgs = asArray(merged.profileImage ?? merged.profile_image ?? merged.logo ?? merged.extra_fields?.profileImage);
  const logo = profileImgs.length ? profileImgs[0] : null;

  const heroImgs = asArray(merged.heroImage ?? merged.hero_image ?? merged.extra_fields?.heroImage);
  const heroUrl = heroImgs.length ? heroImgs[0] : null;

  let services = asArray(merged.services ?? merged.extra_fields?.services ?? merged.service_list);
  if (!services.length && merged.services && typeof merged.services === "string") {
    services = merged.services.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  const servicesToShow = services.length ? services : (showFooter ? ["Residential Renovation", "Project Management", "Commercial Fit-out"] : []);

  const projectsStructured = merged.extra_fields && Array.isArray(merged.extra_fields.projects) ? merged.extra_fields.projects : null;
  const portfolioImgs = asArray(merged.portfolioImages ?? merged.portfolio ?? merged.projectPhotos ?? merged.extra_fields?.projectPhotos ?? merged.extra_fields?.portfolioImages);
  const projectsFromText = asArray(merged.projects ?? merged.project_list ?? merged.portfolio);
  const projects: { title: string; desc?: string; image?: string }[] = [];

  if (projectsStructured && projectsStructured.length) {
    for (const p of projectsStructured.slice(0, 6)) {
      projects.push({
        title: p.title || p.name || "",
        desc: p.desc || p.description || "",
        image: Array.isArray(p.image) ? p.image[0] : (p.image || ""),
      });
    }
  } else if (projectsFromText.length) {
    for (const line of projectsFromText.slice(0, 6)) {
      if (typeof line === "string") {
        const [title, desc] = line.split("|").map((s) => s.trim());
        projects.push({ title: title || line, desc: desc || "" });
      } else if (typeof line === "object") {
        projects.push({ title: line.title || line.name || "", desc: line.desc || "", image: Array.isArray(line.image) ? line.image[0] : line.image });
      }
    }
  } else if (portfolioImgs.length) {
    for (let i = 0; i < Math.min(portfolioImgs.length, 6); i++) {
      projects.push({ title: "", desc: "", image: portfolioImgs[i] });
    }
  } else {
    if (showFooter) {
      projects.push({ title: "Lincoln Ave Renovation", desc: "Full kitchen & living overhaul" });
      projects.push({ title: "Riverside Offices", desc: "Commercial fit-out & MEP" });
    }
  }

  // build contact href for Request Estimate: prefer phone -> email -> contact_url -> website -> #
  const phone = merged.phone || merged.contact || merged.extra_fields?.phone || "";
  const email = merged.email || merged.extra_fields?.email || "";
  const contactUrl = merged.contact_url || merged.extra_fields?.contact_url || "";
  const website = merged.website || merged.extra_fields?.website || "";
  const primaryHref = phone ? `tel:${String(phone).replace(/\s+/g, "")}` : (email ? `mailto:${email}` : (contactUrl || website || "#"));

  // open image in lightbox
  const openLightbox = (src: string | undefined | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{ --cc-bg:#fafafa; --cc-accent:#d97706; --cc-muted:#6b6b6b; --cc-text:#07121a }
body.cc{ margin:0; font-family:Inter,system-ui,Arial; background:var(--cc-bg); color:var(--cc-text) }
.wrap{ max-width:980px; margin:16px auto; padding:18px }

.hero{ display:flex; gap:12px; align-items:center; padding:14px; border-radius:12px; background:linear-gradient(180deg, rgba(217,119,6,0.03), rgba(0,0,0,0.01)) }
.logo{ width:92px; height:92px; border-radius:8px; background-size:cover; background-position:center; }
.meta{ flex:1 }
.name{ margin:0; font-weight:900; font-size:20px; color:var(--cc-accent) }
.role{ margin-top:6px; color:var(--cc-muted) }

/* Mobile-first: 2-up columns for project images */
.projects{ display:grid; gap:12px; grid-template-columns:repeat(2,1fr); margin-top:12px }
.project{ background:#fff; padding:12px; border-radius:10px; border:1px solid rgba(0,0,0,0.04) }

/* On wider screens show more columns */
@media (min-width:640px){
  .projects { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width:880px){
  .projects { grid-template-columns: repeat(4, 1fr); }
}

.services{ display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); margin-top:12px }
.service{ background:#fff; padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.04); font-weight:800 }

.cta{ margin-top:12px; display:flex; gap:8px }
.primary-btn{ padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,#ffd39f,var(--cc-accent)); color:#07121a; font-weight:900; }

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6,6,6,0.85);
  padding: 20px;
}
.lightbox img { max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
.lightbox .close { position: absolute; right: 20px; top: 20px; background: rgba(255,255,255,0.06); color: #fff; border: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
` }} />

      <div className="cc" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <header
            className="hero"
            style={heroUrl ? { backgroundImage: `linear-gradient(180deg, rgba(217,119,6,0.03), rgba(0,0,0,0.01)), url('${heroUrl}')` } : undefined}
          >
            <div className="logo" aria-hidden="true" style={logo ? { backgroundImage: `url('${logo}')` } : undefined} />
            <div className="meta">
              <h1 className="name">{brandName}</h1>
              <div className="role">{role}</div>
              {bio ? <div style={{ marginTop: 8, color: "var(--cc-muted)" }}>{bio}</div> : null}
            </div>
          </header>

          <div className="services" aria-live="polite">
            {servicesToShow.map((s: string, i: number) => (
              <div className="service" key={i}>{s}</div>
            ))}
          </div>

          <section className="projects" aria-live="polite">
            {projects.map((p, i) => (
              <div className="project" key={i}>
                {p.title ? <strong>{p.title}</strong> : p.image ? <strong>Project {i + 1}</strong> : null}
                {p.desc ? <div style={{ color: "var(--cc-muted)" }}>{p.desc}</div> : null}
                {p.image ? (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => openLightbox(p.image)}
                      style={{ padding: 0, border: "none", background: "transparent", display: "block", width: "100%", textAlign: "left", cursor: "pointer" }}
                      aria-label={`Open project image ${i + 1}`}
                    >
                      <img src={p.image} alt={p.title || `project-${i}`} style={{ width: "100%", borderRadius: 8, objectFit: "cover", display: "block" }} />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <div className="cta">
            <a className="primary-btn" href={primaryHref} aria-label="Request Estimate">Request Estimate</a>
            <a className="primary-btn" href={primaryHref} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.04)" }}>View Portfolio</a>
          </div>

          {showFooter ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <button className="primary-btn" onClick={() => router.push("/templates-preview")} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.06)", color: "var(--cc-text)" }}>Back</button>
              <button className="primary-btn" onClick={() => router.push("/onboarding/construction-contractor")}>Use this template</button>
            </div>
          ) : null}
        </main>
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