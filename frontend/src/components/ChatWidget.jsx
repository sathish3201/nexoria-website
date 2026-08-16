import { useState } from "react";
import { sendChatMessage } from "../chatApi.js";

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm Nexo AI. How can I help you today with questions about our web/app projects, pricing, or how we handle your data?",
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

    // GREETING is a canned UI bubble, not a real conversation turn — the
    // model's chat template (Gemma) requires the turn sequence to start
    // with "user" and strictly alternate user/assistant from there.
    // Sending GREETING as history makes every first message start with
    // "assistant", which the template hard-rejects with a 400. Exclude
    // it from what gets sent as history (by reference — it's a stable
    // module-level constant, so this reliably matches only the greeting
    // bubble and nothing else).
    const history = messages
      .filter((m) => m !== GREETING)
      .map(({ role, content }) => ({ role, content }));
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const reply = await sendChatMessage(text, history);
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
            <span>Nexo AI</span>
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
          💬 Chat with Nexo AI
        </button>
      )}
    </div>
  );
}

