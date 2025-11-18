"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SvgIcon from "@/components/Icon";

export default function CreatorPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("about");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? null : (i - 1 + lightboxImages.length) % lightboxImages.length));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? null : (i + 1) % lightboxImages.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex]);

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
    if (val === null || val === undefined) return [];
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

  function asString(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length) return String(val[0]).trim();
    if (typeof val === "object" && val !== null) {
      const candidates = ["url","href","handle","username","value","link"];
      for (const k of candidates) if (val[k]) return String(val[k]).trim();
      try { return JSON.stringify(val); } catch { return ""; }
    }
    return String(val).trim();
  }

  // primary fields
  const name = merged.name || merged.brandName || (showFooter ? "Riley Monet" : "");
  // Show exactly what the user provided for role/title.
  const roleText = merged.role || merged.title || "";
  const tagline = merged.tagline || merged.bio || merged.about || "";

  // images
  const profileImgs = asArray(merged.profileImage ?? merged.avatar ?? merged.extra_fields?.profileImage);
  const avatar = profileImgs.length ? profileImgs[0] : "";

  // mini gallery (use up to 6 for display)
  const miniGallery = asArray(merged.miniGallery ?? merged.extra_fields?.miniGallery);
  const miniGalleryToShow = miniGallery.length ? miniGallery.slice(0, 6) : [];

  // socials & links (we will show these in the Links tab)
  const youtube = asString(merged.youtube ?? merged.extra_fields?.youtube ?? "");
  const instagram = asString(merged.instagram ?? merged.extra_fields?.instagram ?? "");
  const patreon = asString(merged.patreon ?? merged.extra_fields?.patreon ?? "");
  const tiktok = asString(merged.tiktok ?? merged.extra_fields?.tiktok ?? "");
  const snapchat = asString(merged.snapchat ?? merged.extra_fields?.snapchat ?? "");
  const hireRaw = asString(merged.hire_link || merged.contact_url || merged.extra_fields?.hire_link || merged.extra_fields?.contact_url || "");

  // normalize hire/collab href so emails and plain hosts are handled correctly:
  // - If user entered a scheme (mailto:, http:, https:, tel:) keep it.
  // - If user entered an email like "name@domain.com" -> make mailto:
  // - If user entered a phone number -> tel:
  // - Otherwise if it looks like a host without scheme, prefix https://
  const computeHireHref = (raw: string) => {
    if (!raw) return "";
    const s = raw.trim();
    // already has scheme
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
    // email (basic)
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return `mailto:${s}`;
    // phone number (digits, spaces, +, -, parentheses)
    if (/^\+?[0-9\s().-]{7,}$/.test(s)) return `tel:${s.replace(/\s+/g, "")}`;
    // otherwise assume URL (add https)
    return s.startsWith("http") ? s : `https://${s}`;
  };
  const hireHref = computeHireHref(hireRaw);

  // featured media: use miniGallery
  const mediaToShow = miniGalleryToShow;

  // sponsor kit (kept for backwards compatibility variable but not displayed)
  const sponsorKit = merged.sponsor_kit || merged.sponsor_kit_url || merged.extra_fields?.sponsor_kit || merged.extra_fields?.sponsor_kit_url || "";

  // qr/profile url
  const qrData = asString(merged.profile_url) || clientHref || "";

  // lightbox images array (avatar first if present)
  const lightboxImages = (avatar ? [avatar] : []).concat(mediaToShow);
  const hasLightbox = lightboxImages.length > 0;

  const openLightboxAt = (index: number) => {
    if (!hasLightbox) return;
    const idx = Math.max(0, Math.min(index, lightboxImages.length - 1));
    setLightboxIndex(idx);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = (e?: React.MouseEvent) => { e?.stopPropagation(); setLightboxIndex(i => (i === null ? null : (i - 1 + lightboxImages.length) % lightboxImages.length)); };
  const nextLightbox = (e?: React.MouseEvent) => { e?.stopPropagation(); setLightboxIndex(i => (i === null ? null : (i + 1) % lightboxImages.length)); };

  // Reuse SvgIcon from repo - icon used in Links tab (no background)
  const LinkCard = ({ href, iconName, title, subtitle }: { href: string; iconName: string; title: string; subtitle?: string }) => {
    if (!href) return null;
    const target = href.startsWith("http") ? "_blank" : "_self";
    return (
      <a className="link-card" href={href} target={target} rel="noreferrer" aria-label={title}>
        <SvgIcon name={iconName} width={20} height={20} useImg />
        <div style={{ marginLeft: 8 }}>
          <strong>{title}</strong>
          {subtitle ? <div style={{ color: "var(--cc-muted)", fontSize: 13 }}>{subtitle}</div> : null}
        </div>
      </a>
    );
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --cc-bg:#0f1720;
  --cc-accent:#d97706;
  --cc-muted:#9aa4ad;
  --cc-text:#f8fafc;
}

/* container */
body.creator-page, .creator-page { background: linear-gradient(180deg,#071322,#0b1720); color:var(--cc-text); font-family:Inter,system-ui,Arial; -webkit-font-smoothing:antialiased; }
.container { max-width:1100px; margin:20px auto; padding:12px; box-sizing:border-box; display:grid; grid-template-columns: 1fr; gap:16px; }
@media(min-width:920px){ .container { grid-template-columns: 320px 1fr; gap:28px; } }

/* sidebar */
.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 12px;
  padding:18px;
  box-shadow: 0 18px 60px rgba(2,6,23,0.6);
  border:1px solid rgba(255,255,255,0.03);
}
.avatar {
  width:120px; height:120px; border-radius:16px; background-size:cover; background-position:center; box-shadow: 0 18px 40px rgba(2,6,23,0.5); border:4px solid rgba(255,255,255,0.04); margin:0 auto; cursor:pointer;
}
.name { font-weight:900; font-size:18px; text-align:center; margin-top:12px; color:var(--cc-text); }
.role { text-align:center; color:var(--cc-accent); margin-top:6px; font-weight:700; }

/* actions row with Hire / Collab button */
.actions { display:flex; gap:10px; margin-top:12px; justify-content:center; }
.primary-btn {
  background: linear-gradient(90deg,#ffd39f,var(--cc-accent));
  color:#07121a;
  font-weight:900;
  border-radius:10px;
  padding:10px 14px;
  border:none;
  text-decoration:none;
}
.ghost-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.05);
  color: var(--cc-text);
  padding:10px 12px;
  border-radius:10px;
  text-decoration:none;
}

/* mini gallery */
.mini-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-top:12px; }
.mini-grid img { width:100%; height:72px; object-fit:cover; border-radius:10px; cursor:pointer; }

/* main surface */
.surface {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 12px;
  padding:18px;
  box-shadow: 0 12px 36px rgba(2,6,23,0.4);
  border:1px solid rgba(255,255,255,0.02);
}

/* tabs */
.tabs { display:flex; gap:8px; margin-bottom:12px; }
.tab { padding:8px 12px; border-radius:10px; background:transparent; color:var(--cc-muted); font-weight:700; border:none; cursor:pointer; }
.tab.active { background: linear-gradient(90deg,#ffd39f,var(--cc-accent)); color:#07121a; box-shadow:0 10px 28px rgba(2,6,23,0.06); transform: translateY(-2px); }

/* links grid */
.links-grid { display:grid; gap:12px; grid-template-columns: repeat(2, 1fr); }
.link-card { display:flex; gap:12px; align-items:center; padding:12px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); color:var(--cc-text); border:1px solid rgba(255,255,255,0.02); text-decoration:none; }

/* media layout */
.media-grid { display:grid; gap:12px; grid-template-columns: repeat(2, 1fr); }
@media(min-width:920px){
  .media-grid { grid-template-columns: 2fr 1fr 1fr; grid-auto-rows: 180px; }
  .media-grid .media-item:first-child { grid-column: 1 / span 2; grid-row: span 2; }
}
.media-item img { width:100%; height:100%; object-fit:cover; border-radius:12px; display:block; cursor:pointer; }

/* lightbox */
.lightbox { position: fixed; inset: 0; z-index: 1400; display:flex; align-items:center; justify-content:center; background: rgba(6,6,6,0.9); padding:20px; }
.lightbox img { max-width:92%; max-height:92%; border-radius:12px; box-shadow:0 30px 80px rgba(0,0,0,0.7); }
.lightbox .close { position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.06); border:none; color:#fff; padding:8px 10px; border-radius:8px; cursor:pointer; }
.lightbox .nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.04); border:none; color:#fff; padding:10px 12px; border-radius:8px; cursor:pointer; }
.lightbox .prev { left:18px; } .lightbox .next { right:18px; }

/* footer ctas */
.footer-ctas { display:flex; gap:10px; justify-content:flex-end; margin-top:16px; }

/* small screens */
@media(max-width:480px) {
  .mini-grid img { height:60px; }
  .media-item img { height:140px; }
}
` }} />

      <div className="creator-page">
        <div className="container">
          {/* sidebar */}
          <aside className="card" aria-label="Profile card">
            <div
              className="avatar"
              style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
              onClick={() => avatar && openLightboxAt(0)}
              role={avatar ? "button" : undefined}
              aria-label={avatar ? "Open avatar" : undefined}
            />
            <div className="name">{name}</div>
            <div className="role">{roleText}</div>
            {tagline ? <div style={{ marginTop: 8, color: "var(--cc-muted)", textAlign: "center" }}>{tagline}</div> : null}

            {/* Hire / Collab button restored and now uses the normalized href */}
            <div className="actions" role="group" aria-label="Primary actions">
              <a className="primary-btn" href={hireHref || "#"}>{hireHref ? "Hire / Collab" : "Hire / Collab"}</a>
            </div>

            {miniGalleryToShow.length > 0 && (
              <div className="mini-grid" aria-label="Mini gallery">
                {miniGalleryToShow.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => openLightboxAt((avatar ? 1 : 0) + i)}
                    style={{ padding: 0, border: "none", background: "transparent" }}
                    aria-label={`Open mini ${i + 1}`}
                  >
                    <img src={src} alt={`mini ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* main */}
          <main className="surface" role="main" aria-label="Creator content">
            <div className="tabs" role="tablist" aria-label="Sections">
              <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
              <button className={`tab ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")}>Links</button>
              <button className={`tab ${tab === "media" ? "active" : ""}`} onClick={() => setTab("media")}>Media</button>
            </div>

            {/* ABOUT (sponsor kit removed) */}
            <section id="about" style={{ display: tab === "about" ? "block" : "none" }}>
              <h3 style={{ marginTop: 0 }}>About</h3>
              {tagline ? <p style={{ color: "var(--cc-muted)" }}>{tagline}</p> : <p style={{ color: "var(--cc-muted)" }}>No bio provided.</p>}
            </section>

            {/* LINKS - socials and other links */}
            <section id="links" style={{ display: tab === "links" ? "block" : "none" }}>
              <h3 style={{ marginTop: 0 }}>Links</h3>
              <div className="links-grid" role="list" aria-label="Links">
                <LinkCard href={youtube} iconName="youtube" title="YouTube" subtitle={merged.youtube_label || "Channel"} />
                <LinkCard href={instagram.startsWith("http") ? instagram : (instagram ? `https://instagram.com/${instagram.replace(/^@/,"")}` : "")} iconName="instagram" title="Instagram" subtitle={merged.instagram_label || instagram} />
                <LinkCard href={patreon} iconName="patreon" title="Patreon" subtitle={merged.patreon_label || "Support"} />
                <LinkCard href={tiktok.startsWith("http") ? tiktok : (tiktok ? `https://tiktok.com/${tiktok.replace(/^@/,"")}` : "")} iconName="tiktok" title="TikTok" subtitle={merged.tiktok_label || tiktok} />
                <LinkCard href={snapchat.startsWith("http") ? snapchat : (snapchat ? `https://snapchat.com/add/${snapchat.replace(/^@/,"")}` : "")} iconName="snapchat" title="Snapchat" subtitle={merged.snapchat_label || snapchat} />
                {/* Hire / Collab is now also available as a link card in Links tab, with normalized href */}
                <LinkCard href={hireHref} iconName="mail" title="Hire / Collab" subtitle={hireRaw} />
              </div>
            </section>

            {/* MEDIA */}
            <section id="media" style={{ display: tab === "media" ? "block" : "none" }}>
              <h3 style={{ marginTop: 0 }}>Media</h3>
              {mediaToShow.length > 0 ? (
                <div className="media-grid" role="list" aria-live="polite">
                  {mediaToShow.map((src, i) => (
                    <div key={i} className="media-item" role="listitem" style={{ minHeight: 120 }}>
                      <button
                        onClick={() => openLightboxAt((avatar ? 1 : 0) + i)}
                        style={{ padding: 0, border: "none", background: "transparent", width: "100%", height: "100%", display: "block", cursor: "pointer" }}
                        aria-label={`Open media ${i + 1}`}
                      >
                        <img src={src} alt={`media ${i + 1}`} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--cc-muted)", marginTop: 8 }}>No media uploaded.</div>
              )}
            </section>

            {showFooter ? (
              <div className="footer-ctas" style={{ marginTop: 16 }}>
                <button className="ghost-btn" onClick={() => router.push("/templates-preview")}>Back</button>
                <button className="primary-btn" onClick={() => router.push("/onboarding/creator")}>Use this template</button>
              </div>
            ) : null}
          </main>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => closeLightbox()}>
          <button className="close" onClick={(e) => { e.stopPropagation(); closeLightbox(); }} aria-label="Close">Close</button>
          <button className="nav prev" onClick={(e) => { e.stopPropagation(); prevLightbox(e); }} aria-label="Previous">‹</button>

          <img src={lightboxImages[lightboxIndex]} alt={`image ${lightboxIndex + 1}`} onClick={(e) => e.stopPropagation()} />

          <button className="nav next" onClick={(e) => { e.stopPropagation(); nextLightbox(e); }} aria-label="Next">›</button>
        </div>
      )}
    </>
  );
}