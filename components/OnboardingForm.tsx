"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "url" | "email" | "tel" | "files" | "select";
  placeholder?: string;
  required?: boolean;
  maxFiles?: number;
  options?: string[];
  accept?: string;
  default?: any;
  help?: string;
};

export default function OnboardingForm({
  slug,
  fields,
  submitLabel = "Continue",
  chunkSize = 5,
}: {
  slug: string;
  fields: Field[];
  submitLabel?: string;
  chunkSize?: number;
}) {
  const router = useRouter();
  const supabaseClient = createClientComponentClient();

  // chunkSize is now configurable per form (Chef onboarding will pass 6 so product blocks remain grouped)
  const steps = useMemo(() => {
    const out: Field[][] = [];
    for (let i = 0; i < fields.length; i += chunkSize) {
      out.push(fields.slice(i, i + chunkSize));
    }
    if (out.length === 0) out.push([]);
    return out;
  }, [fields, chunkSize]);

  const initialState: Record<string, any> = {};
  fields.forEach((f) => {
    initialState[f.name] = f.type === "files" ? [] : f.default ?? "";
  });

  const [form, setForm] = useState<Record<string, any>>(initialState);
  const [fileMap, setFileMap] = useState<Record<string, File[]>>({});
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thumbnail previews (object URLs)
  const [thumbs, setThumbs] = useState<Record<string, string[]>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${slug}_onboard_draft`);
      if (raw) setForm((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {}
  }, [slug]);

  useEffect(() => {
    try {
      localStorage.setItem(`${slug}_onboard_draft`, JSON.stringify(form));
    } catch {}
  }, [form, slug]);

  useEffect(() => {
    return () => {
      Object.values(thumbs).flat().forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbs]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "file") return;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const files = e.target.files ? Array.from(e.target.files) : [];
    const fieldDef = fields.find((f) => f.name === name);
    const maxFiles = fieldDef?.maxFiles ?? 3;

    setFileMap((m) => {
      const current = m[name] ?? [];
      let nextFiles: File[];
      if (maxFiles <= 1) {
        nextFiles = files.slice(0, 1);
      } else {
        const byKey = new Map<string, File>();
        current.forEach((f) => byKey.set(f.name + "-" + (f.size ?? 0), f));
        for (const f of files) byKey.set(f.name + "-" + (f.size ?? 0), f);
        nextFiles = Array.from(byKey.values()).slice(0, maxFiles);
      }

      setThumbs((t) => {
        (t[name] || []).forEach((u) => URL.revokeObjectURL(u));
        const newThumbs = nextFiles.map((f) => URL.createObjectURL(f));
        return { ...t, [name]: newThumbs };
      });

      setForm((s) => ({ ...s, [name]: nextFiles.map((f) => f.name) }));
      return { ...m, [name]: nextFiles };
    });

    if (e.target) e.target.value = "";
  }

  // Upload files to Supabase storage and return public URLs per field.
  // Important: this uses getPublicUrl(uploadedPath) and stores that public URL,
  // so the DB receives the real public URL (the one that actually resolves).
  async function uploadFiles(): Promise<Record<string, string[]>> {
    const uploaded: Record<string, string[]> = {};
    const bucket = "onboarding-uploads";

    for (const [field, files] of Object.entries(fileMap)) {
      uploaded[field] = [];
      for (const file of files) {
        try {
          const ext = file.name.split(".").pop() ?? "bin";
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
          const path = `${slug}/${field}/${filename}`;

          const { data, error: upErr } = await supabaseClient.storage.from(bucket).upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

          if (upErr) {
            console.warn("Upload failed for", file.name, upErr);
            continue;
          }

          // Use SDK getPublicUrl to get the canonical public URL for the uploaded object.
          try {
            const { data: pubData, error: pubErr } = supabaseClient.storage.from(bucket).getPublicUrl(data.path);
            if (pubErr) {
              console.warn("getPublicUrl error", pubErr);
              const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
              if (base) {
                const encoded = data.path.split("/").map((s: string) => encodeURIComponent(s)).join("/");
                uploaded[field].push(`${base}/storage/v1/object/public/${bucket}/${encoded}`);
              }
            } else if (pubData?.publicUrl) {
              uploaded[field].push(pubData.publicUrl);
            } else {
              const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
              if (base) {
                const encoded = data.path.split("/").map((s: string) => encodeURIComponent(s)).join("/");
                uploaded[field].push(`${base}/storage/v1/object/public/${bucket}/${encoded}`);
              }
            }
          } catch (pubErr) {
            console.warn("getPublicUrl exception", pubErr);
            const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
            if (base) {
              const encoded = data.path.split("/").map((s: string) => encodeURIComponent(s)).join("/");
              uploaded[field].push(`${base}/storage/v1/object/public/${bucket}/${encoded}`);
            }
          }
        } catch (err) {
          console.error("Upload exception", err);
        }
      }
    }

    return uploaded;
  }

  function validateCurrentStep(): { ok: boolean; msg?: string } {
    const stepFields = steps[stepIndex];
    for (const f of stepFields) {
      if (f.required) {
        if (f.type === "files") {
          const files = fileMap[f.name] ?? [];
          if (!files.length) return { ok: false, msg: `${f.label} is required` };
        } else {
          const val = form[f.name];
          if (val === "" || val === undefined || val === null) return { ok: false, msg: `${f.label} is required` };
        }
      }
    }
    const cnt = Number(form.product_count || 0);
    if (Number.isFinite(cnt) && (cnt < 0 || cnt > 12)) return { ok: false, msg: "Product count out of range" };
    return { ok: true };
  }

  // Save to supabase: promote arrays (profile/portfolio/gallery) and store products as an array in extra_fields
  async function saveToSupabase(payload: any) {
    const coreFields = [
      "name",
      "email",
      "phone",
      "slug",
      "tagline",
      "bio",
      "specialty",
      "genre",
      "instagram",
      "twitter",
      "spotify",
      "website",
      "behance",
      "brandName",
    ];
    const main: Record<string, any> = {};
    const extra: Record<string, any> = {};

    // split into main and extra
    Object.entries(payload).forEach(([k, v]) => {
      if (coreFields.includes(k)) main[k] = v;
      else extra[k] = v;
    });

    // Promote common image arrays to top-level columns
    if (payload.profileImage && payload.profileImage.length) {
      main.profileImage = Array.isArray(payload.profileImage) ? payload.profileImage : [payload.profileImage];
    } else {
      main.profileImage = main.profileImage ?? [];
    }

    if (payload.portfolioImages && payload.portfolioImages.length) {
      main.portfolioImages = Array.isArray(payload.portfolioImages) ? payload.portfolioImages : [payload.portfolioImages];
    } else {
      main.portfolioImages = main.portfolioImages ?? [];
    }

    if (payload.galleryImages && payload.galleryImages.length) {
      main.galleryImages = Array.isArray(payload.galleryImages) ? payload.galleryImages : [payload.galleryImages];
    } else {
      main.galleryImages = main.galleryImages ?? [];
    }

    // collections
    if (payload.collection1 && payload.collection1.length) main.collection1 = Array.isArray(payload.collection1) ? payload.collection1 : [payload.collection1];
    if (payload.collection2 && payload.collection2.length) main.collection2 = Array.isArray(payload.collection2) ? payload.collection2 : [payload.collection2];

    // Gather product entries into an array and store in extra.products
    const productsArr: any[] = [];
    for (let i = 1; i <= 12; i++) {
      const name = payload[`product${i}_name`];
      const price = payload[`product${i}_price`];
      const desc = payload[`product${i}_desc`];
      let image = payload[`product${i}_image`];
      const category = payload[`product${i}_category`];
      const notes = payload[`product${i}_notes`];

      if (Array.isArray(image)) image = image[0] ?? "";
      if (name || price || desc || image || category || notes) {
        productsArr.push({ name: name ?? "", price: price ?? "", desc: desc ?? "", image: image ?? "", category: category ?? "", notes: notes ?? "" });
      }

      // ensure we don't carry these into extra as duplicates
      delete extra[`product${i}_name`];
      delete extra[`product${i}_price`];
      delete extra[`product${i}_desc`];
      delete extra[`product${i}_image`];
      delete extra[`product${i}_category`];
      delete extra[`product${i}_notes`];
    }

    // If the payload already provided a products array, merge with collected ones
    if (Array.isArray(payload.products) && payload.products.length) {
      const combined = [...payload.products, ...productsArr];
      const dedup: any[] = [];
      const seen = new Set<string>();
      for (const p of combined) {
        const key = `${String(p.name || "")}|${String(p.price || "")}|${String(p.image || "")}`;
        if (!seen.has(key)) {
          dedup.push(p);
          seen.add(key);
        }
      }
      extra.products = dedup;
    } else if (productsArr.length) {
      extra.products = productsArr;
    }

    // Remove any promoted keys from extra to avoid duplicates
    delete extra.profileImage;
    delete extra.portfolioImages;
    delete extra.galleryImages;
    delete extra.collection1;
    delete extra.collection2;
    delete extra.works;

    const finalPayload = { ...main, slug, extra_fields: extra };

    const { data, error } = await supabaseClient.from("onboardings").insert([finalPayload]).select().single();
    if (error) throw error;
    return data;
  }

  async function handleFinalSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Upload all files and get canonical public URLs from storage SDK
      const uploaded = await uploadFiles();

      // Start with a shallow copy of the current form values
      const payload: Record<string, any> = { ...form };

      // Prefer uploaded public URLs for file fields and gallery/portfolio rather than leaving original filenames from `form`.
      if (Array.isArray(uploaded.profileImage) && uploaded.profileImage.length) {
        payload.profileImage = uploaded.profileImage;
      }

      // Collect works/portfolio/gallery uploads from any of the known keys.
      const worksKeys = ["portfolioImages", "portfolio_images", "works", "gallery", "galleryImages", "images", "collection_images", "collection"];
      const collectedWorks: string[] = [];

      for (const k of worksKeys) {
        // prefer uploaded results (these are canonical public URLs)
        if (Array.isArray(uploaded[k]) && uploaded[k].length) {
          collectedWorks.push(...uploaded[k]);
        }

        // also include any payload arrays/URLs (but avoid original filenames if we have uploaded URLs)
        const pVal = payload[k];
        if (pVal) {
          if (Array.isArray(pVal)) {
            for (const v of pVal) {
              // only include if v already looks like a public url
              if (typeof v === "string" && /^https?:\/\//.test(v)) collectedWorks.push(v);
            }
          } else if (typeof pVal === "string" && /^https?:\/\//.test(pVal)) {
            collectedWorks.push(pVal);
          }
        }
      }

      // Dedupe and prefer uploaded urls; if we have any uploaded urls, they will be used.
      if (collectedWorks.length) {
        payload.portfolioImages = Array.from(new Set(collectedWorks));
      } else {
        // if no uploaded urls were found, fallback to any existing payload arrays/urls but filter out bare filenames
        const fallbackWorks: string[] = [];
        for (const k of worksKeys) {
          const pVal = payload[k];
          if (!pVal) continue;
          if (Array.isArray(pVal)) {
            for (const v of pVal) {
              if (typeof v === "string" && /^https?:\/\//.test(v)) fallbackWorks.push(v);
            }
          } else if (typeof pVal === "string" && /^https?:\/\//.test(pVal)) {
            fallbackWorks.push(pVal);
          }
        }
        if (fallbackWorks.length) payload.portfolioImages = Array.from(new Set(fallbackWorks));
      }

      // Also map product images (single) from uploads if present
      for (let i = 1; i <= 12; i++) {
        const key = `product${i}_image`;
        if (Array.isArray(uploaded[key]) && uploaded[key].length) {
          payload[key] = uploaded[key][0];
        }
      }

      // Keep other uploaded fields: for each uploaded field not already promoted above, set the payload to the uploaded urls.
      for (const [k, urls] of Object.entries(uploaded)) {
        if (!urls || !urls.length) continue;
        // skip ones we've already applied
        if (k === "profileImage" || worksKeys.includes(k) || k.startsWith("product")) continue;

        const fieldDef = fields.find((f) => f.name === k);
        if (fieldDef?.maxFiles === 1) payload[k] = Array.isArray(urls) && urls.length ? urls[0] : "";
        else payload[k] = urls;
      }

      // Normalize booking_contact: auto-prefix tel: for phone-like values
      if (payload["booking_contact"] && typeof payload["booking_contact"] === "string") {
        const candidate = String(payload["booking_contact"]).trim();
        const cleaned = candidate.replace(/[()\s.-]/g, "");
        if (/^\+?\d{6,}$/.test(cleaned) && !candidate.startsWith("tel:") && !candidate.startsWith("http")) {
          payload["booking_contact"] = `tel:${cleaned}`;
        }
      }

      // Save debug preview to localStorage
      localStorage.setItem(`${slug}_onboard_saved`, JSON.stringify(payload));

      // Insert record -> saveToSupabase promotes portfolioImages/profileImage into top-level jsonb columns
      const record = await saveToSupabase(payload);

      localStorage.setItem(`${slug}_onboard_saved_record`, JSON.stringify(record));
      router.push(`/profile-preview/${slug}?id=${record.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save onboarding data");
    } finally {
      setLoading(false);
    }
  }

  function onNext() {
    const v = validateCurrentStep();
    if (!v.ok) {
      setError(v.msg || "Validation error");
      return;
    }
    setError(null);
    if (stepIndex < steps.length - 1) setStepIndex((s) => s + 1);
    else handleFinalSubmit();
  }

  function onBack() {
    setError(null);
    if (stepIndex > 0) setStepIndex((s) => s - 1);
    else router.push("/templates-preview");
  }

  const currentFields = steps[stepIndex];

  return (
    <main style={{ minHeight: "100vh", padding: 16, background: "var(--bg)", color: "var(--text)", fontFamily: "Inter, system-ui" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--text)" }}>
              {slug.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ")} — Onboarding
            </h1>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{`Step ${stepIndex + 1} of ${steps.length}`}</div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(`${slug}_onboard_draft`);
              router.push(`/templates-preview/${slug}`);
            }}
            style={{ padding: "8px 10px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text)" }}
          >
            Cancel
          </button>
        </div>

        <div style={{ height: 8, width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ width: `${Math.round(((stepIndex + 1) / steps.length) * 100)}%`, height: "100%", background: "linear-gradient(90deg,var(--accent),var(--accent-2))" }} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onNext(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{`Step ${stepIndex + 1}`}</h2>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{currentFields.length ? "Fill the following fields" : "No fields for this step"}</p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {currentFields.map((f) => {
              if (f.type === "textarea")
                return (
                  <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{f.label}</span>
                    <textarea
                      name={f.name}
                      value={form[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={handleChange}
                      rows={4}
                      required={f.required}
                      style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "var(--card)", color: "var(--text)" }}
                    />
                  </label>
                );

              if (f.type === "files") {
                const isMultiple = (f.maxFiles ?? 3) > 1;
                const currentThumbs = thumbs[f.name] || [];
                return (
                  <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{f.label}</span>
                    <input
                      name={f.name}
                      type="file"
                      accept={f.accept ?? "image/*,video/*"}
                      multiple={isMultiple}
                      onChange={handleFilesChange}
                      style={{ padding: 6, color: "var(--text)" }}
                    />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                      {currentThumbs.map((url, i) => (
                        <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: "var(--card)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={url} alt={f.name + "-" + i} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      ))}
                    </div>
                    <small style={{ color: "var(--muted)" }}>Max files: {f.maxFiles ?? 3}</small>
                  </label>
                );
              }

              if (f.type === "select")
                return (
                  <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>{f.label}</span>
                    <select
                      name={f.name}
                      value={form[f.name] ?? ""}
                      onChange={handleChange}
                      required={f.required}
                      style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "var(--card)", color: "var(--text)" }}
                    >
                      <option value="">Choose...</option>
                      {f.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                );

              return (
                <label key={f.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>{f.label}</span>
                  <input
                    name={f.name}
                    type={f.type ?? "text"}
                    value={form[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={handleChange}
                    required={f.required}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "var(--card)", color: "var(--text)" }}
                  />
                </label>
              );
            })}
          </div>

          {error && <div style={{ color: "#ffb3b3", fontWeight: 700 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <button type="button" onClick={onBack} style={{ padding: "10px 14px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text)" }}>
              {stepIndex === 0 ? "Cancel" : "Back"}
            </button>

            <button type="submit" disabled={loading} style={{ padding: "10px 16px", borderRadius: 10, background: "linear-gradient(90deg,var(--accent),var(--accent-2))", color: "#fff", fontWeight: 800 }}>
              {loading ? "Saving..." : stepIndex < steps.length - 1 ? "Next" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}