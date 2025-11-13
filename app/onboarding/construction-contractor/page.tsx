"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Construction contractor onboarding
 *
 * Minimal onboarding page that builds an array of questions/fields and passes them to OnboardingForm.
 * TypeScript can widen literal types when arrays are built dynamically which causes strict type errors
 * at build-time. We cast the questions array when passing to OnboardingForm so the build succeeds
 * without changing runtime behaviour. If you prefer a stricter, fully-typed solution I can update
 * the fields to exactly match the Field type exported by the OnboardingForm component.
 */

export default function Page() {
  const questions = [
    { name: "companyName", label: "Company name", type: "text", placeholder: "Acme Construction", required: true },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Renovations • Extensions • Repairs" },
    { name: "bio", label: "About / Bio", type: "textarea", placeholder: "Short company overview, services and coverage" },

    { name: "logo", label: "Logo", type: "files", maxFiles: 1, accept: "image/*" },

    // services
    { name: "service_list", label: "Services (one per line)", type: "textarea", placeholder: "Kitchen refit\nBathroom remodel\nRoofing" },

    // contact / socials
    { name: "email", label: "Contact email", type: "email", placeholder: "you@company.com" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "website", label: "Website", type: "url", placeholder: "https://yourcompany.com" },

    // optional gallery
    { name: "gallery", label: "Portfolio images (up to 6)", type: "files", maxFiles: 6, accept: "image/*" },
  ];

  // Cast to avoid the TypeScript error caused by widened literal types in dynamically constructed arrays.
  // This is a minimal local fix; if you prefer I can strictly type `questions` to Field[] instead.
  return <OnboardingForm slug="construction-contractor" fields={questions as unknown as any} />;
}