"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Photographer template
 * - added socials (instagram, tiktok, website)
 * - added booking_contact (phone or URL)
 * - other_links shown in contact tab
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Your name / business", type: "text", placeholder: "e.g. Ivy Park Photography", required: true },
    { name: "tagline", label: "Short tagline", type: "text", placeholder: "Portraits • Weddings • Editorial" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short description about your style and services" },
    { name: "specialties", label: "Specialties (one per line)", type: "textarea", placeholder: "Weddings\nPortraits\nEditorial" },

    { name: "avatar", label: "Profile image / logo", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "gallery", label: "Gallery images (up to 4)", type: "files", maxFiles: 4, accept: "image/*" },

    { name: "email", label: "Contact email", type: "email", placeholder: "you@yourdomain.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },

    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@handle or https://instagram.com/handle" },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@handle or https://www.tiktok.com/@handle" },
    { name: "website", label: "Website", type: "url", placeholder: "https://your-site.com" },

    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://calendar.example/yourname", help: "Provide a phone number to dial or a full URL to your booking page." },

    { name: "other_links", label: "Other links (one per line - shown in Contact tab)", type: "textarea", placeholder: "https://editorial.example/article\nhttps://portfolio.example" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  // Cast fields to avoid TS widening errors during build (keeps runtime the same)
  return <OnboardingForm slug="photographer" fields={questions as unknown as any} />;
}