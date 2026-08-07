import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { fallbackServices } from "../data/fallback.js";

export default function Services() {
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getServices()
      .then((data) => setServices(data))
      .catch(() => setServices(fallbackServices))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Services</h1>
          <p>
            Six core service lines that cover your product, your platform,
            and your data — end to end.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <p className="loading-text">Loading services…</p>}
          <div className="grid grid-3">
            {services.map((s) => (
              <div className="card" key={s.id}>
                <div className="card-icon">{s.title.charAt(0)}</div>
                <h3>{s.title}</h3>
                <p>{s.details || s.summary}</p>
                <ul className="highlight-list">
                  {(s.highlights || []).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Not sure which service you need?</h2>
          <p>Tell us about your project — we'll recommend the right approach.</p>
          <Link to="/contact" className="btn btn-primary">
            Talk to Us
          </Link>
        </div>
      </section>
    </>
  );
}
