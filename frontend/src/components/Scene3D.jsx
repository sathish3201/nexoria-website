import { Suspense } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";
import useInViewOnce from "../hooks/useInViewOnce.js";

/**
 * Gates a lazy-loaded @react-three/fiber scene behind two conditions: the
 * visitor hasn't asked for reduced motion, and the section has actually
 * scrolled into view. Either condition failing renders `fallback` (real 2D
 * markup, not a spinner) instead — no <Canvas> is ever mounted, no
 * three/@react-three/fiber chunk is ever requested, in either case. A
 * static (non-animating) Canvas would still pay the full WebGL + bundle
 * cost for zero benefit to a reduced-motion visitor, so we skip it
 * entirely rather than mounting a frozen scene.
 *
 * `scene` is a component reference from React.lazy(() => import(...)),
 * constructed by the caller so each 3D scene stays in its own code-split
 * chunk and is never imported eagerly.
 */
export default function Scene3D({
  scene: LazyScene,
  fallback = null,
  threshold = 0.2,
  className = "",
  style,
  ...sceneProps
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [ref, inView] = useInViewOnce(threshold);

  const showScene = !prefersReducedMotion && inView;

  return (
    <div ref={ref} className={className} style={style}>
      {showScene ? (
        <Suspense fallback={fallback}>
          <LazyScene {...sceneProps} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}
