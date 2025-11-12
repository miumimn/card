"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type EventPlannerData = {
  name?: string;
  tagline?: string;
  about?: string;
  packages?: string[] | string;
  checklist?: string[] | string;
  gallery?: string[] | string;
  avatar?: string | string[]; // profile image (round)
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  tiktok?: string;
  booking_link?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function EventPlannerPreview({
  data,
  showFooter = true,
}: {
  data?: EventPlannerData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "packages" | "checklist" | "gallery" | "contact">("overview");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Safe helpers
  const safeString = (v: any) => {
    if (!v && v !== 0) return "";
    if (Array.isArray(v)) return String(v[0] ?? "");
    return String(v);
  };
  const asArray = (val: any): string[] => {
    if (!val && val !== 0) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  // Merge data and extra_fields safely
  const merged = useMemo(() => {
    const out: Record<string, any> = {};
    try {
      if (data && typeof data === "object") Object.assign(out, data);
      const ef = data?.extra_fields;
      if (ef) {
        try {
          const parsed = typeof ef === "string" ? JSON.parse(ef || "{}") : ef;
          if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => {
            if (out[k] === undefined) out[k] = v;
          });
        } catch {}
      }
    } catch {}
    return out as EventPlannerData;
  }, [data]);

  const name = safeString(merged.name) || (showFooter ? "Luxe Events Co." : "");
  const tagline = safeString(merged.tagline) || (showFooter ? "Weddings • Corporate Events • Private Parties" : "");
  const about = safeString(merged.about);
  const packages = asArray(merged.packages);
  const checklist = asArray(merged.checklist);
  const gallery = asArray(merged.gallery); // keep full set
  const avatar = safeString(merged.avatar);
  const heroImage = safeString(merged.heroImage);

  const email = safeString(merged.email);
  const phone = safeString(merged.phone);
  const whatsapp = safeString(merged.whatsapp);
  const tiktok = safeString(merged.tiktok);
  const bookingLink = safeString(merged.booking_link);
  const contactCards = asArray(merged.contact_cards);

  // Social/Contact helpers
  const isPhoneLike = (v?: string) => {
    if (!v) return false;
    if (v.startsWith("tel:")) return true;
    const cleaned = v.replace(/[()\s.-]/g, "");
    return /^\+?\d{6,}$/.test(cleaned);
  };

  const buildContactHref = (value: string, provider: "phone" | "email" | "whatsapp" | "tiktok") => {
    if (!value) return "";
    if (provider === "phone") {
      if (value.startsWith("tel:")) return value;
      const cleaned = value.replace(/[()\s.-]/g, "");
      return `tel:${cleaned}`;
    }
    if (provider === "email") {
      if (value.startsWith("mailto:")) return value;
      return `mailto:${value}`;
    }
    if (provider === "whatsapp") {
      if (/^https?:\/\//i.test(value)) return value;
      const cleaned = value.replace(/\D/g, "");
      return cleaned ? `https://wa.me/${cleaned}` : value;
    }
    if (provider === "tiktok") {
      if (/^https?:\/\//i.test(value)) return value;
      return `https://www.tiktok.com/@${value.replace(/^@/, "")}`;
    }
    return value;
  };

  // Icon components (inline SVGs) for contact row
  const IconPhone = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M22 16.92v3a1 1 0 0 1-1.11 1 19.86 19.86 0 0 1-8.63-3.18 19.27 19.27 0 0 1-6-6A19.86 19.86 0 0 1 3.08 3.11 1 1 0 0 1 4.1 2h3a1 1 0 0 1 1 .75c.12.6.3 1.2.54 1.79a1 1 0 0 1-.24 1L7.5 7.5a14 14 0 0 0 8 8l1.96-1.96a1 1 0 0 1 1-.24c.59.24 1.19.42 1.79.54a1 1 0 0 1 .75 1v3z" fill="currentColor"/></svg>
  );
  const IconEmail = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 6.5h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M21 6.5L12 13 3 6.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
  );
  const IconWhatsApp = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M20.5 3.5A10 10 0 1 0 23 12a10.08 10.08 0 0 0-2.5-8.5zM12 4a8 8 0 0 1 6.6 11.8L18 18l-2.2-.4A8 8 0 1 1 12 4z" fill="currentColor"/></svg>
  );
  const IconTikTok = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M16 8.5c-.6 0-1.1-.2-1.5-.5v6.5a3.5 3.5 0 1 1-3.5-3.5v-1.5a5 5 0 1 0 5 5V8.5z" fill="currentColor"/></svg>
  );

  // open specific index in lightbox
  const openLightbox = (index?: number | null) => {
    if (typeof index !== "number") return;
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

  // keyboard handlers for lightbox (Esc to close, arrows to navigate)
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

  // tabs visibility: hide empty sections for real profiles (showFooter=false)
  const availableTabs = useMemo(() => {
    const tabs: Array<typeof tab> = [];
    if (showFooter || about) tabs.push("overview");
    if (showFooter || packages.length > 0) tabs.push("packages");
    if (showFooter || checklist.length > 0) tabs.push("checklist");
    if (showFooter || gallery.length > 0) tabs.push("gallery");
    if (showFooter || email || phone || whatsapp || tiktok || contactCards.length > 0) tabs.push("contact");
    return tabs;
  }, [showFooter, about, packages, checklist, gallery, email, phone, whatsapp, tiktok, contactCards]);

  useEffect(() => {
    if (!availableTabs.includes(tab)) {
      setTab(availableTabs[0] || "overview");
    }
  }, [availableTabs, tab]);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        body.ep{ background: #0b0f1a; color: #e6f7f1; font-family: Inter,system-ui,Arial; }
        .wrap { max-width: 980px; margin: 0 auto; padding: 20px; }
        .hero { border-radius: 16px; overflow: hidden; background-size: cover; background-position: center; min-height: 40vh; display:flex; align-items:flex-end; padding: 20px; position:relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .hero-overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.75)); }
        .hero-row { position:relative; z-index:2; display:flex; gap:16px; align-items:center; }
        .profile-img { width: 96px; height:96px; border-radius:999px; overflow:hidden; flex:0 0 96px; border:4px solid rgba(255,255,255,0.06); background:#111; }
        .profile-img img{ width:100%; height:100%; object-fit:cover; display:block; }
        .hero-text { color: #e6f7f1; }
        .name { font-size: 28px; font-weight:900; color:#6ee7b7; margin:0; }
        .tagline { margin-top:6px; color:#9aa6b2; font-weight:700; }
        .tabs { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
        .tab { padding:8px 14px; border-radius:10px; background: rgba(255,255,255,0.04); border:none; color:#9aa6b2; cursor:pointer; font-weight:700; }
        .tab.active { background: linear-gradient(90deg,#00d4a4,#6ee7b7); color:#02110b; }
        .panel{ display:none; margin-top:16px; color:#e6f7f1; }
        .panel.active{ display:block; }
        .gallery-grid{ display:grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-top:12px; }
        .gallery-grid img{ width:100%; height:160px; object-fit:cover; border-radius:10px; cursor:pointer; transition: transform .25s ease; }
        .gallery-grid img:hover{ transform:scale(1.03); }
        .contact-list a{ display:inline-flex; align-items:center; gap:8px; color:#6ee7b7; text-decoration:none; margin:6px 0; }
        .contact-cards { margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; }
        .contact-card { background: rgba(255,255,255,0.03); padding:8px 10px; border-radius:8px; color:#dfeff0; }
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
        .footer { margin-top:28px; display:flex; gap:10px; justify-content:flex-end; }
        @media (max-width:600px){
          .name { font-size:22px; }
          .profile-img { width:72px; height:72px; flex:0 0 72px; }
        }
      `}</style>

      <main className="wrap ep" role="main">
        <section
          className="hero"
          style={{
            backgroundImage: `url(${heroImage || (showFooter ? "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=1400&auto=format&fit=crop" : "")})`,
          }}
        >
          <div className="hero-overlay" />
          <div className="hero-row">
            <div className="profile-img" aria-hidden={!avatar}>
              {avatar ? <img src={avatar} alt={`${name} profile`} /> : (showFooter ? <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" alt="placeholder" /> : null)}
            </div>

            <div className="hero-text">
              <h1 className="name">{name}</h1>
              <div className="tagline">{tagline}</div>
            </div>
          </div>
        </section>

        <div className="tabs" role="tablist" aria-label="Profile tabs">
          {availableTabs.includes("overview") ? (
            <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
          ) : null}
          {availableTabs.includes("packages") ? (
            <button className={`tab ${tab === "packages" ? "active" : ""}`} onClick={() => setTab("packages")}>Packages</button>
          ) : null}
          {availableTabs.includes("checklist") ? (
            <button className={`tab ${tab === "checklist" ? "active" : ""}`} onClick={() => setTab("checklist")}>Checklist</button>
          ) : null}
          {availableTabs.includes("gallery") ? (
            <button className={`tab ${tab === "gallery" ? "active" : ""}`} onClick={() => setTab("gallery")}>Gallery</button>
          ) : null}
          {availableTabs.includes("contact") ? (
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          ) : null}
        </div>

        <section>
          {availableTabs.includes("overview") ? (
            <div className={`panel ${tab === "overview" ? "active" : ""}`}>
              {about ? <p>{about}</p> : null}
            </div>
          ) : null}

          {availableTabs.includes("packages") ? (
            <div className={`panel ${tab === "packages" ? "active" : ""}`}>
              {packages.length ? (
                <ul>{packages.map((p, i) => <li key={i}>{p}</li>)}</ul>
              ) : null}
            </div>
          ) : null}

          {availableTabs.includes("checklist") ? (
            <div className={`panel ${tab === "checklist" ? "active" : ""}`}>
              {checklist.length ? <ul>{checklist.map((c, i) => <li key={i}>{c}</li>)}</ul> : null}
            </div>
          ) : null}

          {availableTabs.includes("gallery") ? (
            <div className={`panel ${tab === "gallery" ? "active" : ""}`}>
              <div className="gallery-grid" role="list">
                {gallery.length ? (
                  gallery.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Gallery ${i + 1}`}
                      onClick={() => openLightbox(i)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openLightbox(i); }}
                      tabIndex={0}
                      role="button"
                    />
                  ))
                ) : null}
              </div>
            </div>
          ) : null}

          {availableTabs.includes("contact") ? (
            <div className={`panel ${tab === "contact" ? "active" : ""}`}>
              <div className="contact-list" role="list">
                {phone ? <div role="listitem"><a href={buildContactHref(phone, "phone")}><IconPhone /> <span style={{ marginLeft: 8 }}>{phone}</span></a></div> : null}
                {email ? <div role="listitem"><a href={buildContactHref(email, "email")}><IconEmail /> <span style={{ marginLeft: 8 }}>{email}</span></a></div> : null}
                {whatsapp ? <div role="listitem"><a href={buildContactHref(whatsapp, "whatsapp")} target="_blank" rel="noreferrer"><IconWhatsApp /> <span style={{ marginLeft: 8 }}>WhatsApp</span></a></div> : null}
                {tiktok ? <div role="listitem"><a href={buildContactHref(tiktok, "tiktok")} target="_blank" rel="noreferrer"><IconTikTok /> <span style={{ marginLeft: 8 }}>TikTok</span></a></div> : null}
                {contactCards.length ? (
                  <div className="contact-cards" aria-label="Contact cards">
                    {contactCards.map((c, i) => {
                      const isUrl = typeof c === "string" && /^https?:\/\//i.test(c.trim());
                      return isUrl ? (
                        <a key={i} className="contact-card" href={c} target="_blank" rel="noreferrer">{c}</a>
                      ) : (
                        <div key={i} className="contact-card">{c}</div>
                      );
                    })}
                  </div>
                ) : null}
                {bookingLink ? <div style={{ marginTop: 10 }}><a href={bookingLink} target="_blank" rel="noreferrer">🗓 Book Now</a></div> : null}
              </div>
            </div>
          ) : null}
        </section>

        <div className="footer">
          {showFooter ? (
            <>
              <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="tab active" onClick={() => router.push("/onboarding/event-planner")}>Use this Template</button>
            </>
          ) : null}
        </div>

        {/* Lightbox overlay */}
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

      </main>
    </>
  );
}