"use client";
import React from "react";
import { useRouter } from "next/navigation";

/**
 * Onboarding index - quick selector
 */
export default function Page() {
  const router = useRouter();
  const templates = [
    "artist",
    "makeup-artist",
    "handyman",
    "doctor",
    "writer",
    "musician",
    "photographer",
  ];

  return (
    <main style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Onboarding — choose a template</h1>
      <p style={{ color: "#6b7280" }}>Pick which template you'd like to customize and we'll walk you through a short form.</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {templates.map((t) => (
          <button
            key={t}
            onClick={() => router.push(`/onboarding/${t}`)}
            style={{
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.06)",
              background: "#fff",
              fontWeight: 800,
            }}
          >
            {t.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ")}
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              Quick setup to personalize your chosen template.
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}