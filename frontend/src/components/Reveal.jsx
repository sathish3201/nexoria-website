import useReveal from "../hooks/useReveal.js";
import "./Reveal.css";

// One-shot IntersectionObserver fade-in wrapper. direction: "up" (default,
// fade + rise), "left"/"right" (3D perspective rotateY slide-in converging
// to center, not a flat 2D slide). Alternate direction by index across card
// grids for visual variety.
export default function Reveal({ as: Tag = "div", delay = 0, direction = "up", className = "", children }) {
  const [ref, visible] = useReveal();
  const state = visible ? "visible" : "hidden";

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${direction}-${state} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
