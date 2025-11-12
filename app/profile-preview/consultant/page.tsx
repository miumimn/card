"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ConsultantPreview from "@/app/templates-preview/consultantPreview";

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

export default function ConsultantProfilePreviewPage() {
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

      const keys = ["name","role","bio","profileImage","avatar","services","pricing","testimonials","email","phone","schedule_url"];
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

        // map fields user provided into template fields
        // profileImage: if filenames, convert to public URLs
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "consultant";

        if (normalized.profileImage) {
          if (Array.isArray(normalized.profileImage)) {
            normalized.profileImage = normalized.profileImage.map((v: string) => (typeof v === "string" && /^https?:\/\//.test(v) ? v : buildPublicUrl(base, slug, "profileImage", String(v))));
          } else if (typeof normalized.profileImage === "string") {
            normalized.profileImage = /^https?:\/\//.test(normalized.profileImage) ? normalized.profileImage : buildPublicUrl(base, slug, "profileImage", normalized.profileImage);
          }
        }

        // pricing/testimonials: keep as-is; if strings convert to arrays by parsePossibleList earlier
        // ensure schedule_url exists
        if (!normalized.schedule_url && normalized.contact_url) normalized.schedule_url = normalized.contact_url;

        console.log("Consultant preview fetched normalized row:", normalized);
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
      <p>No consultant data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <ConsultantPreview data={data} showFooter={false} />;
}