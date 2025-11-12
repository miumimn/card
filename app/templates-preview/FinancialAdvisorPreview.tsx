"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type FinancialAdvisorData = {
  name?: string;
  role?: string;
  about?: string;
  services?: string[] | string;
  fees?: string;
  credentials?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  gallery?: string[] | string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  booking_link?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  extra_fields?: any;
};

export default function FinancialAdvisorPreview({
  data,
  showFooter = true,
}: {
  data?: FinancialAdvisorData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "services" | "fees" | "credentials" | "contact">("about");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  // Safe parsing helpers
  const safeString = (v: any) => {
    if (v === null || v === undefined) return "";
    if (Array.isArray(v)) return String(v[0] ?? "");
    return String(v);
  };
  const asArray = (val: any): string[] => {
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
  };

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
    return out as FinancialAdvisorData;
  }, [data]);

  const name = safeString(merged.name) || (showFooter ? "WealthWise Advisory" : "");
  const role = safeString(merged.role) || (showFooter ? "Certified Financial Planner • Retirement & Investments" : "");
  const about = safeString(merged.about);
  const services = asArray(merged.services);
  const fees = safeString(merged.fees);
  const credentials = asArray(merged.credentials);
  const avatar = safeString(merged.avatar);
  const heroImage = safeString(merged.heroImage);
  const gallery = asArray(merged.gallery).slice(0, 3);
  const email = safeString(merged.email);
  const phone = safeString(merged.phone) || "";
  const whatsapp = safeString(merged.whatsapp) || "";
  const bookingLink = safeString((merged.booking_link ?? merged.profile_url ?? merged.extra_fields?.profile_url) || "");
  const contactCards = asArray(merged.contact_cards);

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (bookingLink || clientHref));

  useEffect(() => {
    // choose first available tab if current is not suitable
    const avail = [
      (showFooter || about) ? "about" : null,
      (showFooter || services.length) ? "services" : null,
      (showFooter || fees) ? "fees" : null,
      (showFooter || credentials.length) ? "credentials" : null,
      (showFooter || email || phone || whatsapp || contactCards.length) ? "contact" : null,
    ].filter(Boolean) as typeof tab[];
    if (avail.length && !avail.includes(tab)) setTab(avail[0]);
  }, [showFooter, about, services, fees, credentials, email, phone, whatsapp, contactCards, tab]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  /* SVG icons */
  const IconPhone = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.9.36 1.78.72 2.6a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.48-1.48a2 2 0 0 1 2.11-.45c.82.36 1.7.6 2.6.72A2 2 0 0 1 22 16.92z" fill="currentColor"/>
    </svg>
  );
  const IconMail = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7.5v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 7.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconWhatsApp = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20.52 3.48A11.92 11.92 0 1 0 21 12c0 .74-.06 1.47-.17 2.18L21 21l-6.84-1.8A11.9 11.9 0 0 0 12 24C6 24 1 19 1 13S6 2 12 2a11.9 11.9 0 0 1 5.52 1.48z" fill="#25D366"/>
      <path d="M17.35 14.14c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.36.22-.66.07-.3-.15-1.24-.46-2.36-1.45-.87-.77-1.46-1.72-1.63-2.02-.17-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2 0-.36-.05-.5-.05-.15-.68-1.64-.93-2.24-.25-.6-.5-.52-.68-.53l-.58-.01c-.2 0-.5.07-.76.36s-1 1-.99 2.44c0 1.43 1.02 2.82 1.16 3.02.15.2 2.01 3.07 4.85 4.3 2.52 1.12 2.52.75 2.97.7.45-.05 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.52-.32z" fill="#fff"/>
    </svg>
  );

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{ --fa-bg:#f6f8fb; --fa-accent:#0ea5a4; --fa-muted:#6b7280; --fa-text:#07121a; --fa-surface:#ffffff; }
body.fa{ margin:0; font-family:Inter,system-ui,Arial; background:var(--fa-bg); color:var(--fa-text); -webkit-font-smoothing:antialiased; }
.wrap{ max-width:980px; margin:16px auto; padding:18px; }
.hero{ display:flex; gap:12px; align-items:center; background:linear-gradient(180deg, rgba(14,165,164,0.04), rgba(0,0,0,0.01)); padding:14px; border-radius:12px; box-shadow:0 12px 30px rgba(2,6,23,0.04); position:relative }
.avatar{ width:96px; height:96px; border-radius:999px; background-size:cover; background-position:center; border:4px solid #fff; flex:0 0 96px }
.tabs{ display:flex; gap:8px; margin-top:16px; flex-wrap:wrap }
.tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--fa-muted); font-weight:700; cursor:pointer }
.tab.active{ background:linear-gradient(90deg,var(--fa-accent), rgba(14,165,164,0.12)); color:#041617; border:none; box-shadow:0 10px 28px rgba(14,165,164,0.06) }
.panel{ display:none; margin-top:12px; color:var(--fa-muted); line-height:1.6 }
.panel.active{ display:block }
.gallery{ display:grid; gap:10px; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); margin-top:12px }
.gallery img{ width:100%; height:160px; object-fit:cover; border-radius:10px; cursor:pointer; }
.about-gallery{ display:flex; gap:8px; margin-top:10px; flex-wrap:wrap }
.about-gallery img{ width:140px; height:84px; object-fit:cover; border-radius:8px; cursor:pointer; }
.lightbox{ position:fixed; inset:0; z-index:1200; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.85) }
.lightbox img{ max-width:92%; max-height:92%; border-radius:10px }
.contact-row{ display:flex; gap:10px; margin-top:12px; align-items:center; flex-wrap:wrap }
.contact-badge{ display:inline-flex; align-items:center; gap:8px; background:var(--fa-surface); padding:8px 10px; border-radius:8px }
` }} />

      <div className="fa" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <header className="hero" aria-label="Financial advisor hero" style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.01)), url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined }>
            <div className="avatar" aria-hidden="true" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
            <div className="meta">
              <h1 style={{ margin: 0, fontWeight: 900, fontSize: 20, color: "var(--fa-accent)" }}>{name}</h1>
              <div style={{ marginTop: 6, color: "var(--fa-muted)", fontWeight: 700 }}>{role}</div>

              <div className="contact-row" aria-hidden={!email && !phone && !whatsapp}>
                {phone ? <a className="contact-badge" href={callHref} aria-label="Call"><IconPhone /> Call</a> : null}
                {whatsapp ? <a className="contact-badge" href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><IconWhatsApp /> WhatsApp</a> : null}
                {email ? <a className="contact-badge" href={`mailto:${email}`}><IconMail /> Email</a> : null}
              </div>
            </div>
          </header>

          <nav className="tabs" role="tablist" aria-label="Profile tabs" style={{ marginTop: 12 }}>
            { (showFooter || about) ? <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button> : null }
            { (showFooter || services.length) ? <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button> : null }
            { (showFooter || fees) ? <button className={`tab ${tab === "fees" ? "active" : ""}`} onClick={() => setTab("fees")}>Fees</button> : null }
            { (showFooter || credentials.length) ? <button className={`tab ${tab === "credentials" ? "active" : ""}`} onClick={() => setTab("credentials")}>Credentials</button> : null }
            { (showFooter || email || phone || whatsapp || contactCards.length) ? <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button> : null }
          </nav>

          <section className="panels">
            <article className={`panel ${tab === "about" ? "active" : ""}`}>
              {about ? (
                <>
                  <h3>About</h3>
                  <p>{about}</p>

                  {/* New: drop images the user uploaded under About if any */}
                  {gallery.length ? (
                    <div className="about-gallery" aria-hidden={gallery.length === 0}>
                      {gallery.map((src, i) => (
                        <img key={i} src={src} alt={`about-img-${i+1}`} onClick={() => openLightbox(src)} />
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </article>

            <article className={`panel ${tab === "services" ? "active" : ""}`}>
              {services.length ? (
                <>
                  <h3>Services</h3>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                    {services.map((s, i) => <div key={i} style={{ background: "var(--fa-surface)", padding: 12, borderRadius: 10 }}><strong>{s}</strong></div>)}
                  </div>
                </>
              ) : null}
            </article>

            <article className={`panel ${tab === "fees" ? "active" : ""}`}>
              {fees ? <><h3>Fees</h3><p>{fees}</p></> : null}
            </article>

            <article className={`panel ${tab === "credentials" ? "active" : ""}`}>
              {credentials.length ? <><h3>Credentials</h3><div style={{ display: "flex", gap: 10, marginTop: 12 }}>{credentials.map((c, i) => <div key={i} style={{ background: "#fff", padding: 8, borderRadius: 8 }}>{c}</div>)}</div></> : null}
            </article>

            <article className={`panel ${tab === "contact" ? "active" : ""}`}>
              <h3>Contact</h3>
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {phone ? <a className="contact-badge" href={callHref}><IconPhone /> Call</a> : null}
                  {whatsapp ? <a className="contact-badge" href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"><IconWhatsApp /> WhatsApp</a> : null}
                  {email ? <a className="contact-badge" href={`mailto:${email}`}><IconMail /> Email</a> : null}
                  {bookingLink ? <a className="contact-badge" href={bookingLink} target="_blank" rel="noreferrer">Client Portal</a> : null}
                </div>

                {contactCards.length ? <div style={{ marginTop: 12 }}>{contactCards.map((c, i) => <div key={i} style={{ background: "var(--fa-surface)", padding: 8, borderRadius: 8, marginTop: 8 }}>{c}</div>)}</div> : null}
              </div>
            </article>
          </section>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            { showFooter ? (
              <>
                <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
                <button className="tab" onClick={() => router.push("/onboarding/financial-advisor")}>Use this template</button>
              </>
            ) : null }
          </div>
        </main>

        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
            <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}