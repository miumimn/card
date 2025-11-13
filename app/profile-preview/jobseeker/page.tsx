"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import JobSeekerPreview from "@/app/templates-preview/JobSeekerPreview";

const STORAGE_BUCKET = "onboarding-uploads";

function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
  if (!base) return filename;
  if (!filename) return filename;
  try {
    if (/^https?:\/\//.test(filename)) {
      const url = new URL(filename);
      const m = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)$/);
      if (m) {
        const decoded = decodeURIComponent(m[1]);
        const segments = decoded.split("/").map((s) => encodeURIComponent(s));
        return `${url.origin}/storage/v1/object/public/${segments.join("/")}`;
      }
      return filename;
    }
  } catch {}
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
    try { const p = JSON.parse(s); if (Array.isArray(p) || typeof p === "object") return p; } catch {}
    if (s.includes("\n")) return s.split("\n").map(l => l.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(l => l.trim()).filter(Boolean);
    return [s];
  }
  return null;
}

export default function JobSeekerProfilePreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const id = searchParams.get("id");
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); setError("No id provided."); return; }

    async function headOk(url?: string) {
      if (!url) return false;
      try { const r = await fetch(url, { method: "HEAD" }); return r.ok; } catch { return false; }
    }

    const resolve = async (base: string, slug: string, field: string, raw: any) => {
      if (!raw) return null;
      const s = String(raw).trim();
      if (!s) return null;
      if (/^https?:\/\//.test(s)) {
        const norm = buildPublicUrl(base, slug, field, s);
        if (await headOk(norm)) return norm;
        return norm;
      }
      const candidate = buildPublicUrl(base, slug, field, s);
      if (await headOk(candidate)) return candidate;

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
            // Safely read getPublicUrl result — SDK versions vary in shape
            const res = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path) as any;
            const publicUrl = (res && res.data && (res.data.publicUrl || res.data.publicURL)) || res?.publicURL || "";
            if (publicUrl) {
              if (await headOk(publicUrl)) return publicUrl;
              return publicUrl;
            }
          }
        }
      } catch (err) {
        console.warn("list fallback failed", err);
      }

      return candidate;
    };

    const fetchRow = async () => {
      setLoading(true); setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase.from("onboardings").select("*").eq("id", id).single();
        if (fetchError) { setError(fetchError.message || "Fetch failed"); setLoading(false); return; }
        let normalized: any = { ...(fetched ?? {}) };
        if (fetched?.extra_fields) {
          try {
            const parsed = typeof fetched.extra_fields === "string" ? JSON.parse(fetched.extra_fields || "{}") : fetched.extra_fields;
            if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (normalized[k] === undefined) normalized[k] = v; });
          } catch {}
        }

        const keys = ["portfolio","avatar","heroImage","experience","projects","cv"];
        keys.forEach(k => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "jobseeker";

        const imageFields = ["portfolio","avatar","heroImage","cv"];
        for (const field of imageFields) {
          if (!normalized[field]) continue;
          if (Array.isArray(normalized[field])) {
            const resolved = await Promise.all(normalized[field].slice(0, 12).map((v: any) => resolve(base, slug, field, v)));
            normalized[field] = resolved.filter(Boolean);
          } else if (typeof normalized[field] === "string") {
            normalized[field] = String(await resolve(base, slug, field, normalized[field]));
          }
        }

        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];
        if (Array.isArray(normalized.heroImage) && normalized.heroImage.length) normalized.heroImage = normalized.heroImage[0];
        if (Array.isArray(normalized.portfolio) && normalized.portfolio.length) normalized.portfolio = normalized.portfolio.slice(0, 12);
        if (Array.isArray(normalized.cv) && normalized.cv.length) normalized.cv = normalized.cv[0];

        console.log("Jobseeker preview fetched normalized row:", normalized);
        setRow(normalized);
      } catch (err: any) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchRow();
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

  return <JobSeekerPreview data={row} showFooter={false} />;
}