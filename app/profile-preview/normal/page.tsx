import React, { Suspense } from "react";
import NormalProfilePreviewClient from "./NormalProfilePreviewClient";

/**
 * Server page for /profile-preview/normal
 * Renders a client wrapper inside Suspense so client-only hooks (useSearchParams)
 * run on the client and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <NormalProfilePreviewClient />
    </Suspense>
  );
}