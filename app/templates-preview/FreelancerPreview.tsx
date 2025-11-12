"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type FreelancerData = {
  name?: string;
  title?: string;
  about?: string;
  services?: string[] | string;
  portfolio?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  booking_link?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function FreelancerPreview({
  data,
  showFooter = true,
}: {
  data?: FreelancerData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "services" | "portfolio" | "contact">("about");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  // tolerant parsing helpers
  const parseListField = (val: any): string[] => {
    if (val === null || val === undefined) return [];
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

  const parseImageField = (val: any): string[] => parseListField(val);

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
    return out as FreelancerData;
  }, [data]);

  // text fields + placeholders
  const name = merged.name ? String(merged.name) : (showFooter ? "Alex Coleman" : "");
  const title = merged.title ? String(merged.title) : (showFooter ? "Independent Consultant & Designer" : "");
  const about = merged.about ? String(merged.about) : (showFooter ? "Independent consultant helping startups design product experiences and brand systems. Available for short-term sprints and retainer work." : "");

  const services = (() => {
    const v = merged.services ?? merged.service_list ?? merged.offerings;
    return parseListField(v);
  })();

  // image aliases
  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage ?? merged.profile_image);
  const heroCandidates = parseImageField(merged.heroImage ?? merged.hero_image ?? merged.banner);
  const portfolioCandidates = parseImageField(
    merged.portfolio ??
    merged.portfolioImages ??
    merged.portfolio_images ??
    merged.gallery ??
    merged.gallery_images ??
    merged.images
  );

  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";
  let portfolio = portfolioCandidates.slice(0, 6);

  // placeholders for template preview
  if (showFooter) {
    if (!heroImage) heroImage = "https://picsum.photos/seed/freelancer-hero/1400/480";
    if (!avatar) avatar = "https://picsum.photos/seed/freelancer-avatar/400/400";
    if (!portfolio.length) {
      portfolio = [
        "https://picsum.photos/seed/freelance1/800/600",
        "https://picsum.photos/seed/freelance2/800/600",
        "https://picsum.photos/seed/freelance3/800/600",
      ];
    }
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const whatsapp = merged.whatsapp ? String(merged.whatsapp) : "";
  const bookingLink = merged.booking_link ? String(merged.booking_link) : (merged.profile_url ? String(merged.profile_url) : "");
  const contactCards = parseListField(merged.contact_cards ?? merged.contact_cards_list ?? merged.contactCards);

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (bookingLink || clientHref));

  useEffect(() => {
    const avail: Array<typeof tab> = [];
    if (showFooter || about) avail.push("about");
    if (showFooter || services.length) avail.push("services");
    if (showFooter || portfolio.length) avail.push("portfolio");
    if (showFooter || email || phone || whatsapp || contactCards.length) avail.push("contact");
    if (avail.length && !avail.includes(tab)) setTab(avail[0]);
  }, [showFooter, about, services, portfolio, email, phone, whatsapp, contactCards, tab]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  // profile URL for QR (keep QR, per your preference)
  const profileUrl = merged.profile_url ? String(merged.profile_url) : (merged.profileUrl ? String(merged.profileUrl) : "");

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --f-bg-top:#071026; --f-bg-btm:#041020;
  --f-surface:rgba(255,255,255,0.02);
  --f-text:#eaf3f9; --f-muted:#9aa4b2;
  --f-accent:#ff7a64; --f-accent-2:#ffd36b;
  --radius:14px; --maxw:1100px;
}
body.freelancer-page{ margin:0; font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial; background:linear-gradient(180deg,var(--f-bg-top),var(--f-bg-btm)); color:var(--f-text); -webkit-font-smoothing:antialiased; }
.wrap{max-width:var(--maxw);margin:18px auto;padding:12px;}
.hero{display:grid;grid-template-columns: 1fr;gap:14px;align-items:end;position:relative;border-radius:18px;overflow:hidden;}
.hero-bg{width:100%;height:36vw;max-height:420px;border-radius:18px;object-fit:cover;display:block;box-shadow:0 18px 40px rgba(0,0,0,0.6);}
.hero-card{position:relative;margin-top:-72px;background:linear-gradient(180deg, rgba(6,10,14,0.9), rgba(6,10,14,0.85));padding:18px;border-radius:14px;display:flex;gap:12px;align-items:center;box-shadow:0 18px 40px rgba(2,6,23,0.6);}
.avatar{ width:92px; height:92px; border-radius:12px; background-size:cover; background-position:center; flex:0 0 92px; }
.tabs{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}
.tab{padding:10px 12px;border-radius:10px;background:transparent;border:1px solid rgba(255,255,255,0.03);color:var(--f-muted);font-weight:700}
.tab.active{background:linear-gradient(90deg,var(--f-accent),var(--f-accent-2));color:#06101a;border:none}
.panel{display:none;padding:14px 0;color:var(--f-muted)}
.panel.active{display:block}

/* mobile-first portfolio */
.portfolio-grid{ display:grid; grid-template-columns: 1fr; gap:12px; margin-top:12px; }
.portfolio-grid img{ width:100%; height:200px; object-fit:cover; border-radius:12px; cursor:pointer; transition: transform .18s ease; display:block; }
.portfolio-grid img:hover{ transform: scale(1.02); }
@media(min-width:640px){ .portfolio-grid{ grid-template-columns: repeat(2, 1fr); } }
@media(min-width:880px){ .portfolio-grid{ grid-template-columns: repeat(3, 1fr); } }

/* lightbox */
.lightbox{ position:fixed; inset:0; z-index:1400; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.9); padding:18px; }
.lightbox img{ max-width:96%; max-height:92%; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.6); }

/* CTA styles */
.btn-main{ padding:10px 14px; border-radius:12px; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
.btn-ghost{ padding:8px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.06); color:var(--f-text); text-decoration:none; }

/* contact badges */
.contact-row{ display:flex; gap:8px; align-items:center; margin-top:10px; flex-wrap:wrap; }
.contact-badge{ background:var(--f-surface); padding:8px 10px; border-radius:8px; display:inline-flex; gap:8px; align-items:center; }
` }} />

      <div className="freelancer-page" style={{ minHeight: "100vh" }}>
        <div className="wrap">
          <section className="hero" aria-label="Hero">
            {heroImage ? <img className="hero-bg" src={heroImage} alt="Work background" /> : null}
            <div className="hero-card" role="region" aria-label="Freelancer card">
              <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
              <div className="meta" style={{ flex: 1 }}>
                <div className="name" style={{ fontSize: 20, fontWeight: 800 }}>{name}</div>
                <div className="role" style={{ marginTop: 6, color: "var(--f-muted)" }}>{title}</div>

                <div className="cta" style={{ marginTop: 10 }}>
                  {showFooter ? (
                    <button
                      className="btn-main"
                      onClick={() => router.push("/onboarding/freelancer")}
                      style={{ background: "linear-gradient(90deg,var(--f-accent),var(--f-accent-2))", color: "#06101a" }}
                      aria-label="Use this template"
                    >
                      Use this template
                    </button>
                  ) : (
                    // Live profile: make Hire Me initiate a call when phone exists
                    <a
                      className="btn-main"
                      href={phone ? `tel:${phone.replace(/\s+/g, "")}` : (bookingLink || "#")}
                      style={{ background: "linear-gradient(90deg,var(--f-accent),var(--f-accent-2))", color: "#06101a" }}
                      aria-label="Hire me"
                    >
                      Hire Me
                    </a>
                  )}

                  {email ? (
                    <a className="btn-ghost" href={`mailto:${email}`} style={{ marginLeft: 8 }}>
                      Contact
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <div className="tabs" role="tablist" style={{ marginTop: 18 }}>
            <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
            <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
            <button className={`tab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>Portfolio</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </div>

          <div id="about" className={`panel ${tab === "about" ? "active" : ""}`}>
            <p className="muted">{about}</p>
          </div>

          <div id="services" className={`panel ${tab === "services" ? "active" : ""}`}>
            {services.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {services.map((s, i) => <div key={i} style={{ background: "var(--f-surface)", padding: 10, borderRadius: 10 }}><strong>{s}</strong></div>)}
              </div>
            ) : (showFooter ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ background: "var(--f-surface)", padding: 10, borderRadius: 10 }}><strong>UX Sprints</strong><div className="muted">2–4 week design sprint</div></div>
                <div style={{ background: "var(--f-surface)", padding: 10, borderRadius: 10 }}><strong>Product Design</strong><div className="muted">End-to-end product design</div></div>
              </div>
            ) : null)}
          </div>

          <div id="portfolio" className={`panel ${tab === "portfolio" ? "active" : ""}`}>
            <div className="portfolio-grid" role="list" aria-label="Portfolio">
              {portfolio.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Project ${i + 1}`}
                  onClick={() => openLightbox(src)}
                  role="button"
                  aria-label={`Open project ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div id="contact" className={`panel ${tab === "contact" ? "active" : ""}`}>
            <div className="contact-row">
              {phone ? <a className="contact-badge" href={`tel:${phone.replace(/\s+/g, "")}`}>📞 {phone}</a> : null}
              {whatsapp ? <a className="contact-badge" href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`}>💬 WhatsApp</a> : null}
              {email ? <a className="contact-badge" href={`mailto:${email}`}>✉️ Email</a> : null}
              {bookingLink ? <a className="contact-badge" href={bookingLink} target="_blank" rel="noreferrer">🗓 Book</a> : null}
            </div>

            {contactCards.length ? <div style={{ marginTop: 12 }}>{contactCards.map((c, i) => <div key={i} style={{ background: "var(--f-surface)", padding: 8, borderRadius: 8, marginTop: 8 }}>{c}</div>)}</div> : null}

            {/* QR: re-added per your preference */}
            <div style={{ marginTop: 14 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(profileUrl || clientHref)}`}
                alt="QR to profile"
                style={{ width: 120, borderRadius: 12 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            {showFooter ? (
              <>
                <button onClick={() => router.push("/templates-preview")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "transparent" }}>Back</button>
                <button onClick={() => router.push("/onboarding/freelancer")} style={{ padding: "10px 14px", borderRadius: 12, background: "linear-gradient(90deg,var(--f-accent),var(--f-accent-2))", color: "#06101a", fontWeight: 800 }}>Use this template</button>
              </>
            ) : null}
          </div>
        </div>

        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
            <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}