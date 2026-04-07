import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types/app';

interface CategoryNavProps {
  categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const { t } = useTranslation('apps');
  const [activeId, setActiveId] = useState<string>(categories[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-sand-50/95 backdrop-blur-sm border-b-2 border-sand-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-0 lg:px-0">
      <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollTo(cat.id)}
            className={`shrink-0 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold transition-all btn-bounce ${
              activeId === cat.id
                ? 'bg-duo-400 text-white shadow-sm border-b-[3px] border-duo-600'
                : 'bg-white text-warm-500 border-2 border-sand-200 hover:border-duo-300 hover:text-duo-500'
            }`}
          >
            {t(cat.nameKey)}
          </button>
        ))}
      </div>
    </nav>
  );
}
