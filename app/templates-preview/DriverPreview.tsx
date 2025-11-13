"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type DriverData = {
  name?: string;
  role?: string;
  vehicleImage?: string;
  vehicle_image?: string;
  heroImage?: string;
  hero_image?: string;
  stats?: string[] | string;
  services?: string[] | string;
  availability?: string[] | string;
  areas?: string[] | string;
  email?: string;
  phone?: string;
  rates?: string;
  booking_link?: string;
  contact_cards?: string[] | string;
  profile_url?: string;
  extra_fields?: any;
};

export default function DriverPreview({ data, showFooter = true }: { data?: DriverData; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("services");
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
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
    return out as DriverData;
  }, [data]);

  function asArray(val: any): string[] {
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

  const name = merged.name || (showFooter ? "Sam Ryder" : "");
  const role = merged.role || (showFooter ? "Professional Driver — Rides & Transfers" : "");
  const vehicleImage = asString(
    merged.vehicleImage ??
    merged.vehicle_image ??
    merged.extra_fields?.vehicleImage ??
    merged.extra_fields?.vehicle_image ??
    merged.heroImage ??
    merged.hero_image
  );
  const heroImage = asString(
    merged.heroImage ??
    merged.hero_image ??
    merged.extra_fields?.heroImage ??
    merged.extra_fields?.hero_image
  );

  const stats = asArray(merged.stats ?? merged.extra_fields?.stats);
  const statsToShow = stats.length ? stats : (showFooter ? ["4.9★ Rating", "Insured", "Clean vehicle"] : []);

  const services = asArray(merged.services ?? merged.extra_fields?.services);
  const availability = asArray(merged.availability ?? merged.extra_fields?.availability);
  const areas = asArray(merged.areas ?? merged.extra_fields?.areas);

  const email = asString(merged.email ?? merged.extra_fields?.email ?? "");
  const phone = asString(merged.phone ?? merged.extra_fields?.phone ?? "");
  const rates = asString(merged.rates ?? merged.extra_fields?.rates ?? "");
  const bookingLink = asString(merged.booking_link ?? merged.extra_fields?.booking_link ?? merged.profile_url ?? merged.extra_fields?.profile_url ?? "");

  const contactCards = (merged.contact_cards && Array.isArray(merged.contact_cards))
    ? merged.contact_cards.map(String)
    : (merged.extra_fields?.contact_cards && Array.isArray(merged.extra_fields.contact_cards) ? merged.extra_fields.contact_cards.map(String) : []);

  const qrData = asString(merged.profile_url) || clientHref || "";

  // New: Book/Call link should prioritize phone (call) — as requested.
  // If phone exists use tel: link; otherwise fall back to bookingLink or clientHref.
  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (bookingLink || clientHref);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
    /* Driver — transportation-first: clean vehicle hero, availability and book button prominent */
    :root{ --dr-bg:#07121a; --dr-accent:#6be3ff; --dr-muted:#9fb7c2; --dr-text:#e8fbff; }
    body.driver-page{ margin:0; font-family:Inter,system-ui,Arial; background:linear-gradient(180deg,#041018,#07121a); color:var(--dr-text); }
    .wrap{ max-width:980px; margin:14px auto; padding:16px; }
    .hero{ display:flex; gap:12px; align-items:center; padding:14px; border-radius:12px; background:linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.06)); }
    .vehicle{ width:120px; height:80px; background-size:cover; border-radius:8px; box-shadow:0 12px 30px rgba(0,0,0,0.12); }
    .meta{ flex:1 }
    .name{ margin:0; font-weight:900; font-size:20px; color:var(--dr-accent); }
    .role{ margin:6px 0 0; color:var(--dr-muted); font-weight:700 }
    .cta{ display:flex; gap:8px; margin-top:10px }
    .primary-btn{ padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,#bff6ff,var(--dr-accent)); color:#021217; font-weight:900; text-decoration:none }
    .tabs{ margin-top:12px; display:flex; gap:8px; }
    .tab{ padding:8px 12px; border-radius:8px; background:transparent; border:1px solid rgba(255,255,255,0.03); color:var(--dr-muted); cursor:pointer; }
    .tab.active{ background:linear-gradient(90deg,var(--dr-accent), #bff6ff); color:#021217; border:none }
    .panels{ margin-top:12px; }
    .panel{ display:none; color:var(--dr-muted) }
    .panel.active{ display:block; }
    .map{ margin-top:12px; height:160px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.03) }
    .stats{ display:flex; gap:8px; margin-top:8px }
    .stat-pill{ background: rgba(255,255,255,0.02); padding:8px 10px; border-radius:8px; font-weight:800 }
    @media (max-width:720px){ .hero{ flex-direction:column; align-items:flex-start } .vehicle{ width:100%; height:140px } }
    ` }} />

      <div className="driver-page" style={{ minHeight: "100vh" }}>
        <main className="wrap">
          <section className="hero" aria-label="Driver hero" style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.03)), url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
            <div className="vehicle" aria-hidden="true" style={vehicleImage ? { backgroundImage: `url('${vehicleImage}')` } : { backgroundImage: "url('https://picsum.photos/id/1012/800/400')" }} />
            <div className="meta">
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>

              <div className="stats" aria-hidden>
                {statsToShow.map((s: string, i: number) => <div key={i} className="stat-pill">{s}</div>)}
              </div>

              <div className="cta">
                {showFooter ? (
                  <>
                    <button className="primary-btn" onClick={() => router.push("/onboarding/driver")}>Use this template</button>
                    <button className="primary-btn" onClick={() => router.push("/templates-preview") } style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "var(--dr-text)" }}>Back</button>
                  </>
                ) : (
                  <>
                    {/* Book Now must call the phone number */}
                    <a className="primary-btn" href={callHref} aria-label="Call driver">Book Now</a>
                    <a className="primary-btn" href={bookingLink ? bookingLink : `tel:${phone.replace(/\s+/g,"")}`} aria-label="Request Quote" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "var(--dr-text)" }}>Request Quote</a>
                  </>
                )}
              </div>
            </div>
          </section>

          <nav className="tabs" role="tablist" style={{ marginTop: 12 }}>
            <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
            <button className={`tab ${tab === "availability" ? "active" : ""}`} onClick={() => setTab("availability")}>Availability</button>
            <button className={`tab ${tab === "areas" ? "active" : ""}`} onClick={() => setTab("areas")}>Service Areas</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </nav>

          <section className="panels">
            <article id="services" className={`panel ${tab === "services" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Services</h3>
              {services.length ? <p style={{ margin: 0, color: "var(--dr-muted)" }}>{services.join(", ")}</p> : <p style={{ margin: 0, color: "var(--dr-muted)" }}>{showFooter ? "Airport transfer, hourly hire, courier & delivery." : "No services listed."}</p>}
            </article>

            <article id="availability" className={`panel ${tab === "availability" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Availability</h3>
              {availability.length ? <div style={{ color: "var(--dr-muted)" }}>{availability.join(" · ")}</div> : <p style={{ margin: 0, color: "var(--dr-muted)" }}>{showFooter ? "24/7 — Night & weekend coverage." : "No availability set."}</p>}
            </article>

            <article id="areas" className={`panel ${tab === "areas" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Service Areas</h3>
              {areas.length ? (
                <ul style={{ margin: 0, color: "var(--dr-muted)" }}>{areas.map((a, i) => <li key={i}>{a}</li>)}</ul>
              ) : (
                <div className="map" aria-hidden="true">
                  <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.50%2C-0.11%2C51.51&amp;layer=mapnik" style={{ width: "100%", height: "100%", border: 0 }} title="areas" />
                </div>
              )}
            </article>

            <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`}>
              <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
              <div style={{ marginTop: 0, color: "var(--dr-muted)" }}>
                {email ? <div>Email: <a href={`mailto:${email}`} style={{ color: "var(--dr-text)" }}>{email}</a></div> : null}
                {phone ? <div style={{ marginTop: 8 }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`} style={{ color: "var(--dr-text)" }}>{phone}</a></div> : null}
                {rates ? <div style={{ marginTop: 8 }}>Rates: <span style={{ color: "var(--dr-muted)" }}>{rates}</span></div> : null}
                {contactCards.length ? (
                  <div style={{ marginTop: 12 }}>
                    {contactCards.map((c: string, i: number) => <div key={i} className="card" style={{ padding: 10, marginTop: 8 }}>{c}</div>)}
                  </div>
                ) : null}
                <div style={{ marginTop: 12 }}>
                  {/* Ensure Book Now in contact also triggers a call */}
                  <a className="primary-btn" href={callHref}>Book Now</a>
                </div>
              </div>
            </article>
          </section>

          <div style={{ height: 18 }} />
        </main>
      </div>

      {/* lightbox for map/gallery could be added here in future */}
    </>
  );
}