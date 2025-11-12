import React from "react";
import { Play, Calendar, Mail } from "lucide-react";

export type DJProps = {
  name?: string;
  role?: string;
  avatar?: string;
  mixes?: { title: string; length?: string; src?: string; art?: string }[];
  gigs?: { date: string; title: string; venue?: string }[];
  socials?: { soundcloud?: string; mixcloud?: string; instagram?: string; email?: string };
  ariaLabel?: string;
  onPlay?: (mix: any) => void;
};

const sampleMixes = [
  { title: "Sunset Grooves — 90min", length: "90:00", art: "/templates/mix1.jpg" },
  { title: "Afterhours Tech — 75min", length: "75:00", art: "/templates/mix2.jpg" },
];

export default function DJTemplate({
  name = "MixMaster",
  role = "DJ • Producer",
  avatar,
  mixes = [],
  gigs = [],
  socials = {},
  ariaLabel = "DJ profile",
  onPlay,
}: DJProps) {
  const effectiveMixes = mixes.length ? mixes : sampleMixes;
  return (
    <div className="dj" aria-label={ariaLabel}>
      <main className="wrap">
        <section className="hero">
          <div className="meta">
            <div className="avatar" style={{ backgroundImage: `url('${avatar || effectiveMixes[0].art}')` }} />
            <div style={{ display: "inline-block", marginLeft: 12 }}>
              <h1 className="name">{name}</h1>
              <div className="role">{role}</div>
            </div>
          </div>
        </section>

        <nav className="tabs" role="tablist">
          <button className="tab active" data-tab="mixes">Latest Mixes</button>
          <button className="tab" data-tab="gigs">Upcoming Gigs</button>
          <button className="tab" data-tab="rider">Rider</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="mixes" className="panel active">
            <div className="mix-list">
              {effectiveMixes.map((m, i) => (
                <div className="mix" key={i}>
                  <img src={m.art || "/templates/mix-placeholder.jpg"} alt={m.title} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <strong>{m.title}</strong>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>{m.length}</div>
                  </div>
                  <div>
                    <button className="play-btn" onClick={() => onPlay ? onPlay(m) : alert("play stub")}>
                      <Play size={14} /> Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article id="gigs" className="panel">
            <div className="gigs">
              {(gigs && gigs.length ? gigs : [{ date: "Nov 14", title: "Warehouse Night", venue: "City Club" }]).map((g, idx) => (
                <div className="gig" key={idx}>
                  <strong>{g.date} — {g.title}</strong>
                  <div style={{ color: "var(--muted)" }}>{g.venue}</div>
                </div>
              ))}
            </div>
          </article>

          <article id="contact" className="panel">
            <h3>Bookings</h3>
            {socials.email && <a href={`mailto:${socials.email}`}><Mail size={16} /> {socials.email}</a>}
          </article>
        </section>
      </main>
    </div>
  );
}