import { useEffect, useState, type RefObject } from 'react';

export function useInView<T extends Element>(ref: RefObject<T | null>, options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return inView;
}
