"use client";
import React, { Suspense } from "react";
import MakeupArtistPreviewClient from "./MakeupArtistPreviewClient";

/**
 * Server page for /profile-preview/makeup-artist
 * Do not include "use server" here — this should be a regular server component
 * that renders a client wrapper inside Suspense so useSearchParams runs on client.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <MakeupArtistPreviewClient />
    </Suspense>
  );
}