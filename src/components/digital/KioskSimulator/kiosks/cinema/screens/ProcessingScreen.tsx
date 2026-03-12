import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CINEMA_THEME } from '../data';

interface Props {
  onDone: () => void;
}

export default function ProcessingScreen({ onDone }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="flex flex-col h-full items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #1A0A2E 0%, #4C1D95 100%)' }}
    >
      {/* Spinner */}
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-full animate-spin"
          style={{
            border: '3px solid rgba(124,58,237,0.2)',
            borderTopColor: CINEMA_THEME.gold,
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="7" width="16" height="11" rx="2" stroke={CINEMA_THEME.gold} strokeWidth="1.5" />
            <path d="M4 10.5H20" stroke={CINEMA_THEME.gold} strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <p className="font-bold text-base mb-2" style={{ color: CINEMA_THEME.text }}>
        {t('cinema.processing.title', '결제 처리 중...')}
      </p>
      <p className="text-xs" style={{ color: 'rgba(196,181,253,0.7)' }}>
        {t('cinema.processing.sub', '잠시만 기다려 주세요')}
      </p>
    </div>
  );
}
