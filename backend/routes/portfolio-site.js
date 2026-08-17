import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateResumePdf } from "../lib/generateResumePdf.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const ASSETS_DIR = path.join(__dirname, "..", "assets", "portfolio-site");

function readPortfolioData() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, "portfolio-site.json"), "utf-8"));
}

const router = Router();

// Serves the personal portfolio site's content (Sathish's experience,
// projects, skills, etc — see portfolio/src, which fetches this on load
// instead of bundling a static data.js, so editing this JSON updates the
// live site without a rebuild/redeploy).
router.get("/data", (req, res) => {
  try {
    res.json(readPortfolioData());
  } catch (err) {
    console.error("Failed to load portfolio-site.json:", err.message);
    res.status(500).json({ error: "Could not load portfolio data." });
  }
});

// Generates the resume PDF fresh from portfolio-site.json on every
// request — editing the JSON keeps this in sync automatically, instead
// of a static PDF file that silently drifts from the site's content.
router.get("/resume", (req, res) => {
  try {
    const data = readPortfolioData();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Sathish_Chakali_Resume.pdf"');
    generateResumePdf(data, res);
  } catch (err) {
    console.error("Failed to generate resume PDF:", err.message);
    res.status(500).json({ error: "Could not generate resume." });
  }
});

// Static reference doc linked from the "Object Design Field Guide"
// project — moved here alongside the rest of the portfolio content.
router.get("/oop-reference", (req, res) => {
  const filePath = path.join(ASSETS_DIR, "oop-reference.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Failed to serve oop-reference.html:", err.message);
      if (!res.headersSent) res.status(404).json({ error: "Not found." });
    }
  });
});

export default router;
