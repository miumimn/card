"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Chef onboarding page (grouped per-menu-item inputs)
 *
 * Each product (menu item) is requested with its own image input alongside title/price/desc/category/notes.
 * This keeps pairing between image and dish explicit (user uploads per-dish image at the same time they enter the dish).
 *
 * NOTE: location is requested as plain text (City, Region, Country) and map/embed fields were removed
 * per the preview requirement to display location as text only.
 */
export default function Page() {
  const MAX_PRODUCTS = 4;
  const productFields: any[] = [];

  for (let i = 1; i <= MAX_PRODUCTS; i++) {
    productFields.push(
      { name: `product${i}_name`, label: `Menu item ${i} — Title`, type: "text", placeholder: "e.g. Grilled Sea Bass" },
      { name: `product${i}_price`, label: `Menu item ${i} — Price`, type: "text", placeholder: "e.g. $28" },
      { name: `product${i}_desc`, label: `Menu item ${i} — Short description`, type: "textarea", placeholder: "Short description or tasting notes" },
      { name: `product${i}_image`, label: `Menu item ${i} — Image`, type: "files", maxFiles: 1, accept: "image/*" },
      { name: `product${i}_category`, label: `Menu item ${i} — Category`, type: "text", placeholder: "e.g. Starters / Mains / Dessert" },
      { name: `product${i}_notes`, label: `Menu item ${i} — Notes / Ingredients`, type: "textarea", placeholder: "Ingredients, allergies, or extra notes" },
    );
  }

  const fields = [
    // Profile
    { name: "brandName", label: "Full name / Brand", type: "text", placeholder: "Chef Antonio Ruiz", required: true },
    { name: "tagline", label: "Tagline / Role", type: "text", placeholder: "Private Chef • Seasonal Mediterranean" },
    { name: "bio", label: "About / Bio", type: "textarea", placeholder: "Short bio for your profile" },

    // Logo / profile image
    { name: "profileImage", label: "Profile photo / Logo", type: "files", maxFiles: 1, accept: "image/*" },

    // Optional gallery / lookbook (chef shots, dishes)
    { name: "collection_images", label: "Gallery — upload up to 2 images (dishes, events)", type: "files", maxFiles: 2, accept: "image/*" },

    // Structured menu (product1..product12) - grouped blocks
    ...productFields,

    // Socials (expanded)
    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@yourhandle or https://instagram.com/..." },
    { name: "facebook", label: "Facebook (URL)", type: "text", placeholder: "https://facebook.com/..." },
    { name: "twitter", label: "Twitter / X (handle or URL)", type: "text", placeholder: "@yourhandle or https://twitter.com/..." },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@yourhandle or https://www.tiktok.com/..." },
    { name: "pinterest", label: "Pinterest (URL)", type: "text", placeholder: "https://pinterest.com/..." },
    { name: "youtube", label: "YouTube (channel URL)", type: "text", placeholder: "https://youtube.com/..." },
    { name: "linkedin", label: "LinkedIn (URL)", type: "text", placeholder: "https://linkedin.com/..." },

    { name: "website", label: "Website (URL)", type: "url", placeholder: "https://yourwebsite.com" },

    // Contact + booking: booking_contact accepts either a phone number or a URL.
    { name: "email", label: "Contact email", type: "email", placeholder: "you@domain.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "booking_contact", label: "Booking (phone number or URL)", type: "text", placeholder: "e.g. +1 555 555 5555 or https://bookme.example.com" },
    // keep booking_url for backward compatibility (optional)
    { name: "booking_url", label: "Booking URL (optional)", type: "url", placeholder: "https://example.com/book" },
    { name: "booking_label", label: "Booking button label", type: "text", placeholder: "Request Booking", default: "Request Booking" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },

    // Location as plain text (asked explicitly as text only)
    { name: "location", label: "Service area / Location (City, Region, Country)", type: "text", placeholder: "e.g. Barcelona, Spain — will travel", required: true },

    // Misc / legacy
    { name: "menu_list", label: "Optional free-form menu (one per line)", type: "textarea", placeholder: "Dish — $Price | short description | category" }
  ];

  // Use the default OnboardingForm behavior. The form already saves productN_image fields alongside productN_name etc.
  return <OnboardingForm slug="chef" fields={fields} submitLabel="Save & Preview" />;
}