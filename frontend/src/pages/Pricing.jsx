import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { fallbackPricing } from "../data/fallback.js";
import Reveal from "../components/Reveal.jsx";
import TiltCard from "../components/TiltCard.jsx";

export default function Pricing() {
  const [plans, setPlans] = useState(fallbackPricing);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPricing()
      .then((data) => setPlans(data))
      .catch(() => setPlans(fallbackPricing))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Pricing</h1>
          <p>
            Starting points for common engagements. Every project gets a
            fixed-scope proposal after a free discovery call.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <p className="loading-text">Loading pricing…</p>}
          <div className="grid grid-3">
            {plans.map((p, i) => (
              <Reveal key={p.id} direction={i % 2 === 0 ? "left" : "right"} delay={(i % 3) * 80}>
                <TiltCard>
                  <div className={`pricing-card ${p.highlighted ? "highlighted" : ""}`}>
                    {p.highlighted && <span className="pricing-badge">Most Popular</span>}
                    <h3>{p.name}</h3>
                    <div className="price">{p.priceLabel}</div>
                    <div className="price-cadence">{p.cadence}</div>
                    <div className="best-for">{p.bestFor}</div>
                    <ul className="feature-list">
                      {(p.features || []).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <Link to="/contact" className="btn btn-secondary btn-block">
                      Request Quote
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <p className="loading-text" style={{ marginTop: 24 }}>
            All prices are starting estimates — final quotes depend on scope
            and are confirmed in writing before work begins.
          </p>
        </div>
      </section>
    </>
  );
}
