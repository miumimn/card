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
    const urlObj = new URL(candidate, typeof window !== "undefined" ? window.location.origin : "http://localhost");
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
    // eslint-disable-next-line no-await-in-loop
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
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
  }, []);

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

  // build share URL for this influencer profile (prefers explicit public profile_url)
  const getShareUrl = (): string => {
    if (merged.profile_url) return merged.profile_url;
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const idPart = merged.id ?? merged.slug ?? merged._id ?? "";
      if (idPart) return `${origin}/profile-preview/influencer?id=${encodeURIComponent(String(idPart))}`;
    } catch {}
    return clientHref || (typeof window !== "undefined" ? window.location.href : "");
  };

  const shareProfile = async () => {
    const url = getShareUrl();
    const shareData = { title: `${name} — NexProfile`, text: `Check out ${name} on NexProfile`, url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); alert("Profile link copied to clipboard"); }
      else {
        const tmp = document.createElement("input");
        document.body.appendChild(tmp);
        tmp.value = url;
        tmp.select();
        document.execCommand("copy");
        tmp.remove();
        alert("Profile link copied to clipboard");
      }
    } catch (err) {
      alert("Could not share profile. Copied link to clipboard as fallback.");
      try { await navigator.clipboard.writeText(url); } catch {}
    }
  };

  return (
    <>
      <style>{`
:root{
  --bg-gradient: linear-gradient(180deg,#0b1220 0%, #07192a 100%);
  --card-surface: rgba(255,255,255,0.02);
  --text-light: #e8f0f8;
  --muted-light: #9fb0c2;
  --accent: #4f46e5;
  --accent-2: #06b6d4;
  --glass: rgba(255,255,255,0.03);
  --radius:12px;
  --max-width:1100px;
}

/* light mode overrides for high contrast like NormalPreview */
@media (prefers-color-scheme: light) {
  :root{
    --bg-gradient: linear-gradient(180deg,#ffffff 0%, #f8fafc 100%);
    --card-surface: rgba(2,6,23,0.03);
    --text-light: #0b1220;
    --muted-light: #475569;
    --accent: #2563eb;
    --accent-2: #06b6d4;
    --glass: rgba(11,17,32,0.04);
  }
}

/* ensure dark explicitly sets white text for main pieces */
@media (prefers-color-scheme: dark) {
  :root {
    --text-light: #ffffff;
    --muted-light: #9fb0c2;
  }
}

.container {
  padding: 22px;
  min-height: 100vh;
  background: var(--bg-gradient);
  color: var(--text-light);
}
.wrap { max-width: var(--max-width); margin: 0 auto; display:flex; gap:20px; }
@media (max-width:880px) { .wrap { flex-direction:column; padding: 0 12px; } }

.aside {
  width: 260px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--card-surface);
}
@media (max-width:880px) { .aside { width:100%; } }

.avatar {
  border-radius:50%;
  background-size:cover;
  background-position:center;
  margin: 0 auto;
}
.avatar.small { width:88px; height:88px; }
.avatar.large { width:100px; height:100px; }

.name { text-align:center; margin-top:12px; font-weight:800; color:var(--text-light); }
.role { text-align:center; color:var(--muted-light); margin:6px 0 0; }

.social-row {
  display:flex;
  gap:8px;
  justify-content:center;
  margin-top:12px;
  flex-wrap:wrap;
  align-items:center;
}

/* keep social icon buttons visible in both themes */
.icon-btn {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:36px;
  height:36px;
  border-radius:8px;
  background: rgba(0,0,0,0.18);
  color: #fff;
  text-decoration:none;
  border: none;
}
@media (prefers-color-scheme: light) {
  .icon-btn { background: rgba(0,0,0,0.06); color: #07101a; }
}

/* main panel */
.main {
  flex:1;
  padding:16px;
  border-radius: var(--radius);
  background: var(--card-surface);
}
.tabs { display:flex; gap:8px; margin-bottom:12px; }
.tab {
  padding:8px 12px;
  border-radius:10px;
  background:transparent;
  color:var(--muted-light);
  font-weight:700;
  border:none;
  cursor:pointer;
}
.tab.active { color: #06101a; background: linear-gradient(90deg,var(--accent),var(--accent-2)); box-shadow:0 8px 24px rgba(6,16,26,0.28); }

.panel h3 { margin-top:0; color:var(--text-light); }
.muted { color: var(--muted-light); }

.gallery-grid { display:grid; gap:8px; margin-top:12px; }
@media (min-width:880px) {
  .gallery-grid.cols-2 { grid-template-columns: repeat(2,1fr); }
  .gallery-grid.cols-auto { grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); }
}
@media (max-width:880px) {
  .gallery-grid { grid-template-columns: repeat(2,1fr); }
}

/* contact area */
.contact-qr-row { display:flex; gap:12px; align-items:center; margin-top:12px; flex-wrap:wrap; }
.share-btn { padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.06); background: transparent; color: var(--text-light); cursor:pointer; }
@media (prefers-color-scheme: light) {
  .share-btn { color: var(--text-light); border-color: rgba(11,17,32,0.06); }
}
`}</style>

      <div className="container">
        <div className="wrap" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
          <aside className="aside" style={{ width: isMobile ? "100%" : 260 }}>
            <div className={`avatar ${isMobile ? "small" : "large"}`} style={{ backgroundImage: `url("${profileImage}")` }} />
            <h2 className="name">{name}</h2>
            {role ? <p className="role">{role}</p> : null}

            <div className="social-row" aria-label="Social links">
              {socials.map((s, i) => (
                <a key={`${s.key}-${i}`} className="icon-btn" href={s.url} target="_blank" rel="noreferrer" aria-label={s.key} title={s.key}>
                  <img src={`/svg/${s.key}.svg`} alt={s.key} width={18} height={18} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </a>
              ))}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="share-btn" onClick={() => { /* placeholder action for Work With Me */ }}>Work With Me</button>
            </div>
          </aside>

          <main className="main">
            <div className="tabs" role="tablist" aria-label="profile tabs">
              <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
              <button className={`tab ${tab === "links" ? "active" : ""}`} onClick={() => setTab("links")}>Links</button>
              <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
            </div>

            {tab === "about" && (
              <section>
                <h3>About</h3>
                <p className="muted">{bio || "No bio provided."}</p>

                {services.length ? (
                  <div style={{ marginTop: 12 }}>
                    <h4>Services</h4>
                    <div className="muted">{services.join(", ")}</div>
                  </div>
                ) : null}

                {rates ? (
                  <div style={{ marginTop: 12 }}>
                    <h4>Rates</h4>
                    <div className="muted">{rates}</div>
                  </div>
                ) : null}

                {notes ? (
                  <div style={{ marginTop: 12 }}>
                    <h4>Notes</h4>
                    <div className="muted">{notes}</div>
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
                  <div className={`gallery-grid ${isMobile ? "cols-2" : "cols-auto"}`} style={{ marginTop: 12, gap: 8 }}>
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
                    <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, background: "var(--card-surface)", borderRadius: 8 }}>
                      <img src={`/svg/${s.key}.svg`} alt={s.key} width={18} height={18} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      <span style={{ color: "var(--text-light)" }}>{s.url.replace(/^https?:\/\//, "")}</span>
                    </a>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
                  {topLinks.length ? topLinks.map((l: any, i: number) => (
                    <a key={i} href={l.url || "#"} target="_blank" rel="noreferrer" style={{ padding: 12, background: "var(--card-surface)", borderRadius: 8 }}>
                      <strong style={{ color: "var(--text-light)" }}>{l.title || l.name || l.url}</strong>
                      {l.source ? <div style={{ color: "var(--muted-light)" }}>{l.source}</div> : null}
                    </a>
                  )) : <div className="muted">No links provided.</div>}
                </div>
              </section>
            )}

            {tab === "contact" && (
              <section>
                <h3>Contact</h3>
                <p className="muted"><strong>Email:</strong> {email ? <a href={`mailto:${email}`}>{email}</a> : "—"}</p>
                <p className="muted"><strong>Phone:</strong> {phone ? <a href={`tel:${phone}`}>{phone}</a> : "—"}</p>
                {merged.booking_link ? <p className="muted"><strong>Booking:</strong> <a href={firstVal(merged.booking_link)} target="_blank" rel="noreferrer">{firstVal(merged.booking_link)}</a></p> : null}
                {website ? <p className="muted"><strong>Website:</strong> <a href={website} target="_blank" rel="noreferrer">{website}</a></p> : null}

                {socials.length ? (
                  <div style={{ marginTop: 12 }}>
                    <h4>Socials</h4>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {socials.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: 8, background: "var(--card-surface)", borderRadius: 8 }}>
                          <img src={`/svg/${s.key}.svg`} alt={s.key} width={18} height={18} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          <span style={{ color: "var(--text-light)" }}>{s.url.replace(/^https?:\/\//, "")}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="contact-qr-row">
                  <div>
                    <img id="qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(merged.profile_url || clientHref)}`} alt="QR code" style={{ width: 120, height: 120, borderRadius: 10, background: "white", padding: 8 }} />
                    <small className="muted" style={{ display: "block", marginTop: 8 }}>Scan to view my profile</small>
                  </div>

                  <div>
                    <button onClick={shareProfile} className="share-btn" style={{ padding: "8px 12px" }}>Share NexProfile</button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>

        <div style={{ maxWidth: 1100, margin: "20px auto 0", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {showFooter ? <button className="share-btn" onClick={handleUseTemplate} style={{ padding: "8px 12px" }}>Use This Template</button> : null}
        </div>

        {lightbox ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(3,7,18,0.85)", zIndex: 1400 }}>
            <img src={lightbox} alt="full" style={{ maxWidth: "92%", maxHeight: "92%", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}