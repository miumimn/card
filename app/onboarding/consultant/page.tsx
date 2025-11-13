"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Consultant onboarding — tailored to ConsultantPreview fields
 * - name, role, bio
 * - avatar/profileImage
 * - services (one per line or comma separated)
 * - pricing (one per line "Tier | note")
 * - testimonials (one per line)
 * - contact: email, phone, schedule_url
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Jordan Blake", required: true },
    { name: "role", label: "Role / Title", type: "text", placeholder: "e.g. Strategy Consultant" },
    { name: "bio", label: "Short bio", type: "textarea", placeholder: "Short intro & credentials" },

    { name: "profileImage", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },

    { name: "services", label: "Services (one per line or comma separated)", type: "textarea", placeholder: "Product Strategy\nGo-to-market\nLeadership Coaching" },

    { name: "pricing", label: "Pricing / tiers (one per line 'Tier | note')", type: "textarea", placeholder: "Discovery | 1-2 sessions • $500\nEngage | 3 months • $5,000" },

    { name: "testimonials", label: "Testimonials (one per line)", type: "textarea", placeholder: "Client A — \"Doubled ARR in 9 months\"\nClient B — \"Transformed our product ops\"" },

    { name: "email", label: "Contact Email", type: "email", placeholder: "you@company.com" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "schedule_url", label: "Schedule / Booking URL (optional)", type: "url", placeholder: "https://calendly.com/yourname" },
  ];

  return <OnboardingForm slug="consultant" fields={questions as unknown as any} />;
}