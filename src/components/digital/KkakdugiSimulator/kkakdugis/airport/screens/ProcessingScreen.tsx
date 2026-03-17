import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIRPORT_THEME } from '../data';

interface Props {
  onNext: () => void;
}

export default function ProcessingScreen({ onNext }: Props) {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Animate plane upward
    const animFrame = requestAnimationFrame(function animate() {
      setOffset(prev => {
        if (prev < 80) {
          requestAnimationFrame(animate);
          return prev + 0.5;
        }
        return prev;
      });
    });

    // Auto-advance after 2.5s
    const timer = setTimeout(onNext, 2500);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, [onNext]);

  return (
    <div
      className="flex flex-col h-full items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0C4A6E 0%, #0369A1 60%, #0EA5E9 100%)' }}
    >
      {/* Animated airplane */}
      <div
        style={{
          transform: `translateY(-${offset}px) rotate(-15deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path
            d="M15 48L28 43L34 32L37 32L34 43L52 38L56 30L59 30L55 40L66 37L66 40L55 45L59 54L56 54L52 46L34 51L37 62L34 62L28 51L15 56L15 52L25 48L15 44Z"
            fill="rgba(255,255,255,0.9)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="text-white font-bold text-lg tracking-wide">
          {t('airport.processing.title', '체크인 처리 중...')}
        </p>
        <p className="text-sm" style={{ color: 'rgba(186,230,253,0.8)' }}>
          {t('airport.processing.subtitle', '잠시만 기다려 주세요')}
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: AIRPORT_THEME.gold,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
