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

// Lets the portfolio site's navbar show a live "model online/offline"
// badge without ever exposing LOCAL_MODEL_API_KEY to the browser — the
// key stays server-side, the frontend only ever sees a boolean. Uses
// GET /v1/models (the standard OpenAI-compatible health-check path)
// instead of a full chat completion, since it's cheap and doesn't
// consume the model's context.
router.get("/model-status", async (req, res) => {
  const modelUrl = process.env.LOCAL_MODEL_URL;
  const modelApiKey = process.env.LOCAL_MODEL_API_KEY;

  if (!modelUrl || !modelApiKey) {
    return res.json({ online: false });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const response = await fetch(`${modelUrl.replace(/\/$/, "")}/v1/models`, {
      headers: { Authorization: `Bearer ${modelApiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return res.json({ online: response.ok });
  } catch (err) {
    console.warn("Model status check failed:", err.message);
    return res.json({ online: false });
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
