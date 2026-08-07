import { Link } from "react-router-dom";

export default function Cancel() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center" }}>
        <h1>Checkout canceled</h1>
        <p>Your cart is still saved — you can pick up where you left off.</p>
        <Link to="/cart" className="btn btn-primary" style={{ marginTop: 24 }}>
          Back to Cart
        </Link>
      </div>
    </section>
  );
}
