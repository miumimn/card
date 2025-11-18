"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SellerPreview from "@/app/templates-preview/SellerPreview";

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
  if (v.includes("/null") || v.includes("localhost")) return false;
  return true;
}

export default function SellerPreviewClient() {
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
      // fallback: list storage folder
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
            // SAFE: do not destructure; SDK shape varies across versions
            const res = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path) as any;
            const publicUrl =
              (res && res.data && (res.data.publicUrl || res.data.publicURL)) ||
              res?.publicURL ||
              res?.publicUrl ||
              "";
            if (publicUrl) {
              if (await headOk(publicUrl)) return publicUrl;
              return publicUrl;
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

        // normalize simple lists and new fields
        const keys = ["avatar","profile_url","other_links","owner_name","opening_hours","address"];
        keys.forEach(k => {
          if (normalized[k] !== undefined && normalized[k] !== null) {
            const p = parsePossibleList(normalized[k]);
            if (p !== null) normalized[k] = p;
          }
        });

        normalized.booking_contact = normalized.booking_contact ?? normalized.booking_link ?? normalized.profile_url ?? "";

        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "seller";

        // resolve avatar
        if (normalized.avatar) {
          if (Array.isArray(normalized.avatar)) {
            const resolved = await Promise.all(normalized.avatar.slice(0, 6).map((v:any) => resolveImage(base, slug, "avatar", v)));
            const filtered = (resolved || []).filter(Boolean);
            normalized.avatar = filtered.length ? filtered[0] : "";
          } else {
            const r = await resolveImage(base, slug, "avatar", normalized.avatar);
            normalized.avatar = r || "";
          }
        }

        // collect structured product listings (listing1..listing8)
        const products: any[] = [];
        for (let i = 1; i <= 8; i++) {
          const rawTitle = normalized[`listing${i}_title`];
          const rawPrice = normalized[`listing${i}_price`];
          const rawDesc = normalized[`listing${i}_desc`];
          const rawImage = normalized[`listing${i}_image`];

          const title = rawTitle ? String(rawTitle).trim() : "";
          const price = rawPrice ? String(rawPrice).trim() : "";
          const desc = rawDesc ? String(rawDesc).trim() : "";

          let imageUrl: string | null = null;
          if (rawImage) {
            const candidate = Array.isArray(rawImage) ? (rawImage[0] || "") : String(rawImage || "");
            if (!isFalsySentinel(candidate)) {
              imageUrl = await resolveImage(base, slug, `listing${i}_image`, candidate);
            }
          }

          const hasText = !!(title || price || desc);
          if (!hasText && !imageUrl) continue;

          products.push({ title, price, desc, image: imageUrl || "" });
        }

        // Also accept legacy normalized.listings array (JSON) and sanitize it
        let legacy = [];
        if (normalized.listings) {
          const p = parsePossibleList(normalized.listings);
          if (p) {
            legacy = p.map((it:any) => (typeof it === "string" ? { title: it } : it))
              .map((it:any) => ({ title: it.title ?? "", price: it.price ?? "", desc: it.desc ?? it.description ?? "", image: it.image ?? "" }))
              .filter((it:any) => !!(it.title || it.price || it.desc || it.image));
          }
        }

        normalized.listings = products.length ? [...products, ...legacy] : legacy;

        // remove any sentinel images from listings
        normalized.listings = (normalized.listings || []).filter((it:any) => {
          if (!it) return false;
          if (!it.title && !it.price && !it.desc && !it.image) return false;
          if (it.image && (it.image.includes("/null") || it.image.includes("localhost"))) {
            // keep only if has text
            return !!(it.title || it.price || it.desc);
          }
          return true;
        });

        // Final: prefer owner_name/opening_hours/address from top-level or extra_fields
        normalized.owner_name = normalized.owner_name ?? normalized.extra_fields?.owner_name ?? "";
        normalized.opening_hours = normalized.opening_hours ?? normalized.extra_fields?.opening_hours ?? "";
        normalized.address = normalized.address ?? normalized.extra_fields?.address ?? "";

        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log("Seller preview normalized row:", normalized);
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

  return <SellerPreview data={row} showFooter={false} />;
}