"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for the 'Normal' business card template.
 * - Removed heroImage (no cover photo upload)
 * - Added follow_link so the Follow button opens the chosen social/profile.
 */
export default function Page() {
  const fields = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Alex Rivers", required: true },
    { name: "title", label: "Title / Role", type: "text", placeholder: "Landscape Photographer" },
    { name: "about", label: "About (one line)", type: "textarea", placeholder: "Short professional summary" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "photos", label: "Photos (up to 4)", type: "files", maxFiles: 4, accept: "image/*" },

    { name: "email", label: "Email (for contact & vCard)", type: "email", placeholder: "you@company.com", required: true },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },

    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/handle" },
    { name: "twitter", label: "Twitter (handle or URL)", type: "text", placeholder: "@handle or https://twitter.com/handle" },
    { name: "facebook", label: "Facebook (profile or page URL)", type: "text", placeholder: "https://facebook.com/yourpage" },
    { name: "linkedin", label: "LinkedIn (handle or URL)", type: "text", placeholder: "https://linkedin.com/in/handle" },
    { name: "website", label: "Website", type: "url", placeholder: "https://your-site.com" },

    { name: "follow_link", label: "Follow link (URL or handle)", type: "text", placeholder: "Preferred link to open when Follow tapped (e.g. Instagram URL or profile URL)" },

    { name: "other_links", label: "Other links (one per line - shown in Contact tab)", type: "textarea", placeholder: "https://portfolio.example.com\nhttps://press.example.com/article" },

    { name: "profile_url", label: "Public profile URL (for QR and vCard)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="normal" fields={fields} />;
}