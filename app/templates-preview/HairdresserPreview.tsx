"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type HairdresserData = {
  name?: string;
  brand?: string;
  salon_name?: string;
  display_name?: string;
  title?: string;
  role?: string;
  tagline?: string;
  about?: string;
  bio?: string;
  description?: string;
  services?: string[] | string;
  services_list?: string[] | string;
  gallery?: string[] | string;
  gallery_images?: string[] | string;
  images?: string[] | string;
  portfolio?: string[] | string;
  photos?: string[] | string;
  avatar?: string | string[];
  avatar_url?: string;
  profileImage?: string | string[];
  heroImage?: string | string[];
  hero_image?: string | string[];
  banner?: string | string[];
  location?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  snapchat?: string;
  booking_link?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function HairdresserPreview({ data, showFooter = true }: { data?: HairdresserData | null; showFooter?: boolean }) {
  const router = useRouter();

  // active tab state
  const [active, setActive] = useState<"about" | "services" | "gallery" | "location" | "contact">("about");

  // lightbox: index into gallery or null when closed
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // clientHref for QR fallback
  const [clientHref, setClientHref] = useState<string>("");
  useEffect(() => {
    try { setClientHref(typeof window !== "undefined" ? window.location.href || "" : ""); } catch { setClientHref(""); }
  }, []);

  // tolerant parsers
  const parseList = (val: any): string[] => {
    if (val == null) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "object") return [];
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map(p => p.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map(p => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };
  const parseImageField = (v: any) => parseList(v);

  // merge top-level + extra_fields
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
    return out as HairdresserData;
  }, [data]);

  // Flexible aliases
  const name = String(merged.name ?? merged.brand ?? merged.salon_name ?? merged.display_name ?? "");
  const title = String(merged.title ?? merged.role ?? merged.tagline ?? "");
  const about = String(merged.about ?? merged.bio ?? merged.description ?? "");

  const services = ((): string[] => {
    return parseList(merged.services ?? merged.services_list ?? merged.offerings ?? merged.offers ?? []);
  })();

  // gallery aliases
  const galleryRaw = parseImageField(
    merged.gallery ??
    merged.gallery_images ??
    merged.images ??
    merged.portfolio ??
    merged.photos ??
    merged.extra_fields?.gallery ??
    merged.extra_fields?.portfolio ??
    []
  );

  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage ?? merged.profile_image ?? merged.extra_fields?.avatar);
  const heroCandidates = parseImageField(merged.heroImage ?? merged.hero_image ?? merged.banner ?? merged.extra_fields?.heroImage);

  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  // placeholders only when template preview (showFooter)
  if (showFooter) {
    if (!heroImage) heroImage = "https://picsum.photos/seed/hairdresser-hero/1200/700";
    if (!avatar) avatar = "https://picsum.photos/seed/hairdresser-avatar/400/400";
    if (!galleryRaw.length) {
      galleryRaw.push(
        "https://picsum.photos/seed/hair1/1200/800",
        "https://picsum.photos/seed/hair2/1200/800",
        "https://picsum.photos/seed/hair3/1200/800"
      );
    }
    if (!services.length) services.push("Cut & Finish — from $55", "Full Colour — from $95", "Bridal Package — custom pricing");
  }

  const location = String(merged.location ?? "");
  const email = String(merged.email ?? "");
  const phone = String(merged.phone ?? "");
  const whatsapp = String(merged.whatsapp ?? "");
  const instagram = String(merged.instagram ?? "");
  const snapchat = String(merged.snapchat ?? "");
  const bookingLink = String(merged.booking_link ?? merged.profile_url ?? "");
  const profileUrl = String(merged.profile_url ?? "");

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (bookingLink || ""));

  // buildPublicUrl helper (best-effort)
  function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
    const STORAGE_BUCKET = "onboarding-uploads";
    if (!base) return filename;
    if (!filename) return filename;
    try {
      if (/^https?:\/\//.test(filename)) {
        const url = new URL(filename);
        const m = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)$/);
        if (m) {
          const decoded = decodeURIComponent(m[1]);
          const segs = decoded.split("/").map(s => encodeURIComponent(s));
          return `${url.origin}/storage/v1/object/public/${segs.join("/")}`;
        }
        return filename;
      }
    } catch {}
    let path = filename;
    if (!filename.includes("/")) path = `${slug}/${field}/${filename}`;
    path = path.replace(/^\/+|\/+$/g, "");
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    const baseClean = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
    return baseClean ? `${baseClean}/storage/v1/object/public/${STORAGE_BUCKET}/${encoded}` : path;
  }

  // Normalize gallery entries to URLs (preserve https urls, otherwise build candidate)
  const gallery = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const slug = "hairdresser";
    return galleryRaw.map((g) => {
      if (!g) return "";
      const s = String(g).trim();
      if (/^https?:\/\//i.test(s)) return s;
      return buildPublicUrl(base, slug, "gallery", s);
    }).filter(Boolean).slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(galleryRaw)]);

  // lightbox controls (open by index)
  const openLightbox = (index: number) => {
    if (index < 0 || index >= gallery.length) return;
    setLightboxIndex(index);
    try { document.body.style.overflow = "hidden"; } catch {}
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
    try { document.body.style.overflow = ""; } catch {}
  };
  const prevLightbox = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex == null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + gallery.length) % gallery.length));
  };
  const nextLightbox = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex == null) return;
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % gallery.length));
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (lightboxIndex == null) return;
      if (ev.key === "Escape") closeLightbox();
      if (ev.key === "ArrowLeft") prevLightbox();
      if (ev.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, gallery.length]);

  // social hrefs
  const instagramHref = instagram ? (instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`) : "";
  const whatsappHref = whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : "";
  const snapchatHref = snapchat ? (snapchat.startsWith("http") ? snapchat : `https://www.snapchat.com/add/${snapchat.replace(/^@/, "")}`) : "";
  const bookingHref = bookingLink ? (bookingLink.startsWith("http") ? bookingLink : `https://${bookingLink}`) : "";

  // Icon set
  const Icon = {
    Instagram: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" stroke="currentColor" strokeWidth="1.2"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>
    ),
    WhatsApp: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20.52 3.48A11.92 11.92 0 1 0 21 12c0 .74-.06 1.47-.17 2.18L21 21l-6.84-1.8A11.9 11.9 0 0 0 12 24C6 24 1 19 1 13S6 2 12 2a11.9 11.9 0 0 1 5.52 1.48z"/><path d="M17.35 14.14c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.36.22-.66.07-.3-.15-1.24-.46-2.36-1.45-.87-.77-1.46-1.72-1.63-2.02-.17-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2 0-.36-.05-.5-.05-.15-.68-1.64-.93-2.24-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.5.07-.76.36s-1 1-.99 2.44c0 1.43 1.02 2.82 1.16 3.02.15.2 2.01 3.07 4.85 4.3 2.52 1.12 2.52.75 2.97.7.45-.05 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.52-.32" fill="#fff"/></svg>
    ),
    Snapchat: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C9.3 2 7.1 3.3 6 5.2C5.2 6.5 4.7 8.1 5 9.6C5.2 10.8 6 11.9 6 13.2C6 15.6 4.4 17.6 3.6 19C3.3 19.6 3.5 20.4 4.1 20.7C5.7 21.5 7.4 21.9 9.1 21.9C11.4 21.9 13.4 21 15.2 19.7C15.8 19.3 16.8 19 17 18C17.6 15.7 17.6 14.1 17.6 13.2C17.6 11.9 18.4 10.8 18.6 9.6C19 8 18.5 6.4 17.6 5.2C16.5 3.3 14.3 2 12 2Z" /></svg>
    ),
    Booking: ({ size = 16 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M8 3v4M16 3v4M3 11h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
    )
  };

  // UPDATED icon style: high-contrast gradient background + dark icon color so icons stand out on the hero
  const iconLinkStyle = (enabled: boolean) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 36, height: 36, borderRadius: 10,
    background: enabled ? "linear-gradient(90deg, var(--hd-accent), #ffd79a)" : "transparent",
    color: enabled ? "#071614" : "rgba(255,255,255,0.28)",
    textDecoration: "none",
    border: enabled ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.02)",
    boxShadow: enabled ? "0 6px 18px rgba(203,160,90,0.12)" : undefined,
    transition: "transform .12s ease, box-shadow .12s ease"
  } as React.CSSProperties);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{ --hd-bg:#052a28; --hd-accent:#cfa25a; --hd-muted:#9fb2a8; --hd-text:#f6f7f7; --hd-surface:#071a19; }
.hairdresser-wrap{ font-family:Inter,system-ui,Arial; color:var(--hd-text); max-width:980px; margin:14px auto; padding:16px; }
.hero { position:relative; border-radius:18px; overflow:hidden; min-height:32vw; max-height:360px; background-size:140% auto; background-position:center; padding:20px; display:flex; align-items:flex-end; gap:12px; box-shadow:0 18px 40px rgba(0,0,0,0.6); }
.avatar{ width:98px; height:98px; border-radius:999px; border:5px solid rgba(255,255,255,0.9); background-size:cover; background-position:center; box-shadow:0 12px 36px rgba(0,0,0,0.6); }
.hero-card { margin-left:auto; z-index:2; width:46%; background: linear-gradient(180deg, rgba(7,26,25,0.4), rgba(3,10,10,0.6)); padding:12px; border-radius:12px; color:var(--hd-text); }
.tabs{ display:flex; gap:8px; padding:14px 0; flex-wrap:wrap; margin-top:18px; }
.tab{ padding:10px 14px; border-radius:12px; background:transparent; border:1px solid rgba(255,255,255,0.04); color:var(--hd-muted); font-weight:800; font-size:13px; cursor:pointer; }
.tab.active{ background:linear-gradient(90deg,var(--hd-accent), rgba(207,162,90,0.12)); color:#071614; border:none; box-shadow:0 12px 28px rgba(203,160,90,0.06); }
.panel{ display:none; color:var(--hd-muted); padding-top:12px; line-height:1.6; }
.panel.active{ display:block; color:var(--hd-muted); }
.services-grid{ display:grid; gap:10px; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); margin-top:10px; }
.service-card{ background:var(--hd-surface); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.03); color:var(--hd-text); }
.gallery-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); gap:8px; margin-top:8px; }
.gallery-grid img{ width:100%; height:120px; object-fit:cover; border-radius:10px; cursor:pointer; }
.contact-row{ display:flex; gap:12px; align-items:center; margin-top:12px; }
.primary-btn{ padding:8px 12px; border-radius:8px; background:linear-gradient(90deg,var(--hd-accent),#ffd79a); color:#071614; font-weight:700; text-decoration:none; border:none; }
.social-row{ display:flex; gap:8px; margin-top:12px; }
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: 2000;
  padding: 20px;
}
.lightbox-inner { position: relative; max-width: 96%; max-height: 96%; display:flex; align-items:center; justify-content:center; }
.lightbox-inner img { max-width: 100%; max-height: 100%; border-radius: 10px; display:block; }
.lightbox-close, .lightbox-nav {
  position: absolute;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
}
.lightbox-close { top: 12px; right: 12px; }
.lightbox-nav.prev { left: 12px; top: 50%; transform: translateY(-50%); }
.lightbox-nav.next { right: 12px; top: 50%; transform: translateY(-50%); }
` }} />

      <div className="hairdresser-wrap" style={{ minHeight: "100vh" }}>
        <section className="hero" aria-label="Hairdresser hero" style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(4,26,26,0.28), rgba(2,16,16,0.6)), url('${heroImage}')` } : undefined}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", zIndex: 2 }}>
            <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
            <div className="meta">
              <h2 className="name" style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--hd-accent)" }}>{name || (showFooter ? "Ezra Miller" : "")}</h2>
              <div className="role" style={{ marginTop: 6, color: "var(--hd-muted)", fontWeight: 700 }}>{title || (showFooter ? "Creative Director & Senior Stylist — ABC Salon" : "")}</div>

              <nav className="social-row" aria-label="social links" style={{ marginTop: 12 }}>
                {instagram ? (<a href={instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram" style={iconLinkStyle(true)}><Icon.Instagram /></a>) : null}
                {whatsapp ? (<a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp" style={iconLinkStyle(true)}><Icon.WhatsApp /></a>) : null}
                {bookingHref ? (<a href={bookingHref} target={bookingHref.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label="Booking" style={iconLinkStyle(true)}><Icon.Booking /></a>) : null}
                {snapchat ? (<a href={snapchatHref} target="_blank" rel="noreferrer" aria-label="Snapchat" style={iconLinkStyle(true)}><Icon.Snapchat /></a>) : null}
              </nav>
            </div>
          </div>

          <div className="hero-card" aria-hidden="true">
            <a className="primary-btn" href={bookingLink || "#"} aria-label="Book">{showFooter ? "Book Now" : "Book Now"}</a>
          </div>
        </section>

        <nav className="tabs" role="tablist" aria-label="Profile tabs">
          <button className={`tab ${active === "about" ? "active" : ""}`} onClick={() => setActive("about")}>About</button>
          <button className={`tab ${active === "services" ? "active" : ""}`} onClick={() => setActive("services")}>Services & Prices</button>
          <button className={`tab ${active === "gallery" ? "active" : ""}`} onClick={() => setActive("gallery")}>Gallery</button>
          <button className={`tab ${active === "location" ? "active" : ""}`} onClick={() => setActive("location")}>Location</button>
          <button className={`tab ${active === "contact" ? "active" : ""}`} onClick={() => setActive("contact")}>Contact</button>
        </nav>

        <section className="panels">
          <article id="about" className={`panel ${active === "about" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>About</h3>
            <p style={{ margin: 0 }}>{about}</p>
          </article>

          <article id="services" className={`panel ${active === "services" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Services & Prices</h3>
            <div className="services-grid">
              {services.map((s, i) => (
                <div key={i} className="service-card"><strong>{s.split("—")[0].trim()}</strong>{s.includes("—") ? <div className="sub">{s.split("—")[1].trim()}</div> : null}</div>
              ))}
            </div>
          </article>

          <article id="gallery" className={`panel ${active === "gallery" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Gallery</h3>
            <div className="gallery-grid" aria-live="polite">
              {gallery.map((g, i) => (
                <img key={i} src={g} alt={`look ${i+1}`}
                  onClick={() => openLightbox(i)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openLightbox(i); }}
                  tabIndex={0}
                  role="button"
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }}
                />
              ))}
            </div>
          </article>

          <article id="location" className={`panel ${active === "location" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Location</h3>
            {/* show only the location text, do not embed a map */}
            <p style={{ margin: 0, color: "var(--hd-muted)" }}>{location}</p>
          </article>

          <article id="contact" className={`panel ${active === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ margin: "0 0 8px" }}>Contact & Booking</h3>
            {email ? <p style={{ margin: 0, color: "var(--hd-muted)" }}>Email: <a href={`mailto:${email}`} style={{ color: "var(--hd-text)" }}>{email}</a></p> : null}
            {phone ? <p style={{ marginTop: 8, color: "var(--hd-muted)" }}>Studio: <a href={`tel:${phone.replace(/\s+/g, "")}`} style={{ color: "var(--hd-text)" }}>{phone}</a></p> : null}

            <div className="contact-row" style={{ marginTop: 12 }}>
              {showFooter ? (
                <a className="primary-btn" href={bookingLink || "#"} aria-label="Book Appointment">Book Appointment</a>
              ) : (
                <a className="primary-btn" href={phone ? `tel:${phone.replace(/\s+/g, "")}` : (bookingLink || "#")} aria-label="Call to Book">Call to Book</a>
              )}

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR" style={{ width: 84, height: 84, borderRadius: 8, background: "#fff" }} />
                <div style={{ color: "var(--hd-muted)", fontSize: 13 }}>
                  Download QR<br/>
                  {showFooter ? (
                    <a href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(profileUrl || clientHref)}`} download style={{ padding: "6px 8px", background: "#fff0e6", borderRadius: 8, textDecoration: "none", color: "var(--hd-accent)" }}>Download</a>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Lightbox overlay (index-based) */}
        {lightboxIndex !== null && gallery[lightboxIndex] ? (
          <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Image preview">
            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" aria-label="Close" onClick={closeLightbox}>×</button>
              {gallery.length > 1 && <button className="lightbox-nav prev" aria-label="Previous image" onClick={prevLightbox}>‹</button>}
              <img src={gallery[lightboxIndex]} alt={`Image ${lightboxIndex + 1}`} />
              {gallery.length > 1 && <button className="lightbox-nav next" aria-label="Next image" onClick={nextLightbox}>›</button>}
            </div>
          </div>
        ) : null}

        {showFooter ? (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
            <button className="primary-btn" onClick={() => router.push("/onboarding/hairdresser")}>Use this template</button>
          </div>
        ) : null}
      </div>
    </>
  );
}