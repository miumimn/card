import React from "react";

export type NormalProps = {
  name?: string;
  role?: string;
  avatar?: string;
  qr?: string;
  gallery?: string[];
  socials?: { instagram?: string; website?: string };
  ariaLabel?: string;
};

export default function NormalTemplate({ name = "Your Name", role = "Profile", avatar, qr, gallery = [], socials = {}, ariaLabel = "Standard profile" }: NormalProps) {
  const sample = gallery.length ? gallery : ["/templates/normal1.jpg", "/templates/normal2.jpg"];
  return (
    <div className="card-page" aria-label={ariaLabel}>
      <main className="card-wrap">
        <section className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || sample[0]}')` }} />
          <h2 className="name">{name}</h2>
          <p className="role">{role}</p>
        </section>

        <div className="tabs">
          <button className="tab active">Profile</button>
          <button className="tab">Gallery</button>
          <button className="tab">Contact</button>
        </div>

        <section className="tab-panels">
          <article className="panel active">
            <div className="gallery">{sample.map((s, i) => <img src={s} key={i} alt={`img-${i}`} />)}</div>
            {qr && <div style={{ marginTop: 12 }}><img src={qr} alt="QR" style={{ width: 96, height: 96 }} /></div>}
          </article>
        </section>
      </main>
    </div>
  );
}