import { useEffect, useRef, type ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedList({ children, className = '' }: AnimatedListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const items = container.querySelectorAll('.animate-on-scroll');
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
