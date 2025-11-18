"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type NormalData = {
  name?: string;
  title?: string;
  about?: string;
  avatar?: string | string[];
  photos?: string[] | string;
  socials?: Record<string, string> | null;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  other_links?: string[] | string;
  email?: string;
  phone?: string;
  profile_url?: string;
  follow_link?: string;
  extra_fields?: any;
};

function parseList(val: any): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
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

/** Render social icon from public/svg/{name}.svg with a tiny inline fallback */
function SocialIcon({ name, size = 20 }: { name: string; size?: number }) {
  const src = `/svg/${name}.svg`;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={`${name} icon`}
      style={{ display: "block" }}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}

export default function NormalPreview({ data, showFooter = true }: { data?: NormalData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "highlights" | "contact">("about");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(window.location.href || ""); } catch { setClientHref(""); }
  }, []);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
        }
      } catch {}
    }
    return out as NormalData;
  }, [data]);

  const name = merged.name ?? (showFooter ? "Alex Rivers" : "");
  const title = merged.title ?? (showFooter ? "Landscape Photographer" : "");
  const about = merged.about ?? (showFooter ? "Capturing dramatic landscapes with natural light. Specialises in long exposure and aerial photography." : "");
  const avatarCandidates = parseList(merged.avatar ?? merged.extra_fields?.avatar);
  const photos = parseList(merged.photos ?? merged.extra_fields?.photos).slice(0, 4);
  const otherLinks = parseList(merged.other_links ?? merged.extra_fields?.other_links);

  let avatar = avatarCandidates.length ? avatarCandidates[0] : (showFooter ? "https://picsum.photos/seed/normal-avatar/600/600" : "");
  const followLink = String(merged.follow_link ?? "").trim();

  // socials: allow either top-level fields or an object
  const socialsObj: Record<string, string> = {
    instagram: String(merged.instagram ?? merged.socials?.instagram ?? "").trim(),
    twitter: String(merged.twitter ?? merged.socials?.twitter ?? "").trim(),
    facebook: String(merged.facebook ?? merged.socials?.facebook ?? "").trim(),
    linkedin: String(merged.linkedin ?? merged.socials?.linkedin ?? "").trim(),
    website: String(merged.website ?? merged.socials?.website ?? "").trim(),
  };

  const email = merged.email ?? "";
  const phone = merged.phone ?? "";
  const profileUrl = merged.profile_url ?? "";

  // determine whether we actually have highlights to show (photos or other_links)
  const hasHighlights = photos.length > 0 || otherLinks.length > 0;

  // initial tab preference remains About by default
  useEffect(() => {
    setTab("about");
  }, [photos.length, otherLinks.length]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

  // vCard builder & download
  function buildVCard(): string {
    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${name || ""}`,
      `TITLE:${title || ""}`,
    ];
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${String(phone).replace(/\s+/g, "")}`);
    if (profileUrl) lines.push(`URL:${profileUrl}`);
    if (merged.website) lines.push(`URL:${merged.website}`);
    lines.push("END:VCARD");
    return lines.join("\r\n");
  }
  function downloadVCard() {
    const vcard = buildVCard();
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `${(name || "contact").replace(/\s+/g, "_")}.vcf`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const iconBtnStyle = (enabled = true): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    background: enabled ? "rgba(255,255,255,0.03)" : "transparent",
    color: enabled ? "var(--accent)" : "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.04)",
    textDecoration: "none",
    marginRight: 8
  });

  const buildSocialHref = (value: string, provider: string) => {
    if (!value) return "";
    if (/^https?:\/\//.test(value)) return value;
    switch (provider) {
      case "instagram": return `https://instagram.com/${value.replace(/^@/, "")}`;
      case "twitter": return `https://twitter.com/${value.replace(/^@/, "")}`;
      case "linkedin": return `https://linkedin.com/in/${value.replace(/^@/, "")}`;
      case "facebook": return `https://facebook.com/${value}`;
      case "website": return value.startsWith("http") ? value : `https://${value}`;
      default: return value;
    }
  };

  // Highlight intro copy (human-first vibe) — only shown when there are actual highlights
  const highlightIntro = "Memorable achievements, signature projects or press that tell my story in one glance.";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
    :root{
      --bg-gradient: linear-gradient(180deg,#0b1220 0%, #07192a 100%);
      --card-surface: rgba(255,255,255,0.04);
      --text-light: #e8f0f8;
      --muted-light: #9fb0c2;
      --accent: #4f46e5;
      --accent-2: #06b6d4;
      --glass: rgba(255,255,255,0.03);
      --radius:14px;
      --max-width:920px;
    }
    *,*::before,*::after{box-sizing:border-box}
    html,body{height:100%}
    body.normal{ margin:0; font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial; -webkit-font-smoothing:antialiased; color:var(--text-light); background:var(--bg-gradient); line-height:1.35; }
    .page{ min-height:100vh; width:100%; padding:20px; display:flex; align-items:flex-start; justify-content:center; gap:24px; overflow-x:hidden; }
    .content{ width:100%; max-width:var(--max-width); display:flex; gap:20px; padding:12px; }
    .profile-col{ flex:0 0 320px; display:flex; flex-direction:column; gap:12px; align-items:center; padding:18px; border-radius:18px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); backdrop-filter: blur(6px); box-shadow: 0 10px 30px rgba(2,6,23,0.45); }
    .main-col{ flex:1; display:flex; flex-direction:column; gap:12px; padding:18px; border-radius:18px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); box-shadow: 0 10px 30px rgba(2,6,23,0.38); }
    .avatar{ width:128px; height:128px; border-radius:999px; overflow:hidden; border:4px solid rgba(255,255,255,0.06); box-shadow: 0 12px 30px rgba(6,16,26,0.6); background-size:cover; background-position:center; }
    .name{ font-size:20px; font-weight:700; margin:6px 0 0; color:var(--text-light); }
    .role{ margin:0; color:var(--muted-light); font-size:13px; }
    .actions{ display:flex; gap:10px; margin-top:8px; width:100%; justify-content:center; flex-wrap:wrap; }
    .btn{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; background:linear-gradient(90deg,var(--accent),var(--accent-2)); color:#06101a; font-weight:700; border:none; cursor:pointer; text-decoration:none; }
    .btn.ghost{ background:transparent; border:1px solid rgba(255,255,255,0.06); color:var(--text-light); box-shadow:none; }
    .mini-gallery{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; width:100%; margin-top:10px; }
    .mini-gallery img{ width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:10px; display:block; }
    .social-row{ display:flex; gap:8px; align-items:center; margin-top:12px; }
    .tabs{ display:flex; gap:10px; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px; align-items:center; }
    .tab{ padding:8px 12px; border-radius:10px; background:transparent; color:var(--muted-light); font-weight:700; cursor:pointer; border:none; }
    .tab.active{ color:#06101a; background:linear-gradient(90deg,var(--accent),var(--accent-2)); box-shadow:0 8px 24px rgba(6,16,26,0.28); }
    .panel{ padding-top:12px; color:var(--muted-light); font-size:15px; }
    .gallery-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-top:12px; }
    .gallery-grid img{ width:100%; border-radius:10px; aspect-ratio:16/10; object-fit:cover; display:block; }
    @media (max-width:880px) { .content{ flex-direction:column; padding:8px; } .profile-col{ width:100%; flex:unset; align-items:center; } .main-col{ width:100%; } .gallery-grid{ grid-template-columns:repeat(2,1fr); } }
    ` }} />

      <div className="page normal" role="application" aria-label="Profile page preview" style={{ minHeight: "100vh" }}>
        <div className="content">
          <aside className="profile-col" aria-label="Profile">
            <div id="avatar" className="avatar" style={{ backgroundImage: `url('${avatar}')` }} />
            <div className="name" id="name">{name}</div>
            <div className="role" id="title">{title}</div>

            <div className="actions">
              <button id="saveVcard" className="btn" onClick={downloadVCard}>Save</button>
              <a
                className="btn ghost"
                href={followLink || profileUrl || "#"}
                target={followLink || profileUrl ? "_blank" : undefined}
                rel={followLink || profileUrl ? "noreferrer" : undefined}
              >
                Follow
              </a>
            </div>

            <div className="social-row" aria-label="Social links">
              {socialsObj.instagram ? (
                <a href={buildSocialHref(socialsObj.instagram, "instagram")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Instagram">
                  <SocialIcon name="instagram" />
                </a>
              ) : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><SocialIcon name="instagram" /></span> : null)}

              {socialsObj.twitter ? (
                <a href={buildSocialHref(socialsObj.twitter, "twitter")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Twitter">
                  <SocialIcon name="twitter" />
                </a>
              ) : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><SocialIcon name="twitter" /></span> : null)}

              {socialsObj.linkedin ? (
                <a href={buildSocialHref(socialsObj.linkedin, "linkedin")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="LinkedIn">
                  <SocialIcon name="linkedin" />
                </a>
              ) : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><SocialIcon name="linkedin" /></span> : null)}

              {socialsObj.website ? (
                <a href={buildSocialHref(socialsObj.website, "website")} target="_blank" rel="noreferrer" style={iconBtnStyle(true)} aria-label="Website">
                  <SocialIcon name="link" />
                </a>
              ) : (showFooter ? <span style={iconBtnStyle(false)} aria-hidden><SocialIcon name="link" /></span> : null)}
            </div>

            {/* removed horizontal photos under actions - photos are shown only in About (gallery-grid) */}
          </aside>

          <main className="main-col" aria-label="Profile content">
            <div className="tabs" role="tablist" aria-label="Profile tabs">
              <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
              <button className={`tab ${tab === "highlights" ? "active" : ""}`} onClick={() => setTab("highlights")}>Highlights</button>
              <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
            </div>

            <section id="about" className="panel" style={{ display: tab === "about" ? "block" : "none" }}>
              <h3>About</h3>
              <p className="muted" id="aboutText">{about}</p>

              <div className="gallery-grid" id="galleryGrid">
                {photos.length ? photos.concat([]).slice(0, 4).map((p, i) => <img key={i} src={p} alt={`photo ${i + 1}`} onClick={() => openLightbox(p)} />) : (showFooter ? <>
                  <img src="https://picsum.photos/id/1020/800/600" alt="photo 1" />
                  <img src="https://picsum.photos/id/1024/800/600" alt="photo 2" />
                  <img src="https://picsum.photos/id/1025/800/600" alt="photo 3" />
                  <img src="https://picsum.photos/id/1026/800/600" alt="photo 4" />
                </> : null)}
              </div>
            </section>

            <section id="highlights" className="panel" role="tabpanel" style={{ display: tab === "highlights" ? "block" : "none" }}>
              {/* Only render highlights content when the user actually uploaded highlights (photos or other links).
                  If there's no content, show nothing (as requested). */}
              {hasHighlights ? (
                <>
                  <h3>Highlights</h3>
                  <p className="muted">{highlightIntro}</p>
                  <div style={{ marginTop: 12 }}>
                    <img src={photos[0] || "https://picsum.photos/id/1031/1200/800"} alt="highlights hero" style={{ width: "100%", borderRadius: 12, objectFit: "cover" }} />
                  </div>
                </>
              ) : null}
            </section>

            <section id="contact" className="panel" role="tabpanel" style={{ display: tab === "contact" ? "block" : "none" }}>
              <h3>Contact</h3>
              <p className="muted"><strong>Phone:</strong> {phone ? <a id="phoneLink" href={`tel:${phone}`} style={{ color: "var(--text-light)", textDecoration: "none" }}>{phone}</a> : "—"}</p>
              <p className="muted"><strong>Email:</strong> {email ? <a id="emailLink" href={`mailto:${email}`} style={{ color: "var(--text-light)", textDecoration: "none" }}>{email}</a> : "—"}</p>

              {otherLinks.length ? (
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {otherLinks.map((l, i) => <a key={i} className="btn ghost" href={l.startsWith("http") ? l : `https://${l}`} target="_blank" rel="noreferrer">{l}</a>)}
                </div>
              ) : null}

              <div style={{ marginTop: 12 }}>
                <img id="qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR code" style={{ width: 120, height: 120, borderRadius: 10, background: "white", padding: 8 }} />
                <small className="muted" style={{ display: "block", marginTop: 8 }}>Scan to view my profile</small>
              </div>
            </section>
          </main>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18, maxWidth: 980, marginLeft: "auto", marginRight: "auto" }}>
        <button onClick={() => router.push("/templates-preview")} className="btn ghost" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)" }}>Back</button>
        {showFooter ? <button onClick={() => router.push("/onboarding/normal")} className="btn" style={{ padding: "8px 12px", borderRadius: 12, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", color: "#06101a" }}>Use this template</button> : null}
      </div>

      {lightbox ? (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,6,23,0.8)", zIndex: 1500 }}>
          <img src={lightbox} alt="Full" style={{ maxWidth: "96%", maxHeight: "92%", borderRadius: 12 }} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </>
  );
}