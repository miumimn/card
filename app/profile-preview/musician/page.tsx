"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import MusicianPreview from "@/app/templates-preview/MusicianPreview";

export default function MusicianProfilePreviewPage() {
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

    const parsePossibleJson = (val: any) => {
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
        if (s.includes("\n")) return s.split("\n").map(p => p.trim()).filter(Boolean);
        if (s.includes(",")) return s.split(",").map(p => p.trim()).filter(Boolean);
        return [s];
      }
      return null;
    };

    const normalizeRow = (row: any) => {
      const out: Record<string, any> = { ...(row ?? {}) };
      if (row?.extra_fields) {
        try {
          const parsed = typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") {
            Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
          }
        } catch {}
      }

      const keys = ["profileImage","profile_image","avatar","avatar_url","portfolio","gallery","images","tracks","gigs","press","heroImage","hero_image"];
      keys.forEach(k => {
        if (out[k] !== undefined && out[k] !== null) {
          const p = parsePossibleJson(out[k]);
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
          console.error("Error fetching musician data:", fetchError);
          setError(fetchError.message || "Error fetching musician data.");
          setData(null);
        } else {
          const normalized = normalizeRow(fetched);
          console.log("Fetched and normalized musician row:", normalized);
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
      <p>No musician data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <MusicianPreview data={data} showFooter={false} />;
}