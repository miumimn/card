"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type RealtorData = {
  name?: string;
  role?: string;
  about?: string;
  avatar?: string | string[];
  hero_image?: string;
  socials?: {
    facebook?: string;
    whatsapp?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  phone?: string;
  email?: string;
  listings?: { image?: string; title?: string; subtitle?: string; price?: string }[] | string;
  booking_contact?: string;
  profile_url?: string;
  extra_fields?: any;
};

export default function RealtorPreview({ data, showFooter = true }: { data?: RealtorData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "listings" | "contact">("about");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(typeof window !== "undefined" ? window.location.href || "" : ""); } catch { setClientHref(""); }
  }, []);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
      } catch {}
    }
    return out as RealtorData;
  }, [data]);

  const name = merged.name ?? (showFooter ? "Morgan Smith" : "");
  const role = merged.role ?? (showFooter ? "Licensed Realtor — Metro Area" : "");
  const about = merged.about ?? (showFooter ? "Helping clients find their dream home — residential sales, luxury listings and portfolio advisory." : "");
  const avatar = Array.isArray(merged.avatar) ? merged.avatar[0] : (merged.avatar ?? (showFooter ? "https://picsum.photos/id/1005/400/400" : ""));
  const hero = merged.hero_image ?? (showFooter ? "https://picsum.photos/id/1018/1600/900" : "");
  const socials = merged.socials ?? {};
  const phone = merged.phone ?? (showFooter ? "+1 (234) 567-890" : "");
  const email = merged.email ?? (showFooter ? "hello@realtor.example" : "");
  const bookingRaw = (merged.booking_contact ?? merged.profile_url ?? "").toString().trim();

  const rawListings = merged.listings ?? merged.extra_fields?.listings ?? [];
  const listings = useMemo(() => {
    if (!rawListings) return [];
    if (Array.isArray(rawListings)) {
      return rawListings
        .map((l:any) => {
          if (!l) return null;
          if (typeof l === "string") {
            const parts = l.split("•").map((p:any) => String(p).trim()).filter(Boolean);
            return { title: parts[0] || "", price: parts[1] || "", subtitle: parts[2] || "", image: "" };
          }
          return {
            title: (l.title ?? l.name ?? "") as string,
            price: (l.price ?? l.amount ?? "") as string,
            subtitle: (l.subtitle ?? l.location ?? "") as string,
            image: (l.image ?? l.photo ?? "") as string
          };
        })
        .filter(Boolean)
        .filter((it:any) => (it.title && String(it.title).trim()) || (it.price && String(it.price).trim()) || (it.subtitle && String(it.subtitle).trim()) || (it.image && String(it.image).trim()));
    }
    if (typeof rawListings === "string") {
      try {
        const parsed = JSON.parse(rawListings);
        if (Array.isArray(parsed)) {
          return parsed
            .map((l:any) => (typeof l === "string" ? { title: l } : l))
            .map((l:any) => ({ title: l.title ?? "", price: l.price ?? "", subtitle: l.subtitle ?? "", image: l.image ?? "" }))
            .filter((it:any) => (it.title && String(it.title).trim()) || (it.price && String(it.price).trim()) || (it.subtitle && String(it.subtitle).trim()) || (it.image && String(it.image).trim()));
        }
      } catch {
        const lines = rawListings.split("\n").map((s:string) => s.trim()).filter(Boolean);
        return lines
          .map((ln:string) => {
            const parts = ln.split("•").map(p => p.trim());
            return { title: parts[0] || "", price: parts[1] || "", subtitle: parts[2] || "", image: "" };
          })
          .filter((it:any) => (it.title && String(it.title).trim()) || (it.price && String(it.price).trim()) || (it.subtitle && String(it.subtitle).trim()) || (it.image && String(it.image).trim()));
      }
    }
    return [];
  }, [JSON.stringify(rawListings)]);

  const isPhoneLike = (v: string) => {
    if (!v) return false;
    if (v.startsWith("tel:")) return true;
    const cleaned = v.replace(/[()\s.-]/g, "");
    return /^(\+?\d{6,})$/.test(cleaned);
  };
  const bookingHref = (() => {
    if (!bookingRaw) return "";
    if (bookingRaw.startsWith("tel:")) return bookingRaw;
    if (isPhoneLike(bookingRaw)) {
      const cleaned = bookingRaw.replace(/[()\s.-]/g, "");
      return `tel:${cleaned.startsWith("+") ? cleaned : cleaned}`;
    }
    if (/^https?:\/\//.test(bookingRaw)) return bookingRaw;
    return `https://${bookingRaw}`;
  })();

  const qrData = (() => {
    const p = (merged.profile_url ?? "").toString().trim();
    if (p && /^https?:\/\//i.test(p)) return p;
    const ch = clientHref ?? "";
    if (!ch) return "";
    if (ch.includes("/null") || ch.endsWith("/null")) return "";
    return ch;
  })();

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <div className="realtor-wrap" style={{ minHeight: "100vh" }}>
        <section className="hero" aria-label="Featured property" style={{ position: "relative", borderRadius: 20, overflow: "visible", marginBottom: 20 }}>
          <svg className="decor" viewBox="0 0 64 64" aria-hidden="true" style={{ position: "absolute", left: 12, top: 18, width: 84, height: 84, opacity: 0.14, filter: "grayscale(1) contrast(.9)", pointerEvents: "none" }}>
            <path d="M6 58V6h12v52H6zm16 0V20h10v38H22zm12 0V12h8v46h-8zm12 0V28h8v30h-8z" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2"/>
          </svg>
          <img className="hero-img" src={hero} alt="Featured house" style={{ width: "100%", height: "44vw", maxHeight: 420, minHeight: 240, borderRadius: 20, objectFit: "cover", display: "block", boxShadow: "0 22px 48px rgba(2,6,23,0.6)" }} />
        </section>

        <div className="agent-card" role="region" aria-label="Agent" style={{ position: "relative", marginTop: -56, display: "flex", alignItems: "center", gap: 16, background: "linear-gradient(180deg, rgba(10,12,14,0.9), rgba(8,10,12,0.9))", borderRadius: 14, padding: "18px 18px 18px 22px", boxShadow: "0 18px 40px rgba(2,6,23,0.55)", border: "1px solid rgba(255,255,255,0.03)" }}>
          <div className="agent-meta" style={{ flex: 1 }}>
            <div className="agent-name" style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: 0.2 }}>{name}</div>
            <div className="agent-role" style={{ marginTop: 4, color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>{role}</div>
            <div className="intro" style={{ marginTop: 8 }}>{about}</div>

            <div className="social-row-hero" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.02)", justifyContent: "flex-start", color: "var(--muted)" }}>
              {/* social icons omitted for brevity (unchanged) */}
            </div>
          </div>

          <div className="agent-avatar" style={{ width: 86, height: 86, borderRadius: 999, overflow: "hidden", border: "6px solid rgba(255,255,255,0.95)", boxShadow: "0 10px 30px rgba(2,6,23,0.48)", backgroundSize: "cover", backgroundPosition: "center", flex: "0 0 86px", transform: "translateY(-8px)", backgroundImage: `url('${avatar}')` }} aria-hidden="true" />
        </div>

        <div className="tabs-wrap" style={{ marginTop: 18 }}>
          <div className="tabs" role="tablist" aria-label="Profile tabs" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")} data-tab="about">About</button>
            <button className={`tab ${tab === "listings" ? "active" : ""}`} onClick={() => setTab("listings")} data-tab="listings">Listings</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")} data-tab="contact">Contact</button>
          </div>

          <div className="panels" style={{ marginTop: 12 }}>
            <div id="about" className={`panel ${tab === "about" ? "active" : ""}`} role="tabpanel" style={{ display: tab === "about" ? "block" : "none", color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
              <h3 style={{ margin: "0 0 8px" }}>About</h3>
              <p className="intro">{about}</p>
            </div>

            <div id="listings" className={`panel ${tab === "listings" ? "active" : ""}`} role="tabpanel" style={{ display: tab === "listings" ? "block" : "none", color: "var(--muted)" }}>
              <h3 style={{ margin: "0 0 8px" }}>Highlighted Listings</h3>
              <div className="listings-grid" aria-live="polite" style={{ marginTop: 8, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                {listings.length ? listings.map((l:any, idx:number) => (
                  <article key={idx} className="listing-card" style={{ borderRadius: 12, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.02)" }}>
                    {l.image && String(l.image).trim() ? <img src={l.image} alt={l.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} /> : null}
                    <div className="meta" style={{ padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                        <div className="listing-title" style={{ fontWeight: 800, fontSize: 16 }}>{l.title}</div>
                        {l.price ? <div className="listing-price" style={{ fontWeight: 800, color: "var(--accent)" }}>{l.price}</div> : null}
                      </div>
                      {l.subtitle ? <div className="listing-sub" style={{ color: "var(--muted)", marginTop: 6 }}>{l.subtitle}</div> : null}
                    </div>
                  </article>
                )) : null}
              </div>
            </div>

            <div id="contact" className={`panel ${tab === "contact" ? "active" : ""}`} role="tabpanel" style={{ display: tab === "contact" ? "block" : "none" }}>
              <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
              <div style={{ color: "var(--muted)" }}>
                <p className="intro">Phone: {phone ? <a href={`tel:${phone}`} style={{ color: "var(--text)" }}>{phone}</a> : "—"}</p>
                <p className="intro">Email: {email ? <a href={`mailto:${email}`} style={{ color: "var(--text)" }}>{email}</a> : "—"}</p>
                <div className="contact-cta" style={{ marginTop: 8 }}>
                  {bookingHref ? <button className="primary-btn" onClick={() => { window.location.href = bookingHref; }} aria-label="Schedule a tour">Schedule a Tour</button> : (showFooter ? <button className="primary-btn" onClick={() => router.push("/onboarding/realtor")} aria-label="Schedule a tour">Schedule a Tour</button> : null)}
                </div>
                {qrData ? <div style={{ marginTop: 12 }}><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`} alt="QR code" style={{ width: 120, height: 120, borderRadius: 10, background: "white", padding: 8 }} /><small style={{ display: "block", marginTop: 8, color: "var(--muted)" }}>Scan to view my profile</small></div> : null}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="tab" onClick={() => router.push("/preview")} style={{ padding: "8px 12px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.06)" }}>Back</button>
          {showFooter ? <button className="tab active" onClick={() => router.push("/onboarding/realtor")} style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(90deg,var(--accent), #b08bff)", color: "#fff" }}>Use this template</button> : null}
        </div>
      </div>

      {lightbox ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)", zIndex: 1400 }}>
          <img src={lightbox} alt="full" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </>
  );
}