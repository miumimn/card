"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface SocialLink {
  name: string;
  url: string;
}

export interface Exhibition {
  year?: string;
  title: string;
  venue?: string;
}

export interface ShopItem {
  title: string;
  price?: string;
}

export interface ArtistUser {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: string;
  description?: string; // hero card text
  works?: string[]; // image URLs
  exhibitions?: Exhibition[];
  shopItems?: ShopItem[];
  contactEmail?: string;
  qrUrl?: string;
  socials?: SocialLink[];
}

// Inline SVG icons to avoid external deps
function IconInstagram({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM12 7.5C14.2091 7.5 16 9.29086 16 11.5C16 13.7091 14.2091 15.5 12 15.5C9.79086 15.5 8 13.7091 8 11.5C8 9.29086 9.79086 7.5 12 7.5ZM17.5 6.25C17.7761 6.25 18 6.47386 18 6.75C18 7.02614 17.7761 7.25 17.5 7.25C17.2239 7.25 17 7.02614 17 6.75C17 6.47386 17.2239 6.25 17.5 6.25Z" />
    </svg>
  );
}

function IconBehance({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M170 237h56c13 0 24-10 24-24s-11-24-24-24h-56zM64 64h384v384H64z" opacity="0.01" />
      <path d="M119 206h65c24 0 45-20 45-45s-21-45-45-45h-65v90zM260 122h112v34H260zM260 170h64c48 0 80 26 80 72 0 33-20 72-82 72h-62v-144z" />
    </svg>
  );
}

function IconWebsite({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.93V20h-2v-.07A8.01 8.01 0 014.07 13H6v-2H4.07A8.01 8.01 0 0111 4.07V6h2V4.07A8.01 8.01 0 0119.93 11H18v2h1.93A8.01 8.01 0 0113 19.93z" />
    </svg>
  );
}

function IconWhatsApp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20.52 3.48A11.86 11.86 0 0012 0C5.373 0 .02 5.353.02 12c0 2.112.552 4.163 1.6 5.98L0 24l6.31-1.632A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.12-3.48-8.52zM12 21.5c-1.5 0-2.97-.4-4.24-1.15l-.3-.18-3.75.98.98-3.66-.18-.3A8.5 8.5 0 113.5 12 8.49 8.49 0 0012 21.5z" />
    </svg>
  );
}

function IconTikTok({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden>
      <path d="M232 92.67a71.86 71.86 0 0 1-43.27-14.44A72 72 0 0 1 144 8a8 8 0 0 0-8 8v132a24 24 0 1 1-24-24 8 8 0 0 0 8-8V84a8 8 0 0 0-8-8a56 56 0 1 0 56 56v-50.91a88.09 88.09 0 0 0 43.27 11.58A8 8 0 0 0 232 85a8 8 0 0 0 0-15.94Z" />
    </svg>
  );
}

function IconPinterest({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 3.04 1.43 5.75 3.66 7.41-.05-.63-.1-1.6.02-2.29.11-.55.72-3.5.72-3.5s-.18-.36-.18-.9c0-.84.49-1.47 1.1-1.47.52 0 .77.39.77.86 0 .53-.34 1.33-.52 2.07-.15.62.32 1.12.95 1.12 1.14 0 2.02-1.2 2.02-2.94 0-1.53-1.1-2.6-2.9-2.6-1.97 0-3.15 1.48-3.15 3.02 0 .59.23 1.22.52 1.56.06.07.07.13.05.2-.06.22-.19.7-.22.8-.04.13-.14.17-.31.1-1.15-.53-1.86-2.23-1.86-3.6C4.02 7.39 7.82 4 12 4s7.98 3.39 7.98 7.55c0 4.4-2.79 7.95-6.64 7.95-1.33 0-2.58-.69-3.01-1.5 0 0-.7 2.66-.84 3.16-.25.95-.74 1.9-1.17 2.63C9.71 23.8 10.84 24 12 24c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export const artistTemplateQuestions = {
  artist: [
    { name: "name", label: "Artist name", type: "text" },
    { name: "role", label: "Art category / medium", type: "text" },
    { name: "bio", label: "Short bio", type: "textarea" },
    { name: "avatar", label: "Profile photo (image)", type: "image" },
    { name: "description", label: "Hero description (short)", type: "textarea" },
    { name: "works", label: "Upload artworks (gallery)", type: "gallery", max: 6 },
    { name: "exhibitions", label: "Exhibitions (list)", type: "list" },
    { name: "shopItems", label: "Shop / prints (list)", type: "list" },
    { name: "contactEmail", label: "Contact email", type: "email" },
    { name: "qrUrl", label: "QR link (profile)", type: "text" },
    { name: "socials", label: "Social links", type: "socials" },
  ],
};

export default function ArtistTemplate({ user }: { user?: ArtistUser }) {
  const demo: ArtistUser = {
    name: "Maya K.",
    role: "Visual Artist — Mixed Media",
    bio: "Works across collage, paint and digital layers to produce intimate works referencing place and memory.",
    avatar: "https://picsum.photos/id/1019/400/400",
    description:
      "Layered textural pieces exploring memory and place. Commissions, prints and gallery collaborations available.",
    works: [
      "https://picsum.photos/seed/a1/800/600",
      "https://picsum.photos/seed/a2/800/600",
      "https://picsum.photos/seed/a3/800/600",
      "https://picsum.photos/seed/a4/800/600",
      "https://picsum.photos/seed/a5/800/600",
      "https://picsum.photos/seed/a6/800/600",
    ],
    exhibitions: [
      { year: "2024", title: "Solo show, Gallery Nova", venue: "Gallery Nova" },
      { year: "2022", title: "Art Fair", venue: "Main Hall" },
    ],
    shopItems: [
      { title: "Small Print — 8x10", price: "$25" },
      { title: "Large Print — 18x24", price: "$120" },
    ],
    contactEmail: "maya@example.com",
    qrUrl: "https://example.com/maya",
    socials: [
      { name: "Instagram", url: "https://instagram.com/ava.photos" },
      { name: "Behance", url: "https://behance.net/ava" },
      { name: "Website", url: "https://ava.design" },
    ],
  };

  const data = user ?? demo;
  const [activeTab, setActiveTab] = useState<string>("works");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07060a] to-[#0b0712] text-white py-6 px-4">
      <main className="max-w-[980px] mx-auto">
        <section className="hero rounded-2xl overflow-hidden bg-gradient-to-b from-[rgba(255,107,203,0.03)] to-[rgba(0,0,0,0.12)] min-h-[40vw] flex flex-col justify-end p-4 shadow-[0_16px_40px_rgba(2,6,23,0.6)]">
          <div className="hero-top flex items-center gap-3">
            <div
              className="avatar rounded-full flex-shrink-0"
              style={{ width: 88, height: 88, backgroundImage: `url(${data.avatar})`, backgroundSize: "cover", backgroundPosition: "center", border: "4px solid rgba(255,255,255,0.06)", boxShadow: "0 12px 30px rgba(176,108,255,0.06)" }}
              aria-hidden
            />

            <div className="meta">
              <h1 className="name text-[20px] font-black text-[var(--a-accent)]">{data.name}</h1>
              <div className="role text-[13px] font-extrabold text-[#b9a7c9]">{data.role}</div>

              <nav className="social-row mt-2 flex gap-2" aria-label="social links">
                {data.socials?.map((s) => (
                  <a key={s.name} className="social inline-flex items-center justify-center px-2" href={s.url} target="_blank" rel="noreferrer">
                    {s.name === "Instagram" && <IconInstagram />}
                    {s.name === "Behance" && <IconBehance />}
                    {s.name === "Website" && <IconWebsite />}
                    {s.name === "WhatsApp" && <IconWhatsApp />}
                    {s.name === "TikTok" && <IconTikTok />}
                    {s.name === "Pinterest" && <IconPinterest />}
                    <span className="sr-only">{s.name}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="hero-card mt-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-3 rounded-lg border border-[rgba(255,255,255,0.02)] text-[#b9a7c9] backdrop-blur-sm">
            <p>{data.description}</p>
          </div>
        </section>

        <nav className="tabs flex gap-2 mt-4" role="tablist" aria-label="Profile tabs">
          {[
            { id: "works", label: "Works" },
            { id: "about", label: "About" },
            { id: "exhibitions", label: "Exhibitions" },
            { id: "shop", label: "Shop / Prints" },
            { id: "contact", label: "Contact" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab px-3 py-2 rounded-md font-extrabold text-sm ${activeTab === t.id ? "active bg-gradient-to-r from-[#ff6bcb] to-[rgba(255,107,203,0.08)] text-[#14020a]" : "text-[#b9a7c9] border border-[rgba(255,255,255,0.03)]"}`}
              onClick={() => setActiveTab(t.id)}
              data-tab={t.id}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <section className="panels mt-4" aria-live="polite">
          <article id="works" className={`panel ${activeTab === "works" ? "active" : "hidden"}`} role="tabpanel">
            <h3 className="text-lg font-semibold mb-3">Selected Works</h3>
            <div className="works-grid grid grid-cols-2 md:grid-cols-3 gap-2">
              {(data.works || []).map((w, i) => (
                <div key={i} className="tile rounded-lg overflow-hidden h-[140px] bg-black relative">
                  <img src={w} alt={`work ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </article>

          <article id="about" className={`panel ${activeTab === "about" ? "active" : "hidden"}`} role="tabpanel">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-[#b9a7c9] leading-relaxed">{data.bio}</p>
          </article>

          <article id="exhibitions" className={`panel ${activeTab === "exhibitions" ? "active" : "hidden"}`} role="tabpanel">
            <h3 className="text-lg font-semibold mb-3">Exhibitions</h3>
            <div className="exhibitions flex flex-col gap-2">
              {data.exhibitions?.map((e, i) => (
                <div key={i} className="exhibit p-3 rounded-md border border-[rgba(255,255,255,0.02)] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.01))] text-[#b9a7c9]">
                  <strong>{e.year ? `${e.year} — ` : ""}{e.title}</strong>
                  {e.venue && <div className="sub text-[#b9a7c9]">{e.venue}</div>}
                </div>
              ))}
            </div>
          </article>

          <article id="shop" className={`panel ${activeTab === "shop" ? "active" : "hidden"}`} role="tabpanel">
            <h3 className="text-lg font-semibold mb-3">Shop / Prints</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.shopItems?.map((s, i) => (
                <div key={i} className="p-3 rounded-md border border-[rgba(255,255,255,0.02)] bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.01))]">
                  <strong>{s.title}</strong>
                  {s.price && <div className="sub text-[#b9a7c9]">{s.price}</div>}
                </div>
              ))}
            </div>
          </article>

          <article id="contact" className={`panel ${activeTab === "contact" ? "active" : "hidden"}`} role="tabpanel">
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <p className="text-[#b9a7c9] mb-3">Email: <a href={`mailto:${data.contactEmail}`} className="text-white">{data.contactEmail}</a></p>

            <div className="contact-row flex items-center gap-4 flex-wrap">
              <a className="primary-btn inline-block px-4 py-2 rounded-md bg-gradient-to-r from-[#ff6bcb] to-[#ff9ae1] text-[#14020a] font-extrabold" href="#">Enquire / Commission</a>

              <div className="qr flex items-center gap-3">
                {data.qrUrl && (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrUrl)}`} alt="QR to profile" className="w-20 h-20 rounded-md bg-white" />
                )}

                {data.qrUrl && (
                  <div className="text-sm text-[#b9a7c9]">
                    <div>Download QR</div>
                    <a className="primary-btn inline-block mt-2 text-sm px-3 py-2" href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(data.qrUrl)}`} download>
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
