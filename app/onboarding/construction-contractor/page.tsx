"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

export default function Page() {
  const questions = [
    { name: "company", label: "Company name", type: "text", placeholder: "e.g. BuildRight Contractors", required: true },
    { name: "services", label: "Services (comma separated)", type: "text", placeholder: "Renovation, Fit-out, Project Mgmt" },
    { name: "bio", label: "About your company", type: "textarea", placeholder: "Short intro & credentials" },
    { name: "portfolio", label: "Portfolio links or notes", type: "text", placeholder: "Project URLs or descriptions" },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "profileImage", label: "Logo / image", type: "files", maxFiles: 1, accept: "image/*" },
    { name: "projectPhotos", label: "Project photos (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },
  ];

  return <OnboardingForm slug="construction-contractor" fields={questions} />;
}