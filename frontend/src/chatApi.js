// Thin wrapper around the Nexo AI chat endpoint on the main backend.
// In dev, Vite proxies /api to http://localhost:5000 (see vite.config.js).
// In production, set VITE_API_BASE to the deployed backend's URL + /api.
const BASE = import.meta.env.VITE_API_BASE || "/api";

export async function sendChatMessage(message, history) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Nexo AI could not respond. Please try again.");
  }
  return data.reply;
}
