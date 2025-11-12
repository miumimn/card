"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContentCreatorPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
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
      if (e.key === "Escape") setLightboxSrc(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
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

  function asString(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length) return String(val[0]).trim();
    if (typeof val === "object") {
      const candidates = ["url", "href", "handle", "username", "value", "link"];
      for (const k of candidates) {
        if (val[k]) return String(val[k]).trim();
      }
      try {
        return JSON.stringify(val);
      } catch {
        return "";
      }
    }
    return String(val).trim();
  }

  // primary fields (prefer user-provided)
  const name = merged.name || merged.brandName || (showFooter ? "Rae Monroe" : "");
  const role = merged.role || merged.title || (showFooter ? "Content Creator — Lifestyle & Travel" : "");
  const bio = merged.bio || merged.about || "";

  // profile/avatar
  const profileImgs = asArray(merged.profileImage ?? merged.avatar ?? merged.profile_image ?? merged.extra_fields?.profileImage);
  const avatar = profileImgs.length ? profileImgs[0] : "";

  // stats
  const stats = asArray(merged.stats ?? merged.extra_fields?.stats);
  const statsToShow = stats.length ? stats : (showFooter ? ["120k Followers", "1.2M Views / Mo", "Brand kit available"] : []);

  // socials - normalize to strings (now includes tiktok + snapchat)
  const instagram = asString(merged.instagram ?? merged.extra_fields?.instagram ?? "");
  const youtube = asString(merged.youtube ?? merged.extra_fields?.youtube ?? "");
  const tiktok = asString(merged.tiktok ?? merged.extra_fields?.tiktok ?? "");
  const snapchat = asString(merged.snapchat ?? merged.extra_fields?.snapchat ?? "");
  const shop = asString(merged.shop ?? merged.extra_fields?.shop ?? merged.website ?? "");
  const sponsorHref = asString(merged.sponsor_link || merged.contact_url || merged.website || merged.extra_fields?.sponsor_link || "#");

  // featured media images
  const mediaImgs = asArray(merged.mediaImages ?? merged.featuredMedia ?? merged.projectPhotos ?? merged.extra_fields?.media ?? merged.extra_fields?.projectPhotos);
  const mediaToShow = mediaImgs.length ? mediaImgs.slice(0, 12) : (showFooter ? ["https://picsum.photos/seed/c1/800/600","https://picsum.photos/seed/c2/800/600","https://picsum.photos/seed/c3/800/600"] : []);

  // qr/profile_url SSR-safe
  const qrData = asString(merged.profile_url) || clientHref || "";

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  const Icon = ({ name }: { name: string }) => {
    switch (name) {
      case "youtube":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M23 7a3 3 0 0 0-2.1-2.1C18.9 4 12 4 12 4s-6.9 0-8.9.9A3 3 0 0 0 1 7 31 31 0 0 0 1 12a31 31 0 0 0 .1 5 3 3 0 0 0 2.1 2.1C5.1 20 12 20 12 20s6.9 0 8.9-.9A3 3 0 0 0 23 17c.1-1.6.1-5 .1-5s0-3.4-.1-5z" fill="#FF0000"/>
            <path d="M10 15V9l6 3-6 3z" fill="#fff"/>
          </svg>
        );
      case "instagram":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="#E1306C" strokeWidth="1.2" fill="none"/>
            <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z" stroke="#E1306C" strokeWidth="1.2" fill="none"/>
            <circle cx="17.5" cy="6.5" r="0.6" fill="#E1306C"/>
          </svg>
        );
      case "tiktok":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M9 8v8a4 4 0 1 0 4-4V6h3a4 4 0 0 1-3 2v4a2 2 0 1 1-2-2V8H9z" fill="#010101"/>
          </svg>
        );
      case "snapchat":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2c4.97 0 9 4.03 9 9 0 3.07-1.6 5.78-4 7.32V21s-1 .5-4 .5-4-.5-4-.5v-2.68C4.6 16.78 3 14.07 3 11 3 6.03 7.03 2 12 2z" fill="#FFFC00"/>
            <path d="M9 15s1 1 3 1 3-1 3-1" stroke="#000" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        );
      case "patreon":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="8" cy="12" r="4" fill="#F96854"/>
            <rect x="14" y="6" width="4" height="12" rx="1" fill="#F96854"/>
          </svg>
        );
      case "shop":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 7h4l1-3h6l1 3h4v13H4z" fill="#8B5CF6" />
            <path d="M9 10h6v7H9z" fill="#fff"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --cc-bg:#fffaf6;
  --cc-accent:#ff7a59;
  --cc-muted:#6b6b6b;
  --cc-text:#111827;
}
body.creator-page{ margin:0; font-family:Inter,system-ui,Arial; background:var(--cc-bg); color:var(--cc-text); -webkit-font-smoothing:antialiased; }
.wrap{ max-width:980px; margin:14px auto; padding:16px; }
.hero{ border-radius:12px; overflow:hidden; display:flex; gap:12px; align-items:center; padding:14px; background: linear-gradient(90deg, rgba(255,122,89,0.04), rgba(255,122,89,0.01)); box-shadow:0 10px 30px rgba(0,0,0,0.04); }
.avatar{ width:92px; height:92px; border-radius:999px; background-size:cover; border:4px solid #fff; }
.name{ margin:0; font-weight:900; font-size:20px; color:var(--cc-accent); }
.role{ margin:4px 0 0; color:var(--cc-muted); font-weight:700 }
.link-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-top:12px; }
.link-card{ background:#fff; padding:12px; border-radius:10px; display:flex; align-items:center; gap:10px; border:1px solid rgba(0,0,0,0.04); }
.media-grid{ display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-top:12px; }
.media img{ width:100%; height:160px; object-fit:cover; display:block; }
.cta-row{ display:flex; gap:12px; margin-top:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.sponsor-btn{ padding:10px 14px; border-radius:12px; background:linear-gradient(90deg,#ffd39f,var(--cc-accent)); font-weight:900; text-decoration:none; color:#071017; }
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

      <div className="creator-page" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <section className="hero">
            <div className="avatar" aria-hidden="true" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
            <div className="meta">
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>

              <div className="stats" aria-hidden="true" style={{ display: "flex", gap: 12, marginTop: 8 }}>
                {statsToShow.map((s: string, i: number) => (
                  <div className="stat" key={i}>{s}</div>
                ))}
              </div>
            </div>
          </section>

          <div className="link-grid" aria-label="Quick links">
            {instagram ? (
              <a className="link-card" href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/,"")}`}><Icon name="instagram" /><div><strong>Instagram</strong><small style={{ color: "var(--cc-muted)" }}>{instagram}</small></div></a>
            ) : null}
            {youtube ? (
              <a className="link-card" href={youtube}><Icon name="youtube" /><div><strong>YouTube</strong><small style={{ color: "var(--cc-muted)" }}>{youtube}</small></div></a>
            ) : null}
            {tiktok ? (
              <a className="link-card" href={tiktok.startsWith("http") ? tiktok : `https://tiktok.com/${tiktok.replace(/^@/,"")}`}><Icon name="tiktok" /><div><strong>TikTok</strong><small style={{ color: "var(--cc-muted)" }}>{tiktok}</small></div></a>
            ) : null}
            {snapchat ? (
              <a className="link-card" href={snapchat.startsWith("http") ? snapchat : `https://snapchat.com/add/${snapchat.replace(/^@/,"")}`}><Icon name="snapchat" /><div><strong>Snapchat</strong><small style={{ color: "var(--cc-muted)" }}>{snapchat}</small></div></a>
            ) : null}
            {shop ? <a className="link-card" href={shop}><Icon name="shop" /><div><strong>Shop</strong><small style={{ color: "var(--cc-muted)" }}>{shop}</small></div></a> : null}
            {!instagram && !youtube && !tiktok && !snapchat && !shop && showFooter ? (
              <>
                <a className="link-card" href="#"><Icon name="youtube" /><div><strong>YouTube</strong><small style={{ color: "var(--cc-muted)" }}>@channel</small></div></a>
                <a className="link-card" href="#"><Icon name="instagram" /><div><strong>Instagram</strong><small style={{ color: "var(--cc-muted)" }}>@handle</small></div></a>
              </>
            ) : null}
          </div>

          <h3 style={{ margin: "12px 0 8px" }}>Featured Content</h3>
          <div className="media-grid" aria-live="polite">
            {mediaToShow.map((src: string, i: number) => (
              <div className="media" key={i}>
                <button onClick={() => openLightbox(src)} style={{ padding: 0, border: "none", background: "transparent", width: "100%", display: "block", cursor: "pointer" }} aria-label={`Open media ${i+1}`}>
                  <img src={src} alt={`media ${i+1}`} />
                </button>
              </div>
            ))}
            {!mediaToShow.length && !showFooter ? null : null}
          </div>

          <div className="cta-row">
            <a className="sponsor-btn" href={sponsorHref} aria-label="Brand collab">Work with me — Sponsorships</a>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {merged.qr_url ? <img src={merged.qr_url} alt="QR" style={{ width: 72, height: 72, borderRadius: 8, background: "#fff" }} /> : (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`} alt="QR" style={{ width: 72, height: 72, borderRadius: 8, background: "#fff" }} />
              )}
              <div style={{ fontSize: 13, color: "var(--cc-muted)" }}>
                Download kit<br />
                <a href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData)}`} download style={{ color: "var(--cc-accent)" }}>Download</a>
              </div>
            </div>
          </div>

          {showFooter ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="sponsor-btn" onClick={() => router.push("/onboarding/content-creator")}>Use this template</button>
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