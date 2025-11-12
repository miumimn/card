import React from "react";

export type Plan = { name: string; desc?: string; price?: string };

export type GymTrainerProps = {
  name?: string;
  role?: string;
  avatar?: string;
  plans?: Plan[];
  testimonials?: { who: string; text: string }[];
  socials?: { instagram?: string };
  ariaLabel?: string;
  onBook?: () => void;
};

export default function GymTrainerTemplate({
  name = "Fit with Sam",
  role = "Personal Trainer",
  avatar,
  plans = [],
  testimonials = [],
  socials = {},
  ariaLabel = "Gym Trainer",
  onBook,
}: GymTrainerProps) {
  const sample = plans.length ? plans : [{ name: "Starter Plan", desc: "4 sessions", price: "$120" }, { name: "Monthly", desc: "8 sessions", price: "$220" }];
  return (
    <div className="card-page" aria-label={ariaLabel}>
      <main className="card-wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "/templates/trainer.jpg"}')` }} />
          <h2 className="name">{name}</h2>
          <p className="role">{role}</p>
        </section>

        <div className="tabs">
          <button className="tab active" data-tab="plans">Plans</button>
          <button className="tab" data-tab="testimonials">Testimonials</button>
          <button className="tab" data-tab="contact">Contact</button>
        </div>

        <section className="tab-panels">
          <article id="plans" className="panel active">
            <div className="gallery">
              {sample.map((p, i) => <div className="tile" key={i}><h4>{p.name}</h4><p className="muted">{p.desc}</p><div style={{ fontWeight: 900 }}>{p.price}</div></div>)}
            </div>
          </article>

          <article id="testimonials" className="panel">
            {(testimonials.length ? testimonials : [{ who: "A Client", text: "Great trainer!" }]).map((t, i) => <div className="testimonial" key={i}><div className="who">{t.who}</div>{t.text}</div>)}
          </article>

          <article id="contact" className="panel">
            <button className="primary-btn" onClick={() => onBook ? onBook() : alert("Book training (stub)")}>Book Now</button>
          </article>
        </section>
      </main>
    </div>
  );
}