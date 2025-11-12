"use client";
import React, { useState } from "react";

interface InfluencerPreviewProps {
  handleSelectTemplate?: (templateName: string) => void;
  onBack?: () => void;
}

const InfluencerPreview: React.FC<InfluencerPreviewProps> = ({
  handleSelectTemplate,
  onBack,
}) => {
  const [tab, setTab] = useState<"about" | "links" | "contact">("about");

  return (
    <div
      className="influencer-page"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0b1220 0%, #07192a 100%)",
        padding: "22px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <div
        className="influencer-content"
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          flexDirection: window.innerWidth < 880 ? "column" : "row",
        }}
      >
        {/* Left Column */}
        <aside
          className="influencer-left"
          style={{ flex: "0 0 320px", width: "100%" }}
        >
          <div className="profile-surface">
            <div
              className="avatar"
              style={{
                backgroundImage: "url('https://picsum.photos/id/1027/800/800')",
              }}
            ></div>
            <h1 className="name">Sierra Lane</h1>
            <p className="role">Lifestyle Creator</p>

            <div className="social-row" aria-label="social links">
              <a className="social" href="#" aria-label="Instagram" title="Instagram">
                <svg viewBox="0 0 24 24" className="icon" width="18" height="18">
                  <path
                    d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                  />
                </svg>
              </a>

              <a className="social" href="#" aria-label="TikTok" title="TikTok">
                <svg viewBox="0 0 24 24" className="icon" width="18" height="18">
                  <path
                    d="M12 2v14a4 4 0 1 1-4-4V6a6 6 0 1 0 6 6h2V6h-4z"
                    fill="currentColor"
                  />
                </svg>
              </a>

              <a className="social" href="#" aria-label="YouTube" title="YouTube">
                <svg viewBox="0 0 24 24" className="icon" width="18" height="18">
                  <path
                    d="M22 7.5s-.2-1.6-.8-2.3c-.8-.9-1.8-.9-2.2-1C15.9 4 12 4 12 4s-3.9 0-6.9.2c-.4 0-1.4.1-2.2 1C2.2 5.9 2 7.5 2 7.5S2 9.2 2 11v2c0 1.8 0 3.5 0 3.5s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.8.2 7.8.2 7.8.2s3.9 0 6.9-.2c.4 0 1.4-.1 2.2-1 .6-.7.8-2.3.8-2.3S22 14.8 22 13v-2c0-1.8 0-3.5 0-3.5z"
                    fill="currentColor"
                  />
                  <polygon points="10,14 16,12 10,10" fill="#fff" />
                </svg>
              </a>
            </div>

            <div className="stats-row" aria-hidden="false">
              <div className="stat">
                <strong>128k</strong>
                <small>Followers</small>
              </div>
              <div className="stat">
                <strong>24.5k</strong>
                <small>Engagement</small>
              </div>
              <div className="stat">
                <strong>1.2M</strong>
                <small>Views</small>
              </div>
            </div>

            <div className="actions" style={{ marginTop: "12px" }}>
              <a className="btn primary-btn" href="#">
                Work With Me
              </a>
              <a className="btn ghost" href="#">
                Merch
              </a>
            </div>
          </div>
        </aside>

        {/* Right Column */}
        <main className="influencer-right" style={{ flex: 1 }}>
          <div className="content-surface">
            {/* Tabs */}
            <div
              className="tabs"
              role="tablist"
              aria-label="influencer tabs"
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {["about", "links", "contact"].map((t) => (
                <button
                  key={t}
                  className={`tab ${tab === t ? "active" : ""}`}
                  onClick={() => setTab(t as any)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Panels */}
            {tab === "about" && (
              <section id="about" className="panel" role="tabpanel">
                <h3>About</h3>
                <p className="muted">
                  Sierra creates approachable lifestyle content covering fashion,
                  travel, and everyday wellness. Brand collabs and campaigns
                  available.
                </p>
                <div
                  className="gallery influencer-gallery"
                  style={{ marginTop: 12 }}
                >
                  <img src="https://picsum.photos/id/1035/1000/700" alt="post1" />
                  <img src="https://picsum.photos/id/1036/1000/700" alt="post2" />
                  <img src="https://picsum.photos/id/1037/1000/700" alt="post3" />
                </div>
              </section>
            )}

            {tab === "links" && (
              <section id="links" className="panel" role="tabpanel">
                <h3>Top Links</h3>
                <div className="link-grid">
                  <a className="link-card" href="#">
                    <strong>Latest Video</strong>
                    <small>YouTube</small>
                  </a>
                  <a className="link-card" href="#">
                    <strong>Merch</strong>
                    <small>Shop</small>
                  </a>
                  <a className="link-card" href="#">
                    <strong>Collab Info</strong>
                    <small>Brand</small>
                  </a>
                  <a className="link-card" href="#">
                    <strong>Podcast</strong>
                    <small>Listen</small>
                  </a>
                </div>

                <div className="cta-row" style={{ marginTop: 12 }}>
                  <a className="primary-btn" href="#">
                    Work With Me
                  </a>
                  <a className="primary-btn alt" href="#">
                    Book a Collab
                  </a>
                </div>
              </section>
            )}

            {tab === "contact" && (
              <section id="contact" className="panel" role="tabpanel">
                <h3>Contact</h3>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:sierra@example.com">sierra@example.com</a>
                </p>
                <p>
                  <strong>Manager:</strong>{" "}
                  <a href="tel:+15559876543">+1 (555) 987-6543</a>
                </p>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Footer Buttons */}
      <div
        style={{
          marginTop: 24,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button className="btn ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          className="btn primary-btn"
          onClick={() => handleSelectTemplate?.("influencer")}
        >
          Use This Template
        </button>
      </div>
    </div>
  );
};

export default InfluencerPreview;
