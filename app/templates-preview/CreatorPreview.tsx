"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("about");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  // close lightbox on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxSrc(null); };
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
    return out;
  }, [data]);

  function asArray(val: any): string[] {
    if (val === null || val === undefined) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") return [];
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
      for (const k of candidates) if (val[k]) return String(val[k]).trim();
      try { return JSON.stringify(val); } catch { return ""; }
    }
    return String(val).trim();
  }

  // primary fields (prefer user-provided)
  const name = merged.name || merged.brandName || (showFooter ? "Riley Monet" : "");
  const roleText = merged.role || merged.title || (showFooter ? "Visual Creator" : "");
  // About: show only if user supplied tagline/bio
  const tagline = merged.tagline || merged.bio || merged.about || "";

  // images
  const profileImgs = asArray(merged.profileImage ?? merged.avatar ?? merged.extra_fields?.profileImage);
  const avatar = profileImgs.length ? profileImgs[0] : "";

  // mini gallery (up to 3) - DO NOT fall back to template images if empty
  const miniGallery = asArray(merged.miniGallery ?? merged.extra_fields?.miniGallery);
  const miniGalleryToShow = miniGallery.length ? miniGallery.slice(0, 3) : [];

  // links / socials (includes tiktok and snapchat)
  const youtube = asString(merged.youtube ?? merged.extra_fields?.youtube ?? "");
  const instagram = asString(merged.instagram ?? merged.extra_fields?.instagram ?? "");
  const patreon = asString(merged.patreon ?? merged.extra_fields?.patreon ?? "");
  const merch = asString(merged.merch ?? merged.extra_fields?.merch ?? merged.shop ?? "");
  const tiktok = asString(merged.tiktok ?? merged.extra_fields?.tiktok ?? "");
  const snapchat = asString(merged.snapchat ?? merged.extra_fields?.snapchat ?? "");

  // featured media (up to 3) - DO NOT show template placeholders when empty
  const mediaImgs = asArray(merged.mediaImages ?? merged.projectPhotos ?? merged.extra_fields?.media ?? merged.featuredMedia);
  const mediaToShow = mediaImgs.length ? mediaImgs.slice(0, 3) : [];

  // sponsor kit / download (file URL or sponsor_kit_url) - show only when provided
  const sponsorKit = merged.sponsor_kit || merged.sponsor_kit_url || merged.extra_fields?.sponsor_kit || merged.extra_fields?.sponsor_kit_url || "";

  // qr/profile url
  const qrData = asString(merged.profile_url) || clientHref || "";

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  const Icon = ({ name }: { name: string }) => {
    // small inline SVG icons, kept lightweight and inlined to avoid deps
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
      case "patreon":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="8" cy="12" r="4" fill="#F96854"/>
            <rect x="14" y="6" width="4" height="12" rx="1" fill="#F96854"/>
          </svg>
        );
      case "merch":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }} xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 7h4l1-3h6l1 3h4v13H4z" fill="#8B5CF6" />
            <path d="M9 10h6v7H9z" fill="#fff"/>
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
      default:
        return null;
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
    /* Creator per-page styles — polished, luxury, scoped to body.creator-page */
    :root{
      --cr-bg-top: #071018;
      --cr-bg-bottom: #041018;
      --cr-surface: rgba(255,255,255,0.03);
      --cr-text: #e6eef6;
      --cr-muted: #9aa4b2;
      --cr-accent: #b06cff;
      --cr-accent-2: #ff8aa2;
      --cr-radius: 16px;
      --cr-max: 1100px;
    }

    body.creator-page { margin:0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; -webkit-font-smoothing:antialiased; background: linear-gradient(180deg, var(--cr-bg-top) 0%, var(--cr-bg-bottom) 100%); color: var(--cr-text); }
    .creator-content { width:100%; max-width:var(--cr-max); margin:20px auto; display:grid; grid-template-columns: 320px 1fr; gap:28px; padding:12px; align-items:start; }
    @media (max-width:880px) { .creator-content { grid-template-columns: 1fr; gap:14px; padding:10px; } }
    .creator-profile { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius: var(--cr-radius); padding:20px; display:flex; flex-direction:column; align-items:center; gap:12px; box-shadow: 0 12px 40px rgba(2,6,23,0.42); border:1px solid rgba(255,255,255,0.02); }
    .creator-profile .avatar { width:140px; height:140px; border-radius:18px; background-size:cover; background-position:center; box-shadow: 0 18px 40px rgba(2,6,23,0.5); border:4px solid rgba(255,255,255,0.04); }
    .creator-profile .name { font-size:20px; font-weight:800; margin:0; text-align:center; }
    .creator-profile .role { margin:0; color:var(--cr-muted); font-size:13px; font-weight:600; }
    .content-surface { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border-radius: var(--cr-radius); padding:22px; box-shadow: 0 10px 30px rgba(2,6,23,0.38); border:1px solid rgba(255,255,255,0.02); }
    .tabs { display:flex; gap:8px; }
    .tab { padding:8px 12px; border-radius:10px; background:transparent; color:var(--cr-muted); font-weight:700; cursor:pointer; border:none; }
    .tab.active { background: linear-gradient(90deg,var(--cr-accent),var(--cr-accent-2)); color:#06101a; box-shadow: 0 8px 24px rgba(6,16,26,0.24); transform: translateY(-2px); }
    .link-card { display:flex; flex-direction:row; align-items:center; gap:8px; padding:12px; border-radius:12px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); color:var(--cr-text); text-decoration:none; border:1px solid rgba(255,255,255,0.03); box-shadow:0 8px 24px rgba(2,6,23,0.04); transition: transform .12s ease; }
    .link-card:hover { transform: translateY(-6px); box-shadow:0 18px 36px rgba(2,6,23,0.24); }
    .media-row img { width:100%; border-radius:10px; object-fit:cover; display:block; }
    .sponsor-kit { margin-top:12px; padding:12px; border-radius:12px; background: rgba(255,255,255,0.02); display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.02); }
    /* Lightbox */
    .lightbox { position: fixed; inset: 0; z-index: 1200; display: flex; align-items: center; justify-content: center; background: rgba(6,6,6,0.85); padding: 20px; }
    .lightbox img { max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
    .lightbox .close { position: absolute; right: 20px; top: 20px; background: rgba(255,255,255,0.06); color: #fff; border: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
    ` }} />

      <div className="creator-page" style={{ minHeight: "100vh" }}>
        <div className="creator-content">
          <aside className="creator-left">
            <div className="creator-profile" role="complementary" aria-label="Creator profile">
              <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
              <div className="name">{name}</div>
              <div className="role muted">{roleText}</div>
              {tagline ? <div className="tagline" style={{ textAlign: "center", color: "var(--cr-muted)", marginTop: 6 }}>{tagline}</div> : null}

              <div className="cta-row" role="group" aria-label="Actions" style={{ width: "100%", marginTop: 8 }}>
                <a className="primary-btn" href={merged.hire_link || merged.contact_url || "#"} aria-label="Hire or Collaborate">Hire / Collab</a>
                <a className="btn-ghost" href={merged.store || merged.merch || "#"} aria-label="View Store">Store</a>
              </div>

              {miniGalleryToShow.length > 0 ? (
                <div className="mini-gallery" aria-hidden="false" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, width: "100%", marginTop: 10 }}>
                  {miniGalleryToShow.map((src, i) => (
                    <button key={i} onClick={() => openLightbox(src)} style={{ padding: 0, border: "none", background: "transparent", width: "100%", display: "block", cursor: "pointer" }} aria-label={`Open mini image ${i+1}`}>
                      <img src={src} alt={`post ${i+1}`} style={{ width: "100%", borderRadius: 10 }} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </aside>

          <main className="creator-right" role="main" aria-labelledby="name">
            <div className="content-surface">
              <div className="tabs" role="tablist" aria-label="Creator tabs" style={{ marginBottom: 12 }}>
                <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")} aria-controls="about">About</button>
                <button className={`tab ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")} aria-controls="links">Links</button>
                <button className={`tab ${tab === "media" ? "active" : ""}`} onClick={() => setTab("media")} aria-controls="media">Media</button>
              </div>

              {tagline ? (
                <section id="about" style={{ display: tab === "about" ? "block" : "none" }}>
                  <h3>About</h3>
                  <p className="muted">{tagline}</p>

                  {sponsorKit ? (
                    <div className="sponsor-kit" role="region" aria-label="Sponsor kit">
                      <div>
                        <strong style={{ color: "var(--cr-text)" }}>Sponsor Kit</strong>
                        <div className="meta">Sponsor kit available</div>
                      </div>
                      <a className="btn-ghost" href={sponsorKit} download aria-label="Download sponsor kit">Download</a>
                    </div>
                  ) : null}
                </section>
              ) : null }

              <section id="links" style={{ display: tab === "links" ? "block" : "none" }}>
                <h3>Links</h3>
                <div className="links-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                  {youtube ? <a className="link-card" href={youtube} aria-label="YouTube channel"><Icon name="youtube" /><div><strong>YouTube</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>{merged.youtube_label || "Channel"}</small></div></a> : null}
                  {instagram ? <a className="link-card" href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/,"")}`} aria-label="Instagram feed"><Icon name="instagram" /><div><strong>Instagram</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>{merged.instagram_label || instagram}</small></div></a> : null}
                  {patreon ? <a className="link-card" href={patreon} aria-label="Patreon"><Icon name="patreon" /><div><strong>Patreon</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>{merged.patreon_label || "Supporters"}</small></div></a> : null}
                  {merch ? <a className="link-card" href={merch} aria-label="Merch"><Icon name="merch" /><div><strong>Merch</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>{merged.merch_label || "Shop"}</small></div></a> : null}
                  {tiktok ? <a className="link-card" href={tiktok.startsWith("http") ? tiktok : `https://tiktok.com/${tiktok.replace(/^@/,"")}`} aria-label="TikTok"><Icon name="tiktok" /><div><strong>TikTok</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>{merged.tiktok_label || tiktok}</small></div></a> : null}
                  {snapchat ? <a className="link-card" href={snapchat.startsWith("http") ? snapchat : `https://snapchat.com/add/${snapchat.replace(/^@/,"")}`} aria-label="Snapchat"><Icon name="snapchat" /><div><strong>Snapchat</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>{merged.snapchat_label || snapchat}</small></div></a> : null}

                  {!youtube && !instagram && !patreon && !merch && !tiktok && !snapchat && showFooter ? (
                    <>
                      <a className="link-card" href="#" aria-label="YouTube channel"><Icon name="youtube" /><div><strong>YouTube</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>Channel — 240k subs</small></div></a>
                      <a className="link-card" href="#" aria-label="Instagram feed"><Icon name="instagram" /><div><strong>Instagram</strong><small style={{ display: "block", color: "var(--cr-muted)" }}>Feed — 180k followers</small></div></a>
                    </>
                  ) : null}
                </div>
              </section>

              <section id="media" style={{ display: tab === "media" ? "block" : "none" }}>
                <h3>Media</h3>
                {mediaToShow.length > 0 ? (
                  <div className="media-row" style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    {mediaToShow.length >= 1 ? (
                      <button onClick={() => openLightbox(mediaToShow[0])} style={{ padding: 0, border: "none", background: "transparent", cursor: "pointer" }}>
                        <img src={mediaToShow[0]} alt="media 1" style={{ width: "60%", borderRadius: 12 }} />
                      </button>
                    ) : null}
                    {mediaToShow.length >= 2 ? (
                      <button onClick={() => openLightbox(mediaToShow[1])} style={{ padding: 0, border: "none", background: "transparent", cursor: "pointer" }}>
                        <img src={mediaToShow[1]} alt="media 2" style={{ width: "40%", borderRadius: 12, objectFit: "cover" }} />
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div style={{ color: "var(--cr-muted)", marginTop: 8 }}>No media uploaded.</div>
                )}
              </section>
            </div>

            {showFooter ? (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
                <button className="primary-btn" onClick={() => router.push("/onboarding/creator")}>Use this template</button>
              </div>
            ) : null}
          </main>
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