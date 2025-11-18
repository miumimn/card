import React, { Suspense } from "react";
import DriverPreviewClient from "./DriverPreviewClient";

/**
 * Server page for /profile-preview/driver
 * Mounts the client wrapper inside Suspense so client-only hooks (useSearchParams)
 * run on the client and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <DriverPreviewClient />
    </Suspense>
  );
}