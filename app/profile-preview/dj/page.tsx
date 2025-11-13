"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import DJPreview from "@/app/templates-preview/DJPreview";

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

// Normalization helpers used by DJPreview normalization logic
function asString(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val.trim();
  if (Array.isArray(val) && val.length) return String(val[0]).trim();
  return String(val ?? "");
}
function asArray(val: any): string[] {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    if (s.includes("\n")) return s.split("\n").map((x) => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
}

export default function DJProfilePreviewPage() {
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

      const keys = ["name","title","about","genres","heroImage","avatar","mixes","mix_links","mixesImages","mixes_images","gigs","email","phone","agent","contact_cards","instagram","tiktok","twitter","facebook","soundcloud","profile_url"];
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
        const slug = normalized.slug || "dj";

        // promote mixesImages from alternative keys if needed
        if ((!normalized.mixesImages || (Array.isArray(normalized.mixesImages) && normalized.mixesImages.length === 0))
            && normalized.extra_fields && normalized.extra_fields.mixesImages) {
          normalized.mixesImages = normalized.extra_fields.mixesImages;
        }
        if ((!normalized.heroImage || (Array.isArray(normalized.heroImage) && normalized.heroImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.heroImage) {
          normalized.heroImage = normalized.extra_fields.heroImage;
        }
        if ((!normalized.avatar || (Array.isArray(normalized.avatar) && normalized.avatar.length === 0))
            && normalized.extra_fields && normalized.extra_fields.avatar) {
          normalized.avatar = normalized.extra_fields.avatar;
        }

        // Convert filenames -> public URLs for image/file fields (avatar + hero + mixesImages), limit mixesImages to 3
        const imageFields = ["heroImage","avatar","mixesImages","mixes_images"];
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

        // Normalize mixes: user may supply structured extra_fields.mixes or a textarea list.
        // We now accept separate mix links (mix_links) — one per line — and cap mixes to 3
        let mixes: Array<{ title?: string; meta?: string; image?: string; link?: string }> = [];
        const mixLinks = Array.isArray(normalized.mix_links) ? normalized.mix_links : (typeof normalized.mix_links === "string" ? [normalized.mix_links] : []);

        if (normalized.extra_fields && Array.isArray(normalized.extra_fields.mixes) && normalized.extra_fields.mixes.length) {
          mixes = normalized.extra_fields.mixes.map((m: any) => ({
            title: m.title || m.name || "",
            meta: m.meta || m.subtitle || "",
            image: (Array.isArray(m.image) ? m.image[0] : m.image) || "",
            link: asString(m.link || m.url || ""),
          })).slice(0, 3);
        } else if (normalized.mixes && Array.isArray(normalized.mixes) && normalized.mixes.length) {
          mixes = normalized.mixes.slice(0, 3).map((line: any, i: number) => {
            const parts = String(line || "").split("|").map((s: string) => s.trim());
            const imageCandidate = parts[2] || (Array.isArray(normalized.mixesImages) ? normalized.mixesImages[i] : undefined) || "";
            const linkCandidate = (mixLinks && mixLinks[i]) ? mixLinks[i] : (parts[3] || "");
            return { title: parts[0] || `Mix ${i+1}`, meta: parts[1] || "", image: imageCandidate, link: linkCandidate };
          });
        } else if (Array.isArray(normalized.mixesImages) && normalized.mixesImages.length) {
          mixes = normalized.mixesImages.slice(0, 3).map((img: string, i: number) => ({ title: `Mix ${i+1}`, meta: "", image: img, link: (mixLinks && mixLinks[i]) ? mixLinks[i] : "" }));
        }

        // Ensure mixes image public URLs resolved (if filenames remain)
        mixes = mixes.map((m) => {
          let image = m.image || "";
          if (image && typeof image === "string" && !/^https?:\/\//.test(image)) {
            image = buildPublicUrl(base, slug, "mixesImages", String(image));
          }
          return { ...m, image, link: m.link || "" };
        });

        normalized.mixes = mixes;

        // Normalize gigs: allow structured extra_fields.gigs or textarea lines "Date | Venue | meta | url"
        let gigs: Array<{ date?: string; venue?: string; meta?: string; url?: string }> = [];
        if (normalized.extra_fields && Array.isArray(normalized.extra_fields.gigs) && normalized.extra_fields.gigs.length) {
          gigs = normalized.extra_fields.gigs.map((g: any) => ({
            date: g.date || g.when || "",
            venue: g.venue || g.place || "",
            meta: g.meta || "",
            url: g.url || "",
          }));
        } else if (normalized.gigs && Array.isArray(normalized.gigs) && normalized.gigs.length) {
          gigs = normalized.gigs.slice(0, 10).map((line: any) => {
            const parts = String(line || "").split("|").map((s: string) => s.trim());
            return { date: parts[0] || "", venue: parts[1] || "", meta: parts[2] || "", url: parts[3] || "" };
          });
        }
        normalized.gigs = gigs;

        // Contact cards: prefer normalized array
        if ((!normalized.contact_cards || (Array.isArray(normalized.contact_cards) && normalized.contact_cards.length === 0))
            && normalized.extra_fields && normalized.extra_fields.contact_cards) {
          normalized.contact_cards = normalized.extra_fields.contact_cards;
        }

        // final fallbacks: prefer file URL for hero/avatar if array (we already converted arrays to URLs and sliced to 3)
        if (Array.isArray(normalized.heroImage) && normalized.heroImage.length) normalized.heroImage = normalized.heroImage[0];
        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];

        console.log("DJ preview fetched normalized row:", normalized);
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
      <p>No DJ data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  return <DJPreview data={data} showFooter={false} />;
}