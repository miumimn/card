"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Handyman onboarding
 */

export default function Page() {
  const questions = [
    { name: "company", label: "Company name", type: "text", placeholder: "e.g. FixUp Co.", required: true },
    { name: "owner", label: "Owner / Contact name", type: "text", placeholder: "e.g. Sam Ryder", required: true },
    { name: "services", label: "Primary services (comma separated)", type: "text", placeholder: "Electrical, Plumbing, Carpentry" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 (555) 123-4567" },
    { name: "email", label: "Email", type: "email", placeholder: "hello@fixup.co" },
    { name: "serviceAreaMap", label: "Service area image / map", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "photos", label: "Photos (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },
  ];

  return <OnboardingForm slug="handyman" fields={questions} />;
}