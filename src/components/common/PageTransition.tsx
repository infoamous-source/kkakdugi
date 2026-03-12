import { useLocation } from 'react-router-dom';
import { useEffect, useRef, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove('animate-page-enter');
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('animate-page-enter');
  }, [location.pathname]);

  return (
    <div ref={ref} className="animate-page-enter">
      {children}
    </div>
  );
}
