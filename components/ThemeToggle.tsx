"use client";
import React, { useEffect, useState } from "react";

/**
 * ThemeToggle (client)
 * - default export (so layout can import it as `import ThemeToggle from "@/components/ThemeToggle"`)
 * - toggles data-theme attribute on <html> and persists to localStorage
 * - very small and self-contained to avoid SSR problems
 */

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const storageKey = "card_theme";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        document.documentElement.setAttribute("data-theme", stored === "dark" ? "dark" : "light");
        return;
      }
    } catch (err) {
      // ignore localStorage read error
    }
    // fallback to system preference
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = prefersDark ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(storageKey, next);
    } catch (err) {
      /* ignore */
    }
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "transparent",
        color: "var(--text)",
        fontSize: 13,
      }}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 19v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.2 4.2l1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.4 18.4l1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      <span style={{ color: "var(--muted)" }}>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}