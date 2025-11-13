"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Hairdresser template
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name / Salon name", type: "text", placeholder: "e.g. Ezra Miller / ABC Salon", required: true },
    { name: "title", label: "Title / Role", type: "text", placeholder: "Creative Director & Senior Stylist — ABC Salon" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and specialties" },

    { name: "services", label: "Services & prices (one per line)", type: "textarea", placeholder: "Cut & Finish — from $55\nFull Colour — from $95\nBridal Package — custom pricing" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "gallery", label: "Gallery images (up to 12)", type: "files", maxFiles: 12, accept: "image/*" },

    { name: "location", label: "Location / Address", type: "text", placeholder: "ABC Salon — 42 Stylists Row, City Center" },
    { name: "email", label: "Contact email", type: "email", placeholder: "you@salon.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 234 567 890" },
    { name: "whatsapp", label: "WhatsApp (digits or full URL)", type: "text", placeholder: "+15555555555 or https://wa.me/..." },

    // New social fields
    { name: "instagram", label: "Instagram (handle or full URL)", type: "text", placeholder: "@yourhandle or https://instagram.com/yourhandle" },
    { name: "snapchat", label: "Snapchat (handle or full URL)", type: "text", placeholder: "@yourhandle or https://www.snapchat.com/add/yourhandle" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="hairdresser" fields={questions as unknown as any} />;
}