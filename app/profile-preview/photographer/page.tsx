"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PhotographerPreview from "@/app/templates-preview/PhotographerPreview";

const STORAGE_BUCKET = "onboarding-uploads";

function parsePossibleList(val: any) {
  if (val == null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p) || typeof p === "object") return p;
    } catch {}
    if (s.includes("\n")) return s.split("\n").map(l => l.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(l => l.trim()).filter(Boolean);
    return [s];
  }
  return null;
}

export default function PhotographerProfilePreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const id = searchParams.get("id");
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); setError("No id provided."); return; }

    const fetchRow = async () => {
      setLoading(true); setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase.from("onboardings").select("*").eq("id", id).single();
        if (fetchError) { setError(fetchError.message || "Fetch failed"); setLoading(false); return; }
        let normalized: any = { ...(fetched ?? {}) };

        // merge extra_fields into top-level (without overwriting existing keys)
        if (fetched?.extra_fields) {
          try {
            const parsed = typeof fetched.extra_fields === "string" ? JSON.parse(fetched.extra_fields || "{}") : fetched.extra_fields;
            if (parsed && typeof parsed === "object") {
              Object.entries(parsed).forEach(([k, v]) => { if (normalized[k] === undefined) normalized[k] = v; });
            }
          } catch {}
        }

        // normalize potential list-like fields
        const keys = ["avatar","gallery","photos","portfolioImages","portfolio_images","galleryImages","profileImage","other_links","otherLinks"];
        keys.forEach(k => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        // booking_contact normalization: prefer explicit field, fallback
        normalized.booking_contact = normalized.booking_contact ?? normalized.booking_link ?? normalized.profile_url ?? "";

        // --- CRITICAL PRIORITIZATION FIX ---
        // Prefer canonical portfolioImages (public URLs produced at upload) over legacy gallery fields that may contain raw filenames.
        // This ensures the preview renders the real public URLs the uploader produced.
        if (Array.isArray(normalized.portfolioImages) && normalized.portfolioImages.length) {
          normalized.gallery = normalized.portfolioImages.map(String);
        } else if (Array.isArray(normalized.portfolio_images) && normalized.portfolio_images.length) {
          normalized.gallery = normalized.portfolio_images.map(String);
        } else if (Array.isArray(normalized.gallery) && normalized.gallery.length) {
          // gallery already provided (legacy); keep it but prefer portfolioImages when present
          normalized.gallery = normalized.gallery.map(String);
        } else if (Array.isArray(normalized.photos) && normalized.photos.length) {
          normalized.gallery = normalized.photos.map(String);
        } else {
          normalized.gallery = normalized.gallery ?? [];
        }

        // Ensure avatar is normalized (if array pick first)
        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];

        // Promote gallery to contain only unique values (preserve order)
        if (Array.isArray(normalized.gallery)) {
          const seen = new Set<string>();
          const dedup: string[] = [];
          for (const u of normalized.gallery) {
            if (!u) continue;
            const s = String(u);
            if (!seen.has(s)) { seen.add(s); dedup.push(s); }
          }
          normalized.gallery = dedup.slice(0, 12);
        } else {
          normalized.gallery = [];
        }

        // Optionally: clean legacy extra_fields keys so future reads are unambiguous.
        // (We do not overwrite the DB here, but avoid passing legacy duplicates to the preview.)
        if (normalized.extra_fields && typeof normalized.extra_fields === "object") {
          // remove conflicting keys from extra_fields view we merged above
          const cleanedExtra = { ...normalized.extra_fields };
          delete cleanedExtra.gallery;
          delete cleanedExtra.photos;
          delete cleanedExtra.portfolioImages;
          delete cleanedExtra.portfolio_images;
          normalized.extra_fields = cleanedExtra;
        }

        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("Photographer preview fetched normalized row:", normalized);
        }

        setRow(normalized);
      } catch (err: any) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRow();
  }, [id, supabase, router]);

  if (loading) return <p style={{ textAlign: "center", padding: 20 }}>Loading preview...</p>;
  if (error) return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: "red" }}>Error</h3>
      <p>{error}</p>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => router.back()} style={{ marginRight: 8 }}>Go back</button>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  return <PhotographerPreview data={row} showFooter={false} />;
}