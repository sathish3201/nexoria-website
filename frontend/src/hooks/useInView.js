import { useEffect, useRef, useState } from "react";

// Like useInViewOnce, but keeps tracking visibility instead of
// disconnecting after the first entry — used to gate 3D Canvas mounts so
// scenes actually unmount once scrolled far out of view. Each <Canvas> is
// its own WebGL context, and browsers cap how many can be alive at once
// (~16 in Chrome); a site with many 3D sections all mounted "once visited,
// forever alive" reliably exceeds that cap on a full scroll-through,
// causing "WebGLRenderer: Context Lost" crashes once the browser
// force-evicts older contexts. rootMargin gives scenes a little buffer so
// they mount slightly before entering the viewport and unmount only once
// meaningfully offscreen, avoiding mount/unmount thrashing at the exact
// viewport edge.
export default function useInView(threshold = 0.2, rootMargin = "200px 0px") {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}
