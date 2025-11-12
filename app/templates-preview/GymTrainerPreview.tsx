"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type GymTrainerData = {
  name?: string;
  role?: string;
  about?: string;
  programs?: string[] | string;
  classes?: string[] | string;
  testimonials?: string[] | string;
  avatar?: string | string[];
  heroImage?: string | string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  booking_link?: string;
  profile_url?: string;
  extra_fields?: any;
};

export default function GymTrainerPreview({
  data,
  showFooter = true,
}: {
  data?: GymTrainerData | null;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"about" | "programs" | "classes" | "testimonials" | "contact">("about");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try {
      setClientHref(window.location.href || "");
    } catch {
      setClientHref("");
    }
  }, []);

  // tolerant parsing for lists and images
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

  const parseImageField = (val: any): string[] => parseList(val);

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
    return out as GymTrainerData;
  }, [data]);

  const name = merged.name ? String(merged.name) : (showFooter ? "Chris Taylor" : "");
  const role = merged.role ? String(merged.role) : (showFooter ? "Personal Trainer • Strength & HIIT" : "");
  const about = merged.about ? String(merged.about) : (showFooter ? "Custom fitness plans — HIIT, strength, mobility. 7+ years coaching." : "");

  const programs = parseList(merged.programs ?? merged.program_list ?? merged.services);
  const classes = parseList(merged.classes ?? merged.upcoming ?? merged.listings);
  const testimonials = parseList(merged.testimonials ?? merged.reviews);

  const avatarCandidates = parseImageField(merged.avatar ?? merged.avatar_url ?? merged.profileImage ?? merged.profile_image);
  const heroCandidates = parseImageField(merged.heroImage ?? merged.hero_image ?? merged.banner);
  let avatar = avatarCandidates.length ? avatarCandidates[0] : "";
  let heroImage = heroCandidates.length ? heroCandidates[0] : "";

  // placeholders for template preview
  if (showFooter) {
    if (!heroImage) heroImage = "https://images.unsplash.com/photo-1526401281623-4b1c2b6fdb9e?q=80&w=1400&auto=format&fit=crop";
    if (!avatar) avatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop";
    if (!programs.length) programs.push("HIIT Bootcamp", "Muscle Gain Program", "Mobility & Recovery");
    if (!classes.length) classes.push("Mon 7am • HIIT Express", "Wed 6pm • Strength Circuit", "Sat 10am • Mobility Flow");
    if (!testimonials.length) testimonials.push('"Chris helped me get stronger and leaner!" — A.' , '"Best group classes in town!" — S.');
  }

  const email = merged.email ? String(merged.email) : "";
  const phone = merged.phone ? String(merged.phone) : "";
  const whatsapp = merged.whatsapp ? String(merged.whatsapp) : "";
  const bookingLink = merged.booking_link ? String(merged.booking_link) : (merged.profile_url ? String(merged.profile_url) : "");
  const profileUrl = merged.profile_url ? String(merged.profile_url) : "";

  // callHref: prefer phone, then whatsapp URL, then bookingLink or profile
  const callHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : (whatsapp ? (whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, "")}`) : (bookingLink || clientHref));

  useEffect(() => {
    const avail: Array<typeof tab> = [];
    if (showFooter || about) avail.push("about");
    if (showFooter || programs.length) avail.push("programs");
    if (showFooter || classes.length) avail.push("classes");
    if (showFooter || testimonials.length) avail.push("testimonials");
    if (showFooter || email || phone || whatsapp || bookingLink) avail.push("contact");
    if (avail.length && !avail.includes(tab)) setTab(avail[0]);
  }, [showFooter, about, programs, classes, testimonials, email, phone, whatsapp, bookingLink, tab]);

  const openLightbox = (src?: string | null) => { if (!src) return; setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style>{`
        :root{
          --fit-bg-top: #22232d;
          --fit-bg-btm: #1b1c23;
          --fit-accent: #fd4362;
          --fit-muted: #9ea7bc;
          --fit-text: #fff;
          --fit-surface: #272737;
          --fit-card-radius: 18px;
          --fit-content-max: 1000px;
        }
        .fitness-wrap{max-width:var(--fit-content-max);margin:0 auto;padding:18px;}
        .hero-fitness{position:relative;border-radius:var(--fit-card-radius);overflow:visible;margin-bottom:18px;background:linear-gradient(90deg,#272737 60%,#22232d 100%);min-height:160px;box-shadow:0 16px 32px rgba(253,67,98,0.08);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px;}
        .fitness-avatar{width:82px;height:82px;border-radius:999px;border:5px solid #272737;box-shadow:0 2px 22px rgba(253,67,98,0.14);background-size:cover;background-position:center;margin-top:6px;margin-bottom:8px;z-index:2;}
        .fitness-name{font-size:22px;font-weight:800;margin:0;color:var(--fit-text);margin-top:6px;z-index:2;}
        .fitness-role{margin:3px 0 0;color:var(--fit-accent);font-size:14px;font-weight:600;z-index:2;}
        .tabs-fitness{display:flex;gap:9px;align-items:center;margin:12px 0 10px;justify-content:center;flex-wrap:wrap;z-index:2;}
        .tab-fitness{padding:10px 14px;border-radius:10px;background:transparent;color:var(--fit-muted);border:1px solid #272737;font-weight:700;cursor:pointer;font-size:13px;}
        .tab-fitness.active{background:linear-gradient(90deg,var(--fit-accent),rgba(253,67,98,0.13));color:#fff;border:none;box-shadow:0 8px 20px rgba(253,67,98,0.08);}
        .panel-fitness{display:none;color:var(--fit-muted);font-size:15px;line-height:1.6;border-radius:12px;background:var(--fit-surface);padding:16px 12px;box-shadow:0 4px 24px rgba(253,67,98,0.08);margin-bottom:10px;}
        .panel-fitness.active{display:block;}
        .program-grid{ display:grid; grid-template-columns: 1fr; gap:10px; }
        @media(min-width:640px){ .program-grid{ grid-template-columns: repeat(2,1fr); } }
        .program-card{ background:rgba(253,67,98,0.06); padding:10px; border-radius:10px; color:#fff; }
        .class-item{ background:rgba(253,67,98,0.06); padding:10px; border-radius:8px; margin-bottom:8px; color:#fff; }
        .testimonial{ background:rgba(253,67,98,0.05); padding:10px; border-radius:8px; margin-bottom:8px; color:var(--fit-muted); font-style:italic; }
        .cta-row{ display:flex; gap:10px; justify-content:center; margin-top:8px; }
        .primary-btn{ padding:10px 14px; border-radius:10px; background:linear-gradient(90deg,var(--fit-accent),#ff7c96); color:#fff; border:none; font-weight:800; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
        .qr-row{ display:flex; gap:10px; align-items:center; justify-content:center; margin-top:12px; }
        .lightbox{ position:fixed; inset:0; z-index:1400; display:flex; align-items:center; justify-content:center; background:rgba(3,7,18,0.9); padding:18px; }
        .lightbox img{ max-width:96%; max-height:92%; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.6); }
      `}</style>

      <div className="fitness-wrap" style={{ minHeight: "100vh" }}>
        <section className="hero-fitness" style={heroImage ? { backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
          <div className="fitness-avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-label="Trainer avatar" />
          <h2 className="fitness-name">{name}</h2>
          <p className="fitness-role">{role}</p>

          <div className="tabs-fitness" role="tablist" aria-label="fitness tabs">
            <button className={`tab-fitness ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
            <button className={`tab-fitness ${tab === "programs" ? "active" : ""}`} onClick={() => setTab("programs")}>Programs</button>
            <button className={`tab-fitness ${tab === "classes" ? "active" : ""}`} onClick={() => setTab("classes")}>Classes</button>
            <button className={`tab-fitness ${tab === "testimonials" ? "active" : ""}`} onClick={() => setTab("testimonials")}>Testimonials</button>
            <button className={`tab-fitness ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
          </div>
        </section>

        <section className="fitness-panels">
          <article className={`panel-fitness ${tab === "about" ? "active" : ""}`}>
            <h3>About</h3>
            <p>{about}</p>
          </article>

          <article className={`panel-fitness ${tab === "programs" ? "active" : ""}`}>
            <h3>Programs</h3>
            <div className="program-grid">
              {programs.map((p, i) => (
                <div key={i} className="program-card">{p}</div>
              ))}
            </div>
          </article>

          <article className={`panel-fitness ${tab === "classes" ? "active" : ""}`}>
            <h3>Upcoming Classes</h3>
            <div style={{ marginTop: 10 }}>
              {classes.map((c, i) => <div key={i} className="class-item">{c}</div>)}
            </div>
          </article>

          <article className={`panel-fitness ${tab === "testimonials" ? "active" : ""}`}>
            <h3>Testimonials</h3>
            <div style={{ marginTop: 10 }}>
              {testimonials.map((t, i) => <div key={i} className="testimonial">{t}</div>)}
            </div>
          </article>

          <article className={`panel-fitness ${tab === "contact" ? "active" : ""}`}>
            <h3>Contact</h3>
            {email ? <p>Email: <a href={`mailto:${email}`}>{email}</a></p> : null}
            {phone ? <p>Phone: <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a></p> : null}

            <div className="cta-row" role="group" aria-label="actions">
              {showFooter ? (
                <button className="primary-btn" onClick={() => router.push("/onboarding/gym-trainer")}>Use this template</button>
              ) : (
                <a className="primary-btn" href={phone ? `tel:${phone.replace(/\s+/g, "")}` : (bookingLink || "#")}>Book a Session</a>
              )}
            </div>

            { (profileUrl || showFooter) ? (
              <div className="qr-row" aria-hidden={!profileUrl && !showFooter}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=58x58&data=${encodeURIComponent(profileUrl || clientHref)}`} alt="QR" style={{ width: 58, height: 58, borderRadius: 8 }} />
                {showFooter ? (
                  <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl || clientHref)}`} download="TrainerQR.png" className="primary-btn" style={{ padding: "8px 12px" }}>Download my QR code</a>
                ) : null}
              </div>
            ) : null}
          </article>
        </section>

        {lightboxSrc ? (
          <div className="lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
            <img src={lightboxSrc} alt="Full size" onClick={(e) => e.stopPropagation()} />
          </div>
        ) : null}
      </div>
    </>
  );
}