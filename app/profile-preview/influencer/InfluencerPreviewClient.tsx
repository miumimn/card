"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import InfluencerPreview from "@/app/templates-preview/InfluencerPreview";

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

export default function InfluencerPreviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No id provided in the URL.");
      return;
    }

    const normalizeRow = (row: any) => {
      const out: Record<string, any> = { ...(row ?? {}) };

      // merge extra_fields into top-level (without overwriting explicit top-level values)
      if (row?.extra_fields) {
        try {
          const parsed = typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") {
            Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
          }
        } catch {}
      }

      // Normalise list-like fields into arrays where appropriate
      const keysToParse = [
        "fullName","stageName","tagline","bio",
        "profileImage","galleryImages","gallery","portfolio","images",
        "mediaKit","services","rates","notes",
        "instagram","tiktok","youtube","snapchat","website",
        "top_links","email","managerPhone","phone","booking_link"
      ];
      keysToParse.forEach(k => {
        if (out[k] !== undefined && out[k] !== null) {
          const p = parsePossibleList(out[k]);
          if (p !== null) out[k] = p;
        }
      });

      // small fallbacks
      if (!out.email && out.contact_email) out.email = out.contact_email;
      if (!out.managerPhone && out.phone) out.managerPhone = out.phone;
      if (!out.fullName && out.name) out.fullName = out.name;

      return out;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase.from("onboardings").select("*").eq("id", id).single();
        if (fetchError) {
          console.error(fetchError);
          setError(fetchError.message || "Error fetching data");
          setLoading(false);
          return;
        }

        let normalized = normalizeRow(fetched);

        // Prefer canonical gallery arrays created at upload time:
        // If portfolioImages exists (uploader shape) prefer it; otherwise use galleryImages/gallery/photos etc
        if (Array.isArray(normalized.portfolioImages) && normalized.portfolioImages.length) {
          normalized.gallery = normalized.portfolioImages.map(String);
        } else if (Array.isArray(normalized.portfolio_images) && normalized.portfolio_images.length) {
          normalized.gallery = normalized.portfolio_images.map(String);
        } else if (Array.isArray(normalized.galleryImages) && normalized.galleryImages.length) {
          normalized.gallery = normalized.galleryImages.map(String);
        } else if (Array.isArray(normalized.gallery) && normalized.gallery.length) {
          normalized.gallery = normalized.gallery.map(String);
        } else if (Array.isArray(normalized.photos) && normalized.photos.length) {
          normalized.gallery = normalized.photos.map(String);
        } else {
          normalized.gallery = normalized.gallery ?? [];
        }

        // Flatten single-avatar/profileImage
        if (Array.isArray(normalized.profileImage) && normalized.profileImage.length) normalized.profileImage = normalized.profileImage[0];
        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];

        // Cap gallery length & dedupe preserving order
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

        // ensure mediaKit is array if present
        if (normalized.mediaKit && !Array.isArray(normalized.mediaKit)) {
          normalized.mediaKit = parsePossibleList(normalized.mediaKit) || [];
        }

        // expose quick scalar bio for convenience
        normalized.__bio = Array.isArray(normalized.bio) ? String(normalized.bio[0] || "") : typeof normalized.bio === "string" ? normalized.bio : (normalized.extra_fields && normalized.extra_fields.bio ? String(normalized.extra_fields.bio) : "");

        // eslint-disable-next-line no-console
        console.log("Influencer preview fetched normalized row:", normalized);

        setData(normalized);
      } catch (err: any) {
        console.error("Fetch failed", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, supabase, router]);

  if (loading) return <p style={{ textAlign: "center", padding: 20 }}>Loading preview...</p>;
  if (error) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p style={{ color: "red", marginBottom: 12 }}>Error: {error}</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p>No influencer data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <InfluencerPreview data={data} showFooter={false} />;
}