import { useEffect, useRef, useState } from "react";

// Standalone one-shot IntersectionObserver hook: once the observed element
// scrolls into view, `inView` flips true permanently (the observer then
// disconnects). Used to gate mounting a 3D Canvas so we never pay the
// three/@react-three/fiber bundle or WebGL cost for a section the visitor
// never scrolls to.
export default function useInViewOnce(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
