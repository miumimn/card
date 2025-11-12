"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Artist onboarding
 * - Basic profile fields
 * - Portfolio uploads
 * - Structured shop items: shop1..shop6_title, shop1..shop6_price, shop1..shop6_image
 * - Expanded socials: instagram, behance, website, facebook, twitter, tiktok, linkedin, pinterest, youtube
 */
export default function Page() {
  const shopFields: any[] = [];
  const MAX_SHOP = 3;
  for (let i = 1; i <= MAX_SHOP; i++) {
    shopFields.push(
      { name: `shop${i}_title`, label: `Product ${i} — Title`, type: "text", placeholder: "Print / Original title" },
      { name: `shop${i}_price`, label: `Product ${i} — Price`, type: "text", placeholder: "e.g. $250" },
      { name: `shop${i}_image`, label: `Product ${i} — Image`, type: "files", maxFiles: 1, accept: "image/*" }
    );
  }

  const fields = [
    { name: "name", label: "Artist name", type: "text", placeholder: "e.g. Maya K.", required: true },
    { name: "tagline", label: "Role / Short tagline", type: "text", placeholder: "Visual Artist — Mixed Media" },
    { name: "bio", label: "Bio / About", type: "textarea", placeholder: "Short bio, artist statement or CV" },

    // images
    { name: "profileImage", label: "Profile image (avatar)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "portfolioImages", label: "Portfolio / works (images)", type: "files", maxFiles: 2, accept: "image/*" },

    // exhibitions / shop freeform (optional)
    { name: "exhibitions", label: "Exhibitions (one per line)", type: "textarea", placeholder: "2023 — Solo Show — The Gallery" },

    // structured shop items
    ...shopFields,

    // socials (expanded)
    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/..." },
    { name: "behance", label: "Behance (URL)", type: "text", placeholder: "https://behance.net/..." },
    { name: "website", label: "Website (URL)", type: "url", placeholder: "https://yourwebsite.com" },
    { name: "facebook", label: "Facebook (URL or handle)", type: "text", placeholder: "https://facebook.com/yourpage or yourpage" },
    { name: "twitter", label: "Twitter (handle or URL)", type: "text", placeholder: "@handle or https://twitter.com/..." },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@handle or https://www.tiktok.com/..." },
    { name: "linkedin", label: "LinkedIn (URL)", type: "text", placeholder: "https://linkedin.com/in/..." },
    { name: "pinterest", label: "Pinterest (URL)", type: "text", placeholder: "https://pinterest.com/..." },
    { name: "youtube", label: "YouTube (channel or URL)", type: "text", placeholder: "https://youtube.com/..." },

    // contact / other
    { name: "email", label: "Contact email", type: "email", placeholder: "you@domain.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "contact_url", label: "Contact form / booking URL", type: "url", placeholder: "https://example.com/contact" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" }
  ];

  return <OnboardingForm slug="artist" fields={fields} submitLabel="Save & Preview" />;
}