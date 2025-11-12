"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Writer onboarding
 */

export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Taylor Reed", required: true },
    { name: "specialty", label: "Genre / Specialty", type: "text", placeholder: "e.g. Tech, Fiction, Journalism" },
    { name: "bio", label: "Short bio", type: "textarea", placeholder: "Quick summary of experience" },
    { name: "website", label: "Website", type: "text", placeholder: "https://your-site.com" },
    { name: "portfolio", label: "Portfolio links (comma separated)", type: "text", placeholder: "https://..." },
    { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { name: "profileImage", label: "Profile photo", type: "files", maxFiles: 1, accept: "image/*" },
  ];

  return <OnboardingForm slug="writer" fields={questions} />;
}