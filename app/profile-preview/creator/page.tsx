"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CreatorPreview from "@/app/templates-preview/CreatorPreview";

const STORAGE_BUCKET = "onboarding-uploads";

function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
  if (!base) return filename;
  const path = `${slug}/${field}/${filename}`;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeURIComponent(path)}`;
}

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

export default function CreatorProfilePreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); setError("No id provided in the URL."); return; }

    const normalizeRow = (row: any) => {
      const out: Record<string, any> = { ...(row ?? {}) };

      if (row?.extra_fields) {
        try {
          const parsed = typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
        } catch {}
      }

      const keys = ["name","role","tagline","bio","profileImage","miniGallery","mini_gallery","mediaImages","media","projectPhotos","youtube","instagram","patreon","merch","sponsor_kit","sponsor_kit_url","profile_url"];
      keys.forEach(k => {
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
        const slug = normalized.slug || "creator";

        // promote miniGallery / mediaImages from projectPhotos when appropriate
        if ((!normalized.miniGallery || (Array.isArray(normalized.miniGallery) && normalized.miniGallery.length === 0))
            && normalized.projectPhotos && Array.isArray(normalized.projectPhotos) && normalized.projectPhotos.length) {
          normalized.miniGallery = normalized.projectPhotos.slice(0, 3);
        }

        if ((!normalized.mediaImages || (Array.isArray(normalized.mediaImages) && normalized.mediaImages.length === 0))
            && normalized.projectPhotos && Array.isArray(normalized.projectPhotos) && normalized.projectPhotos.length) {
          normalized.mediaImages = normalized.projectPhotos.slice(0, 3);
        }

        // pull profileImage up from extra_fields if needed
        if ((!normalized.profileImage || (Array.isArray(normalized.profileImage) && normalized.profileImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.profileImage) {
          normalized.profileImage = normalized.extra_fields.profileImage;
        }

        // convert filenames -> public URLs for image and file fields
        const fileFields = ["profileImage","miniGallery","mediaImages","projectPhotos","sponsor_kit"];
        fileFields.forEach((field) => {
          if (normalized[field]) {
            if (Array.isArray(normalized[field])) {
              normalized[field] = normalized[field].map((v: any) => {
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

        // merge mediaImages and projectPhotos if both exist (dedupe) and cap at 3
        if (normalized.projectPhotos && Array.isArray(normalized.projectPhotos)) {
          normalized.mediaImages = Array.from(new Set([...(Array.isArray(normalized.mediaImages) ? normalized.mediaImages : []), ...normalized.projectPhotos])).slice(0, 3);
        }
        if (normalized.miniGallery && Array.isArray(normalized.miniGallery)) normalized.miniGallery = normalized.miniGallery.slice(0, 3);
        if (normalized.mediaImages && Array.isArray(normalized.mediaImages)) normalized.mediaImages = normalized.mediaImages.slice(0, 3);

        // sponsor kit mapping fallback
        if (!normalized.sponsor_kit && normalized.extra_fields && normalized.extra_fields.sponsor_kit) normalized.sponsor_kit = normalized.extra_fields.sponsor_kit;
        if (!normalized.sponsor_kit_url && normalized.extra_fields && normalized.extra_fields.sponsor_kit_url) normalized.sponsor_kit_url = normalized.extra_fields.sponsor_kit_url;

        // prefer sponsor_kit (file public URL) over sponsor_kit_url
        if ((!normalized.sponsor_kit || (Array.isArray(normalized.sponsor_kit) && normalized.sponsor_kit.length === 0)) && normalized.sponsor_kit_url) {
          normalized.sponsor_kit = normalized.sponsor_kit_url;
        } else if (Array.isArray(normalized.sponsor_kit)) {
          normalized.sponsor_kit = normalized.sponsor_kit[0];
        }

        console.log("Creator preview fetched normalized row:", normalized);
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
      <p>No creator data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <CreatorPreview data={data} showFooter={false} />;
}