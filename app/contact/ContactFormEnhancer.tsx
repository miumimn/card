"use client";
import { useEffect } from "react";

/**
 * ContactFormEnhancer (robust)
 * - Attaches validation and submit handler to server-rendered #contactForm
 * - Safely unhides the form and ancestors when necessary:
 *   * Removes hidden/aria-hidden attributes
 *   * If computedStyle indicates the element is hidden (display:none / visibility:hidden / opacity:0)
 *     we attempt safe fixes: remove inline hiding styles first; if still hidden, as a last resort
 *     we set an inline style with !important to make it visible (recording prior inline values for cleanup).
 * - Shows the polished success overlay on submit
 * - Returns null (no React DOM) to avoid hydration issues
 *
 * This version preserves the "works" behavior you had (shows the form) while being conservative:
 * we only force-show elements that are actually computed-hidden and we restore modified inline
 * values on cleanup.
 */

export default function ContactFormEnhancer() {
  useEffect(() => {
    console.log("ContactFormEnhancer: mounted (robust)");

    const form = document.getElementById("contactForm") as HTMLFormElement | null;
    const formMessage = document.getElementById("formMessage") as HTMLElement | null;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;

    if (!form) {
      console.warn("ContactFormEnhancer: #contactForm not found in DOM");
      return;
    }

    // Assert non-null for all subsequent usage to satisfy TypeScript strict checks.
    const formEl = form as HTMLFormElement;

    // Track elements we modified and their previous inline styles so we can restore on cleanup
    const modified = new Map<HTMLElement, { display?: string | null; visibility?: string | null; opacity?: string | null }>();

    // Helper to record previous inline and apply new inline with optional important
    function setInlineSafe(el: HTMLElement, prop: "display" | "visibility" | "opacity", value: string, important = false) {
      if (!modified.has(el)) {
        modified.set(el, {
          display: el.style.getPropertyValue("display") || null,
          visibility: el.style.getPropertyValue("visibility") || null,
          opacity: el.style.getPropertyValue("opacity") || null,
        });
      }
      if (important) {
        (el.style as CSSStyleDeclaration).setProperty(prop, value, "important");
      } else {
        el.style.setProperty(prop, value);
      }
    }

    // Walk ancestors and try to unhide only when computed style says hidden
    try {
      let el: HTMLElement | null = formEl;
      while (el) {
        // Remove explicit hiding attributes if present
        if (el.hasAttribute && el.hasAttribute("hidden")) {
          el.removeAttribute("hidden");
          console.log("ContactFormEnhancer: removed hidden attribute from", el.tagName);
        }
        if (el.hasAttribute && el.hasAttribute("aria-hidden")) {
          el.removeAttribute("aria-hidden");
          console.log("ContactFormEnhancer: removed aria-hidden from", el.tagName);
        }

        // Check computed style
        const comp = window.getComputedStyle(el);
        // If element is completely hidden by CSS, attempt gentle repairs
        if (comp.display === "none" || comp.visibility === "hidden" || comp.opacity === "0") {
          // First try removing explicit inline styles that could hide it
          const inlineDisplay = el.style.getPropertyValue("display");
          const inlineVisibility = el.style.getPropertyValue("visibility");
          const inlineOpacity = el.style.getPropertyValue("opacity");

          let triedRestore = false;
          if (inlineDisplay) {
            // remove inline display and see if computed changes
            modified.set(el, {
              display: inlineDisplay || null,
              visibility: inlineVisibility || null,
              opacity: inlineOpacity || null,
            });
            el.style.removeProperty("display");
            triedRestore = true;
          }
          if (inlineVisibility) {
            if (!modified.has(el)) modified.set(el, { display: inlineDisplay || null, visibility: inlineVisibility || null, opacity: inlineOpacity || null });
            el.style.removeProperty("visibility");
            triedRestore = true;
          }
          if (inlineOpacity) {
            if (!modified.has(el)) modified.set(el, { display: inlineDisplay || null, visibility: inlineVisibility || null, opacity: inlineOpacity || null });
            el.style.removeProperty("opacity");
            triedRestore = true;
          }

          // Recompute — if still hidden, set inline visible as last resort with !important
          const compAfter = window.getComputedStyle(el);
          if (compAfter.display === "none" || compAfter.visibility === "hidden" || compAfter.opacity === "0") {
            console.log("ContactFormEnhancer: computed style still hides element — applying inline visible fallback for", el.tagName);
            // record previous inline if not already recorded
            if (!modified.has(el)) {
              modified.set(el, {
                display: el.style.getPropertyValue("display") || null,
                visibility: el.style.getPropertyValue("visibility") || null,
                opacity: el.style.getPropertyValue("opacity") || null,
              });
            }
            // apply fallbacks
            setInlineSafe(el, "display", "block", true);
            setInlineSafe(el, "visibility", "visible", true);
            setInlineSafe(el, "opacity", "1", true);
          } else if (triedRestore) {
            console.log("ContactFormEnhancer: removed inline hiding properties from", el.tagName, "and it is now visible");
          }
        }

        el = el.parentElement;
      }
    } catch (err) {
      console.warn("ContactFormEnhancer: error while attempting unhide", err);
    }

    // Ensure the panel can host overlay, set position only if necessary and record it
    const panel = formEl.closest(".form-panel") as HTMLElement | null || formEl.parentElement;
    let setPosition = false;
    let previousPosition = "";
    if (panel) {
      previousPosition = panel.style.position || "";
      if (!previousPosition || previousPosition === "static") {
        panel.style.position = "relative";
        setPosition = true;
      }
    }

    // Helpers for validation/errors
    function isNonEmpty(v: any) { return v && String(v).trim() !== ""; }
    function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim()); }

    function clearFieldError(field: HTMLElement | null) {
      if (!field) return;
      const next = field.nextElementSibling;
      if (next && (next as HTMLElement).classList && (next as HTMLElement).classList.contains("field-error")) next.remove();
      field.classList.remove("field-invalid");
    }
    function showFieldError(field: HTMLElement | null, text: string) {
      if (!field) return;
      clearFieldError(field);
      const e = document.createElement("div");
      e.className = "field-error";
      e.textContent = text;
      field.classList.add("field-invalid");
      field.insertAdjacentElement("afterend", e);
    }

    // attach input/change listeners for cleanup
    const inputs = Array.from(formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select"));
    inputs.forEach(el => {
      const onInput = () => clearFieldError(el);
      const onChange = () => clearFieldError(el);
      el.addEventListener("input", onInput);
      el.addEventListener("change", onChange);
      (el as any).__cfe_onInput = onInput;
      (el as any).__cfe_onChange = onChange;
    });

    // success overlay builder (keeps accessible semantics)
    function showSuccessOverlay() {
      if (!panel) return;

      // use asserted formEl
      formEl.setAttribute("aria-hidden", "true");
      formEl.style.pointerEvents = "none";
      formEl.style.filter = "blur(2px) saturate(.95)";
      formEl.style.opacity = "0.7";

      const overlay = document.createElement("div");
      overlay.className = "success-overlay";
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");

      overlay.innerHTML = `
        <div class="success-card" tabindex="-1">
          <svg class="checkmark" viewBox="0 0 52 52" aria-hidden="true">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14 27l7 7 17-17"/>
          </svg>
          <h3 class="success-title">Message sent</h3>
          <p class="success-sub">Thanks — your message has been received. We’ll reply within one business day.</p>
          <div class="success-cta">
            <button class="btn success-close">Close</button>
            <a href="/editor" class="btn btn-primary success-action">Design a card</a>
          </div>
        </div>
      `;

      panel.appendChild(overlay);

      // confetti
      const colors = ["#06b6d4", "#7c3aed", "#ffd166", "#34d399", "#fb7185"];
      const confettiRoot = document.createElement("div");
      confettiRoot.className = "confetti-root";
      panel.appendChild(confettiRoot);
      for (let i = 0; i < 20; i++) {
        const c = document.createElement("span");
        c.className = "confetti-piece";
        c.style.background = colors[i % colors.length];
        c.style.left = `${30 + Math.random() * 40}%`;
        c.style.animationDelay = `${Math.random() * 700}ms`;
        confettiRoot.appendChild(c);
      }
      setTimeout(() => confettiRoot.remove(), 2200);

      const card = overlay.querySelector<HTMLElement>(".success-card");
      if (card) card.focus();

      function cleanupOverlay() {
        try { overlay.remove(); } catch {}
        try { confettiRoot.remove(); } catch {}
        formEl.removeAttribute("aria-hidden");
        formEl.style.pointerEvents = "";
        formEl.style.filter = "";
        formEl.style.opacity = "";
      }

      overlay.addEventListener("click", (e) => {
        const t = e.target as HTMLElement;
        if (t.classList.contains("success-close")) cleanupOverlay();
      });

      const t = window.setTimeout(() => { cleanupOverlay(); clearTimeout(t); }, 8000);
    }

    // submit handler
    async function handleSubmit(ev: Event) {
      ev.preventDefault();
      if (formMessage) { formMessage.textContent = ""; formMessage.style.color = ""; formMessage.classList.remove("success"); }

      const name = formEl.elements.namedItem("name") as HTMLInputElement | null;
      const email = formEl.elements.namedItem("email") as HTMLInputElement | null;
      const subject = formEl.elements.namedItem("subject") as HTMLInputElement | null;
      const topic = formEl.elements.namedItem("topic") as HTMLSelectElement | null;
      const message = formEl.elements.namedItem("message") as HTMLTextAreaElement | null;

      let firstInvalid: HTMLElement | null = null;
      if (!isNonEmpty(name?.value)) { showFieldError(name, "Full name is required"); firstInvalid = firstInvalid || name; }
      if (!isNonEmpty(email?.value) || !isValidEmail(email!.value)) { showFieldError(email, "Valid email is required"); firstInvalid = firstInvalid || email; }
      if (!isNonEmpty(subject?.value)) { showFieldError(subject, "Subject is required"); firstInvalid = firstInvalid || subject; }
      if (!isNonEmpty(topic?.value)) { showFieldError(topic, "Please select a topic"); firstInvalid = firstInvalid || topic; }

      if (firstInvalid) {
        (firstInvalid as HTMLElement).focus();
        (firstInvalid as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        if (formMessage) { formMessage.textContent = "Please fill the highlighted fields."; formMessage.style.color = "#ef4444"; }
        return;
      }

      try {
        const payload = {
          name: name?.value || "",
          email: email?.value || "",
          subject: subject?.value || "",
          topic: topic?.value || "",
          message: message?.value || "",
        };

        inputs.forEach(i => i.setAttribute("disabled", "true"));
        const submitBtn = formEl.querySelector<HTMLButtonElement>("button[type=submit]");
        if (submitBtn) { submitBtn.setAttribute("aria-busy", "true"); submitBtn.classList.add("loading"); }

        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({ ok: res.ok, status: res.status }));

        if (!res.ok) {
          console.error("Contact API error:", data);
          if (formMessage) { formMessage.textContent = "Server error while sending message. Please try again later."; formMessage.style.color = "#ef4444"; }
        } else {
          showSuccessOverlay();
          formEl.reset();
        }
      } catch (err) {
        console.error("Contact submit error:", err);
        if (formMessage) { formMessage.textContent = "⚠️ Network error please try again."; formMessage.style.color = "#ef4444"; }
      } finally {
        inputs.forEach(i => i.removeAttribute("disabled"));
        const submitBtn = formEl.querySelector<HTMLButtonElement>("button[type=submit]");
        if (submitBtn) { submitBtn.removeAttribute("aria-busy"); submitBtn.classList.remove("loading"); }
      }
    }

    formEl.addEventListener("submit", handleSubmit);

    function handleResetClick() {
      formEl.reset();
      inputs.forEach(i => clearFieldError(i));
      if (formMessage) { formMessage.textContent = ""; formMessage.style.color = ""; formMessage.classList.remove("success"); }
    }
    if (resetBtn) resetBtn.addEventListener("click", handleResetClick);

    console.log("ContactFormEnhancer: handlers attached (robust)");

    // cleanup: restore any inline styles we modified and event listeners
    return () => {
      formEl.removeEventListener("submit", handleSubmit);
      if (resetBtn) resetBtn.removeEventListener("click", handleResetClick);
      inputs.forEach(el => {
        const onInput = (el as any).__cfe_onInput;
        const onChange = (el as any).__cfe_onChange;
        if (onInput) el.removeEventListener("input", onInput);
        if (onChange) el.removeEventListener("change", onChange);
        delete (el as any).__cfe_onInput;
        delete (el as any).__cfe_onChange;
      });

      // restore modified inline styles
      modified.forEach((prev, el) => {
        if (prev.display === null) el.style.removeProperty("display");
        else if (prev.display !== undefined) el.style.setProperty("display", prev.display);
        if (prev.visibility === null) el.style.removeProperty("visibility");
        else if (prev.visibility !== undefined) el.style.setProperty("visibility", prev.visibility);
        if (prev.opacity === null) el.style.removeProperty("opacity");
        else if (prev.opacity !== undefined) el.style.setProperty("opacity", prev.opacity);
      });

      // undo panel position override if we set it
      if (panel && setPosition) {
        panel.style.position = previousPosition || "";
      }

      console.log("ContactFormEnhancer: cleanup complete");
    };
  }, []);

  return null;
}