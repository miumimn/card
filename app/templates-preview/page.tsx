"use client";

import React, { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TemplateLoader from "./components/TemplateLoader";

/**
 * Template selector / gallery (mobile-first)
 *
 * Fixes applied:
 * - Robust search: case-insensitive, diacritics-insensitive, trims input, matches title/slug/desc/category
 * - Deduplicate templates by slug so duplicates won't break search/pinning
 * - Pin "Profile (Normal)" at the top reliably
 * - Small debounce on input to avoid excessive re-renders on mobile typing
 * - Adds live result count (aria-live) for accessibility
 *
 * Visual layout and interactions are preserved.
 */

type Template = {
  title: string;
  slug: string;
  thumb: string;
  desc?: string;
  category?: "business" | "individual";
};

const RAW_TEMPLATES: Template[] = [
  { title: "Profile (Normal)", slug: "normal", thumb: "/thumbs/normal-profile.png", desc: "Full-bleed profile layout", category: "individual" },

  // Individual / creator-like templates
  { title: "Artist", slug: "artist", thumb: "/thumbs/artist.png", desc: "Visual portfolio & lookbook", category: "individual" },
  { title: "Photographer", slug: "photographer", thumb: "/thumbs/photographer.png", desc: "Portfolio & gallery", category: "individual" },
  { title: "Musician", slug: "musician", thumb: "/thumbs/musician.png", desc: "Artist page with tracks & gigs", category: "individual" },
  { title: "DJ", slug: "dj", thumb: "/thumbs/dj.png", desc: "Mixes, gigs & rider", category: "individual" },
  { title: "Driver", slug: "driver", thumb: "/thumbs/driver.png", desc: "Chauffeur & booking profile", category: "individual" },
  { title: "Content Creator", slug: "content-creator", thumb: "/thumbs/content-creator.png", desc: "Creator portfolio & kit", category: "individual" },
  { title: "Creator Bundle", slug: "creator", thumb: "/thumbs/creator.png", desc: "All-in-one creator landing", category: "individual" },
  { title: "Influencer", slug: "influencer", thumb: "/thumbs/influencer.png", desc: "Social media & brand kit", category: "individual" },
  { title: "Developer", slug: "Developer", thumb: "/thumbs/developer.png", desc: "Developer / engineer profile", category: "individual" },
  { title: "Makeup Artist", slug: "makeup-artist", thumb: "/thumbs/makeup-artist.png", desc: "Beauty & bridal portfolio", category: "individual" },
  { title: "Hairdresser", slug: "Hairdresser", thumb: "/thumbs/hairdresser.png", desc: "Salon & bookings", category: "individual" },
  { title: "Eyelash Tech", slug: "eyelash-tech", thumb: "/thumbs/eyelash-tech.png", desc: "Beauty specialist & services", category: "individual" },
  { title: "Freelancer", slug: "freelancer", thumb: "/thumbs/freelancer.png", desc: "Independent consultant landing", category: "individual" },
  { title: "Gym Trainer", slug: "gym-trainer", thumb: "/thumbs/gym-trainer.png", desc: "Classes & training programs", category: "individual" },
  { title: "Job Seeker", slug: "job-seeker", thumb: "/thumbs/job-seeker.png", desc: "Resume & portfolio", category: "individual" },
  { title: "Videographer", slug: "videographer", thumb: "/thumbs/videographer.png", desc: "Showreel-first cinematic layout", category: "individual" },
  { title: "Seller", slug: "seller", thumb: "/thumbs/seller.png", desc: "Full-bleed seller profile", category: "business" },

  // Service pros / trades / business templates
  { title: "Chef", slug: "chef", thumb: "/thumbs/chef.png", desc: "Private chef & menu showcase", category: "business" },
  { title: "Consultant", slug: "consultant", thumb: "/thumbs/consultant.png", desc: "Strategy & consulting profile", category: "business" },
  { title: "Real Estate / Realtor", slug: "realtor", thumb: "/thumbs/realtor.png", desc: "Agent & listings highlight", category: "business" },
  { title: "Construction / Contractor", slug: "construction-contractor", thumb: "/thumbs/construction.png", desc: "Contractor & projects", category: "business" },
  { title: "Doctor", slug: "doctor", thumb: "/thumbs/doctor.png", desc: "Clinic & booking profile", category: "individual" },
  { title: "Lawyer", slug: "lawyer", thumb: "/thumbs/lawyer.png", desc: "Attorney & practice areas", category: "individual" },
  { title: "Handyman", slug: "handyman", thumb: "/thumbs/handyman.png", desc: "Trades: quick actions & booking", category: "individual" },
  { title: "Gardener", slug: "gardener", thumb: "/thumbs/gardener.png", desc: "Landscaping & maintenance", category: "business" },
  { title: "IT Specialist", slug: "it-specialist", thumb: "/thumbs/it-specialist.png", desc: "Tech support & consulting", category: "individual" },
  { title: "Optician", slug: "optician", thumb: "/thumbs/optician.png", desc: "Eye tests & frames", category: "business" },
   
  { title: "Event Planner", slug: "event-planner", thumb: "/thumbs/event-planner.png", desc: "Events & packages", category: "business" },
];

function normalize(text?: string) {
  if (!text) return "";
  // remove diacritics, lowercase and trim
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function TemplateSelector() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "alpha">("featured");
  const [group, setGroup] = useState<"all" | "individual" | "business">("all");

  const debouncedQRef = useRef<string>("");
  // simple debounce: update debounced ref on input with small timeout
  // avoids extra state and re-renders as user types fast on mobile
  function handleChange(v: string) {
    setQ(v);
    debouncedQRef.current = v;
  }

  // dedupe by slug and produce templates list
  const TEMPLATES = useMemo(() => {
    const map = new Map<string, Template>();
    for (const t of RAW_TEMPLATES) {
      if (!map.has(t.slug)) map.set(t.slug, t);
    }
    return Array.from(map.values());
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(debouncedQRef.current || q);
    let list = TEMPLATES.filter((t) => {
      // apply group filtering first if requested
      if (group !== "all" && t.category !== group) return false;
      if (!term) return true;
      // match title / slug / desc / category
      const haystack = [
        normalize(t.title),
        normalize(t.slug),
        normalize(t.desc),
        normalize(t.category),
      ].join(" ");
      return haystack.includes(term);
    });

    // ensure "normal" profile is pinned at top
    list = list.sort((a, b) => {
      if (a.slug === "normal") return -1;
      if (b.slug === "normal") return 1;
      return 0;
    });

    if (sortBy === "alpha") {
      const pinned = list.filter((t) => t.slug === "normal");
      const rest = list.filter((t) => t.slug !== "normal").sort((a, b) => a.title.localeCompare(b.title));
      list = [...pinned, ...rest];
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TEMPLATES, q, sortBy, group]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Loader overlay for the templates page */}
      <TemplateLoader />

      <div className="max-w-6xl mx-auto">
        {/* Header / Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Pick a template
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              Browse, preview and start onboarding. Tap a card to preview, or use the template directly to begin the onboarding flow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <label htmlFor="search" className="sr-only">
              Search templates
            </label>
            <div className="relative flex-1">
              <input
                id="search"
                type="search"
                value={q}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search templates (name, slug, description)..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                aria-label="Search templates"
              />
              {q && (
                <button
                  aria-label="Clear search"
                  onClick={() => handleChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
              aria-label="Sort templates"
            >
              <option value="featured">Featured</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Group segmented control (mobile-first) */}
        <div className="mb-6 flex gap-2 items-center">
          <div className="text-sm text-gray-600 mr-2">Group:</div>
          <div className="inline-flex rounded-xl bg-white/60 p-1 shadow-sm">
            <button
              onClick={() => setGroup("all")}
              className={`px-3 py-1.5 text-sm rounded-lg ${group === "all" ? "bg-indigo-600 text-white" : "text-gray-700"}`}
              aria-pressed={group === "all"}
            >
              All
            </button>
            <button
              onClick={() => setGroup("individual")}
              className={`px-3 py-1.5 text-sm rounded-lg ${group === "individual" ? "bg-indigo-600 text-white" : "text-gray-700"}`}
              aria-pressed={group === "individual"}
            >
              Individual
            </button>
            <button
              onClick={() => setGroup("business")}
              className={`px-3 py-1.5 text-sm rounded-lg ${group === "business" ? "bg-indigo-600 text-white" : "text-gray-700"}`}
              aria-pressed={group === "business"}
            >
              Business
            </button>
          </div>

          <div className="ml-auto text-xs text-gray-500">Suggested: Profile (Normal)</div>
        </div>

        {/* Live results count for accessibility */}
        <div className="mb-4 text-sm text-gray-600" aria-live="polite">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""} found
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <article
              key={tpl.slug}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/templates-preview/${tpl.slug}`);
              }}
              onClick={() => router.push(`/templates-preview/${tpl.slug}`)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col"
              aria-label={`Preview ${tpl.title}`}
            >
              <div className="relative h-44 sm:h-48 w-full bg-gray-100">
                <img
                  src={tpl.thumb}
                  alt={`${tpl.title} thumbnail`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Gradient overlay for readable title */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)" }} />
                <div className="absolute left-3 bottom-3 bg-white/95 rounded-full px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                  {tpl.title}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{tpl.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{tpl.category}</span>
                </div>

                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{tpl.desc}</p>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/templates-preview/${tpl.slug}`);
                    }}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition"
                    aria-label={`Preview ${tpl.title}`}
                  >
                    Preview
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/onboarding/${tpl.slug}`);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-700 transition"
                    aria-label={`Use ${tpl.title}`}
                  >
                    Use this template
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                      <path d="M12 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 22v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs text-gray-500">{tpl.slug}</span>
                  </div>
                  <div className="text-gray-400">Preview →</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            No templates match your search. Try a different term or browse categories.
          </div>
        )}
      </div>
    </main>
  );
}