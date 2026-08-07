import { Link } from "react-router-dom";

export default function Success() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center" }}>
        <h1>Thank you for your order! 🎉</h1>
        <p>
          This was a Razorpay <strong>test-mode</strong> transaction — no real payment was made.
        </p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
          Back to Shop
        </Link>
      </div>
    </section>
  );
}
