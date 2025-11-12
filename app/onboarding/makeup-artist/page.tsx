"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

export default function Page() {
  const fields = [
    { name: "name", label: "Business / Your name", type: "text", placeholder: "e.g. Marigold Beauty", required: true },
    { name: "title", label: "Title / Focus", type: "text", placeholder: "Bridal & Editorial Makeup Artist" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and specialties" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Bridal Makeup\nEditorial Makeup\nMakeup Lessons" },
    { name: "reviews", label: "Reviews / Testimonials (one per line)", type: "textarea", placeholder: "“Gorgeous, long‑lasting finish — 10/10” — S." },

    { name: "portfolio", label: "Portfolio images (up to 12)", type: "files", maxFiles: 12, accept: "image/*" },
    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },

    { name: "email", label: "Contact email", type: "email", placeholder: "you@yourdomain.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/handle" },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@handle or https://www.tiktok.com/@handle" },
    { name: "whatsapp", label: "WhatsApp (digits or URL)", type: "text", placeholder: "+15555555555 or https://wa.me/..." },

    { name: "booking_link", label: "Booking / scheduling URL", type: "url", placeholder: "https://calendar.example.com/yourname" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="makeup-artist" fields={fields} />;
}