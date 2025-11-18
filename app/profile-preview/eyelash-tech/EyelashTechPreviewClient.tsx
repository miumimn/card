"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EyelashTechPreview from "@/app/templates-preview/EyelashTechPreview";

const STORAGE_BUCKET = "onboarding-uploads";

/** Build public URL for supabase storage object */
function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
  if (!base) return filename;
  const path = `${slug}/${field}/${filename}`;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeURIComponent(path)}`;
}

/** Parse a value that might be an array, newline list, comma list or JSON */
function parsePossibleList(val: any) {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p) || typeof p === "object") return p;
    } catch {}
    if (s.includes("\n")) return s.split("\n").map((l) => l.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map((l) => l.trim()).filter(Boolean);
    return [s];
  }
  return null;
}

/**
 * Profile preview client wrapper for Eyelash Tech template.
 * Fetches onboarding row by ?id= and normalizes fields for EyelashTechPreview.
 */
export default function EyelashTechPreviewClient() {
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

      if (row?.extra_fields) {
        try {
          const parsed = typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
        } catch {}
      }

      const keys = [
        "name","role","about","services","portfolio","gallery","avatar","heroImage",
        "phone","booking_link","gift_vouchers","instagram","tiktok","snapchat","facebook",
        "contact_cards","profile_url","address","refill_tips"
      ];
      keys.forEach((k) => {
        if (out[k] !== undefined && out[k] !== null) {
          const p = parsePossibleList(out[k]);
          if (p !== null) out[k] = p;
        }
      });

      return out;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase
          .from("onboardings")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error(fetchError);
          setError(fetchError.message || "Error fetching data");
          setLoading(false);
          return;
        }

        let normalized = normalizeRow(fetched);
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "eyelash-tech";

        // promote gallery/portfolio/avatar from extra_fields if needed
        if ((!normalized.portfolio || (Array.isArray(normalized.portfolio) && normalized.portfolio.length === 0))
            && normalized.extra_fields && normalized.extra_fields.portfolio) normalized.portfolio = normalized.extra_fields.portfolio;
        if ((!normalized.gallery || (Array.isArray(normalized.gallery) && normalized.gallery.length === 0))
            && normalized.extra_fields && normalized.extra_fields.gallery) normalized.gallery = normalized.extra_fields.gallery;
        if ((!normalized.avatar || (Array.isArray(normalized.avatar) && normalized.avatar.length === 0))
            && normalized.extra_fields && normalized.extra_fields.avatar) normalized.avatar = normalized.extra_fields.avatar;
        if ((!normalized.heroImage || (Array.isArray(normalized.heroImage) && normalized.heroImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.heroImage) normalized.heroImage = normalized.extra_fields.heroImage;

        // Convert filenames -> public URLs for image fields and cap portfolio/gallery to 6
        const imageFields = ["avatar","heroImage","portfolio","gallery"];
        imageFields.forEach((field) => {
          if (normalized[field]) {
            if (Array.isArray(normalized[field])) {
              normalized[field] = normalized[field].slice(0, 6).map((v: any) => {
                if (!v) return v;
                if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
                return buildPublicUrl(base, slug, field, String(v));
              }).filter(Boolean);
            } else if (typeof normalized[field] === "string") {
              const v = normalized[field];
              normalized[field] = /^https?:\/\//.test(v) ? v : buildPublicUrl(base, slug, field, v);
            }
          }
        });

        // flatten avatar/hero if arrays -> prefer first
        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];
        if (Array.isArray(normalized.heroImage) && normalized.heroImage.length) normalized.heroImage = normalized.heroImage[0];
        if (Array.isArray(normalized.portfolio) && normalized.portfolio.length) normalized.portfolio = normalized.portfolio.slice(0, 6);
        if (Array.isArray(normalized.gallery) && normalized.gallery.length) normalized.gallery = normalized.gallery.slice(0, 6);

        console.log("Eyelash tech preview fetched normalized row:", normalized);
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
      <p>No eyelash technician data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  // pass the fetched data to the preview and ensure showFooter is false for profile previews
  return <EyelashTechPreview data={data} showFooter={false} />;
}