// Thin wrapper around the storefront backend API.
// In dev, Vite proxies /api to http://localhost:5001 (see vite.config.js).
// In production, set VITE_API_BASE to the deployed backend's URL + /api.
const BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  getProducts: () => request("/products"),
  getProduct: (id) => request(`/products/${id}`),
  createOrder: (items) =>
    request("/checkout", { method: "POST", body: JSON.stringify({ items }) }),
  verifyPayment: (payload) =>
    request("/checkout/verify", { method: "POST", body: JSON.stringify(payload) }),
  adminVerify: (token) => request("/admin/verify", { headers: { "x-admin-token": token } }),
  adminGetOrders: (token) => request("/admin/orders", { headers: { "x-admin-token": token } }),
  adminUpdateStock: (id, stock, token) =>
    request(`/admin/products/${id}`, {
      method: "PATCH",
      headers: { "x-admin-token": token },
      body: JSON.stringify({ stock }),
    }),
  sendChatMessage: (message) =>
    request("/chat", { method: "POST", body: JSON.stringify({ message }) }).then((data) => data.reply),
};
