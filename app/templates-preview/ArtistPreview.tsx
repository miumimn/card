"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SvgIcon from "@/components/Icon";

/**
 * ArtistPreview
 *
 * - Restored the previous two-strip approach:
 *   - Desktop inline social-row (visible on wider screens) with horizontal scrolling and thin scrollbar.
 *   - Mobile socials-mobile strip (visible on small screens) with auto-scroll to end and touch scrolling.
 * - Removed the single unified strip I previously added.
 * - Kept avatar/profile, share button, tabs, shop, lightbox and productContactLink.
 *
 * This file replaces the previous version — drop it into app/templates-preview/ArtistPreview.tsx.
 */

export default function ArtistPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("works");
  const [lightboxState, setLightboxState] = useState<{ kind: "works" | "shop"; index: number } | null>(null);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields) : data.extra_fields;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => {
            if (out[k] === undefined) out[k] = v;
          });
        }
      } catch {}
    }
    return out;
  }, [data]);

  function parseImageField(value: any): string[] {
    if (!value && value !== "") return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === "object" && value !== null) {
      try {
        // if object is upload shape, try to read common props
        const candidate = (value as any).url || (value as any).src || (value as any).path || (value as any).secure_url || (value as any).publicURL || (value as any).public_url || "";
        return candidate ? [String(candidate)] : [];
      } catch {
        return [];
      }
    }
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return [];
      try {
        const p = JSON.parse(s);
        if (Array.isArray(p)) return p.map(String).filter(Boolean);
        if (typeof p === "object" && p !== null) {
          const c = (p as any).url || (p as any).src || "";
          if (c) return [String(c)];
        }
      } catch {}
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }

  // basic profile fields
  const name = merged.name ? String(merged.name) : showFooter ? "Maya K." : "";
  const role = merged.tagline ? String(merged.tagline) : merged.role ? String(merged.role) : showFooter ? "Visual Artist — Mixed Media" : "";
  const bio = merged.bio ? String(merged.bio) : showFooter ? "Layered textural pieces exploring memory and place. Commissions, prints and gallery collaborations available." : "";

  const profileImages = parseImageField(merged.profileImage ?? merged.profile_image ?? merged.avatar ?? merged.avatar_url);
  const avatar = profileImages.length ? profileImages[0] : (showFooter ? "https://picsum.photos/id/1019/400/400" : "");

  // works / portfolio
  const portfolioImages = parseImageField(merged.portfolioImages ?? merged.portfolio_images ?? merged.gallery ?? merged.gallery_images);
  const worksField = parseImageField(merged.works ?? merged.images ?? merged.work_images ?? merged.works_urls);
  const works = portfolioImages.length ? portfolioImages : worksField;
  const placeholderWorks = [
    "https://picsum.photos/seed/a1/800/600",
    "https://picsum.photos/seed/a2/800/600",
    "https://picsum.photos/seed/a3/800/600",
    "https://picsum.photos/seed/a4/800/600",
    "https://picsum.photos/seed/a5/800/600",
    "https://picsum.photos/seed/a6/800/600",
  ];
  const worksToShow = works.length ? works : (showFooter ? placeholderWorks : []);

  // exhibitions parsing
  const exhibitionsParsed: { year?: string; title?: string; venue?: string; name?: string; location?: string }[] = [];
  const exhibitionsText = merged.exhibitions_text ?? merged.exhibitions ?? "";
  if (typeof exhibitionsText === "string" && exhibitionsText.trim()) {
    const lines = exhibitionsText.split("\n").map((l: string) => l.trim()).filter(Boolean);
    for (const l of lines) {
      const parts = l.split(/—|-|–/).map((p: string) => p.trim()).filter(Boolean);
      if (parts.length === 3) exhibitionsParsed.push({ year: parts[0], title: parts[1], venue: parts[2] });
      else if (parts.length === 2) exhibitionsParsed.push({ title: parts[0], venue: parts[1] });
      else exhibitionsParsed.push({ title: l });
    }
  } else if (Array.isArray(merged.exhibitions) && merged.exhibitions.length) {
    for (const ex of merged.exhibitions) {
      if (typeof ex === "string") exhibitionsParsed.push({ title: ex });
      else exhibitionsParsed.push(ex);
    }
  }

  // shop parsing (structured then fallback)
  const structuredShop = useMemo(() => {
    const out: Array<{ title?: string; price?: string; image?: string }> = [];
    for (let i = 1; i <= 6; i++) {
      const t = merged[`shop${i}_title`];
      const p = merged[`shop${i}_price`];
      const im = merged[`shop${i}_image`];
      const title = t ? String(t).trim() : "";
      const price = p ? String(p).trim() : "";
      let image = "";
      if (im) {
        const parsed = parseImageField(im);
        image = parsed.length ? parsed[0] : String(im || "").trim();
      }
      if (!title && !price && !image) continue;
      out.push({ title, price, image });
    }
    return out;
  }, [merged]);

  const shopParsed: { title?: string; price?: string; image?: string }[] = [];
  const shopText = merged.shop_text ?? merged.shop ?? "";
  if (typeof shopText === "string" && shopText.trim()) {
    const lines = shopText.split("\n").map((l: string) => l.trim()).filter(Boolean);
    for (const l of lines) {
      const parts = l.split(/—|-|–/).map((p: string) => p.trim()).filter(Boolean);
      if (parts.length === 3) shopParsed.push({ title: `${parts[0]} — ${parts[1]}`, price: parts[2] });
      else if (parts.length === 2) shopParsed.push({ title: parts[0], price: parts[1] });
      else shopParsed.push({ title: l });
    }
  } else if (Array.isArray(merged.shop) && merged.shop.length) {
    for (const s of merged.shop) {
      if (typeof s === "string") shopParsed.push({ title: s });
      else shopParsed.push(s);
    }
  }
  const shopToShow = structuredShop.length ? structuredShop : (shopParsed.length ? shopParsed : (showFooter ? [{ title: "Limited Edition Print", price: "$120" }, { title: "Original (small)", price: "$850" }] : []));

  // socials map
  const socialsData: Record<string, string> = {
    instagram: merged.instagram ? String(merged.instagram).trim() : "",
    behance: merged.behance ? String(merged.behance).trim() : "",
    website: merged.website ? String(merged.website).trim() : "",
    facebook: merged.facebook ? String(merged.facebook).trim() : "",
    twitter: merged.twitter ? String(merged.twitter).trim() : "",
    tiktok: merged.tiktok ? String(merged.tiktok).trim() : "",
    linkedin: merged.linkedin ? String(merged.linkedin).trim() : "",
    pinterest: merged.pinterest ? String(merged.pinterest).trim() : "",
    youtube: merged.youtube ? String(merged.youtube).trim() : "",
    email: merged.email ? String(merged.email).trim() : "",
    phone: merged.phone ? String(merged.phone).trim() : "",
  };

  const email = socialsData.email;
  const phone = socialsData.phone;

  const hasWorks = worksToShow.length > 0;
  const hasAbout = !!bio;
  const hasExhibitions = exhibitionsParsed.length > 0;
  const hasShop = shopToShow.length > 0;
  const hasSocialsOrContact = !!(Object.values(socialsData).find(v => !!v) || merged.contact_url || merged.profile_url);

  useEffect(() => {
    if (hasWorks) setActiveTab("works");
    else if (hasAbout) setActiveTab("about");
    else if (hasExhibitions) setActiveTab("exhibitions");
    else if (hasShop) setActiveTab("shop");
    else setActiveTab("contact");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // lightbox helpers
  const openWorks = (index: number) => openWorksLightbox(index);
  const openShop = (index: number) => openShopLightbox(index);

  // keyboard nav for lightbox
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!lightboxState) return;
      if (ev.key === "Escape") closeLightbox();
      if (ev.key === "ArrowLeft") prevLightbox();
      if (ev.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxState]);

  // mobile socials auto-scroll ref
  const socialsMobileRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = socialsMobileRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      try { el.scrollLeft = el.scrollWidth; } catch {}
    });
  }, [Object.values(socialsData).join("|")]);

  function socialHref(key: string, value: string) {
    if (!value) return "";
    switch (key) {
      case "instagram": return value.startsWith("http") ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
      case "behance": return value.startsWith("http") ? value : `https://behance.net/${value.replace(/^@/, "")}`;
      case "website": return value.startsWith("http") ? value : `https://${value}`;
      case "facebook": return value.startsWith("http") ? value : `https://facebook.com/${value.replace(/^@/, "")}`;
      case "twitter": return value.startsWith("http") ? value : `https://twitter.com/${value.replace(/^@/, "")}`;
      case "tiktok": return value.startsWith("http") ? value : `https://www.tiktok.com/@${value.replace(/^@/, "")}`;
      case "linkedin": return value.startsWith("http") ? value : `https://linkedin.com/in/${value.replace(/^@/, "")}`;
      case "pinterest": return value.startsWith("http") ? value : `https://pinterest.com/${value.replace(/^@/, "")}`;
      case "youtube": return value.startsWith("http") ? value : `https://youtube.com/${value}`;
      case "email": return `mailto:${value}`;
      case "phone": return `tel:${String(value).replace(/\s+/g, "")}`;
      default: return value;
    }
  }

  function productContactLink(productTitle?: string) {
    if (merged.contact_url) return merged.contact_url;
    if (merged.profile_url) return merged.profile_url;
    if (email) {
      const subject = `Inquiry about ${productTitle ?? "your product"}`;
      return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
    return "";
  }

  const currentLightboxUrl = lightboxState
    ? (lightboxState.kind === "works" ? worksToShow[lightboxState.index] : shopToShow[lightboxState.index]?.image || "")
    : null;

  // share logic
  const [clientHref, setClientHref] = useState<string>("");
  useEffect(() => { try { setClientHref(window.location.href || ""); } catch {} }, []);
  const getShareUrl = (): string => {
    if (merged.profile_url) return merged.profile_url;
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const idPart = merged.id ?? merged.slug ?? merged._id ?? "";
      if (idPart) return `${origin}/profile-preview/artist?id=${encodeURIComponent(String(idPart))}`;
    } catch {}
    return clientHref || (typeof window !== "undefined" ? window.location.href : "");
  };
  const shareProfile = async () => {
    const url = getShareUrl();
    const shareData = { title: `${name} — NexProfile`, text: `Check out ${name} on NexProfile`, url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); alert("Profile link copied to clipboard"); }
      else { const tmp = document.createElement("input"); document.body.appendChild(tmp); tmp.value = url; tmp.select(); document.execCommand("copy"); tmp.remove(); alert("Profile link copied to clipboard"); }
    } catch (err) {
      alert("Could not share profile. Copied link to clipboard as fallback.");
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  const socialEntries = useMemo(() => Object.entries(socialsData).filter(([, v]) => !!v), [JSON.stringify(socialsData)]);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
:root{ --a-bg:#0b0712; --a-accent:#ff6bcb; --a-muted:#b9a7c9; --a-text:#ffffff; }
.artist-new{ margin:0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background: linear-gradient(180deg,#07060a,#0b0712); color:var(--a-text); -webkit-font-smoothing:antialiased; }
.wrap{ max-width:980px; margin:14px auto; padding:16px; }
.hero{ border-radius:16px; overflow:hidden; background: linear-gradient(180deg, rgba(255,107,203,0.03), rgba(0,0,0,0.12)); min-height:40vw; display:flex; flex-direction:column; justify-content:flex-end; padding:16px; box-shadow: 0 16px 40px rgba(2,6,23,0.6); }
.hero-top{ display:flex; gap:12px; align-items:center; }
.avatar{ width:88px; height:88px; border-radius:999px; background-size:cover; background-position:center; border:4px solid rgba(255,255,255,0.06); box-shadow:0 12px 30px rgba(0,0,0,0.06); flex:0 0 88px; }
.meta{ display:flex; flex-direction:column; gap:6px; flex:1; text-align:center; align-items:center; justify-content:center; }
.name{ margin:0; font-weight:900; font-size:20px; color:var(--a-accent); }
.role{ margin:0; color:var(--a-muted); font-weight:700; font-size:13px; }

/* desktop inline social-row (hidden on small screens) */
.social-row{
  display:none;
  gap:8px;
  margin-top:8px;
  align-items:center;
  overflow-x:auto;
  -webkit-overflow-scrolling:touch;
  white-space:nowrap;
  padding:4px 10px;
}
.social-row > * { flex: 0 0 auto; }
.social{ width:44px; height:44px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:transparent; color:inherit; border:none; padding:0; margin-right:6px; }
.social svg, .social img{ width:20px; height:20px; display:block; }
.social-row::-webkit-scrollbar{ height:6px; }
.social-row::-webkit-scrollbar-thumb{ background: rgba(255,255,255,0.06); border-radius:99px; }
.social-row{ scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }

/* mobile socials strip */
.socials-mobile{
  display:flex;
  gap:10px;
  margin-top:12px;
  align-items:center;
  overflow-x:auto;
  padding:8px 12px;
  -webkit-overflow-scrolling:touch;
  justify-content:flex-start;
  scroll-padding-left:12px;
  scroll-padding-right:12px;
}
.social-mobile{ flex:0 0 auto; width:48px; height:48px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:transparent; border:none; box-shadow:none; }
.social-mobile svg, .social-mobile img{ width:22px; height:22px; display:block; }

/* share and other UI */
.share-row{ display:flex; justify-content:center; margin-top:12px; }
.share-btn{ padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); color:var(--a-text); cursor:pointer; font-weight:800; display:inline-flex; gap:8px; align-items:center; }
.share-btn:hover{ box-shadow:0 8px 28px rgba(255,107,203,0.06); transform: translateY(-2px); }

.tabs{ display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
.tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(255,255,255,0.03); color:var(--a-muted); font-weight:800; cursor:pointer; }
.tab.active{ background: linear-gradient(90deg,var(--a-accent), rgba(255,107,203,0.08)); color:#14020a; border:none; box-shadow:0 8px 24px rgba(176,108,255,0.06); }

.panels{ margin-top:12px; padding-bottom:26px; }
.panel{ display:none; color:var(--a-muted); line-height:1.6; }
.panel.active{ display:block; }

.works-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:10px; }
.tile{ border-radius:10px; overflow:hidden; background:#000; position:relative; height:140px; }
.tile img{ width:100%; height:100%; object-fit:cover; display:block; cursor:pointer; }

@media (min-width:880px){
  .social-row{ display:flex; }
  .socials-mobile{ display:none; }
  .meta{ text-align:left; align-items:flex-start; }
  .avatar{ width:110px; height:110px; }
  .share-row{ justify-content:flex-start; margin-left:8px; }
}
      `}</style>

      <div className="artist-new" style={{ minHeight: "100vh" }}>
        <main className="wrap" aria-label="Artist template preview">
          <section className="hero" aria-label="Artist hero">
            <div className="hero-top">
              {avatar ? <div className="avatar" style={{ backgroundImage: `url('${avatar}')` }} aria-hidden="true" /> : null}

              <div className="meta">
                {name ? <h1 className="name">{name}</h1> : null}
                {role ? <div className="role">{role}</div> : null}

                {/* Desktop inline socials (scrollable when many) */}
                <nav className="social-row" aria-label="social links">
                  {socialEntries.map(([k, v]) => {
                    const href = socialHref(k, v);
                    const isExternal = !(k === "email" || k === "phone");
                    return (
                      <a
                        key={k}
                        className="social"
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        aria-label={k}
                        title={k}
                      >
                        <SvgIcon name={k} alt={k} width={20} height={20} useImg />
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Mobile-only socials strip */}
            <div ref={socialsMobileRef} className="socials-mobile" aria-hidden={false} aria-label="social links (mobile)">
              {socialEntries.map(([k, v]) => {
                const href = socialHref(k, v);
                const isExternal = !(k === "email" || k === "phone");
                return (
                  <a
                    key={k}
                    className="social-mobile"
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noreferrer" : undefined}
                    aria-label={k}
                    title={k}
                  >
                    <SvgIcon name={k} alt={k} width={22} height={22} useImg />
                  </a>
                );
              })}
            </div>

            {/* Share */}
            <div className="share-row" role="region" aria-label="Share profile">
              <button className="share-btn" onClick={(e) => { e.stopPropagation(); shareProfile(); }} aria-label="Share NexProfile" title="Share NexProfile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ display: "inline-block" }}>
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2v13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Share NexProfile
              </button>
            </div>
          </section>

          <nav className="tabs" role="tablist" aria-label="Profile tabs (preview)">
            {hasWorks ? <button className={`tab ${activeTab === "works" ? "active" : ""}`} onClick={() => setActiveTab("works")}>Works</button> : null}
            {hasAbout ? <button className={`tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button> : null}
            {hasExhibitions ? <button className={`tab ${activeTab === "exhibitions" ? "active" : ""}`} onClick={() => setActiveTab("exhibitions")}>Exhibitions</button> : null}
            {hasShop ? <button className={`tab ${activeTab === "shop" ? "active" : ""}`} onClick={() => setActiveTab("shop")}>Shop / Prints</button> : null}
            <button className={`tab ${activeTab === "contact" ? "active" : ""}`} onClick={() => setActiveTab("contact")}>Contact</button>
          </nav>

          <section className="panels" aria-live="polite">
            {hasWorks && (
              <article id="works" className={`panel ${activeTab === "works" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>Selected Works</h3>
                <div className="works-grid">
                  {worksToShow.map((src, idx) => (
                    <div className="tile" key={idx} role="button" tabIndex={0} onClick={() => openWorks(idx)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openWorks(idx); }} aria-label={`Open work ${idx + 1}`}>
                      <img src={src} alt={`work ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </article>
            )}

            {hasAbout && (
              <article id="about" className={`panel ${activeTab === "about" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>About</h3>
                <p>{bio}</p>
              </article>
            )}

            {hasExhibitions && (
              <article id="exhibitions" className={`panel ${activeTab === "exhibitions" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>Exhibitions</h3>
                <div className="exhibitions">
                  {exhibitionsParsed.map((ex, i) => (
                    <div className="exhibit" key={i}>
                      <strong>{ex.year ? `${ex.year} — ` : ""}{ex.title || ex.name || "Exhibition"}</strong>
                      <div className="sub" style={{ color: "var(--a-muted)" }}>{ex.venue || ex.location || ""}</div>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {hasShop && (
              <article id="shop" className={`panel ${activeTab === "shop" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>Shop / Prints</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                  {shopToShow.map((s, i) => {
                    const contactLink = productContactLink(s.title);
                    return (
                      <div key={i} style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.02)" }}>
                        {s.image && (
                          <div role="button" tabIndex={0} onClick={() => openShop(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openShop(i); }} aria-label={`Open product ${i + 1}`} style={{ cursor: "pointer", overflow: "hidden", borderRadius: 8 }}>
                            <img src={s.image} alt={s.title || `product ${i + 1}`} style={{ width: "100%", height: 140, objectFit: "cover", display: "block", borderRadius: 8 }} />
                          </div>
                        )}

                        {contactLink ? (
                          <a href={contactLink} target={contactLink.startsWith("http") ? "_blank" : undefined} rel={contactLink.startsWith("http") ? "noreferrer" : undefined} style={{ textDecoration: "none", color: "inherit" }}>
                            <strong style={{ display: "block", marginTop: 8 }}>{s.title}</strong>
                          </a>
                        ) : <strong style={{ display: "block", marginTop: 8 }}>{s.title}</strong>}

                        {s.price && (
                          contactLink ? (
                            <a href={contactLink} target={contactLink.startsWith("http") ? "_blank" : undefined} rel={contactLink.startsWith("http") ? "noreferrer" : undefined} style={{ textDecoration: "none", color: "var(--a-muted)" }}>
                              <div className="sub" style={{ color: "var(--a-muted)", marginTop: 6 }}>{s.price}</div>
                            </a>
                          ) : <div className="sub" style={{ color: "var(--a-muted)", marginTop: 6 }}>{s.price}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>
            )}

            <article id="contact" className={`panel ${activeTab === "contact" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
              <div className="contact-list">
                {socialsData.instagram && (<div className="contact-item"><strong>Instagram</strong><div style={{ color: "var(--a-muted)" }}><a href={socialHref("instagram", socialsData.instagram)} target="_blank" rel="noreferrer">{socialsData.instagram}</a></div></div>)}
                {socialsData.behance && (<div className="contact-item"><strong>Behance / Portfolio</strong><div style={{ color: "var(--a-muted)" }}><a href={socialHref("behance", socialsData.behance)} target="_blank" rel="noreferrer">{socialsData.behance}</a></div></div>)}
                {socialsData.website && (<div className="contact-item"><strong>Website</strong><div style={{ color: "var(--a-muted)" }}><a href={socialHref("website", socialsData.website)} target="_blank" rel="noreferrer">{socialsData.website}</a></div></div>)}

                {email ? (<div className="contact-item"><span style={{ width: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><SvgIcon name="email" alt="email" width={18} height={18} useImg /></span><div><strong>Email</strong><div style={{ color: "var(--a-muted)" }}><a href={`mailto:${email}`}>{email}</a></div></div></div>) : (showFooter ? (<div className="contact-item"><strong>Email</strong><div style={{ color: "var(--a-muted)" }}>maya@example.com</div></div>) : null)}

                {phone ? (<div className="contact-item"><span style={{ width: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><SvgIcon name="phone" alt="phone" width={18} height={18} useImg /></span><div><strong>Phone</strong><div style={{ color: "var(--a-muted)" }}><a href={`tel:${String(phone).replace(/\s+/g, "")}`}>{phone}</a></div></div></div>) : (showFooter ? (<div className="contact-item"><strong>Phone</strong><div style={{ color: "var(--a-muted)" }}>+1 555 555 5555</div></div>) : null)}

                {merged.contact_url && (<div className="contact-item"><strong>Contact / Enquiries</strong><div style={{ color: "var(--a-muted)" }}><a href={merged.contact_url} target="_blank" rel="noreferrer">{merged.contact_url}</a></div></div>)}
              </div>

              {(merged.contact_url || merged.profile_url || showFooter) && (
                <div className="contact-row" style={{ marginTop: 12 }}>
                  {merged.contact_url ? (<a className="primary-btn" href={merged.contact_url} aria-label="Enquire about commissions" target="_blank" rel="noreferrer">Enquire / Commission</a>) : (showFooter ? (<a className="primary-btn" href="#" aria-label="Enquire about commissions">Enquire / Commission</a>) : null)}
                </div>
              )}
            </article>
          </section>

          <div className="preview-footer" role="toolbar" aria-label="Preview actions">
            {showFooter && (<button className="primary-btn" onClick={() => { const onboardingRoute = merged.id ? `/onboarding/artist?id=${merged.id}` : "/onboarding/artist"; router.push(onboardingRoute); }}>Use this template</button>)}
          </div>
        </main>
      </div>

      {lightboxState && currentLightboxUrl ? (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Artwork preview">
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" aria-label="Close" onClick={closeLightbox}>×</button>
            {((lightboxState.kind === "works" && worksToShow.length > 1) || (lightboxState.kind === "shop" && shopToShow.length > 1)) && <button className="lightbox-nav prev" aria-label="Previous image" onClick={prevLightbox}>‹</button>}
            <img src={currentLightboxUrl} alt={`Artwork preview`} />
            {((lightboxState.kind === "works" && worksToShow.length > 1) || (lightboxState.kind === "shop" && shopToShow.length > 1)) && <button className="lightbox-nav next" aria-label="Next image" onClick={nextLightbox}>›</button>}
          </div>
        </div>
      ) : null}
    </>
  );
}