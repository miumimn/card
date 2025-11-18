"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Content Creator template — improved questions:
 * - Structured stats (3 slots) + freeform textarea fallback
 * - Social handles and approximate follower counts / avg views
 * - Featured media uploads
 * - Sponsorship/contact link and public profile URL
 *
 * The form fields are intentionally verbose to collect both handle + metrics.
 * On the preview side we read both structured fields and fallback to legacy fields.
 */

export default function Page() {
  const questions = [
    { name: "name", label: "Full name / Brand", type: "text", placeholder: "e.g. Rae Monroe", required: true },
    { name: "role", label: "Role / Niche", type: "text", placeholder: "e.g. Content Creator — Lifestyle & Travel" },
    { name: "bio", label: "Short bio", type: "textarea", placeholder: "Short intro & what you create" },

    { name: "profileImage", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },

    // Structured stats: give user 3 slots (label + value) for clear display on preview
    { name: "stats_label_1", label: "Stat 1 label (e.g. Followers)", type: "text", placeholder: "Followers" },
    { name: "stats_value_1", label: "Stat 1 value (e.g. 120k)", type: "text", placeholder: "120k" },

    { name: "stats_label_2", label: "Stat 2 label (e.g. Views / Mo)", type: "text", placeholder: "Views / Mo" },
    { name: "stats_value_2", label: "Stat 2 value (e.g. 1.2M)", type: "text", placeholder: "1.2M" },

    { name: "stats_label_3", label: "Stat 3 label (e.g. Brand kit)", type: "text", placeholder: "Brand kit available" },
    { name: "stats_value_3", label: "Stat 3 value (optional)", type: "text", placeholder: "available" },

    // Freeform fallback for services or additional stats (one per line)
    { name: "stats", label: "Additional stats (one per line) — optional", type: "textarea", placeholder: "80k Subs\n500k Monthly Impressions" },

    // socials: handle/url + optional follower counts and avg views
    { name: "instagram_handle", label: "Instagram handle or URL", type: "text", placeholder: "@yourhandle or https://instagram.com/..." },
    { name: "instagram_followers", label: "Instagram followers (approx)", type: "text", placeholder: "e.g. 120k" },

    { name: "youtube", label: "YouTube channel URL", type: "text", placeholder: "https://youtube.com/..." },
    { name: "youtube_subscribers", label: "YouTube subscribers (approx)", type: "text", placeholder: "e.g. 75k" },

    { name: "tiktok_handle", label: "TikTok handle or URL", type: "text", placeholder: "@yourhandle or https://tiktok.com/..." },
    { name: "tiktok_followers", label: "TikTok followers (approx)", type: "text", placeholder: "e.g. 1.2M" },

    { name: "snapchat_handle", label: "Snapchat handle or URL", type: "text", placeholder: "@yourhandle or https://snapchat.com/..." },
    { name: "snapchat_followers", label: "Snapchat followers (approx)", type: "text", placeholder: "e.g. 60k" },

    // shop / merch
    { name: "shop", label: "Shop / Merch URL", type: "text", placeholder: "https://yourshop.com" },

    // media uploads
    { name: "mediaImages", label: "Featured media (up to 6)", type: "files", maxFiles: 6, accept: "image/*" },

    // sponsorship/contact
    { name: "sponsor_link", label: "Sponsorship / contact link", type: "url", placeholder: "https://calendly.com/yourname or https://yoursite.com/contact" },
    { name: "profile_url", label: "Profile public URL (used for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="content-creator" fields={questions as unknown as any} />;
}