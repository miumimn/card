import React, { Suspense } from "react";
import ContentCreatorPreviewClient from "./ContentCreatorPreviewClient";

export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", padding: 20 }}>Loading preview…</p>}>
      <ContentCreatorPreviewClient />
    </Suspense>
  );
}