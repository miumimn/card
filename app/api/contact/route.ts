import { NextResponse } from "next/server";

/**
 * POST /api/contact
 * Server-side proxy that forwards incoming contact form data to your Google Apps Script.
 *
 * - Reads JSON body (from client ContactForm) or application/x-www-form-urlencoded.
 * - Forwards as application/x-www-form-urlencoded to the Google Apps Script URL configured in
 *   process.env.NEXT_CONTACT_SCRIPT_URL (recommended). If the env var is missing, this will
 *   fall back to the original URL you provided (server-only fallback).
 *
 * IMPORTANT:
 * - Add NEXT_CONTACT_SCRIPT_URL to your .env.local with your Apps Script "exec" URL and restart Next.
 *   Example:
 *     NEXT_CONTACT_SCRIPT_URL="https://script.google.com/macros/s/AKfycbw7S54WrG3TZXbhne9qj.../exec"
 *
 * Returns a JSON summary to the client (never raw HTML).
 */

const SCRIPT_URL =
  process.env.NEXT_CONTACT_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbw7S54WrG3TZXbhne9qjd4dRTCV8ooRZbtGrDPj8YpyUK5x5qMqQ3PlLipyyyHlnYpp8A/exec";

export async function POST(request: Request) {
  try {
    // Accept JSON or form body — normalize to an object
    let payload: any = {};
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      payload = await request.json().catch(() => ({}));
    } else if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      // for completeness (not expected from our ContactForm)
      const formData = await request.formData();
      formData.forEach((v, k) => {
        payload[k] = v;
      });
    } else {
      // last resort: try parse JSON, otherwise empty
      payload = await request.json().catch(() => ({}));
    }

    // normalize fields expected by your Apps Script
    const name = payload.name || payload.fullName || "";
    const email = payload.email || "";
    const subject = payload.subject || "";
    const topic = payload.topic || "";
    const message = payload.message || "";

    // Build URLSearchParams for Google Apps Script compatibility
    const params = new URLSearchParams();
    params.append("name", String(name));
    params.append("email", String(email));
    params.append("subject", String(subject));
    params.append("topic", String(topic));
    params.append("message", String(message));

    // Forward server-side (CORS not an issue)
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: params.toString(),
    });

    // Read text (Apps Script often returns text/html or text/plain)
    const text = await res.text().catch(() => "");

    // Return a safe JSON summary back to the client
    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        forwardedTo: SCRIPT_URL.startsWith("https://script.google.com/") ? "google-apps-script" : SCRIPT_URL,
        responseSnippet: String(text || "").slice(0, 2000),
      },
      { status: 200 }
    );
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("contact proxy error:", err);
    return NextResponse.json(
      { ok: false, message: "Server error forwarding contact form", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}