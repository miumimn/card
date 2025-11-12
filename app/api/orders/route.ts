import { NextResponse } from "next/server";

/**
 * POST /api/orders
 * - Expects JSON body describing the order
 * - Uses GOOGLE_SCRIPT_URL env var OR NEXT_GOOGLE_SCRIPT_URL OR accepts a "scriptUrl" field in the request body as fallback (dev only)
 * - Returns JSON { ok, orderId, scriptResponse, error }
 */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(async () => {
      // fallback: try to parse urlencoded/form data
      const txt = await request.text();
      try {
        return Object.fromEntries(new URLSearchParams(txt));
      } catch {
        return {};
      }
    });

    // Debug log: show incoming payload (truncated) and orderId presence for quick debugging
    console.log("[/api/orders] incoming payload:", JSON.stringify(body).slice(0, 2000));
    console.log("[/api/orders] incoming orderId:", (body && (body.orderId || body.id || body.orderID)) || "(none)");

    // ensure we have an orderId
    let orderId = (body && (body.orderId || body.orderID)) as string | undefined;
    if (!orderId) {
      const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
      const tail = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
      orderId = `NX-${rand}-${tail}`;
      body.orderId = orderId;
      console.log("[/api/orders] generated orderId:", orderId);
    }

    // Look for env var under both names (your .env.local uses NEXT_GOOGLE_SCRIPT_URL)
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_GOOGLE_SCRIPT_URL || (body && body.scriptUrl) || "";

    if (!scriptUrl) {
      console.error("[/api/orders] Missing Apps Script URL");
      return NextResponse.json({
        ok: false,
        error: "Missing Apps Script URL (GOOGLE_SCRIPT_URL or NEXT_GOOGLE_SCRIPT_URL). Set environment variable or include scriptUrl in the request body for local testing.",
      }, { status: 500 });
    }

    // Forward payload to Apps Script as JSON
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text().catch(() => "");
    let scriptResponse: any = text;
    try { scriptResponse = text ? JSON.parse(text) : {}; } catch (e) { scriptResponse = { raw: text }; }

    console.log("[/api/orders] Apps Script status:", res.status, "responseSnippet:", JSON.stringify(scriptResponse).slice(0, 1000));

    if (!res.ok) {
      // Forward helpful info
      return NextResponse.json({
        ok: false,
        error: "Apps Script responded with an error",
        status: res.status,
        scriptResponse,
      }, { status: 502 });
    }

    return NextResponse.json({ ok: true, orderId, scriptResponse });
  } catch (err: any) {
    console.error("Order proxy error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}