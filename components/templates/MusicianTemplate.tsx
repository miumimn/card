import React from "react";
import { Play, Music, Headphones, Mail, Phone } from "lucide-react";

export type Track = {
  title: string;
  length?: string;
  src?: string; // optional embed / stream URL
  spotify?: string;
  youtube?: string;
};

export type MusicianProps = {
  name?: string;
  role?: string;
  avatar?: string;
  bio?: string;
  genres?: string[];
  latestEP?: string;
  gallery?: string[];
  tracks?: Track[];
  socials?: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    website?: string;
    email?: string;
    phone?: string;
  };
  ariaLabel?: string;
  // callbacks
  onPlay?: (track: Track) => void;
  onBook?: () => void;
  sampleGallery?: string[];
};

const defaultGallery = [
  "/templates/musician1.jpg",
  "/templates/musician2.jpg",
  "/templates/musician3.jpg",
  "/templates/musician4.jpg",
];

export default function MusicianTemplate({
  name = "Nova Reed",
  role = "Singer / Songwriter",
  avatar,
  bio = "Nova blends indie, electronic, and soulful vocals. Performs live across the region and releases EPs regularly.",
  genres = ["Indie", "Electronic", "Soul"],
  latestEP = "Dawn Echoes — 2025",
  gallery = [],
  tracks = [],
  socials = {},
  ariaLabel = "Musician profile",
  onPlay,
  onBook,
  sampleGallery = defaultGallery,
}: MusicianProps) {
  const effectiveGallery = (gallery && gallery.length ? gallery : sampleGallery).slice(0, 8);
  const effectiveTracks = (tracks && tracks.length) ? tracks : [
    { title: "Dawn Echo", length: "3:42", spotify: socials.spotify },
    { title: "Midnight Bloom", length: "4:05", youtube: socials.youtube },
  ];

  const handlePlay = (t: Track) => {
    if (onPlay) onPlay(t);
    else {
      // default: open src / spotify / youtube if present
      if (t.src) window.open(t.src, "_blank", "noopener");
      else if (t.spotify) window.open(t.spotify, "_blank", "noopener");
      else if (t.youtube) window.open(t.youtube, "_blank", "noopener");
      else alert(`Play stub: ${t.title}`);
    }
  };

  return (
    <div className="card-page musician theme-music" aria-label={ariaLabel}>
      <main className="card-wrap musician-layout">
        <section className="hero" aria-label="Musician hero">
          <div
            className="avatar"
            style={{ backgroundImage: `url('${avatar || effectiveGallery[0] || sampleGallery[0]}')` }}
            role="img"
            aria-label={`${name} avatar`}
          />
          <h2 className="name">{name}</h2>
          <p className="role">{role}</p>

          <nav className="social-row" aria-label="social links">
            {socials.instagram && (
              <a className="social" href={socials.instagram} title="Instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="icon"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              </a>
            )}
            {socials.youtube && (
              <a className="social" href={socials.youtube} title="YouTube" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" className="icon"><path d="M22 7.5s-.2-1.6-.8-2.3c-.8-.9-1.8-.9-2.2-1C15.9 4 12 4 12 4s-3.9 0-6.9.2c-.4 0-1.4.1-2.2 1C2.2 5.9 2 7.5 2 7.5S2 9.2 2 11v2c0 1.8 0 3.5 0 3.5s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.8.2 7.8.2s3.9 0 6.9-.2c.4 0 1.4-.1 2.2-1 .6-.7.8-2.3.8-2.3S22 14.8 22 13v-2c0-1.8 0-3.5 0-3.5z" fill="currentColor"/><polygon points="10,14 16,12 10,10" fill="#fff"/></svg>
              </a>
            )}
            {socials.spotify && (
              <a className="social" href={socials.spotify} title="Spotify" target="_blank" rel="noopener noreferrer" aria-label="Spotify">
                <svg viewBox="0 0 24 24" className="icon"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.5 9.5c3-1.6 6.9-1 9 0" stroke="#fff" strokeWidth="1.2" fill="none"/><path d="M7 12c2.7-1.5 7.5-1.1 9.5 0" stroke="#fff" strokeWidth="1.2" fill="none"/></svg>
              </a>
            )}
          </nav>

          <div className="tabs" role="tablist" aria-label="musician tabs">
            <button className="tab active" data-tab="about">About</button>
            <button className="tab" data-tab="tracks">Tracks</button>
            <button className="tab" data-tab="contact">Contact</button>
          </div>
        </section>

        <section className="tab-panels">
          <article id="about" className="panel active" aria-labelledby="about-heading">
            <h3 id="about-heading">About</h3>
            {bio && <p>{bio}</p>}

            <div className="mini-info" aria-hidden={false}>
              <div>
                <strong>Genres</strong>
                <p className="muted">{genres.join(" / ")}</p>
              </div>
              <div>
                <strong>Latest EP</strong>
                <p className="muted">{latestEP}</p>
              </div>
            </div>

            <div className="gallery" aria-label="Gallery">
              {effectiveGallery.map((src, i) => (
                <img key={i} src={src} alt={`${name} gallery ${i + 1}`} />
              ))}
            </div>
          </article>

          <article id="tracks" className="panel" aria-labelledby="tracks-heading">
            <h3 id="tracks-heading">Tracks</h3>
            <ul className="track-list" aria-live="polite">
              {effectiveTracks.map((t, idx) => (
                <li key={idx}>
                  <div className="track-meta">
                    <strong>{t.title}</strong>
                    {t.length && <span className="muted">— {t.length}</span>}
                  </div>

                  <div className="track-actions">
                    <button
                      className="play-btn"
                      aria-label={`Play ${t.title}`}
                      onClick={() => handlePlayClick(t, handlePlay)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <Play size={14} /> Play
                    </button>

                    {t.spotify && (
                      <a className="link" href={t.spotify} target="_blank" rel="noopener noreferrer" title="Open on Spotify" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Headphones size={14} /> Spotify
                      </a>
                    )}

                    {t.youtube && (
                      <a className="link" href={t.youtube} target="_blank" rel="noopener noreferrer" title="Open on YouTube" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Music size={14} /> YouTube
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="cta-row">
              {socials.spotify && <a className="primary-btn" href={socials.spotify} target="_blank" rel="noopener noreferrer">Listen on Spotify</a>}
              <button className="primary-btn alt" onClick={() => onBook ? onBook() : alert("Book a gig: stub")}>Book a Gig</button>
            </div>
          </article>

          <article id="contact" className="panel" aria-labelledby="contact-heading">
            <h3 id="contact-heading">Contact</h3>
            <p>Email: {socials.email ? <a href={`mailto:${socials.email}`}>{socials.email}</a> : <a href="mailto:example@example.com">example@example.com</a>}</p>
            {socials.phone && <p>Booking agent: <a href={`tel:${socials.phone}`}>{socials.phone}</a></p>}
            <div style={{ marginTop: 8 }}>
              {socials.website && <a className="primary-btn" href={socials.website} target="_blank" rel="noopener noreferrer">Visit Website</a>}
              <a className="primary-btn alt" href="#contact" onClick={(e) => { e.preventDefault(); if (onBook) onBook(); }}>Contact / Book</a>
            </div>
          </article>
        </section>
      </main>

      <script
        // Keep minimal tab wiring for the static output (this script will run when the component is rendered in a browser environment).
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  try {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const panels = Array.from(document.querySelectorAll('.panel'));
    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      t.classList.add('active');
      const id = t.dataset.tab;
      const panel = document.getElementById(id);
      if (panel) panel.classList.add('active');
      if (panel) panel.scrollIntoView({behavior: 'smooth', block: 'start'});
    }));
  } catch (e) { /* silent */ }

  function handlePlayClick(t, cb) {
    try {
      // call cb in window scope if provided by host (when rendered outside React)
      if (typeof window.__MUSICIAN_ONPLAY === 'function') {
        window.__MUSICIAN_ONPLAY(t);
      }
    } catch(e){}
    if (typeof cb === 'function') cb(t);
  }
})();
`,
        }}
      />
    </div>
  );
}

// Helper: called inside component scope to avoid lint unused; actual click wiring is inline
function handlePlayClick(t: Track, cb?: (tr: Track) => void) {
  if (cb) cb(t);
}