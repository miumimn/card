"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type PhotographerData = {
  name?: string;
  tagline?: string;
  specialty?: string;                    // <-- add this (merged.specialty)
  specialty_list?: string[] | string;    // <-- add this (merged.specialty_list)
  about?: string;
  specialties?: string[] | string;
  gallery?: string[] | string;
  portfolioImages?: string[] | string;   // alias used by merged.portfolioImages
  portfolio_images?: string[] | string;  // alias used by merged.portfolio_images
  photos?: string[] | string;            // alias used by merged.photos
  images?: string[] | string;            // alias used by merged.images
  avatar?: string | string[];
  avatar_url?: string;                   // alias used by merged.avatar_url
  profileImage?: string | string[];      // alias used by merged.profileImage
  profile_image?: string | string[];     // alias used by merged.profile_image
  heroImage?: string | string[];
  hero_image?: string | string[];        // alias used by merged.hero_image
  banner?: string | string[];            // alias used by merged.banner
  email?: string;
  phone?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  booking_contact?: string;
  booking_link?: string;
  profile_url?: string;
  other_links?: string[] | string;
  extra_fields?: any;
};

function parseList(val: any): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "object") {
    try {
      return Object.values(val).map(String).filter(Boolean);
    } catch {}
    return [];
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p)) return p.map(String).filter(Boolean);
    } catch {}
    if (s.includes("\n")) return s.split("\n").map(x => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
}

/**
 * PhotographerPreview
 *
 * Updated to display clickable social/link logos (icons) in the hero.
 * Preserves previous behavior (gallery resolution, booking_contact handling, layout/styling).
 */
export default function PhotographerPreview({
  data,
  showFooter = true,
}: {
  data?: PhotographerData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"portfolio" | "gallery" | "contact">("gallery");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");
  const [resolvedGallery, setResolvedGallery] = useState<string[]>([]);
  const [resolving, setResolving] = useState<boolean>(false);

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
  }, []);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
      } catch {}
    }
    return out as PhotographerData;
  }, [data]);

  const name = merged.name ?? (showFooter ? "Ivy Park Photography" : "");
  const tagline = merged.tagline ?? merged.specialty ?? (showFooter ? "Portraits • Weddings • Editorial" : "");
  const about = merged.about ?? (showFooter ? "I capture authentic, emotive images — available for weddings, portraits and commercial work." : "");
  const specialties = parseList(merged.specialties ?? merged.specialty_list ?? merged.extra_fields?.specialties);

  // PRIORITY: prefer portfolioImages / portfolio_images (uploader writes canonical public URLs)
  const rawGallery =
    merged.portfolioImages ??
    merged.portfolio_images ??
    merged.extra_fields?.portfolioImages ??
    merged.extra_fields?.portfolio_images ??
    merged.gallery ??
    merged.photos ??
    merged.images ??
    merged.extra_fields?.gallery ??
    [];

  const avatarCandidates = parseList(merged.avatar ?? merged.extra_fields?.avatar);
  const avatar = avatarCandidates.length ? avatarCandidates[0] : (showFooter ? "https://picsum.photos/seed/photog-avatar/400/400" : "");
  const email = merged.email ?? "";
  const phone = merged.phone ?? "";
  const instagram = (merged.instagram ?? merged.extra_fields?.instagram ?? "").toString().trim();
  const tiktok = (merged.tiktok ?? merged.extra_fields?.tiktok ?? "").toString().trim();
  const website = (merged.website ?? merged.extra_fields?.website ?? "").toString().trim();
  const otherLinks = parseList(merged.other_links ?? merged.extra_fields?.other_links);
  const bookingRaw = (merged.booking_contact ?? merged.booking_link ?? merged.profile_url ?? "").toString().trim();

  // Build public URL from storage path by encoding per-segment
  const buildPublicUrlFromPath = (path: string) => {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "") : "";
    if (!base) return path;
    if (/^https?:\/\//i.test(path)) return path;
    if (path.includes("/storage/v1/object/public/")) return path;
    let p = path.replace(/^\/+/, "");
    if (p.startsWith("onboarding-uploads/")) p = p.slice("onboarding-uploads/".length);
    const encoded = p.split("/").map((s) => encodeURIComponent(s)).join("/");
    return `${base}/storage/v1/object/public/onboarding-uploads/${encoded}`;
  };

  const normalizeGalleryEntry = (entry: any) => {
    if (!entry) return "";
    if (typeof entry === "object") {
      if (entry.publicUrl) return String(entry.publicUrl);
      if (entry.publicURL) return String(entry.publicURL);
      if (entry.url) return String(entry.url);
      if (entry.path) return buildPublicUrlFromPath(String(entry.path));
      try {
        const maybe = String(entry);
        if (maybe && maybe.startsWith("http")) return maybe;
      } catch {}
      return "";
    }
    const s = String(entry).trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    return buildPublicUrlFromPath(s);
  };

  // derive initial normalized gallery (may still not load if variant mismatch)
  const initialNormalizedGallery = useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(rawGallery)) list = rawGallery;
    else if (typeof rawGallery === "string") {
      try {
        const parsed = JSON.parse(rawGallery);
        if (Array.isArray(parsed)) list = parsed;
        else list = [rawGallery];
      } catch {
        if (rawGallery.includes("\n")) list = rawGallery.split("\n").map((s: string) => s.trim()).filter(Boolean);
        else if (rawGallery.includes(",")) list = rawGallery.split(",").map((s: string) => s.trim()).filter(Boolean);
        else list = [rawGallery];
      }
    } else if (rawGallery) list = [rawGallery];

    const norm = list.map(normalizeGalleryEntry).filter(Boolean);
    // dedupe while preserving order
    const seen = new Set<string>();
    const dedup: string[] = [];
    for (const u of norm) {
      if (!seen.has(u)) {
        seen.add(u);
        dedup.push(u);
      }
    }
    return dedup.slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rawGallery), process.env.NEXT_PUBLIC_SUPABASE_URL]);

  // image probe using Image onload/onerror (works around CORS HEAD issues)
  const probeImage = (url: string, timeout = 6000) =>
    new Promise<boolean>((resolve) => {
      try {
        const img = new Image();
        let done = false;
        const onOk = () => { if (!done) { done = true; resolve(true); } };
        const onFail = () => { if (!done) { done = true; resolve(false); } };
        img.onload = onOk;
        img.onerror = onFail;
        img.src = url;
        // timeout fallback
        setTimeout(() => { if (!done) { done = true; resolve(false); } }, timeout);
      } catch {
        resolve(false);
      }
    });

  // try variants for a candidate URL/path and return first working URL
  const findWorkingVariant = async (candidate: string) => {
    if (!candidate) return "";
    const tries: string[] = [];

    // 1) try as-is
    tries.push(candidate);

    // 2) if contains encoded %2F -> try decoded variant (replace %2F with /)
    if (candidate.includes("%2F")) {
      tries.push(candidate.replace(/%2F/g, "/"));
    }

    // 3) if contains decoded slashes after public/onboarding-uploads -> try encoding those segments
    try {
      const marker = "/storage/v1/object/public/onboarding-uploads/";
      if (candidate.includes(marker)) {
        const parts = candidate.split(marker);
        const base = parts[0] + marker;
        const rest = parts[1] || "";
        const encoded = rest.split("/").map((s) => encodeURIComponent(decodeURIComponent(s))).join("/");
        tries.push(base + encoded);
      } else if (!/^https?:\/\//i.test(candidate)) {
        // candidate looks like a storage path (no scheme) -> build public with encoded segments
        tries.push(buildPublicUrlFromPath(candidate));
      }
    } catch {}

    // 4) final attempt: encode whole path portion (safe fallback)
    try {
      const urlObj = new URL(candidate, window.location.origin);
      const path = urlObj.pathname;
      const idx = path.indexOf("/onboarding-uploads/");
      if (idx >= 0) {
        const before = candidate.slice(0, candidate.indexOf("/onboarding-uploads/") + "/onboarding-uploads/".length);
        const rest = candidate.slice(candidate.indexOf("/onboarding-uploads/") + "/onboarding-uploads/".length);
        const encodedRest = rest.split("/").map((s) => encodeURIComponent(s)).join("/");
        tries.push(before + encodedRest);
      }
    } catch {}

    // dedupe tries
    const uniq = Array.from(new Set(tries));

    for (const t of uniq) {
      // small optimization: skip empty
      if (!t) continue;
      // probe
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== "production") console.log("[PhotographerPreview] testing image URL:", t);
      // attempt to load image
      // NOTE: using Image probe avoids HEAD CORS issues
      // but some Supabase public URLs may be blocked by RLS/policy - probe will fail in that case
      // eslint-disable-next-line no-await-in-loop
      const ok = await probeImage(t);
      if (ok) return t;
    }
    return "";
  };

  // resolve gallery variants to working urls and set resolvedGallery
  useEffect(() => {
    let mounted = true;
    (async () => {
      setResolving(true);
      const out: string[] = [];
      for (const cand of initialNormalizedGallery) {
        // eslint-disable-next-line no-await-in-loop
        const win = await findWorkingVariant(cand);
        if (win) out.push(win);
        else {
          // if nothing worked, still push the original candidate so UI can attempt to show it (will be broken)
          out.push(cand);
        }
        // stop early if we have 12
        if (out.length >= 12) break;
      }
      if (mounted) {
        setResolvedGallery(out);
        setResolving(false);
        // eslint-disable-next-line no-console
        if (process.env.NODE_ENV !== "production") console.log("[PhotographerPreview] resolvedGallery:", out);
      }
    })();
    return () => { mounted = false; };
    // intentionally depend on the normalized gallery
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialNormalizedGallery), process.env.NEXT_PUBLIC_SUPABASE_URL]);

  // progressive reveal
  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll(".photog-gallery img"));
    imgs.forEach((img) => {
      (img as HTMLImageElement).style.opacity = "0";
      (img as HTMLImageElement).style.transform = "translateY(8px)";
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.transition = "opacity .6s ease, transform .6s ease";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll(".photog-gallery img").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [resolvedGallery]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

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
  const bookingTarget = isPhoneLike(bookingRaw) ? undefined : "_blank";
  const bookingRel = isPhoneLike(bookingRaw) ? undefined : "noreferrer";

  const buildSocialHref = (value: string, provider: string) => {
    if (!value) return "";
    if (/^https?:\/\//.test(value)) return value;
    switch (provider) {
      case "instagram": return `https://instagram.com/${value.replace(/^@/, "")}`;
      case "tiktok": return `https://www.tiktok.com/@${value.replace(/^@/, "")}`;
      case "website": return value.startsWith("http") ? value : `https://${value}`;
      default: return value;
    }
  };

  // Social icon components (keeps styling compact and inlined as SVGs)
  const Icon = {
    Instagram: ({ size = 18 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>
    ),
    TikTok: ({ size = 18 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M16 8.5c-.6 0-1.1-.2-1.5-.5v6.5a3.5 3.5 0 1 1-3.5-3.5v-1.5a5 5 0 1 0 5 5V8.5z" fill="currentColor"/></svg>
    ),
    Website: ({ size = 18 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M2 12h20" stroke="currentColor" strokeWidth="1.2"/></svg>
    ),
    Email: ({ size = 18 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M3 6.5h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M21 6.5L12 13 3 6.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
    ),
    Phone: ({ size = 18 }: { size?: number }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M22 16.92v3a1 1 0 0 1-1.11 1 19.86 19.86 0 0 1-8.63-3.18 19.27 19.27 0 0 1-6-6A19.86 19.86 0 0 1 3.08 3.11 1 1 0 0 1 4.1 2h3a1 1 0 0 1 1 .75c.12.6.3 1.2.54 1.79a1 1 0 0 1-.24 1L7.5 7.5a14 14 0 0 0 8 8l1.96-1.96a1 1 0 0 1 1-.24c.59.24 1.19.42 1.79.54a1 1 0 0 1 .75 1v3z" fill="currentColor"/></svg>
    )
  };

  const iconBtnStyle = (enabled = true): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 10,
    background: enabled ? "rgba(255,93,143,0.06)" : "transparent",
    color: enabled ? "#ff5d8f" : "rgba(0,0,0,0.2)",
    border: "1px solid rgba(0,0,0,0.04)",
    textDecoration: "none",
    marginRight: 8
  });

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        :root{ --ph-bg:#fff; --ph-text:#1b1420; --ph-muted:#7b6b78; --ph-accent:#ff5d8f; }
      `}</style>

      <div className="photog-wrap" role="main" style={{ maxWidth: 1100, margin: "18px auto", padding: 16 }}>
        <section className="hero" aria-label="Photographer hero" style={{ borderRadius: 14, overflow: "hidden", padding: 18, background: "linear-gradient(90deg, rgba(255,93,143,0.04), rgba(0,0,0,0.01))", display: "flex", gap: 12, alignItems: "center" }}>
          <div className="avatar" style={avatar ? { width: 88, height: 88, borderRadius: 12, backgroundSize: "cover", backgroundImage: `url('${avatar}')`, border: "4px solid #fff", flex: "0 0 88px" } : undefined} />
          <div className="meta" style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontWeight: 900 }}>{name}</h1>
            <div className="tag" style={{ marginTop: 6, color: "var(--ph-muted)", fontWeight: 700 }}>{tagline}</div>

            <div className="info-row" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
              {/* Social icons as links */}
              {instagram ? (
                <a href={buildSocialHref(instagram, "instagram")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Instagram">
                  <Icon.Instagram />
                </a>
              ) : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><Icon.Instagram /></span> : null)}

              {tiktok ? (
                <a href={buildSocialHref(tiktok, "tiktok")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="TikTok">
                  <Icon.TikTok />
                </a>
              ) : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><Icon.TikTok /></span> : null)}

              {website ? (
                <a href={buildSocialHref(website, "website")} target="_blank" rel="noreferrer" style={{ ...iconBtnStyle(true), color: "#0b1320" }} aria-label="Website">
                  <Icon.Website />
                </a>
              ) : (showFooter ? <span style={{ ...iconBtnStyle(false), color: "#0b1320" }} aria-hidden><Icon.Website /></span> : null)}

              {/* Email / phone quick actions */}
              {email ? (
                <a href={`mailto:${email}`} style={iconBtnStyle(true)} aria-label="Email">
                  <Icon.Email />
                </a>
              ) : null}
              {phone ? (
                <a href={`tel:${phone}`} style={iconBtnStyle(true)} aria-label="Phone">
                  <Icon.Phone />
                </a>
              ) : null}

              <div style={{ flex: 1 }} />

              <div className="actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {bookingHref ? (
                  <a className="btn" href={bookingHref} target={bookingTarget} rel={bookingRel} style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(90deg,var(--ph-accent),#ff8aa6)", color: "#fff", fontWeight: 800, textDecoration: "none" }}>
                    {isPhoneLike(bookingRaw) ? "Call to Book" : "Book"}
                  </a>
                ) : null}
                {email ? <a className="btn ghost" href={`mailto:${email}`} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", textDecoration: "none" }}>Email</a> : null}
              </div>
            </div>

            {specialties.length ? (
              <div className="specialties" style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {specialties.map((s, i) => <div key={i} className="chip" style={{ padding: "6px 8px", background: "#fff", border: "1px solid rgba(0,0,0,0.04)", borderRadius: 999, fontWeight: 700, color: "var(--ph-muted)" }}>{s}</div>)}
              </div>
            ) : null}
          </div>
        </section>

        <nav className="tabs" role="tablist" aria-label="photographer tabs" style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className={`tab ${tab === "gallery" ? "active" : ""}`} onClick={() => setTab("gallery")} style={{ padding: 8, borderRadius: 10, border: tab === "gallery" ? "none" : "1px solid rgba(0,0,0,0.04)" }}>Gallery</button>
          <button className={`tab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")} style={{ padding: 8, borderRadius: 10, border: tab === "portfolio" ? "none" : "1px solid rgba(0,0,0,0.04)" }}>Portfolio</button>
          <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")} style={{ padding: 8, borderRadius: 10, border: tab === "contact" ? "none" : "1px solid rgba(0,0,0,0.04)" }}>Contact</button>
        </nav>

        <section className="panel" style={{ display: tab === "gallery" ? "block" : "none" }}>
          <div className="photog-gallery" aria-live="polite" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", marginTop: 12 }}>
            {(resolvedGallery.length ? resolvedGallery : (showFooter ? [
              "https://picsum.photos/seed/p1/800/600",
              "https://picsum.photos/seed/p2/800/600",
              "https://picsum.photos/seed/p3/800/600",
              "https://picsum.photos/seed/p4/800/600",
            ] : [])).map((src, i) => (
              <img key={i} src={src} alt={`photo ${i + 1}`} onClick={() => openLightbox(src)} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, cursor: "pointer" }} />
            ))}
          </div>
          {resolving && <div style={{ color: "var(--ph-muted)", marginTop: 8 }}>Resolving images...</div>}
        </section>

        <section className="panel" style={{ display: tab === "portfolio" ? "block" : "none" }}>
          <h3 style={{ marginTop: 0 }}>Portfolio</h3>
          <p style={{ color: "var(--ph-muted)" }}>{about}</p>
          <div className="gallery-grid" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2,1fr)", marginTop: 12 }}>
            {resolvedGallery[0] ? <img src={resolvedGallery[0]} alt="featured" onClick={() => openLightbox(resolvedGallery[0])} style={{ width: "100%", borderRadius: 10 }} /> : <img src="https://picsum.photos/seed/p1/1200/800" alt="featured" onClick={() => openLightbox("https://picsum.photos/seed/p1/1200/800")} style={{ width: "100%", borderRadius: 10 }} />}
            {resolvedGallery[1] ? <img src={resolvedGallery[1]} alt="featured2" onClick={() => openLightbox(resolvedGallery[1])} style={{ width: "100%", borderRadius: 10 }} /> : <img src="https://picsum.photos/seed/p2/1200/800" alt="featured2" onClick={() => openLightbox("https://picsum.photos/seed/p2/1200/800")} style={{ width: "100%", borderRadius: 10 }} />}
          </div>
        </section>

        <section className="panel" style={{ display: tab === "contact" ? "block" : "none" }}>
          <h3 style={{ marginTop: 0 }}>Contact</h3>
          <div style={{ color: "var(--ph-muted)" }}>
            <p><strong>Phone:</strong> {phone ? <a href={`tel:${phone}`}>{phone}</a> : "—"}</p>
            <p><strong>Email:</strong> {email ? <a href={`mailto:${email}`}>{email}</a> : "—"}</p>

            {otherLinks.length ? (
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {otherLinks.map((l, i) => <a key={i} className="btn ghost" href={l.startsWith("http") ? l : `https://${l}`} target="_blank" rel="noreferrer" style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(0,0,0,0.04)", textDecoration: "none" }}>{l}</a>)}
              </div>
            ) : null}

            <div style={{ marginTop: 12 }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(merged.profile_url || clientHref)}`} alt="QR code" style={{ width: 120, height: 120, borderRadius: 10, background: "white", padding: 8 }} />
              <small className="muted" style={{ display: "block", marginTop: 8 }}>Scan to view my profile</small>
            </div>
          </div>
        </section>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn ghost" onClick={() => router.push("/templates-preview")} style={{ padding: "8px 12px", borderRadius: 10, background: "transparent", border: "1px solid rgba(0,0,0,0.06)" }}>Back</button>
          {showFooter ? <button className="btn" onClick={() => router.push("/onboarding/photographer")} style={{ padding: "8px 12px", borderRadius: 10, background: "linear-gradient(90deg,var(--ph-accent),#ff8aa6)", color: "#fff" }}>Use this template</button> : null}
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