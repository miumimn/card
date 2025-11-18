import React, { Suspense } from "react";
import MusicianPreviewClient from "./MusicianPreviewClient";

/**
 * Server page for /profile-preview/musician
 * Mounts the client wrapper inside Suspense so client-only hooks (useSearchParams)
 * run in the browser and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <MusicianPreviewClient />
    </Suspense>
  );
}