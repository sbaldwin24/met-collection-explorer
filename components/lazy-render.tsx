import { type ReactNode, useEffect, useRef, useState } from 'react';

interface LazyRenderProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}

export function LazyRender({ children, className, rootMargin = '0px' }: LazyRenderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || isVisible) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)',
        willChange: 'opacity'
      }}
    >
      {isVisible ? children : null}
    </div>
  );
}
