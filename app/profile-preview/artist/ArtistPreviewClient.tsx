"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ArtistPreview from "@/app/templates-preview/ArtistPreview";

const STORAGE_BUCKET = "onboarding-uploads";

/** Parse arrays/strings into arrays (JSON string, newline/comma or single) */
function parsePossibleJson(val: any) {
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

export default function ArtistPreviewClient() {
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
          if (parsed && typeof parsed === "object") {
            Object.entries(parsed).forEach(([k, v]) => {
              if (out[k] === undefined) out[k] = v;
            });
          }
        } catch { /* ignore */ }
      }

      const keys = ["profileImage","portfolioImages","galleryImages","works","images"];
      keys.forEach(k => {
        if (out[k] !== undefined && out[k] !== null) {
          const p = parsePossibleJson(out[k]);
          if (p !== null) out[k] = p;
        }
      });

      for (let i = 1; i <= 12; i++) {
        const pk = `product${i}_image`;
        if (out[pk] !== undefined && out[pk] !== null) {
          const p = parsePossibleJson(out[pk]);
          if (p !== null) out[pk] = p;
        }
      }

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
          console.error("Error fetching artist data:", fetchError);
          setError(fetchError.message || "Error fetching artist data.");
          setData(null);
        } else {
          const normalized = normalizeRow(fetched);
          // NOTE: we intentionally do NOT fabricate storage URLs here.
          // If uploaded fields contain filenames rather than full public URLs,
          // you should resolve them using supabase.storage.getPublicUrl(...) where appropriate.
          console.log("Fetched and normalized onboarding row:", normalized);
          setData(normalized);
        }
      } catch (err: any) {
        console.error("Fetch failed", err);
        setError(String(err));
        setData(null);
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
      <p>No artist data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <ArtistPreview data={data} showFooter={false} />;
}