"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FinancialAdvisorPreview from "@/app/templates-preview/FinancialAdvisorPreview";

const STORAGE_BUCKET = "onboarding-uploads";

/**
 * Build public URL helper (user-provided style, kept here)
 * - returns input if already a full URL
 * - when given a filename, builds a best-effort onboarding-uploads public URL
 * Note: this intentionally matches the snippet you provided. It's a best-effort
 * conversion for bare filenames; the uploader should store public URLs to guarantee success.
 */
function buildPublicUrl(slug: string, field: string, filename: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
  if (!filename) return null;
  const s = String(filename);
  if (/^https?:\/\//.test(s)) return s;
  const trimmed = s.replace(/^\/+|\/+$/g, "");
  const maybePath = trimmed.includes("/") ? trimmed : `${slug}/${field}/${trimmed}`;
  return base ? `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeURIComponent(maybePath)}` : maybePath;
}

/** Parse possible list shapes (array, JSON string, newline/comma lists, single string) */
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

export default function FinancialAdvisorProfilePreviewPage() {
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

    const mergeExtraFields = (row: any) => {
      const out: Record<string, any> = { ...(row ?? {}) };
      if (row?.extra_fields) {
        try {
          const parsed =
            typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") {
            Object.entries(parsed).forEach(([k, v]) => {
              if (out[k] === undefined) out[k] = v;
            });
          }
        } catch {
          // ignore parse errors
        }
      }
      return out;
    };

    const normalizeRow = async (row: any) => {
      const out = mergeExtraFields(row);

      // parse list-like fields into arrays where applicable
      const keys = [
        "name","role","about","services","fees","credentials",
        "gallery","portfolio","avatar","heroImage",
        "email","phone","whatsapp","booking_link","contact_cards","profile_url"
      ];
      keys.forEach((k) => {
        if (out[k] !== undefined && out[k] !== null) {
          const p = parsePossibleList(out[k]);
          if (p !== null) out[k] = p;
        }
      });

      const slug = out.slug || row.slug || "financial-advisor";

      // Resolve image fields to URLs when possible
      const imageFields = ["gallery","portfolio","avatar","heroImage"];
      for (const field of imageFields) {
        if (!out[field]) continue;

        // if array: map each entry -> keep URLs, otherwise run buildPublicUrl
        if (Array.isArray(out[field])) {
          out[field] = out[field].map((entry: any) => {
            const s = String(entry || "").trim();
            if (!s) return null;
            if (/^https?:\/\//.test(s)) return s; // already a URL, keep as-is
            // best-effort: convert filename/path -> public URL
            return buildPublicUrl(slug, field, s);
          }).filter(Boolean);
        } else if (typeof out[field] === "string") {
          const s = out[field].trim();
          if (!s) {
            out[field] = null;
          } else if (/^https?:\/\//.test(s)) {
            out[field] = s;
          } else {
            out[field] = buildPublicUrl(slug, field, s);
          }
        }
      }

      // flatten avatar/hero arrays to first item
      if (Array.isArray(out.avatar) && out.avatar.length) out.avatar = out.avatar[0];
      if (Array.isArray(out.heroImage) && out.heroImage.length) out.heroImage = out.heroImage[0];
      if (Array.isArray(out.gallery) && out.gallery.length) out.gallery = out.gallery.slice(0, 3);

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
          setError(fetchError.message || "Error fetching onboarding row");
          setLoading(false);
          return;
        }

        const normalized = await normalizeRow(fetched);
        console.log("Financial advisor preview fetched normalized row:", normalized);
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
    <div style={{ padding: 20 }}>
      <h3 style={{ color: "red" }}>Error</h3>
      <p>{error}</p>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => router.back()} style={{ marginRight: 8 }}>Go back</button>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  return <FinancialAdvisorPreview data={data} showFooter={false} />;
}