"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import EventPlannerPreview from "@/app/templates-preview/EventPlannerPreview";

const STORAGE_BUCKET = "onboarding-uploads";

function parsePossibleList(val: any) {
  if (val == null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p) || typeof p === "object") return p;
    } catch {}
    if (s.includes("\n")) return s.split("\n").map(l => l.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(l => l.trim()).filter(Boolean);
    return [s];
  }
  return null;
}

function isFalsySentinel(s?: string) {
  if (!s) return true;
  const v = String(s).trim().toLowerCase();
  if (!v) return true;
  if (v === "null" || v === "undefined") return true;
  if (/^0+$/.test(v)) return true;
  return false;
}

function looksLikeValidHttpUrl(s?: string) {
  if (!s) return false;
  const v = String(s).trim();
  if (!v) return false;
  if (!/^https?:\/\//i.test(v)) return false;
  if (v.includes("/null") || v.includes("localhost")) return false;
  return true;
}

export default function EventPlannerProfilePreviewPage() {
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

    async function resolveImage(base: string, slug: string, field: string, raw: any) {
      if (!raw) return null;
      const s = String(raw).trim();
      if (!s) return null;
      if (isFalsySentinel(s)) return null;

      // If s already looks like a valid https URL, keep it (don't gate on HEAD)
      if (looksLikeValidHttpUrl(s)) {
        // Prefer canonical storage urls but keep s even if HEAD fails (some hosts block HEAD)
        return s;
      }

      // Build candidate public url from path/name and return it if reachable
      const candidate = buildPublicUrl(base, slug, field, s);
      try {
        if (await headOk(candidate)) return candidate;
      } catch {}

      // Fallback: list storage prefix and try to match stored objects by name
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
            // getPublicUrl returns an object shaped like { data: { publicUrl: string } }
            const res = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
            const publicUrl = (res && (res as any).data && (res as any).data.publicUrl) || (res && (res as any).publicURL) || "";
            if (publicUrl) return publicUrl;
          }
        }
      } catch (err) {
        console.warn("storage list fallback failed", err);
      }

      // nothing resolved
      return null;
    }

    const fetchRow = async () => {
      setLoading(true); setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase.from("onboardings").select("*").eq("id", id).single();
        if (fetchError) { setError(fetchError.message || "Fetch failed"); setLoading(false); return; }
        let normalized: any = { ...(fetched ?? {}) };

        // merge extra_fields into top-level when missing
        if (fetched?.extra_fields) {
          try {
            const parsed = typeof fetched.extra_fields === "string" ? JSON.parse(fetched.extra_fields || "{}") : fetched.extra_fields;
            if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (normalized[k] === undefined) normalized[k] = v; });
          } catch {}
        }

        // normalize possible gallery keys (support legacy names)
        const galleryCandidates = [
          "gallery",
          "galleryImages",
          "gallery_images",
          "portfolioImages",
          "portfolio_images",
          "images",
          "photos",
        ];
        let rawGalleryValues: any[] = [];
        for (const k of galleryCandidates) {
          const v = normalized[k];
          if (v) {
            const p = parsePossibleList(v);
            if (p) rawGalleryValues = rawGalleryValues.concat(p);
          }
        }
        // remove duplicates and falsy sentinels
        rawGalleryValues = Array.from(new Set(rawGalleryValues.map((x:any) => String(x).trim()))).filter((x:any) => !!x && !isFalsySentinel(x));

        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "event-planner";

        // Resolve each gallery candidate (but keep https urls even if unreachable by HEAD)
        const resolvedGallery: string[] = [];
        for (const val of rawGalleryValues) {
          const resolved = await resolveImage(base, slug, "gallery", val);
          if (resolved) resolvedGallery.push(resolved);
        }

        normalized.gallery = resolvedGallery;

        // Normalize other list-like fields
        const listKeys = ["packages", "checklist", "contact_cards", "other_links"];
        listKeys.forEach(k => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        normalized.booking_link = normalized.booking_link ?? normalized.booking_contact ?? normalized.profile_url ?? "";

        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("EventPlanner preview normalized row:", normalized);
        }

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

  return <EventPlannerPreview data={row} showFooter={false} />;
}