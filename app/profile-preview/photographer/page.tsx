import React, { Suspense } from "react";
import PhotographerPreviewClient from "./PhotographerPreviewClient";

/**
 * Server page for /profile-preview/photographer
 * Mounts the client wrapper in Suspense so client-only hooks (useSearchParams)
 * run on the client and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <PhotographerPreviewClient />
    </Suspense>
  );
}