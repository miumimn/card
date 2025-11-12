"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type OpticianData = {
  name?: string;
  clinic?: string;
  about?: string;
  frames?: string[] | string;
  lenses?: string[] | string;
  services?: string[] | string;
  photos?: string[] | string;
  avatar?: string | string[];
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  booking_contact?: string; // can be phone or URL
  booking_link?: string; // fallback (older rows)
  profile_url?: string;
  extra_fields?: any;
};

function parseList(val: any): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p)) return p.map(String).filter(Boolean);
    } catch {}
    if (s.includes("\n")) return s.split("\n").map(x => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
}

/**
 * OpticianPreview
 * - 'Lenses' tab replaced with 'About' tab.
 * - Header tagline now shows clinic (location) only. The 'about' text is shown in the About tab.
 * - Booking button continues to accept phone or URL via booking_contact (or booking_link/profile_url fallback).
 */
export default function OpticianPreview({ data, showFooter = true }: { data?: OpticianData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"frames" | "about" | "services" | "contact">("frames");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
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
    return out as OpticianData;
  }, [data]);

  const name = merged.name ?? (showFooter ? "ClearSight Optics" : "");
  const clinic = merged.clinic ?? (showFooter ? "Downtown Clinic" : "");
  const about = merged.about ?? (showFooter ? "Eye exams, designer frames and custom lenses — quality care for your sight." : "");
  const frames = parseList(merged.frames ?? merged.extra_fields?.frames);
  const lenses = parseList(merged.lenses ?? merged.extra_fields?.lenses); // still parsed for backward compatibility, but not shown as a tab
  const services = parseList(merged.services ?? merged.extra_fields?.services);
  const photos = parseList(merged.photos ?? merged.extra_fields?.photos).slice(0, 6);

  const avatarCandidates = parseList(merged.avatar ?? merged.extra_fields?.avatar);
  const avatar = avatarCandidates.length ? avatarCandidates[0] : (showFooter ? "https://picsum.photos/seed/optician-avatar/400/400" : "");

  const email = merged.email ?? "";
  const phone = merged.phone ?? "";
  const instagram = merged.instagram ?? "";
  const facebook = merged.facebook ?? "";
  const website = merged.website ?? "";
  // use booking_contact first (new), fallback to booking_link/profile_url
  const bookingRaw = (merged.booking_contact ?? merged.booking_link ?? merged.profile_url ?? "").toString().trim();

  useEffect(() => {
    // initial sensible tab
    if (frames.length) setTab("frames");
    else if (about) setTab("about");
    else if (services.length) setTab("services");
    else setTab("contact");
  }, [frames.length, about, services.length]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  const Icon = {
    Instagram: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>
    ),
    Facebook: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.9 3.77-3.9 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.76-1.61 1.54V12h2.74l-.44 2.89h-2.3v6.99C18.34 21.12 22 16.99 22 12z" fill="currentColor"/></svg>
    ),
    Website: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M2 12h20" stroke="currentColor" strokeWidth="1.2"/></svg>
    )
  };

  const iconBtnStyle = (enabled = true): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
    background: enabled ? "rgba(0,0,0,0.04)" : "transparent",
    color: enabled ? "#0ea5a4" : "rgba(0,0,0,0.2)",
    border: "1px solid rgba(0,0,0,0.03)",
    textDecoration: "none",
    marginRight: 8
  });

  const buildHref = (value: string, provider: string) => {
    if (!value) return "";
    if (/^https?:\/\//.test(value)) return value;
    switch (provider) {
      case "instagram": return `https://instagram.com/${value.replace(/^@/, "")}`;
      case "facebook": return `https://facebook.com/${value}`;
      case "website": return value.startsWith("http") ? value : `https://${value}`;
      default: return value;
    }
  };

  const isPhoneLike = (v: string) => {
    if (!v) return false;
    if (v.startsWith("tel:")) return true;
    const cleaned = v.replace(/[()\s.-]/g, "");
    return /^(\+?\d{6,})$/.test(cleaned);
  };

  const bookingHref = (() => {
    if (!bookingRaw) return "";
    if (bookingRaw.startsWith("tel:")) return bookingRaw;
    if (isPhoneLike(bookingRaw)) {
      const cleaned = bookingRaw.replace(/[()\s.-]/g, "");
      return `tel:${cleaned.startsWith("+") ? cleaned : cleaned}`;
    }
    if (/^https?:\/\//.test(bookingRaw)) return bookingRaw;
    return `https://${bookingRaw}`;
  })();

  const bookingTarget = isPhoneLike(bookingRaw) ? undefined : "_blank";
  const bookingRel = isPhoneLike(bookingRaw) ? undefined : "noreferrer";

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        :root{ --op-bg:#f6f8fb; --op-accent:#0ea5a4; --op-muted:#6b7280; --op-text:#07121a; }
        .opt-wrap{ max-width:980px; margin:16px auto; padding:18px; font-family:Inter,system-ui,Arial; color:var(--op-text); background:var(--op-bg); }
        .hero{ display:flex; gap:12px; align-items:center; padding:14px; border-radius:12px; background:linear-gradient(90deg, rgba(14,165,164,0.04), rgba(0,0,0,0.01)); }
        .avatar{ width:88px; height:88px; border-radius:12px; background-size:cover; border:4px solid #fff; flex:0 0 88px; }
        .meta{ flex:1; display:flex; flex-direction:column; gap:6px; }
        .clinic{ margin:0; font-size:18px; font-weight:900; }
        .tagline{ margin:0; color:var(--op-muted); font-weight:700; }
        .actions{ display:flex; gap:8px; margin-top:8px; }
        .btn-primary{ padding:10px 12px; border-radius:10px; background:linear-gradient(90deg,var(--op-accent), #6ee7b7); color:#071019; font-weight:800; text-decoration:none; border:none; }
        .social-row{ display:flex; gap:8px; margin-top:12px; }
        .tabs{ display:flex; gap:8px; margin-top:12px; overflow:auto; -webkit-overflow-scrolling:touch; }
        .tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--op-muted); font-weight:700; cursor:pointer; white-space:nowrap; }
        .tab.active{ background:linear-gradient(90deg,var(--op-accent), rgba(14,165,164,0.08)); color:#041617; border:none; box-shadow:0 10px 28px rgba(14,165,164,0.06); }
        .panels{ margin-top:12px; }
        .panel{ display:none; color:var(--op-muted); line-height:1.6; }
        .panel.active{ display:block; }
        .grid{ display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); margin-top:8px; }
        .card{ background:#fff; padding:12px; border-radius:10px; border:1px solid rgba(0,0,0,0.04); }
        .gallery{ display:grid; gap:10px; grid-template-columns:repeat(2,1fr); margin-top:10px; }
        .gallery img{ width:100%; border-radius:10px; object-fit:cover; }
      `}</style>

      <div className="opt-wrap" role="main">
        <header className="hero" aria-label="Optician hero">
          <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
          <div className="meta">
            <h1 className="clinic">{name}</h1>
            {/* show clinic (location) alone in the header */}
            <div className="tagline">{clinic}</div>

            <div className="actions">
              <a
                className="btn-primary"
                href={bookingHref || "#"}
                target={bookingTarget}
                rel={bookingRel}
                aria-label={isPhoneLike(bookingRaw) ? "Call to book an eye test" : "Open booking site"}
              >
                {isPhoneLike(bookingRaw) ? "Call to Book" : "Book an Eye Test"}
              </a>
            </div>

            <div className="social-row" aria-label="Social links">
              {instagram ? <a href={buildHref(instagram, "instagram")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Instagram"><Icon.Instagram /></a> : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><Icon.Instagram /></span> : null)}
              {facebook ? <a href={buildHref(facebook, "facebook")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Facebook"><Icon.Facebook /></a> : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><Icon.Facebook /></span> : null)}
              {website ? <a href={buildHref(website, "website")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Website"><Icon.Website /></a> : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><Icon.Website /></span> : null)}
            </div>
          </div>
        </header>

        <nav className="tabs" role="tablist" aria-label="optician tabs">
          <button className={`tab ${tab === "frames" ? "active" : ""}`} onClick={() => setTab("frames")}>Frames</button>
          <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
          <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
        </nav>

        <div className="panels">
          <article className={`panel ${tab === "frames" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Designer Frames</h3>
            <div className="grid">
              {frames.length ? frames.map((f, i) => <div key={i} className="card">{f}</div>) : (showFooter ? <>
                <div className="card">Acetate Round — $180</div>
                <div className="card">Metal Aviator — $220</div>
                <div className="card">Classic Square — $160</div>
              </> : null)}
            </div>
          </article>

          <article className={`panel ${tab === "about" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>About</h3>
            <div style={{ color: "var(--op-muted)" }}>
              {about}
            </div>
          </article>

          <article className={`panel ${tab === "services" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Services</h3>
            <ul style={{ color: "var(--op-muted)" }}>
              {services.length ? services.map((s, i) => <li key={i}>{s}</li>) : <>
                <li>Comprehensive eye exam</li>
                <li>Contact lens fitting</li>
                <li>Repairs & adjustments</li>
              </>}
            </ul>

            {photos.length ? (
              <div className="gallery" aria-live="polite">
                {photos.map((p, i) => <img key={i} src={p} alt={`frame ${i+1}`} onClick={() => openLightbox(p)} />)}
              </div>
            ) : null}
          </article>

          <article className={`panel ${tab === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Contact</h3>
            <div style={{ color: "var(--op-muted)" }}>
              {phone ? <p>Phone: <a href={`tel:${phone}`}>{phone}</a></p> : null}
              {email ? <p>Email: <a href={`mailto:${email}`}>{email}</a></p> : null}
              {website ? <p>Website: <a href={buildHref(website, "website")} target="_blank" rel="noreferrer">{website}</a></p> : null}
            </div>
          </article>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn-primary" onClick={() => router.push("/templates-preview")} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.06)" }}>Back</button>
          {showFooter ? <button className="btn-primary" onClick={() => router.push("/onboarding/optician")}>Use this template</button> : null}
        </div>

        {lightbox ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)", zIndex: 1400 }}>
            <img src={lightbox} alt="full" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}