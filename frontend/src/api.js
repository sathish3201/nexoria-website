// Thin wrapper around the backend API.
// In dev, Vite proxies /api to http://localhost:5000 (see vite.config.js).
const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  getServices: () => request("/services"),
  getPricing: () => request("/pricing"),
  getPortfolio: () => request("/portfolio"),
  getBlog: () => request("/blog"),
  submitContact: (payload) =>
    request("/contact", { method: "POST", body: JSON.stringify(payload) }),
};
