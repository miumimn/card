"use client";
import React, { Suspense } from "react";
import ArtistPreviewClient from "./ArtistPreviewClient";

/**
 * Server page for /profile-preview/artist
 * NOTE: Do NOT use "use server" here — leave this as a normal server component
 * that mounts the client wrapper inside Suspense. Keeping "use server" here
 * made Next treat the export as a Server Action and require an async function.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <ArtistPreviewClient />
    </Suspense>
  );
}