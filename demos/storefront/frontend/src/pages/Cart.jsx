import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../format.js";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalInPaise, clearCart } = useCart();
  const [error, setError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  async function handleCheckout() {
    setError(null);
    setCheckingOut(true);

    const cartItems = items.map((i) => ({ id: i.id, quantity: i.quantity }));

    try {
      const order = await api.createOrder(cartItems);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Trailhead Goods",
        description: "Storefront demo purchase",
        handler: async (response) => {
          try {
            await api.verifyPayment({ ...response, items: cartItems });
            clearCart();
            navigate("/success");
          } catch (err) {
            navigate("/cancel");
          }
        },
        modal: {
          ondismiss: () => setCheckingOut(false),
        },
      });

      razorpay.on("payment.failed", () => {
        setCheckingOut(false);
        navigate("/cancel");
      });

      razorpay.open();
    } catch (err) {
      setError(err.message);
      setCheckingOut(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h1>Your Cart</h1>

        {items.length === 0 && (
          <p className="loading-text">
            Your cart is empty. <Link to="/">Continue shopping</Link>.
          </p>
        )}

        {items.length > 0 && (
          <>
            <div className="cart-list">
              {items.map((i) => (
                <div className="cart-row" key={i.id}>
                  <span className="cart-row-name">{i.name}</span>
                  <input
                    type="number"
                    min="1"
                    value={i.quantity}
                    onChange={(e) => updateQuantity(i.id, Number(e.target.value))}
                    className="cart-qty-input"
                  />
                  <span className="cart-row-price">{formatPrice(i.priceInPaise * i.quantity)}</span>
                  <button className="btn-remove" onClick={() => removeItem(i.id)} aria-label="Remove">
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <strong>Total</strong>
              <strong>{formatPrice(totalInPaise)}</strong>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn btn-primary btn-block" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? "Opening Razorpay…" : "Checkout with Razorpay"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
