import { useEffect, useState } from "react";
import "./StatusBadge.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const POLL_INTERVAL_MS = 60_000;

// Polls a given endpoint every 60s and reports true/false/null (unknown,
// before the first check resolves). Used for both the "API" dot (site's
// own backend health check) and the "Model" dot (whether the local LLM
// behind the chat is reachable) — same polling shape, different URLs.
function usePolledOnline(path, { parse } = {}) {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    let cancelled = false;

    function check() {
      fetch(`${API_BASE}${path}`)
        .then((res) => {
          if (!res.ok) return false;
          return parse ? res.json().then(parse) : true;
        })
        .then((result) => {
          if (!cancelled) setOnline(Boolean(result));
        })
        .catch(() => {
          if (!cancelled) setOnline(false);
        });
    }

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [path]);

  return online;
}

function Dot({ status }) {
  const stateClass = status === true ? "online" : status === false ? "offline" : "unknown";
  return (
    <span className={`status-dot-wrap status-dot-${stateClass}`}>
      {status === true && <span className="status-dot-ping" />}
      <span className="status-dot" />
    </span>
  );
}

// Small navbar badge showing two live status dots: whether the site's own
// backend API is reachable, and whether the local LLM behind Nexo AI chat
// is reachable. Mirrors the portfolio site's StatusBadge, but polls
// /api/health and /api/model-status directly (no data-context layer here).
export default function StatusBadge() {
  const apiOnline = usePolledOnline("/health", { parse: (json) => json?.status === "ok" });
  const modelOnline = usePolledOnline("/model-status", { parse: (json) => json?.online === true });

  return (
    <div className="status-badge">
      <span className="status-badge-item">
        <Dot status={apiOnline} />
        API
      </span>
      <span className="status-badge-divider" />
      <span className="status-badge-item">
        <Dot status={modelOnline} />
        Model
      </span>
    </div>
  );
}
