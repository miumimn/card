import React from "react";
import {
  Instagram,
  TikTok,
  Pinterest,
  Globe,
  ShoppingCart,
} from "lucide-react";

/**
 * BoutiqueTemplate.tsx
 *
 * Mobile-first React + TypeScript component port of templates/boutique-fashion.html
 * - Keeps original layout and classnames so your existing CSS (assets/styles.css) still works
 * - All editable content comes from props
 * - Social icons render only when the link is provided
 * - Shows sampleGallery when gallery prop is empty
 * - Renders products only when provided
 * - Exposes `onShop` / `onViewProduct` callback hooks for integration
 *
 * Usage:
 * <BoutiqueTemplate
 *   brand={{ name: "Éclat Boutique", tagline: "Redefining everyday elegance ✨", logo: "/logo.png" }}
 *   gallery={[ "/img1.jpg", "/img2.jpg" ]}
 *   products={[{ name: "Linen Dress", price: "$119", image: "/p1.jpg" }]}
 *   socials={{ instagram: "https://instagram.com/..." }}
 * />
 */

export type Product = {
  name: string;
  price?: string;
  image?: string;
  description?: string;
  url?: string;
};

export type Socials = {
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  website?: string;
  whatsapp?: string; // phone number
};

export type BoutiqueProps = {
  brand?: {
    name?: string;
    tagline?: string;
    logo?: string;
  };
  gallery?: string[]; // image URLs
  products?: Product[];
  socials?: Socials;
  /**
   * Callbacks for integration:
   * - onShop: invoked when Shop Now CTA pressed
   * - onViewProduct: invoked when user taps product
   */
  onShop?: () => void;
  onViewProduct?: (product: Product) => void;
  // optionals for accessibility / a11y overrides
  ariaLabel?: string;
};

const sampleGallery = [
  "/templates/fashion1.jpg",
  "/templates/fashion2.jpg",
  "/templates/fashion3.jpg",
  "/templates/fashion4.jpg",
  "/templates/fashion5.jpg",
  "/templates/fashion6.jpg",
];

export default function BoutiqueTemplate({
  brand = {},
  gallery = [],
  products = [],
  socials = {},
  onShop,
  onViewProduct,
  ariaLabel = "Boutique template",
}: BoutiqueProps) {
  const effectiveGallery = (gallery && gallery.length > 0 ? gallery : sampleGallery).slice(
    0,
    8
  );

  const handleShopNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onShop) onShop();
    else {
      // default behaviour: scroll to products if any
      const el = document.querySelector(".shop-grid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleViewProduct = (p: Product) => {
    if (onViewProduct) onViewProduct(p);
    else {
      // default: open product url if provided
      if (p.url) window.open(p.url, "_blank", "noopener");
    }
  };

  return (
    <div className="boutique" aria-label={ariaLabel}>
      <main className="wrap" role="main">
        <section className="brand" aria-labelledby="brand-title">
          {brand.logo ? (
            <div
              className="brand-logo"
              style={{ backgroundImage: `url('${brand.logo}')` }}
              aria-hidden
            />
          ) : (
            <div
              className="brand-logo"
              style={{ backgroundImage: `url('${sampleGallery[0]}')` }}
              aria-hidden
            />
          )}

          <h1 id="brand-title">{brand.name || "Your Boutique"}</h1>
          {brand.tagline && <p>{brand.tagline}</p>}
        </section>

        {/* Lookbook gallery */}
        <section className="gallery" aria-label="Lookbook gallery">
          {effectiveGallery.map((src, i) => (
            <div className="tile" key={i}>
              <img src={src} alt={`${brand.name || "Collection"} ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </section>

        {/* Shop listings (render only if any products provided) */}
        {products && products.length > 0 && (
          <section className="shop-grid" aria-label="Shop listings">
            {products.map((p, idx) => (
              <article className="product" aria-labelledby={`product-${idx}`} key={idx}>
                <div
                  className="img"
                  style={{ backgroundImage: `url('${p.image || sampleGallery[idx % sampleGallery.length]}')` }}
                  role="img"
                  aria-label={p.name}
                />
                <div className="meta">
                  <div id={`product-${idx}`} className="title">
                    {p.name}
                  </div>
                  {p.price && <div className="price">{p.price}</div>}
                  {p.description && <div className="desc" style={{ color: "#7b6b78", fontSize: 13 }}>{p.description}</div>}
                  <div className="actions" style={{ marginTop: 8 }}>
                    <button
                      className="btn shop"
                      onClick={() => handleViewProduct(p)}
                      aria-label={`View ${p.name}`}
                    >
                      <ShoppingCart size={16} /> Shop
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => handleViewProduct(p)}
                      aria-label={`Details for ${p.name}`}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {/* If no products, show CTA to Shop / Collections */}
        {(!products || products.length === 0) && (
          <>
            <div className="shop-cta" role="region" aria-label="Shop call to action">
              <button className="shop-now" onClick={handleShopNow} aria-label="Shop Now">
                Shop Now
              </button>
              <a
                href="#collections"
                className="btn ghost"
                style={{ borderRadius: 999, padding: "12px 18px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                View Collections
              </a>
            </div>
          </>
        )}

        {/* Social links — render only present ones */}
        <nav className="socials" aria-label="Social links">
          {socials.instagram && (
            <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} /> <span>Instagram</span>
            </a>
          )}
          {socials.tiktok && (
            <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TikTok size={18} /> <span>TikTok</span>
            </a>
          )}
          {socials.pinterest && (
            <a href={socials.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
              <Pinterest size={18} /> <span>Pinterest</span>
            </a>
          )}
          {socials.website && (
            <a href={socials.website} target="_blank" rel="noopener noreferrer" aria-label="Website">
              <Globe size={18} /> <span>Website</span>
            </a>
          )}
          {/* WhatsApp example (render as chat link) */}
          {socials.whatsapp && (
            <a
              href={`https://wa.me/${socials.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.52 3.48A11.87 11.87 0 0012 0C5.373 0 0 5.373 0 12a11.87 11.87 0 002.53 7.42L0 24l4.7-2.42A11.97 11.97 0 0012 24c6.627 0 12-5.373 12-12 0-1.97-.46-3.83-1.48-5.52zM12 21.8c-1.2 0-2.38-.28-3.44-.8l-.25-.13-2.8 1.44 1.44-2.73-.14-.3A9.44 9.44 0 012.6 12 9.4 9.4 0 1112 21.8zM17.1 15.04c-.32.9-1.84 1.72-2.53 1.84-.7.12-1.34.17-3.02-.38-2.23-.75-3.67-2.9-3.79-3.04-.12-.14-1.06-1.13-1.06-2.16 0-1.03.55-1.54.75-1.75.2-.2.45-.2.62-.2.17 0 .37 0 .56 0 .18 0 .46-.05.7.5.25.55.87 1.9.95 2.05.09.15.14.34.03.55-.12.2-.17.34-.34.54-.17.2-.36.45-.53.6-.18.16-.36.32-.2.6.16.28.72.95 1.55 1.55 1.06.7 1.94.9 2.32 1 .37.1.6.09.82-.05.22-.14.74-.27 1.45-.85.7-.57 1.2-1.2 1.34-1.38.14-.18.28-.14.47-.09.19.05 1.2.55 1.41.65.21.1.35.16.4.26.04.09.04.57-.28 1.47z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          )}
        </nav>

        <footer>
          © {brand.name || "Your Boutique"} — handcrafted collections. <br />
          Terms • Shipping • Privacy
        </footer>
      </main>
    </div>
  );
}