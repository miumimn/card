"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Defensive onboarding page for IT Specialist template.
 *
 * If you still see "The default export is not a React Component" after replacing the file,
 * it's very likely that "@/components/OnboardingForm" doesn't export a React component as the default.
 * In that case open the OnboardingForm file and either:
 * - export default OnboardingFormComponent
 *   or
 * - change this import to match the named export:
 *     import { OnboardingForm } from "@/components/OnboardingForm";
 *
 * This page also renders a helpful message when the imported value is not a component so you can diagnose quickly.
 */

const fields = [
  { name: "name", label: "Full name", type: "text", placeholder: "e.g. Alex Rivera", required: true },
  { name: "title", label: "Title / Tagline", type: "text", placeholder: "IT Specialist • Cloud & DevOps" },
  { name: "about", label: "About / Bio", type: "textarea", placeholder: "Short bio and specialties" },

  { name: "services", label: "Services (one per line)", type: "textarea", placeholder: "Cloud architecture\nCI/CD automation\nSecurity audits" },
  { name: "avatar", label: "Profile image (round)", type: "files", maxFiles: 1, accept: "image/*" },
  { name: "heroImage", label: "Hero / banner image", type: "files", maxFiles: 1, accept: "image/*" },
  { name: "portfolio", label: "Portfolio images (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

  { name: "email", label: "Email", type: "email", placeholder: "you@domain.com" },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+1 555 555 5555" },
  { name: "whatsapp", label: "WhatsApp (digits or full url)", type: "text", placeholder: "+15555555555 or https://wa.me/..." },

  { name: "linkedin", label: "LinkedIn (handle or url)", type: "text", placeholder: "@handle or https://linkedin.com/in/handle" },
  { name: "github", label: "GitHub (handle or url)", type: "text", placeholder: "@handle or https://github.com/handle" },
  { name: "website", label: "Website (optional)", type: "url", placeholder: "https://your-site.com" },

  { name: "booking_link", label: "Booking / client portal (optional)", type: "url", placeholder: "https://..." },
  { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },
];

export default function Page() {
  // Defensive: verify imported OnboardingForm is callable/renderable
  const FormComponent: any = OnboardingForm;

  if (!FormComponent || (typeof FormComponent !== "function" && typeof FormComponent !== "object")) {
    // Show an actionable error in the browser to help debug quickly
    return (
      <div style={{ padding: 20, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial", color: "#111" }}>
        <h2 style={{ marginTop: 0 }}>Onboarding page error</h2>
        <p>
          The page attempted to render the onboarding form, but the imported module
          {" "}<code>@/components/OnboardingForm</code>{" "}does not appear to export a React component as the default export.
        </p>
        <p>Quick checks:</p>
        <ul>
          <li>Open <code>components/OnboardingForm</code> and confirm it has a React component exported as default: <code>export default OnboardingForm</code>.</li>
          <li>If it exports a named component, change this file's import to:<br/><code>import { OnboardingForm } from "@/components/OnboardingForm"</code></li>
          <li>Restart the dev server after making changes to ensure Next.js picks up the update.</li>
        </ul>
        <p style={{ color: "red" }}>If you want I can open and patch your OnboardingForm file to export a default component.</p>
      </div>
    );
  }

  // Render the onboarding form (component is expected to accept slug and fields props)
  return <FormComponent slug="it-specialist" fields={fields} />;
}