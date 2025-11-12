"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

type EyelashData = {
  name?: string;
  role?: string;
  about?: string;
  services?: string[] | string;
  portfolio?: string[] | string;
  gallery?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  phone?: string;
  booking_link?: string;
  gift_vouchers?: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
  facebook?: string;
  contact_cards?: string[] | string;
  address?: string;
  profile_url?: string;
  refill_tips?: string;
  extra_fields?: any;
};

export default function EyelashTechPreview({
  data,
  showFooter = true,
}: {
  data?: EyelashData;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("about");
  const [clientHref, setClientHref] = useState<string>("");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed =
          typeof data.extra_fields === "string"
            ? JSON.parse(data.extra_fields || "{}")
            : data.extra_fields;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (out[k] === undefined) out[k] = v;
          });
        }
      } catch {}
    }
    return out as EyelashData;
  }, [data]);

  function asArray(val: any): string[] {
    if (val === null || val === undefined) return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
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
  }

  function asString(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length) return String(val[0]).trim();
    if (typeof val === "object") {
      const cands = ["url", "href", "value", "link", "address"];
      for (const k of cands) if ((val as any)[k]) return String((val as any)[k]).trim();
      try { return JSON.stringify(val); } catch { return ""; }
    }
    return String(val).trim();
  }

  // data-driven values (no template autofill on profile previews)
  const name = asString(merged.name) || (showFooter ? "Mila Hart" : "");
  const role = asString(merged.role) || (showFooter ? "Eyelash Artist — Classic & Volume Sets" : "");
  const about = asString(merged.about || merged.extra_fields?.about);
  const services = asArray(merged.services ?? merged.extra_fields?.services ?? []);
  const portfolio = asArray(merged.portfolio ?? merged.gallery ?? merged.extra_fields?.portfolio ?? []).slice(0, 6);
  const avatar = asString(merged.avatar ?? merged.extra_fields?.avatar);
  const heroImage = asString(merged.heroImage ?? merged.extra_fields?.heroImage);
  const phone = asString(merged.phone ?? merged.extra_fields?.phone) || (showFooter ? "+1 555 555 5555" : "");
  const bookingLink = asString((merged.booking_link ?? merged.extra_fields?.booking_link ?? merged.profile_url ?? merged.extra_fields?.profile_url) || "");
  const giftVouchers = asString(merged.gift_vouchers ?? merged.extra_fields?.gift_vouchers);
  const instagram = asString(merged.instagram ?? merged.extra_fields?.instagram);
  const tiktok = asString(merged.tiktok ?? merged.extra_fields?.tiktok);
  const snapchat = asString(merged.snapchat ?? merged.extra_fields?.snapchat);
  const facebook = asString(merged.facebook ?? merged.extra_fields?.facebook);
  const contactCards = (merged.contact_cards && Array.isArray(merged.contact_cards))
    ? merged.contact_cards.map(String)
    : (merged.extra_fields?.contact_cards && Array.isArray(merged.extra_fields.contact_cards) ? merged.extra_fields.contact_cards.map(String) : []);

  const address = asString(merged.address ?? merged.extra_fields?.address);
  const refillTips = asString(merged.refill_tips ?? merged.extra_fields?.refill_tips);
  const qrData = asString(merged.profile_url) || clientHref || "";

  // Book Now should call when phone exists; fall back to bookingLink or profile
  const telHref = phone ? `tel:${String(phone).replace(/\s+/g, "")}` : (bookingLink || clientHref);

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  /* SVG icons */
  const IconInstagram = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="#E1306C" strokeWidth="1.2" fill="none"/>
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z" stroke="#E1306C" strokeWidth="1.2" fill="none"/>
      <circle cx="17.5" cy="6.5" r="0.6" fill="#E1306C"/>
    </svg>
  );
  const IconSnapchat = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2c4.97 0 9 4.03 9 9 0 3.07-1.6 5.78-4 7.32V21s-1 .5-4 .5-4-.5-4-.5v-2.68C4.6 16.78 3 14.07 3 11 3 6.03 7.03 2 12 2z" fill="#FFFC00"/>
      <path d="M9 15s1 1 3 1 3-1 3-1" stroke="#000" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  const IconTiktok = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 8v8a4 4 0 1 0 4-4V6h3a4 4 0 0 1-3 2v4a2 2 0 1 1-2-2V8H9z" fill="#010101"/>
    </svg>
  );
  const IconFacebook = ({ className = "" }: { className?: string }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.95v-7.05H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.9h-2.3V22c4.78-.83 8.44-4.96 8.44-9.93z" fill="#1877F2"/>
    </svg>
  );

  // build map iframe src using address if provided (Google maps search embed)
  const mapSrc = address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : `https://www.openstreetmap.org/export/embed.html?bbox=-0.128%2C51.503%2C-0.116%2C51.508&amp;layer=mapnik`;

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --lash-bg:#fffaf8;
  --lash-accent:#6b4cff;
  --lash-muted:#7a7480;
  --lash-text:#231f20;
  --lash-card:#fff;
}
body.lash{ margin:0; font-family:Inter,system-ui,Arial; background:var(--lash-bg); color:var(--lash-text); }
.wrap { max-width:920px; margin:14px auto; padding:16px; }
.hero { position:relative; border-radius:12px; overflow:hidden; background-image: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.98)); min-height:40vw; display:flex; align-items:center; justify-content:center; padding:24px; box-shadow: 0 10px 30px rgba(20,18,20,0.04); }
.avatar { width:100px; height:100px; border-radius:999px; border:5px solid var(--lash-card); background-size:cover; box-shadow: 0 12px 32px rgba(107,76,255,0.06); }
.tabs { display:flex; gap:8px; padding:12px 0; flex-wrap:wrap; }
.tab { padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--lash-muted); font-weight:700; }
.tab.active { background: linear-gradient(90deg,var(--lash-accent), rgba(107,76,255,0.08)); color:#fff; border:none; box-shadow:0 8px 24px rgba(107,76,255,0.06); }
.panel.active { display:block; }
.panel { display:none; padding-bottom:18px; color:var(--lash-muted); }

/* socials row */
.social-row { display:flex; gap:10px; margin-top:8px; }
.social-btn { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:8px; background:var(--lash-card); box-shadow:0 6px 18px rgba(20,18,20,0.04); border:1px solid rgba(0,0,0,0.03); color:var(--lash-accent); text-decoration:none; }
.contact-block { margin-top:12px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }

/* contact column inside contact panel */
.contact-column { display:flex; gap:12px; align-items:flex-start; margin-top:12px; flex-wrap:wrap; }
.contact-info { background:var(--lash-card); padding:12px; border-radius:10px; box-shadow:0 8px 24px rgba(20,18,20,0.03); }
.contact-info h4 { margin:0 0 6px 0; font-size:14px; }
.contact-list { display:flex; flex-direction:column; gap:8px; margin-top:6px; }
.qr-wrap { display:flex; gap:12px; align-items:center; }

/* lightbox */
.lightbox { position:fixed; inset:0; z-index:1200; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.7) }
.lightbox img { max-width:92%; max-height:92%; border-radius:10px; }

/* small responsive tweaks */
@media (max-width:720px) {
  .hero { padding:18px; min-height:unset; }
  .avatar{ width:88px; height:88px; }
  .social-row { gap:8px; }
  .contact-column { flex-direction:column; }
}
` }} />

      <div className="lash" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <section className="hero" aria-label="Eyelash hero" style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.98)), url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined }>
            <div className="hero-inner" style={{ display: "flex", gap: 18, alignItems: "center", width: "100%", maxWidth: 860 }}>
              <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
              <div className="meta" style={{ flex: 1 }}>
                <h2 className="name" style={{ margin: 0, fontWeight: 900, fontSize: 20, color: "var(--lash-accent)" }}>{name}</h2>
                <div className="role" style={{ marginTop: 6, color: "var(--lash-muted)", fontWeight: 700 }}>{role}</div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {showFooter ? (
                    <>
                      <button className="primary-btn" onClick={() => router.push("/onboarding/eyelash-tech")}>Use this template</button>
                      <button className="primary-btn" onClick={() => router.push("/templates-preview")} style={{ background: "#fff", color: "var(--lash-accent)", border: "1px solid rgba(0,0,0,0.04)" }}>Back</button>
                    </>
                  ) : (
                    <>
                      <a className="primary-btn" href={telHref} aria-label="Call to book">Book Now</a>
                      {/* only show gift vouchers button if user provided a gift vouchers URL (do not auto-show on profile previews) */}
                      {(giftVouchers || showFooter) ? (
                        <a className="primary-btn" href={giftVouchers || bookingLink || "#"} style={{ background: "#fff", color: "var(--lash-accent)", border: "1px solid rgba(0,0,0,0.04)" }}>
                          {giftVouchers ? "Gift Vouchers" : "Gift Vouchers"}
                        </a>
                      ) : null}
                    </>
                  )}
                </div>

                <nav className="social-row" aria-label="social links" style={{ marginTop: 8 }}>
                  {instagram ? <a className="social-btn" href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="Instagram"><IconInstagram /></a> : null}
                  {tiktok ? <a className="social-btn" href={tiktok.startsWith("http") ? tiktok : `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="TikTok"><IconTiktok /></a> : null}
                  {snapchat ? <a className="social-btn" href={snapchat.startsWith("http") ? snapchat : `https://www.snapchat.com/add/${snapchat.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="Snapchat"><IconSnapchat /></a> : null}
                  {facebook ? <a className="social-btn" href={facebook.startsWith("http") ? facebook : facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><IconFacebook /></a> : null}
                </nav>
              </div>
            </div>
          </section>

          <nav className="tabs" role="tablist" aria-label="Profile tabs" style={{ marginTop: 12 }}>
            <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
            <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
            <button className={`tab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>Portfolio</button>
            <button className={`tab ${tab === "refill" ? "active" : ""}`} onClick={() => setTab("refill")}>Refill & Retention</button>
            <button className={`tab ${tab === "reviews" ? "active" : ""}`} onClick={() => setTab("reviews")}>Reviews</button>
            <button className={`tab ${tab === "location" ? "active" : ""}`} onClick={() => setTab("location")}>Location</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </nav>

          <section className="panels" style={{ marginTop: 12 }}>
            <article id="about" className={`panel ${tab === "about" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>About</h3>
              <p>{about || (showFooter ? "Specialises in lightweight volume sets and natural lifts. Focus on retention and safe application — mobile or in-studio appointments." : "")}</p>
            </article>

            <article id="services" className={`panel ${tab === "services" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Services</h3>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
                {services.length ? services.map((s, i) => <div key={i} style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>{s}</strong></div>) : (showFooter ? (
                  <>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>Classic Full Set</strong><div className="sub" style={{ color: "var(--lash-muted)" }}>from $80 • 90 mins</div></div>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>Volume Full Set</strong><div className="sub" style={{ color: "var(--lash-muted)" }}>from $140 • 120 mins</div></div>
                    <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>Refill (2–3 weeks)</strong><div className="sub" style={{ color: "var(--lash-muted)" }}>$50</div></div>
                  </>
                ) : <div style={{ color: "var(--lash-muted)" }}>No services listed.</div>)}
              </div>
            </article>

            <article id="portfolio" className={`panel ${tab === "portfolio" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Portfolio</h3>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))" }}>
                {portfolio.length ? portfolio.map((p, i) => (
                  <img key={i} src={p} alt={`portfolio-${i}`} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, cursor: "pointer" }} onClick={() => openLightbox(p)} />
                )) : (
                  <>
                    <img src="https://picsum.photos/id/1031/400/300" alt="lash 1" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} />
                    <img src="https://picsum.photos/id/1032/400/300" alt="lash 2" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} />
                    <img src="https://picsum.photos/id/1033/400/300" alt="lash 3" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10 }} />
                  </>
                )}
              </div>
            </article>

            <article id="refill" className={`panel ${tab === "refill" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Refill & Retention</h3>
              {/* show user-provided refill tips only — do not auto-fill on profile preview */}
              {refillTips ? (
                <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
                  <p style={{ margin: 0 }}>{refillTips}</p>
                </div>
              ) : (showFooter ? (
                <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
                  <p style={{ margin: 0 }}>Refill windows: 2–3 weeks recommended. Avoid oil-based products; gentle cleansing preserves adhesion and retention.</p>
                </div>
              ) : <div style={{ color: "var(--lash-muted)" }}>No refill guidance provided.</div>)}
            </article>

            <article id="reviews" className={`panel ${tab === "reviews" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Reviews</h3>
              <div style={{ marginTop: 10 }}>
                <div style={{ background: "#fff", padding: 10, borderRadius: 10, marginBottom: 8 }}>“Soft, natural results and great retention. Mila is amazing!” — C.</div>
                <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>“Professional clean studio and relaxing service.” — L.</div>
              </div>
            </article>

            <article id="location" className={`panel ${tab === "location" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Location</h3>
              {address ? <p style={{ margin: 0, color: "var(--lash-muted)" }}>{address}</p> : (showFooter ? <p style={{ margin: 0, color: "var(--lash-muted)" }}>Studio: 7 Beauty Lane, Uptown</p> : <p style={{ color: "var(--lash-muted)" }}>No location provided.</p>)}
              <div className="map" style={{ marginTop: 12, height: 180, borderRadius: 10, overflow: "hidden" }}>
                <iframe src={mapSrc} style={{ width: "100%", height: "100%", border: 0 }} title="lash studio" />
              </div>
            </article>

            <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Contact</h3>

              <div className="contact-column">
                <div className="contact-info" style={{ minWidth: 220 }}>
                  <h4>Book & Contact</h4>
                  <div className="contact-list">
                    <div><strong>Phone</strong><div><a href={telHref} style={{ color: "var(--lash-text)" }}>{phone}</a></div></div>
                    <div><strong>Online booking</strong><div><a href={bookingLink || "https://example.com/mila"} style={{ color: "var(--lash-accent)" }}>{bookingLink ? bookingLink : "example.com/mila"}</a></div></div>
                    {/* only show Gift vouchers entry when user provided gift_vouchers (hide on profile preview if not provided) */}
                    {(giftVouchers || showFooter) ? (
                      <div><strong>Gift vouchers</strong><div><a href={giftVouchers || "#"} style={{ color: "var(--lash-accent)" }}>{giftVouchers ? "Buy vouchers" : "Buy vouchers"}</a></div></div>
                    ) : null}
                  </div>
                </div>

                <div className="contact-info">
                  <h4>Social</h4>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {instagram ? <a className="social-btn" href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="Instagram"><IconInstagram /></a> : null}
                    {tiktok ? <a className="social-btn" href={tiktok.startsWith("http") ? tiktok : `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="TikTok"><IconTiktok /></a> : null}
                    {snapchat ? <a className="social-btn" href={snapchat.startsWith("http") ? snapchat : `https://www.snapchat.com/add/${snapchat.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="Snapchat"><IconSnapchat /></a> : null}
                    {facebook ? <a className="social-btn" href={facebook.startsWith("http") ? facebook : facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><IconFacebook /></a> : null}
                  </div>
                </div>

                <div className="contact-info qr-wrap" style={{ alignItems: "center" }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData || "https://example.com/mila")}`} alt="QR" style={{ width: 84, height: 84, borderRadius: 10, background: "#fff" }} />
                  <div style={{ color: "var(--lash-muted)", fontSize: 13 }}>
                    Download QR<br/>
                    <a href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData || "https://example.com/mila")}`} download style={{ color: "var(--lash-accent)" }}>Download</a>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            {showFooter ? (
              <>
                <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
                <button className="primary-btn" onClick={() => router.push("/onboarding/eyelash-tech")}>Use this template</button>
              </>
            ) : null}
          </div>
        </main>

        {/* image lightbox */}
        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxSrc(null)}>
            <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}