"use client";
import { useEffect } from "react";

/**
 * PrivacyClient
 * - Accordion open/close behaviour and smooth scrolling
 * - Scrollspy: highlights currently-visible TOC link
 * - Mobile TOC hamburger toggle: opens/closes the TOC on small screens
 */

export default function PrivacyClient() {
  useEffect(() => {
    // Accordion toggles
    const heads = Array.from<HTMLElement>(document.querySelectorAll(".accordion-head"));
    heads.forEach((head) => {
      const onClick = () => {
        const targetId = head.getAttribute("data-target");
        const body = targetId ? document.getElementById(targetId) : (head.nextElementSibling as HTMLElement | null);
        if (!body) return;
        const expanded = body.classList.toggle("show");
        head.setAttribute("aria-expanded", expanded ? "true" : "false");
        if (expanded) body.setAttribute("aria-hidden", "false");
        else body.setAttribute("aria-hidden", "true");
      };
      head.addEventListener("click", onClick);
      head.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      });
      (head as any).__privacy_onClick = onClick;
    });

    // smooth in-page anchor nav
    const tocLinks = Array.from<HTMLAnchorElement>(document.querySelectorAll(".toc a"));
    tocLinks.forEach((a) => {
      const onClick = (e: Event) => {
        e.preventDefault();
        const id = a.getAttribute("href")?.slice(1);
        if (!id) return;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        // on mobile, close toc after navigation
        const tocCard = document.getElementById("tocCard");
        if (tocCard && tocCard.classList.contains("open")) {
          tocCard.classList.remove("open");
          const toggle = document.getElementById("tocToggle") as HTMLButtonElement | null;
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      };
      a.addEventListener("click", onClick);
      (a as any).__privacy_onClick = onClick;
    });

    // scrollspy: highlight active toc link
    const sections = Array.from<HTMLElement>(document.querySelectorAll(".policy-section"));
    const linkMap = new Map<string, HTMLAnchorElement>();
    tocLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) linkMap.set(href.slice(1), a);
    });

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        let currentId: string | null = null;
        for (const s of sections) {
          const rect = s.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom > 140) {
            currentId = s.id;
            break;
          }
        }
        // update links
        linkMap.forEach((a, id) => {
          if (id === currentId) a.classList.add("active");
          else a.classList.remove("active");
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Mobile TOC toggle
    const tocToggle = document.getElementById("tocToggle") as HTMLButtonElement | null;
    const tocCard = document.getElementById("tocCard") as HTMLElement | null;
    function onTocToggle(e?: Event) {
      if (!tocCard || !tocToggle) return;
      const open = tocCard.classList.toggle("open");
      tocToggle.setAttribute("aria-expanded", open ? "true" : "false");
      // focus first TOC link when opened for easier keyboard nav
      if (open) {
        const firstLink = tocCard.querySelector<HTMLAnchorElement>(".toc a");
        setTimeout(() => firstLink?.focus(), 120);
      }
    }
    if (tocToggle) tocToggle.addEventListener("click", onTocToggle);

    // close toc when clicking outside on mobile
    function onDocClick(e: MouseEvent) {
      if (!tocCard || !tocToggle) return;
      if (!tocCard.classList.contains("open")) return;
      const target = e.target as Node | null;
      if (target && !tocCard.contains(target) && target !== tocToggle) {
        tocCard.classList.remove("open");
        tocToggle.setAttribute("aria-expanded", "false");
      }
    }
    document.addEventListener("click", onDocClick);

    return () => {
      heads.forEach((h) => {
        const fn = (h as any).__privacy_onClick;
        if (fn) h.removeEventListener("click", fn);
        h.removeEventListener("keydown", fn as any);
        delete (h as any).__privacy_onClick;
      });
      tocLinks.forEach((a) => {
        const fn = (a as any).__privacy_onClick;
        if (fn) a.removeEventListener("click", fn);
        delete (a as any).__privacy_onClick;
      });
      window.removeEventListener("scroll", onScroll);
      if (tocToggle) tocToggle.removeEventListener("click", onTocToggle);
      document.removeEventListener("click", onDocClick);
    };
  }, []);

  return null;
}