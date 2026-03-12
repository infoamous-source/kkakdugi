import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BANK_THEME } from '../data';

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
    <div className="flex flex-col h-full items-center justify-center" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Spinning circle */}
      <div className="mb-6">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="animate-spin">
          <circle cx="32" cy="32" r="28" stroke={BANK_THEME.borderLight} strokeWidth="4" />
          <path
            d="M32 4C45.255 4 56 14.745 56 28"
            stroke={BANK_THEME.primary}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="font-bold text-base mb-2" style={{ color: BANK_THEME.text }}>
        {t('bank.processing.title', '처리 중...')}
      </p>
      <p className="text-sm" style={{ color: BANK_THEME.textLight }}>
        {t('bank.processing.wait', '잠시만 기다려 주세요')}
      </p>
    </div>
  );
}
