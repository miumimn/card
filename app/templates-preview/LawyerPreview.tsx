"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type LawyerData = {
  name?: string;
  title?: string;
  about?: string;
  services?: string[] | string;
  testimonials?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  booking_link?: string;
  profile_url?: string;
  extra_fields?: any;
};

export default function LawyerPreview({
  data,
  showFooter = true,
}: {
  data?: LawyerData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "services" | "testimonials" | "contact">("about");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
  }, []);

  const parseList = (val: any): string[] => {
    if (val == null) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try { const parsed = JSON.parse(s); if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean); } catch {}
      if (s.includes("\n")) return s.split("\n").map(l => l.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map(l => l.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

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
    return out as LawyerData;
  }, [data]);

  // data-driven fields (no template fallback on profile preview)
  const name = merged.name ? String(merged.name) : (showFooter ? "Jordan Malik" : "");
  const title = merged.title ? String(merged.title) : (showFooter ? "Attorney • Civil & Corporate Law" : "");
  const about = merged.about ? String(merged.about) : (showFooter ? "15+ years of legal expertise in civil and corporate law. Strategic counsel and client-first representation." : "");

  const services = parseList(merged.services ?? merged.offerings);
  const testimonials = parseList(merged.testimonials ?? merged.reviews);

  const avatarCandidates = parseList(merged.avatar ?? merged.avatar_url ?? merged.profileImage);
  const heroCandidates = parseList(merged.heroImage ?? merged.hero_image ?? merged.banner);
  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  // placeholders only for template preview
  if (showFooter) {
    if (!avatar) avatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop";
    if (!heroImage) heroImage = "https://picsum.photos/seed/lawyer-hero/1400/420";
    if (!services.length) services.push("Civil Litigation", "Contract Drafting", "Corporate Advisory", "Estate Planning");
    if (!testimonials.length) testimonials.push('"Resolved our merger smoothly." — Acme Inc.', '"Excellent representation" — S. Ahmed');
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const linkedin = merged.linkedin ? String(merged.linkedin) : "";
  const twitter = merged.twitter ? String(merged.twitter) : "";
  const website = merged.website ? String(merged.website) : "";
  const booking = merged.booking_link ? String(merged.booking_link) : "";
  const profileUrl = merged.profile_url ? String(merged.profile_url) : "";

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (booking || "#");

  const openLightbox = (src?: string | null) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        :root{
          --law-bg-top:#191d28; --law-bg-btm:#0c0f14; --law-accent:#f4c06a; --law-muted:#b2b6c3;
          --law-text:#f7f8fa; --law-surface:#23253a; --radius:14px;
        }
        .law-wrap{ max-width:1000px; margin:12px auto; padding:16px; font-family:Inter,system-ui,Arial; color:var(--law-text); }
        .hero{ border-radius:var(--radius); overflow:hidden; padding:14px; background:linear-gradient(90deg,var(--law-surface) 60%, #191d28 100%); box-shadow:0 12px 30px rgba(16,14,24,0.06); display:flex; gap:12px; flex-direction:column; align-items:flex-start; }
        .hero-top{ display:flex; gap:12px; width:100%; align-items:center; }
        .avatar{ width:72px; height:72px; border-radius:999px; background-size:cover; background-position:center; border:4px solid var(--law-surface); box-shadow:0 8px 28px rgba(16,14,24,0.08); flex:0 0 72px; }
        .meta{ flex:1; display:flex; flex-direction:column; gap:6px; }
        .name{ margin:0; font-size:18px; font-weight:800; color:var(--law-text); }
        .role{ margin:0; color:var(--law-accent); font-weight:700; font-size:13px; }
        .actions{ display:flex; gap:8px; margin-top:6px; width:100%; flex-wrap:wrap; }
        .btn{ padding:10px 12px; border-radius:10px; font-weight:800; border:none; cursor:pointer; text-decoration:none; }
        .btn-primary{ background:linear-gradient(90deg,var(--law-accent),#ffe7b3); color:#23253a; }
        .btn-ghost{ background:transparent; border:1px solid rgba(255,255,255,0.06); color:var(--law-text); }
        .tabs{ display:flex; gap:8px; margin-top:12px; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .tab{ padding:8px 12px; border-radius:999px; background:transparent; border:1px solid rgba(255,255,255,0.04); color:var(--law-muted); font-weight:700; cursor:pointer; white-space:nowrap; }
        .tab.active{ background: linear-gradient(90deg,var(--law-accent), rgba(244,192,106,0.12)); color:#23253a; transform:translateY(-2px); box-shadow:0 8px 20px rgba(244,192,106,0.06); }
        .panels{ margin-top:12px; max-width:720px; }
        .panel{ display:none; background:var(--law-surface); padding:14px; border-radius:12px; box-shadow:0 6px 24px rgba(16,14,24,0.06); color:var(--law-muted); line-height:1.6; }
        .panel.active{ display:block; }
        .services-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-top:8px; }
        .service-card{ background:rgba(244,192,106,0.12); padding:10px; border-radius:10px; font-weight:800; color:#241f1a; text-align:center; }
        .testimonials blockquote{ background:rgba(244,192,106,0.09); padding:10px; border-radius:8px; color:var(--law-accent); margin:0 0 8px; font-style:italic; }
        .qr-row{ display:flex; gap:12px; margin-top:12px; align-items:center; }
        @media(min-width:720px){ .hero{ flex-direction:row; align-items:center; } .meta{ flex:1; } .services-grid{ grid-template-columns:repeat(2,1fr); } }
      `}</style>

      <div className="law-wrap">
        <section className="hero" aria-label="Lawyer hero" style={heroImage ? { backgroundImage: `linear-gradient(90deg, var(--law-surface) 60%, #191d28 100%), url('${heroImage}')`, backgroundSize: '140% auto', backgroundPosition: 'center' } : undefined}>
          <div className="hero-top">
            <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
            <div className="meta">
              <h2 className="name">{name}</h2>
              <div className="role">{title}</div>

              <div className="actions">
                {email ? <a className="btn btn-primary" href={`mailto:${email}`}>Email</a> : null}
                {phone ? <a className="btn btn-ghost" href={`tel:${phone.replace(/\s+/g, "")}`}>Call</a> : null}
                {booking ? <a className="btn btn-primary" href={booking} target="_blank" rel="noreferrer">Book a Consultation</a> : null}
                {/* Use this template CTA shown only for template preview (showFooter === true) */}
                {showFooter ? (
                  <button className="btn btn-ghost" onClick={() => router.push("/onboarding/lawyer")}>Use this template</button>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {website ? <a className="btn btn-ghost" href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer">Website</a> : null}
            </div>
          </div>

          <nav className="tabs" role="tablist" aria-label="lawyer tabs" style={{ marginTop: 12 }}>
            <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
            <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Practice Areas</button>
            <button className={`tab ${tab === "testimonials" ? "active" : ""}`} onClick={() => setTab("testimonials")}>Testimonials</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </nav>
        </section>

        <div className="panels">
          <article id="about" className={`panel ${tab === "about" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>About</h3>
            <p style={{ marginTop: 6 }}>{about}</p>
          </article>

          <article id="services" className={`panel ${tab === "services" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Practice Areas</h3>
            <div className="services-grid">
              {services.map((s, i) => <div key={i} className="service-card">{s}</div>)}
            </div>
          </article>

          <article id="testimonials" className={`panel ${tab === "testimonials" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Testimonials</h3>
            <div className="testimonials">
              {testimonials.map((t, i) => <blockquote key={i}>"{t}"</blockquote>)}
            </div>
          </article>

          <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Contact & Booking</h3>
            <div style={{ marginTop: 8, color: "var(--law-muted)" }}>
              {email ? <div>Email: <a href={`mailto:${email}`}>{email}</a></div> : null}
              {phone ? <div style={{ marginTop: 8 }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></div> : null}
              {linkedin ? <div style={{ marginTop: 8 }}>LinkedIn: <a href={linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin.replace(/^@/, "")}`} target="_blank" rel="noreferrer">{linkedin}</a></div> : null}
              <div className="qr-row" style={{ marginTop: 12 }}>
                <img className="qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=58x58&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR" />
                {profileUrl ? <a className="download-qr-btn" href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}`} download>Download my QR code</a> : null}
              </div>
            </div>
          </article>
        </div>

        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
            <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}