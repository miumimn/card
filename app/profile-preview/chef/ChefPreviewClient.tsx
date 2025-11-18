"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ChefPreview from "@/app/templates-preview/ChefPreview";

export default function ChefPreviewClient() {
  const params = useParams(); // { slug }
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const slug = params?.slug ?? "";
  const id = searchParams.get("id");

  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No id provided in the URL.");
      return;
    }

    const fetchRow = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("onboardings")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Error fetching onboarding row:", fetchError);
          setError(fetchError.message || "Failed to fetch preview data.");
          setRow(null);
        } else {
          // Pass the DB row exactly as returned (no URL reconstruction)
          setRow(data);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching preview row:", err);
        setError(err?.message || "Unexpected error.");
        setRow(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRow();
  }, [id, supabase]);

  if (loading) return <p style={{ textAlign: "center", padding: 20 }}>Loading preview...</p>;
  if (error) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p style={{ color: "red", marginBottom: 12 }}>Error: {error}</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  if (!row) return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <p>No data found for preview.</p>
      <button onClick={() => router.back()} style={{ padding: 8, borderRadius: 8 }}>Go back</button>
    </div>
  );

  // Pass the DB row directly to the template preview. ChefPreview will only render fields actually present.
  return <ChefPreview data={row} showFooter={false} />;
}