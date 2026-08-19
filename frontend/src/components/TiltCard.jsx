import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import "./TiltCard.css";

// Reusable pointer-tilt + lift + cursor-tracking spotlight wrapper, applied
// across every card grid (Services, Pricing, Portfolio, Blog) instead of
// copy-pasting this per page. Wraps `children` — usually a .card /
// .pricing-card element — in a 3D-perspective container that rotates
// toward the cursor, springs back flat on mouse-leave, and shows a soft
// radial "light" that follows the pointer across the card's surface.
//
// This is a pointer-driven interaction, not autoplaying animation, so
// prefers-reduced-motion isn't checked here — rotation amounts are kept
// small (max ~8deg) specifically so it stays comfortable either way.
const MAX_TILT_DEG = 8;

export default function TiltCard({ children, className = "", style }) {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [MAX_TILT_DEG, -MAX_TILT_DEG]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-MAX_TILT_DEG, MAX_TILT_DEG]), springConfig);

  const spotlightX = useTransform(mouseX, (v) => `${v * 100}%`);
  const spotlightY = useTransform(mouseY, (v) => `${v * 100}%`);
  const spotlightBackground = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) =>
      `radial-gradient(220px circle at ${x} ${y}, rgba(29, 95, 224, 0.16), rgba(11, 31, 58, 0.08) 45%, transparent 70%)`
  );

  function handleMouseMove(e) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseEnter() {
    setHovering(true);
  }

  function handleMouseLeave() {
    setHovering(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800, ...style }}
      className={`tilt-card ${className}`}
      animate={{ y: hovering ? -4 : 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
      <motion.div
        aria-hidden
        className="tilt-card-spotlight"
        style={{ background: spotlightBackground }}
        animate={{ opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}
