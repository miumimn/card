"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Driver template
 * - name, role/title
 * - vehicleImage, heroImage, gallery (up to 3)
 * - services (one per line)
 * - availability (one per line)
 * - areas (one per line)
 * - email, phone, rates, booking_link
 * - contact_cards (one per line)
 * - profile_url (for QR)
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Sam Ryder", required: true },
    { name: "role", label: "Title / Service", type: "text", placeholder: "e.g. Professional Driver — Rides & Transfers" },

    { name: "vehicleImage", label: "Vehicle image (1)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image (optional)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "gallery", label: "Gallery (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Airport transfer\nHourly hire\nCourier & delivery" },
    { name: "availability", label: "Availability (one per line)", type: "textarea", placeholder: "Mon–Fri 08:00–20:00\nWeekends 09:00–18:00" },
    { name: "areas", label: "Service areas (one per line or comma)", type: "textarea", placeholder: "Downtown\nAirport\nCity outskirts" },

    { name: "email", label: "Email", type: "email", placeholder: "sam@driverservice.com" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "rates", label: "Rates (optional)", type: "text", placeholder: "From $25 / trip" },
    { name: "booking_link", label: "Booking link (optional)", type: "url", placeholder: "https://booking.example.com/your-service" },

    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Insurance info\nDriver license & certifications" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="driver" fields={questions} />;
}