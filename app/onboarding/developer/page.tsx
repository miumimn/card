"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Onboarding for Developer template
 */
export default function Page() {
  const questions = [
    { name: "name", label: "Full name", type: "text", placeholder: "e.g. Ray Charles", required: true },
    { name: "role", label: "Title / Role", type: "text", placeholder: "e.g. Full‑Stack Developer • React / Node.js" },
    { name: "bio", label: "Short bio", type: "textarea", placeholder: "One-line intro for visitors" },

    { name: "profileImage", label: "Avatar / profile image", type: "files", maxFiles: 1, accept: "image/*" },

    { name: "github", label: "GitHub profile URL", type: "text", placeholder: "https://github.com/username" },
    { name: "npm", label: "npm package / profile (optional)", type: "text", placeholder: "https://www.npmjs.com/~username" },
    { name: "website", label: "Website / blog URL", type: "text", placeholder: "https://yourblog.com" },
    { name: "twitter", label: "Twitter handle or URL", type: "text", placeholder: "@handle or https://twitter.com/..." },
    { name: "linkedin", label: "LinkedIn URL", type: "text", placeholder: "https://linkedin.com/in/..." },

    { name: "tech", label: "Tech stack (one per line)", type: "textarea", placeholder: "React\nTypeScript\nGraphQL\nDocker" },

    { name: "projects", label: "Projects (one per line 'Title | short description | image filename or URL')", type: "textarea", placeholder: "Palette — Design system | React + Storybook | palette.png" },
    { name: "projectImages", label: "Project images (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },

    // Changed from `snippets` -> `certifications`
    { name: "certifications", label: "Certifications", type: "textarea", placeholder: "List your certifications here, each per line" },

    { name: "resume", label: "Resume (PDF)", type: "files", maxFiles: 1, accept: ".pdf,application/pdf" },

    { name: "hire_link", label: "Hire / booking link (optional)", type: "url", placeholder: "https://wa.me/+233..." },
  ];

  return <OnboardingForm slug="developer" fields={questions as unknown as any} />;
}