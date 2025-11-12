"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import VideographerPreview from "@/app/templates-preview/VideographerPreview";

const STORAGE_BUCKET = "onboarding-uploads";

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

function isFalsySentinel(s?: string) {
  if (!s) return true;
  const v = String(s).trim().toLowerCase();
  if (!v) return true;
  if (v === "null" || v === "undefined") return true;
  if (/^0+$/.test(v)) return true;
  return false;
}
function looksLikeValidImageUrl(s?: string) {
  if (!s) return false;
  const v = String(s).trim();
  if (!v) return false;
  if (!/^https?:\/\//i.test(v)) return false;
  if (v.includes("/null") || v.endsWith("/null")) return false;
  if (v.includes("localhost")) return false;
  return true;
}

export default function VideographerProfilePreviewPage() {
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

    const buildPublicUrl = (base: string, slug: string, field: string, filename: string) => {
      if (!base) return filename;
      if (!filename) return filename;
      try {
        if (/^https?:\/\//.test(filename)) return filename;
      } catch {}
      let path = filename;
      if (!filename.includes("/")) path = `${slug}/${field}/${filename}`;
      path = path.replace(/^\/+|\/+$/g, "");
      const encoded = path.split("/").map(encodeURIComponent).join("/");
      return `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${encoded}`;
    };

    const resolveImage = async (base: string, slug: string, field: string, raw: any) => {
      if (!raw) return null;
      const s = String(raw).trim();
      if (!s) return null;
      if (isFalsySentinel(s)) return null;
      if (looksLikeValidImageUrl(s) && await headOk(s)) return s;
      if (s.includes("/null") || s.includes("localhost")) return null;
      const candidate = buildPublicUrl(base, slug, field, s);
      if (await headOk(candidate)) return candidate;
      // fallback: list storage
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
      } catch (err) { console.warn("storage list fallback failed", err); }
      return null;
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

        // normalize lists/fields
        const keys = ["avatar","portfolio_images","portfolio_videos","showreel","services","other_links"];
        keys.forEach(k => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        normalized.booking_contact = normalized.booking_contact ?? normalized.booking_link ?? normalized.profile_url ?? "";

        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "videographer";

        // resolve avatar / portfolio_images to public urls
        if (normalized.avatar) {
          if (Array.isArray(normalized.avatar)) {
            const resolved = await Promise.all(normalized.avatar.slice(0, 6).map((v:any) => resolveImage(base, slug, "avatar", v)));
            normalized.avatar = (resolved || []).filter(Boolean);
            if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];
          } else {
            const r = await resolveImage(base, slug, "avatar", normalized.avatar);
            normalized.avatar = r || "";
          }
        }

        if (normalized.portfolio_images) {
          const arr = Array.isArray(normalized.portfolio_images) ? normalized.portfolio_images : [normalized.portfolio_images];
          const resolved = await Promise.all(arr.slice(0, 12).map((v:any) => resolveImage(base, slug, "portfolio_images", v)));
          normalized.portfolio_images = (resolved || []).filter(Boolean);
        } else {
          normalized.portfolio_images = [];
        }

        // portfolio_videos and showreel: prefer full https links, sanitize
        const normalizeVideoList = (val:any) => {
          if (!val) return [];
          if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(s => s && !s.includes("/null") && /^https?:\/\//i.test(s));
          if (typeof val === "string") {
            const s = val.trim();
            try {
              const parsed = JSON.parse(s);
              if (Array.isArray(parsed)) return parsed.map(String).map(s2 => s2.trim()).filter(s2 => s2 && /^https?:\/\//i.test(s2));
            } catch {}
            if (s.includes("\n")) return s.split("\n").map((x:any) => x.trim()).filter((x:any) => x && /^https?:\/\//i.test(x));
            if (s.includes(",")) return s.split(",").map((x:any) => x.trim()).filter((x:any) => x && /^https?:\/\//i.test(x));
            return /^https?:\/\//i.test(s) ? [s] : [];
          }
          return [];
        };

        normalized.portfolio_videos = normalizeVideoList(normalized.portfolio_videos ?? normalized.extra_fields?.portfolio_videos);
        normalized.showreel = normalizeVideoList(normalized.showreel ?? normalized.extra_fields?.showreel)[0] ?? "";

        if (normalized.services && typeof normalized.services === "string") {
          const s = normalized.services.trim();
          if (s.includes("\n")) normalized.services = s.split("\n").map((x:string) => x.trim()).filter(Boolean);
          else if (s.includes(",")) normalized.services = s.split(",").map((x:string) => x.trim()).filter(Boolean);
          else normalized.services = [s];
        }

        // final sanitize: remove any empty/sentinel entries in listings
        normalized.portfolio_images = (normalized.portfolio_images || []).filter((u:string) => !!u && !u.includes("/null") && /^https?:\/\//i.test(u));
        normalized.portfolio_videos = (normalized.portfolio_videos || []).filter((u:string) => !!u && !u.includes("/null") && /^https?:\/\//i.test(u));

        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("Videographer preview fetched normalized row:", normalized);
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

  return <VideographerPreview data={row} showFooter={false} />;
}