import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-col">
            <h4>EKADHANTHA Technologies</h4>
            <p>
              Full-stack development, app development, IT services, and data
              engineering for growing businesses.
            </p>
            <p>alichalasathish50@gmail.com</p>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <Link to="/services">Website Development</Link>
            <Link to="/services">Full-Stack Development</Link>
            <Link to="/services">App Development</Link>
            <Link to="/services">Data Pipelines & Analytics</Link>
          </div>

          <div className="footer-col">
            <h4>Get Started</h4>
            <Link to="/pricing">Pricing</Link>
            <Link to="/contact">Request a Quote</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {year} EKADHANTHA Technologies. All rights reserved.</span>
          <span>Built with React &amp; Node.js.</span>
        </div>
      </div>
    </footer>
  );
}
