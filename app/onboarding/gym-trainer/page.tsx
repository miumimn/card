"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding fields for Gym Trainer template
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name / Brand", type: "text", placeholder: "e.g. Chris Taylor", required: true },
    { name: "role", label: "Title / Focus", type: "text", placeholder: "Personal Trainer • Strength & HIIT" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and approach" },

    { name: "programs", label: "Programs (one per line)", type: "textarea", placeholder: "HIIT Bootcamp\nMuscle Gain Program" },
    { name: "classes", label: "Upcoming classes (one per line)", type: "textarea", placeholder: "Mon 7am • HIIT Express\nWed 6pm • Strength Circuit" },
    { name: "testimonials", label: "Testimonials (one per line)", type: "textarea", placeholder: '"Chris is great" — J.' },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },

    { name: "email", label: "Contact email", type: "email", placeholder: "you@yourdomain.com" },
    { name: "phone", label: "Phone (for calls)", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "whatsapp", label: "WhatsApp (digits or full URL)", type: "text", placeholder: "+15555555555 or https://wa.me/..." },

    { name: "booking_contact", label: "Booking contact (phone or URL)", type: "text", placeholder: "tel:+15551234567 OR https://booking.example/yourclinic", help: "Provide a phone number to dial or a full URL to your booking page." },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="gym-trainer" fields={questions as unknown as any} />;
}