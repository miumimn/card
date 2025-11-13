"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Doctor (simple -> advanced preview)
 *
 * Fields map to DoctorPreview props:
 * - name, role, about
 * - specialties (one per line or comma separated)
 * - services (one per line)
 * - avatar (1), heroImage (1), gallery (up to 3)
 * - email, phone, address, booking_link
 * - agent (optional)
 * - contact_cards (one per line)
 * - profile_url (for QR / public link)
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Dr. Priya Singh", required: true },
    { name: "role", label: "Title / Speciality", type: "text", placeholder: "e.g. General Practitioner • Family Medicine" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio, approach to care, specialties" },

    { name: "specialties", label: "Specialties (one per line or comma separated)", type: "textarea", placeholder: "Preventive Care\nPediatrics\nChronic Care" },
    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Checkups\nVaccinations\nTelemedicine" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image (optional)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "gallery", label: "Gallery (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "email", label: "Email", type: "email", placeholder: "dr@clinic.com" },
    { name: "phone", label: "Phone number", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "address", label: "Clinic address", type: "text", placeholder: "City, Country" },
    { name: "booking_link", label: "Booking / appointment link (optional)", type: "url", placeholder: "https://calendly.com/you or clinic booking URL" },

    { name: "agent", label: "Agent / Agency (optional)", type: "text", placeholder: "e.g. Lumen Talent" },
    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Patient Forms\nInsurance Info\nDirections" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="doctor" fields={questions as unknown as any} />;
}