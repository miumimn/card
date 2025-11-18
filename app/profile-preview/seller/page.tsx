import React, { Suspense } from "react";
import SellerPreviewClient from "./SellerPreviewClient";

/**
 * Server page for /profile-preview/seller
 * Renders the client wrapper inside Suspense so client-only hooks (useSearchParams)
 * run on the client and do not cause CSR bailout errors during prerender.
 */
export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <SellerPreviewClient />
    </Suspense>
  );
}