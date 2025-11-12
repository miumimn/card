"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * BoutiqueFashionPreview (updated)
 *
 * Fixes:
 * - Robust product image parsing: product image fields may be arrays, strings, or objects (with url/src/path).
 *   We now run parseImageField() for product images so uploads saved as objects/arrays show correctly.
 * - Single collection set: prefer merged.collection/collection_images/lookbook (one set) and use up to 3 images.
 *   Falls back to previous collection1/collection2 behavior if that single set is not present.
 * - Keeps /thumbs/ fallbacks and desktop/mobile styling & lightbox unchanged.
 */

export default function BoutiqueFashionPreview({ data, showFooter = true }: { data?: any; showFooter?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("works");

  // lightboxState: { kind: "works" | "shop", index: number } | null
  const [lightboxState, setLightboxState] = useState<{ kind: "works" | "shop"; index: number } | null>(null);

  // Merge top-level and extra_fields
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
      } catch {
        // ignore
      }
    }
    return out;
  }, [data]);

  /**
   * parseImageField
   * - Accepts: array of strings, single string, JSON-stringified array, comma-separated string.
   * - Handles object inputs commonly returned from upload widgets: { url }, { src }, { path }, { secure_url }.
   * - Returns array of string URLs (possibly empty).
   */
  function parseImageField(value: any): string[] {
    if (value === undefined || value === null) return [];
    // Array of strings or objects
    if (Array.isArray(value)) {
      const out: string[] = [];
      for (const item of value) {
        if (!item && item !== "") continue;
        if (typeof item === "string") out.push(item);
        else if (typeof item === "object" && item !== null) {
          const candidate = (item.url || item.src || item.path || item.secure_url || item.preview || item.filename || "");
          if (candidate) out.push(String(candidate));
        }
      }
      return out.filter(Boolean);
    }

    // Object with url-like keys
    if (typeof value === "object" && value !== null) {
      const candidate = (value.url || value.src || value.path || value.secure_url || value.preview || value.filename || "");
      return candidate ? [String(candidate)] : [];
    }

    // String: try JSON, comma-split, otherwise single URL/path
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        if (typeof parsed === "object" && parsed !== null) {
          const c = parsed.url || parsed.src || parsed.path || parsed.secure_url || parsed.preview || parsed.filename || "";
          if (c) return [String(c)];
        }
      } catch {}
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }

    return [];
  }

  // Brand fields
  const brandName = merged.brandName || merged.name || (showFooter ? "Éclat Boutique" : "");
  const tagline = merged.tagline || merged.tag || "";
  const bio = merged.bio || "";

  // Logo (fallback uses /thumbs/fashion-logo.jpg)
  const logo = parseImageField(merged.profileImage ?? merged.profile_image ?? merged.brandLogo)[0] || (showFooter ? "/thumbs/fashion-logo.jpg" : "");

  // COLLECTION: prefer a single collection set (merged.collection / merged.collection_images / merged.lookbook)
  // The user requested one set that contains 3 images (we show up to 3).
  const singleCollection = parseImageField(merged.collection ?? merged.collection_images ?? merged.lookbook ?? merged.lookbook_images ?? merged.collectionSet);
  const collectionFromOld = [
    ...parseImageField(merged.collection1 ?? merged.collection_1 ?? merged.collectionOne),
    ...parseImageField(merged.collection2 ?? merged.collection_2 ?? merged.collectionTwo),
  ];
  // Prefer singleCollection if provided; otherwise fall back to collection1+collection2 logic
  const gallery = singleCollection.length ? singleCollection.slice(0, 3) : (collectionFromOld.length ? collectionFromOld : []);
  const galleryToShow = gallery.length ? gallery : (showFooter ? [
    "/thumbs/fashion1.jpg",
    "/thumbs/fashion2.jpg",
    "/thumbs/fashion3.jpg",
    "/thumbs/fashion4.jpg",
    "/thumbs/fashion5.jpg",
    "/thumbs/fashion6.jpg",
    "/thumbs/fashion7.jpg",
    "/thumbs/fashion8.jpg",
  ] : []);

  // Products: structured productN_* fields and fallbacks
  const products: { title?: string; price?: string; desc?: string; image?: string }[] = [];
  const requestedCount = (() => {
    const v = merged.product_count ?? merged.productCount ?? merged.products_count;
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.max(0, Math.min(4, Math.floor(n))) : null;
  })();

  // collect productN_* fields (1..4) and use parseImageField for robust image extraction
  for (let i = 1; i <= 4; i++) {
    const title = merged[`product${i}_name`] || merged[`product${i}_title`] || "";
    const price = merged[`product${i}_price`] || "";
    const desc = merged[`product${i}_desc`] || merged[`product${i}_description`] || "";
    const rawImage = merged[`product${i}_image`];
    const parsedImgs = parseImageField(rawImage);
    const image = parsedImgs.length ? parsedImgs[0] : "";
    if (title || price || desc || image) {
      products.push({ title, price, desc, image });
    }
  }

  // fallback: products array or product_list (ensure parseImageField used)
  if (!products.length) {
    if (Array.isArray(merged.products) && merged.products.length) {
      merged.products.slice(0, 4).forEach((p: any) => {
        const imgs = parseImageField(p.image ?? p.images ?? p.photo);
        products.push({ title: p.title || p.name || "", price: p.price || "", desc: p.desc || p.description || "", image: imgs[0] || "" });
      });
    } else if (merged.product_list && typeof merged.product_list === "string") {
      const lines = merged.product_list.split("\n").map((l: string) => l.trim()).filter(Boolean).slice(0, 4);
      lines.forEach((l) => {
        const parts = l.split("|").map((s) => s.trim());
        const [titlePrice] = parts;
        const [title, price] = titlePrice.split(/—|-|–/).map((s) => s.trim());
        products.push({ title: title || titlePrice, price: price || "", desc: parts[1] || "" });
      });
    } else if (showFooter) {
      // fallback uses /thumbs/
      products.push({ title: "Linen Wrap Dress", price: "$119", desc: "Lightweight summer wrap", image: "/thumbs/fashion1.jpg" });
      products.push({ title: "Silk Slip Top", price: "$79", desc: "Soft silk for evenings", image: "/thumbs/fashion2.jpg" });
      products.push({ title: "Tailored Blazer", price: "$159", desc: "Sharp fit for workwear", image: "/thumbs/fashion3.jpg" });
      products.push({ title: "Pleated Midi Skirt", price: "$89", desc: "Everyday elegance", image: "/thumbs/fashion4.jpg" });
    }
  }

  // Determine how many products to show:
  const productsToShow = (() => {
    if (requestedCount !== null) return products.slice(0, requestedCount);
    return products.filter((p) => p.title || p.image).slice(0, 4);
  })();

  // Socials / contact
  const instagram = merged.instagram || "";
  const tiktok = merged.tiktok || merged.tiktok_handle || "";
  const pinterest = merged.pinterest || "";
  const website = merged.website || "";
  const email = merged.email || "";
  const phone = merged.phone || "";
  const contactUrl = merged.contact_url || merged.profile_url || "";

  // sections presence
  const hasGallery = galleryToShow.length > 0;
  const hasShop = productsToShow.length > 0;
  const hasAbout = !!bio;
  const hasContact = !!(instagram || tiktok || pinterest || website || email || phone || contactUrl);

  useEffect(() => {
    if (hasGallery) setActiveTab("works");
    else if (hasShop) setActiveTab("shop");
    else if (hasAbout) setActiveTab("about");
    else setActiveTab("contact");
  }, [data]);

  // CTA: tel if phone else contactUrl else #
  const ctaHref = phone ? `tel:${String(phone).replace(/\s+/g, "")}` : (contactUrl || (showFooter ? "#" : ""));

  // Social icons (SVG)
  const Icons: Record<string, React.FC<{ size?: number }>> = {
    instagram: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" stroke="currentColor" strokeWidth="1.2"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>),
    tiktok: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16 8.5c-.6 0-1.1-.2-1.5-.5v6.5a3.5 3.5 0 1 1-3.5-3.5v-1.5a5 5 0 1 0 5 5V8.5z"/></svg>),
    pinterest: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6 2 2 6 2 11c0 3.1 1.7 5.7 4.2 6.9-.1-.6-.2-1.6 0-2.3.2-.6 1.4-4 .1-6C6 8 9 7 10.6 8c.7.4 1 1 1 1.7 0 1-.6 2-1 2.4-.3.4-.8 1.2-.4 2.6.2.8 1 1.3 2 1.3 2.5 0 4.4-3 4.4-7.1 0-3.1-2.1-5.2-5.1-5.2z"/></svg>),
    website: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="1.2"/></svg>),
    email: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7.5v9A2.5 2.5 0 0 0 5.5 19h13A2.5 2.5 0 0 0 21 16.5v-9A2.5 2.5 0 0 0 18.5 5h-13A2.5 2.5 0 0 0 3 7.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M21 7.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>),
    phone: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 16.92v3a1 1 0 0 1-1.11 1A19.86 19.86 0 0 1 13 17.5 19.27 19.27 0 0 1 7 11.5 19.86 19.86 0 0 1 3.1 4.11 1 1 0 0 1 4.1 3h3a1 1 0 0 1 1 .75c.12.6.3 1.2.54 1.79a1 1 0 0 1-.24 1L7.5 7.5a14 14 0 0 0 8 8l1.96-1.96a1 1 0 0 1 1-.24c.59.24 1.19.42 1.79.54a1 1 0 0 1 .75 1v3z"/></svg>),
  };

  function socialHref(key: string, value: string) {
    if (!value) return "";
    switch (key) {
      case "instagram": return value.startsWith("http") ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
      case "tiktok": return value.startsWith("http") ? value : `https://www.tiktok.com/@${value.replace(/^@/, "")}`;
      case "pinterest": return value.startsWith("http") ? value : `https://pinterest.com/${value.replace(/^@/, "")}`;
      case "website": return value.startsWith("http") ? value : `https://${value}`;
      case "email": return `mailto:${value}`;
      case "phone": return `tel:${String(value).replace(/\s+/g, "")}`;
      default: return value;
    }
  }

  // product contact link priority: contact_url -> profile_url -> mailto with subject
  function productContactLink(productTitle?: string) {
    if (contactUrl) return contactUrl;
    if (merged.profile_url) return merged.profile_url;
    if (email) {
      const subject = `Inquiry about ${productTitle ?? "product"}`;
      return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    }
    return "";
  }

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        /* Theme variables: light by default */
        :root {
          --bg: #ffffff;
          --text: #0b0712;
          --muted: #6b6b76;
          --accent: #ff6bcb;
          --card-bg: #ffffff;
          --btn-bg: #ffffff;
          --btn-text: #111;
          --overlay: rgba(0,0,0,0.85);
        }

        /* Respect user's OS preference */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #0b0712;
            --text: #ffffff;
            --muted: #b9a7c9;
            --accent: #ff6bcb;
            --card-bg: #0f0b16;
            --btn-bg: linear-gradient(90deg,var(--accent), #ff9ae1);
            --btn-text: #14020a;
            --overlay: rgba(0,0,0,0.85);
          }
        }

        body[data-theme="dark"], body.dark {
          --bg: #0b0712;
          --text: #ffffff;
          --muted: #b9a7c9;
          --accent: #ff6bcb;
          --card-bg: #0f0b16;
          --btn-bg: linear-gradient(90deg,var(--accent), #ff9ae1);
          --btn-text: #14020a;
          --overlay: rgba(0,0,0,0.85);
        }
        body[data-theme="light"], body.light {
          --bg: #ffffff;
          --text: #0b0712;
          --muted: #6b6b76;
          --accent: #ff6bcb;
          --card-bg: #ffffff;
          --btn-bg: #ffffff;
          --btn-text: #111;
          --overlay: rgba(0,0,0,0.05);
        }

        .boutique { background: linear-gradient(180deg,var(--bg), #f7f7f7); color:var(--text); }
        .brand h1, .brand p { color: var(--text); }
        .brand p, .meta .desc, .panel p, .contact-list div { color: var(--muted); }
        .price { color: var(--accent); }

        .btn { background: var(--btn-bg); color: var(--btn-text); }
        .btn.shop { background: var(--accent); color: var(--btn-text); border: none; }
        .btn.ghost { border-color: rgba(255,255,255,0.06); }

        .lightbox-overlay { background: var(--overlay); }

        /* keep rest of styling (desktop/mobile) from previous version */
        .boutique .brand-logo { box-shadow: 0 8px 20px rgba(2,6,23,0.4); }
        .tabs .tab { padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06); background: transparent; cursor: pointer; color: var(--muted); }
        .tabs .tab.active { background: linear-gradient(90deg,var(--accent),#ff9ae1); color: var(--btn-text); border: none; }
        .gallery .tile img { width:100%; height:180px; object-fit:cover; display:block; border-radius:10px; cursor:pointer; }
        .shop-grid .product img { width:100%; height:140px; object-fit:cover; display:block; cursor:pointer; border-radius:8px; }
        .btn { padding:8px 10px; border-radius:8px; text-decoration:none; display:inline-block; }
        .btn.ghost { background:transparent; color:inherit; }
        .lightbox-inner img { max-width: 100%; max-height: 100%; border-radius: 10px; display:block; }

        @media (min-width: 880px) {
          .brand { display: flex; align-items: center; justify-content: space-between; gap: 20px; text-align: left; }
          .brand .brand-logo { width: 96px; height: 96px; margin: 0; }
          .brand h1 { font-size: 24px; }
          .brand p { margin-top: 6px; }

          .tabs { justify-content: flex-start !important; margin-left: 12px; }

          .gallery { grid-template-columns: repeat(4, 1fr) !important; gap: 14px !important; }
          .gallery .tile img { height: 220px !important; }

          .shop-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 14px !important; }
          .shop-grid .product { min-height: 280px; }
          .shop-grid .product img { height: 180px; }

          .shop-grid .product { flex-direction: row; }
          .shop-grid .product > div[style] { width: 48%; flex: 0 0 48%; }
          .shop-grid .product .meta { width: 52%; padding-left: 16px; }

          .shop-grid .product .actions { justify-content: flex-start; }

          .lightbox-inner { max-width: 80%; max-height: 80%; padding: 10px; }
        }
      `}</style>

      <div className="boutique" style={{ minHeight: "100vh" }}>
        <main className="wrap" role="main" aria-label="Boutique template preview">
          <section className="brand" aria-labelledby="brand-title" style={{ textAlign: "center", marginBottom: 16 }}>
            {logo ? <div className="brand-logo" style={{ backgroundImage: `url('${logo}')`, width: 72, height: 72, borderRadius: 999, margin: "0 auto 12px", backgroundSize: "cover" }} aria-hidden /> : null}
            <h1 id="brand-title" style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{brandName}</h1>
            {tagline ? <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{tagline}</p> : null}

            {/* Social icons horizontally in the hero */}
            <div style={{ marginTop: 10 }}>
              <nav style={{ display: "inline-flex", gap: 8 }} aria-label="social links">
                {instagram ? (
                  <a className="btn" href={socialHref("instagram", instagram)} target="_blank" rel="noreferrer" aria-label="Instagram">
                    <Icons.instagram />
                  </a>
                ) : null}
                {tiktok ? (
                  <a className="btn" href={socialHref("tiktok", tiktok)} target="_blank" rel="noreferrer" aria-label="TikTok">
                    <Icons.tiktok />
                  </a>
                ) : null}
                {pinterest ? (
                  <a className="btn" href={socialHref("pinterest", pinterest)} target="_blank" rel="noreferrer" aria-label="Pinterest">
                    <Icons.pinterest />
                  </a>
                ) : null}
                {website ? (
                  <a className="btn" href={socialHref("website", website)} target="_blank" rel="noreferrer" aria-label="Website">
                    <Icons.website />
                  </a>
                ) : null}
                {email ? (
                  <a className="btn" href={socialHref("email", email)} aria-label="Email">
                    <Icons.email />
                  </a>
                ) : null}
                {phone ? (
                  <a className="btn" href={socialHref("phone", phone)} aria-label="Phone">
                    <Icons.phone />
                  </a>
                ) : null}
              </nav>
            </div>
          </section>

          <nav className="tabs" role="tablist" aria-label="Profile tabs" style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
            {hasGallery ? <button className={`tab ${activeTab === "works" ? "active" : ""}`} onClick={() => setActiveTab("works")}>Lookbook</button> : null}
            {hasShop ? <button className={`tab ${activeTab === "shop" ? "active" : ""}`} onClick={() => setActiveTab("shop")}>Shop</button> : null}
            {hasAbout ? <button className={`tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button> : null}
            <button className={`tab ${activeTab === "contact" ? "active" : ""}`} onClick={() => setActiveTab("contact")}>Contact</button>
          </nav>

          <section className="panels" aria-live="polite">
            {activeTab === "works" && hasGallery ? (
              <article className="panel active" role="tabpanel">
                <h3 style={{ margin: "0 0 12px" }}>Lookbook</h3>
                <div className="gallery" aria-label="Lookbook gallery" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  {galleryToShow.map((src, i) => (
                    <div className="tile" key={i} role="button" tabIndex={0} onClick={() => {
                      // lightbox index must reference works set (if singleCollection used we limited to up to 3)
                      openWorksLightbox(i);
                    }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openWorksLightbox(i); }} aria-label={`Open look ${i + 1}`}>
                      <img src={src} alt={`Collection ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {activeTab === "shop" && hasShop ? (
              <article className="panel active" role="tabpanel">
                <h3 style={{ margin: "0 0 12px" }}>Shop</h3>
                <div className="shop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  {productsToShow.map((p, i) => {
                    const contactLink = productContactLink(p.title);
                    return (
                      <article className="product" key={i} style={{ borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 220 }}>
                        {p.image ? (
                          <div style={{ height: 140, overflow: "hidden", borderRadius: 8 }}>
                            <img src={p.image} alt={p.title || `product ${i + 1}`} onClick={() => openShopLightbox(i)} style={{ width: "100%", height: 140, objectFit: "cover", cursor: "pointer" }} />
                          </div>
                        ) : <div style={{ height: 140, background: "#f6f6f6" }} />}
                        <div className="meta" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                          {contactLink ? (
                            <a href={contactLink} target={contactLink.startsWith("http") ? "_blank" : undefined} rel={contactLink.startsWith("http") ? "noreferrer" : undefined} style={{ textDecoration: "none", color: "inherit" }}>
                              <div className="title" style={{ fontWeight: 800, fontSize: 14 }}>{p.title || (showFooter ? "Product" : "")}</div>
                              <div className="price" style={{ fontWeight: 900, color: "var(--accent)" }}>{p.price || (showFooter ? "$0" : "")}</div>
                            </a>
                          ) : (
                            <>
                              <div className="title" style={{ fontWeight: 800, fontSize: 14 }}>{p.title || (showFooter ? "Product" : "")}</div>
                              <div className="price" style={{ fontWeight: 900, color: "var(--accent)" }}>{p.price || (showFooter ? "$0" : "")}</div>
                            </>
                          )}
                          {p.desc ? <div style={{ color: "var(--muted)", fontSize: 13 }}>{p.desc}</div> : null}
                          <div className="actions" style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                            {contactLink ? (
                              <a className="btn shop" href={contactLink} target={contactLink.startsWith("http") ? "_blank" : undefined} rel={contactLink.startsWith("http") ? "noreferrer" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 8 }} aria-label="Contact about product">
                                {phone ? "Call" : (showFooter ? "Shop" : "Enquire")}
                              </a>
                            ) : (
                              <a className="btn shop" href={ctaHref} style={{ display: "inline-flex", alignItems: "center", gap: 8 }} aria-label="Contact">
                                {phone ? "Call" : (showFooter ? "Shop" : "Enquire")}
                              </a>
                            )}
                            <button className="btn ghost" onClick={() => {
                              // Details fallback: scroll to contact tab
                              setActiveTab("contact");
                              try { const el = document.querySelector("#contact"); if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth" }); } catch {}
                            }}>Details</button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </article>
            ) : null}

            {activeTab === "about" && hasAbout ? (
              <article className="panel active" role="tabpanel">
                <h3 style={{ margin: "0 0 12px" }}>About</h3>
                <p style={{ color: "var(--muted)" }}>{bio}</p>
              </article>
            ) : null}

            {activeTab === "contact" ? (
              <article id="contact" className="panel active" role="tabpanel">
                <h3 style={{ margin: "0 0 12px" }}>Contact</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {instagram ? <div><strong>Instagram:</strong> <a href={socialHref("instagram", instagram)} target="_blank" rel="noreferrer">{instagram}</a></div> : (showFooter ? <div><strong>Instagram:</strong> @yourhandle</div> : null)}
                  {tiktok ? <div><strong>TikTok:</strong> <a href={socialHref("tiktok", tiktok)} target="_blank" rel="noreferrer">{tiktok}</a></div> : null}
                  {pinterest ? <div><strong>Pinterest:</strong> <a href={socialHref("pinterest", pinterest)} target="_blank" rel="noreferrer">{pinterest}</a></div> : null}
                  {website ? <div><strong>Website:</strong> <a href={socialHref("website", website)} target="_blank" rel="noreferrer">{website}</a></div> : null}
                  {email ? <div><strong>Email:</strong> <a href={socialHref("email", email)}>{email}</a></div> : (showFooter ? <div><strong>Email:</strong> maya@example.com</div> : null)}
                  {phone ? <div><strong>Phone:</strong> <a href={socialHref("phone", phone)}>{phone}</a></div> : (showFooter ? <div><strong>Phone:</strong> +1 555 555 5555</div> : null)}
                </div>

                {(contactUrl || showFooter) && (
                  <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
                    {contactUrl ? <a className="btn shop" href={contactUrl} target="_blank" rel="noreferrer">Enquire / Contact</a> : (showFooter ? <button className="btn shop">Enquire / Contact</button> : null)}
                    <div className="qr" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(contactUrl || (typeof window !== "undefined" ? window.location.href : ""))}`} alt="QR" style={{ width: 84, height: 84, borderRadius: 8 }} />
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>
                        <div>Download QR</div>
                        <a className="btn shop" href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(contactUrl || (typeof window !== "undefined" ? window.location.href : ""))}`} download style={{ padding: "8px 10px", fontSize: 13 }}>Download</a>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ) : null}
          </section>

          <footer style={{ marginTop: 28, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            © {brandName || "Éclat Boutique"} — handcrafted collections. <br /> Terms • Shipping • Privacy
          </footer>

          {showFooter ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <button className="btn ghost" onClick={() => router.push("/templates-preview")}>Back</button>
              <button className="btn shop" onClick={() => router.push("/onboarding/boutique-fashion")}>Use this template</button>
            </div>
          ) : null}
        </main>
      </div>

      {/* Lightbox overlay */}
      {lightboxState && currentLightboxUrl ? (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Image preview">
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" aria-label="Close" onClick={closeLightbox}>×</button>
            {((lightboxState.kind === "works" && galleryToShow.length > 1) || (lightboxState.kind === "shop" && productsToShow.length > 1)) && <button className="lightbox-nav prev" aria-label="Previous image" onClick={prevLightbox}>‹</button>}
            <img src={currentLightboxUrl} alt="Preview" />
            {((lightboxState.kind === "works" && galleryToShow.length > 1) || (lightboxState.kind === "shop" && productsToShow.length > 1)) && <button className="lightbox-nav next" aria-label="Next image" onClick={nextLightbox}>›</button>}
          </div>
        </div>
      ) : null}
    </>
  );
}