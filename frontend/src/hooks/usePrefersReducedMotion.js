import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Tracks the visitor's OS-level reduced-motion preference so animated /
// Three.js sections can be skipped entirely for people who've asked for
// less motion, rather than just paused or slowed down.
export default function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handleChange = (e) => setPrefersReduced(e.matches);

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}
