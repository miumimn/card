"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import BoutiqueFashionPreview from "@/app/templates-preview/BoutiqueFashionPreview";

export default function BoutiqueFashionProfilePreviewPage() {
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

    // New helper: extractImageUrls
    // Accepts strings, JSON strings, comma-lists, arrays, objects from uploads (url/src/path/secure_url/preview)
    // Returns array of string URLs (possibly empty)
    const extractImageUrls = (val: any): string[] => {
      if (val === null || val === undefined) return [];

      // If it's an array, iterate and extract URLs from each entry
      if (Array.isArray(val)) {
        const out: string[] = [];
        for (const item of val) {
          if (!item && item !== "") continue;
          if (typeof item === "string") {
            const s = item.trim();
            if (s) out.push(s);
          } else if (typeof item === "object" && item !== null) {
            const candidate = item.url || item.src || item.path || item.secure_url || item.preview || item.filename || "";
            if (candidate) out.push(String(candidate));
          }
        }
        return out.filter(Boolean);
      }

      // If it's an object, try common keys
      if (typeof val === "object") {
        const candidate = val.url || val.src || val.path || val.secure_url || val.preview || val.filename || "";
        return candidate ? [String(candidate)] : [];
      }

      // If it's a string: try JSON parse, comma split, or single value
      if (typeof val === "string") {
        const s = val.trim();
        if (!s) return [];
        try {
          const parsed = JSON.parse(s);
          // if parsed is array or object, handle recursively
          if (Array.isArray(parsed)) return extractImageUrls(parsed);
          if (typeof parsed === "object" && parsed !== null) {
            return extractImageUrls(parsed);
          }
        } catch {
          // not JSON
        }
        // comma-separated list
        if (s.includes(",")) {
          return s.split(",").map((p) => p.trim()).filter(Boolean);
        }
        // fallback single string (url/path)
        return [s];
      }

      return [];
    };

    const normalizeRow = (row: any) => {
      const out: Record<string, any> = { ...(row ?? {}) };
      if (row?.extra_fields) {
        try {
          const parsed = typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") {
            Object.entries(parsed).forEach(([k, v]) => {
              if (out[k] === undefined) out[k] = v;
            });
          }
        } catch {
          // ignore
        }
      }

      // Keys that may contain image data and should be normalized to arrays of URLs
      const imageKeys = [
        "profileImage",
        "profile_image",
        "portfolioImages",
        "portfolio_images",
        "galleryImages",
        "gallery_images",
        "collection",
        "collection_images",
        "collection1",
        "collection2",
        "works",
        "images",
        "lookbook",
        "lookbook_images",
        "brandLogo",
        "brand_logo",
      ];

      imageKeys.forEach((k) => {
        if (out[k] !== undefined && out[k] !== null) {
          const urls = extractImageUrls(out[k]);
          if (urls.length) out[k] = urls;
          else delete out[k];
        }
      });

      // product fields: normalize to arrays of URLs so preview's parseImageField can work consistently.
      for (let i = 1; i <= 4; i++) {
        const pk = `product${i}_image`;
        if (out[pk] !== undefined && out[pk] !== null) {
          const urls = extractImageUrls(out[pk]);
          if (urls.length) out[pk] = urls;
          else delete out[pk];
        }
        // also normalize fallback field names if present
        const pImagesAlt = out[`product${i}_images`];
        if (!out[pk] && pImagesAlt) {
          const urls = extractImageUrls(pImagesAlt);
          if (urls.length) out[pk] = urls;
        }
      }

      // If there's a top-level "collection_images" (file upload field with maxFiles=3) normalize it too
      if (out.collection_images !== undefined && out.collection_images !== null) {
        const urls = extractImageUrls(out.collection_images);
        if (urls.length) {
          // ensure we keep only up to 3 images per new onboarding requirement
          out.collection_images = urls.slice(0, 3);
          // also mirror to 'collection' key to match preview parsing
          if (!out.collection || !out.collection.length) out.collection = out.collection_images;
        } else {
          delete out.collection_images;
        }
      }

      // Ensure product_count is a number if present
      if (out.product_count !== undefined) {
        const n = Number(out.product_count);
        if (!Number.isFinite(n)) delete out.product_count;
        else out.product_count = Math.max(0, Math.min(4, Math.floor(n)));
      }

      return out;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: fetched, error: fetchError } = await supabase
        .from("onboardings")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching boutique data:", fetchError);
        setError(fetchError.message || "Error fetching boutique data.");
        setData(null);
      } else {
        const normalized = normalizeRow(fetched);
        console.log("Boutique fetched normalized row:", normalized);
        setData(normalized);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, supabase]);

  if (loading) return <p style={{ textAlign: "center", padding: 20 }}>Loading preview...</p>;
  if (error) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p style={{ color: "red", marginBottom: 12 }}>Error: {error}</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p>No boutique data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <BoutiqueFashionPreview data={data} showFooter={false} />;
}