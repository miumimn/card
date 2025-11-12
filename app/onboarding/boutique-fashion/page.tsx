"use client";
import React from "react";
import OnboardingForm from "@/components/OnboardingForm";

/**
 * Boutique Fashion onboarding
 *
 * - Single lookbook collection: collection_images (3 image slots)
 * - Logo upload (single)
 * - Structured shop: product1..product4 (title, price, description, image, optional product_link)
 * - Socials/contact fields
 *
 * This aligns the onboarding inputs with the BoutiqueFashionPreview parsing:
 * - preview expects a single collection set (merged.collection or merged.collection_images or merged.lookbook)
 *   containing up to 3 images.
 * - preview also reads structured product fields: product1_* .. product4_*
 *
 * Drop this file as app/onboarding/boutique-fashion/page.tsx
 */
export default function Page() {
  const productFields = [];
  const MAX_PRODUCTS = 4;
  for (let i = 1; i <= MAX_PRODUCTS; i++) {
    productFields.push(
      { name: `product${i}_title`, label: `Product ${i} — Title`, type: "text", placeholder: "e.g. Linen Wrap Dress" },
      { name: `product${i}_price`, label: `Product ${i} — Price`, type: "text", placeholder: "e.g. $119" },
      { name: `product${i}_desc`, label: `Product ${i} — Short description`, type: "textarea", placeholder: "Short descriptor or material" },
      { name: `product${i}_image`, label: `Product ${i} — Image (1)`, type: "files", maxFiles: 1, accept: "image/*" },
      { name: `product${i}_link`, label: `Product ${i} — Optional buy / product link`, type: "url", placeholder: "https://store.example.com/product" }
    );
  }

  const fields = [
    // Brand
    { name: "brandName", label: "Brand name", type: "text", placeholder: "Éclat Boutique", required: true },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Handmade linen / Seasonal collections" },
    { name: "bio", label: "About / Bio", type: "textarea", placeholder: "Short brand story, sustainability notes, etc." },

    // Logo
    { name: "brandLogo", label: "Logo / Brand mark", type: "files", maxFiles: 1, accept: "image/*" },

    // Single lookbook collection: exactly up to 3 images (we ask as one field with maxFiles = 3)
    { name: "collection_images", label: "Lookbook — upload up to 3 images (one set)", type: "files", maxFiles: 3, accept: "image/*", placeholder: "3 images that represent your current collection" },

    // Structured products
    ...productFields,

    // Socials
    { name: "instagram", label: "Instagram (handle or URL)", type: "text", placeholder: "@yourhandle or https://instagram.com/..." },
    { name: "tiktok", label: "TikTok (handle or URL)", type: "text", placeholder: "@yourhandle or https://www.tiktok.com/..." },
    { name: "pinterest", label: "Pinterest (URL)", type: "text", placeholder: "https://pinterest.com/..." },
    { name: "website", label: "Website (URL)", type: "url", placeholder: "https://yourwebsite.com" },

    // Contact
    { name: "email", label: "Contact email", type: "email", placeholder: "you@domain.com" },
    { name: "phone", label: "Contact phone", type: "tel", placeholder: "+1 555 555 5555" },
    { name: "contact_url", label: "Contact / booking URL", type: "url", placeholder: "https://example.com/contact" },
    { name: "profile_url", label: "Public profile URL (for QR)", type: "url", placeholder: "https://example.com/yourprofile" },

    // Misc (legacy / freeform fallback)
    { name: "product_list", label: "Optional free-form product list (one per line)", type: "textarea", placeholder: "Title — $Price | short description" }
  ];

  // TypeScript: OnboardingForm expects Field[]; build-time inference from the dynamic array can widen literal string types to 'string'
  // which causes the strict type error during the build. Cast here to satisfy the component's prop type without changing runtime data.
  return <OnboardingForm slug="boutique-fashion" fields={fields as unknown as any} submitLabel="Save & Preview" />;
}