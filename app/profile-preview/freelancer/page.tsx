"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import FreelancerPreview from "@/app/templates-preview/FreelancerPreview";

const STORAGE_BUCKET = "onboarding-uploads";

/**
 * Robust profile preview for Freelancer
 * - fetches onboarding row by id
 * - merges extra_fields
 * - parses fields and image aliases
 * - resolves image values (URLs kept, filenames mapped to onboarding-uploads best-effort URL)
 * - uses listing fallback when possible to match filename fragments (helps when DB holds original filenames)
 */
function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
  if (!base) return filename;
  if (!filename) return filename;
  if (/^https?:\/\//.test(filename)) {
    try {
      const url = new URL(filename);
      const m = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)$/);
      if (m) {
        const decoded = decodeURIComponent(m[1]);
        const segs = decoded.split("/").map((s) => encodeURIComponent(s));
        return `${url.origin}/storage/v1/object/public/${segs.join("/")}`;
      }
      return filename;
    } catch {
      return filename;
    }
  }
  let path = filename;
  if (!filename.includes("/")) path = `${slug}/${field}/${filename}`;
  path = path.replace(/^\/+|\/+$/g, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${encoded}`;
}

function parsePossibleList(val: any) {
  if (val == null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const s = val.trim(); if (!s) return null;
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

export default function FreelancerProfilePreviewPage() {
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

    const mergeExtra = (row: any) => {
      const out: Record<string, any> = { ...(row ?? {}) };
      if (row?.extra_fields) {
        try {
          const parsed = typeof row.extra_fields === "string" ? JSON.parse(row.extra_fields || "{}") : row.extra_fields;
          if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
        } catch {}
      }
      return out;
    };

    async function headOk(url?: string) {
      if (!url) return false;
      try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
      } catch {
        return false;
      }
    }

    const resolveImageValue = async (base: string, slug: string, field: string, v: any) => {
      if (!v) return null;
      const s = String(v).trim();
      if (!s) return null;
      // if URL -> normalize and keep
      if (/^https?:\/\//.test(s)) {
        const normalized = buildPublicUrl(base, slug, field, s);
        if (await headOk(normalized)) return normalized;
        return normalized;
      }
      // build canonical path
      const candidate = buildPublicUrl(base, slug, field, s);
      if (await headOk(candidate)) return candidate;
      // fallback: try listing under slug/field to find a matching file
      try {
        const prefix = `${slug}/${field}`.replace(/^\/+|\/+$/g, "");
        const listRes = await supabase.storage.from(STORAGE_BUCKET).list(prefix, { limit: 1000 });
        if (!listRes.error && Array.isArray(listRes.data)) {
          const target = s.split("/").pop() || s;
          const lowered = target.toLowerCase();
          let found = listRes.data.find((o: any) => o.name === target);
          if (!found) found = listRes.data.find((o: any) => o.name.toLowerCase().endsWith(lowered));
          if (!found) found = listRes.data.find((o: any) => o.name.toLowerCase().includes(lowered));
          if (found) {
            const path = `${prefix}/${found.name}`.replace(/^\/+/, "");
            const { publicURL } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
            if (publicURL) {
              if (await headOk(publicURL)) return publicURL;
              return publicURL;
            }
          }
        }
      } catch (err) {
        console.warn("list fallback failed", err);
      }
      return candidate;
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase.from("onboardings").select("*").eq("id", id).single();
        if (fetchError) {
          console.error(fetchError);
          setError(fetchError.message || "Error fetching onboarding row");
          setLoading(false);
          return;
        }

        let normalized = mergeExtra(fetched);
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "freelancer";

        // promote images from extra_fields if top-level empty
        if ((!normalized.portfolio || (Array.isArray(normalized.portfolio) && normalized.portfolio.length === 0))
            && normalized.extra_fields && normalized.extra_fields.portfolio) normalized.portfolio = normalized.extra_fields.portfolio;
        if ((!normalized.avatar || (Array.isArray(normalized.avatar) && normalized.avatar.length === 0))
            && normalized.extra_fields && normalized.extra_fields.avatar) normalized.avatar = normalized.extra_fields.avatar;
        if ((!normalized.heroImage || (Array.isArray(normalized.heroImage) && normalized.heroImage.length === 0))
            && normalized.extra_fields && normalized.extra_fields.heroImage) normalized.heroImage = normalized.extra_fields.heroImage;

        // parse list-like fields
        const keys = ["portfolio","avatar","heroImage","services","contact_cards"];
        keys.forEach((k) => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        // resolve images (gallery/portfolio/avatar/heroImage)
        const imageFields = ["portfolio","avatar","heroImage"];
        for (const field of imageFields) {
          if (!normalized[field]) continue;
          if (Array.isArray(normalized[field])) {
            const resolved = await Promise.all(normalized[field].slice(0, 6).map((v: any) => resolveImageValue(base, slug, field, v)));
            normalized[field] = resolved.filter(Boolean);
          } else if (typeof normalized[field] === "string") {
            normalized[field] = String(await resolveImageValue(base, slug, field, normalized[field]));
          }
        }

        // flatten avatar/hero if arrays
        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];
        if (Array.isArray(normalized.heroImage) && normalized.heroImage.length) normalized.heroImage = normalized.heroImage[0];
        if (Array.isArray(normalized.portfolio) && normalized.portfolio.length) normalized.portfolio = normalized.portfolio.slice(0, 6);

        console.log("Freelancer preview fetched normalized row:", normalized);
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

  return <FreelancerPreview data={data} showFooter={false} />;
}