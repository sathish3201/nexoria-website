import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../format.js";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch(() => setError("Could not load products. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(product) {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Trailhead Goods</h1>
          <p>A working storefront demo — cart, Razorpay test-mode checkout, and an admin dashboard.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading && <p className="loading-text">Loading products…</p>}
          {error && <p className="error-text">{error}</p>}
          <div className="grid grid-3">
            {products.map((p) => (
              <div className="card product-card" key={p.id}>
                <img src={p.image} alt={p.name} className="product-image" />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="product-footer">
                  <span className="price">{formatPrice(p.priceInPaise)}</span>
                  <span className="stock-note">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</span>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  disabled={p.stock <= 0}
                  onClick={() => handleAdd(p)}
                >
                  {addedId === p.id ? "Added ✓" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
