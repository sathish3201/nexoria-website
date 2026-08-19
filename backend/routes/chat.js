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

// Small local models (Gemma 3 1B, quantized) fall apart — repeating
// tokens or producing incoherent output — when handed a long, dense
// system prompt. Dumping the ENTIRE services + pricing + FAQ list into
// every request (~790 tokens) reliably broke Gemma in testing. Instead,
// keep the injected context small by only including the handful of
// entries actually relevant to what the visitor asked, with a compact
// (not full-dump) fallback for generic/unmatched questions.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "being", "to", "of", "in", "on", "at", "for", "with", "about",
  "as", "by", "from", "into", "like", "through", "after", "over",
  "between", "out", "against", "during", "without", "before", "under",
  "around", "among", "i", "you", "he", "she", "it", "we", "they", "what",
  "which", "who", "whom", "this", "that", "these", "those", "am", "do",
  "does", "did", "doing", "will", "would", "should", "could", "can",
  "may", "might", "must", "shall", "not", "your", "my", "our", "their",
  "his", "her", "its", "me", "us", "them", "how", "if", "just", "want",
]);

function extractKeywords(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function scoreText(text, keywords) {
  const words = extractKeywords(text);
  let score = 0;
  for (const w of words) {
    if (keywords.has(w)) score++;
  }
  return score;
}

// Builds a compact, plain-text summary of the site's real business
// content (services, pricing, FAQ), trimmed to what's relevant to the
// visitor's actual message — this is what lets a small local model
// (Gemma/Phi) answer with accurate, EKADHANTHA-specific information
// without the context getting long enough to make it incoherent.
function buildKnowledgeSummary(userMessage) {
  const services = readJSON("services.json");
  const pricing = readJSON("pricing.json");
  const keywords = extractKeywords(userMessage);

  const scoredServices = services
    .map((s) => ({ item: s, score: scoreText(`${s.title} ${s.summary} ${s.highlights.join(" ")}`, keywords) }))
    .sort((a, b) => b.score - a.score);
  const scoredPricing = pricing
    .map((p) => ({ item: p, score: scoreText(`${p.name} ${p.bestFor} ${p.features.join(" ")}`, keywords) }))
    .sort((a, b) => b.score - a.score);
  const scoredFaq = FAQ_ENTRIES
    .map((f) => ({ item: f, score: scoreText(`${f.question} ${f.answer}`, keywords) }))
    .sort((a, b) => b.score - a.score);

  const relevantServices = scoredServices.filter((s) => s.score > 0).slice(0, 2).map((s) => s.item);
  const relevantPricing = scoredPricing.filter((p) => p.score > 0).slice(0, 2).map((p) => p.item);
  const relevantFaq = scoredFaq.filter((f) => f.score > 0).slice(0, 2).map((f) => f.item);

  const servicesText = relevantServices.length
    ? relevantServices.map((s) => `- ${s.title}: ${s.summary} (${s.highlights.join(", ")})`).join("\n")
    : `- We offer: ${services.map((s) => s.title).join(", ")}.`;

  const pricingText = relevantPricing.length
    ? relevantPricing
        .map((p) => `- ${p.name} (${p.priceLabel}, ${p.cadence}): best for ${p.bestFor} Includes: ${p.features.join(", ")}.`)
        .join("\n")
    : `- Plans: ${pricing.map((p) => `${p.name} (${p.priceLabel})`).join(", ")}.`;

  const faqText = relevantFaq.length
    ? relevantFaq.map((f) => `- Q: ${f.question}\n  A: ${f.answer}`).join("\n")
    : "- (Ask about services, pricing, or how to get started for more detail.)";

  return `SERVICES OFFERED:\n${servicesText}\n\nPRICING PLANS:\n${pricingText}\n\nFREQUENTLY ASKED QUESTIONS:\n${faqText}`;
}

function buildSystemPrompt(userMessage) {
  return `You are Nexo AI, the chat assistant on the EKADHANTHA Technologies website. Answer visitor questions using ONLY the business information below. Be concise (2-4 sentences unless more detail is clearly needed). If a question isn't covered by this information, say you don't have that specific detail and point the visitor to the Contact page. Never invent pricing, services, or policies that aren't listed here.

${buildKnowledgeSummary(userMessage)}`;
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
    systemPrompt = buildSystemPrompt(trimmedMessage);
  } catch (err) {
    console.error("Failed to build chat knowledge base:", err.message);
    return res.status(500).json({ error: "Could not load site content." });
  }

  // history comes from the frontend as [{role, content}, ...] — already
  // in OpenAI chat-completions shape, so it's forwarded as-is.
  const priorTurns = Array.isArray(history)
    ? history.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    : [];

  // Gemma's chat template has no "system" role and strictly enforces
  // alternating user/assistant turns — a separate system-role message
  // breaks its Jinja template ("Conversation roles must alternate
  // user/assistant/..."). Fold the system prompt into the current user
  // turn instead (every chat template, Gemma included, accepts this),
  // repeating it each turn so multi-turn context keeps working.
  //
  // The question goes FIRST, instructions/context AFTER: testing showed
  // a small model (Gemma 3 1B) burying the actual question at the end
  // of a long instructional block would emit an early stop token instead
  // of answering — putting the question up front and re-asking it at the
  // very end (small models weight recent tokens heavily) reliably fixed
  // this from generating 0-1 tokens to producing a real answer.
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

    // llama-server now enforces its own --api-key (see start.sh), which
    // checks "Authorization: Bearer <key>" — not the ngrok --basic-auth
    // scheme this used to require.

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
