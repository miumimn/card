"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

export default function Page() {
  const questions = [
    { name: "studio", label: "Studio name", type: "text", required: true },
    { name: "specialty", label: "Specialty", type: "text", placeholder: "Residential, Retail, Hospitality" },
    { name: "bio", label: "Short bio", type: "textarea" },
    { name: "services", label: "Services offered", type: "text" },
    { name: "portfolio", label: "Portfolio images (up to 3)", type: "files", maxFiles: 3, accept: "image/*" },
    { name: "profileImage", label: "Profile photo / logo", type: "files", maxFiles: 1, accept: "image/*" },
  ];

  return <OnboardingForm slug="interior-designer" fields={questions} />;
}