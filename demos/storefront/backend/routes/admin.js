import { Router } from "express";
import { readProducts, writeProducts, readOrders } from "../lib/store.js";

const router = Router();

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Invalid or missing admin token." });
  }
  next();
}

router.use(requireAdmin);

// GET /api/admin/verify - confirm the supplied token is valid
router.get("/verify", (req, res) => {
  res.json({ valid: true });
});

// GET /api/admin/orders - list all orders
router.get("/orders", (req, res) => {
  try {
    res.json(readOrders());
  } catch (err) {
    res.status(500).json({ error: "Could not load orders." });
  }
});

// PATCH /api/admin/products/:id - update stock for a product
router.patch("/products/:id", (req, res) => {
  const { stock } = req.body;
  if (typeof stock !== "number" || stock < 0) {
    return res.status(400).json({ error: "'stock' must be a non-negative number." });
  }

  try {
    const products = readProducts();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });

    product.stock = stock;
    writeProducts(products);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Could not update product." });
  }
});

export default router;
