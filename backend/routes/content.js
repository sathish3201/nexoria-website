import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const router = Router();

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
}

router.get("/services", (req, res) => {
  try {
    res.json(readJSON("services.json"));
  } catch (err) {
    res.status(500).json({ error: "Could not load services." });
  }
});

router.get("/pricing", (req, res) => {
  try {
    res.json(readJSON("pricing.json"));
  } catch (err) {
    res.status(500).json({ error: "Could not load pricing." });
  }
});

router.get("/portfolio", (req, res) => {
  try {
    res.json(readJSON("portfolio.json"));
  } catch (err) {
    res.status(500).json({ error: "Could not load portfolio." });
  }
});

router.get("/blog", (req, res) => {
  try {
    res.json(readJSON("blog.json"));
  } catch (err) {
    res.status(500).json({ error: "Could not load blog posts." });
  }
});

export default router;
