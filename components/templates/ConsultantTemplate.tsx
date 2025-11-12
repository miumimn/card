import React from "react";

export type ConsultantProps = {
  brand?: { name?: string; avatar?: string };
  services?: { title: string; desc?: string; price?: string }[];
  testimonials?: { who: string; text: string }[];
  socials?: { website?: string; linkedin?: string };
  ariaLabel?: string;
  onContact?: () => void;
};

export default function ConsultantTemplate({
  brand = {},
  services = [],
  testimonials = [],
  socials = {},
  ariaLabel = "Consultant",
  onContact,
}: ConsultantProps) {
  const sampleServices = services.length ? services : [{ title: "Strategy Session", desc: "90 min deep dive", price: "$250" }];
  return (
    <div className="consultant" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${brand.avatar || "/templates/consultant.jpg"}')` }} />
          <div className="meta">
            <h1 className="name">{brand.name || "Consultant"}</h1>
            <div className="role">Business Consultant</div>
          </div>
        </section>

        <div className="tabs">
          <button className="tab active" data-tab="services">Services</button>
          <button className="tab" data-tab="testimonials">Testimonials</button>
          <button className="tab" data-tab="contact">Contact</button>
        </div>

        <section className="panels">
          <article id="services" className="panel active">
            <div className="packages">
              {sampleServices.map((s, i) => <div className="package" key={i}><strong>{s.title}</strong><div className="sub">{s.desc}</div>{s.price && <div style={{ fontWeight: 900 }}>{s.price}</div>}</div>)}
            </div>
          </article>

          <article id="testimonials" className="panel">
            <div className="gallery">{(testimonials.length ? testimonials : [{ who: "Client A", text: "Great results." }]).map((t, i) => <div key={i} className="testimonial"><div className="who">{t.who}</div>{t.text}</div>)}</div>
          </article>

          <article id="contact" className="panel">
            <button className="primary-btn" onClick={() => onContact ? onContact() : alert("Contact stub")}>Contact</button>
          </article>
        </section>
      </main>
    </div>
  );
}