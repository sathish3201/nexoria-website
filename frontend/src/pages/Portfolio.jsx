import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { fallbackPortfolio } from "../data/fallback.js";
import Reveal from "../components/Reveal.jsx";
import TiltCard from "../components/TiltCard.jsx";

export default function Portfolio() {
  const [items, setItems] = useState(fallbackPortfolio);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPortfolio()
      .then((data) => setItems(data))
      .catch(() => setItems(fallbackPortfolio))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Portfolio</h1>
          <p>
            Representative project concepts across our core service lines.
            Real case studies will replace these as projects ship.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <p className="loading-text">Loading portfolio…</p>}
          <div className="grid grid-3">
            {items.map((p, i) => (
              <Reveal key={p.id} direction={i % 2 === 0 ? "left" : "right"} delay={(i % 3) * 80}>
                <TiltCard>
                  <div className="card">
                    <span className="eyebrow">{p.category}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="tag-list">
                      {(p.tags || []).map((t) => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {p.status && <div className="status-note">{p.status}</div>}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Want to be our next case study?</h2>
          <p>Let's scope your project and get it on the roadmap.</p>
          <Link to="/contact" className="btn btn-primary">
            Start a Project
          </Link>
        </div>
      </section>
    </>
  );
}
