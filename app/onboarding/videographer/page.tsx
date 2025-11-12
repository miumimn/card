"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Videographer
 *
 * Fields:
 * - name, tagline, about
 * - avatar (image upload)
 * - showreel_url (primary showreel url - youtube/vimeo)
 * - portfolio_videos (textarea: one URL per line)
 * - portfolio_images (files)
 * - services (textarea: one per line)
 * - contact: email, phone, booking_contact
 * - profile_url for QR
 */
export default function Page() {
  const fields = [
    { name: "name", label: "Name / Brand", type: "text", placeholder: "e.g. ReelWorks Films", required: true },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Videographer & Filmmaker — Commercials • Weddings • Docs" },
    { name: "about", label: "About", type: "textarea", placeholder: "Short bio or statement" },

    // avatar image
    { name: "avatar", label: "Profile image (avatar)", type: "files", maxFiles: 1, accept: "image/*" },

    // showreel url(s)
    { name: "showreel", label: "Primary showreel URL", type: "url", placeholder: "https://youtube.com/watch?v=..." },
    { name: "portfolio_videos", label: "Portfolio video URLs (one per line)", type: "textarea", placeholder: "https://youtube.com/watch?v=...\nhttps://vimeo.com/..." },

    // portfolio images
    { name: "portfolio_images", label: "Portfolio images (optional)", type: "files", maxFiles: 6, accept: "image/*" },

    // services
    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Commercial Films\nEvent Coverage\nDocumentaries" },

    { name: "email", label: "Contact email", type: "email", placeholder: "you@domain.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },

    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://calendar.example/..." },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="videographer" fields={fields} submitLabel="Save & Preview" />;
}