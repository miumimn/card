"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Content Creator template — added TikTok + Snapchat fields.
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name / Brand", type: "text", placeholder: "e.g. Rae Monroe", required: true },
    { name: "role", label: "Role / Niche", type: "text", placeholder: "e.g. Content Creator — Lifestyle & Travel" },
    { name: "bio", label: "Short bio", type: "textarea", placeholder: "Short intro & what you create" },

    { name: "profileImage", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },

    { name: "stats", label: "Stats (one per line)", type: "textarea", placeholder: "120k Followers\n1.2M Views / Mo\nBrand kit available" },

    // socials/links
    { name: "instagram", label: "Instagram handle or URL", type: "text", placeholder: "@yourhandle or https://instagram.com/..." },
    { name: "youtube", label: "YouTube channel URL", type: "text", placeholder: "https://youtube.com/..." },
    { name: "tiktok", label: "TikTok handle or URL", type: "text", placeholder: "@yourhandle or https://tiktok.com/..." },
    { name: "snapchat", label: "Snapchat handle or URL", type: "text", placeholder: "@yourhandle or https://snapchat.com/..." },
    { name: "shop", label: "Shop URL (merch/presets)", type: "text", placeholder: "https://yourshop.com" },

    { name: "mediaImages", label: "Featured media (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "sponsor_link", label: "Sponsorship / contact link", type: "url", placeholder: "https://calendly.com/yourname or https://yoursite.com/contact" },
    { name: "profile_url", label: "Profile public URL (used for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="content-creator" fields={questions as unknown as any} />;
}