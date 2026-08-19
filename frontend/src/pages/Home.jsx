import { lazy } from "react";
import { Link } from "react-router-dom";
import { fallbackServices } from "../data/fallback.js";
import Scene3D from "../components/Scene3D.jsx";
import Reveal from "../components/Reveal.jsx";
import TiltCard from "../components/TiltCard.jsx";

const HeroNetworkScene = lazy(() => import("../components/3d/HeroNetworkScene.jsx"));

const STATS = [
  { num: "6", label: "Core service lines" },
  { num: "100%", label: "Custom-built solutions" },
  { num: "30 days", label: "Post-launch support included" },
  { num: "1 business day", label: "Typical response time" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <Scene3D scene={HeroNetworkScene} className="hero-3d-layer" fallback={null} threshold={0.1} />
        <div className="hero-inner">
          <div>
            <span className="eyebrow">Full-Stack · App · Data Engineering</span>
            <h1>We build the software and data infrastructure your business runs on.</h1>
            <p className="lead">
              Nexoria Technologies designs and ships websites, full-stack
              applications, mobile apps, and data pipelines — with the IT
              support to keep it all running.
            </p>
            <div className="hero-cta-group">
              <Link to="/contact" className="btn btn-primary">
                Start a Project
              </Link>
              <Link to="/services" className="btn btn-outline">
                Explore Services
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-row">
              <span>Web & App Development</span>
              <strong>React · Node.js · React Native</strong>
            </div>
            <div className="hero-panel-row">
              <span>Data Engineering</span>
              <strong>ETL/ELT · Warehousing</strong>
            </div>
            <div className="hero-panel-row">
              <span>Analytics</span>
              <strong>Dashboards · BI</strong>
            </div>
            <div className="hero-panel-row">
              <span>IT Services</span>
              <strong>Cloud · DevOps · Support</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">What We Do</span>
            <h2 className="section-title">One partner for your entire stack</h2>
            <p className="section-subtitle">
              From your first landing page to a production data pipeline, we
              cover the full lifecycle of your software.
            </p>
          </div>

          <div className="grid grid-3">
            {fallbackServices.map((s, i) => (
              <Reveal key={s.id} direction={i % 2 === 0 ? "left" : "right"} delay={(i % 3) * 80}>
                <TiltCard>
                  <div className="card">
                    <div className="card-icon">{s.title.charAt(0)}</div>
                    <h3>{s.title}</h3>
                    <p>{s.summary}</p>
                    <Link to="/services" className="card-link">
                      Learn more →
                    </Link>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "center" }}>
            <div>
              <span className="eyebrow">Why Nexoria</span>
              <h2 className="section-title">Built by people who ship, not just plan</h2>
              <p className="section-subtitle" style={{ marginBottom: 20 }}>
                We keep teams small and communication direct. You talk to the
                people actually writing the code and building your pipelines
                — not a rotating cast of account managers.
              </p>
              <ul className="highlight-list">
                <li>Transparent, fixed-scope proposals before any work starts</li>
                <li>Modern, maintainable code your future team can build on</li>
                <li>Data pipelines and dashboards, not just websites</li>
                <li>Ongoing support after launch — not just a handoff</li>
              </ul>
            </div>
            <div className="card">
              <h3>Typical engagement</h3>
              <p>Most projects follow the same clear process:</p>
              <ul className="highlight-list">
                <li>Discovery call &amp; scoping (free)</li>
                <li>Fixed-scope proposal &amp; timeline</li>
                <li>Build in weekly sprints with demos</li>
                <li>Launch, handoff, and 30 days of support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Have a project in mind?</h2>
          <p>Tell us what you're building — we'll reply within 1 business day.</p>
          <Link to="/contact" className="btn btn-primary">
            Get a Free Quote
          </Link>
        </div>
      </section>
    </>
  );
}
