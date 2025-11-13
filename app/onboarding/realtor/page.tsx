"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Realtor template (updated)
 *
 * - Adds structured listing fields: listing{1..6}_title, listing{1..6}_price, listing{1..6}_subtitle, listing{1..6}_image
 * - Keeps avatar and hero_image uploads
 * - booking_contact accepts phone or URL
 *
 * If you want different fields per listing (beds/baths/area/link) tell me and I'll add them.
 */
export default function Page() {
  const listingFields = [];
  const MAX_LISTINGS = 3;
  for (let i = 1; i <= MAX_LISTINGS; i++) {
    listingFields.push(
      { name: `listing${i}_title`, label: `Listing ${i} — Title`, type: "text", placeholder: `e.g. Modern 3BR • $420,000` },
      { name: `listing${i}_price`, label: `Listing ${i} — Price`, type: "text", placeholder: "e.g. $420,000" },
      { name: `listing${i}_subtitle`, label: `Listing ${i} — Subtitle / Location`, type: "text", placeholder: "e.g. Downtown • Open plan • 2,200 sqft" },
      { name: `listing${i}_image`, label: `Listing ${i} — Image`, type: "files", maxFiles: 1, accept: "image/*" }
    );
  }

  const questions = [
    { name: "name", label: "Agent name", type: "text", placeholder: "e.g. Morgan Smith", required: true },
    { name: "role", label: "Role / Subtitle", type: "text", placeholder: "Licensed Realtor — Metro Area" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and specialties" },

    // images
    { name: "avatar", label: "Profile image (avatar)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "hero_image", label: "Hero image (featured property)", type: "files", maxFiles: 1, accept: "image/*" },

    // socials
    { name: "socials.facebook", label: "Facebook (handle or URL)", type: "text", placeholder: "yourpage or https://facebook.com/yourpage" },
    { name: "socials.whatsapp", label: "WhatsApp (phone or link)", type: "text", placeholder: "+123456789 OR https://wa.me/..." },
    { name: "socials.linkedin", label: "LinkedIn (handle or url)", type: "text", placeholder: "yourhandle or https://linkedin.com/in/yourhandle" },
    { name: "socials.instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/handle" },
    { name: "socials.twitter", label: "Twitter (handle or URL)", type: "text", placeholder: "@handle or https://twitter.com/handle" },

    // contact
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "email", label: "Contact email", type: "email", placeholder: "you@domain.com" },

    // booking/contact link
    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://calendar.example/agent", help: "Phone number will be dialed, URL will be opened." },

    // other
    { name: "other_links", label: "Other links (one per line)", type: "textarea", placeholder: "https://example.com/press\nhttps://example.com/feature" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
    // insert listing fields
    ...listingFields
  ];

  return <OnboardingForm slug="realtor" fields={questions as unknown as any} submitLabel="Save & Preview" />;
}