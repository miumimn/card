"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Eyelash Technician template (updated)
 *
 * - added address (shop location)
 * - added gift_vouchers link
 * - added refill_tips (Refill & retention content)
 * These fields populate the profile preview; if omitted, the profile preview will NOT use template defaults.
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Mila Hart", required: true },
    { name: "role", label: "Title / Speciality", type: "text", placeholder: "e.g. Eyelash Artist — Classic & Volume Sets" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio, approach, mobile or in-studio" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Classic Full Set — $80\nVolume Full Set — $140\nRefill (2–3 weeks) — $50" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image (optional)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "portfolio", label: "Portfolio images (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "phone", label: "Phone (for bookings)", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "booking_link", label: "Online booking URL (optional)", type: "url", placeholder: "https://book.example.com/your-profile" },
    { name: "gift_vouchers", label: "Gift vouchers URL (optional)", type: "url", placeholder: "https://shop.example.com/vouchers" },

    { name: "address", label: "Shop address (for map)", type: "text", placeholder: "Street, City, Country (e.g. 7 Beauty Lane, Uptown)" },

    // socials
    { name: "instagram", label: "Instagram handle or URL", type: "text", placeholder: "@yourhandle or https://instagram.com/..." },
    { name: "tiktok", label: "TikTok handle or URL", type: "text", placeholder: "@yourhandle or https://tiktok.com/..." },
    { name: "snapchat", label: "Snapchat handle or URL", type: "text", placeholder: "@yourhandle or https://snapchat.com/..." },
    { name: "facebook", label: "Facebook page or URL", type: "text", placeholder: "https://facebook.com/yourpage" },

    { name: "refill_tips", label: "Refill & retention notes (optional)", type: "textarea", placeholder: "Refill windows: 2–3 weeks recommended. Avoid oil-based products; gentle cleansing preserves adhesion." },

    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Gift vouchers\nAftercare instructions\nMobile appointments" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="eyelash-tech" fields={questions} />;
}