import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
}

function formatPrice(paise) {
  return `₹${(paise / 100).toFixed(2)}`;
}

const FAQ_ENTRIES = [
  {
    keywords: ["shipping", "delivery", "deliver", "ship", "how long"],
    answer:
      "This is a demo storefront, so no real shipping happens — in a production build, shipping timelines and carrier options would show here at checkout.",
  },
  {
    keywords: ["return", "refund", "exchange", "money back"],
    answer:
      "This is a demo storefront, so no real orders or refunds are processed. A production version would have a standard returns policy here.",
  },
  {
    keywords: ["payment", "pay", "checkout", "razorpay", "card", "upi"],
    answer:
      "Checkout runs on Razorpay in test mode — no real payment is charged. Use a Razorpay test card or test UPI ID to complete a demo purchase.",
  },
  {
    keywords: ["track", "order status", "where is my order"],
    answer:
      "Since this is a demo storefront, orders aren't fulfilled or shipped — but a completed test checkout will show up in the admin dashboard.",
  },
  {
    keywords: ["stock", "inventory", "available", "out of stock"],
    answer:
      "Stock levels are shown on each product card. This demo includes a simple admin dashboard for managing inventory.",
  },
  {
    keywords: ["contact", "support", "help", "admin"],
    answer:
      "This is a portfolio/demo project by Nexoria Technologies — for real support inquiries, please use the Contact page on the main Nexoria site.",
  },
];

function buildKnowledgeBase() {
  const products = readJSON("products.json");
  const entries = [];

  for (const p of products) {
    entries.push({
      keywords: [p.name, p.description].join(" "),
      answer: `${p.name} — ${formatPrice(p.priceInPaise)}. ${p.description} (${p.stock} in stock.)`,
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
  "I don't have a specific answer for that. Try asking about a product, shipping, payment, or returns — this is a demo storefront built by Nexoria Technologies.";

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
    return res.status(500).json({ error: "Could not load store content." });
  }

  const documentFrequency = buildDocumentFrequency(knowledgeBase);
  const match = findBestMatch(trimmedMessage, knowledgeBase, documentFrequency);
  const reply = match ? match.answer : FALLBACK_ANSWER;

  return res.json({ reply });
});

export default router;
