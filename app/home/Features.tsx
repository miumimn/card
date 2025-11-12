"use client";
import React from "react";

/**
 * Features grid — interactive micro UI, client to allow potential animations later
 */

const FEATURES = [
  {
    title: "One link. Many uses",
    desc: "Share your portfolio, booking, and contact details with one custom link that looks great on mobile.",
    icon: "🔗",
  },
  {
    title: "Beautiful templates",
    desc: "Curated templates for creators, consultants, and small businesses — fully editable and responsive.",
    icon: "🎨",
  },
  {
    title: "Fast onboarding",
    desc: "Complete your page in minutes with guided onboarding and easy media upload.",
    icon: "⚡️",
  },
  {
    title: "Theming & dark mode",
    desc: "Built-in theme system with light/dark modes and CSS variables for advanced customization.",
    icon: "🌗",
  },
];

export default function Features() {
  return (
    <section className="nx-container nx-section">
      <h2 className="nx-h2">What you get</h2>
      <div className="nx-features">
        {FEATURES.map((f) => (
          <article key={f.title} className="nx-feature-card">
            <div className="nx-feature-icon" aria-hidden>{f.icon}</div>
            <div>
              <h4 className="nx-feature-title">{f.title}</h4>
              <p className="nx-feature-desc">{f.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}