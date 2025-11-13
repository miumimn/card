"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Seller onboarding fields
 * - brand name, tagline, avatar
 * - structured product fields (listing1..listing8) with title/price/desc/image
 * - owner_name, opening_hours, address, other_links, profile_url
 */
export default function Page() {
  const productFields = [];
  const MAX = 8;
  for (let i = 1; i <= MAX; i++) {
    productFields.push(
      { name: `listing${i}_title`, label: `Product ${i} — Title`, type: "text", placeholder: "Handmade candle — Citrus" },
      { name: `listing${i}_price`, label: `Product ${i} — Price`, type: "text", placeholder: "$14" },
      { name: `listing${i}_desc`, label: `Product ${i} — Description`, type: "textarea", placeholder: "Small-batch soy candle fragranced with bergamot & orange." },
      { name: `listing${i}_image`, label: `Product ${i} — Image`, type: "files", maxFiles: 1, accept: "image/*" }
    );
  }

  const fields = [
    { name: "name", label: "Store / Brand name", type: "text", placeholder: "Corner Craft Co.", required: true },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Handmade goods & daily essentials" },
    { name: "about", label: "About", type: "textarea", placeholder: "Short store description" },
    { name: "avatar", label: "Store avatar", type: "files", maxFiles: 1, accept: "image/*" },

    // store owner & contact info (added per your request)
    { name: "owner_name", label: "Owner / Contact name", type: "text", placeholder: "e.g. Executive Cloth" },
    { name: "opening_hours", label: "Opening hours", type: "text", placeholder: "e.g. Mon–Sat • 9:00–18:00" },
    { name: "address", label: "Address", type: "text", placeholder: "e.g. 88 Market Lane, Smalltown" },

    // product fields
    ...productFields,

    { name: "other_links", label: "Other links (one per line)", type: "textarea", placeholder: "https://example.com/press" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourstore" },
  ];

  // Use `fields` (was incorrectly referencing `questions`) and cast to avoid TS widening errors.
  return <OnboardingForm slug="seller" fields={fields as unknown as any} submitLabel="Save & Preview" />;
}