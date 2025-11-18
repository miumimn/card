import React, { Suspense } from "react";
import ChefPreviewClient from "./ChefPreviewClient";

/**
 * Server page for /profile-preview/chef
 * Renders a client wrapper inside Suspense so client-only hooks (useSearchParams, useParams)
 * run on the client and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <ChefPreviewClient />
    </Suspense>
  );
}