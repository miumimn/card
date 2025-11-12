"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import RealtorPreview from "@/app/templates-preview/RealtorPreview";

const STORAGE_BUCKET = "onboarding-uploads";

function parsePossibleList(val: any) {
  if (val == null) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return null;
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

export default function RealtorProfilePreviewPage() {
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

    async function resolveImage(base: string, slug: string, field: string, raw: any) {
      if (!raw) return null;
      const s = String(raw).trim();
      if (!s) return null;
      if (isFalsySentinel(s)) return null;
      if (looksLikeValidImageUrl(s) && await headOk(s)) return s;
      // skip local dev/profile-preview/null references
      if (s.includes("/null") || s.includes("localhost")) return null;

      // try to build public url
      const candidate = buildPublicUrl(base, slug, field, s);
      if (await headOk(candidate)) return candidate;

      // fallback: search storage prefix for a matching stored object
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
        console.warn("storage list fallback failed", err);
      }
      return null;
    }

    const fetchRow = async () => {
      setLoading(true); setError(null);
      try {
        const { data: fetched, error: fetchError } = await supabase.from("onboardings").select("*").eq("id", id).single();
        if (fetchError) { setError(fetchError.message || "Fetch failed"); setLoading(false); return; }
        let normalized: any = { ...(fetched ?? {}) };

        // merge extra_fields
        if (fetched?.extra_fields) {
          try {
            const parsed = typeof fetched.extra_fields === "string" ? JSON.parse(fetched.extra_fields || "{}") : fetched.extra_fields;
            if (parsed && typeof parsed === "object") Object.entries(parsed).forEach(([k, v]) => { if (normalized[k] === undefined) normalized[k] = v; });
          } catch {}
        }

        // normalize basic lists/fields
        const keys = ["avatar","hero_image","listings","socials","other_links"];
        keys.forEach(k => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        normalized.booking_contact = normalized.booking_contact ?? normalized.booking_link ?? normalized.profile_url ?? "";

        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "realtor";

        // resolve avatar/hero if needed
        const imageFields = ["avatar","hero_image"];
        for (const field of imageFields) {
          if (!normalized[field]) continue;
          if (Array.isArray(normalized[field])) {
            const resolved = await Promise.all(normalized[field].slice(0, 6).map((v:any) => resolveImage(base, slug, field, v)));
            const filtered = (resolved || []).filter(Boolean);
            normalized[field] = filtered.length ? filtered : "";
            if (Array.isArray(normalized[field]) && normalized[field].length === 1) normalized[field] = normalized[field][0];
          } else if (typeof normalized[field] === "string") {
            const r = await resolveImage(base, slug, field, normalized[field]);
            normalized[field] = r || "";
          }
        }

        // normalize socials if string
        if (normalized.socials && typeof normalized.socials === "string") {
          try { normalized.socials = JSON.parse(normalized.socials); } catch {}
        }

        // collect structured listings (listing1..6) and sanitize
        const collectedListings: any[] = [];
        for (let i = 1; i <= 6; i++) {
          const rawTitle = normalized[`listing${i}_title`];
          const rawPrice = normalized[`listing${i}_price`];
          const rawSubtitle = normalized[`listing${i}_subtitle`];
          const rawImage = normalized[`listing${i}_image`];

          const title = rawTitle ? String(rawTitle).trim() : "";
          const price = rawPrice ? String(rawPrice).trim() : "";
          const subtitle = rawSubtitle ? String(rawSubtitle).trim() : "";

          const hasText = !!(title && title !== "null" && title !== "undefined") || !!(price && price !== "null" && price !== "undefined") || !!(subtitle && subtitle !== "null" && subtitle !== "undefined");

          let imageUrl: string | null = null;
          if (rawImage) {
            const candidate = Array.isArray(rawImage) ? (rawImage[0] || "") : String(rawImage || "");
            if (!isFalsySentinel(candidate)) {
              imageUrl = await resolveImage(base, slug, `listing${i}_image`, candidate);
            }
            if (imageUrl && !looksLikeValidImageUrl(imageUrl)) {
              // last sanity check
              imageUrl = null;
            }
          }

          // skip empty/sentinel listing entries
          if (!hasText && !imageUrl) continue;

          collectedListings.push({
            title: title || "",
            price: price || "",
            subtitle: subtitle || "",
            image: imageUrl || ""
          });
        }

        // merge with any legacy normalized.listings, but sanitize both sides and only keep meaningful entries
        const sanitizeEntry = (it: any) => {
          if (!it) return null;
          const title = it.title ? String(it.title).trim() : "";
          const price = it.price ? String(it.price).trim() : "";
          const subtitle = it.subtitle ? String(it.subtitle).trim() : "";
          const image = it.image ? String(it.image).trim() : "";
          if (!title && !price && !subtitle && !image) return null;
          return { title, price, subtitle, image };
        };

        const legacy = Array.isArray(normalized.listings) ? normalized.listings.map(sanitizeEntry).filter(Boolean) : [];

        if (collectedListings.length) {
          normalized.listings = [...collectedListings, ...legacy].filter((it:any) => !!(it.title || it.price || it.subtitle || it.image));
        } else {
          normalized.listings = legacy.filter((it:any) => !!(it.title || it.price || it.subtitle || it.image));
        }

        // final cleanups
        if (Array.isArray(normalized.avatar) && normalized.avatar.length) normalized.avatar = normalized.avatar[0];
        if (Array.isArray(normalized.hero_image) && normalized.hero_image.length) normalized.hero_image = normalized.hero_image[0];

        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("Realtor preview fetched normalized row:", normalized);
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

  return <RealtorPreview data={row} showFooter={false} />;
}