"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function InteriorDesignerPreview() {
  const router = useRouter();
  const [tab, setTab] = useState<string>("projects");

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --id-bg:#f7f6f4;
  --id-accent:#c07b5e;
  --id-muted:#6b6b72;
  --id-text:#1b1b1b;
}
body.interior{ margin:0; font-family:Inter,system-ui,Arial; background:var(--id-bg); color:var(--id-text); -webkit-font-smoothing:antialiased; }
.wrap{ max-width:1100px; margin:16px auto; padding:18px; }
.hero{ display:flex; gap:18px; align-items:center; padding:16px; border-radius:14px; background:linear-gradient(90deg, rgba(192,123,94,0.04), rgba(0,0,0,0.02)); }
.avatar{ width:110px; height:110px; border-radius:12px; background-image:url('https://picsum.photos/id/1011/400/400'); background-size:cover; border:4px solid #fff; }
.tabs{ display:flex; gap:8px; margin-top:14px; }
.tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--id-muted); font-weight:800; cursor:pointer; }
.tab.active{ background:linear-gradient(90deg,var(--id-accent), rgba(192,123,94,0.08)); color:#071019; border:none; box-shadow:0 10px 28px rgba(192,123,94,0.06); }
.panel{ display:none; margin-top:12px; color:var(--id-muted); line-height:1.6; }
.panel.active{ display:block; }
.grid{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-top:8px; }
.card{ background:#fff; padding:12px; border-radius:10px; border:1px solid rgba(0,0,0,0.04); }
` }} />

      <div className="interior" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <section className="hero">
            <div className="avatar" aria-hidden="true" />
            <div className="meta">
              <h1 style={{ margin: 0, fontWeight: 900 }}>Moss & Clay Interiors</h1>
              <div style={{ marginTop: 6, color: "var(--id-muted)" }}>Residential & Commercial Interior Design</div>
              <div style={{ marginTop: 10 }}>
                <a className="btn" href="#" style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(90deg,var(--id-accent),#ff9f7a)", color: "#fff", fontWeight: 800 }}>View Portfolio</a>
              </div>
            </div>
          </section>

          <nav className="tabs" role="tablist" style={{ marginTop: 12 }}>
            <button className={`tab ${tab === "projects" ? "active" : ""}`} onClick={() => setTab("projects")}>Projects</button>
            <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
            <button className={`tab ${tab === "testimonials" ? "active" : ""}`} onClick={() => setTab("testimonials")}>Testimonials</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </nav>

          <section className="panels">
            <article id="projects" className={`panel ${tab === "projects" ? "active" : ""}`}>
              <h3>Selected Projects</h3>
              <div className="grid">
                <div className="card">Loft Renovation — Minimal, warm textures</div>
                <div className="card">Boutique Retail — Lighting & fixtures</div>
                <div className="card">Family Home — Kitchen & living update</div>
              </div>
            </article>

            <article id="services" className={`panel ${tab === "services" ? "active" : ""}`}>
              <h3>Services</h3>
              <ul style={{ marginTop: 8, color: "var(--id-muted)" }}>
                <li>Full-service interior design</li>
                <li>Furniture & procurement</li>
                <li>Project management</li>
              </ul>
            </article>

            <article id="testimonials" className={`panel ${tab === "testimonials" ? "active" : ""}`}>
              <h3>Testimonials</h3>
              <div style={{ marginTop: 8 }}>
                <div className="card">"Transformed our space with thoughtful design — seamless from concept to delivery." — K.</div>
              </div>
            </article>

            <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`}>
              <h3>Contact</h3>
              <p style={{ margin: 0, color: "var(--id-muted)" }}>Email: <a href="mailto:hello@mossandclay.com">hello@mossandclay.com</a></p>
            </article>
          </section>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button className="btn" onClick={() => router.push("/preview")} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.06)" }}>Back</button>
            <button className="btn" onClick={() => router.push("/onboarding/interior-designer")} style={{ background: "linear-gradient(90deg,var(--id-accent),#ff9f7a)", color: "#fff" }}>Use this template</button>
          </div>
        </main>
      </div>
    </>
  );
}