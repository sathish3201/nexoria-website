import { useState } from "react";
import { api } from "../api.js";

const GREETING = {
  role: "assistant",
  content: "Hi! I'm the Trailhead Goods assistant. Ask me about a product, shipping, payment, or returns.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const reply = await api.sendChatMessage(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Store Assistant</span>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && <div className="chat-bubble chat-bubble-assistant">Thinking…</div>}
            {error && <div className="chat-bubble chat-bubble-error">{error}</div>}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              disabled={sending}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)}>
          💬 Chat with us
        </button>
      )}
    </div>
  );
}
