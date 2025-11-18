"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SvgIcon from "@/components/Icon";

export default function ContentCreatorPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
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

  // primary fields
  const name = merged.name || merged.brandName || (showFooter ? "Rae Monroe" : "");
  const role = merged.role || merged.title || (showFooter ? "Content Creator — Lifestyle & Travel" : "");
  const bio = merged.bio || merged.about || "";

  // profile/avatar
  const profileImgs = asArray(merged.profileImage ?? merged.avatar ?? merged.profile_image ?? merged.extra_fields?.profileImage);
  const avatar = profileImgs.length ? profileImgs[0] : "";

  // structured stats support: prefer structured then freeform
  const structuredStats: { label: string; value: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const lab = asString(merged[`stats_label_${i}`] ?? merged.extra_fields?.[`stats_label_${i}`]);
    const val = asString(merged[`stats_value_${i}`] ?? merged.extra_fields?.[`stats_value_${i}`]);
    if (lab || val) structuredStats.push({ label: lab || val, value: val || lab });
  }
  const freeformStats = asArray(merged.stats ?? merged.extra_fields?.stats);
  const statsToShow = structuredStats.length
    ? structuredStats.map((s) => `${s.value ? `${s.value} ` : ""}${s.label}`)
    : (freeformStats.length ? freeformStats : (showFooter ? ["120k Followers", "1.2M Views / Mo", "Brand kit available"] : []));

  // socials — structured + legacy
  const instagramHandle = asString(merged.instagram_handle ?? merged.instagram ?? merged.extra_fields?.instagram ?? "");
  const instagramFollowers = asString(merged.instagram_followers ?? merged.extra_fields?.instagram_followers ?? "");
  const youtubeHref = asString(merged.youtube ?? merged.extra_fields?.youtube ?? "");
  const youtubeSubscribers = asString(merged.youtube_subscribers ?? merged.extra_fields?.youtube_subscribers ?? "");
  const tiktokHandle = asString(merged.tiktok_handle ?? merged.tiktok ?? merged.extra_fields?.tiktok ?? "");
  const tiktokFollowers = asString(merged.tiktok_followers ?? merged.extra_fields?.tiktok_followers ?? "");
  const snapchatHandle = asString(merged.snapchat_handle ?? merged.snapchat ?? merged.extra_fields?.snapchat ?? "");
  const snapchatFollowers = asString(merged.snapchat_followers ?? merged.extra_fields?.snapchat_followers ?? "");
  const shopHref = asString(merged.shop ?? merged.extra_fields?.shop ?? merged.website ?? "");
  const sponsorHref = asString(merged.sponsor_link || merged.contact_url || merged.website || merged.extra_fields?.sponsor_link || "#");

  // media
  const mediaImgs = asArray(merged.mediaImages ?? merged.featuredMedia ?? merged.projectPhotos ?? merged.extra_fields?.media ?? merged.extra_fields?.projectPhotos);
  const mediaToShow = mediaImgs.length ? mediaImgs.slice(0, 12) : (showFooter ? ["https://picsum.photos/seed/c1/800/600","https://picsum.photos/seed/c2/800/600","https://picsum.photos/seed/c3/800/600"] : []);

  // qr/profile_url SSR-safe
  const qrData = asString(merged.profile_url) || clientHref || "";

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    // find index in lightboxImages and open
    const imgs = (avatar ? [avatar] : []).concat(mediaToShow);
    const idx = imgs.indexOf(src);
    if (idx >= 0) setLightboxIndex(idx);
    else setLightboxIndex(0);
  };

  // build the lightbox image list: avatar first (if present) then media
  const lightboxImages = (avatar ? [avatar] : []).concat(mediaToShow);
  const hasLightbox = lightboxImages.length > 0;

  // open lightbox at index
  const openLightboxAt = (index: number) => {
    if (!hasLightbox) return;
    const safeIndex = Math.max(0, Math.min(index, lightboxImages.length - 1));
    setLightboxIndex(safeIndex);
  };

  // keyboard navigation + escape handling
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? null : (i - 1 + lightboxImages.length) % lightboxImages.length));
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? null : (i + 1) % lightboxImages.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, lightboxImages.length]);

  // close on overlay click
  const closeLightbox = () => setLightboxIndex(null);
  const showPrev = () => setLightboxIndex((i) => (i === null ? null : (i - 1 + lightboxImages.length) % lightboxImages.length));
  const showNext = () => setLightboxIndex((i) => (i === null ? null : (i + 1) % lightboxImages.length));

  // render a social logo-button using project svg files (no backgrounds)
  const SocialButton = ({ href, name }: { href: string; name: string }) => {
    if (!href) return null;
    const target = href.startsWith("http") ? "_blank" : "_self";
    return (
      <a className="social-btn" href={href} target={target} rel="noreferrer" aria-label={name}>
        <span className="social-logo" aria-hidden>
          <SvgIcon name={name} width={28} height={28} useImg />
        </span>
      </a>
    );
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --bg:#fffaf6;
  --accent:#ff7a59;
  --muted:#6b6b6b;
  --text:#111827;
  --card: #fff;
}

/* Mobile-first layout (stacked) */
body.creator-page{ margin:0; font-family:Inter,system-ui,Arial; background:var(--bg); color:var(--text); -webkit-font-smoothing:antialiased; }
.wrap{ max-width:1100px; margin:14px auto; padding:12px; box-sizing:border-box; }

/* HERO - mobile first (column) */
.hero {
  display:flex;
  flex-direction:column;
  gap:12px;
  align-items:flex-start;
  padding:14px;
  border-radius:12px;
  background: linear-gradient(90deg, rgba(255,122,89,0.04), rgba(255,122,89,0.01));
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}
.avatar { width:84px; height:84px; border-radius:999px; background-size:cover; background-position:center; border:4px solid #fff; cursor:pointer; }
.meta { display:flex; flex-direction:column; gap:6px; width:100%; }
.name { font-weight:900; font-size:18px; color:var(--accent); margin:0; }
.role { color:var(--muted); font-weight:700; font-size:13px; margin:0; }

/* stats scrollable row on mobile */
.stats { display:flex; gap:8px; margin-top:8px; overflow-x:auto; padding-bottom:6px; -webkit-overflow-scrolling:touch; }
.stat { background:var(--card); border-radius:10px; padding:8px 10px; box-shadow: 0 6px 18px rgba(0,0,0,0.04); font-weight:800; white-space:nowrap; }

/* Social logo buttons - mobile-first: icons only, horizontally scrollable */
.social-row {
  display:flex;
  gap:8px;
  margin-top:12px;
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  padding-bottom:6px;
}
.social-row::-webkit-scrollbar { height:8px; }
.social-row::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius:999px; }

.social-btn {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:48px;
  height:48px;
  padding:6px;
  background:transparent;
  border-radius:8px;
  text-decoration:none;
  color:inherit;
  flex:0 0 auto;
  border: none;
}
.social-logo { display:inline-flex; width:28px; height:28px; align-items:center; justify-content:center; }

/* media grid */
.media-grid { display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); margin-top:12px; }
.media img { width:100%; height:160px; object-fit:cover; border-radius:10px; display:block; cursor:pointer; }

/* CTA row */
.cta-row { display:flex; gap:12px; margin-top:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.sponsor-btn { padding:10px 14px; border-radius:12px; background:linear-gradient(90deg,#ffd39f,var(--accent)); font-weight:900; color:#071017; text-decoration:none; }

/* QR area */
.qr { display:flex; gap:10px; align-items:center; }

/* Footer CTAs */
.footer-ctas { display:flex; gap:10px; justify-content:flex-end; margin-top:16px; }

/* Lightbox overlay + nav */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6,6,6,0.85);
  padding: 24px;
}
.lightbox img { max-width: 92%; max-height: 92%; border-radius: 8px; box-shadow: 0 24px 80px rgba(0,0,0,0.7); }
.lightbox .close { position:absolute; right:24px; top:24px; background:rgba(255,255,255,0.06); color: #fff; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; }
.lightbox .nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.04); border:none; color:#fff; padding:10px; border-radius:8px; cursor:pointer; }
.lightbox .prev { left:20px; }
.lightbox .next { right:20px; }

/* Larger screens keep the icons but still no text (per request) */
@media (min-width:760px) {
  .hero { flex-direction:row; align-items:center; }
  .meta { flex:1; }
  .avatar { width:96px; height:96px; }
  .name { font-size:20px; }
  .stats { margin-top:12px; }
  .social-row { gap:12px; }
  .social-btn { width:56px; height:56px; }
  .media img { height:200px; }
}
` }} />

      <div className="creator-page" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <section className="hero" aria-label="Profile hero">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                className="avatar"
                aria-hidden="true"
                style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
                onClick={() => {
                  if (avatar) openLightboxAt(0);
                }}
                role={avatar ? "button" : undefined}
                aria-label={avatar ? "Open profile image" : undefined}
              />
              <div className="meta">
                <h1 className="name">{name}</h1>
                <div className="role">{role}</div>

                <div className="stats" aria-hidden="true">
                  {statsToShow.map((s: string, i: number) => (
                    <div className="stat" key={i}>{s}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social logo-buttons (mobile-first). Icons only, horizontally scrollable. */}
            <div className="social-row" role="navigation" aria-label="Social links">
              <SocialButton
                href={instagramHandle ? (instagramHandle.startsWith("http") ? instagramHandle : `https://instagram.com/${instagramHandle.replace(/^@/, "")}`) : ""}
                name="instagram"
              />
              <SocialButton
                href={youtubeHref || ""}
                name="youtube"
              />
              <SocialButton
                href={tiktokHandle ? (tiktokHandle.startsWith("http") ? tiktokHandle : `https://tiktok.com/${tiktokHandle.replace(/^@/, "")}`) : ""}
                name="tiktok"
              />
              <SocialButton
                href={snapchatHandle ? (snapchatHandle.startsWith("http") ? snapchatHandle : `https://snapchat.com/add/${snapchatHandle.replace(/^@/, "")}`) : ""}
                name="snapchat"
              />
              <SocialButton href={shopHref || ""} name="shop" />
            </div>
          </section>

          <h3 style={{ margin: "16px 0 8px" }}>Featured Content</h3>
          <div className="media-grid" aria-live="polite">
            {mediaToShow.map((src: string, i: number) => {
              // compute lightbox index: avatar present => media start at index 1
              const offset = avatar ? 1 : 0;
              return (
                <div className="media" key={i}>
                  <button
                    onClick={() => openLightboxAt(i + offset)}
                    style={{ padding: 0, border: "none", background: "transparent", width: "100%", display: "block", cursor: "pointer" }}
                    aria-label={`Open media ${i + 1}`}
                  >
                    <img src={src} alt={`media ${i + 1}`} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cta-row">
            <a className="sponsor-btn" href={sponsorHref} aria-label="Brand collab" target="_blank" rel="noreferrer">Work with me</a>

            <div className="qr" aria-hidden={!qrData} style={{ marginLeft: "auto" }}>
              {merged.qr_url ? <img src={merged.qr_url} alt="QR" style={{ width: 72, height: 72, borderRadius: 8 }} /> : (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`} alt="QR" style={{ width: 72, height: 72, borderRadius: 8 }} />
              )}
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                Download kit<br />
                <a href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData)}`} download style={{ color: "var(--accent)" }}>Download</a>
              </div>
            </div>
          </div>

          {showFooter ? (
            <div className="footer-ctas" style={{ marginTop: 18 }}>
              <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="sponsor-btn" onClick={() => router.push("/onboarding/content-creator")}>Use this template</button>
            </div>
          ) : null}
        </main>
      </div>

      {/* Lightbox with navigation */}
      {lightboxIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => closeLightbox()}>
          <button className="close" onClick={(e) => { e.stopPropagation(); closeLightbox(); }} aria-label="Close">Close</button>

          <button
            className="nav prev"
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            aria-label="Previous"
            style={{ left: 20 }}
          >
            ‹
          </button>

          <img
            src={lightboxImages[lightboxIndex]}
            alt={`image ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="nav next"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            aria-label="Next"
            style={{ right: 20 }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}