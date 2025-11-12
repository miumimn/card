"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = { title: string; price?: string; desc?: string; image?: string; category?: string; notes?: string };

type ChefPreviewProps = {
  data?: any;
  showFooter?: boolean;
};

export default function ChefPreview({ data, showFooter = true }: ChefPreviewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("about");

  // Merge top-level and extra_fields (if present)
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
        // ignore parse errors
      }
    }
    return out;
  }, [data]);

  // parseImageField: accepts arrays, objects (common upload shapes), JSON strings, comma lists, or single url
  function parseImageField(value: any): string[] {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) {
      const out: string[] = [];
      for (const item of value) {
        if (!item && item !== "") continue;
        if (typeof item === "string") out.push(item);
        else if (typeof item === "object" && item !== null) {
          const candidate = item.url || item.src || item.path || item.secure_url || item.publicURL || item.public_url || item.fileUrl || item.file_url || item.preview || item.filename || "";
          if (candidate) out.push(String(candidate));
        }
      }
      return out.filter(Boolean);
    }
    if (typeof value === "object") {
      const candidate = value.url || value.src || value.path || value.secure_url || value.publicURL || value.public_url || value.fileUrl || value.file_url || value.preview || value.filename || "";
      return candidate ? [String(candidate)] : [];
    }
    if (typeof value === "string") {
      const s = value.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
        if (typeof parsed === "object" && parsed !== null) {
          const c = parsed.url || parsed.src || parsed.path || parsed.secure_url || parsed.publicURL || parsed.public_url || parsed.fileUrl || parsed.file_url || parsed.preview || parsed.filename || "";
          if (c) return [String(c)];
        }
      } catch {}
      if (s.includes(",")) return s.split(",").map((p) => p.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }

  // parseMenuField: accepts array of objects, array of strings, or newline-separated string
  function parseMenuField(value: any): MenuItem[] {
    const out: MenuItem[] = [];
    if (!value && value !== "") return out;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item) continue;
        if (typeof item === "string") {
          const parts = item.split("|").map((s) => s.trim());
          const titlePrice = parts[0] ?? "";
          const [title, price] = titlePrice.split(/—|-|–/).map((s) => s.trim());
          out.push({ title: title || titlePrice, price: price || undefined, desc: parts[1] || undefined, category: parts[2] || undefined });
        } else if (typeof item === "object") {
          const imgs = parseImageField(item.image ?? item.photo ?? item.img);
          out.push({
            title: item.title || item.name || item.label || "",
            price: item.price || item.cost || "",
            desc: item.desc || item.description || "",
            image: imgs[0] || "",
            category: item.category || item.section || item.tag || "",
            notes: item.notes || item.ingredients || ""
          });
        }
      }
      return out.filter((i) => i.title);
    }
    if (typeof value === "string") {
      const lines = value.split("\n").map((l) => l.trim()).filter(Boolean);
      for (const l of lines) {
        const parts = l.split("|").map((s) => s.trim());
        const titlePrice = parts[0] ?? "";
        const [title, price] = titlePrice.split(/—|-|–/).map((s) => s.trim());
        out.push({ title: title || titlePrice, price: price || undefined, desc: parts[1] || undefined, category: parts[2] || undefined });
      }
    }
    return out.filter((i) => i.title);
  }

  // Small set of SVG icons for socials (kept inline so styles remain local)
  const SocialIcons: Record<string, React.FC<{ size?: number }>> = {
    instagram: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" stroke="currentColor" strokeWidth="1.2"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>),
    facebook: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13 3h3v4h-3v10h-4V7H6V3h3V1.5A3.5 3.5 0 0 1 12 0c1 0 1 .5 1 .5V3z"/></svg>),
    twitter: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 5.9c-.6.3-1.3.5-2 .6.7-.4 1.2-1 1.4-1.8-.7.4-1.4.6-2.2.8C18 4 17 3.5 15.9 3.5c-2 0-3.5 1.6-3.5 3.6 0 .3 0 .6.1.9C9 7.8 6.5 6.6 4.9 4.6c-.4.7-.5 1.4-.5 2.2 0 1.3.7 2.4 1.7 3-.5 0-1-.2-1.4-.4v.1c0 2 1.4 3.6 3.2 4-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.2 3 2.2-1.2 1-2.8 1.6-4.5 1.6H6c1.6 1 3.4 1.6 5.3 1.6 6.4 0 9.9-5.4 9.9-10.2v-.5c.7-.5 1.2-1.2 1.6-2"/></svg>),
    tiktok: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M16 8.5c-.6 0-1.1-.2-1.5-.5v6.5a3.5 3.5 0 1 1-3.5-3.5v-1.5a5 5 0 1 0 5 5V8.5z"/></svg>),
    pinterest: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2C6 2 2 6 2 11c0 3.1 1.7 5.7 4.2 6.9-.1-.6-.2-1.6 0-2.3.2-.6 1.4-4 .1-6C6 8 9 7 10.6 8c.7.4 1 1 1 1.7 0 1-.6 2-1 2.4-.3.4-.8 1.2-.4 2.6.2.8 1 1.3 2 1.3 2.5 0 4.4-3 4.4-7.1 0-3.1-2.1-5.2-5.1-5.2z"/></svg>),
    youtube: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21.6 7.2s-.2-1.6-.8-2.2c-.8-.8-1.7-.8-2.1-.9C15.7 3.8 12 3.8 12 3.8h-.1s-3.7 0-6.6.3c-.4 0-1.4.1-2.1.9C2 5.6 1.8 7.2 1.8 7.2S1.5 9 1.5 10.8v1.4c0 1.8.3 3.6.3 3.6s.2 1.6.8 2.2c.8.8 1.9.8 2.4.9 1.8.1 7.8.3 7.8.3s3.7 0 6.6-.3c.4 0 1.4-.1 2.1-.9.6-.6.8-2.2.8-2.2s.3-1.8.3-3.6v-1.4c0-1.8-.3-3.6-.3-3.6zM10 14.5v-5l4 2.5-4 2.5z"/></svg>),
    linkedin: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM8.5 18.5H6V10h2.5v8.5zM7.25 8.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zM18.5 18.5h-2.5v-4.5c0-1.1-.4-1.9-1.3-1.9-.7 0-1.1.5-1.3 1v5.4H10V10h2.4v1.1c.4-.7 1.1-1.5 2.6-1.5 1.9 0 3.5 1.2 3.5 3.9v5z"/></svg>),
    website: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="1.2"/></svg>),
    email: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7.5v9A2.5 2.5 0 0 0 5.5 19h13A2.5 2.5 0 0 0 21 16.5v-9A2.5 2.5 0 0 0 18.5 5h-13A2.5 2.5 0 0 0 3 7.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M21 7.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>),
    phone: ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 16.92v3a1 1 0 0 1-1.11 1A19.86 19.86 0 0 1 13 17.5 19.27 19.27 0 0 1 7 11.5 19.86 19.86 0 0 1 3.1 4.11 1 1 0 0 1 4.1 3h3a1 1 0 0 1 1 .75c.12.6.3 1.2.54 1.79a1 1 0 0 1-.24 1L7.5 7.5a14 14 0 0 0 8 8l1.96-1.96a1 1 0 0 1 1-.24c.59.24 1.19.42 1.79.54a1 1 0 0 1 .75 1v3z"/></svg>),
  };

  // platform brand colors to improve contrast on dark hero
  const socialColors: Record<string, string> = {
    instagram: "#E1306C",
    facebook: "#1877F2",
    twitter: "#1DA1F2",
    tiktok: "#00F2EA",
    pinterest: "#E60023",
    youtube: "#FF0000",
    linkedin: "#0077B5",
    website: "#FFFFFF",
    email: "#FFFFFF",
    phone: "#FFFFFF"
  };

  // helpers
  function socialHref(key: string, value: string) {
    if (!value) return "";
    switch (key) {
      case "instagram": return value.startsWith("http") ? value : `https://instagram.com/${value.replace(/^@/, "")}`;
      case "facebook": return value.startsWith("http") ? value : `https://facebook.com/${value.replace(/^@/, "")}`;
      case "twitter": return value.startsWith("http") ? value : `https://twitter.com/${value.replace(/^@/, "")}`;
      case "tiktok": return value.startsWith("http") ? value : `https://www.tiktok.com/@${value.replace(/^@/, "")}`;
      case "pinterest": return value.startsWith("http") ? value : `https://pinterest.com/${value.replace(/^@/, "")}`;
      case "youtube": return value.startsWith("http") ? value : value;
      case "linkedin": return value.startsWith("http") ? value : value;
      case "website": return value.startsWith("http") ? value : `https://${value}`;
      case "email": return `mailto:${value}`;
      case "phone": return `tel:${String(value).replace(/\s+/g, "")}`;
      default: return value;
    }
  }

  // canonical fields with fallbacks to match existing hardcoded template when no data provided
  const avatarUrls = parseImageField(merged.profileImage ?? merged.profile_image ?? merged.brandLogo ?? merged.logo ?? merged.profile_photo);
  const avatar = avatarUrls.length ? avatarUrls[0] : "https://picsum.photos/id/1005/400/400";
  const name = merged.name || merged.brandName || merged.fullName || "Chef Antonio Ruiz";
  const role = merged.tagline || merged.role || merged.title || "Private Chef • Seasonal Mediterranean";
  const bio = merged.bio || merged.description || "Antonio is a Michelin-trained private chef focusing on seasonal Mediterranean cuisine — in-home dinners, events and tasting menus. He sources local produce and loves open-flame cooking.";

  // socials
  const socials: Record<string,string> = {
    instagram: merged.instagram || merged.instagram_handle || merged.instagram_url || "",
    facebook: merged.facebook || merged.facebook_url || "",
    twitter: merged.twitter || merged.twitter_url || "",
    tiktok: merged.tiktok || merged.tiktok_url || merged.tiktok_handle || "",
    pinterest: merged.pinterest || merged.pinterest_url || "",
    youtube: merged.youtube || merged.youtube_url || "",
    linkedin: merged.linkedin || merged.linkedin_url || "",
    website: merged.website || merged.website_url || "",
    email: merged.email || merged.contact_email || "",
    phone: merged.phone || merged.contact_phone || "",
  };

  // menu parsing (falls back to original sample menu if none provided)
  const menuRaw = merged.menu_items ?? merged.menu ?? merged.dishes ?? merged.products ?? merged.menu_list ?? [
    "Private Tasting Menu — $240pp | 6-course chef's tasting • bespoke menus",
    "Event Catering — | Small events up to 60 guests • custom menu planning",
    "Cooking Masterclass — | Hands-on or demo classes • groups & corporate",
    "Weekly Meal Prep — | Seasonal rotating menus • subscription options"
  ];
  const menuItems = parseMenuField(menuRaw);

  const productAsMenu = Array.isArray(merged.products) && merged.products.length && menuItems.length === 0
    ? merged.products.map((p: any) => {
        const imgs = parseImageField(p.image ?? p.photo ?? p.img);
        return { title: p.title || p.name || p.label || "", price: p.price || p.cost || "", desc: p.desc || p.description || "", image: imgs[0] || "", category: p.category || "", notes: p.notes || "" };
      }).filter((i: any) => i.title)
    : [];

  const finalMenu = menuItems.length ? menuItems : productAsMenu;

  // Menu UI state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const categories = useMemo(() => {
    const s = new Set<string>();
    finalMenu.forEach((m) => { if (m.category) s.add(m.category); });
    return ["All", ...Array.from(s)];
  }, [finalMenu]);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "alpha">("default");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const displayedMenu = useMemo(() => {
    let items: MenuItem[] = finalMenu.slice();
    if (activeCategory && activeCategory !== "All") {
      items = items.filter(i => (i.category || "").toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(i => (i.title || "").toLowerCase().includes(q) || (i.desc || "").toLowerCase().includes(q) || (i.price || "").toLowerCase().includes(q));
    }
    if (sortBy === "price-asc") {
      items.sort((a,b) => {
        const na = parseFloat(String(a.price || "").replace(/[^0-9.]/g,"")) || 0;
        const nb = parseFloat(String(b.price || "").replace(/[^0-9.]/g,"")) || 0;
        return na - nb;
      });
    } else if (sortBy === "price-desc") {
      items.sort((a,b) => {
        const na = parseFloat(String(a.price || "").replace(/[^0-9.]/g,"")) || 0;
        const nb = parseFloat(String(b.price || "").replace(/[^0-9.]/g,"")) || 0;
        return nb - na;
      });
    } else if (sortBy === "alpha") {
      items.sort((a,b) => (a.title || "").localeCompare(b.title || ""));
    }
    return items;
  }, [finalMenu, activeCategory, searchTerm, sortBy]);

  useEffect(() => {
    setExpandedIndex(null);
  }, [activeCategory, searchTerm, sortBy]);

  // Enquire link per item: prefer booking_contact (phone/url) -> booking_url -> profile_url -> mailto
  function enquireHref(item?: MenuItem) {
    const bc = merged.booking_contact ?? merged.bookingContact ?? merged.booking;
    if (bc) {
      const s = String(bc).trim();
      if (s.startsWith("tel:")) return s;
      if (/^\+?\d[\d ()\-./]{5,}$/.test(s)) return `tel:${s.replace(/[()\s.-]/g, "")}`;
      if (s.startsWith("http://") || s.startsWith("https://")) return s;
      if (/\./.test(s) && !/\s/.test(s)) return s.startsWith("http") ? s : `https://${s}`;
    }

    if (merged.booking_url) return merged.booking_url;
    if (merged.profile_url) return merged.profile_url;
    if (merged.email) {
      const subject = item?.title ? `Enquiry about ${item.title}` : `Enquiry`;
      return `mailto:${merged.email}?subject=${encodeURIComponent(subject)}`;
    }
    return "#";
  }

  useEffect(() => {
    // parity no-op
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
/* Mobile-first chef template styles (scoped) */
:root{
  --bg: #0f1720;
  --card: #0b1320;
  --accent: #ff7a18;
  --muted: #bfc9d3;
  --text: #f7fafc;
  --chef-top: url('https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=6f8b3f3b0e3d6b5b1a6f2b5c9d7a7b8c');
}

body.chef-page{
  margin:0;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial;
  background: linear-gradient(180deg, rgba(11,19,32,1), rgba(8,12,18,1));
  color:var(--text);
  -webkit-font-smoothing:antialiased;
}

.card { max-width: 980px; margin: 12px auto; padding: 16px; }

/* HERO */
.hero {
  position:relative;
  border-radius:14px;
  overflow:hidden;
  background-image: linear-gradient(180deg, rgba(10,12,14,0.25), rgba(10,12,14,0.45)), var(--chef-top);
  background-size:cover;
  background-position:center;
  min-height: 44vw;
  display:flex;
  align-items:flex-end;
  padding:18px;
  box-shadow: 0 18px 40px rgba(2,6,23,0.6);
}

.hero-decor { position:absolute; right:12px; top:12px; width:84px; height:84px; opacity:0.14; pointer-events:none; filter:grayscale(1) contrast(.9); }

.hero-meta { display:flex; gap:12px; align-items:center; z-index:2; }
.avatar { width:86px; height:86px; border-radius:999px; border:4px solid rgba(255,255,255,0.95); background-size:cover; background-position:center; flex:0 0 86px; box-shadow: 0 10px 30px rgba(2,6,23,0.48); }
.name { margin:0; font-size:20px; font-weight:800; color:var(--text); }
.role { margin:4px 0 0; color:var(--muted); font-size:13px; font-weight:700; }

.social-row { display:flex; gap:10px; margin-left:8px; align-items:center; }
.social { width:40px; height:40px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; background:rgba(255,255,255,0.06); color:var(--text); border:1px solid rgba(255,255,255,0.03); text-decoration:none; box-shadow: 0 6px 18px rgba(2,6,23,0.4); }
.social svg { width:16px; height:16px; display:block; }

/* keep rest exactly as before */
.tabs { display:flex; gap:8px; padding:14px 4px; flex-wrap:wrap; }
.tab { padding:8px 12px; border-radius:10px; background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.03); font-weight:700; cursor:pointer; }
.tab.active { background: linear-gradient(90deg, var(--accent), rgba(255,122,24,0.14)); color:#07101a; box-shadow:0 10px 28px rgba(255,122,24,0.06); border:none; }

.panel { display:none; padding:8px 2px 18px; color:var(--muted); line-height:1.6; }
.panel.active { display:block; }

.menu-grid { display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); margin-top:8px; }
.dish { background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01)); padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.03); }
.dish h4 { margin:0 0 6px; color:var(--text); font-size:15px; font-weight:800; }
.dish p { margin:0; font-size:13px; color:var(--muted); }

.testimonials { margin-top:10px; display:grid; gap:10px; }
.testimonial { background: rgba(255,255,255,0.02); padding:10px; border-radius:10px; color:var(--muted); border:1px solid rgba(255,255,255,0.02); }

.map { margin-top:10px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.03); height:160px; }

.menu-controls { display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
.menu-controls input, .menu-controls select { padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.04); background:transparent; color:var(--text); }

.dish-thumb { width:100%; height:120px; border-radius:8px; background:#111; background-size:cover; background-position:center; margin-bottom:6px; }

.cta-row { display:flex; gap:12px; align-items:center; justify-content:space-between; margin-top:14px; flex-wrap:wrap; }
.primary-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:12px; background: linear-gradient(90deg, #ff8a4b, #ff416c); color:#07101a; font-weight:800; border:none; }

@media (min-width:880px){
  .hero { min-height:240px; padding:22px; }
  .card { padding:22px; }
  .avatar { width:110px; height:110px; border-width:6px; flex:0 0 110px; }
  .name { font-size:24px; }
}
` }} />

      <div className="chef-page" style={{ minHeight: "100vh" }}>
        <main className="card" aria-label="Chef template preview">
          <section className="hero" aria-label="Chef hero">
            <svg className="hero-decor" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M10 50c6-10 24-20 44-10" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" fill="none" />
            </svg>

            <div className="hero-meta" role="region" aria-label="Profile">
              <div className="avatar" style={{ backgroundImage: `url('${avatar}')` }} aria-hidden="true" />
              <div>
                <h2 className="name">{name}</h2>
                <p className="role">{role}</p>

                <nav className="social-row" aria-label="social links">
                  {Object.entries(socials).map(([k, v]) => {
                    if (!v) return null;
                    const href = socialHref(k, v);
                    const Icon = SocialIcons[k] ?? SocialIcons.website;
                    const iconColor = socialColors[k] ?? "#ffffff";
                    return (
                      <a key={k} className="social" href={href} target={k === "email" || k === "phone" ? undefined : "_blank"} rel="noreferrer" aria-label={k} title={k}
                        style={{ background: "rgba(255,255,255,0.06)", boxShadow: "0 6px 18px rgba(2,6,23,0.4)", color: iconColor }}>
                        <Icon size={16} />
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>
          </section>

          <div className="tabs" role="tablist" aria-label="Profile tabs">
            <button className={`tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button>
            <button className={`tab ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")}>Menu & Services</button>
            <button className={`tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>Reviews</button>
            <button className={`tab ${activeTab === "location" ? "active" : ""}`} onClick={() => setActiveTab("location")}>Location</button>
            <button className={`tab ${activeTab === "contact" ? "active" : ""}`} onClick={() => setActiveTab("contact")}>Contact</button>
          </div>

          <section className="panels">
            <article id="about" className={`panel ${activeTab === "about" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>About</h3>
              <p>{bio}</p>
            </article>

            <article id="menu" className={`panel ${activeTab === "menu" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>Menu & Services</h3>

              <div className="menu-controls" role="region" aria-label="Menu controls">
                <input
                  placeholder="Search dishes or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search menu"
                  style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", minWidth: 140, background: "transparent", color: "var(--text)" }}
                />

                <select aria-label="Filter by category" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", background: "transparent", color: "var(--text)" }}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select aria-label="Sort menu" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", background: "transparent", color: "var(--text)" }}>
                  <option value="default">Default</option>
                  <option value="alpha">A → Z</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                </select>
              </div>

              <div className="menu-grid" aria-live="polite">
                {displayedMenu.length ? displayedMenu.map((m, idx) => {
                  const expanded = expandedIndex === idx;
                  return (
                    <div className="dish" key={idx} aria-expanded={expanded}>
                      {m.image ? <div className="dish-thumb" style={{ backgroundImage: `url('${m.image}')` }} /> : null}
                      <h4>{m.title}{m.price ? <span style={{ marginLeft: 8, color: "var(--muted)", fontWeight: 700 }}>{m.price}</span> : null}</h4>
                      {m.desc ? <p>{m.desc}</p> : null}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <a className="primary-btn" href={enquireHref(m)} aria-label={`Enquire about ${m.title}`}>Enquire</a>
                        <button className="tab" onClick={() => setExpandedIndex(expanded ? null : idx)} aria-pressed={expanded}>{expanded ? "Hide" : "Details"}</button>
                      </div>
                      {expanded ? (
                        <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
                          {m.category ? <div><strong>Category:</strong> {m.category}</div> : null}
                          {m.notes ? <div style={{ marginTop: 6 }}>{m.notes}</div> : null}
                        </div>
                      ) : null}
                    </div>
                  );
                }) : <p style={{ color: "var(--muted)" }}>No menu or services provided.</p>}
              </div>
            </article>

            <article id="reviews" className={`panel ${activeTab === "reviews" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>Reviews</h3>
              <div className="testimonials">
                {(Array.isArray(merged.reviews) && merged.reviews.length) ? merged.reviews.map((r: any, i: number) => (
                  <div className="testimonial" key={i}>{r.text || r.review || r.comment}</div>
                )) : (
                  <>
                    <div className="testimonial"><div className="who">Emma R.  Host</div>“Incredible meal and service — guests are still talking about it.”</div>
                    <div className="testimonial"><div className="who">Catering Manager — Venue</div>“Professional, timely and the food was outstanding.”</div>
                  </>
                )}
              </div>
            </article>

            <article id="location" className={`panel ${activeTab === "location" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>Service Area</h3>
              {/* USER REQUEST: show location as plain text only (no map iframe) */}
              <p style={{ margin: 0, color: "var(--muted)" }}>{merged.location ?? "Based in Barcelona, available for travel across Europe for events."}</p>
            </article>

            <article id="contact" className={`panel ${activeTab === "contact" ? "active" : ""}`} role="tabpanel">
              <h3 style={{ margin: "0 0 8px" }}>Contact</h3>
              {merged.email ? <p>Email: <a href={`mailto:${merged.email}`} style={{ color: "var(--text)" }}>{merged.email}</a></p> : null}
              <div className="cta-row">
                <a className="primary-btn" href={enquireHref()} aria-label="Request a booking">{merged.booking_label ?? "Request Booking"}</a>

                <div className="qr" aria-label="QR code">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(merged.profile_url ?? "https://example.com/antonio")}`} alt="QR code to profile" style={{ width: 84, height: 84, borderRadius: 8, background: "#fff" }} />
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>Download QR</div>
                    <a href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(merged.profile_url ?? "https://example.com/antonio")}`} download className="primary-btn" style={{ padding: "8px 10px", fontSize: 13 }}>Download</a>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
            {showFooter ? <button className="primary-btn" onClick={() => router.push("/onboarding/chef")}>Use this template</button> : null}
          </div>
        </main>
      </div>
    </>
  );
}