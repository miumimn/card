"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DJData = {
  name?: string;
  title?: string;
  about?: string;
  genres?: string | string[];
  heroImage?: string | string[];
  avatar?: string | string[];
  mixes?: Array<{ title?: string; meta?: string; image?: string; link?: string }>;
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

  // merge extra_fields into top-level for convenience
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
      if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }

  const brand = asString(merged.name) || (showFooter ? "Nova Lane" : "");
  const subtitle = asString(merged.title) || (showFooter ? "DJ & Producer" : "");
  const about = asString(merged.about || merged.extra_fields?.about);
  const genres = asArray(merged.genres);
  const heroImage = asString(merged.heroImage ?? merged.extra_fields?.heroImage);
  const avatar = asString(merged.avatar ?? merged.extra_fields?.avatar);

  // mixes normalized (include link)
  const mixesRaw = merged.mixes ?? merged.extra_fields?.mixes ?? [];
  const mixes = Array.isArray(mixesRaw)
    ? mixesRaw.map((m: any) => ({
        title: asString(m?.title || m?.name),
        meta: asString(m?.meta || m?.subtitle),
        image: asString(m?.image),
        link: asString(m?.link || m?.url),
      }))
    : [];

  // gigs normalized
  const gigsRaw = merged.gigs ?? merged.extra_fields?.gigs ?? [];
  const gigs = Array.isArray(gigsRaw)
    ? gigsRaw.map((g: any) => ({
        date: asString(g?.date),
        venue: asString(g?.venue || g?.place),
        meta: asString(g?.meta),
        url: asString(g?.url),
      }))
    : [];

  const email = asString(merged.email) || (showFooter ? "bookings@novalane.com" : "");
  const phone = asString(merged.phone) || "";
  // Agent: DO NOT auto-complete agent in profile previews; only show fallback when showFooter === true
  const agent = asString(merged.agent) || (showFooter ? "Lumen Talent" : "");
  const contactCards = (merged.contact_cards && Array.isArray(merged.contact_cards))
    ? merged.contact_cards.map(String)
    : (merged.extra_fields?.contact_cards && Array.isArray(merged.extra_fields.contact_cards) ? merged.extra_fields.contact_cards.map(String) : []);

  // socials (show only when user provided)
  const instagram = asString(merged.instagram ?? merged.extra_fields?.instagram ?? "");
  const tiktok = asString(merged.tiktok ?? merged.extra_fields?.tiktok ?? "");
  const twitter = asString(merged.twitter ?? merged.extra_fields?.twitter ?? "");
  const facebook = asString(merged.facebook ?? merged.extra_fields?.facebook ?? "");
  const soundcloud = asString(merged.soundcloud ?? merged.extra_fields?.soundcloud ?? "");

  // qr data (SSR-safe)
  const qrData = asString(merged.profile_url) || clientHref || "";

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  // helper to render social link only when present
  const SocialLink = ({ href, label }: { href: string; label: string }) => {
    if (!href) return null;
    const url = href.startsWith("http") ? href : (href.startsWith("@") ? `https://instagram.com/${href.replace(/^@/, "")}` : href);
    return (
      <a href={url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-2)", fontWeight: 800 }}>
        {label}
      </a>
    );
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
.dj-title { font-weight:900; font-size:20px; margin:0; }
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
.mix-thumb { width:92px; height:64px; border-radius:8px; background-size:cover; background-position:center; flex:0 0 92px; }
.play-btn { padding:8px 10px; border-radius:10px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); color:#06101a; font-weight:800; border:none; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }

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
                <h1 className="dj-title">{brand} <span style={{ fontWeight: 600, fontSize: 14, marginLeft: 6 }}>{subtitle}</span></h1>
                {subtitle ? <p className="dj-sub">{subtitle}</p> : null}
                <div style={{ marginTop: 8 }}>
                  <div className="cta-row">
                    {showFooter ? (
                      <button className="btn btn-primary" onClick={() => router.push("/onboarding/dj")}>Use this template</button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => (window.location.href = merged.profile_url || clientHref)}>Listen / Book</button>
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
                  <button aria-label={`Open mix ${m.title}`} onClick={() => openLightbox(m.image)} style={{ padding: 0, border: "none", background: "transparent" }}>
                    <div className="mix-thumb" style={{ backgroundImage: m.image ? `url('${m.image}')` : "none" }} aria-hidden />
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
                    <div className="mix-thumb" style={{ backgroundImage: "url('https://picsum.photos/id/1055/800/400')" }} aria-hidden />
                    <div style={{ flex: 1 }}>
                      <strong>Afterlight — Live Mix</strong>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>60 min • 2025</div>
                    </div>
                    <button className="play-btn" aria-label="Play mix">Play</button>
                  </div>
                  <div className="mix">
                    <div className="mix-thumb" style={{ backgroundImage: "url('https://picsum.photos/id/1058/800/400')" }} aria-hidden />
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
                <SocialLink href={instagram} label="Instagram" />
                <SocialLink href={tiktok} label="TikTok" />
                <SocialLink href={twitter} label="Twitter" />
                <SocialLink href={facebook} label="Facebook" />
                <SocialLink href={soundcloud} label="SoundCloud" />
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