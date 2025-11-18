"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ConstructionPreview from "@/app/templates-preview/constructionPreview";

const STORAGE_BUCKET = "onboarding-uploads";

function buildPublicUrl(base: string, slug: string, field: string, filename: string) {
  if (!base) return filename;
  const path = `${slug}/${field}/${filename}`;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeURIComponent(path)}`;
}

export default function ConstructionPreviewClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const id = searchParams.get("id");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<any>(null);

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
        if (s.includes("\n")) return s.split("\n").map((l) => l.trim()).filter(Boolean);
        if (s.includes(",")) return s.split(",").map((l) => l.trim()).filter(Boolean);
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
            Object.entries(parsed).forEach(([k, v]) => {
              if (out[k] === undefined) out[k] = v;
            });
          }
        } catch {}
      }

      // added service_list and serviceList so onboarding textarea names are parsed
      const keys = [
        "profileImage",
        "heroImage",
        "portfolioImages",
        "galleryImages",
        "projects",
        "services",
        "service_list",
        "serviceList",
        "projects_list",
        "project_list",
        "city",
        "area",
        "projectPhotos",
        "portfolio"
      ];
      keys.forEach((k) => {
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
          console.error(fetchError);
          setError(fetchError.message || "Error fetching data");
          setLoading(false);
          return;
        }

        let normalized = normalizeRow(fetched);
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const slug = normalized.slug || "construction-contractor";

        // prefer extra_fields.projectPhotos => portfolioImages when portfolioImages empty
        if ((!normalized.portfolioImages || (Array.isArray(normalized.portfolioImages) && normalized.portfolioImages.length === 0))
            && normalized.projectPhotos && Array.isArray(normalized.projectPhotos) && normalized.projectPhotos.length) {
          normalized.portfolioImages = normalized.projectPhotos.slice();
        }

        // Also map extra_fields.portfolio (if present and portfolioImages empty)
        if ((!normalized.portfolioImages || (Array.isArray(normalized.portfolioImages) && normalized.portfolioImages.length === 0))
            && normalized.portfolio && typeof normalized.portfolio === "string") {
          const parts = normalized.portfolio.includes("\n")
            ? normalized.portfolio.split("\n").map((s: string) => s.trim()).filter(Boolean)
            : normalized.portfolio.split(",").map((s: string) => s.trim()).filter(Boolean);
          if (parts.length) normalized.portfolioImages = parts;
        }

        // If profileImage is missing top-level but exists in extra_fields, pull it up
        if ((!normalized.profileImage || (Array.isArray(normalized.profileImage) && normalized.profileImage.length === 0))
             && normalized.extra_fields && normalized.extra_fields.profileImage) {
          normalized.profileImage = normalized.extra_fields.profileImage;
        }

        // resolve images filenames -> public URLs for known image fields
        const imageFields = ["profileImage","heroImage","portfolioImages","galleryImages","projectPhotos"];
        imageFields.forEach((field) => {
          if (normalized[field]) {
            if (Array.isArray(normalized[field])) {
              normalized[field] = normalized[field].map((v: any) => {
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

        // ensure extra_fields.projects images resolve
        if (normalized.extra_fields && Array.isArray(normalized.extra_fields.projects)) {
          normalized.extra_fields.projects = normalized.extra_fields.projects.map((p: any) => {
            const copy = { ...p };
            if (copy.image && typeof copy.image === "string" && !/^https?:\/\//.test(copy.image)) {
              copy.image = buildPublicUrl(base, slug, "projects", copy.image);
            }
            return copy;
          });
        }

        // If portfolioImages now populated from projectPhotos, also ensure any URLs are in portfolioImages
        if (normalized.projectPhotos && Array.isArray(normalized.projectPhotos) && Array.isArray(normalized.portfolioImages)) {
          const mergedImgs = [...normalized.portfolioImages, ...normalized.projectPhotos];
          normalized.portfolioImages = Array.from(new Set(mergedImgs));
        }

        // --- NEW: normalize service_list (textarea) into normalized.services
        if ((!normalized.services || (Array.isArray(normalized.services) && normalized.services.length === 0))
            && (normalized.service_list || normalized.serviceList)) {
          const raw = normalized.service_list ?? normalized.serviceList;
          if (Array.isArray(raw)) {
            normalized.services = raw.slice();
          } else if (typeof raw === "string") {
            // prefer newline split, fall back to comma
            normalized.services = raw.includes("\n")
              ? raw.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : raw.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
        }

        // --- NEW: ensure normalized.logo is populated with the resolved profileImage (public URL)
        if (!normalized.logo) {
          // prefer resolved profileImage (could be string or array)
          if (normalized.profileImage) {
            if (Array.isArray(normalized.profileImage) && normalized.profileImage.length) {
              normalized.logo = normalized.profileImage[0];
            } else if (typeof normalized.profileImage === "string" && normalized.profileImage) {
              normalized.logo = normalized.profileImage;
            }
          }
          // fallback to brandLogo or logo fields if present
          if (!normalized.logo && normalized.brandLogo) {
            if (Array.isArray(normalized.brandLogo)) normalized.logo = normalized.brandLogo[0];
            else if (typeof normalized.brandLogo === "string") normalized.logo = normalized.brandLogo;
          }
          // extra_fields fallbacks
          if (!normalized.logo && normalized.extra_fields) {
            const ef = normalized.extra_fields;
            if (ef.logo) normalized.logo = Array.isArray(ef.logo) ? ef.logo[0] : ef.logo;
            if (!normalized.logo && ef.profileImage) normalized.logo = Array.isArray(ef.profileImage) ? ef.profileImage[0] : ef.profileImage;
          }
        }

        // final fallback: if still no company but email exists, use local-part (keeps preview from being empty)
        if ((!normalized.company || !String(normalized.company).trim()) && normalized.email) {
          const local = String(normalized.email).split("@")[0];
          if (local && local.trim()) normalized.company = local.trim();
        }
        if (!normalized.brandName && normalized.company) normalized.brandName = normalized.company;

        setData(normalized);

        // geocode city/area to show a map if desired
        const queryParts: string[] = [];
        if (normalized.city) queryParts.push(Array.isArray(normalized.city) ? normalized.city.join(", ") : normalized.city);
        if (normalized.area) queryParts.push(Array.isArray(normalized.area) ? normalized.area.join(", ") : normalized.area);
        const query = queryParts.join(", ").trim();

        if (query) {
          try {
            // remove custom headers; browser will block User-Agent
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
            const resp = await fetch(url);
            if (!resp.ok) {
              console.warn("Geocode returned non-ok response:", resp.status, resp.statusText);
              setGeo(null);
            } else {
              const results = await resp.json();
              if (Array.isArray(results) && results.length) {
                const r = results[0];
                setGeo({ lat: Number(r.lat), lon: Number(r.lon), display_name: r.display_name });
              } else {
                setGeo(null);
              }
            }
          } catch (err) {
            console.warn("geocode failed", err);
            setGeo(null);
          }
        } else setGeo(null);

      } catch (err) {
        console.error("unexpected error", err);
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
      <p>No construction data found.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  // pass showFooter=false so "Use this template" is hidden on preview page
  return <ConstructionPreview data={data} showFooter={false} />;
}