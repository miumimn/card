"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Financial Advisor template
 * - name, role/title
 * - about, services (one per line)
 * - fees (text)
 * - credentials (one per line)
 * - avatar (1 - round), heroImage (1), gallery (up to 3)
 * - email, phone, whatsapp, booking_link
 * - contact_cards (one per line)
 * - profile_url (for QR / public link)
 *
 * After successful submission the onboarding flow in your app should create a record
 * in "onboardings" and you can redirect the user to /profile-preview/financial-advisor?id=<row.id>.
 * If your existing OnboardingForm component supports a redirect URL, configure it to do so.
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name / Firm name", type: "text", placeholder: "e.g. WealthWise Advisory", required: true },
    { name: "role", label: "Title / Focus", type: "text", placeholder: "CFP • Retirement & Investments" },
    { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and approach" },

    { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Retirement planning\nInvestment management\nTax strategy" },
    { name: "fees", label: "Fees / Pricing (text)", type: "text", placeholder: "Fee-based: AUM or fixed packages. Free initial consult." },
    { name: "credentials", label: "Credentials / Awards (one per line)", type: "textarea", placeholder: "CFP\nFiduciary\nTop Advisor 2025" },

    { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "heroImage", label: "Hero / banner image (optional)", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "gallery", label: "Gallery (up to 3 images)", type: "files", maxFiles: 3, accept: "image/*" },

    { name: "email", label: "Email", type: "email", placeholder: "hello@wealthwise.com" },
    { name: "phone", label: "Phone (for bookings)", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "whatsapp", label: "WhatsApp (digits or full URL)", type: "text", placeholder: "+15555555555 or https://wa.me/15555555555" },
    { name: "booking_link", label: "Booking / client portal URL (optional)", type: "url", placeholder: "https://yourfirm.com/portal" },

    { name: "contact_cards", label: "Contact cards (one per line)", type: "textarea", placeholder: "Client onboarding\nPrivacy & compliance" },

    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
  ];

  return <OnboardingForm slug="financial-advisor" fields={questions} />;
}