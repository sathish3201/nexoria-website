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
    question: "What about shipping / delivery?",
    answer:
      "This is a demo storefront, so no real shipping happens — in a production build, shipping timelines and carrier options would show here at checkout.",
  },
  {
    question: "What about returns / refunds?",
    answer:
      "This is a demo storefront, so no real orders or refunds are processed. A production version would have a standard returns policy here.",
  },
  {
    question: "How does payment / checkout work?",
    answer:
      "Checkout runs on Razorpay in test mode — no real payment is charged. Use a Razorpay test card or test UPI ID to complete a demo purchase.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Since this is a demo storefront, orders aren't fulfilled or shipped — but a completed test checkout will show up in the admin dashboard.",
  },
  {
    question: "How do I check stock / inventory?",
    answer:
      "Stock levels are shown on each product card. This demo includes a simple admin dashboard for managing inventory.",
  },
  {
    question: "How do I get support / contact you?",
    answer:
      "This is a portfolio/demo project by EKADHANTHA Technologies — for real support inquiries, please use the Contact page on the main EKADHANTHA site.",
  },
];

// Builds a compact, plain-text summary of the store's real product +
// FAQ content to inject into the model's prompt — same pattern as
// EKADHANTHA's own chat route (backend/routes/chat.js in the parent site).
function buildKnowledgeSummary() {
  const products = readJSON("products.json");

  const productsText = products
    .map((p) => `- ${p.name}: ${formatPrice(p.priceInPaise)}. ${p.description} (${p.stock} in stock.)`)
    .join("\n");

  const faqText = FAQ_ENTRIES.map((f) => `- Q: ${f.question}\n  A: ${f.answer}`).join("\n");

  return `PRODUCTS:\n${productsText}\n\nFREQUENTLY ASKED QUESTIONS:\n${faqText}`;
}

function buildSystemPrompt() {
  return `You are the chat assistant on the Trailhead Goods demo storefront (a portfolio project by EKADHANTHA Technologies). Answer visitor questions using ONLY the information below. Be concise (2-4 sentences unless more detail is clearly needed). If a question isn't covered by this information, say you don't have that specific detail. Never invent products, prices, or policies that aren't listed here.

${buildKnowledgeSummary()}`;
}

const UNCONFIGURED_ANSWER =
  "The AI chat isn't configured on this deployment yet. Try asking about a product, shipping, payment, or returns.";

const UNAVAILABLE_ANSWER =
  "I couldn't reach the AI assistant right now — it may be offline at the moment. Please try again shortly.";

const router = Router();

router.post("/", async (req, res) => {
  const { message, history } = req.body;
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedMessage) {
    return res.status(400).json({ error: "Message must not be empty." });
  }

  const modelUrl = process.env.LOCAL_MODEL_URL;
  const modelApiKey = process.env.LOCAL_MODEL_API_KEY;
  const modelName = process.env.LOCAL_MODEL_NAME || "gemma3:1b";

  if (!modelUrl || !modelApiKey) {
    console.error("LOCAL_MODEL_URL / LOCAL_MODEL_API_KEY not configured.");
    return res.status(200).json({ reply: UNCONFIGURED_ANSWER });
  }

  let systemPrompt;
  try {
    systemPrompt = buildSystemPrompt();
  } catch (err) {
    console.error("Failed to build chat knowledge base:", err.message);
    return res.status(500).json({ error: "Could not load store content." });
  }

  const priorTurns = Array.isArray(history)
    ? history.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    : [];

  // Gemma's chat template has no "system" role and strictly enforces
  // alternating user/assistant turns — a separate system-role message
  // breaks its Jinja template ("Conversation roles must alternate
  // user/assistant/..."). Fold the system prompt into the current user
  // turn instead. The question goes FIRST, instructions/context AFTER,
  // then the question is restated at the very end — burying the actual
  // question at the end of a long instructional block made Gemma 3 1B
  // emit an early stop token (0-1 output tokens) instead of answering;
  // this ordering reliably produces a real answer instead.
  const messages = [
    ...priorTurns,
    {
      role: "user",
      content: `Visitor question: ${trimmedMessage}\n\n---\n\n${systemPrompt}\n\n---\n\nNow answer the visitor's question: "${trimmedMessage}"`,
    },
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    const response = await fetch(`${modelUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modelApiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.4,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("Local model request failed (storefront chat):", response.status, await response.text().catch(() => ""));
      return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    return res.json({ reply: reply || UNAVAILABLE_ANSWER });
  } catch (err) {
    console.error("Error calling local model (storefront chat):", err.message);
    return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
  }
});

export default router;
