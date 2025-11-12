"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type MusicianData = {
  name?: string;
  role?: string;
  about?: string;
  tracks?: { title?: string; duration?: string; released?: string; url?: string }[] | string[] | string;
  gigs?: string[] | string;
  press?: string[] | string;
  portfolio?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
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

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
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

  const tracks = parseTracks(merged.tracks ?? merged.track_list ?? merged.songs);
  const gigs = parseList(merged.gigs ?? merged.upcoming_gigs);
  const press = parseList(merged.press ?? merged.media);
  const portfolioRaw = parseImageField(merged.portfolio ?? merged.gallery ?? merged.images);

  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage);
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

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (booking || clientHref);

  useEffect(() => {
    if (tracks.length) setTab("music");
    else if (portfolio.length) setTab("music");
    else if (gigs.length) setTab("gigs");
    else setTab("bio");
  }, [tracks.length, portfolio.length, gigs.length]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  /* SVG Icons */
  const IconSpotify = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M7.6 10.5c3.2-1.9 8.4-1 10.6 0.2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M6.5 13.3c2.6-1.4 6.5-0.7 8.6 0.2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8 15.2c1.8-0.9 4.6-0.5 6 0.1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
  const IconApple = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M16.365 1.43c0 1.02-.37 2.01-1.02 2.79-.7.84-1.94 1.74-3.11 1.37-.18-.06-.36-.12-.53-.2-.73-.31-1.44-.53-2.21-.42-.41.06-.82.2-1.23.42-.27.14-.55.3-.82.45-.53.29-1.12.59-1.66.97-.51.36-.97.82-1.36 1.35C1.9 12.42 3 17.5 6.07 20.16c1.85 1.55 3.98 2.1 6.32 2.1 1.2 0 2.39-.11 3.56-.31 2.05-.36 3.6-1.25 4.66-2.67-2.62-1.4-3.92-3.9-3.92-6.8 0-1.38.21-2.73.64-4.03.19-.58.43-1.15.7-1.7.11-.25.2-.5.28-.75.18-.58.27-1.15.27-1.74 0-.98-.31-1.9-.93-2.73C17.99 2.21 16.98 1.45 16.36 1.43z" fill="currentColor"/>
    </svg>
  );
  const IconAudiomack = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M12 2c-3 0-5.5 2.2-5.5 5 0 4.5 5.5 11 5.5 11s5.5-6.5 5.5-11c0-2.8-2.5-5-5.5-5z" fill="currentColor"/>
      <circle cx="12" cy="7" r="1.6" fill="#fff"/>
    </svg>
  );
  const IconSoundCloud = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M4 14h1v3H4zM6 13.5h1v4H6zM8 13h1v5H8z" fill="currentColor"/>
      <path d="M10 12c.6 0 1 .4 1 1v4h6.5C19.9 17 21 15.7 21 14.1 21 12 19.3 10.5 17.4 10.5 16.6 10.5 15.8 10.7 15 11 14.3 11.3 12.3 12 10 12z" fill="currentColor"/>
    </svg>
  );
  const IconBandcamp = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d="M2 12l8-8h12v16H2z" fill="currentColor"/>
      <path d="M5 12h6l6 6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  const IconInstagram = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/>
    </svg>
  );
  const IconYouTube = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M10 9v6l5-3z" fill="currentColor"/>
    </svg>
  );

  const iconButtonStyle = (enabled: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 8,
    background: enabled ? "rgba(255,255,255,0.04)" : "transparent",
    color: enabled ? "var(--mu-accent)" : "rgba(255,255,255,0.18)",
    textDecoration: "none",
    border: enabled ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(255,255,255,0.02)",
  });

  const buildHref = (value: string, provider: string) => {
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
  };

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
.social-row{ display:flex; gap:10px; margin-top:10px; align-items:center; }
` }} />

      <div className="musician-wrap">
        <section className="hero" aria-label="Musician hero" style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(11,10,16,0.5), rgba(0,0,0,0.7)), url('${heroImage}')` } : undefined}>
          <div className="meta">
            <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
            <div>
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>

              <nav className="social-row" aria-label="social links">
                {spotify ? (
                  <a href={buildHref(spotify, "spotify")} target="_blank" rel="noreferrer" aria-label="Spotify" style={iconButtonStyle(true)}>
                    <IconSpotify />
                  </a>
                ) : null}

                {apple_music ? (
                  <a href={buildHref(apple_music, "apple")} target="_blank" rel="noreferrer" aria-label="Apple Music" style={iconButtonStyle(true)}>
                    <IconApple />
                  </a>
                ) : null}

                {audiomack ? (
                  <a href={buildHref(audiomack, "audiomack")} target="_blank" rel="noreferrer" aria-label="Audiomack" style={iconButtonStyle(true)}>
                    <IconAudiomack />
                  </a>
                ) : null}

                {soundcloud ? (
                  <a href={buildHref(soundcloud, "soundcloud")} target="_blank" rel="noreferrer" aria-label="SoundCloud" style={iconButtonStyle(true)}>
                    <IconSoundCloud />
                  </a>
                ) : null}

                {bandcamp ? (
                  <a href={buildHref(bandcamp, "bandcamp")} target="_blank" rel="noreferrer" aria-label="Bandcamp" style={iconButtonStyle(true)}>
                    <IconBandcamp />
                  </a>
                ) : null}

                {instagram ? (
                  <a href={buildHref(instagram, "instagram")} target="_blank" rel="noreferrer" aria-label="Instagram" style={iconButtonStyle(true)}>
                    <IconInstagram />
                  </a>
                ) : null}

                {youtube ? (
                  <a href={buildHref(youtube, "youtube")} target="_blank" rel="noreferrer" aria-label="YouTube" style={iconButtonStyle(true)}>
                    <IconYouTube />
                  </a>
                ) : null}
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
                <div key={i} className="track">
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
          <button className="back-btn" onClick={() => router.push("/templates-preview")}>Back</button>
          {showFooter ? <button className="use-template" onClick={() => router.push("/store")}>Use this template</button> : null}
        </div>

        {portfolio.length ? (
          <section style={{ marginTop: 18 }}>
            <h3 style={{ margin: "0 0 8px" }}>Gallery</h3>
            <div className="gallery">
              {portfolio.map((src, i) => <img key={i} src={src} alt={`look ${i+1}`} onClick={() => openLightbox(src)} />)}
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