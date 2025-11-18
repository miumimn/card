"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DriverPreview from "@/app/templates-preview/DriverPreview";

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

export default function DriverPreviewClient() {
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

      const keys = ["name","role","vehicleImage","heroImage","gallery","services","availability","areas","email","phone","rates","booking_link","contact_cards","profile_url"];
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
        const slug = normalized.slug || "driver";

        // promote images from extra_fields if needed
        if ((!normalized.heroImage || (Array.isArray(normalized.heroImage) && normalized.heroImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.heroImage) normalized.heroImage = normalized.extra_fields.heroImage;
        if ((!normalized.vehicleImage || (Array.isArray(normalized.vehicleImage) && normalized.vehicleImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.vehicleImage) normalized.vehicleImage = normalized.extra_fields.vehicleImage;
        if ((!normalized.gallery || (Array.isArray(normalized.gallery) && normalized.gallery.length === 0))
            && normalized.extra_fields && normalized.extra_fields.gallery) normalized.gallery = normalized.extra_fields.gallery;

        // Convert filenames -> public URLs for image fields and cap gallery to 3
        const imageFields = ["heroImage","vehicleImage","gallery"];
        imageFields.forEach((field) => {
          if (normalized[field]) {
            if (Array.isArray(normalized[field])) {
              normalized[field] = normalized[field].slice(0, 3).map((v: any) => {
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

        // flatten hero/vehicle if arrays -> prefer first
        if (Array.isArray(normalized.heroImage) && normalized.heroImage.length) normalized.heroImage = normalized.heroImage[0];
        if (Array.isArray(normalized.vehicleImage) && normalized.vehicleImage.length) normalized.vehicleImage = normalized.vehicleImage[0];
        if (Array.isArray(normalized.gallery) && normalized.gallery.length) normalized.gallery = normalized.gallery.slice(0, 3);

        console.log("Driver preview fetched normalized row:", normalized);
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
      <p>No driver data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <DriverPreview data={data} showFooter={false} />;
}