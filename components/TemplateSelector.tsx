// components/TemplateSelector.tsx
"use client";
import React from "react";
import Link from "next/link";

export default function TemplateSelector({ templates }: { templates?: { id: string; title: string; desc?: string; thumbClass?: string }[] }) {
  const items = templates || [
    { id: "photographer", title: "Photographer", desc: "Gallery-first layout", thumbClass: "thumb-photographer" },
    { id: "boutique-fashion", title: "Boutique / Fashion", desc: "Lookbook-first", thumbClass: "thumb-boutique-fashion" },
    { id: "photographer-pro", title: "Photographer Pro", desc: "Client delivery, prints & testimonials", thumbClass: "thumb-photoprof" },
    { id: "artist", title: "Artist", desc: "Gallery-first, mixed-media portfolio", thumbClass: "thumb-artist" },
    { id: "jobseeker", title: "Job Seeker", desc: "Resume-first, CV & timeline", thumbClass: "thumb-jobseeker" },
    { id: "developer", title: "Developer", desc: "Minimal, projects & contact", thumbClass: "thumb-developer" },
    { id: "videographer", title: "Videographer / Filmmaker", desc: "Showreel-first with embedded videos", thumbClass: "thumb-videographer" },
    { id: "writer", title: "Writer / Blogger", desc: "Reading-first, posts & subscribe", thumbClass: "thumb-writer" },
    { id: "webdesigner", title: "Web Designer", desc: "Device mock hero, UI portfolio", thumbClass: "thumb-webdesigner" },
    { id: "therapist", title: "Therapist", desc: "Calm, private care & booking", thumbClass: "thumb-therapist" },
    { id: "seller", title: "Seller / Store", desc: "Mini storefront — product listings", thumbClass: "thumb-seller" },
    { id: "vet", title: "Veterinarian", desc: "Clinic care, booking & emergency info", thumbClass: "thumb-vet" },
    { id: "doctor", title: "Doctor", desc: "Clean healthcare layout" }

    // add all templates...
  ];

  return (
    <section className="grid">
      {items.map(t => (
        <Link key={t.id} href={`/preview/${t.id}`} className="card" data-name={t.id}>
          <div className={`card-thumbnail ${t.thumbClass || "thumb-normal"}`} />
          <h3>{t.title}</h3>
          <p>{t.desc}</p>
        </Link>
      ))}
    </section>
  );
}
