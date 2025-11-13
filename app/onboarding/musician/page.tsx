"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Musician template
 *
 * Added additional social / musician-specific fields:
 *  - email (required)
 *  - spotify, apple_music, audiomack, soundcloud, bandcamp
 *  - instagram, youtube, tiktok
 *  - phone, website, booking_link, profile_url
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Artist / Band name", type: "text", placeholder: "e.g. Nova Lane", required: true },
    { name: "role", label: "Role / Genre", type: "text", placeholder: "Singer • Songwriter — Indie / Alternative" },
    { name: "about", label: "Short bio", type: "textarea", placeholder: "One-line artist bio" },

    { name: "tracks", label: "Tracks (JSON array or one per line 'Title — duration — year')", type: "textarea", placeholder: "Afterlight — 3:42 — 2025\nNeon Days — 4:10 — 2024" },
    { name: "gigs", label: "Upcoming gigs (one per line)", type: "textarea", placeholder: "Nov 20 — The Echo, LA • 9pm" },
    { name: "press", label: "Press mentions (one per line)", type: "textarea", placeholder: "Featured in Rolling Sound" },

    { name: "portfolio", label: "Gallery images (up to 12)", type: "files", maxFiles: 12, accept: "image/*" },
    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },

    // Contact + core socials
    { name: "email", label: "Contact / bookings email", type: "email", placeholder: "bookings@you.com", required: true },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },

    // Streaming / musician-specific platforms
    { name: "spotify", label: "Spotify (artist URL or id)", type: "text", placeholder: "https://open.spotify.com/artist/..." },
    { name: "apple_music", label: "Apple Music (URL or artist id)", type: "text", placeholder: "https://music.apple.com/artist/..." },
    { name: "audiomack", label: "Audiomack (profile url or handle)", type: "text", placeholder: "https://audiomack.com/artist/..." },
    { name: "soundcloud", label: "SoundCloud (profile url or handle)", type: "text", placeholder: "https://soundcloud.com/your-handle" },
    { name: "bandcamp", label: "Bandcamp (profile url)", type: "text", placeholder: "https://yourname.bandcamp.com" },

    // Socials / short-form
    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/handle" },
    { name: "youtube", label: "YouTube (channel or URL)", type: "text", placeholder: "channel id or full URL" },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@handle or https://www.tiktok.com/@handle" },

    { name: "website", label: "Website (optional)", type: "url", placeholder: "https://your-site.com" },
    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://booking.example/yourclinic", help: "Provide a phone number to dial or a full URL to your booking page." },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="musician" fields={questions as unknown as any} />;
}