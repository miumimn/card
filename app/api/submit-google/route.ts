import { NextResponse } from "next/server";

const SCRIPT_URL = process.env.NEXT_GOOGLE_SCRIPT_URL || "";

export async function POST(request: Request) {
  if (!SCRIPT_URL) {
    return NextResponse.json({ ok: false, message: "Google script URL not configured on server" }, { status: 500 });
  }

  try {
    const payload = await request.json().catch(() => ({}));

    const fullName = payload.name || "";
    const email = payload.email || "";
    const phone = payload.phone || "";
    const street = payload.street || "";
    const city = payload.city || "";
    const country = payload.country || "";
    const cardType = payload.cardCategory || payload.cardType || "";
    const customText = payload.customText ?? "";
    const logo = payload.logo ?? "";
    const paymentMethod = payload.paymentMethod ?? "";
    const notes = payload.notes ?? "";
    const orderId = payload.orderId ?? "";
    const total = payload.total ?? "";
    const cart = payload.cart ? JSON.stringify(payload.cart) : "";
    if (payload.meta) {
      try { payload.meta = JSON.stringify(payload.meta); } catch {}
    }

    const params = new URLSearchParams();
    params.append("fullName", String(fullName));
    params.append("email", String(email));
    params.append("phone", String(phone));
    params.append("street", String(street));
    params.append("city", String(city));
    params.append("country", String(country));
    params.append("cardType", String(cardType));
    params.append("customText", String(customText));
    params.append("logo", String(logo));
    params.append("paymentMethod", String(paymentMethod));
    params.append("notes", String(notes));
    params.append("orderId", String(orderId));
    params.append("total", String(total));
    params.append("cart", String(cart));
    if (payload.meta) params.append("meta", String(payload.meta));

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString(),
    });

    const text = await res.text().catch(() => "");
    return NextResponse.json({ ok: res.ok, status: res.status, responseTextSnippet: String(text || "").slice(0, 1000) }, { status: 200 });
  } catch (err: any) {
    console.error("submit-google proxy error:", err);
    return NextResponse.json({ ok: false, message: String(err?.message || err) }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}