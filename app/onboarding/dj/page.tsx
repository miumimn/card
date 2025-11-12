"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for DJ template
 * - mixes: metadata lines "Title | meta | image-filename-or-URL"
 * - mix_links: one link per line (corresponding to mixes lines) — separate block for links
 * - mixesImages: up to 3 images (maxImages = 3)
 * - max mixes shown = 3
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Artist / DJ name", type: "text", placeholder: "e.g. Nova Lane", required: true },
    { name: "title", label: "Role / short title", type: "text", placeholder: "e.g. DJ & Producer" },
    { name: "about", label: "About (short bio)", type: "textarea", placeholder: "Short bio & what you play" },
    { name: "genres", label: "Genres (comma or newline separated)", type: "textarea", placeholder: "House\nTechno" },

    { name: "heroImage", label: "Hero image (full-bleed)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "avatar", label: "Avatar (round)", type: "files", maxFiles: 1, accept: "image/*" },

    // mixes metadata lines; images separate
    { name: "mixes", label: "Mixes (one per line: 'Title | meta | image-filename or URL') — max 3 mixes", type: "textarea", placeholder: "Afterlight — Live Mix | 60 min • 2025 | afterlight.jpg" },
    { name: "mix_links", label: "Mix links (one per line, corresponding to mixes above) — max 3", type: "textarea", placeholder: "https://soundcloud.com/your-mix\nhttps://yourhost/... " },
    { name: "mixesImages", label: "Mix images (optional, up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "gigs", label: "Gigs (one per line: 'Date | Venue | meta | url')", type: "textarea", placeholder: "2025-11-20 | The Echo, LA | 9pm • Tickets | https://tickets.example" },

    { name: "email", label: "Booking email", type: "email", placeholder: "bookings@you.com" },
    { name: "phone", label: "Phone number (for bookings)", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "agent", label: "Agent / Agency (optional)", type: "text", placeholder: "e.g. Lumen Talent" },

    // socials
    { name: "instagram", label: "Instagram handle or URL", type: "text", placeholder: "@yourhandle or https://instagram.com/..." },
    { name: "tiktok", label: "TikTok handle or URL", type: "text", placeholder: "@yourhandle or https://tiktok.com/..." },
    { name: "twitter", label: "Twitter handle or URL", type: "text", placeholder: "@yourhandle or https://twitter.com/..." },
    { name: "facebook", label: "Facebook page or URL", type: "text", placeholder: "https://facebook.com/yourpage" },
    { name: "soundcloud", label: "SoundCloud profile or URL", type: "text", placeholder: "https://soundcloud.com/yourprofile" },

    { name: "contact_cards", label: "Contact cards (one per line, e.g. 'Rider & Tech Specs')", type: "textarea", placeholder: "Rider & Tech Specs\nPress Kit\nPromo Images" },

    { name: "profile_url", label: "Public profile URL (for QR / Listen CTA)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="dj" fields={questions} />;
}