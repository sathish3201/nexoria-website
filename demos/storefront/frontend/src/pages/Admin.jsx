import { useEffect, useState } from "react";
import { api } from "../api.js";
import { formatPrice } from "../format.js";

const TOKEN_KEY = "storefront-admin-token";

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [tokenInput, setTokenInput] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) verify(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function verify(candidateToken) {
    setError(null);
    setLoading(true);
    try {
      await api.adminVerify(candidateToken);
      localStorage.setItem(TOKEN_KEY, candidateToken);
      setToken(candidateToken);
      setVerified(true);
      const [productsData, ordersData] = await Promise.all([
        api.getProducts(),
        api.adminGetOrders(candidateToken),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      setVerified(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStockChange(id, stock) {
    try {
      await api.adminUpdateStock(id, stock, token);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!verified) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 420 }}>
          <h1>Admin Login</h1>
          <p>Enter the admin token to view orders and manage inventory.</p>
          <div className="form-group">
            <label>Admin Token</label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Admin token"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" onClick={() => verify(tokenInput)} disabled={loading}>
            {loading ? "Checking…" : "Log In"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <h2>Inventory</h2>
        <div className="admin-table">
          {products.map((p) => (
            <div className="admin-row" key={p.id}>
              <span className="admin-row-name">{p.name}</span>
              <span>{formatPrice(p.priceInPaise)}</span>
              <input
                type="number"
                min="0"
                value={p.stock}
                onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                className="cart-qty-input"
              />
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 40 }}>Orders</h2>
        {orders.length === 0 && <p className="loading-text">No orders yet.</p>}
        <div className="admin-table">
          {orders.map((o) => (
            <div className="admin-row" key={o.id}>
              <span className="admin-row-name">{o.razorpayPaymentId}</span>
              <span>{new Date(o.createdAt).toLocaleString()}</span>
              <span>{formatPrice(o.amountTotalCents)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
