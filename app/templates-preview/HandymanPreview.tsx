"use client";
import React from "react";
import { useRouter } from "next/navigation";

/**
 * Full-bleed Handyman preview (mobile-first)
 * - Hero is full width edge-to-edge
 * - Content sections are full-bleed on mobile and constrained slightly on large screens
 * - Large tappable CTAs, theme-aware via CSS variables in globals.css
 */
export default function HandymanPreview() {
  const router = useRouter();

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
/* Full-bleed handyman preview (scoped) */
.handyman-page { min-height:100vh; background: var(--bg-soft); color: var(--text); }

/* hero: full width, edge to edge */
.handyman-hero {
  width:100%;
  display:block;
  position:relative;
  overflow:hidden;
  min-height:40vh;
  background-image: url('https://picsum.photos/id/1016/1600/900');
  background-size:cover;
  background-position:center;
}

/* subtle dark overlay for legibility on hero text */
.handyman-hero::after{
  content:"";
  position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.3));
  pointer-events:none;
}

/* hero content sits inside hero but text is full-bleed */
.hero-content{
  position:relative; z-index:2; padding:20px;
  display:flex; flex-direction:column; gap:8px; color: #fff;
}
.hero-brand { display:flex; gap:12px; align-items:center; }
.hero-avatar { width:84px; height:84px; border-radius:12px; background-image:url('https://picsum.photos/id/1005/400/400'); background-size:cover; background-position:center; box-shadow:0 10px 30px rgba(0,0,0,0.4); flex:0 0 84px; }
.hero-title { font-size:20px; font-weight:900; margin:0; color:#fff; }
.hero-sub { color: rgba(255,255,255,0.9); font-weight:700; font-size:13px; margin:0; }

/* content sections — full width, stacked */
.section {
  width:100%;
  padding:20px;
  background: transparent;
  display:block;
  border-top:1px solid var(--surface-elev);
}

/* within a section keep a comfortable max width on wide screens */
.section-inner { max-width:1100px; margin:0 auto; }

/* services grid */
.services-grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); margin-top:12px; }
.service-card { background: var(--card); padding:12px; border-radius:12px; border:1px solid var(--surface-elev); color:var(--text); font-weight:800; }

/* map / area */
.map { margin-top:12px; height:200px; border-radius:12px; overflow:hidden; border:1px solid var(--surface-elev); }

/* CTA bar (sticky on mobile bottom optional) */
.cta-row {
  display:flex;
  gap:12px;
  justify-content:stretch;
  align-items:center;
  margin-top:14px;
  width:100%;
}
.cta-row .btn {
  flex:1;
  padding:14px 16px;
  border-radius:12px;
  font-weight:900;
  border:none;
  cursor:pointer;
}
.btn-primary { background: linear-gradient(90deg,var(--accent),var(--accent-2)); color:#06101a; }
.btn-ghost { background: transparent; border: 1px solid var(--surface-elev); color: var(--text); }

/* footer area spacing */
.preview-footer { max-width:1100px; margin:18px auto; padding:0 20px; display:flex; gap:12px; justify-content:flex-end; }

/* mobile-first: stacked buttons */
@media(min-width:720px){
  .cta-row { justify-content: flex-end; }
  .cta-row .btn { width:auto; flex:unset; }
}
` }} />

      <div className="handyman-page">
        {/* HERO (full-bleed) */}
        <header className="handyman-hero" role="banner" aria-label="Handyman hero">
          <div className="hero-content" style={{ paddingTop: 28 }}>
            <div className="hero-brand">
              <div className="hero-avatar" aria-hidden="true" />
              <div>
                <h1 className="hero-title">FixUp Co.</h1>
                <p className="hero-sub">Local Handyman — Electrical • Plumbing • Carpentry</p>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="cta-row" style={{ maxWidth: 760 }}>
                <button className="btn btn-primary" onClick={() => router.push("/onboarding/handyman")}>Request Visit / Book</button>
                <a href="tel:+1234567890" className="btn btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>📞 Call Now</a>
              </div>
            </div>
          </div>
        </header>

        {/* Services section */}
        <section className="section" aria-labelledby="services-heading">
          <div className="section-inner">
            <h2 id="services-heading" style={{ margin: 0, fontSize: 18 }}>Services</h2>
            <p style={{ marginTop: 6, color: "var(--muted)" }}>Professional, timely and insured. We cover repairs, installations and maintenance.</p>

            <div className="services-grid" aria-hidden="false" style={{ marginTop: 12 }}>
              <div className="service-card">Small Repairs <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>From $45</div></div>
              <div className="service-card">Plumbing <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Leaks, installs</div></div>
              <div className="service-card">Carpentry <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Fitting & repairs</div></div>
            </div>
          </div>
        </section>

        {/* Pricing & quick info section */}
        <section className="section" aria-labelledby="pricing-heading">
          <div className="section-inner">
            <h2 id="pricing-heading" style={{ margin: 0, fontSize: 18 }}>Pricing</h2>
            <p style={{ marginTop: 6, color: "var(--muted)" }}>Transparent rates with optional call‑out fee.</p>

            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              <div style={{ padding: 12, borderRadius: 12, background: "var(--card)", border: "1px solid var(--surface-elev)", fontWeight: 900 }}> $45/hr — Standard</div>
              <div style={{ padding: 12, borderRadius: 12, background: "var(--card)", border: "1px solid var(--surface-elev)", fontWeight: 900 }}> $90 — Call‑out fee</div>
              <div style={{ padding: 12, borderRadius: 12, background: "var(--card)", border: "1px solid var(--surface-elev)", fontWeight: 900 }}> Free estimate for big jobs</div>
            </div>
          </div>
        </section>

        {/* Map / service area */}
        <section className="section" aria-labelledby="map-heading">
          <div className="section-inner">
            <h2 id="map-heading" style={{ margin: 0, fontSize: 18 }}>Service Area</h2>
            <div className="map" role="img" aria-label="Service area map" style={{ marginTop: 12 }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.50%2C-0.11%2C51.51&amp;layer=mapnik"
                style={{ width: "100%", height: "100%", border: 0 }}
                title="Service area"
              />
            </div>
          </div>
        </section>

        {/* Contact / CTA footer */}
        <div className="preview-footer">
          <button className="btn btn-ghost" onClick={() => router.push("/templates-preview")}>Back</button>
          <button className="btn btn-primary" onClick={() => router.push("/onboarding/handyman")}>Use this template</button>
        </div>
      </div>
    </>
  );
}