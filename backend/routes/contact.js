import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUBMISSIONS_DIR = path.join(__dirname, "..", "submissions");
const SUBMISSIONS_FILE = path.join(SUBMISSIONS_DIR, "submissions.json");

if (!fs.existsSync(SUBMISSIONS_DIR)) fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, "[]");

const router = Router();

// POST /api/contact - receive a lead/contact form submission
router.post("/", (req, res) => {
  const { name, email, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields. 'name', 'email', and 'message' are required.",
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const submission = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name,
    email,
    company: company || "",
    service: service || "General inquiry",
    message,
    submittedAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    existing.push(submission);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("Failed to persist submission:", err);
    return res.status(500).json({ error: "Something went wrong saving your message. Please try again." });
  }

  return res.status(201).json({
    message: "Thanks for reaching out! We'll get back to you within 1 business day.",
    submission,
  });
});

// GET /api/contact - list submissions (simple internal admin view; no auth yet)
router.get("/", (req, res) => {
  try {
    const existing = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: "Could not read submissions." });
  }
});

export default router;
