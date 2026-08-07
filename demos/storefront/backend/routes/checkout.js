import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { readProducts, addOrder, decrementStock } from "../lib/store.js";

const router = Router();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId === "rzp_test_your_key_id") return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// POST /api/checkout - create a Razorpay Order for the given cart
router.post("/", async (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return res.status(503).json({
      error: "Checkout is not configured yet. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET on the server to enable it.",
    });
  }

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  const products = readProducts();
  let amount = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.id);
    if (!product) {
      return res.status(400).json({ error: `Unknown product: ${item.id}` });
    }
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (quantity > product.stock) {
      return res.status(400).json({ error: `Not enough stock for ${product.name}.` });
    }
    amount += product.priceInPaise * quantity;
  }

  if (amount < 100) {
    return res.status(400).json({ error: "Order amount must be at least ₹1 (100 paise)." });
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    const statusCode = err.statusCode === 401 ? 401 : 500;
    const message = statusCode === 401 ? "Razorpay authentication failed." : "Could not start checkout. Please try again.";
    res.status(statusCode).json({ error: message });
  }
});

// POST /api/checkout/verify - verify a completed Razorpay payment and record the order
router.post("/verify", (req, res) => {
  const razorpay = getRazorpay();
  if (!razorpay) return res.status(503).json({ error: "Checkout is not configured." });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment verification fields." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed." });
  }

  const cartItems = Array.isArray(items) ? items : [];
  const products = readProducts();
  const amountTotalCents = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return product ? sum + product.priceInPaise * item.quantity : sum;
  }, 0);

  const order = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    items: cartItems,
    amountTotalCents,
    createdAt: new Date().toISOString(),
  };
  addOrder(order);
  decrementStock(cartItems);

  res.json({ status: "paid", amountTotalCents });
});

export default router;
