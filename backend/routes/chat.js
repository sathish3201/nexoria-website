import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
}

const FAQ_ENTRIES = [
  {
    keywords: ["safe", "security", "secure", "data", "privacy", "protect"],
    answer:
      "All code and systems are built directly in your own secure cloud accounts, we sign NDAs before any project details are shared, and we use modern end-to-end encryption standards throughout.",
  },
  {
    keywords: ["own", "ownership", "ip", "intellectual property", "code belong"],
    answer:
      "Once a project is completed, 100% of the intellectual property, repository access, and database credentials belong exclusively to you.",
  },
  {
    keywords: ["mobile", "app", "ios", "android", "react native"],
    answer:
      "Yes — we use React Native to build cross-platform mobile apps for iOS and Android, saving time and cost while maintaining near-native performance.",
  },
  {
    keywords: ["hidden fee", "hidden cost", "extra cost", "surprise"],
    answer:
      "No hidden fees. We use fixed-scope proposals: once scope, cost, and timeline are agreed on, the price is locked with no surprise invoices.",
  },
  {
    keywords: ["get started", "start a project", "how do i begin", "hire", "work with you"],
    answer:
      "Head to the Contact page to fill out the form, or reach out directly, and we'll get back to you with a fixed-scope proposal.",
  },
  {
    keywords: ["contact", "reach", "email", "phone", "talk"],
    answer:
      "You can reach us through the Contact page — submit the form there and we'll get back to you, typically within 1 business day.",
  },
];

function buildKnowledgeBase() {
  const services = readJSON("services.json");
  const pricing = readJSON("pricing.json");
  const portfolio = readJSON("portfolio.json");
  const blog = readJSON("blog.json");

  const entries = [];

  for (const s of services) {
    entries.push({
      keywords: [s.title, s.summary, ...s.highlights].join(" "),
      answer: `${s.title}: ${s.summary} ${s.details}`,
    });
  }

  for (const p of pricing) {
    entries.push({
      keywords: [p.name, "pricing", "price", "cost", p.priceLabel, p.bestFor, ...p.features].join(" "),
      answer: `${p.name} (${p.priceLabel}, ${p.cadence}): best for ${p.bestFor} Includes: ${p.features.join(", ")}.`,
    });
  }

  for (const p of portfolio) {
    entries.push({
      keywords: [p.title, p.category, p.description, ...p.tags].join(" "),
      answer: `${p.title} (${p.category}): ${p.description}`,
    });
  }

  for (const b of blog) {
    entries.push({
      keywords: [b.title, b.excerpt, ...b.tags].join(" "),
      answer: `From our blog, "${b.title}": ${b.excerpt}`,
    });
  }

  for (const faq of FAQ_ENTRIES) {
    entries.push({ keywords: faq.keywords.join(" "), answer: faq.answer, priority: 2 });
  }

  return entries.map((e) => ({ ...e, priority: e.priority || 1, tokens: tokenize(e.keywords) }));
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "you", "your", "i", "we", "what",
  "how", "can", "will", "to", "of", "for", "in", "on", "and", "or", "with",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function buildDocumentFrequency(knowledgeBase) {
  const freq = new Map();
  for (const entry of knowledgeBase) {
    for (const token of new Set(entry.tokens)) {
      freq.set(token, (freq.get(token) || 0) + 1);
    }
  }
  return freq;
}

function findBestMatch(message, knowledgeBase, documentFrequency) {
  const messageTokens = tokenize(message);
  if (messageTokens.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    const matched = messageTokens.filter((t) => entry.tokens.includes(t));
    if (matched.length === 0) continue;

    // Weight rare, distinctive tokens more than common ones (e.g. "database"
    // matters more than "skills"), and boost curated FAQ entries so a sparse
    // query doesn't fall through to a longer answer that only shares one
    // incidental word.
    const score =
      matched.reduce((sum, t) => sum + 1 / (documentFrequency.get(t) || 1), 0) * entry.priority;

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best;
}

const FALLBACK_ANSWER =
  "I don't have a specific answer for that yet. For anything beyond our services, pricing, or portfolio, please reach out on the Contact page (/contact) and our team will get back to you directly.";

const router = Router();

router.post("/", (req, res) => {
  const { message } = req.body;
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    return res.status(400).json({ error: "Message must not be empty." });
  }

  let knowledgeBase;
  try {
    knowledgeBase = buildKnowledgeBase();
  } catch (err) {
    console.error("Failed to build chat knowledge base:", err.message);
    return res.status(500).json({ error: "Could not load site content." });
  }

  const documentFrequency = buildDocumentFrequency(knowledgeBase);
  const match = findBestMatch(trimmedMessage, knowledgeBase, documentFrequency);
  const reply = match ? match.answer : FALLBACK_ANSWER;

  return res.json({ reply });
});

export default router;
