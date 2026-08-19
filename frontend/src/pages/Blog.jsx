import { useEffect, useState } from "react";
import { api } from "../api.js";
import { fallbackBlog } from "../data/fallback.js";
import Reveal from "../components/Reveal.jsx";
import TiltCard from "../components/TiltCard.jsx";

export default function Blog() {
  const [posts, setPosts] = useState(fallbackBlog);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getBlog()
      .then((data) => setPosts(data))
      .catch(() => setPosts(fallbackBlog))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Blog</h1>
          <p>Notes on full-stack development, app engineering, and data.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <p className="loading-text">Loading posts…</p>}
          <div className="grid grid-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} direction={i % 2 === 0 ? "left" : "right"} delay={(i % 3) * 80}>
                <TiltCard>
                  <div className="card blog-card">
                    <div className="blog-meta">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      · {post.author}
                    </div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="tag-list">
                      {(post.tags || []).map((t) => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
