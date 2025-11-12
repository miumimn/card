"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DoctorData = {
  name?: string;
  role?: string;
  about?: string;
  specialties?: string[] | string;
  services?: string[] | string;
  gallery?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  address?: string;
  booking_link?: string;
  profile_url?: string;
  contact_cards?: string[] | string;
  agent?: string;
  extra_fields?: any;
};

export default function DoctorPreview({ data, showFooter = true }: { data?: DoctorData; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "services" | "gallery" | "contact">("overview");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
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
      if (e.key === "Escape") {
        setLightboxSrc(null);
        setShowBooking(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
    return out as DoctorData;
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
      if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }
  function asString(val: any): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val.trim();
    if (Array.isArray(val) && val.length) return String(val[0]).trim();
    if (typeof val === "object") {
      const candidates = ["url", "href", "value", "link"];
      for (const k of candidates) if ((val as any)[k]) return String((val as any)[k]).trim();
      try { return JSON.stringify(val); } catch { return ""; }
    }
    return String(val).trim();
  }

  // Primary fields (no template autofill on profile previews)
  const name = merged.name || (showFooter ? "Dr. Priya Singh" : "");
  const role = merged.role || (showFooter ? "General Practitioner • Family Medicine" : "");
  const about = asString(merged.about || merged.extra_fields?.about);
  const specialties = asArray(merged.specialties ?? merged.extra_fields?.specialties ?? []);
  const services = asArray(merged.services ?? merged.extra_fields?.services ?? []);
  const gallery = asArray(merged.gallery ?? merged.extra_fields?.gallery ?? []).slice(0, 3);

  const avatar = asString(merged.avatar ?? merged.extra_fields?.avatar);
  const heroImage = asString(merged.heroImage ?? merged.extra_fields?.heroImage);

  const email = asString(merged.email ?? merged.extra_fields?.email ?? "");
  const phone = asString(merged.phone ?? merged.extra_fields?.phone ?? "");
  const address = asString(merged.address ?? merged.extra_fields?.address ?? "");
  const bookingLink = asString(merged.booking_link ?? merged.extra_fields?.booking_link ?? merged.profile_url ?? merged.extra_fields?.profile_url ?? "");

  const contactCards = (merged.contact_cards && Array.isArray(merged.contact_cards))
    ? merged.contact_cards.map(String)
    : (merged.extra_fields?.contact_cards && Array.isArray(merged.extra_fields.contact_cards) ? merged.extra_fields.contact_cards.map(String) : []);

  // Agent handling: don't auto-fill agent on profile previews
  const agent = asString(merged.agent ?? merged.extra_fields?.agent) || (showFooter ? "Lumen Talent" : "");

  const qrData = asString(merged.profile_url) || clientHref || "";

  const openLightbox = (src?: string | null) => {
    if (!src) return;
    setLightboxSrc(src);
  };

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{
  --doc-adv-bg: #f6fbff;
  --doc-adv-card: #ffffff;
  --doc-adv-accent: #2b6cb0;
  --doc-adv-muted: #6b7280;
  --doc-adv-text: #0f172a;
  --doc-adv-surface: #ffffff;
}
body.doctor-advanced { margin:0; font-family:Inter,system-ui,Arial; background:var(--doc-adv-bg); color:var(--doc-adv-text); -webkit-font-smoothing:antialiased; }
.doctor-wrap { max-width:1100px; margin:20px auto; padding:16px; display:grid; grid-template-columns: 1fr 320px; gap:20px; align-items:start; }
@media (max-width:980px) { .doctor-wrap { grid-template-columns: 1fr; } .hero { flex-direction:column; align-items:flex-start } }
.hero { background:linear-gradient(90deg, rgba(43,108,176,0.04), rgba(96,165,250,0.02)); padding:18px; border-radius:12px; display:flex; gap:16px; align-items:center; }
.avatar { width:104px; height:104px; border-radius:12px; background-size:cover; background-position:center; box-shadow: 0 8px 24px rgba(2,6,23,0.06); flex:0 0 104px; }
.meta { flex:1 }
.name { margin:0; font-size:20px; font-weight:900 }
.role { margin-top:6px; color:var(--doc-adv-muted); font-weight:700 }
.specialties { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap }
.chip { padding:6px 10px; border-radius:999px; background:rgba(43,108,176,0.08); color:var(--doc-adv-text); font-weight:700; font-size:13px; }

.hero-cta { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap }
.btn { padding:10px 14px; border-radius:10px; font-weight:800; cursor:pointer; border:none }
.btn-primary { background:linear-gradient(90deg,var(--doc-adv-accent),#60a5fa); color:#fff }
.btn-ghost { background:transparent; border:1px solid rgba(2,6,23,0.06); color:var(--doc-adv-accent) }

.card { background:var(--doc-adv-card); border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(2,6,23,0.04); }
.tabs { display:flex; gap:8px; margin-top:14px; border-bottom:1px solid rgba(2,6,23,0.04); padding-bottom:8px }
.tab { padding:8px 12px; border-radius:8px; background:transparent; color:var(--doc-adv-muted); cursor:pointer; font-weight:700; }
.tab.active { color:#fff; background:linear-gradient(90deg,var(--doc-adv-accent),#60a5fa) }

.section { margin-top:12px }
.services-list { display:grid; gap:10px; margin-top:12px }
.service { display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:10px; border:1px solid rgba(2,6,23,0.04); background:var(--doc-adv-surface) }

.gallery { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px }
.gallery img { width:100%; height:88px; object-fit:cover; border-radius:8px; cursor:pointer }

.side { position:sticky; top:20px; align-self:start; display:flex; flex-direction:column; gap:12px }
.contact-card { padding:16px; border-radius:12px; background:var(--doc-adv-card); box-shadow:0 10px 30px rgba(2,6,23,0.04) }

.lightbox { position:fixed; inset:0; z-index:1200; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.7) }
.lightbox img { max-width:92%; max-height:92%; border-radius:8px }
` }} />

      <div className="doctor-advanced">
        <div className="doctor-wrap">
          <main>
            <header className="hero">
              <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden />
              <div className="meta">
                <h1 className="name">{name}</h1>
                <div className="role">{role}</div>

                <div className="specialties" aria-hidden={specialties.length === 0 ? "true" : "false"}>
                  {specialties.map((s, i) => <div key={i} className="chip">{s}</div>)}
                </div>

                <div className="hero-cta">
                  {showFooter ? (
                    <>
                      <button className="btn btn-primary" onClick={() => router.push("/onboarding/doctor")}>Use this template</button>
                      <button className="btn btn-ghost" onClick={() => router.push("/templates-preview")}>Back</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={() => (window.location.href = bookingLink || clientHref)}>Book / Listen</button>
                      <button className="btn btn-ghost" onClick={() => (window.location.href = `tel:${phone.replace(/\s+/g, "")}`)}>Call</button>
                    </>
                  )}
                </div>

                <div className="tabs" role="tablist" aria-label="Doctor tabs">
                  <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
                  <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
                  <button className={`tab ${tab === "gallery" ? "active" : ""}`} onClick={() => setTab("gallery")}>Gallery</button>
                  <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
                </div>
              </div>
            </header>

            <section className="card section">
              {tab === "overview" && (
                <>
                  <h3 style={{ marginTop: 0 }}>About</h3>
                  {about ? <p style={{ color: "var(--doc-adv-muted)" }}>{about}</p> : (showFooter ? <p style={{ color: "var(--doc-adv-muted)" }}>Experienced clinician focused on patient-centered care and preventive medicine.</p> : null)}
                </>
              )}

              {tab === "services" && (
                <>
                  <h3 style={{ marginTop: 0 }}>Services</h3>
                  {services.length ? (
                    <div className="services-list">
                      {services.map((s, i) => (
                        <div key={i} className="service">
                          <div>{s}</div>
                          <div>
                            <button className="btn btn-primary" onClick={() => setShowBooking(true)}>Book</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (showFooter ? <div style={{ color: "var(--doc-adv-muted)" }}>Add services in onboarding (one per line)</div> : <div style={{ color: "var(--doc-adv-muted)" }}>No services listed.</div>)}
                </>
              )}

              {tab === "gallery" && (
                <>
                  <h3 style={{ marginTop: 0 }}>Gallery</h3>
                  {gallery.length ? (
                    <div className="gallery">
                      {gallery.map((src, i) => <img key={i} src={src} alt={`gallery-${i}`} onClick={() => openLightbox(src)} />)}
                    </div>
                  ) : (showFooter ? (
                    <div className="gallery">
                      <img src="https://images.unsplash.com/photo-1519494080410-f9aa8f52f178?w=800&q=80&auto=format&fit=crop" alt="clinic" />
                      <img src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=80&auto=format&fit=crop" alt="clinic" />
                      <img src="https://images.unsplash.com/photo-1582719478250-3a7b9a45f3ad?w=800&q=80&auto=format&fit=crop" alt="clinic" />
                    </div>
                  ) : <div style={{ color: "var(--doc-adv-muted)" }}>No images uploaded.</div>)}
                </>
              )}

              {tab === "contact" && (
                <>
                  <h3 style={{ marginTop: 0 }}>Contact</h3>
                  <div style={{ color: "var(--doc-adv-muted)" }}>
                    {email ? <div>Email: <a href={`mailto:${email}`}>{email}</a></div> : null}
                    {phone ? <div style={{ marginTop: 8 }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></div> : null}
                    {address ? <div style={{ marginTop: 8 }}>Address: <div style={{ color: "var(--doc-adv-muted)" }}>{address}</div></div> : null}
                    {agent ? <div style={{ marginTop: 8 }}><strong>Agent:</strong> <span style={{ color: "var(--doc-adv-muted)" }}>{agent}</span></div> : null}
                    {contactCards.length ? (
                      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                        {contactCards.map((c: string, i: number) => <div key={i} className="card" style={{ padding: 10 }}>{c}</div>)}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </section>
          </main>

          <aside className="side" aria-label="Booking card">
            <div className="contact-card card">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 8, backgroundImage: avatar ? `url('${avatar}')` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div>
                  <div style={{ fontWeight: 800 }}>{name}</div>
                  <div style={{ color: "var(--doc-adv-muted)" }}>{role}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setShowBooking(true)}>Book Appointment</button>
                <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => (window.location.href = `tel:${phone.replace(/\s+/g, "")}`)}>Call</button>
              </div>

              <div style={{ marginTop: 12, color: "var(--doc-adv-muted)" }}>
                {address ? <div><strong>Address</strong><div>{address}</div></div> : null}
                <div style={{ marginTop: 8 }}><strong>Profile</strong><div><a href={qrData} target="_blank" rel="noreferrer">{qrData}</a></div></div>
              </div>
            </div>
          </aside>
        </div>

        {/* booking modal */}
        {showBooking ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setShowBooking(false)}>
            <div className="card" style={{ width: 520, maxWidth: "92%", padding: 18 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Book an appointment</h3>
                <button onClick={() => setShowBooking(false)} style={{ border: "none", background: "transparent", fontWeight: 800 }}>✕</button>
              </div>

              <p style={{ color: "var(--doc-adv-muted)" }}>You will be redirected to the booking page.</p>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setShowBooking(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={() => { if (bookingLink) window.open(bookingLink, "_blank"); else setShowBooking(false); }} className="btn btn-primary">Continue to booking</button>
              </div>
            </div>
          </div>
        ) : null}

        {/* lightbox for gallery */}
        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightboxSrc(null)}>
            <img src={lightboxSrc} alt="Full size" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}