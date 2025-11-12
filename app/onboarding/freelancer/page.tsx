"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Freelancer template
 *
 * - avatar (1 file)
 * - heroImage (1 file)
 * - portfolio (up to 6 files) — these should be uploaded and the uploader should save the returned public URL/path into the payload
 * - services: one per line
 * - contact fields: email, phone, whatsapp, booking_link, profile_url
 * - contact_cards optional
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Alex Coleman", required: true },
    { name: "title", label: "Title / Role", type: "text", placeholder: "Independent Consultant & Designer" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short description of services and approach" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "UX Sprints\nProduct Design\nBranding" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "portfolio", label: "Portfolio images (up to 6)", type: "files", maxFiles: 6, accept: "image/*" },

    { name: "email", label: "Email", type: "email", placeholder: "you@yourdomain.com" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "whatsapp", label: "WhatsApp (digits or full url)", type: "text", placeholder: "+15555555555 or https://wa.me/15555555555" },
    { name: "booking_link", label: "Booking / contact url (optional)", type: "url", placeholder: "https://example.com/book" },

    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Rate card\nSample deliverables" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="freelancer" fields={questions} />;
}