"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * ArtistPreview
 *
 * - Restored styles + shop tab + lightbox.
 * - Works and shop product images open the same accessible lightbox.
 * - Socials shown as SVG logos in hero; bio moved into About tab only.
 * - Contacts tab shows email (mailto) and phone (tel). Social icons and contact icons are clickable.
 * - Product title/price link to contact action (contact_url > profile_url > mailto).
 */

export default function ArtistPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("works");

  // lightboxState: null or { kind: 'works' | 'shop', index: number }
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
      try { return Array.isArray(value) ? value.map(String).filter(Boolean) : []; } catch { return []; }
    }
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return [];
      try { const p = JSON.parse(s); if (Array.isArray(p)) return p.map(String).filter(Boolean); } catch {}
      if (s.includes(",")) return s.split(",").map(p => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }

  // Profile/basic
  const name = merged.name ? String(merged.name) : showFooter ? "Maya K." : "";
  const role = merged.tagline ? String(merged.tagline) : merged.role ? String(merged.role) : showFooter ? "Visual Artist — Mixed Media" : "";
  const bio = merged.bio ? String(merged.bio) : showFooter ? "Layered textural pieces exploring memory and place. Commissions, prints and gallery collaborations available." : "";

  const profileImages = parseImageField(merged.profileImage ?? merged.profile_image ?? merged.avatar ?? merged.avatar_url);
  const avatar = profileImages.length ? profileImages[0] : (showFooter ? "https://picsum.photos/id/1019/400/400" : "");

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

  // Exhibitions
  const exhibitionsParsed: { year?: string; title?: string; venue?: string }[] = [];
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

  // structured shop: shop1..shop6_title/price/image
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

  // freeform shop fallback
  const shopParsed: { title?: string; price?: string }[] = [];
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

  // Socials + contact (include email/phone here so icons appear in hero)
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

  // Lightbox helpers that work for both works and shop images
  const openWorksLightbox = (index: number) => {
    if (index < 0 || index >= worksToShow.length) return;
    setLightboxState({ kind: "works", index });
    try { document.body.style.overflow = "hidden"; } catch {}
  };
  const openShopLightbox = (index: number) => {
    if (index < 0 || index >= shopToShow.length) return;
    setLightboxState({ kind: "shop", index });
    try { document.body.style.overflow = "hidden"; } catch {}
  };
  const closeLightbox = () => {
    setLightboxState(null);
    try { document.body.style.overflow = ""; } catch {}
  };
  const prevLightbox = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!lightboxState) return;
    const len = lightboxState.kind === "works" ? worksToShow.length : shopToShow.length;
    setLightboxState((prev) => prev ? { kind: prev.kind, index: (prev.index - 1 + len) % len } : prev);
  };
  const nextLightbox = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    if (!lightboxState) return;
    const len = lightboxState.kind === "works" ? worksToShow.length : shopToShow.length;
    setLightboxState((prev) => prev ? { kind: prev.kind, index: (prev.index + 1) % len } : prev);
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!lightboxState) return;
      if (ev.key === "Escape") closeLightbox();
      if (ev.key === "ArrowLeft") prevLightbox();
      if (ev.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxState, worksToShow.length, shopToShow.length]);

  // Social icons (SVGs)
  const Icons: Record<string, React.FC<{ size?: number }>> = {
    instagram: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" stroke="currentColor" strokeWidth="1.2"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>),
    behance: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M3 6h6v12H3zM9 6h6a3 3 0 0 1 0 6H9z"/><path d="M17 13.5a1.5 1.5 0 0 0 0-3H15v3z"/></svg>),
    website: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="1.2"/></svg>),
    facebook: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 1 0-11.5 9.9V14.6h-2.7v-2.6h2.7V9.6c0-2.7 1.6-4.2 4-4.2 1.2 0 2.4.2 2.4.2v2.7h-1.4c-1.4 0-1.9.9-1.9 1.8v2.1h3.2l-.5 2.6h-2.7v7.3A10 10 0 0 0 22 12z"/></svg>),
    twitter: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 5.9c-.6.3-1.2.6-1.9.7.7-.4 1.2-1 1.5-1.7-.7.4-1.4.6-2.2.8C18.7 5 17.8 4.5 16.8 4.5c-1.4 0-2.5 1.1-2.5 2.5 0 .2 0 .4.1.6C11 7.4 8.3 6 6.4 4c-.2.3-.3.7-.3 1.1 0 1.1.6 2.1 1.6 2.7-.5 0-1-.1-1.4-.4v.1c0 1.2.9 2.2 2 2.4-.4.1-.9.1-1.3.1-.3 0-.6 0-.9-.1.6 1.8 2.3 3.1 4.2 3.2-1.5 1.2-3.3 1.9-5.3 1.9H6c1.9 1.2 4.2 1.9 6.7 1.9 8 0 12.4-6.6 12.4-12.4v-.6c.9-.6 1.6-1.3 2.2-2.2-.8.3-1.6.6-2.4.7z"/></svg>),
    tiktok: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16 8.5c-.6 0-1.1-.2-1.5-.5v6.5a3.5 3.5 0 1 1-3.5-3.5v-1.5a5 5 0 1 0 5 5V8.5z"/></svg>),
    linkedin: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 1.98 1.98 1.98h.02C6.08 7.46 7 6.58 7 5.48 7 4.38 6.12 3.5 4.98 3.5zM3.5 9h3v11h-3zM9 9h2.88v1.52h.04c.4-.76 1.4-1.52 2.88-1.52 3.08 0 3.64 2.02 3.64 4.64V20h-3v-4.2c0-1 .02-2.28-1.38-2.28-1.38 0-1.6 1.08-1.6 2.2V20h-3z"/></svg>),
    pinterest: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6 2 2 6 2 11c0 3.1 1.7 5.7 4.2 6.9-.1-.6-.2-1.6 0-2.3.2-.6 1.4-4 .1-6C6 8 9 7 10.6 8c.7.4 1 1 1 1.7 0 1-.6 2-1 2.4-.3.4-.8 1.2-.4 2.6.2.8 1 1.3 2 1.3 2.5 0 4.4-3 4.4-7.1 0-3.1-2.1-5.2-5.1-5.2z"/></svg>),
    youtube: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21.8 8s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1-2-.2-5-.2-5-.2s-3 0-5 .2c-.4.1-1.3.1-2.1 1C2.4 6.4 2.2 8 2.2 8S2 9.8 2 11.6v1.8c0 1.8.2 3.6.2 3.6s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.1 7 .2 7 .2s3.1 0 5-.2c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.3.8-2.3s.2-1.8.2-3.6v-1.8c0-1.8-.2-3.6-.2-3.6z"/></svg>),
    email: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7.5v9A2.5 2.5 0 0 0 5.5 19h13A2.5 2.5 0 0 0 21 16.5v-9A2.5 2.5 0 0 0 18.5 5h-13A2.5 2.5 0 0 0 3 7.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M21 7.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>),
    phone: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 16.92v3a1 1 0 0 1-1.11 1A19.86 19.86 0 0 1 13 17.5 19.27 19.27 0 0 1 7 11.5 19.86 19.86 0 0 1 3.1 4.11 1 1 0 0 1 4.1 3h3a1 1 0 0 1 1 .75c.12.6.3 1.2.54 1.79a1 1 0 0 1-.24 1L7.5 7.5a14 14 0 0 0 8 8l1.96-1.96a1 1 0 0 1 1-.24c.59.24 1.19.42 1.79.54a1 1 0 0 1 .75 1v3z"/></svg>),
  };

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

  // helper to produce contact link for products: contact_url -> profile_url -> mailto (product)
  function productContactLink(productTitle?: string) {
    if (merged.contact_url) return merged.contact_url;
    if (merged.profile_url) return merged.profile_url;
    if (email) {
      const subject = `Inquiry about ${productTitle ?? "your product"}`;
      return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
    return "";
  }

  // pick current lightbox image URL (if open)
  const currentLightboxUrl = lightboxState
    ? (lightboxState.kind === "works" ? worksToShow[lightboxState.index] : shopToShow[lightboxState.index]?.image || "")
    : null;

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
        :root{ --a-bg: #0b0712; --a-surface: #0f0b16; --a-accent: #ff6bcb; --a-muted: #b9a7c9; --a-text: #ffffff; --card-radius: 14px; }
        body.artist-new{ margin:0; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background: linear-gradient(180deg,#07060a,#0b0712); color:var(--a-text); -webkit-font-smoothing:antialiased; }
        .wrap{ max-width:980px; margin:14px auto; padding:16px; }
        .hero { border-radius:16px; overflow:hidden; background: linear-gradient(180deg, rgba(255,107,203,0.03), rgba(0,0,0,0.12)); min-height:40vw; display:flex; flex-direction:column; justify-content:flex-end; padding:16px; box-shadow: 0 16px 40px rgba(2,6,23,0.6); }
        .hero-top { display:flex; gap:12px; align-items:center; }
        .avatar{ width:88px; height:88px; border-radius:999px; background-size:cover; background-position:center; border:4px solid rgba(255,255,255,0.06); box-shadow:0 12px 30px rgba(176,108,255,0.06); flex:0 0 88px; }
        .meta{ display:flex; flex-direction:column; gap:6px; } .name{ margin:0; font-weight:900; font-size:20px; color:var(--a-accent); } .role{ margin:0; color:var(--a-muted); font-weight:700; font-size:13px; }
        .social-row{ display:flex; gap:8px; margin-top:8px; align-items:center; } .social{ width:40px; height:40px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; background:linear-gradient(90deg,var(--a-accent), #ff9ae1); color:#14020a; border:1px solid rgba(0,0,0,0.12); text-decoration:none; font-weight:700; font-size:13px; box-shadow:0 6px 18px rgba(176,108,255,0.12); }
        .hero-card{ margin-top:12px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.02); color:var(--a-muted); backdrop-filter: blur(4px); }
        .tabs{ display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; } .tab{ padding:8px 12px; border-radius:10px; background:transparent; border:1px solid rgba(255,255,255,0.03); color:var(--a-muted); font-weight:800; cursor:pointer; } .tab.active{ background: linear-gradient(90deg,var(--a-accent), rgba(255,107,203,0.08)); color:#14020a; border:none; box-shadow:0 8px 24px rgba(176,108,255,0.06); }
        .panels{ margin-top:12px; padding-bottom:26px; } .panel{ display:none; color:var(--a-muted); line-height:1.6; } .panel.active{ display:block; }
        .works-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:10px; } .works-grid .tile{ border-radius:10px; overflow:hidden; background:#000; position:relative; height:140px; } .works-grid .tile img{ width:100%; height:100%; object-fit:cover; display:block; cursor:pointer; }
        .exhibitions{ margin-top:10px; display:flex; flex-direction:column; gap:8px; } .exhibit{ background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01)); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); color:var(--a-muted); }
        .contact-row{ display:flex; gap:12px; align-items:center; justify-content:space-between; margin-top:12px; flex-wrap:wrap; } .contact-list{ display:flex; gap:8px; flex-direction:column; } .contact-item{ background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.02); display:flex; gap:10px; align-items:center; }
        .primary-btn{ padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,var(--a-accent), #ff9ae1); color:#14020a; font-weight:900; text-decoration:none; border:none; } .qr{ display:flex; gap:10px; align-items:center; } .qr img{ width:84px; height:84px; border-radius:8px; background:#fff; display:block; }
        @media (min-width:880px){ .works-grid{ grid-template-columns:repeat(3,1fr); } .hero{ min-height:220px; padding:22px; } .avatar{ width:110px; height:110px; } }
        .preview-footer{ display:flex; gap:10px; justify-content:flex-end; margin:18px 0 32px; flex-wrap:wrap; } .secondary-btn{ padding:10px 14px; border-radius:10px; background:transparent; color:var(--a-muted); border:1px solid rgba(255,255,255,0.06); cursor:pointer; font-weight:700; }
        /* lightbox */
        .lightbox-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:2000; padding: 20px; }
        .lightbox-inner { position: relative; max-width:96%; max-height:96%; display:flex; align-items:center; justify-content:center; }
        .lightbox-inner img{ max-width:100%; max-height:100%; border-radius:10px; display:block; }
        .lightbox-close, .lightbox-nav { position:absolute; background: rgba(0,0,0,0.5); color:white; border:none; width:44px; height:44px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; }
        .lightbox-close{ top:12px; right:12px; } .lightbox-nav.prev{ left:12px; top:50%; transform: translateY(-50%);} .lightbox-nav.next{ right:12px; top:50%; transform: translateY(-50%); }
      ` }} />

      <div className="artist-new" style={{ minHeight: "100vh" }}>
        <main className="wrap" aria-label="Artist template preview">
          <section className="hero" aria-label="Artist hero">
            <div className="hero-top">
              {avatar ? (
                <div className="avatar" style={{ backgroundImage: `url('${avatar}')` }} aria-hidden="true" />
              ) : null}

              <div className="meta">
                {name ? <h1 className="name">{name}</h1> : null}
                {role ? <div className="role">{role}</div> : null}

                {/* Socials as clickable logos horizontally in the hero */}
                {Object.values(socialsData).some(Boolean) ? (
                  <nav className="social-row" aria-label="social links">
                    {Object.entries(socialsData).map(([k, v]) => {
                      if (!v) return null;
                      const Icon = Icons[k];
                      if (!Icon) return null;
                      const href = socialHref(k, v);
                      // For mailto/tel we don't want target="_blank"
                      const isExternal = !(k === "email" || k === "phone");
                      return (
                        <a
                          key={k}
                          className="social"
                          href={href}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noreferrer" : undefined}
                          aria-label={k}
                        >
                          <Icon />
                        </a>
                      );
                    })}
                  </nav>
                ) : null}
              </div>
            </div>

            {/* About removed from hero: about will only show under the About tab */}
          </section>

          <nav className="tabs" role="tablist" aria-label="Profile tabs (preview)">
            {hasWorks ? <button className={`tab ${activeTab === "works" ? "active" : ""}`} onClick={() => setActiveTab("works")}>Works</button> : null}
            {hasAbout ? <button className={`tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button> : null}
            {hasExhibitions ? <button className={`tab ${activeTab === "exhibitions" ? "active" : ""}`} onClick={() => setActiveTab("exhibitions")}>Exhibitions</button> : null}
            {hasShop ? <button className={`tab ${activeTab === "shop" ? "active" : ""}`} onClick={() => setActiveTab("shop")}>Shop / Prints</button> : null}
            <button className={`tab ${activeTab === "contact" ? "active" : ""}`} onClick={() => setActiveTab("contact")}>Contact</button>
          </nav>

          <section className="panels" aria-live="polite">
            {hasWorks ? (
              <article id="works" className={`panel ${activeTab === "works" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>Selected Works</h3>
                <div className="works-grid">
                  {worksToShow.map((src, idx) => (
                    <div
                      className="tile"
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => openWorksLightbox(idx)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openWorksLightbox(idx); }}
                      aria-label={`Open work ${idx + 1}`}
                    >
                      <img src={src} alt={`work ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {hasAbout ? (
              <article id="about" className={`panel ${activeTab === "about" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>About</h3>
                <p>{bio}</p>
              </article>
            ) : null}

            {hasExhibitions ? (
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
            ) : null}

            {hasShop ? (
              <article id="shop" className={`panel ${activeTab === "shop" ? "active" : ""}`} role="tabpanel">
                <h3 style={{ margin: "0 0 8px" }}>Shop / Prints</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                  {shopToShow.map((s, i) => {
                    const contactLink = productContactLink(s.title);
                    return (
                      <div
                        key={i}
                        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.02)" }}
                      >
                        {s.image ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => openShopLightbox(i)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openShopLightbox(i); }}
                            aria-label={`Open product ${i + 1}`}
                            style={{ cursor: "pointer", overflow: "hidden", borderRadius: 8 }}
                          >
                            <img src={s.image} alt={s.title || `product ${i + 1}`} style={{ width: "100%", height: 140, objectFit: "cover", display: "block", borderRadius: 8 }} />
                          </div>
                        ) : null}

                        {/* Title clickable to contact if we have a contact action */}
                        {contactLink ? (
                          <a href={contactLink} target={contactLink.startsWith("http") ? "_blank" : undefined} rel={contactLink.startsWith("http") ? "noreferrer" : undefined} style={{ textDecoration: "none", color: "inherit" }}>
                            <strong style={{ display: "block", marginTop: 8 }}>{s.title}</strong>
                          </a>
                        ) : (
                          <strong style={{ display: "block", marginTop: 8 }}>{s.title}</strong>
                        )}

                        {/* Price clickable to contact as well */}
                        {s.price ? (
                          contactLink ? (
                            <a href={contactLink} target={contactLink.startsWith("http") ? "_blank" : undefined} rel={contactLink.startsWith("http") ? "noreferrer" : undefined} style={{ textDecoration: "none", color: "var(--a-muted)" }}>
                              <div className="sub" style={{ color: "var(--a-muted)", marginTop: 6 }}>{s.price}</div>
                            </a>
                          ) : (
                            <div className="sub" style={{ color: "var(--a-muted)", marginTop: 6 }}>{s.price}</div>
                          )
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            ) : null}

            <article id="contact" className={`panel ${activeTab === "contact" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>Contact</h3>

              {(!hasSocialsOrContact && !showFooter) ? (
                <p style={{ margin: "0 0 8px", color: "var(--a-muted)" }}>No contact information provided.</p>
              ) : null}

              <div className="contact-list">
                {socialsData.instagram ? (
                  <div className="contact-item">
                    <strong>Instagram</strong>
                    <div style={{ color: "var(--a-muted)" }}>
                      <a href={socialHref("instagram", socialsData.instagram)} target="_blank" rel="noreferrer">{socialsData.instagram}</a>
                    </div>
                  </div>
                ) : null}

                {socialsData.behance ? (
                  <div className="contact-item">
                    <strong>Behance / Portfolio</strong>
                    <div style={{ color: "var(--a-muted)" }}>
                      <a href={socialHref("behance", socialsData.behance)} target="_blank" rel="noreferrer">{socialsData.behance}</a>
                    </div>
                  </div>
                ) : null}

                {socialsData.website ? (
                  <div className="contact-item">
                    <strong>Website</strong>
                    <div style={{ color: "var(--a-muted)" }}>
                      <a href={socialHref("website", socialsData.website)} target="_blank" rel="noreferrer">{socialsData.website}</a>
                    </div>
                  </div>
                ) : null}

                {/* Email shown and clickable */}
                {email ? (
                  <div className="contact-item">
                    <span style={{ width: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icons.email /></span>
                    <div>
                      <strong>Email</strong>
                      <div style={{ color: "var(--a-muted)" }}>
                        <a href={`mailto:${email}`}>{email}</a>
                      </div>
                    </div>
                  </div>
                ) : (showFooter ? (
                  <div className="contact-item"><strong>Email</strong><div style={{ color: "var(--a-muted)" }}>maya@example.com</div></div>
                ) : null)}

                {/* Phone clickable */}
                {phone ? (
                  <div className="contact-item">
                    <span style={{ width: 20, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icons.phone /></span>
                    <div>
                      <strong>Phone</strong>
                      <div style={{ color: "var(--a-muted)" }}>
                        <a href={`tel:${String(phone).replace(/\s+/g, "")}`}>{phone}</a>
                      </div>
                    </div>
                  </div>
                ) : (showFooter ? (
                  <div className="contact-item"><strong>Phone</strong><div style={{ color: "var(--a-muted)" }}>+1 555 555 5555</div></div>
                ) : null)}

                {merged.contact_url ? <div className="contact-item"><strong>Contact / Enquiries</strong><div style={{ color: "var(--a-muted)" }}><a href={merged.contact_url} target="_blank" rel="noreferrer">{merged.contact_url}</a></div></div> : null}
              </div>

              {(merged.contact_url || merged.profile_url || showFooter) && (
                <div className="contact-row" style={{ marginTop: 12 }}>
                  {merged.contact_url ? (
                    <a className="primary-btn" href={merged.contact_url} aria-label="Enquire about commissions" target="_blank" rel="noreferrer">
                      Enquire / Commission
                    </a>
                  ) : (showFooter ? (
                    <a className="primary-btn" href="#" aria-label="Enquire about commissions">Enquire / Commission</a>
                  ) : null)}

                  <div className="qr" aria-label="QR code">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(merged.profile_url || (typeof window !== "undefined" ? window.location.href : ""))}`}
                      alt="QR to profile"
                    />
                    <div style={{ fontSize: 13, color: "var(--a-muted)" }}>
                      <div>Download QR</div>
                      <a
                        className="primary-btn"
                        href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(merged.profile_url || (typeof window !== "undefined" ? window.location.href : ""))}`}
                        download
                        style={{ padding: "8px 10px", fontSize: 13 }}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </article>
          </section>

          {showFooter ? (
            <div className="preview-footer" role="toolbar" aria-label="Preview actions">
              <button className="secondary-btn" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="primary-btn" onClick={() => {
                const onboardingRoute = merged.id ? `/onboarding/artist?id=${merged.id}` : "/onboarding/artist";
                router.push(onboardingRoute);
              }}>Use this template</button>
            </div>
          ) : null}
        </main>
      </div>

      {/* Lightbox overlay */}
      {lightboxState && currentLightboxUrl ? (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Artwork preview">
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" aria-label="Close" onClick={closeLightbox}>×</button>
            {(
              (lightboxState.kind === "works" && worksToShow.length > 1) ||
              (lightboxState.kind === "shop" && shopToShow.length > 1)
            ) && <button className="lightbox-nav prev" aria-label="Previous image" onClick={prevLightbox}>‹</button>}
            <img src={currentLightboxUrl} alt={`Artwork preview`} />
            {(
              (lightboxState.kind === "works" && worksToShow.length > 1) ||
              (lightboxState.kind === "shop" && shopToShow.length > 1)
            ) && <button className="lightbox-nav next" aria-label="Next image" onClick={nextLightbox}>›</button>}
          </div>
        </div>
      ) : null}
    </>
  );
}