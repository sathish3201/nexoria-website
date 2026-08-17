import { Router } from "express";
import { PORTFOLIO_DATA } from "../data/portfolioData.js";

// Same lesson learned building the Nexoria chat route: a small local
// model (Gemma 3 1B, quantized) falls apart on a long, dense system
// prompt. Only inject the entries relevant to what the visitor actually
// asked, instead of the entire portfolio every time.
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
  "sathish", "he's",
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

function buildKnowledgeSummary(userMessage) {
  const d = PORTFOLIO_DATA;
  const keywords = extractKeywords(userMessage);

  const scoredProjects = d.projects
    .map((p) => ({ item: p, score: scoreText(`${p.title} ${p.description} ${p.tech.join(" ")}`, keywords) }))
    .sort((a, b) => b.score - a.score);
  const scoredSkills = d.skills
    .map((s) => ({ item: s, score: scoreText(`${s.category} ${s.items.join(" ")}`, keywords) }))
    .sort((a, b) => b.score - a.score);
  const scoredFaq = d.faq
    .map((f) => ({ item: f, score: scoreText(`${f.question} ${f.answer}`, keywords) }))
    .sort((a, b) => b.score - a.score);
  const expScore = scoreText(`${d.experience[0].role} ${d.experience[0].company} ${d.experience[0].summary}`, keywords);
  const certScore = Math.max(
    0,
    ...d.certifications.map((c) => scoreText(`${c.name} ${c.issuer || ""}`, keywords))
  );
  const eduScore = Math.max(0, ...d.education.map((e) => scoreText(`${e.degree} ${e.school}`, keywords)));

  const relevantProjects = scoredProjects.filter((p) => p.score > 0).slice(0, 2).map((p) => p.item);
  const relevantSkills = scoredSkills.filter((s) => s.score > 0).slice(0, 2).map((s) => s.item);
  const relevantFaq = scoredFaq.filter((f) => f.score > 0).slice(0, 2).map((f) => f.item);

  const projectsText = relevantProjects.length
    ? relevantProjects.map((p) => `- ${p.title}: ${p.description} Tech: ${p.tech.join(", ")}.`).join("\n")
    : `- Projects: ${d.projects.map((p) => p.title).join(", ")}.`;

  const skillsText = relevantSkills.length
    ? relevantSkills.map((s) => `- ${s.category}: ${s.items.join(", ")}`).join("\n")
    : `- Skill areas: ${d.skills.map((s) => s.category).join(", ")}.`;

  const faqText = relevantFaq.length
    ? relevantFaq.map((f) => `- Q: ${f.question}\n  A: ${f.answer}`).join("\n")
    : "- (Ask about projects, skills, experience, or how to get in touch.)";

  // Experience, education, and certifications are each small enough on
  // their own to always include in full — only when a question actually
  // touches them does it matter, and skipping them entirely on a miss
  // would make the assistant unable to answer "where did you study" etc.
  const experienceText = expScore > 0 || true
    ? `- ${d.experience[0].role} at ${d.experience[0].company} (${d.experience[0].period}): ${d.experience[0].summary}`
    : "";

  const educationText = eduScore > 0
    ? d.education.map((e) => `- ${e.degree}, ${e.school}${e.period ? ` (${e.period})` : ""}`).join("\n")
    : `- ${d.education[0].degree}, ${d.education[0].school}`;

  const certsText = certScore > 0
    ? d.certifications.map((c) => `- ${c.name}${c.issuer ? ` (${c.issuer})` : ""}, ${c.year}`).join("\n")
    : `- ${d.certifications.length} certifications — ask for specifics.`;

  return `SUMMARY: ${d.summary}
CONTACT: ${d.meta.email} | GitHub: ${d.meta.github} | LinkedIn: ${d.meta.linkedin} | Location: ${d.meta.location}

EXPERIENCE:
${experienceText}

PROJECTS:
${projectsText}

SKILLS:
${skillsText}

EDUCATION:
${educationText}

CERTIFICATIONS:
${certsText}

FREQUENTLY ASKED QUESTIONS:
${faqText}`;
}

function buildSystemPrompt(userMessage) {
  return `You are the chat assistant on ${PORTFOLIO_DATA.meta.name}'s portfolio website. Answer visitor questions using ONLY the information below. Be concise (2-4 sentences unless more detail is clearly needed). Refer to him in the third person. If a question isn't covered by this information, say you don't have that specific detail and point the visitor to his email or LinkedIn. Never invent experience, skills, or projects that aren't listed here.

${buildKnowledgeSummary(userMessage)}`;
}

const UNCONFIGURED_ANSWER =
  "The AI chat isn't configured on this deployment yet. Feel free to reach out directly via email or LinkedIn.";

const UNAVAILABLE_ANSWER =
  "I couldn't reach the AI model right now — it may be offline at the moment. Please try again shortly, or reach out via email/LinkedIn.";

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

  const systemPrompt = buildSystemPrompt(trimmedMessage);

  // Same fix as Nexoria's chat route: the frontend's canned greeting
  // bubble must never be forwarded as if it were a real conversation
  // turn — Gemma's chat template requires the sequence to start with
  // "user" and strictly alternate, and a leading "assistant" turn (the
  // greeting) gets hard-rejected with a 400.
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
    const timeout = setTimeout(() => controller.abort(), 60_000);

    // llama-server has no API key check of its own — the phone's ngrok
    // tunnel is what's protected, via HTTP Basic Auth, not a Bearer
    // token. Send Basic Auth with "apikey" as the username and the API
    // key as the password to match that.
    const basicAuth = Buffer.from(`apikey:${modelApiKey}`).toString("base64");

    const response = await fetch(`${modelUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
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
      console.error("Local model request failed (portfolio chat):", response.status, await response.text().catch(() => ""));
      return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Error calling local model (portfolio chat):", err.message);
    return res.status(200).json({ reply: UNAVAILABLE_ANSWER });
  }
});

export default router;
