"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type VideographerData = {
  name?: string;
  tagline?: string;
  about?: string;
  avatar?: string | string[];
  showreel?: string | string[]; // primary showreel (youtube/vimeo) urls
  portfolio_videos?: string[] | string;
  portfolio_images?: string[] | string;
  services?: string[] | string;
  email?: string;
  phone?: string;
  booking_contact?: string;
  profile_url?: string;
  extra_fields?: any;
};

function parseList(val: any): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "object") {
    try { return Object.values(val).map(String).filter(Boolean); } catch {}
    return [];
  }
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

function isValidUrl(v?: string) {
  if (!v) return false;
  try {
    const s = String(v).trim();
    if (!s) return false;
    if (s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return false;
    return /^https?:\/\//i.test(s);
  } catch { return false; }
}

export default function VideographerPreview({ data, showFooter = true }: { data?: VideographerData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState<"showreel" | "portfolio" | "services" | "contact">("showreel");
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(typeof window !== "undefined" ? window.location.href || "" : ""); } catch { setClientHref(""); }
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
    return out as VideographerData;
  }, [data]);

  const name = merged.name ?? (showFooter ? "ReelWorks Films" : "");
  const tagline = merged.tagline ?? (showFooter ? "Videographer & Filmmaker — Commercials • Weddings • Docs" : "");
  const about = merged.about ?? "";
  const avatar = Array.isArray(merged.avatar) ? merged.avatar[0] : (merged.avatar ?? "");
  const showreelCandidates = parseList(merged.showreel ?? merged.extra_fields?.showreel);
  const showreel = showreelCandidates.find(isValidUrl) ?? ""; // first valid url
  const portfolioVideos = parseList(merged.portfolio_videos ?? merged.extra_fields?.portfolio_videos);
  const portfolioVideosFiltered = portfolioVideos.filter(isValidUrl);
  const portfolioImages = parseList(merged.portfolio_images ?? merged.extra_fields?.portfolio_images).filter(isValidUrl);
  const services = parseList(merged.services ?? merged.extra_fields?.services);
  const email = merged.email ?? "";
  const phone = merged.phone ?? "";
  const bookingRaw = (merged.booking_contact ?? merged.profile_url ?? "").toString().trim();

  const isPhoneLike = (v: string) => {
    if (!v) return false;
    if (v.startsWith("tel:")) return true;
    const cleaned = v.replace(/[()\s.-]/g, "");
    return /^\+?\d{6,}$/.test(cleaned);
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

  // helper to render iframe only for safe urls (YouTube/Vimeo)
  const videoIframe = (url: string, title?: string) => {
    if (!isValidUrl(url)) return null;
    // If it's a YouTube short link or youtube watch, convert to embed
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        // convert watch?v= to embed
        if (u.pathname === "/watch" && u.searchParams.get("v")) {
          const id = u.searchParams.get("v");
          return <iframe src={`https://www.youtube.com/embed/${id}`} title={title || id || url} frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
        }
        // maybe /embed already or /shorts - try to use pathname
        if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
          return <iframe src={url} title={title || url} frameBorder={0} allowFullScreen />;
        }
      }
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        return <iframe src={`https://www.youtube.com/embed/${id}`} title={title || id || url} frameBorder={0} allowFullScreen />;
      }
      if (u.hostname.includes("vimeo.com")) {
        // if it's a vimeo share link, convert to player url
        const pathParts = u.pathname.split("/").filter(Boolean);
        const id = pathParts[pathParts.length - 1];
        return <iframe src={`https://player.vimeo.com/video/${id}`} title={title || id || url} frameBorder={0} allowFullScreen />;
      }
    } catch {
      // fall back to using url directly in iframe (may fail)
      return <iframe src={url} title={title || url} frameBorder={0} allowFullScreen />;
    }
    // If not recognizable, embed directly (may be blocked)
    return <iframe src={url} title={title || url} frameBorder={0} allowFullScreen />;
  };

  const qrData = (() => {
    const p = (merged.profile_url ?? "").toString().trim();
    if (p && /^https?:\/\//i.test(p)) return p;
    const ch = clientHref ?? "";
    if (!ch) return "";
    if (ch.includes("/null") || ch.endsWith("/null")) return "";
    return ch;
  })();

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
    :root{ --vid-bg:#07080b; --vid-accent:#ffd166; --vid-muted:#9aa4b2; --vid-text:#fff }
    .vid-wrap{ max-width:980px; margin:16px auto; padding:16px; font-family:Inter,system-ui,Arial; color:var(--vid-text); background:var(--vid-bg); min-height:100vh }
    .hero{ border-radius:12px; overflow:hidden; background:#000; padding:12px; box-shadow:0 16px 40px rgba(0,0,0,0.6) }
    .reel{ width:100%; height:220px; background:#000; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center; }
    .meta{ display:flex; gap:12px; align-items:center; margin-top:12px }
    .avatar{ width:88px; height:88px; border-radius:12px; background-size:cover; background-position:center; }
    .name{ font-weight:900; font-size:20px; margin:0; color:var(--vid-accent) }
    .role{ color:var(--vid-muted); margin-top:6px; font-weight:700 }
    .tabs{ display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
    .tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(255,255,255,0.04); color:var(--vid-muted); font-weight:700; cursor:pointer }
    .tab.active{ background:linear-gradient(90deg,var(--vid-accent), rgba(255,209,102,0.12)); color:#061013; border:none; box-shadow:0 10px 28px rgba(255,209,102,0.06); }
    .panel{ display:none; margin-top:12px; color:var(--vid-muted) }
    .panel.active{ display:block }
    .videos{ display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
    .video-item{ background:#0b0b0d; border-radius:8px; overflow:hidden; padding:8px; }
    .video-item iframe{ width:100%; height:150px; border:0; display:block; }
    .services{ display:flex; gap:8px; margin-top:12px; flex-wrap:wrap }
    .service{ background:#0b0b0d; padding:10px 12px; border-radius:10px; font-weight:800; }
    .cta-row{ margin-top:12px; display:flex; gap:12px; align-items:center; flex-wrap:wrap }
    .primary-btn{ padding:10px 14px; border-radius:12px; background:linear-gradient(90deg,#ffd39f,var(--vid-accent)); color:#061013; font-weight:900; text-decoration:none }
      ` }} />

      <div className="vid-wrap" role="main">
        <header className="hero" aria-label="Videographer hero">
          <div className="reel" aria-label="Showreel placeholder">
            {showreel ? videoIframe(showreel, "Showreel") : (
              // if user hasn't provided a showreel, show nothing
              <div style={{ color: "var(--vid-muted)" }}>No showreel provided</div>
            )}
          </div>

          <div className="meta">
            <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
            <div>
              <h1 className="name">{name}</h1>
              <div className="role">{tagline}</div>
            </div>
          </div>
        </header>

        <nav className="tabs" role="tablist" aria-label="Videographer tabs" style={{ marginTop: 12 }}>
          <button className={`tab ${active === "showreel" ? "active" : ""}`} onClick={() => setActive("showreel")}>Showreel</button>
          <button className={`tab ${active === "portfolio" ? "active" : ""}`} onClick={() => setActive("portfolio")}>Portfolio</button>
          <button className={`tab ${active === "services" ? "active" : ""}`} onClick={() => setActive("services")}>Services</button>
          <button className={`tab ${active === "contact" ? "active" : ""}`} onClick={() => setActive("contact")}>Contact</button>
        </nav>

        <section className="panels">
          <article id="showreel" className={`panel ${active === "showreel" ? "active" : ""}`} role="tabpanel">
            <div className="videos" aria-live="polite">
              {showreel ? (
                <div className="video-item">{videoIframe(showreel, "Showreel")}</div>
              ) : null}
              {portfolioVideosFiltered.length ? portfolioVideosFiltered.map((v, i) => (
                <div className="video-item" key={i}>{videoIframe(v, `Portfolio video ${i + 1}`)}</div>
              )) : null}
            </div>
          </article>

          <article id="portfolio" className={`panel ${active === "portfolio" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Selected Work</h3>
            <div className="videos">
              {portfolioVideosFiltered.length ? portfolioVideosFiltered.map((v, i) => (
                <div className="video-item" key={i}>{videoIframe(v, `Portfolio ${i + 1}`)}</div>
              )) : null}
              {portfolioImages.length ? portfolioImages.map((img, i) => (
                isValidUrl(img) ? <div className="video-item" key={`img-${i}`}><img src={img} alt={`portfolio ${i}`} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} /></div> : null
              )) : null}
              {(!portfolioVideosFiltered.length && !portfolioImages.length) ? (
                // show nothing if user didn't add any portfolio items
                null
              ) : null}
            </div>
          </article>

          <article id="services" className={`panel ${active === "services" ? "active" : ""}`} role="tabpanel">
            <div className="services">
              {services.length ? services.map((s, i) => <div className="service" key={i}>{s}</div>) : (showFooter ? [<div className="service" key="s1">Commercial Films</div>, <div className="service" key="s2">Event Coverage</div>] : null)}
            </div>
          </article>

          <article id="contact" className={`panel ${active === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
            <p style={{ margin: 0 }}>Bookings: {email ? <a href={`mailto:${email}`}>{email}</a> : "—"}</p>
            <div className="cta-row">
              {bookingHref ? <a className="primary-btn" href={bookingHref}>Request Quote</a> : null}
              <a className="primary-btn" href={qrData ? `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData)}` : "#"} style={{ background: "#fff", color: "var(--vid-accent)", border: "1px solid rgba(255,255,255,0.04)" }}>Download Kit</a>
            </div>
          </article>
        </section>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="tab" onClick={() => router.push("/preview")}>Back</button>
          {showFooter ? <button className="primary-btn" onClick={() => router.push("/onboarding/videographer")}>Use this template</button> : null}
        </div>
      </div>

      {/** lightbox for images/videos */}
      {/*
        Note: For security and UX, the lightbox only shows user-supplied images
        (we don't auto-open remote video embeds in an overlay in this implementation).
      */}
    </>
  );
}