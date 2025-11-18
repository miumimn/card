import React, { Suspense } from "react";
import ConstructionPreviewClient from "./ConstructionPreviewClient";

/**
 * Server page for /profile-preview/construction
 * Renders a client wrapper inside Suspense so client-only hooks (useSearchParams)
 * run on the client and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <ConstructionPreviewClient />
    </Suspense>
  );
}