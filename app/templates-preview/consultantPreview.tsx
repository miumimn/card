"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ConsultantData = {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: string | string[];
  profileImage?: string | string[];
  services?: string[] | string;
  pricing?: any;
  testimonials?: any;
  email?: string;
  phone?: string;
  schedule_url?: string;
  contact_url?: string;
  extra_fields?: any;
  slug?: string;
};

export default function ConsultantPreview({ data, showFooter = true }: { data?: ConsultantData; showFooter?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>("about");

  // Merge extra_fields into top-level for easy access
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
    return out;
  }, [data]);

  // helpers
  function asArray(val: any): string[] {
    if (!val && val !== "") return [];
    if (Array.isArray(val)) return val.map(String).filter(Boolean);
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return [];
      try {
        const p = JSON.parse(s);
        if (Array.isArray(p)) return p.map(String).filter(Boolean);
      } catch {}
      if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
      if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
      return [s];
    }
    return [];
  }

  // resolve avatar / profile image - robust to arrays/objects
  function resolveFirst(input: any): string | null {
    if (!input && input !== "") return null;
    if (Array.isArray(input)) {
      for (const v of input) if (v) return String(v);
    } else if (typeof input === "string") {
      if (input.trim()) return input.trim();
    } else if (typeof input === "object" && input !== null) {
      const keys = ["url", "src", "path", "publicURL", "public_url", "fileUrl", "file_url", "preview", "filename"];
      for (const k of keys) if (input[k]) return String(input[k]);
    }
    return null;
  }

  const avatarCandidates = asArray(merged.avatar ?? merged.profileImage ?? merged.profile_image ?? merged.extra_fields?.avatar);
  const avatar = avatarCandidates.length ? avatarCandidates[0] : resolveFirst(merged.logo) || "https://picsum.photos/id/1006/800/800";

  const name = merged.name || merged.company || merged.fullName || (showFooter ? "Jordan Blake" : "");
  const role = merged.role || merged.title || (showFooter ? "Strategy Consultant" : "");
  const bio = merged.bio || merged.about || merged.description || "";

  // services: support comma/newline/array
  const services = asArray(merged.services ?? merged.extra_fields?.services ?? merged.service_list ?? merged.serviceList);
  const servicesToShow = services.length ? services : ["Product Strategy", "Go-to-market", "Leadership Coaching"];

  // pricing
  let pricingList: { title: string; note?: string }[] = [];
  const rawPricing = merged.pricing ?? merged.extra_fields?.pricing;
  if (Array.isArray(rawPricing) && rawPricing.length) {
    pricingList = rawPricing.map((p: any) => ({ title: p.title || p.name || String(p), note: p.note || p.description || "" }));
  } else if (typeof rawPricing === "string" && rawPricing.trim()) {
    pricingList = asArray(rawPricing).map((line) => {
      const parts = line.split("|").map((s) => s.trim());
      return { title: parts[0] || line, note: parts[1] || "" };
    });
  } else {
    pricingList = [];
  }

  // testimonials
  const rawTestimonials = merged.testimonials ?? merged.extra_fields?.testimonials;
  let testimonialsToShow: any[] = [];
  if (Array.isArray(rawTestimonials) && rawTestimonials.length) {
    testimonialsToShow = rawTestimonials;
  } else if (typeof rawTestimonials === "string" && rawTestimonials.trim()) {
    testimonialsToShow = asArray(rawTestimonials).map((t) => ({ text: t }));
  } else {
    const owner = name || "the consultant";
    testimonialsToShow = [
      { text: `“Working with ${owner} gave us the clarity to scale quickly—metrics improved within weeks.”`, who: "Sofia Martinez — VP Product" },
      { text: `${owner}'s strategic approach unlocked new efficiencies across our teams.`, who: "Liam O’Connor — CEO" },
      { text: `Practical, data-driven and empathetic — ${owner} helped our leadership focus on what matters.`, who: "Aisha Khan — Head of Product" },
    ];
  }

  // contact / schedule
  const phone = merged.phone || merged.extra_fields?.phone || "";
  const email = merged.email || merged.extra_fields?.email || "";
  const scheduleUrl = merged.schedule_url || merged.contact_url || merged.extra_fields?.schedule_url || merged.website || "#";
  const scheduleHref = phone ? `tel:${String(phone).replace(/\s+/g, "")}` : (email ? `mailto:${email}` : (scheduleUrl || "#"));

  // accessibility: allow keyboard tab switching
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "1") setTab("about");
      if (e.key === "2") setTab("services");
      if (e.key === "3") setTab("contact");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
/* ConsultantPreview - refreshed UI */
:root{
  --bg-1: linear-gradient(180deg,#04121a 0%, #071826 100%);
  --card: rgba(255,255,255,0.02);
  --muted: rgba(255,255,255,0.66);
  --accent: #ffd39f;
  --accent-2: #ff7a18;
  --glass: rgba(255,255,255,0.03);
}

body{ background:var(--bg-1); margin:0; font-family:Inter,system-ui,Arial; color:#fff; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }

.consultant-page{ min-height:100vh; padding:28px 18px; box-sizing:border-box; display:flex; justify-content:center; align-items:flex-start; }
.consultant-content{ width:100%; max-width:1100px; display:grid; grid-template-columns: 320px 1fr; gap:20px; align-items:start; }

/* profile card */
.profile {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.03);
  padding:20px;
  border-radius:14px;
  display:flex;
  flex-direction:column;
  gap:12px;
  align-items:center;
  box-shadow: 0 12px 40px rgba(2,6,23,0.5);
}
.avatar {
  width:104px; height:104px; border-radius:16px; background-size:cover; background-position:center; border:4px solid rgba(255,255,255,0.06);
  box-shadow: 0 10px 28px rgba(2,6,23,0.45);
}
.profile .name{ font-weight:900; font-size:18px; margin-top:6px; letter-spacing:-0.02em; color:#fff; text-align:center; }
.profile .role{ color:var(--accent); font-weight:700; font-size:13px; margin-top:2px; }
.profile .bio{ color:var(--muted); text-align:center; font-size:13px; line-height:1.4; }

/* call-to-action buttons (profile) */
.profile .actions{ display:flex; gap:10px; margin-top:6px; width:100%; }
.profile .actions a, .profile .actions button {
  flex:1;
  padding:10px 12px;
  border-radius:10px;
  border:none;
  cursor:pointer;
  text-decoration:none;
  text-align:center;
  font-weight:800;
}
.btn-primary { background: linear-gradient(90deg,var(--accent),var(--accent-2)); color:#07121a; box-shadow:0 10px 26px rgba(255,122,24,0.12); }
.btn-ghost { background:transparent; border:1px solid rgba(255,255,255,0.04); color:var(--muted); }

/* main content surface */
.surface {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
  border-radius:14px;
  padding:18px;
  border:1px solid rgba(255,255,255,0.02);
  box-shadow: 0 12px 40px rgba(2,6,23,0.45);
}

/* tabs */
.tabs { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; }
.tab {
  padding:8px 12px; border-radius:10px; background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.03); cursor:pointer; font-weight:700;
}
.tab.active { background: linear-gradient(90deg,var(--accent), rgba(255,122,24,0.12)); color:#07121a; box-shadow:0 10px 28px rgba(255,122,24,0.06); border:none; }

/* panels */
.panel h3{ margin:0 0 8px 0; font-size:16px; color:#fff; }
.panel p{ color:var(--muted); line-height:1.5; }

/* services grid */
.services-grid { display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); margin-top:8px; }
.service-card { padding:12px; border-radius:10px; background:var(--glass); border:1px solid rgba(255,255,255,0.02); font-weight:700; color:#fff; }

/* pricing */
.pricing { display:flex; gap:10px; flex-wrap:wrap; margin-top:12px; }
.tier { padding:12px 14px; border-radius:10px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); text-align:center; min-width:120px; }

/* testimonials */
.testimonial { margin-top:10px; background: rgba(255,255,255,0.02); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.02); }

/* footer CTAs (only shown when showFooter is true) */
.footer-ctas { display:flex; gap:10px; margin-top:16px; justify-content:flex-end; }

/* responsive */
@media (max-width: 1024px) {
  .consultant-content { grid-template-columns: 1fr; }
  .profile { flex-direction: row; align-items:center; gap:14px; padding:14px; }
  .avatar { width:76px; height:76px; border-radius:12px; }
  .profile .name { font-size:16px; text-align:left; }
  .profile .bio { text-align:left; display:none; } /* hide long bio in compressed header */
  .profile .actions { margin-top:0; flex-direction:column; width:auto; }
  .profile .actions a, .profile .actions button { min-width:160px; }
}

/* very small screens: stack actions */
@media (max-width: 420px) {
  .profile { padding:12px; }
  .profile .actions { gap:8px; }
  .profile .actions a, .profile .actions button { font-size:14px; padding:10px; }
}
` }} />

      <div className="consultant-page" aria-label="Consultant preview">
        <div className="consultant-content">
          <aside className="profile" aria-labelledby="consultant-name">
            <div
              className="avatar"
              style={{ backgroundImage: `url('${avatar}')` }}
              role="img"
              aria-label={`${name} avatar`}
            />
            <div style={{ textAlign: "center" }}>
              <div id="consultant-name" className="name">{name}</div>
              <div className="role">{role}</div>
              {bio ? <div className="bio" style={{ marginTop: 8, maxWidth: 240 }}>{bio}</div> : null}
            </div>

            <div className="actions" role="group" aria-label="Contact actions" style={{ width: "100%", marginTop: 6 }}>
              <a className="btn-primary" href={scheduleHref} aria-label="Schedule a call">Schedule a Call</a>
              <a className="btn-ghost" href={merged.contact_url || merged.website || "#"} aria-label="Contact or website">Contact / Site</a>
            </div>
          </aside>

          <main className="surface" aria-live="polite">
            <div className="tabs" role="tablist" aria-label="Profile sections">
              <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
              <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
              <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
            </div>

            <section className="panel" style={{ display: tab === "about" ? "block" : "none" }}>
              <h3>About</h3>
              <p>{bio || "I help startups scale product & go-to-market. Focused on strategy, execution and leadership coaching."}</p>

              <div style={{ marginTop: 12 }}>
                {testimonialsToShow.map((t, i) => (
                  <div key={i} className="testimonial" role="article">
                    <div style={{ fontWeight: 800, color: "#fff" }}>{t.text || t}</div>
                    {t.who ? <div style={{ color: "var(--muted)", marginTop: 6 }}>{t.who}</div> : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="panel" style={{ display: tab === "services" ? "block" : "none" }}>
              <h3>Services & Pricing</h3>

              <div className="services-grid">
                {servicesToShow.map((s, i) => (
                  <div key={i} className="service-card">{s}</div>
                ))}
              </div>

              {pricingList.length > 0 && (
                <div className="pricing" aria-label="Pricing options">
                  {pricingList.map((p, i) => (
                    <div className="tier" key={i}>
                      <div style={{ fontWeight: 900 }}>{p.title}</div>
                      {p.note ? <div style={{ color: "var(--muted)", marginTop: 6 }}>{p.note}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="panel" style={{ display: tab === "contact" ? "block" : "none" }}>
              <h3>Contact</h3>
              {email ? <p style={{ color: "var(--muted)" }}>Email: <a href={`mailto:${email}`} style={{ color: "inherit" }}>{email}</a></p> : null}
              {phone ? <p style={{ color: "var(--muted)" }}>Phone: <a href={`tel:${String(phone).replace(/\s+/g, "")}`} style={{ color: "inherit" }}>{phone}</a></p> : null}
              {!email && !phone ? <p style={{ color: "var(--muted)" }}>No direct contact provided.</p> : null}
            </section>

            {showFooter ? (
              <div className="footer-ctas" role="group" aria-label="Template actions">
                <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
                <button className="btn-primary" onClick={() => router.push("/onboarding/consultant")}>Use this template</button>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}