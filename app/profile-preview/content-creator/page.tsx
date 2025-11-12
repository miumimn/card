"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ContentCreatorPreview from "@/app/templates-preview/ContentCreatorPreview";

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

export default function ContentCreatorProfilePreviewPage() {
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

      const keys = ["name","role","bio","profileImage","avatar","stats","instagram","youtube","tiktok","snapchat","shop","mediaImages","media","projectPhotos","sponsor_link","profile_url"];
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
        const slug = normalized.slug || "content-creator";

        // if user used media (projectPhotos) but we stored in extra_fields.media -> normalize into mediaImages
        if ((!normalized.mediaImages || (Array.isArray(normalized.mediaImages) && normalized.mediaImages.length === 0))
            && normalized.projectPhotos && Array.isArray(normalized.projectPhotos) && normalized.projectPhotos.length) {
          normalized.mediaImages = normalized.projectPhotos.slice();
        }

        // If profileImage is in extra_fields, pull it up
        if ((!normalized.profileImage || (Array.isArray(normalized.profileImage) && normalized.profileImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.profileImage) {
          normalized.profileImage = normalized.extra_fields.profileImage;
        }

        // convert filenames to public URLs for profileImage and mediaImages
        const imageFields = ["profileImage","mediaImages","media","projectPhotos"];
        imageFields.forEach((field) => {
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

        // merge projectPhotos and mediaImages if both exist
        if (normalized.projectPhotos && Array.isArray(normalized.projectPhotos) && Array.isArray(normalized.mediaImages)) {
          const mergedImgs = [...normalized.mediaImages, ...normalized.projectPhotos];
          normalized.mediaImages = Array.from(new Set(mergedImgs));
        }

        // sponsor/profile mapping safe pull
        if (!normalized.sponsor_link && normalized.extra_fields && normalized.extra_fields.sponsor_link) normalized.sponsor_link = normalized.extra_fields.sponsor_link;
        if (!normalized.profile_url && normalized.extra_fields && normalized.extra_fields.profile_url) normalized.profile_url = normalized.extra_fields.profile_url;

        console.log("Content Creator preview fetched normalized row:", normalized);
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
      <p>No content creator data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <ContentCreatorPreview data={data} showFooter={false} />;
}