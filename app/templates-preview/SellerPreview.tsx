"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type SellerListing = {
  title?: string;
  desc?: string;
  price?: string;
  image?: string;
};

export type SellerData = {
  name?: string;
  tagline?: string;
  about?: string;
  avatar?: string | string[];
  listings?: SellerListing[] | string;
  other_links?: string[] | string;
  profile_url?: string;
  extra_fields?: any;
};

function parseList(val: any): string[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "object") {
    try { return Object.values(val).map(String).filter(Boolean); } catch {}
    return [];
  }
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    try {
      const p = JSON.parse(s);
      if (Array.isArray(p)) return p.map(String).filter(Boolean);
    } catch {}
    if (s.includes("\n")) return s.split("\n").map(x => x.trim()).filter(Boolean);
    if (s.includes(",")) return s.split(",").map(x => x.trim()).filter(Boolean);
    return [s];
  }
  return [];
}

function isValidUrl(v?: string) {
  if (!v) return false;
  const s = String(v).trim();
  if (!s) return false;
  if (s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return false;
  return /^https?:\/\//i.test(s);
}

// Changed signature to be a type guard so .filter(isMeaningfulListing) narrows the array correctly
function isMeaningfulListing(l: SellerListing | null): l is SellerListing {
  if (!l) return false;
  const title = (l.title || "").toString().trim();
  const price = (l.price || "").toString().trim();
  const desc = (l.desc || "").toString().trim();
  const image = (l.image || "").toString().trim();
  if (!title && !price && !desc && !image) return false;
  if (image && (image.includes("/null") || image.includes("localhost"))) {
    // if only image is sentinel, require some text
    return !!(title || price || desc);
  }
  return true;
}

export default function SellerPreview({ data, showFooter = true }: { data?: SellerData | null; showFooter?: boolean }) {
  const router = useRouter();
  const [clientHref, setClientHref] = useState<string>("");

  useEffect(() => {
    try { setClientHref(typeof window !== "undefined" ? window.location.href || "" : ""); } catch { setClientHref(""); }
  }, []);

  const merged = useMemo(() => {
    const out: Record<string, any> = { ...(data ?? {}) };
    if (data?.extra_fields) {
      try {
        const parsed = typeof data.extra_fields === "string" ? JSON.parse(data.extra_fields || "{}") : data.extra_fields;
        if (parsed && typeof parsed === "object") {
          Object.entries(parsed).forEach(([k, v]) => { if (out[k] === undefined) out[k] = v; });
        }
      } catch {}
    }
    return out as SellerData;
  }, [data]);

  const name = merged.name ?? (showFooter ? "Corner Craft Co." : "");
  const tagline = merged.tagline ?? (showFooter ? "Handmade goods & daily essentials, local pick-up & delivery" : "");
  const avatarCandidates = parseList(merged.avatar ?? merged.extra_fields?.avatar);
  const avatar = avatarCandidates.length ? avatarCandidates[0] : (showFooter ? "https://picsum.photos/id/1044/600/600" : "");
  const otherLinks = parseList(merged.other_links ?? merged.extra_fields?.other_links);

  // Normalize listings: accept array of objects or JSON/string lines
  const rawListings = merged.listings ?? merged.extra_fields?.listings ?? [];
  const listings = useMemo(() => {
    if (!rawListings) return [];
    if (Array.isArray(rawListings)) {
      return rawListings
        .map((it: any) => {
          if (!it) return null;
          if (typeof it === "string") {
            const parts = it.split("•").map((p: any) => String(p).trim());
            return { title: parts[0] || "", price: parts[1] || "", desc: parts[2] || "", image: "" };
          }
          return { title: it.title ?? it.name ?? "", price: it.price ?? "", desc: it.desc ?? it.description ?? "", image: it.image ?? "" };
        })
        .filter(Boolean)
        .filter(isMeaningfulListing);
    }
    if (typeof rawListings === "string") {
      try {
        const parsed = JSON.parse(rawListings);
        if (Array.isArray(parsed)) {
          return parsed.map((it: any) => (typeof it === "string" ? { title: it } : it)).map((it: any) => ({ title: it.title ?? "", price: it.price ?? "", desc: it.desc ?? it.description ?? "", image: it.image ?? "" })).filter(isMeaningfulListing);
        }
      } catch {
        const lines = rawListings.split("\n").map((s: string) => s.trim()).filter(Boolean);
        return lines.map((ln: string) => {
          const parts = ln.split("•").map(p => p.trim());
          return { title: parts[0] || "", price: parts[1] || "", desc: parts[2] || "", image: "" };
        }).filter(isMeaningfulListing);
      }
    }
    return [];
  }, [JSON.stringify(rawListings)]) as SellerListing[];

  // QR data: prefer profile_url when valid, otherwise use clientHref if not null
  const qrData = (() => {
    const p = (merged.profile_url ?? "").toString().trim();
    if (p && isValidUrl(p)) return p;
    const ch = clientHref ?? "";
    if (!ch) return "";
    if (ch.includes("/null") || ch.endsWith("/null")) return "";
    return ch;
  })();

  return (
    <>
      <link rel="stylesheet" href="/assets/styles.css" />
      {/* Inject the seller-specific scoped CSS from your original seller.html so styling appears exactly */}
      <style dangerouslySetInnerHTML={{ __html: `
    /* Seller — marketplace / storefront mini-site (scoped) */
    :root{
      --seller-bg: #fffdf9;
      --seller-surface: #ffffff;
      --seller-accent: #ff8a4b;
      --seller-muted: #6b6b73;
      --seller-text: #111827;
      --seller-card-radius: 12px;
    }

    body.seller { margin:0; font-family:Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:var(--seller-bg); color:var(--seller-text); -webkit-font-smoothing:antialiased; }
    .wrap{ max-width:980px; margin:14px auto; padding:16px; }

    /* Top hero: brand + quick stats */
    .hero {
      display:flex;
      gap:12px;
      align-items:center;
      background: linear-gradient(180deg, rgba(255,138,76,0.04), rgba(255,138,76,0.02));
      border-radius:16px;
      padding:14px;
      box-shadow: 0 10px 30px rgba(17,24,39,0.04);
    }
    .avatar { width:96px; height:96px; border-radius:16px; background-size:cover; background-position:center; border:4px solid #fff; box-shadow:0 10px 30px rgba(17,24,39,0.06); }
    .meta { flex:1; }
    .brand { margin:0; font-weight:900; font-size:18px; color:var(--seller-text); }
    .tagline { margin:6px 0 0; color:var(--seller-muted); font-weight:700; font-size:13px; }

    .stats { display:flex; gap:12px; margin-top:10px; flex-wrap:wrap; }
    .stat { background:var(--seller-surface); padding:8px 10px; border-radius:10px; border:1px solid rgba(17,24,39,0.03); color:var(--seller-muted); font-weight:800; font-size:13px; }

    /* search/filter inside seller */
    .seller-search { display:flex; gap:8px; margin-top:12px; }
    .seller-search input { flex:1; padding:10px 12px; border-radius:10px; border:1px solid rgba(17,24,39,0.06); background:#fff; font-size:14px; color:var(--seller-text); }
    .seller-search button { padding:10px 12px; border-radius:10px; border:none; background:var(--seller-accent); color:#07121a; font-weight:800; cursor:pointer; }

    /* listings grid */
    .listings { display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); margin-top:16px; }
    .listing { background:var(--seller-surface); border-radius:12px; overflow:hidden; border:1px solid rgba(17,24,39,0.04); display:flex; flex-direction:column; box-shadow:0 8px 24px rgba(17,24,39,0.04); }
    .listing img { width:100%; height:160px; object-fit:cover; display:block; }
    .listing-body { padding:12px; display:flex; flex-direction:column; gap:8px; flex:1; }
    .listing-title { margin:0; font-weight:900; color:var(--seller-text); font-size:15px; }
    .listing-desc { margin:0; color:var(--seller-muted); font-size:13px; flex:1; }
    .price-row { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:8px; }
    .price { font-weight:900; color:var(--seller-accent); }
    .btn-row { display:flex; gap:8px; margin-top:10px; }
    .btn { padding:8px 10px; border-radius:10px; border:none; cursor:pointer; font-weight:800; }
    .btn.buy { background:linear-gradient(90deg,var(--seller-accent), #ffb38a); color:#07121a; }
    .btn.details { background:transparent; border:1px solid rgba(17,24,39,0.06); color:var(--seller-text); }

    /* categories / filters */
    .categories { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
    .cat { padding:8px 10px; border-radius:999px; background:#fff; border:1px solid rgba(17,24,39,0.03); color:var(--seller-muted); font-weight:800; cursor:pointer; }

    /* contact / store info + QR */
    .store-info { margin-top:16px; display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
    .store-meta { color:var(--seller-muted); font-size:14px; }
    .qr { display:flex; gap:10px; align-items:center; }
    .qr img { width:88px; height:88px; border-radius:10px; background:#fff; border:1px solid rgba(17,24,39,0.04); }

    @media (max-width:880px){
      .hero { flex-direction:column; align-items:flex-start; }
      .stats{ justify-content:flex-start; }
      .store-info { flex-direction:column; align-items:flex-start; gap:8px; }
    }
      ` }} />

      <div className="wrap" style={{ maxWidth: 980 }}>
        <section className="hero" aria-label="Store hero">
          <div className="avatar" style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined} aria-hidden="true" />
          <div className="meta">
            <h1 className="brand">{name}</h1>
            <div className="tagline">{tagline}</div>

            <div className="stats" aria-hidden="true" style={{ marginTop: 10 }}>
              {showFooter ? (
                <>
                  <div className="stat">4.9 ★ (324)</div>
                  <div className="stat">Free pickup</div>
                  <div className="stat">Ships same day</div>
                </>
              ) : null}
            </div>

            <div className="seller-search" role="search" aria-label="Search products" style={{ marginTop: 12 }}>
              <input id="sellerSearch" type="search" placeholder="Search products..." aria-label="Search products" />
              <button id="sellerClear">Search</button>
            </div>

            <div className="categories" aria-hidden="true" style={{ marginTop: 12 }}>
              <button className="cat active" data-cat="all">All</button>
              <button className="cat" data-cat="home">Home</button>
              <button className="cat" data-cat="gifts">Gifts</button>
            </div>
          </div>
        </section>

        <section className="listings" id="listingsGrid" aria-live="polite" style={{ marginTop: 16 }}>
          {listings.length ? listings.map((l, i) => (
            <article key={i} className="listing" data-name={l.title || ''} data-cat="" >
              {l.image && isValidUrl(l.image) ? <img src={l.image} alt={l.title ?? 'product'} /> : null}
              <div className="listing-body">
                <h4 className="listing-title">{l.title}</h4>
                {l.desc ? <p className="listing-desc">{l.desc}</p> : <p className="listing-desc" aria-hidden="true" />}
                <div className="price-row">
                  <div className="price">{l.price ? l.price : ''}</div>
                  <div className="btn-row">
                    <button className="btn details">Details</button>
                    <button className="btn buy">Buy</button>
                  </div>
                </div>
              </div>
            </article>
          )) : null}
        </section>

        <section className="store-info" aria-label="Store info" style={{ marginTop: 16 }}>
          <div className="store-meta">
            <div><strong>{name}</strong></div>
            <div className="muted">Open: Mon–Sat • 9:00–18:00</div>
            <div className="muted">Address: 88 Market Lane, Smalltown</div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="qr">
              {qrData ? <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`} alt="QR to store" /> : null}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--seller-muted)' }}>Download store link</div>
              {qrData ? <a className="btn buy" href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrData)}`} download>Download QR</a> : null}
            </div>
          </div>
        </section>

        {/* Footer actions: Back + Use this template (shown only for template preview with showFooter=true) */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn details" onClick={() => router.push("/templates-preview")} style={{ padding: "8px 12px", borderRadius: 10, background: "transparent", border: "1px solid rgba(17,24,39,0.06)" }}>Back</button>
          {showFooter ? (
            <button className="btn buy" onClick={() => router.push("/onboarding/seller")} style={{ padding: "8px 12px", borderRadius: 10 }}>Use this template</button>
          ) : null}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
(function(){
  const search = document.getElementById('sellerSearch');
  const clear = document.getElementById('sellerClear');
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll('.listing'));
  const cats = Array.from(document.querySelectorAll('.cat'));
  const norm = s => (s||'').toString().trim().toLowerCase();

  function filter(q='', cat='all') {
    const qn = norm(q);
    items.forEach(it => {
      const name = norm(it.dataset.name || '');
      const inCat = (cat === 'all') || (it.dataset.cat === cat);
      const starts = qn && (name.startsWith(qn) || it.querySelector('.listing-title')?.textContent?.toLowerCase().startsWith(qn));
      const contains = qn && (name.includes(qn) || it.querySelector('.listing-desc')?.textContent?.toLowerCase().includes(qn));
      const matchQ = !qn || starts || contains;
      it.style.display = (inCat && matchQ) ? '' : 'none';
    });
  }

  let t;
  if (search) {
    search.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(()=> filter(e.target.value, document.querySelector('.cat.active')?.dataset.cat || 'all'), 120);
    });
  }
  if (clear) {
    clear.addEventListener('click', () => {
      if (!search) return;
      search.value = '';
      filter('');
      search.focus();
    });
  }

  cats.forEach(c => c.addEventListener('click', () => {
    cats.forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    filter(search?.value, c.dataset.cat);
  }));

  grid.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.btn');
    if (!btn) return;
    const listing = ev.target.closest('.listing');
    if (!listing) return;
    if (btn.classList.contains('details')) {
      alert('Open details for: ' + listing.querySelector('.listing-title').textContent);
    } else if (btn.classList.contains('buy')) {
      alert('Checkout flow stub for: ' + listing.querySelector('.listing-title').textContent);
    }
  });
})();
`
      }} />
    </>
  );
}