"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SvgIcon from "@/components/Icon";

type DJData = {
  name?: string;
  title?: string;
  about?: string;
  genres?: string | string[];
  heroImage?: string | string[];
  avatar?: string | string[];
  mixes?: Array<{ title?: string; meta?: string; image?: string; link?: string }>;
  // legacy / other onboarding fields:
  mix_links?: string | string[];
  mixesImages?: string[] | string;
  gigs?: Array<{ date?: string; venue?: string; meta?: string; url?: string }>;
  email?: string;
  phone?: string;
  agent?: string;
  contact_cards?: string[]; // Rider, Press Kit, etc.
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  facebook?: string;
  soundcloud?: string;
  profile_url?: string;
  listen_link?: string;
  extra_fields?: any;
};

export default function DJPreview({ data, showFooter = true }: { data?: DJData; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "mixes" | "gigs" | "contact">("about");
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // merge extra_fields into top-level for convenience and promote mix_1 fields if present
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
      } catch {
        // ignore parse errors
      }
    }

    // Promote structured mix_* fields (from new onboarding) into out.mixes if mixes not present
    const hasMixGroup = out.mix_1_title || out.mix_2_title || out.mix_3_title;
    if ((!out.mixes || (Array.isArray(out.mixes) && out.mixes.length === 0)) && hasMixGroup) {
      const promoted: any[] = [];
      for (let i = 1; i <= 3; i++) {
        const t = out[`mix_${i}_title`];
        if (!t) continue;
        let img = out[`mix_${i}_image`];
        if (Array.isArray(img)) img = img[0];
        promoted.push({
          title: t,
          meta: out[`mix_${i}_meta`] || "",
          image: img || undefined,
          link: out[`mix_${i}_link`] || undefined,
        });
      }
      if (promoted.length) out.mixes = promoted;
    }

    return out as DJData;
  }, [data]);

  // normalization helpers
  function asString(val: any): string {
    if (!val && val !== "") return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length) return String(val[0]).trim();
    return String(val ?? "");
  }
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

  const brand = asString(merged.name) || (showFooter ? "Nova Lane" : "");
  // Show exactly what the user provided for title; do NOT default to "DJ & Producer"
  const subtitle = asString(merged.title ?? merged.extra_fields?.title ?? "");
  const about = asString(merged.about || merged.extra_fields?.about);
  const genres = asArray(merged.genres);
  const heroImage = asString(merged.heroImage ?? merged.extra_fields?.heroImage);
  const avatar = asString(merged.avatar ?? merged.extra_fields?.avatar);

  // mixes: support structured mixes array (preferred) and fallbacks (legacy fields)
  const mixesStructuredRaw = merged.mixes ?? merged.extra_fields?.mixes;
  const mixesTextLines = (() => {
    if (typeof mixesStructuredRaw === "string") return mixesStructuredRaw.split("\n").map((l: string) => l.trim()).filter(Boolean);
    if (Array.isArray(mixesStructuredRaw) && mixesStructuredRaw.every((x) => typeof x === "string")) return mixesStructuredRaw.map(String).map((l) => l.trim()).filter(Boolean);
    return [];
  })();

  const mixLinks = asArray(merged.mix_links ?? merged.extra_fields?.mix_links ?? []);
  const mixesImages = asArray(merged.mixesImages ?? merged.extra_fields?.mixesImages ?? merged.extra_fields?.mix_images ?? []);

  const mixes: Array<{ title: string; meta: string; image?: string; link?: string }> = useMemo(() => {
    const out: Array<{ title: string; meta: string; image?: string; link?: string }> = [];

    // 1) structured array of objects
    if (Array.isArray(mixesStructuredRaw) && mixesStructuredRaw.length && mixesStructuredRaw.every((m: any) => typeof m === "object")) {
      for (let i = 0; i < mixesStructuredRaw.length && out.length < 3; i++) {
        const m = mixesStructuredRaw[i] || {};
        out.push({
          title: asString(m.title ?? m.name) || (showFooter ? `Mix ${i + 1}` : ""),
          meta: asString(m.meta ?? m.subtitle) || "",
          image: asString(m.image ?? m.cover) || mixesImages[i] || undefined,
          link: asString(m.link ?? m.url) || mixLinks[i] || undefined,
        });
      }
      return out;
    }

    // 2) parse text lines "Title | meta | imageRef"
    if (mixesTextLines.length) {
      for (let i = 0; i < mixesTextLines.length && out.length < 3; i++) {
        const line = mixesTextLines[i];
        const parts = line.split("|").map((p) => p.trim());
        const title = parts[0] || (showFooter ? `Mix ${i + 1}` : "");
        const meta = parts[1] || "";
        const inlineImage = parts[2] || "";
        const image = inlineImage || mixesImages[i] || undefined;
        const link = mixLinks[i] || undefined;
        out.push({ title, meta, image, link });
      }
      return out;
    }

    // 3) array of string lines
    if (Array.isArray(mixesStructuredRaw) && mixesStructuredRaw.length && mixesStructuredRaw.every((x) => typeof x === "string")) {
      for (let i = 0; i < mixesStructuredRaw.length && out.length < 3; i++) {
        const line = String(mixesStructuredRaw[i]).trim();
        const parts = line.split("|").map((p) => p.trim());
        const title = parts[0] || (showFooter ? `Mix ${i + 1}` : "");
        const meta = parts[1] || "";
        const image = parts[2] || mixesImages[i] || undefined;
        const link = mixLinks[i] || undefined;
        out.push({ title, meta, image, link });
      }
      return out;
    }

    // 4) uploaded mixes images fallback
    if (mixesImages.length) {
      for (let i = 0; i < mixesImages.length && out.length < 3; i++) {
        out.push({
          title: showFooter ? `Mix ${i + 1}` : "",
          meta: "",
          image: mixesImages[i],
          link: mixLinks[i] || undefined,
        });
      }
      return out;
    }

    // 5) none provided -> return empty (preview shows demo mixes when showFooter true)
    return out;
  }, [mixesStructuredRaw, mixesTextLines.join("|"), mixLinks.join("|"), mixesImages.join("|"), showFooter]);

  // gigs normalized
  const gigsRaw = merged.gigs ?? merged.extra_fields?.gigs ?? [];
  const gigs = Array.isArray(gigsRaw)
    ? gigsRaw.map((g: any) => ({
        date: asString(g?.date),
        venue: asString(g?.venue || g?.place),
        meta: asString(g?.meta),
        url: asString(g?.url),
      }))
    : (typeof gigsRaw === "string" ? asArray(gigsRaw).map((line) => {
        const parts = line.split("|").map(p => p.trim());
        return { date: parts[0] || "", venue: parts[1] || "", meta: parts[2] || "", url: parts[3] || "" };
      }) : []);

  const email = asString(merged.email) || (showFooter ? "bookings@novalane.com" : "");
  const phone = asString(merged.phone) || "";
  // Agent: DO NOT auto-complete agent in profile previews; only show fallback when showFooter === true
  const agent = asString(merged.agent) || (showFooter ? "Lumen Talent" : "");
  let contactCards = (merged.contact_cards && Array.isArray(merged.contact_cards))
    ? merged.contact_cards.map(String)
    : (merged.extra_fields?.contact_cards && Array.isArray(merged.extra_fields.contact_cards) ? merged.extra_fields.contact_cards.map(String) : []);

  // Filter out unwanted contact cards like "kits" and "img" (case-insensitive, trimmed)
  contactCards = contactCards
    .map((c: any) => String(c || "").trim())
    .filter((c: string) => {
      const s = c.toLowerCase();
      return s !== "kits" && s !== "img" && s !== "";
    });

  // socials (show only when user provided)
  const instagram = asString(merged.instagram ?? merged.extra_fields?.instagram ?? "");
  const tiktok = asString(merged.tiktok ?? merged.extra_fields?.tiktok ?? "");
  const twitter = asString(merged.twitter ?? merged.extra_fields?.twitter ?? "");
  const facebook = asString(merged.facebook ?? merged.extra_fields?.facebook ?? "");
  const soundcloud = asString(merged.soundcloud ?? merged.extra_fields?.soundcloud ?? "");

  // Normalize listen_link into a usable href (tel: / https://)
  function computeListenHref(raw: string) {
    if (!raw) return "";
    const s = String(raw).trim();
    // already has scheme
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
    // phone number (basic)
    if (/^\+?[0-9\s().-]{7,}$/.test(s)) return `tel:${s.replace(/\s+/g, "")}`;
    // otherwise assume URL
    return s.startsWith("http") ? s : `https://${s}`;
  }
  const listenHref = computeListenHref(asString(merged.listen_link ?? merged.profile_url ?? ""));

  // qr data (SSR-safe)
  const qrData = asString(merged.profile_url) || clientHref || "";

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  // helper to render social link only when present using repo SVG icons
  const SocialLink = ({ href, iconName, label }: { href: string; iconName: string; label: string }) => {
    if (!href) return null;
    const url = href.startsWith("http")
      ? href
      : (href.startsWith("@") ? `https://instagram.com/${href.replace(/^@/, "")}` : href);
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--accent-2)", fontWeight: 800, textDecoration: "none" }}
      >
        <SvgIcon name={iconName} width={18} height={18} useImg />
        <span style={{ fontSize: 13 }}>{label}</span>
      </a>
    );
  };

  // click handler for Listen/Book CTA to ensure tel/mailto work reliably in preview environments
  const onListenClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!listenHref) return;
    // allow http(s) to act as normal links (opens in new tab if target=_blank)
    if (listenHref.startsWith("http")) return;
    // for tel: and mailto: (or other schemes) force location change so some browsers/platforms open the dialer
    e.preventDefault();
    try {
      window.location.href = listenHref;
    } catch {
      // fallback: no-op
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
/* Scoped styles for DJ preview (mobile-first, full-bleed) */
.dj-page { min-height:100vh; background: var(--bg-soft); color: var(--text); font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

/* Hero full-bleed */
.dj-hero {
  width:100%;
  min-height:40vh;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}
.dj-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.42));
  pointer-events: none;
}
.hero-inner { position: relative; z-index: 2; padding: 20px; display:flex; flex-direction:column; gap:10px; color: #fff; }

/* hero meta */
.dj-brand { display:flex; gap:12px; align-items:center; }
.dj-avatar { width:88px; height:88px; border-radius:999px; background-size:cover; box-shadow:0 12px 30px rgba(0,0,0,0.5); flex:0 0 88px; }
.dj-title { font-weight:900; font-size:20px; margin:0; display:flex; align-items:center; gap:8px; }
.dj-sub { font-weight:700; font-size:13px; color: rgba(255,255,255,0.92); margin:0; }

/* CTA row: stacked on mobile, inline on desktop */
.cta-row { display:flex; gap:10px; margin-top:12px; flex-direction:column; }
.cta-row .btn { padding:12px 14px; border-radius:12px; font-weight:900; border:none; cursor:pointer; }
.btn-primary { background: linear-gradient(90deg, var(--accent), var(--accent-2)); color:#06101a; }
.btn-ghost { background: transparent; border:1px solid rgba(255,255,255,0.12); color:#fff; }

/* Tabs */
.tabs { display:flex; gap:8px; margin-top:16px; flex-wrap:wrap; padding:0 20px; }
.tab { padding:8px 12px; border-radius:999px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.9); border:1px solid rgba(255,255,255,0.04); font-weight:700; cursor:pointer; }
.tab.active { background: linear-gradient(90deg, var(--accent), var(--accent-2)); color:#06101a; border:none; }

/* Content sections full width */
.section { padding:18px 20px; border-top:1px solid var(--surface-elev); }
.section-inner { max-width:1100px; margin:0 auto; }

/* genre chips */
.genre-grid { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
.genre-chip { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,0.04); color: var(--text); font-weight:700; font-size:13px; }

/* Mix cards */
.mix-grid { display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top:12px; }
.mix { background: var(--card); padding:12px; border-radius:12px; border:1px solid var(--surface-elev); display:flex; gap:12px; align-items:center; color:var(--text); }
.mix-thumb-btn { width:92px; height:64px; padding:0; border:0; background:transparent; flex:0 0 92px; display:block; cursor:pointer; border-radius:8px; overflow:hidden; }
.mix-thumb-img { width:100%; height:100%; object-fit:cover; display:block; border-radius:8px; }
/* keep play button style */
.play-btn { padding:8px 10px; border-radius:10px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); color:#06101a; font-weight:800; border:none; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }

/* Lightbox */
.lightbox { position: fixed; inset: 0; z-index: 14000; display:flex; align-items:center; justify-content:center; background: rgba(6,6,6,0.9); padding:20px; }
.lightbox img { max-width:92%; max-height:92%; border-radius:12px; box-shadow:0 30px 80px rgba(0,0,0,0.7); }

/* Gigs list */
.gigs { display:flex; flex-direction:column; gap:10px; margin-top:12px; }
.gig { padding:12px; border-radius:10px; background: var(--card); border:1px solid var(--surface-elev); display:flex; justify-content:space-between; align-items:center; }

/* Contact */
.contact-grid { display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-top:12px; }
.contact-card { padding:12px; border-radius:10px; background: var(--card); border:1px solid var(--surface-elev); color:var(--text); }

/* Responsive: on wide screens show CTAs inline */
@media(min-width:720px) {
  .cta-row { flex-direction:row; justify-content:flex-start; }
  .cta-row .btn { min-width:160px; }
}
` }} />

      <div className="dj-page" role="application" aria-label="DJ / Producer template preview">
        {/* HERO */}
        <header
          className="dj-hero"
          role="banner"
          style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.42)), url('${heroImage}')` } : { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.42)), url('https://picsum.photos/id/1056/1600/900')` }}
        >
          <div className="hero-inner">
            <div className="dj-brand">
              <div className="dj-avatar" aria-hidden="true" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
              <div style={{ flex: 1 }}>
                <h1 className="dj-title">{brand}{subtitle ? <span style={{ fontWeight: 600, fontSize: 14, marginLeft: 6 }}>{subtitle}</span> : null}</h1>
                {subtitle ? <p className="dj-sub">{subtitle}</p> : null}
                <div style={{ marginTop: 8 }}>
                  <div className="cta-row">
                    {showFooter ? (
                      <button className="btn btn-primary" onClick={() => router.push("/onboarding/dj")}>Use this template</button>
                    ) : (
                      // prefer listenHref (listen_link) if present, fallback to profile_url
                      <a
                        className="btn btn-primary"
                        href={listenHref || (merged.profile_url || clientHref)}
                        aria-label="Listen or Book"
                        target={listenHref && listenHref.startsWith("http") ? "_blank" : undefined}
                        rel={listenHref && listenHref.startsWith("http") ? "noreferrer" : undefined}
                        onClick={onListenClick}
                      >
                        Listen / Book
                      </a>
                    )}
                    <a className="btn btn-ghost" href="#mixes" onClick={(e) => { e.preventDefault(); setTab("mixes"); }}>Listen now</a>
                  </div>
                </div>
              </div>
            </div>

            <nav className="tabs" role="tablist" aria-label="DJ tabs">
              <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
              <button className={`tab ${tab === "mixes" ? "active" : ""}`} onClick={() => setTab("mixes")}>Mixes</button>
              <button className={`tab ${tab === "gigs" ? "active" : ""}`} onClick={() => setTab("gigs")}>Gigs</button>
              <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
            </nav>
          </div>
        </header>

        {/* ABOUT */}
        <section className="section" style={{ display: tab === "about" ? "block" : "none" }} aria-labelledby="about-heading">
          <div className="section-inner">
            <h2 id="about-heading" style={{ margin: 0, fontSize: 18 }}>About</h2>
            {about ? (
              <p style={{ marginTop: 8, color: "var(--muted)" }}>{about}</p>
            ) : showFooter ? (
              <p style={{ marginTop: 8, color: "var(--muted)" }}>Nova Lane blends warm synth textures with club-ready percussion. Available for bookings, residencies and collaborations.</p>
            ) : null}

            {/* genres as chips (blocks) */}
            {genres.length > 0 ? (
              <div className="genre-grid" aria-hidden={genres.length === 0 ? "true" : "false"}>
                {genres.map((g, i) => <div key={i} className="genre-chip">{g}</div>)}
              </div>
            ) : null}
          </div>
        </section>

        {/* MIXES */}
        <section id="mixes" className="section" style={{ display: tab === "mixes" ? "block" : "none" }} aria-labelledby="mixes-heading">
          <div className="section-inner">
            <h2 id="mixes-heading" style={{ margin: 0, fontSize: 18 }}>Mixes</h2>

            <div className="mix-grid">
              {mixes.length ? mixes.map((m, i) => (
                <div className="mix" key={i}>
                  {/* Use a button + img for the thumbnail so uploaded covers are reliably clickable/tappable */}
                  <button
                    className="mix-thumb-btn"
                    onClick={() => openLightbox(m.image)}
                    onKeyDown={(e) => { if ((e as any).key === "Enter" || (e as any).key === " ") { e.preventDefault(); openLightbox(m.image); } }}
                    aria-label={m.title ? `Open ${m.title}` : `Open mix ${i+1}`}
                  >
                    {m.image ? <img src={m.image} alt={m.title || `mix-${i+1}`} className="mix-thumb-img" /> : <div style={{ width: '92px', height: '64px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <strong>{m.title || (showFooter ? `Mix ${i + 1}` : "")}</strong>
                    {m.meta ? <div style={{ color: "var(--muted)", fontSize: 13 }}>{m.meta}</div> : null}
                  </div>

                  {/* Play is an anchor when link provided, otherwise a disabled button */}
                  {m.link ? (
                    <a className="play-btn" href={m.link} target="_blank" rel="noreferrer" aria-label="Play mix">Play</a>
                  ) : (
                    <button className="play-btn" aria-label="Play mix" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>Play</button>
                  )}
                </div>
              )) : (showFooter ? (
                <>
                  <div className="mix">
                    <button className="mix-thumb-btn" onClick={() => openLightbox("https://picsum.photos/id/1055/800/400")} aria-label="Open sample mix">
                      <img className="mix-thumb-img" src="https://picsum.photos/id/1055/800/400" alt="Afterlight — Live Mix" />
                    </button>
                    <div style={{ flex: 1 }}>
                      <strong>Afterlight — Live Mix</strong>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>60 min • 2025</div>
                    </div>
                    <button className="play-btn" aria-label="Play mix">Play</button>
                  </div>
                  <div className="mix">
                    <button className="mix-thumb-btn" onClick={() => openLightbox("https://picsum.photos/id/1058/800/400")} aria-label="Open sample mix">
                      <img className="mix-thumb-img" src="https://picsum.photos/id/1058/800/400" alt="Sunrise Set" />
                    </button>
                    <div style={{ flex: 1 }}>
                      <strong>Sunrise Set</strong>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>45 min • DJ set</div>
                    </div>
                    <button className="play-btn" aria-label="Play mix">Play</button>
                  </div>
                </>
              ) : <div style={{ color: "var(--muted)" }}>No mixes uploaded.</div>)}
            </div>
          </div>
        </section>

        {/* GIGS */}
        <section className="section" style={{ display: tab === "gigs" ? "block" : "none" }} aria-labelledby="gigs-heading">
          <div className="section-inner">
            <h2 id="gigs-heading" style={{ margin: 0, fontSize: 18 }}>Upcoming Gigs</h2>
            {gigs.length ? (
              <div className="gigs">
                {gigs.map((g, i) => {
                  const detailsHref = g.url || (phone ? `tel:${phone.replace(/\s+/g, "")}` : "");
                  return (
                    <div className="gig" key={i}>
                      <div>
                        <strong>{g.date} — {g.venue}</strong>
                        {g.meta ? <div style={{ color: "var(--muted)", fontSize: 13 }}>{g.meta}</div> : null}
                      </div>
                      {detailsHref ? <a href={detailsHref} style={{ color: "var(--accent-2)", fontWeight: 800 }}>{g.url ? "Details" : "Call"}</a> : <span style={{ color: "var(--accent-2)", fontWeight: 800 }}>Details</span>}
                    </div>
                  );
                })}
              </div>
            ) : (showFooter ? (
              <div className="gigs">
                <div className="gig">
                  <div>
                    <strong>Nov 20 — The Echo, LA</strong>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>9pm • Tickets</div>
                  </div>
                  <a href="#" style={{ color: "var(--accent-2)", fontWeight: 800 }}>Tickets</a>
                </div>
                <div className="gig">
                  <div>
                    <strong>Dec 12 — The Loft, NYC</strong>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>8pm • Support: K</div>
                  </div>
                  <a href="#" style={{ color: "var(--accent-2)", fontWeight: 800 }}>Details</a>
                </div>
              </div>
            ) : <div style={{ color: "var(--muted)" }}>No gigs scheduled.</div>)}
          </div>
        </section>

        {/* CONTACT */}
        <section className="section" style={{ display: tab === "contact" ? "block" : "none" }} aria-labelledby="contact-heading">
          <div className="section-inner">
            <h2 id="contact-heading" style={{ margin: 0, fontSize: 18 }}>Contact</h2>
            <div style={{ marginTop: 8, color: "var(--muted)" }}>
              {email ? <div>Email: <a href={`mailto:${email}`} style={{ color: "var(--accent-2)" }}>{email}</a></div> : null}
              {phone ? <div style={{ marginTop: 6 }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`} style={{ color: "var(--accent-2)" }}>{phone}</a></div> : null}
              {agent ? <div style={{ marginTop: 8 }}><strong>Agent:</strong> <span style={{ color: "var(--muted)" }}>{agent}</span></div> : null}

              {/* socials + contact cards */}
              <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <SocialLink href={instagram} iconName="instagram" label="Instagram" />
                <SocialLink href={tiktok} iconName="tiktok" label="TikTok" />
                <SocialLink href={twitter} iconName="twitter" label="Twitter" />
                <SocialLink href={facebook} iconName="facebook" label="Facebook" />
                <SocialLink href={soundcloud} iconName="soundcloud" label="SoundCloud" />
              </div>

              {contactCards.length ? (
                <div className="contact-grid" style={{ marginTop: 12 }}>
                  {contactCards.map((c: string, i: number) => <div key={i} className="contact-card">{c}</div>)}
                </div>
              ) : (showFooter ? (
                <div className="contact-grid" style={{ marginTop: 12 }}>
                  <div className="contact-card">Rider & Tech Specs</div>
                  <div className="contact-card">Press Kit</div>
                  <div className="contact-card">Promo Images</div>
                </div>
              ) : null)}
            </div>
          </div>
        </section>

        {/* Footer CTAs (only when showFooter) */}
        {showFooter ? (
          <div style={{ maxWidth: 1100, margin: "18px auto", padding: "0 20px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => router.push("/templates-preview")}>Back</button>
            <button className="btn btn-primary" onClick={() => router.push("/onboarding/dj")}>Use this template</button>
          </div>
        ) : null}

        {/* Lightbox */}
        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxSrc(null)}>
            <img src={lightboxSrc} alt="Full size" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}