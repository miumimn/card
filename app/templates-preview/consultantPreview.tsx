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

  // resolve avatar image
  const avatarCandidates = asArray(merged.avatar ?? merged.profileImage ?? merged.profile_image ?? merged.extra_fields?.avatar);
  const avatar = avatarCandidates.length ? avatarCandidates[0] : "https://picsum.photos/id/1006/800/800";

  const name = merged.name || merged.company || (showFooter ? "Jordan Blake" : "");
  const role = merged.role || merged.title || (showFooter ? "Strategy Consultant" : "");
  const bio = merged.bio || merged.about || "";

  // services: support comma/newline/array
  const services = asArray(merged.services ?? merged.extra_fields?.services);
  const servicesToShow = services.length ? services : ["Product Strategy", "Go-to-market", "Leadership Coaching"];

  // pricing: ONLY show if user supplied pricing (array or non-empty string)
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

  // testimonials: prefer user-supplied; fallback to realistic examples if none provided
  const rawTestimonials = merged.testimonials ?? merged.extra_fields?.testimonials;
  let testimonialsToShow: any[] = [];
  if (Array.isArray(rawTestimonials) && rawTestimonials.length) {
    testimonialsToShow = rawTestimonials;
  } else if (typeof rawTestimonials === "string" && rawTestimonials.trim()) {
    testimonialsToShow = asArray(rawTestimonials).map((t) => ({ text: t }));
  } else {
    // realistic fallback testimonials that include the profile owner's name for authenticity
    const owner = name || "the consultant";
    testimonialsToShow = [
      { text: `“Working with ${owner} gave us the clarity to scale quickly, our metrics improved within weeks.”`, who: "Sofia Martinez — VP Product" },
      { text: `“${owner}'s strategic approach unlocked new efficiencies across our teams.”`, who: "Liam O’Connor — CEO" },
      { text: `“Practical, data-driven and empathetic — ${owner} helped our leadership focus on what matters.”`, who: "Aisha Khan — Head of Product" },
    ];
  }

  // contact: schedule button should open tel/mailto/contact_url/website in that order
  const phone = merged.phone || merged.extra_fields?.phone || "";
  const email = merged.email || merged.extra_fields?.email || "";
  const scheduleUrl = merged.schedule_url || merged.contact_url || merged.extra_fields?.schedule_url || merged.website || "#";
  const scheduleHref = phone ? `tel:${String(phone).replace(/\s+/g, "")}` : (email ? `mailto:${email}` : (scheduleUrl || "#"));

  // Keep original styling and markup, only swap placeholders with merged values and hide pricing if empty
  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      <style dangerouslySetInnerHTML={{ __html: `
:root{--co-bg:linear-gradient(180deg,#051017 0%, #071226 100%);--co-surface:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))}
body{background:var(--co-bg)}
.consultant-page{min-height:100vh;padding:22px;display:flex;align-items:flex-start;justify-content:center}
.consultant-content{width:100%;max-width:1100px;display:flex;gap:20px}
.consultant-left{flex:0 0 320px}
.consultant-right{flex:1}
.consultant-profile{padding:18px;border-radius:16px;background:var(--co-surface);backdrop-filter:blur(6px);box-shadow:0 10px 30px rgba(2,6,23,0.38);display:flex;flex-direction:column;align-items:center;gap:12px}
.pricing{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.tier{padding:12px;border-radius:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));text-align:center}
@media(max-width:880px){.consultant-content{flex-direction:column}}
` }} />

      <div className="consultant-page">
        <div className="consultant-content">
          <aside className="consultant-left">
            <div className="consultant-profile" role="complementary">
              <div
                className="avatar"
                style={{
                  backgroundImage: `url('${avatar}')`,
                  width: 96,
                  height: 96,
                  borderRadius: 12,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden="true"
              />
              <div className="name" style={{ fontWeight: 900, fontSize: 18 }}>{name}</div>
              <div className="role muted" style={{ color: "rgba(255,255,255,0.7)" }}>{role}</div>
              {bio ? <div style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>{bio}</div> : null}
              <div style={{ marginTop: 10 }}>
                <a className="primary-btn" href={scheduleHref} aria-label="Schedule a call" style={{ textDecoration: "none" }}>Schedule a Call</a>
              </div>
            </div>
          </aside>

          <main className="consultant-right">
            <div className="content-surface" style={{ padding: 18, borderRadius: 16, background: "var(--co-surface)" }}>
              <div className="tabs" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button className={`tab ${tab === "about" ? "active" : ""}`} onClick={() => setTab("about")}>About</button>
                <button className={`tab ${tab === "services" ? "active" : ""}`} onClick={() => setTab("services")}>Services</button>
                <button className={`tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>Contact</button>
              </div>

              <section id="about" className="panel" style={{ display: tab === "about" ? "block" : "none" }}>
                <h3>About</h3>
                <p className="muted" style={{ color: "rgba(255,255,255,0.72)" }}>{bio || "I help startups scale product & go-to-market. Focused on strategy, execution and leadership coaching."}</p>
                <div className="testimonials" style={{ marginTop: 12 }}>
                  {testimonialsToShow.map((t: any, idx: number) => (
                    <div className="testimonial" key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8, marginBottom: 8 }}>
                      <strong>{t.text || t}</strong>
                      <div className="muted" style={{ color: "rgba(255,255,255,0.6)" }}>{t.who || t.by || ""}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section id="services" className="panel" style={{ display: tab === "services" ? "block" : "none" }}>
                <h3>Services & Pricing</h3>
                <div>
                  <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                    {servicesToShow.map((s: string, i: number) => (
                      <div key={i} style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>{s}</div>
                    ))}
                  </div>

                  {pricingList.length > 0 ? (
                    <div className="pricing">
                      {pricingList.map((p, i) => (
                        <div className="tier" key={i}>
                          <strong>{p.title}</strong>
                          {p.note ? <div className="muted" style={{ color: "rgba(255,255,255,0.6)" }}>{p.note}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>

              <section id="contact" className="panel" style={{ display: tab === "contact" ? "block" : "none" }}>
                <h3>Contact</h3>
                {email ? <p className="muted" style={{ color: "rgba(255,255,255,0.72)" }}>Email: <a href={`mailto:${email}`} style={{ color: "inherit" }}>{email}</a></p> : null}
                {phone ? <p className="muted" style={{ color: "rgba(255,255,255,0.72)" }}>Phone: <a href={`tel:${String(phone).replace(/\s+/g, "")}`} style={{ color: "inherit" }}>{phone}</a></p> : null}
                {!email && !phone ? <p className="muted" style={{ color: "rgba(255,255,255,0.72)" }}>No direct contact provided.</p> : null}
              </section>
            </div>

            {showFooter ? (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                <button className="tab" onClick={() => router.push("/templates-preview")}>Back</button>
                <button className="primary-btn" onClick={() => router.push("/onboarding/consultant")}>Use this template</button>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}