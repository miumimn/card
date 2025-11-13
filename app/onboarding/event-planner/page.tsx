"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Event Planner onboarding
 * - fields for avatar, heroImage, gallery (uploads)
 * - packages/checklist (textareas), contact fields
 *
 * OnboardingForm (already in your codebase) uploads files and stores
 * canonical public URLs via getPublicUrl — so the DB will contain the real
 * public URLs (the preview will prefer those).
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Name / Brand", type: "text", placeholder: "e.g. Luxe Events Co.", required: true },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Weddings • Corporate Events • Private Parties" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short description of your services" },

    // images
    { name: "avatar", label: "Profile image (avatar)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero image (featured)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "gallery", label: "Gallery images (multiple)", type: "files", maxFiles: 12, accept: "image/*" },

    // service data
    { name: "packages", label: "Packages (one per line)", type: "textarea", placeholder: "Silver Package — details\nGold Package — details" },
    { name: "checklist", label: "Checklist items (one per line)", type: "textarea", placeholder: "Confirm venue\nConfirm AV\nFinalize menu" },

    // contact
    { name: "email", label: "Email", type: "email", placeholder: "you@domain.com" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "whatsapp", label: "WhatsApp (phone or link)", type: "text", placeholder: "+123456789 OR https://wa.me/..." },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@handle or https://www.tiktok.com/@handle" },

    { name: "booking_link", label: "Booking link (URL)", type: "url", placeholder: "https://calendar.example/yourpage" },
    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Zoom link / PDF / vCard URL" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="event-planner" fields={questions as unknown as any} submitLabel="Save & Preview" />;
}