"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type MusicianData = {
  name?: string;
  role?: string;
  about?: string;
  tracks?: { title?: string; duration?: string; released?: string; url?: string }[] | string[] | string;
  track_list?: string[] | string;
  songs?: string[] | string;
  gigs?: string[] | string;
  upcoming_gigs?: string[] | string; // alias used by merged.upcoming_gigs
  press?: string[] | string;
  media?: string[] | string;         // alias used by merged.media
  portfolio?: string[] | string;
  gallery?: string[] | string;       // alias used by merged.gallery
  images?: string[] | string;        // alias used by merged.images
  avatar?: string | string[];
  avatar_url?: string;               // alias used by merged.avatar_url
  profileImage?: string | string[];  // alias used by merged.profileImage
  profile_image?: string | string[]; // alias used by merged.profile_image
  heroImage?: string | string[];
  hero_image?: string | string[];    // alias used by merged.hero_image
  banner?: string | string[];        // alias used by merged.banner
  email?: string;
  phone?: string;
  spotify?: string;
  apple_music?: string;
  audiomack?: string;
  soundcloud?: string;
  bandcamp?: string;
  instagram?: string;
  youtube?: string;
  booking_link?: string;
  profile_url?: string;
  extra_fields?: any;
};

export default function MusicianPreview({ data, showFooter = true }: { data?: MusicianData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"music" | "gigs" | "bio" | "press" | "contact">("music");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");
  const [showDebug, setShowDebug] = useState<boolean>(false);

  useEffect(() => {
    try { setClientHref(typeof window !== "undefined" ? window.location.href || "" : ""); } catch { setClientHref(""); }
    try {
      // Only show debug panel if URL has debug=1
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      setShowDebug(params.get("debug") === "1");
    } catch {
      setShowDebug(false);
    }
  }, []);

  const parseList = (val: any): string[] => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map((p) => p.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  const parseTracks = (val: any): { title?: string; duration?: string; released?: string; url?: string }[] => {
    if (!val) return [];
    if (Array.isArray(val) && val.length && typeof val[0] === "object") return val as any;
    if (Array.isArray(val)) return (val as string[]).map((t) => ({ title: String(t) }));
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => (typeof p === "string" ? { title: p } : p));
        }
      } catch {}
      const lines = val.split("\n").map((l) => l.trim()).filter(Boolean);
      return lines.map((l) => {
        const parts = l.split("—").map((p) => p.trim());
        return { title: parts[0], duration: parts[1], released: parts[2] };
      });
    }
    return [];
  };

  const parseImageField = (v: any) => parseList(v);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
      } catch {}
    }
    return out as MusicianData;
  }, [data]);

  const name = merged.name ? String(merged.name) : (showFooter ? "Nova Lane" : "");
  const role = merged.role ? String(merged.role) : (showFooter ? "Singer • Songwriter — Indie / Alternative" : "");
  const about = merged.about ? String(merged.about) : (showFooter ? "Writes intimate songs blending synth textures with acoustic storytelling." : "");

  // support alternate keys
  const tracks = parseTracks(merged.tracks ?? merged.track_list ?? merged.songs);
  const gigs = parseList(merged.gigs ?? merged.upcoming_gigs);
  const press = parseList(merged.press ?? merged.media);
  const portfolioRaw = parseImageField(merged.portfolio ?? merged.gallery ?? merged.images);

  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage ?? merged.profile_image);
  const heroCandidates = parseImageField(merged.heroImage ?? merged.hero_image ?? merged.banner);

  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  const portfolio = useMemo(() => {
    const imgs = portfolioRaw.slice(0, 12).map((u) => String(u));
    if (imgs.length) return imgs;
    if (showFooter) {
      return [
        "https://picsum.photos/seed/m1/800/600",
        "https://picsum.photos/seed/m2/800/600",
        "https://picsum.photos/seed/m3/800/600",
      ];
    }
    return [];
  }, [portfolioRaw, showFooter]);

  if (showFooter) {
    if (!avatar) avatar = "https://picsum.photos/seed/musician-avatar/400/400";
    if (!heroImage) heroImage = "https://picsum.photos/seed/musician-hero/1400/700";
    if (!tracks.length) {
      tracks.push({ title: "Afterlight", duration: "3:42", released: "2025" }, { title: "Neon Days", duration: "4:10", released: "2024" });
    }
    if (!gigs.length) gigs.push("Nov 20 — The Echo, LA • 9pm", "Dec 12 — The Loft, NYC • 8pm");
    if (!press.length) press.push("Featured in Rolling Sound and Indie Next");
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const spotifyRaw = merged.spotify ?? merged.extra_fields?.spotify ?? "";
  const spotify = Array.isArray(spotifyRaw) ? String(spotifyRaw[0]) : String(spotifyRaw ?? "");
  const appleMusicRaw = merged.apple_music ?? merged.extra_fields?.apple_music ?? "";
  const apple_music = Array.isArray(appleMusicRaw) ? String(appleMusicRaw[0]) : String(appleMusicRaw ?? "");
  const audiomackRaw = merged.audiomack ?? merged.extra_fields?.audiomack ?? "";
  const audiomack = Array.isArray(audiomackRaw) ? String(audiomackRaw[0]) : String(audiomackRaw ?? "");
  const soundcloudRaw = merged.soundcloud ?? merged.extra_fields?.soundcloud ?? "";
  const soundcloud = Array.isArray(soundcloudRaw) ? String(soundcloudRaw[0]) : String(soundcloudRaw ?? "");
  const bandcampRaw = merged.bandcamp ?? merged.extra_fields?.bandcamp ?? "";
  const bandcamp = Array.isArray(bandcampRaw) ? String(bandcampRaw[0]) : String(bandcampRaw ?? "");
  const instagramRaw = merged.instagram ?? merged.extra_fields?.instagram ?? "";
  const instagram = Array.isArray(instagramRaw) ? String(instagramRaw[0]) : String(instagramRaw ?? "");
  const youtubeRaw = merged.youtube ?? merged.extra_fields?.youtube ?? "";
  const youtube = Array.isArray(youtubeRaw) ? String(youtubeRaw[0]) : String(youtubeRaw ?? "");
  const booking = merged.booking_link ? String(merged.booking_link) : "";
  const profileUrl = merged.profile_url ? String(merged.profile_url) : "";

  function buildHref(value: string, provider: string) {
    if (!value) return "";
    if (/^https?:\/\//.test(value)) return value;
    switch (provider) {
      case "spotify": return `https://open.spotify.com/${value}`;
      case "apple": return `https://music.apple.com/${value}`;
      case "audiomack": return `https://audiomack.com/${value}`;
      case "soundcloud": return `https://soundcloud.com/${value}`;
      case "bandcamp": return value.includes(".") ? `https://${value}` : `https://${value}.bandcamp.com`;
      case "instagram": return `https://instagram.com/${value.replace(/^@/, "")}`;
      case "youtube": return `https://youtube.com/${value}`;
      default: return value;
    }
  }

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (booking || clientHref);

  useEffect(() => {
    if (tracks.length) setTab("music");
    else if (portfolio.length) setTab("music");
    else if (gigs.length) setTab("gigs");
    else setTab("bio");
  }, [data]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --mu-bg:#0b0a10;
  --mu-accent:#ff4d6d;
  --mu-muted:#9a9ab0;
  --mu-text:#fff;
}
.musician-wrap{ min-height:100vh; font-family:Inter,system-ui,Arial; color:var(--mu-text); background:linear-gradient(180deg,#05040a,#0b0a10); padding:18px; max-width:980px; margin:0 auto; }
.hero { border-radius:14px; overflow:hidden; background-size:cover; background-position:center; min-height:40vw; display:flex; align-items:flex-end; padding:18px; box-shadow:0 18px 40px rgba(2,6,23,0.6); }
.meta { display:flex; gap:12px; align-items:center; z-index:2; }
.avatar { width:92px; height:92px; border-radius:999px; border:4px solid rgba(255,255,255,0.9); background-size:cover; background-position:center; }
.name{ margin:0; font-weight:900; font-size:20px; color:var(--mu-accent); }
.role{ margin:4px 0 0; color:var(--mu-muted); font-weight:700; font-size:13px; }
.tab{ padding:8px 12px; margin-right:8px; border-radius:8px; background:transparent; color:var(--mu-muted); border:1px solid rgba(255,255,255,0.02); cursor:pointer; }
.tab.active{ background:linear-gradient(90deg,var(--mu-accent), rgba(255,77,109,0.08)); color:#fff; border:none; }
.panel{ display:none; margin-top:12px; color:var(--mu-muted); }
.panel.active{ display:block; }
.actions-row{ display:flex; gap:10px; justify-content:flex-end; margin-top:18px; }
.back-btn, .use-template { padding:8px 12px; border-radius:8px; font-weight:700; }
.use-template { background: linear-gradient(90deg,var(--mu-accent), #ff9fb6); color: #fff; border: none; }
.debug-json { background: #fff; color: #111; padding: 12px; border-radius: 8px; margin-top: 16px; max-height: 320px; overflow:auto; }
` }} />

      <div className="musician-wrap">
        <section className="hero" aria-label="Musician hero" style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(11,10,16,0.5), rgba(0,0,0,0.7)), url('${heroImage}')` } : undefined}>
          <div className="meta">
            <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
            <div>
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>

              <nav className="social-row" aria-label="social links">
                {spotify ? (<a href={buildHref(spotify, "spotify")} target="_blank" rel="noreferrer" style={{ display: "inline-flex", marginRight: 8 }} aria-label="Spotify">Spotify</a>) : null}
                {apple_music ? (<a href={buildHref(apple_music, "apple")} target="_blank" rel="noreferrer" style={{ display: "inline-flex", marginRight: 8 }} aria-label="Apple Music">Apple</a>) : null}
                {soundcloud ? (<a href={buildHref(soundcloud, "soundcloud")} target="_blank" rel="noreferrer" style={{ display: "inline-flex", marginRight: 8 }} aria-label="SoundCloud">SoundCloud</a>) : null}
              </nav>
            </div>
          </div>
        </section>

        <nav className="tabs" role="tablist" style={{ marginTop: 12 }}>
          <button className={`tab ${tab === "music" ? "active" : ""}`} onClick={() => setTab("music")}>Music</button>
          <button className={`tab ${tab === "gigs" ? "active" : ""}`} onClick={() => setTab("gigs")}>Gigs</button>
          <button className={`tab ${tab === "bio" ? "active" : ""}`} onClick={() => setTab("bio")}>Bio</button>
          <button className={`tab ${tab === "press" ? "active" : ""}`} onClick={() => setTab("press")}>Press</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
        </nav>

        <section className="panels">
          <article id="music" className={`panel ${tab === "music" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Latest Tracks</h3>
            <div>
              {tracks.map((t, i) => (
                <div key={i} className="track" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{t.title}{t.duration ? ` — ${t.duration}` : ""}</strong>
                    {t.released ? <div style={{ color: "var(--mu-muted)", fontSize: 13 }}>{t.released}</div> : null}
                  </div>
                  <a className="play-btn" href={t.url || "#"} aria-label={`Play ${t.title}`}>Play</a>
                </div>
              ))}
            </div>
          </article>

          <article id="gigs" className={`panel ${tab === "gigs" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: 0, fontSize: 18 }}>Upcoming Gigs</h3>
            <div style={{ color: "var(--mu-muted)" }}>
              {gigs.map((g, i) => <div key={i} style={{ marginBottom: 8 }}><strong>{g}</strong></div>)}
            </div>
          </article>

          <article id="bio" className={`panel ${tab === "bio" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Bio</h3>
            <p style={{ margin: 0, color: "var(--mu-muted)" }}>{about}</p>
          </article>

          <article id="press" className={`panel ${tab === "press" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Press</h3>
            <p style={{ color: "var(--mu-muted)" }}>{press.join(" • ")}</p>
          </article>

          <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
            <p style={{ color: "var(--mu-muted)" }}>Bookings: {email ? <a href={`mailto:${email}`}>{email}</a> : "—"}</p>
            {phone ? <p style={{ color: "var(--mu-muted)" }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></p> : null}
            <div style={{ marginTop: 12 }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR" style={{ width: 84, height: 84, borderRadius: 8 }} />
            </div>
          </article>
        </section>

        <div className="actions-row" style={{ marginTop: 18 }}>
          {/* Back always shown in template preview */}
          <button className="back-btn" onClick={() => router.push("/templates-preview")}>Back</button>

          {/* Use this template only when showFooter is true */}
          {showFooter ? <button className="use-template" onClick={() => router.push("/onboarding/musician")}>Use this template</button> : null}
        </div>

        {/* DEBUG: show full raw "data" object only when debug=1 in URL */}
        {showDebug && !showFooter && data ? (
          <div className="debug-json" role="region" aria-label="Raw fetched onboarding data">
            <strong style={{ display: "block", marginBottom: 8 }}>Debug: fetched data (from profile preview fetcher)</strong>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
          </div>
        ) : null}

        {portfolio.length ? (
          <section style={{ marginTop: 18 }}>
            <h3 style={{ margin: "0 0 8px" }}>Gallery</h3>
            <div className="gallery" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8 }}>
              {portfolio.map((src, i) => <img key={i} src={src} alt={`look ${i+1}`} style={{ width: "100%", borderRadius: 8 }} onClick={() => openLightbox(src)} />)}
            </div>
          </section>
        ) : null}

        {lightbox ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)", zIndex: 1400 }}>
            <img src={lightbox} alt="full" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}