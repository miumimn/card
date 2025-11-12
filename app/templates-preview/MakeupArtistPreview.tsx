"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type MakeupArtistData = {
  name?: string;
  title?: string;
  about?: string;
  services?: string[] | string;
  reviews?: string[] | string;
  portfolio?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  booking_link?: string;
  profile_url?: string;
  extra_fields?: any;
};

export default function MakeupArtistPreview({
  data,
  showFooter = true,
}: {
  data?: MakeupArtistData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"portfolio" | "services" | "reviews" | "contact">("portfolio");
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
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map((p) => p.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  };

  const parseImageField = (val: any) => parseList(val);

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
    return out as MakeupArtistData;
  }, [data]);

  const name = merged.name ? String(merged.name) : (showFooter ? "Marigold Beauty" : "");
  const title = merged.title ? String(merged.title) : (showFooter ? "Bridal & Editorial Makeup Artist" : "");
  const about = merged.about ? String(merged.about) : (showFooter ? "Specialising in bridal, editorial and special events — glowing, long-lasting looks." : "");

  const services = parseList(merged.services ?? merged.service_list ?? merged.offerings);
  const reviews = parseList(merged.reviews ?? merged.testimonials);

  const portfolioRaw = parseImageField(merged.portfolio ?? merged.gallery ?? merged.images ?? merged.extra_fields?.portfolio);

  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage);
  const heroCandidates = parseImageField(merged.heroImage ?? merged.hero_image ?? merged.banner);

  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  // If user uploaded portfolio images but didn't add structured items, map them to simple portfolio objects
  const portfolio = useMemo(() => {
    const p = portfolioRaw.slice(0, 12).map((u) => String(u));
    if (p.length) return p;
    // placeholders only when template preview
    if (showFooter) {
      return [
        "https://picsum.photos/seed/m1/800/600",
        "https://picsum.photos/seed/m2/800/600",
        "https://picsum.photos/seed/m3/800/600",
      ];
    }
    return [];
  }, [portfolioRaw, showFooter]);

  // placeholders
  if (showFooter) {
    if (!avatar) avatar = "https://picsum.photos/seed/makeup-avatar/400/400";
    if (!heroImage) heroImage = "https://picsum.photos/seed/makeup-hero/1400/420";
    if (!services.length) services.push("Bridal Makeup", "Editorial Makeup", "Makeup Lessons");
    if (!reviews.length) reviews.push("“Gorgeous, long-lasting finish — 10/10” — S.");
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const instagramRaw = merged.instagram ?? merged.extra_fields?.instagram ?? "";
  const instagram = Array.isArray(instagramRaw) ? String(instagramRaw[0]).trim() : String(instagramRaw ?? "").trim();
  const tiktokRaw = merged.tiktok ?? merged.extra_fields?.tiktok ?? "";
  const tiktok = Array.isArray(tiktokRaw) ? String(tiktokRaw[0]).trim() : String(tiktokRaw ?? "").trim();
  const whatsappRaw = merged.whatsapp ?? merged.extra_fields?.whatsapp ?? "";
  const whatsapp = Array.isArray(whatsappRaw) ? String(whatsappRaw[0]).trim() : String(whatsappRaw ?? "").trim();
  const booking = merged.booking_link ? String(merged.booking_link) : "";
  const profileUrl = merged.profile_url ? String(merged.profile_url) : "";

  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (booking || clientHref));

  useEffect(() => {
    // initial tab prefers portfolio when content exists
    if (portfolio.length) setTab("portfolio");
    else if (services.length) setTab("services");
    else if (reviews.length) setTab("reviews");
    else setTab("contact");
  }, [portfolio.length, services.length, reviews.length]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        :root{
          --mu-bg:#fff7f8;
          --mu-accent:#ff6b9a;
          --mu-muted:#6b6b72;
          --mu-text:#1b1420;
        }
        .mu-wrap{ max-width:980px; margin:16px auto; padding:18px; font-family:Inter,system-ui,Arial; color:var(--mu-text); background:var(--mu-bg); }
        .hero{ display:flex; gap:12px; align-items:center; padding:14px; border-radius:12px; background:linear-gradient(90deg, rgba(255,107,154,0.04), rgba(0,0,0,0.02)); }
        .mu-avatar{ width:96px; height:96px; border-radius:12px; background-size:cover; background-position:center; border:4px solid #fff; box-shadow:0 8px 24px rgba(0,0,0,0.06); }
        .meta{ display:flex; flex-direction:column; gap:6px; }
        .name{ margin:0; font-weight:900; font-size:20px; }
        .sub{ color:var(--mu-muted); font-weight:700; }
        .actions{ display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
        .btn{ padding:10px 14px; border-radius:10px; font-weight:800; border:none; cursor:pointer; }
        .btn-primary{ background:linear-gradient(90deg,var(--mu-accent),#ff9fb6); color:#fff; }
        .tabs{ display:flex; gap:8px; margin-top:14px; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(0,0,0,0.04); color:var(--mu-muted); font-weight:800; cursor:pointer; white-space:nowrap; }
        .tab.active{ background:linear-gradient(90deg,var(--mu-accent), rgba(255,107,154,0.08)); color:#071019; border:none; box-shadow:0 10px 28px rgba(255,107,154,0.06); transform:translateY(-2px); }
        .panel{ display:none; margin-top:12px; color:var(--mu-muted); line-height:1.6; }
        .panel.active{ display:block; }
        .gallery{ display:grid; gap:8px; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); margin-top:10px; }
        .gallery img{ width:100%; border-radius:8px; object-fit:cover; cursor:pointer; }
        @media(min-width:720px){ .hero{ align-items:center; } }
      `}</style>

      <div className="mu-wrap">
        <section className="hero" style={heroImage ? { backgroundImage: `url('${heroImage}')`, backgroundSize: '140% auto', backgroundPosition: 'center' } : undefined}>
          <div className="mu-avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="sub">{title}</div>
            <p style={{ margin: 0, marginTop: 6, color: "var(--mu-muted)" }}>{about}</p>
            <div className="actions">
              {email ? <a className="btn btn-primary" href={`mailto:${email}`}>Email</a> : null}
              {phone ? <a className="btn" href={`tel:${phone.replace(/\s+/g, "")}`}>Call</a> : null}
              {booking ? <a className="btn" href={booking} target="_blank" rel="noreferrer">Book</a> : null}
              {showFooter ? <button className="btn" onClick={() => router.push("/onboarding/makeup-artist")} style={{ border: "1px solid rgba(0,0,0,0.04)" }}>Use this template</button> : null}
            </div>
          </div>
        </section>

        <nav className="tabs" role="tablist" aria-label="makeup tabs">
          <button className={`tab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>Portfolio</button>
          <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
          <button className={`tab ${tab === "reviews" ? "active" : ""}`} onClick={() => setTab("reviews")}>Reviews</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
        </nav>

        <section className="panels">
          <article id="portfolio" className={`panel ${tab === "portfolio" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Portfolio</h3>
            <div className="gallery">
              {portfolio.map((src, i) => (
                <img key={i} src={src} alt={`look ${i+1}`} onClick={() => openLightbox(src)} />
              ))}
              {portfolio.length === 0 && showFooter ? (
                <>
                  <img src="https://picsum.photos/seed/m1/800/600" alt="sample 1" />
                  <img src="https://picsum.photos/seed/m2/800/600" alt="sample 2" />
                  <img src="https://picsum.photos/seed/m3/800/600" alt="sample 3" />
                </>
              ) : null}
            </div>
          </article>

          <article id="services" className={`panel ${tab === "services" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Services</h3>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", marginTop: 8 }}>
              {services.length ? services.map((s, i) => <div key={i} style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>{s}</strong></div>) : (showFooter ? <>
                <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>Bridal Makeup</strong><div className="sub">On-site & trials</div></div>
                <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>Editorial</strong><div className="sub">High-fashion & shoots</div></div>
                <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}><strong>Lessons</strong><div className="sub">Private & group</div></div>
              </> : null)}
            </div>
          </article>

          <article id="reviews" className={`panel ${tab === "reviews" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Reviews</h3>
            <div style={{ marginTop: 8 }}>
              {reviews.length ? reviews.map((r, i) => <div key={i} style={{ background: "#fff", padding: 10, borderRadius: 10, marginBottom: 8 }}>{r}</div>) : (showFooter ? <div style={{ background: "#fff", padding: 10, borderRadius: 10 }}>“Gorgeous, long‑lasting finish — 10/10” — S.</div> : null)}
            </div>
          </article>

          <article id="contact" className={`panel ${tab === "contact" ? "active" : ""}`} role="tabpanel">
            <h3 style={{ marginTop: 0 }}>Contact</h3>
            <div style={{ color: "var(--mu-muted)" }}>
              {email ? <div>Email: <a href={`mailto:${email}`}>{email}</a></div> : null}
              {phone ? <div style={{ marginTop: 8 }}>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></div> : null}
              <div style={{ marginTop: 8 }}>
                {instagram ? <a href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>IG</a> : null}
                {tiktok ? <a href={tiktok.startsWith("http") ? tiktok : `https://www.tiktok.com/@${tiktok.replace(/^@/, "")}`} target="_blank" rel="noreferrer">TikTok</a> : null}
              </div>
              <div style={{ marginTop: 12 }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR" style={{ width: 84, height: 84, borderRadius: 8 }} />
              </div>
            </div>
          </article>
        </section>

        {lightbox ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)", zIndex: 1400 }}>
            <img src={lightbox} alt="full" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}