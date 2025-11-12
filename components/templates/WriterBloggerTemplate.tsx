import React from "react";
import { Mail } from "lucide-react";

export type Post = { title: string; excerpt?: string; url?: string };

export type WriterBloggerProps = {
  name?: string;
  tagline?: string;
  avatar?: string;
  bio?: string;
  posts?: Post[];
  socials?: { instagram?: string; twitter?: string; website?: string };
  ariaLabel?: string;
  onSubscribe?: (email: string) => void;
};

export default function WriterBloggerTemplate({
  name = "Pen & Paper — Rae Carter",
  tagline = "Writer • Travel & Culture",
  avatar,
  bio,
  posts = [],
  socials = {},
  ariaLabel = "Writer profile",
  onSubscribe,
}: WriterBloggerProps) {
  const samplePosts = posts.length ? posts : [
    { title: "On Quiet Cities — Why I Travel Slowly", excerpt: "A short essay exploring slow travel." },
    { title: "Essentials for the Traveling Writer", excerpt: "My kit, workflow and notes." },
  ];
  return (
    <div className="wb" aria-label={ariaLabel}>
      <main className="wrap">
        <header className="hero">
          <div className="avatar" style={{ backgroundImage: `url('${avatar || "/templates/author.jpg"}')` }} />
          <div className="meta">
            <h1 className="name">{name}</h1>
            <div className="role">{tagline}</div>
            <p style={{ marginTop: 8 }}>{bio}</p>
          </div>
        </header>

        <section className="posts" aria-live="polite">
          {samplePosts.map((p, i) => (
            <article className="post" key={i}>
              <h4>{p.title}</h4>
              {p.excerpt && <p style={{ color: "var(--muted)" }}>{p.excerpt}</p>}
              {p.url && <a href={p.url}>Read</a>}
            </article>
          ))}
        </section>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Subscribe</div>
          <div className="subscribe" role="form" aria-label="Subscribe form">
            <input className="sub-input" placeholder="Your email" aria-label="Your email" id="wb-email" />
            <button className="sub-btn" onClick={() => {
              const v = (document.getElementById("wb-email") as HTMLInputElement)?.value;
              if (onSubscribe) onSubscribe(v);
              else alert(`Subscribed: ${v || "(empty)"}`);
            }}>Subscribe</button>
          </div>
        </div>
      </main>
    </div>
  );
}