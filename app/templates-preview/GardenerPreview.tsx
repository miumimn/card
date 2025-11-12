"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type GardenerData = {
  name?: string;
  subtitle?: string;
  about?: string;
  services?: string[] | string;
  portfolio?: string[] | string;
  tips?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  booking_link?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function GardenerPreview({ data, showFooter = true }: { data?: GardenerData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"services" | "projects" | "tips" | "contact">("services");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // tolerant parsers (arrays, JSON strings, comma/newline lists, single string)
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
      if (s.includes("\n")) return s.split("\n").map(p => p.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map(p => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
      } catch {}
    }
    return out as GardenerData;
  }, [data]);

  const name = merged.name ? String(merged.name) : (showFooter ? "GreenThumb Landscapes" : "");
  const subtitle = merged.subtitle ? String(merged.subtitle) : (showFooter ? "Landscaping • Garden Maintenance • Design" : "");
  const about = merged.about ? String(merged.about) : (showFooter ? "Creating beautiful, low-maintenance gardens — design, planting and ongoing care." : "");

  const services = parseList(merged.services ?? merged.service_list ?? merged.offerings);
  const tips = parseList(merged.tips ?? merged.seasonal_tips);
  const portfolio = parseList(merged.portfolio ?? merged.portfolio_images ?? merged.gallery).slice(0, 6);

  let avatar = parseList(merged.avatar ?? merged.avatar_url ?? merged.profileImage ?? merged.profile_image)[0] ?? "";
  let heroImage = parseList(merged.heroImage ?? merged.hero_image ?? merged.banner)[0] ?? "";

  // placeholders for template preview
  if (showFooter) {
    if (!heroImage) heroImage = "https://picsum.photos/seed/gardener-hero/1400/420";
    if (!avatar) avatar = "https://picsum.photos/seed/gardener-avatar/400/400";
    if (!portfolio.length) {
      portfolio.push(
        "https://picsum.photos/seed/garden1/1200/800",
        "https://picsum.photos/seed/garden2/1200/800",
        "https://picsum.photos/seed/garden3/1200/800"
      );
    }
    if (!tips.length) {
      tips.push("Prune late winter for spring growth.", "Mulch beds in autumn to retain moisture.");
    }
    if (!services.length) {
      services.push("Garden Maintenance", "Landscape Design", "Irrigation & Planting");
    }
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const whatsapp = merged.whatsapp ? String(merged.whatsapp) : "";
  const bookingLink = merged.booking_link ? String(merged.booking_link) : (merged.profile_url ? String(merged.profile_url) : "");
  const contactCards = parseList(merged.contact_cards ?? merged.contact_cards_list ?? merged.contactCards);

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (bookingLink || ""));

  const openLightbox = (src?: string | null) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        :root{ --gd-bg:#f6fbf6; --gd-accent:#2f7a3a; --gd-muted:#617864; --gd-text:#102017; }
        .gardener-wrap{ max-width:980px; margin:16px auto; padding:18px; font-family:Inter,system-ui,Arial; color:var(--gd-text); }
        .hero{ display:flex; gap:14px; align-items:center; padding:14px; border-radius:12px; background:linear-gradient(90deg, rgba(47,122,58,0.04), rgba(0,0,0,0.02)); box-shadow:0 10px 30px rgba(2,6,23,0.04); }
        .avatar{ width:96px; height:96px; border-radius:12px; background-size:cover; background-position:center; border:4px solid #fff; }
        .tabs{ display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
        .tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--gd-muted); font-weight:800; cursor:pointer; }
        .tab.active{ background:linear-gradient(90deg,var(--gd-accent), rgba(47,122,58,0.08)); color:#071019; border:none; box-shadow:0 10px 28px rgba(47,122,58,0.06); }
        .panel{ display:none; margin-top:12px; color:var(--gd-muted); line-height:1.6; }
        .panel.active{ display:block; }
        .grid{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); margin-top:8px; }
        .card{ background:#fff; padding:12px; border-radius:10px; border:1px solid rgba(0,0,0,0.04); color:var(--gd-text); }
        .portfolio-grid{ display:grid; grid-template-columns: 1fr; gap:12px; margin-top:12px; }
        .portfolio-grid img{ width:100%; height:200px; object-fit:cover; border-radius:10px; cursor:pointer; }
        @media(min-width:640px){ .portfolio-grid{ grid-template-columns: repeat(2,1fr); } }
        @media(min-width:980px){ .portfolio-grid{ grid-template-columns: repeat(3,1fr); } }
        .lightbox{ position:fixed; inset:0; z-index:1400; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.9); padding:18px; }
        .lightbox img{ max-width:96%; max-height:92%; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.6); }
        .cta{ margin-top:10px; }
        .btn{ padding:8px 12px; border-radius:10px; background:linear-gradient(90deg,var(--gd-accent),#6fc27a); color:#fff; font-weight:800; text-decoration:none; display:inline-block; }
      `}</style>

      <div className="gardener-wrap">
        <section className="hero" style={heroImage ? { backgroundImage: `url('${heroImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
          <div className="meta" style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontWeight: 900 }}>{name}</h1>
            <div style={{ marginTop: 6, color: 'var(--gd-muted)', fontWeight: 700 }}>{subtitle}</div>
            <div className="cta">
              {showFooter ? (
                <button className="btn" onClick={() => router.push("/onboarding/gardener")}>Use this template</button>
              ) : (
                <a className="btn" href={callHref || "#"}>Request Estimate</a>
              )}
            </div>
          </div>
        </section>

        <nav className="tabs" role="tablist" style={{ marginTop: 12 }}>
          <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
          <button className={`tab ${tab === "projects" ? "active" : ""}`} onClick={() => setTab("projects")}>Portfolio</button>
          <button className={`tab ${tab === "tips" ? "active" : ""}`} onClick={() => setTab("tips")}>Seasonal Tips</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
        </nav>

        <section className="panels">
          <article id="services" className={`panel ${tab === "services" ? "active" : ""}`}>
            <h3>Services</h3>
            <div className="grid">
              {services.map((s, i) => <div key={i} className="card"><strong>{s}</strong></div>)}
            </div>
          </article>

          <article id="projects" className={`panel ${tab === "projects" ? "active" : ""}`}>
            <h3>Portfolio</h3>
            <div className="portfolio-grid" role="list">
              {portfolio.map((p, i) => (
                <img key={i} src={p} alt={`project-${i+1}`} onClick={() => openLightbox(p)} role="button" aria-label={`Open project ${i + 1}`} />
              ))}
            </div>
          </article>

          <article id="tips" className={`panel ${tab === "tips" ? "active" : ""}`}>
            <h3>Seasonal Tips</h3>
            <ul style={{ marginTop: 8 }}>
              {tips.map((t, i) => <li key={i} style={{ color: 'var(--gd-muted)' }}>{t}</li>)}
            </ul>
          </article>

          <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`}>
            <h3>Contact</h3>
            {email ? <p style={{ margin: 0, color: 'var(--gd-muted)' }}>Email: <a href={`mailto:${email}`}>{email}</a></p> : null}
            {phone ? <p style={{ marginTop: 8, color: 'var(--gd-muted)' }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></p> : null}
            <div style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => router.push("/onboarding/gardener")}>Use this template</button>
            </div>
          </article>
        </section>

        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
            <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}