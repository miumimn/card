"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Defensive onboarding page for IT Specialist template.
 *
 * If you still see "The default export is not a React Component" after replacing the file,
 * it's very likely that "@/components/OnboardingForm" doesn't export a React component as the default.
 * In that case open the OnboardingForm file and either:
 * - export default OnboardingFormComponent
 *   or
 * - change this import to match the named export:
 *     import { OnboardingForm } from "@/components/OnboardingForm";
 *
 * This page also renders a helpful message when the imported value is not a component so you can diagnose quickly.
 */

export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Alex Rivera", required: true },
    { name: "title", label: "Title / Tagline", type: "text", placeholder: "IT Specialist • Cloud & DevOps" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and specialties" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Cloud architecture\nCI/CD automation\nSecurity audits" },
    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "portfolio", label: "Portfolio images (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "email", label: "Email", type: "email", placeholder: "you@domain.com" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "whatsapp", label: "WhatsApp (digits or full url)", type: "text", placeholder: "+15555555555 or https://wa.me/..." },

    { name: "linkedin", label: "LinkedIn (handle or url)", type: "text", placeholder: "@handle or https://linkedin.com/in/handle" },
    { name: "github", label: "GitHub (handle or url)", type: "text", placeholder: "@handle or https://github.com/handle" },
    { name: "website", label: "Website (optional)", type: "url", placeholder: "https://your-site.com" },

    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://booking.example/yourclinic", help: "Provide a phone number to dial or a full URL to your booking page." },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

// Cast to avoid the TypeScript widening/literal issue seen on build.
  return <OnboardingForm slug="it-specialist" fields={questions as unknown as any} submitLabel="Save & Preview" />;
}