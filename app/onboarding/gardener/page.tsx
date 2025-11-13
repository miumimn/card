"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Gardener template
 * - avatar (1), heroImage (1), portfolio (up to 6)
 * - services (one per line), tips (one per line)
 * - contact fields and profile_url
 *
 * On submit, ensure uploader returns data.path or public URL and that payload uses those uploaded URLs (not original file names).
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Business / Brand name", type: "text", placeholder: "e.g. GreenThumb Landscapes", required: true },
    { name: "subtitle", label: "Short description / services", type: "text", placeholder: "Landscaping • Garden Maintenance • Design" },
    { name: "about", label: "About / Description", type: "textarea", placeholder: "Short description of services and approach" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Garden Maintenance\nLandscape Design\nIrrigation & Planting" },
    { name: "tips", label: "Seasonal tips (one per line)", type: "textarea", placeholder: "Prune in late winter\nMulch beds in autumn" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "portfolio", label: "Portfolio images (up to 6)", type: "files", maxFiles: 6, accept: "image/*" },

    { name: "email", label: "Contact email", type: "email", placeholder: "hello@yourbusiness.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "whatsapp", label: "WhatsApp (digits or full URL)", type: "text", placeholder: "+15555555555 or https://wa.me/15555555555" },

    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Rate card\nSample deliverables" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="gardener" fields={questions as unknown as any} />;
}