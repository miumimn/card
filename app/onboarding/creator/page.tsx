"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

export default function Page() {
  const questions = [
    { name: "name", label: "Full name / Brand", type: "text", placeholder: "e.g. Riley Monet", required: true },
    { name: "role", label: "Role / Niche", type: "text", placeholder: "e.g. Visual Creator" },
    { name: "tagline", label: "Short tagline (About)", type: "text", placeholder: "Video, photography & social-first storytelling" },
    { name: "bio", label: "About / description", type: "textarea", placeholder: "Short bio & audience info" },

    { name: "profileImage", label: "Profile image (rounded)", type: "files", maxFiles: 1, accept: "image/*" },

    // Use miniGallery as the single source for small featured media. Do not ask for a separate mediaImages field.
    { name: "miniGallery", label: "Featured media / Mini gallery (up to 3 images)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "youtube", label: "YouTube channel URL", type: "text", placeholder: "https://youtube.com/..." },
    { name: "instagram", label: "Instagram handle or URL", type: "text", placeholder: "@handle or https://instagram.com/..." },
    { name: "tiktok", label: "TikTok handle or URL", type: "text", placeholder: "@handle or https://tiktok.com/..." },
    { name: "snapchat", label: "Snapchat handle or URL", type: "text", placeholder: "@handle or https://snapchat.com/..." },
    { name: "patreon", label: "Patreon URL", type: "text" },

    // Hire / collaboration contact
    { name: "hire_link", label: "Hire / collaboration link (email, calendly or contact page)", type: "text", placeholder: "mailto:you@domain.com or https://calendly.com/you" },

    // sponsor kit: allow file upload (pdf) OR a URL
    { name: "sponsor_kit", label: "Sponsor kit (PDF file)", type: "files", maxFiles: 1, accept: ".pdf,application/pdf" },
    { name: "sponsor_kit_url", label: "Sponsor kit URL (optional)", type: "url", placeholder: "https://..." },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="creator" fields={questions as unknown as any} />;
}