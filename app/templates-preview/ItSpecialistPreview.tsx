"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type ItSpecialistData = {
  name?: string;
  title?: string;
  role?: string;                         // alias added to accept merged.role
  about?: string;
  bio?: string;                          // added to accept merged.bio
  services?: string[] | string;
  services_list?: string[] | string;     // alias added
  offerings?: string[] | string;         // alias added
  portfolio?: string[] | string;
  portfolio_images?: string[] | string;  // alias added
  images?: string[] | string;            // alias added
  gallery?: string[] | string;           // alias added
  avatar?: string | string[];
  avatar_url?: string;                   // alias added
  profileImage?: string | string[];      // alias added
  profile_image?: string | string[];     // alias added
  heroImage?: string | string[];
  hero_image?: string | string[];        // alias added
  banner?: string | string[];            // alias added
  email?: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  booking_link?: string;
  profile_url?: string;
  profileUrl?: string;                   // alias added
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function ItSpecialistPreview({
  data,
  showFooter = true,
}: {
  data?: ItSpecialistData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "services" | "portfolio" | "contact">("about");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  const parseList = (val: any): string[] => {
    if (val == null) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try {
        const p = JSON.parse(s);
        if (Array.isArray(p)) return p.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map((l) => l.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((l) => l.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  const parseImageField = (v: any) => parseList(v);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    const extra = data?.extra_fields;
    if (extra) {
      try {
        const parsed = typeof extra === "string" ? JSON.parse(extra || "{}") : extra;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (out[k] === undefined) out[k] = v;
          });
        }
      } catch {}
    }
    return out as ItSpecialistData;
  }, [data]);

  // data-driven values (no template fallbacks when showFooter === false)
  const name = merged.name ?? (showFooter ? "Alex Rivera" : "");
  const title = merged.title ?? merged.role ?? (showFooter ? "IT Specialist • Cloud & DevOps" : "");
  const about = merged.about ?? merged.bio ?? (showFooter ? "Cloud architecture, automation and security. Building scalable systems." : "");

  const services = parseList(merged.services ?? merged.services_list ?? merged.offerings);
  const portfolioRaw = parseImageField(merged.portfolio ?? merged.portfolio_images ?? merged.images ?? merged.gallery);

  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage ?? merged.profile_image);
  const heroCandidates = parseImageField(merged.heroImage ?? merged.hero_image ?? merged.banner);

  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  if (showFooter) {
    if (!heroImage) heroImage = "https://picsum.photos/seed/it-hero/1400/420";
    if (!avatar) avatar = "https://picsum.photos/seed/it-avatar/400/400";
    if (!portfolioRaw.length) {
      portfolioRaw.push(
        "https://picsum.photos/seed/it1/1200/800",
        "https://picsum.photos/seed/it2/1200/800",
        "https://picsum.photos/seed/it3/1200/800"
      );
    }
    if (!services.length) services.push("Cloud Architecture", "CI/CD automation", "Security & Compliance");
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const whatsappRaw = merged.whatsapp ?? "";
  const whatsapp = Array.isArray(whatsappRaw) ? String(whatsappRaw[0]) : String(whatsappRaw ?? "");
  const linkedinRaw = merged.linkedin ?? "";
  const linkedin = Array.isArray(linkedinRaw) ? String(linkedinRaw[0]) : String(linkedinRaw ?? "");
  const githubRaw = merged.github ?? "";
  const github = Array.isArray(githubRaw) ? String(githubRaw[0]) : String(githubRaw ?? "");
  const websiteRaw = merged.website ?? "";
  const website = Array.isArray(websiteRaw) ? String(websiteRaw[0]) : String(websiteRaw ?? "");
  const bookingLinkRaw = merged.booking_link ?? merged.profile_url ?? "";
  const bookingLink = Array.isArray(bookingLinkRaw) ? String(bookingLinkRaw[0]) : String(bookingLinkRaw ?? "");
  const profileUrlRaw = merged.profile_url ?? merged.profileUrl ?? "";
  const profileUrl = Array.isArray(profileUrlRaw) ? String(profileUrlRaw[0]) : String(profileUrlRaw ?? "");

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (bookingLink || clientHref));

  function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
    if (!base) return filename;
    if (!filename) return filename;
    try {
      if (/^https?:\/\//.test(filename)) {
        const u = new URL(filename);
        const m = u.pathname.match(/\/storage\/v1\/object\/public\/(.+)$/);
        if (m) {
          const decoded = decodeURIComponent(m[1]);
          const segs = decoded.split("/").map((s) => encodeURIComponent(s));
          return `${u.origin}/storage/v1/object/public/${segs.join("/")}`;
        }
        return filename;
      }
    } catch {}
    const STORAGE_BUCKET = "onboarding-uploads";
    let path = filename;
    if (!filename.includes("/")) path = `${slug}/${field}/${filename}`;
    path = path.replace(/^\/+|\/+$/g, "");
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    const baseClean = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
    return baseClean ? `${baseClean}/storage/v1/object/public/${STORAGE_BUCKET}/${encoded}` : path;
  }

  const gallery = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const slug = "it-specialist";
    return portfolioRaw.map((p) => {
      if (!p) return "";
      const s = String(p);
      if (/^https?:\/\//.test(s)) return s;
      return buildPublicUrl(base, slug, "portfolio", s);
    }).filter(Boolean).slice(0, 9);
  }, [portfolioRaw]);

  // accessibility & mobile-first styles and behavior
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // prefer real content on profile preview
    if (!showFooter) {
      if (gallery.length) setTab("portfolio");
      else if (services.length) setTab("services");
      else if (about) setTab("about");
      else setTab("contact");
    } else {
      if (gallery.length) setTab("portfolio");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, showFooter]);

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightbox(src);
  };
  const closeLightbox = () => setLightbox(null);

  // small icon set
  const Icon = {
    LinkedIn: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor"/><path d="M8 11v6M8 8v.01M12 11v6M16 11v6" stroke="currentColor" strokeWidth="1.2"/></svg>
    ),
    GitHub: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2a10 10 0 0 0-3.16 19.48c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.17-3.37-1.17-.46-1.17-1.12-1.48-1.12-1.48-.92-.62.07-.61.07-.61 1.02.07 1.56 1.05 1.56 1.05.9 1.55 2.36 1.1 2.94.84.09-.66.35-1.1.63-1.36-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.116 2.51.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.4.2 2.43.1 2.69.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.59.69.49A10 10 0 0 0 12 2z" fill="currentColor"/></svg>
    ),
    Website: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M2 12h20M12 2c3 3 3 10 0 18" stroke="currentColor" strokeWidth="1.2"/></svg>
    ),
    WhatsApp: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M20.52 3.48A11.92 11.92 0 1 0 21 12c0 .74-.06 1.47-.17 2.18L21 21l-6.84-1.8A11.9 11.9 0 0 0 12 24C6 24 1 19 1 13S6 2 12 2a11.9 11.9 0 0 1 5.52 1.48z" fill="currentColor"/><path d="M17.35 14.14c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.36.22-.66.07-.3-.15-1.24-.46-2.36-1.45-.87-.77-1.46-1.72-1.63-2.02-.17-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2 0-.36-.05-.5-.05-.15-.68-1.64-.93-2.24-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.5.07-.76.36s-1 1-.99 2.44c0 1.43 1.02 2.82 1.16 3.02.15.2 2.01 3.07 4.85 4.3 2.52 1.12 2.52.75 2.97.7.45-.05 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.52-.32z" fill="#fff"/></svg>
    )
  };

  const iconStyle = (enabled: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 8,
    background: enabled ? "rgba(255,255,255,0.06)" : "transparent",
    color: enabled ? "#8b6bff" : "rgba(255,255,255,0.28)",
    textDecoration: "none",
    border: enabled ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(255,255,255,0.02)",
  } as React.CSSProperties);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{ --it-bg:#f6f8fb; --it-accent:#4f46e5; --it-muted:#475569; --it-text:#071124; }
.it-wrap{ max-width:980px; margin:18px auto; padding:16px; font-family:Inter,system-ui,Arial; color:var(--it-text); }
.hero-it{ border-radius:14px; overflow:hidden; padding:16px; display:flex; flex-direction:column; gap:12px; background:linear-gradient(180deg, rgba(79,70,229,0.06), rgba(0,0,0,0.02)); background-size:140% auto; min-height:160px; }
.hero-top{ display:flex; gap:12px; align-items:center; }
.avatar-it{ width:72px; height:72px; border-radius:12px; background-size:cover; background-position:center; border:3px solid #fff; flex:0 0 72px; }
@media(min-width:720px){ .hero-it{ padding:20px; min-height:220px; flex-direction:row; align-items:center; } .avatar-it{ width:92px; height:92px; } }
.tabs{ display:flex; gap:8px; margin-top:12px; overflow-x:auto; padding-bottom:6px; -webkit-overflow-scrolling:touch; }
.tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--it-muted); font-weight:700; cursor:pointer; white-space:nowrap; }
.tab.active{ background:linear-gradient(90deg,var(--it-accent), rgba(79,70,229,0.12)); color:#021124; border:none; }
.panel{ display:none; margin-top:12px; color:var(--it-muted); line-height:1.6; }
.panel.active{ display:block; }
.port-grid{ display:grid; gap:10px; grid-template-columns: 1fr; margin-top:12px; }
.port-grid img{ width:100%; height:160px; object-fit:cover; border-radius:10px; cursor:pointer; }
@media(min-width:640px){ .port-grid{ grid-template-columns: repeat(2, 1fr); } }
@media(min-width:980px){ .port-grid{ grid-template-columns: repeat(3, 1fr); } }
.contact-row{ display:flex; gap:8px; align-items:center; margin-top:12px; flex-wrap:wrap; }
.primary{ padding:12px 14px; border-radius:10px; background:linear-gradient(90deg,var(--it-accent), #7c5cff); color:#021124; font-weight:800; text-decoration:none; display:block; width:100%; text-align:center; }
@media(min-width:720px){ .primary{ width:auto; } }
` }} />

      <div className="it-wrap" style={{ background: "var(--it-bg)" }}>
        <section className="hero-it" style={heroImage ? { backgroundImage: `url('${heroImage}')`, backgroundRepeat: "no-repeat" } : undefined}>
          <div className="hero-top">
            <div className="avatar-it" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{name || (showFooter ? "Alex Rivera" : "")}</h2>
              <div style={{ marginTop: 6, color: "var(--it-muted)", fontWeight: 700 }}>{title || (showFooter ? "IT Specialist • Cloud & DevOps" : "")}</div>
              <p style={{ marginTop: 8, color: "var(--it-muted)", fontSize: 14 }}>{about}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {linkedin ? <a href={linkedin.startsWith("http") ? linkedin : `https://linkedin.com/in/${linkedin.replace(/^@/, "")}`} target="_blank" rel="noreferrer" style={iconStyle(true)} aria-label="LinkedIn"><Icon.LinkedIn /></a> : <span style={iconStyle(false)} aria-hidden><Icon.LinkedIn /></span>}
              {github ? <a href={github.startsWith("http") ? github : `https://github.com/${github.replace(/^@/, "")}`} target="_blank" rel="noreferrer" style={iconStyle(true)} aria-label="GitHub"><Icon.GitHub /></a> : <span style={iconStyle(false)} aria-hidden><Icon.GitHub /></span>}
              {website ? <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noreferrer" style={iconStyle(true)} aria-label="Website"><Icon.Website /></a> : <span style={iconStyle(false)} aria-hidden><Icon.Website /></span>}
              {whatsapp ? <a href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={iconStyle(true)} aria-label="WhatsApp"><Icon.WhatsApp /></a> : <span style={iconStyle(false)} aria-hidden><Icon.WhatsApp /></span>}
            </div>

            <div>
              {showFooter ? (
                <button className="primary" onClick={() => router.push("/onboarding/it-specialist")}>Use this template</button>
              ) : (
                <a className="primary" href={callHref || "#"}>Contact / Call</a>
              )}
            </div>
          </div>
        </section>

        <div className="tabs" role="tablist" aria-label="profile tabs">
          <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
          <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
          <button className={`tab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>Portfolio</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
        </div>

        <div className="panels">
          <article className={`panel ${tab === "about" ? "active" : ""}`}>
            <h3 style={{ margin: "0 0 8px" }}>About</h3>
            <p style={{ margin: 0, color: "var(--it-muted)" }}>{about}</p>
          </article>

          <article className={`panel ${tab === "services" ? "active" : ""}`}>
            <h3 style={{ margin: "0 0 8px" }}>Services</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {services.length ? services.map((s, i) => <div key={i} style={{ background: "#fff", padding: 10, borderRadius: 8 }}>{s}</div>) : (showFooter ? <div style={{ color: "var(--it-muted)" }}>Example: Cloud architecture, CI/CD, Security audits</div> : null)}
            </div>
          </article>

          <article className={`panel ${tab === "portfolio" ? "active" : ""}`}>
            <h3 style={{ margin: "0 0 8px" }}>Portfolio</h3>
            <div className="port-grid" role="list">
              {gallery.map((src, i) => <img key={i} src={src} alt={`project ${i + 1}`} onClick={() => openLightbox(src)} />)}
            </div>
          </article>

          <article className={`panel ${tab === "contact" ? "active" : ""}`}>
            <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
            <div style={{ color: "var(--it-muted)" }}>
              {email ? <div>Email: <a href={`mailto:${email}`}>{email}</a></div> : null}
              {phone ? <div style={{ marginTop: 8 }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></div> : null}
              {bookingLink ? <div style={{ marginTop: 8 }}>Booking: <a href={bookingLink} target="_blank" rel="noreferrer">{bookingLink}</a></div> : null}
              {profileUrl ? <div style={{ marginTop: 8 }}>Profile: <a href={profileUrl} target="_blank" rel="noreferrer">{profileUrl}</a></div> : null}
            </div>
          </article>
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