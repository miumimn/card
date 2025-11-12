"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Lawyer template
 */
export default function Page() {
  const fields = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Jordan Malik", required: true },
    { name: "title", label: "Title / Focus", type: "text", placeholder: "Attorney • Civil & Corporate Law" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and specialties" },

    { name: "services", label: "Practice areas (one per line)", type: "textarea", placeholder: "Civil Litigation\nContract Drafting\nCorporate Advisory" },
    { name: "testimonials", label: "Testimonials (one per line)", type: "textarea", placeholder: "Jordan's counsel was excellent — Client" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },

    { name: "email", label: "Contact email", type: "email", placeholder: "you@yourfirm.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 404 555 0101" },
    { name: "linkedin", label: "LinkedIn (handle or URL)", type: "text", placeholder: "@handle or https://linkedin.com/in/handle" },
    { name: "twitter", label: "Twitter (handle or URL)", type: "text", placeholder: "@handle or https://twitter.com/handle" },
    { name: "website", label: "Website", type: "url", placeholder: "https://yourfirm.com" },
    { name: "booking_link", label: "Booking / scheduling URL", type: "url", placeholder: "https://calendar.example.com/yourname" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="lawyer" fields={fields} />;
}