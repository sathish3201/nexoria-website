const VALUES = [
  {
    title: "Direct communication",
    body: "You work with the people actually building your product — no layers of account managers.",
  },
  {
    title: "Fixed-scope proposals",
    body: "You know the cost and timeline before we start. No surprise invoices.",
  },
  {
    title: "Maintainable code",
    body: "We build for the team that inherits this project after us — clean, documented, testable.",
  },
  {
    title: "Data-informed decisions",
    body: "Where it's useful, we help you instrument and measure — not just ship features blindly.",
  },
];

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>About EKADHANTHA Technologies</h1>
          <p>
            An IT services and software development studio focused on
            full-stack, app, and data engineering work for growing
            businesses.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header left">
            <span className="eyebrow">Our Story</span>
            <h2 className="section-title">Software and data, under one roof</h2>
          </div>
          <p className="about-lead">
            EKADHANTHA Technologies was founded to close a gap we kept seeing:
            businesses would hire one team to build a website, another to
            build their app, and a third — often much later — to make sense
            of their data. We bring website development, full-stack and app
            engineering, IT services, and data pipeline/analytics work
            together, so the systems we build for you are designed to work
            with each other from day one.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">How We Work</span>
            <h2 className="section-title">What you can expect from us</h2>
          </div>
          <div className="grid grid-2">
            {VALUES.map((v) => (
              <div className="card value-card" key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
