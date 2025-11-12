"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Optician template
 *
 * NOTE: booking_contact accepts either a phone number (e.g. "+15551234567" or "tel:+15551234567")
 * or a URL (https://booking.example/clinic). The preview will dial when a phone-like value is provided,
 * otherwise it will open the URL in a new tab.
 */
export default function Page() {
  const fields = [
    { name: "name", label: "Clinic / Business name", type: "text", placeholder: "e.g. ClearSight Optics", required: true },
    { name: "clinic", label: "Location / Clinic", type: "text", placeholder: "Downtown Clinic" },
    { name: "about", label: "Short description", type: "textarea", placeholder: "Eye exams, designer frames and custom lenses..." },

    { name: "avatar", label: "Logo / shop image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "photos", label: "Share some photos (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "frames", label: "Featured frames (one per line)", type: "textarea", placeholder: "Acetate Round — $180\nMetal Aviator — $220" },
    { name: "lenses", label: "Lenses (one per line)", type: "textarea", placeholder: "Progressive\nBlue-light\nPhotochromic" },
    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Comprehensive eye exam\nContact lens fitting" },

    { name: "email", label: "Contact email", type: "email", placeholder: "bookings@clinic.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 234 567 890" },

    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/handle" },
    { name: "facebook", label: "Facebook (page url)", type: "text", placeholder: "https://facebook.com/yourpage" },
    { name: "website", label: "Website", type: "url", placeholder: "https://your-site.com" },

    // New booking_contact field (phone or URL)
    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://booking.example/yourclinic", help: "Provide a phone number to dial or a full URL to your booking page." },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="optician" fields={fields} />;
}