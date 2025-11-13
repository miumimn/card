"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Job Seeker template
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Jordan Blake", required: true },
    { name: "role", label: "Title / Role", type: "text", placeholder: "Product Designer — UX / UI • Remote" },
    { name: "about", label: "Short bio / summary", type: "textarea", placeholder: "Your one‑line professional summary" },

    { name: "experience", label: "Experience (one per line)", type: "textarea", placeholder: "Senior Product Designer — Nova Labs | 2021 — Present\nProduct Designer — PixelWave | 2017 — 2021" },
    { name: "projects", label: "Projects (JSON array or one per line 'Title | Description')", type: "textarea", placeholder: "Onboardly — Mobile Onboarding | Design & prototype\nShopflow — Checkout UX | Reduced abandonments" },
    { name: "skills", label: "Skills (one per line)", type: "textarea", placeholder: "Figma\nUX Research\nDesign Systems" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "portfolio", label: "Project images (optional, up to 9)", type: "files", maxFiles: 9, accept: "image/*" },

    { name: "email", label: "Contact email", type: "email", placeholder: "you@example.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 234 567 890" },
    { name: "linkedin", label: "LinkedIn (handle or url)", type: "text", placeholder: "@handle or https://linkedin.com/in/handle" },
    { name: "github", label: "GitHub (handle or url)", type: "text", placeholder: "@handle or https://github.com/handle" },

    { name: "cv", label: "CV / Resume (PDF)", type: "files", maxFiles: 1, accept: "application/pdf" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="jobseeker" fields={questions as unknown as any} />;
}