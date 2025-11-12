import React from "react";
import { Youtube, Vimeo, Globe } from "lucide-react";

export type VideoItem = {
  title: string;
  embed?: string; // iframe src (YouTube/Vimeo) or link
  provider?: "youtube" | "vimeo" | "other";
  poster?: string;
};

export type VideographerProps = {
  brand?: {
    name?: string;
    role?: string;
    avatar?: string;
  };
  showreel?: string; // main showreel embed url (iframe src)
  videos?: VideoItem[]; // other videos for portfolio
  services?: string[];
  socials?: {
    instagram?: string;
    vimeo?: string;
    youtube?: string;
    website?: string;
    email?: string;
  };
  sampleVideos?: VideoItem[]; // fallback
  ariaLabel?: string;
};

export default function VideographerTemplate({
  brand = {},
  showreel,
  videos = [],
  services = [],
  socials = {},
  sampleVideos = [
    { title: "Showreel — 90s", embed: "https://www.youtube.com/embed/ysz5S6PUM-U", provider: "youtube" },
    { title: "Commercial Cut", embed: "https://www.youtube.com/embed/2Vv-BfVoq4g", provider: "youtube" },
    { title: "Short Doc", embed: "https://www.youtube.com/embed/3JZ_D3ELwOQ", provider: "youtube" },
  ],
  ariaLabel = "Videographer template",
}: VideographerProps) {
  const effectiveVideos = (videos && videos.length ? videos : sampleVideos).slice(0, 12);
  const mainShowreel = showreel || effectiveVideos[0]?.embed || "";

  return (
    <div className="vid" aria-label={ariaLabel}>
      <main className="wrap">
        <header className="hero">
          <div className="reel" aria-label="Showreel placeholder">
            {mainShowreel ? (
              <iframe
                src={mainShowreel}
                title={brand.name ? `${brand.name} showreel` : "Showreel"}
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div style={{ color: "#fff", textAlign: "center" }}>No showreel provided</div>
            )}
          </div>

          <div className="meta">
            <div
              className="avatar"
              aria-hidden="true"
              style={{ backgroundImage: `url('${brand.avatar || effectiveVideos[0]?.poster || "https://picsum.photos/id/1011/400/400"}')` }}
            />
            <div>
              <h1 className="name">{brand.name || "ReelWorks Films"}</h1>
              <div className="role">{brand.role || "Videographer & Filmmaker — Commercials • Weddings • Docs"}</div>
            </div>
          </div>
        </header>

        <nav className="tabs" role="tablist">
          <button className="tab active" data-tab="showreel">Showreel</button>
          <button className="tab" data-tab="portfolio">Portfolio</button>
          <button className="tab" data-tab="services">Services</button>
          <button className="tab" data-tab="contact">Contact</button>
        </nav>

        <section className="panels">
          <article id="showreel" className="panel active">
            <div className="videos" aria-live="polite">
              {effectiveVideos.map((v, i) => (
                <div className="video-item" key={i}>
                  {v.embed ? (
                    <iframe
                      src={v.embed}
                      title={v.title}
                      allowFullScreen
                      frameBorder={0}
                      style={{ width: "100%", height: 150 }}
                    />
                  ) : v.poster ? (
                    <img src={v.poster} alt={v.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: 150, background: "#000" }} />
                  )}
                </div>
              ))}
            </div>
          </article>

          <article id="portfolio" className="panel">
            <h3 style={{ margin: 0, marginBottom: 8 }}>Selected Work</h3>
            <div className="videos">
              {effectiveVideos.map((v, i) => (
                <div className="video-item" key={i}>
                  {v.embed ? (
                    <iframe src={v.embed} title={v.title} allowFullScreen frameBorder={0} style={{ width: "100%", height: 150 }} />
                  ) : (
                    <div style={{ width: "100%", height: 150, background: "#000" }} />
                  )}
                </div>
              ))}
            </div>
          </article>

          <article id="services" className="panel">
            <div className="services">
              {(services && services.length ? services : ["Commercial Films", "Event Coverage", "Documentaries"]).map((s, i) => (
                <div className="service" key={i}>{s}</div>
              ))}
            </div>
          </article>

          <article id="contact" className="panel">
            <h3 style={{ margin: 0, marginBottom: 8 }}>Contact</h3>
            {socials.email && <p style={{ margin: "0 0 8px" }}>Bookings: <a href={`mailto:${socials.email}`}>{socials.email}</a></p>}
            <div className="cta-row">
              <a className="primary-btn" href={socials.website || "#"} aria-label="Request Quote">
                Request Quote
              </a>

              <a
                className="primary-btn"
                href={socials.website ? `${socials.website}/kit.pdf` : "#"}
                style={{ background: "#fff", color: "var(--vid-accent)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                Download Kit
              </a>
            </div>

            <div style={{ marginTop: 12 }}>
              <nav className="social-row" aria-label="social links">
                {socials.youtube && (
                  <a className="social" href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <Youtube className="icon" />
                  </a>
                )}
                {socials.vimeo && (
                  <a className="social" href={socials.vimeo} target="_blank" rel="noopener noreferrer" aria-label="Vimeo">
                    <Vimeo className="icon" />
                  </a>
                )}
                {socials.website && (
                  <a className="social" href={socials.website} target="_blank" rel="noopener noreferrer" aria-label="Website">
                    <Globe className="icon" />
                  </a>
                )}
              </nav>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}