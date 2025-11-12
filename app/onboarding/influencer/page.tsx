"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Influencer onboarding page — mobile-first, friendly fields for creators/influencers.
 * - Uses the shared OnboardingForm which will auto-chunk fields into mobile-friendly steps.
 * - Fields mark optional socials as not required (users can skip).
 */

export default function Page() {
  const fields = [
    // Profile
    { name: "fullName", label: "Full name", type: "text", placeholder: "e.g. Sierra Lane", required: true },
    { name: "stageName", label: "Display name / Brand", type: "text", placeholder: "e.g. Sierra Lane" },
    { name: "tagline", label: "Short tagline", type: "text", placeholder: "Fashion • Travel • Wellness" },

    // Bio & contact
    { name: "bio", label: "Short bio", type: "textarea", placeholder: "A short intro about you and what you create" },
    { name: "email", label: "Contact email", type: "email", placeholder: "you@yourdomain.com", required: true },
    { name: "managerPhone", label: "Manager / booking phone (optional)", type: "tel", placeholder: "+1 (555) 123-4567" },

    // Socials (optional)
    { name: "instagram", label: "Instagram handle (optional)", type: "text", placeholder: "@yourhandle" },
    { name: "tiktok", label: "TikTok handle (optional)", type: "text", placeholder: "@yourhandle" },
    { name: "youtube", label: "YouTube / Showreel URL (optional)", type: "url", placeholder: "https://youtube.com/..." },
    { name: "website", label: "Website (optional)", type: "url", placeholder: "https://your-site.com" },

    // Media & assets
    { name: "profileImage", label: "Profile photo", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "galleryImages", label: "Gallery / feed images (up to 6)", type: "files", maxFiles: 6, accept: "image/*" },
    { name: "mediaKit", label: "Media kit (PDF, optional)", type: "files", maxFiles: 1, accept: "application/pdf" },

    // Work / offerings
    { name: "services", label: "Services & offerings (comma separated)", type: "text", placeholder: "Brand campaigns, Sponsored posts, Workshops" },
    { name: "rates", label: "Rates / starting fees (optional)", type: "text", placeholder: "DM for rates or starting price" },

    // Verify & final note
    { name: "notes", label: "Anything else you want to add (optional)", type: "textarea", placeholder: "Special requests, availability, or important notes" },
  ];

  return <OnboardingForm slug="influencer" fields={fields} submitLabel="Save & Preview" />;
}