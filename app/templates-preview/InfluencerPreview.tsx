"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface InfluencerPreviewProps {
  data?: any;
  handleSelectTemplate?: (templateName: string) => void;
  onBack?: () => void;
  showFooter?: boolean;
}

/** Helpers */
function toArray(val: any): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "object") {
    try { return Object.values(val).map(String).filter(Boolean); } catch {}
    return [JSON.stringify(val)];
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
function firstVal(val: any): string {
  if (val == null) return "";
  if (Array.isArray(val)) return String(val[0] ?? "");
  return String(val);
}

/** Build public URL from a storage path (per-segment encode) */
function buildPublicUrlFromPath(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "") : "";
  if (!base) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.includes("/storage/v1/object/public/")) return path;
  let p = path.replace(/^\/+/, "");
  if (p.startsWith("onboarding-uploads/")) p = p.slice("onboarding-uploads/".length);
  const encoded = p.split("/").map((s) => encodeURIComponent(s)).join("/");
  return `${base}/storage/v1/object/public/onboarding-uploads/${encoded}`;
}

/** Normalize one gallery entry — prefer DB-provided full URLs, else convert storage paths to public URLs, else try to extract fields */
function normalizeGalleryEntry(entry: any) {
  if (!entry) return "";
  if (typeof entry === "object") {
    if (entry.publicUrl) return String(entry.publicUrl);
    if (entry.publicURL) return String(entry.publicURL);
    if (entry.url) return String(entry.url);
    if (entry.path) return buildPublicUrlFromPath(String(entry.path));
    try {
      const maybe = String(entry);
      if (maybe && /^https?:\/\//i.test(maybe)) return maybe;
    } catch {}
    return "";
  }
  const s = String(entry).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  // treat string like storage path -> convert
  return buildPublicUrlFromPath(s);
}

/** Image probe using Image() (avoids HEAD CORS issues) */
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
      setTimeout(() => { if (!done) { done = true; resolve(false); } }, timeout);
    } catch {
      resolve(false);
    }
  });

/** Try a set of candidate variants and return first working URL */
async function findWorkingVariant(candidate: string) {
  if (!candidate) return "";
  const tries: string[] = [];
  tries.push(candidate);

  if (candidate.includes("%2F")) tries.push(candidate.replace(/%2F/g, "/"));

  try {
    const marker = "/storage/v1/object/public/onboarding-uploads/";
    if (candidate.includes(marker)) {
      const parts = candidate.split(marker);
      const base = parts[0] + marker;
      const rest = parts[1] || "";
      const encoded = rest.split("/").map((s) => encodeURIComponent(decodeURIComponent(s))).join("/");
      tries.push(base + encoded);
    } else if (!/^https?:\/\//i.test(candidate)) {
      tries.push(buildPublicUrlFromPath(candidate));
    }
  } catch {}

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

  const uniq = Array.from(new Set(tries));
  for (const t of uniq) {
    if (!t) continue;
    const ok = await probeImage(t);
    if (ok) return t;
  }
  return "";
}

export default function InfluencerPreview({ data, handleSelectTemplate, onBack, showFooter = true }: InfluencerPreviewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "links" | "contact">("about");
  const [isMobile, setIsMobile] = useState(false);
  const [resolvedGallery, setResolvedGallery] = useState<string[]>([]);
  const [resolving, setResolving] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 880);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
      } catch {}
    }
    return out;
  }, [data]);

  // pick fields
  const name = firstVal(merged.fullName ?? merged.stageName ?? merged.name ?? merged.full_name) || "Creator";
  const role = firstVal(merged.stageName ?? merged.tagline ?? merged.title) || "";
  const bio = firstVal(merged.bio ?? merged.about ?? merged.__bio ?? (merged.extra_fields && merged.extra_fields.bio)) || "";

  const profileImage = (() => {
    if (Array.isArray(merged.profileImage) && merged.profileImage.length) return merged.profileImage[0];
    if (typeof merged.profileImage === "string" && merged.profileImage) return merged.profileImage;
    if (Array.isArray(merged.avatar) && merged.avatar.length) return merged.avatar[0];
    if (typeof merged.avatar === "string" && merged.avatar) return merged.avatar;
    return "https://picsum.photos/id/1027/800/800";
  })();

  // raw gallery source (prefer uploader's portfolioImages/public URLs)
  const rawGallery =
    merged.portfolioImages ??
    merged.portfolio_images ??
    merged.gallery ??
    merged.galleryImages ??
    merged.photos ??
    merged.images ??
    merged.extra_fields?.gallery ??
    [];

  // initial normalized (do not rebuild DB-provided https urls; convert storage paths when needed)
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
    const seen = new Set<string>();
    const dedup: string[] = [];
    for (const u of norm) {
      if (!seen.has(u)) { seen.add(u); dedup.push(u); }
    }
    return dedup.slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rawGallery), process.env.NEXT_PUBLIC_SUPABASE_URL]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setResolving(true);
      const out: string[] = [];
      for (const cand of initialNormalizedGallery) {
        // eslint-disable-next-line no-await-in-loop
        const win = await findWorkingVariant(cand);
        if (win) out.push(win);
        else out.push(cand);
        if (out.length >= 12) break;
      }
      if (mounted) {
        setResolvedGallery(out);
        setResolving(false);
        if (process.env.NODE_ENV !== "production") console.log("[InfluencerPreview] resolvedGallery:", out);
      }
    })();
    return () => { mounted = false; };
  }, [JSON.stringify(initialNormalizedGallery), process.env.NEXT_PUBLIC_SUPABASE_URL]);

  const socials = (() => {
    const keys = ["instagram","tiktok","youtube","snapchat","twitter","facebook","linkedin","website"];
    const out: Array<{ key: string; url: string }> = [];
    keys.forEach(k => {
      const raw = merged[k] ?? merged[`${k}Url`] ?? merged[`${k}_url`] ?? merged[`${k}_handle`] ?? (merged.extra_fields && merged.extra_fields[k]);
      const arr = toArray(raw);
      arr.forEach((entry) => {
        if (!entry) return;
        let url = String(entry).trim();
        if (!/^https?:\/\//i.test(url)) {
          const handle = url.replace(/^@/, "");
          switch (k) {
            case "instagram": url = `https://instagram.com/${handle}`; break;
            case "tiktok": url = `https://tiktok.com/@${handle}`; break;
            case "twitter": url = `https://twitter.com/${handle}`; break;
            case "youtube": url = `https://youtube.com/${handle}`; break;
            case "facebook": url = `https://facebook.com/${handle}`; break;
            case "linkedin": url = `https://linkedin.com/in/${handle}`; break;
            case "snapchat": url = `https://www.snapchat.com/add/${handle}`; break;
            case "website": url = handle.startsWith("http") ? handle : `https://${handle}`; break;
            default: break;
          }
        }
        out.push({ key: k, url });
      });
    });
    return out;
  })();

  const services = toArray(merged.services ?? merged.extra_fields?.services);
  const rates = firstVal(merged.rates ?? merged.extra_fields?.rates);
  const notes = firstVal(merged.notes ?? merged.extra_fields?.notes);
  const email = firstVal(merged.email ?? merged.contact_email ?? merged.extra_fields?.email);
  const phone = firstVal(merged.managerPhone ?? merged.phone ?? merged.contact_phone ?? merged.extra_fields?.managerPhone);
  const website = firstVal(merged.website ?? merged.extra_fields?.website);
  const topLinks = Array.isArray(merged.top_links) ? merged.top_links : toArray(merged.top_links);

  const handleUseTemplate = () => {
    if (handleSelectTemplate) handleSelectTemplate("influencer");
    else router.push("/onboarding/influencer");
  };

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  // mobile-friendly gallery styles
  const galleryCols = isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit,minmax(220px,1fr))";
  const galleryImgHeight = isMobile ? 120 : 160;

  // show media kit only when real file(s) exist
  const hasMediaKit = (() => {
    const mk = merged.mediaKit ?? merged.media_kit ?? merged.extra_fields?.mediaKit ?? merged.extra_fields?.media_kit;
    if (!mk) return false;
    if (Array.isArray(mk)) return mk.length > 0 && mk.some((x) => !!String(x).trim());
    if (typeof mk === "string") return !!mk.trim();
    return false;
  })();

  return (
    <div style={{ padding: 22, minHeight: "100vh", background: "linear-gradient(180deg,#0b1220 0%, #07192a 100%)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
        <aside style={{ width: isMobile ? "100%" : 260, padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ width: isMobile ? 88 : 100, height: isMobile ? 88 : 100, borderRadius: "50%", backgroundSize: "cover", backgroundPosition: "center", backgroundImage: `url("${profileImage}")`, margin: "0 auto" }} />
          <h2 style={{ textAlign: "center", marginTop: 12 }}>{name}</h2>
          {role ? <p style={{ textAlign: "center", color: "#94a3b8" }}>{role}</p> : null}

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
            {socials.map((s, i) => (
              <a key={`${s.key}-${i}`} href={s.url} target="_blank" rel="noreferrer" style={{ width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#081226", color: "#fff", textDecoration: "none" }}>
                <img src={`/svg/${s.key}.svg`} alt={s.key} width={18} height={18} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              </a>
            ))}
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn" onClick={() => {}} style={{ padding: "8px 12px", borderRadius: 999, background: "linear-gradient(90deg,#4f46e5,#06b6d4)", color: "#06101a", border: "none" }}>Work With Me</button>
          </div>
        </aside>

        <main style={{ flex: 1, padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
            <button className={`tab ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")}>Links</button>
            <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </div>

          {tab === "about" && (
            <section>
              <h3>About</h3>
              <p style={{ color: "#94a3b8" }}>{bio || "No bio provided."}</p>

              {services.length ? (
                <div style={{ marginTop: 12 }}>
                  <h4>Services</h4>
                  <div style={{ color: "#94a3b8" }}>{services.join(", ")}</div>
                </div>
              ) : null}

              {rates ? (
                <div style={{ marginTop: 12 }}>
                  <h4>Rates</h4>
                  <div style={{ color: "#94a3b8" }}>{rates}</div>
                </div>
              ) : null}

              {notes ? (
                <div style={{ marginTop: 12 }}>
                  <h4>Notes</h4>
                  <div style={{ color: "#94a3b8" }}>{notes}</div>
                </div>
              ) : null}

              {hasMediaKit ? (
                <div style={{ marginTop: 12 }}>
                  <h4>Media kit</h4>
                  {Array.isArray(merged.mediaKit) ? (
                    <a href={merged.mediaKit[0]} target="_blank" rel="noreferrer">Download media kit</a>
                  ) : (
                    <a href={merged.mediaKit} target="_blank" rel="noreferrer">Download media kit</a>
                  )}
                </div>
              ) : null}

              {resolvedGallery.length ? (
                <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: galleryCols, gap: 8 }}>
                  {resolvedGallery.map((src: string, i: number) => (
                    <img
                      key={i}
                      src={src}
                      alt={`gallery-${i}`}
                      style={{ width: "100%", height: galleryImgHeight, objectFit: "cover", borderRadius: 6, cursor: "pointer" }}
                      onClick={() => openLightbox(src)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          )}

          {tab === "links" && (
            <section>
              <h3>Links</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {socials.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, background: "#071226", borderRadius: 8 }}>
                    <img src={`/svg/${s.key}.svg`} alt={s.key} width={18} height={18} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    <span style={{ color: "#fff" }}>{s.url.replace(/^https?:\/\//, "")}</span>
                  </a>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
                {topLinks.length ? topLinks.map((l: any, i: number) => (
                  <a key={i} href={l.url || "#"} target="_blank" rel="noreferrer" style={{ padding: 12, background: "#0b1228", borderRadius: 8 }}>
                    <strong style={{ color: "#fff" }}>{l.title || l.name || l.url}</strong>
                    {l.source ? <div style={{ color: "#94a3b8" }}>{l.source}</div> : null}
                  </a>
                )) : <div style={{ color: "#94a3b8" }}>No links provided.</div>}
              </div>
            </section>
          )}

          {tab === "contact" && (
            <section>
              <h3>Contact</h3>
              <p style={{ color: "#94a3b8" }}><strong>Email:</strong> {email ? <a href={`mailto:${email}`}>{email}</a> : "—"}</p>
              <p style={{ color: "#94a3b8" }}><strong>Phone:</strong> {phone ? <a href={`tel:${phone}`}>{phone}</a> : "—"}</p>
              {merged.booking_link ? <p style={{ color: "#94a3b8" }}><strong>Booking:</strong> <a href={firstVal(merged.booking_link)} target="_blank" rel="noreferrer">{firstVal(merged.booking_link)}</a></p> : null}
              {website ? <p style={{ color: "#94a3b8" }}><strong>Website:</strong> <a href={website} target="_blank" rel="noreferrer">{website}</a></p> : null}

              {socials.length ? (
                <div style={{ marginTop: 12 }}>
                  <h4>Socials</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {socials.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: 8, background: "#071226", borderRadius: 8 }}>
                        <img src={`/svg/${s.key}.svg`} alt={s.key} width={18} height={18} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        <span style={{ color: "#fff" }}>{s.url.replace(/^https?:\/\//, "")}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </main>
      </div>

      <div style={{ maxWidth: 1100, margin: "20px auto 0", display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {showFooter ? <button className="btn" onClick={handleUseTemplate} style={{ padding: "8px 12px" }}>Use This Template</button> : null}
      </div>

      {lightbox ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)", zIndex: 1400 }}>
          <img src={lightbox} alt="full" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}