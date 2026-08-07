import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

function readProducts() {
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
}

const router = Router();

router.get("/", (req, res) => {
  try {
    res.json(readProducts());
  } catch (err) {
    res.status(500).json({ error: "Could not load products." });
  }
});

router.get("/:id", (req, res) => {
  try {
    const product = readProducts().find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Could not load product." });
  }
});

export default router;
