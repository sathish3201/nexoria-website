import { useRef, useState, lazy, Suspense } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { sendChatMessage } from "../chatApi.js";

const ChatLoadingOrb = lazy(() => import("./3d/ChatLoadingOrb.jsx"));
const MessageOrb = lazy(() => import("./3d/MessageOrb.jsx"));

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm Nexo AI. How can I help you today with questions about our web/app projects, pricing, or how we handle your data?",
};

const MAX_TILT_DEG = 6;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const panelRef = useRef(null);

  // Header-driven tilt: rotating the whole message list would make text
  // unreadable, so the 3D pointer-tilt is scoped to the header strip only
  // (the same surface used to drag the window), while the window's
  // position is moved via Framer Motion's native `drag` on the outer
  // container.
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [MAX_TILT_DEG, -MAX_TILT_DEG]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-MAX_TILT_DEG, MAX_TILT_DEG]), springConfig);

  function handleHeaderMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleHeaderMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

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
        <motion.div
          ref={panelRef}
          drag
          dragMomentum={false}
          dragElastic={0.08}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          style={{ perspective: 800 }}
          className={`chat-panel ${dragging ? "chat-panel-dragging" : ""}`}
        >
          <motion.div
            onMouseMove={handleHeaderMouseMove}
            onMouseLeave={handleHeaderMouseLeave}
            style={{ rotateX, rotateY, transformPerspective: 800 }}
            className={`chat-header ${dragging ? "chat-header-dragging" : "chat-header-draggable"}`}
          >
            <span>Nexo AI</span>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </motion.div>

          <div className="chat-messages">
            {messages.map((m, i) => {
              // Each orb is its own WebGL context — browsers cap how many
              // can be alive at once (~8-16 depending on browser). Only
              // the most recent messages get a live 3D orb; older ones
              // fall back to a flat dot so a long conversation can't
              // exhaust the context limit or silently break.
              const isRecent = i >= messages.length - 6;
              const accent = m.role === "user" ? "user" : "assistant";
              return (
                <div key={i} className={`chat-message-row chat-message-row-${m.role}`}>
                  <div className="chat-avatar-orb">
                    {isRecent ? (
                      <Suspense fallback={null}>
                        <MessageOrb accent={accent} />
                      </Suspense>
                    ) : (
                      <div className={`chat-avatar-dot chat-avatar-dot-${accent}`} />
                    )}
                  </div>
                  <div className={`chat-bubble chat-bubble-${m.role}`}>{m.content}</div>
                </div>
              );
            })}
            {sending && (
              <div className="chat-message-row chat-message-row-assistant">
                <div className="chat-avatar-orb">
                  <Suspense fallback={null}>
                    <ChatLoadingOrb />
                  </Suspense>
                </div>
                <div className="chat-bubble chat-bubble-assistant">Thinking…</div>
              </div>
            )}
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
        </motion.div>
      )}

      {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)}>
          💬 Chat with Nexo AI
        </button>
      )}
    </div>
  );
}
