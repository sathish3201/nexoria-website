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
    question: "Is my data safe / secure?",
    answer:
      "All code and systems are built directly in your own secure cloud accounts, we sign NDAs before any project details are shared, and we use modern end-to-end encryption standards throughout.",
  },
  {
    question: "Who owns the code / IP after the project?",
    answer:
      "Once a project is completed, 100% of the intellectual property, repository access, and database credentials belong exclusively to you.",
  },
  {
    question: "Do you build mobile apps?",
    answer:
      "Yes — we use React Native to build cross-platform mobile apps for iOS and Android, saving time and cost while maintaining near-native performance.",
  },
  {
    question: "Are there hidden fees?",
    answer:
      "No hidden fees. We use fixed-scope proposals: once scope, cost, and timeline are agreed on, the price is locked with no surprise invoices.",
  },
  {
    question: "How do I get started / hire you?",
    answer:
      "Head to the Contact page to fill out the form, or reach out directly, and we'll get back to you with a fixed-scope proposal.",
  },
  {
    question: "How can I contact you?",
    answer:
      "You can reach us through the Contact page — submit the form there and we'll get back to you, typically within 1 business day.",
  },
];

// Builds a compact, plain-text summary of the site's real business
// content (services, pricing, FAQ) to inject into the model's system
// prompt — this is what lets a small local model (Gemma/Phi) answer
// with accurate, Nexoria-specific information instead of generic text.
function buildKnowledgeSummary() {
  const services = readJSON("services.json");
  const pricing = readJSON("pricing.json");

  const servicesText = services
    .map((s) => `- ${s.title}: ${s.summary} (${s.highlights.join(", ")})`)
    .join("\n");

  const pricingText = pricing
    .map(
      (p) =>
        `- ${p.name} (${p.priceLabel}, ${p.cadence}): best for ${p.bestFor} Includes: ${p.features.join(", ")}.`
    )
    .join("\n");

  const faqText = FAQ_ENTRIES.map((f) => `- Q: ${f.question}\n  A: ${f.answer}`).join("\n");

  return `SERVICES OFFERED:\n${servicesText}\n\nPRICING PLANS:\n${pricingText}\n\nFREQUENTLY ASKED QUESTIONS:\n${faqText}`;
}

function buildSystemPrompt() {
  return `You are Nexo AI, the chat assistant on the Nexoria Technologies website. Answer visitor questions using ONLY the business information below. Be concise (2-4 sentences unless more detail is clearly needed). If a question isn't covered by this information, say you don't have that specific detail and point the visitor to the Contact page. Never invent pricing, services, or policies that aren't listed here.

${buildKnowledgeSummary()}`;
}

const FALLBACK_ANSWER =
  "I don't have a specific answer for that yet. For anything beyond our services, pricing, or portfolio, please reach out on the Contact page (/contact) and our team will get back to you directly.";

const UNAVAILABLE_ANSWER =
  "Nexo AI is temporarily unavailable. Please try again in a moment, or reach out on the Contact page and our team will get back to you directly.";

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
    return res.status(200).json({ reply: FALLBACK_ANSWER });
  }

  let systemPrompt;
  try {
    systemPrompt = buildSystemPrompt();
  } catch (err) {
    console.error("Failed to build chat knowledge base:", err.message);
    return res.status(500).json({ error: "Could not load site content." });
  }

  // history comes from the frontend as [{role, content}, ...] — already
  // in OpenAI chat-completions shape, so it's forwarded as-is.
  const priorTurns = Array.isArray(history)
    ? history.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    : [];

  const messages = [
    { role: "system", content: systemPrompt },
    ...priorTurns,
    { role: "user", content: trimmedMessage },
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

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
        max_tokens: 300,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("Local model request failed:", response.status, await response.text().catch(() => ""));
      return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(200).json({ reply: FALLBACK_ANSWER });
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Error calling local model:", err.message);
    return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
  }
});

export default router;
