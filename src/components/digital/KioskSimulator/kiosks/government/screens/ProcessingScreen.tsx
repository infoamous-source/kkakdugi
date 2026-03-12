import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GOVERNMENT_THEME } from '../data';

interface Props {
  onNext: () => void;
}

export default function ProcessingScreen({ onNext }: Props) {
  const { t } = useTranslation();

  // Auto-advance after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: GOVERNMENT_THEME.bgLight }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: GOVERNMENT_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('government.processing.title', '서류 출력')}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Printer SVG animation */}
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Printer body */}
            <rect x="15" y="40" width="90" height="45" rx="6" fill="#334155" />
            <rect x="20" y="45" width="80" height="35" rx="4" fill="#475569" />

            {/* Paper tray top */}
            <rect x="25" y="20" width="70" height="25" rx="3" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="30" y="24" width="60" height="17" rx="2" fill="#F8FAFC" />
            {/* Text lines on input paper */}
            <rect x="35" y="28" width="30" height="2" rx="1" fill="#CBD5E1" />
            <rect x="35" y="33" width="45" height="2" rx="1" fill="#CBD5E1" />
            <rect x="35" y="38" width="20" height="2" rx="1" fill="#CBD5E1" />

            {/* Printer slot */}
            <rect x="25" y="78" width="70" height="4" rx="1" fill="#1E293B" />

            {/* Paper coming out - animated */}
            <g className="animate-bounce" style={{ animationDuration: '1.5s' }}>
              <rect x="30" y="80" width="60" height="32" rx="2" fill="white" stroke="#CBD5E1" strokeWidth="1" />
              {/* Text lines on output paper */}
              <rect x="36" y="86" width="25" height="2" rx="1" fill="#94A3B8" />
              <rect x="36" y="91" width="40" height="2" rx="1" fill="#94A3B8" />
              <rect x="36" y="96" width="35" height="2" rx="1" fill="#94A3B8" />
              <rect x="36" y="101" width="20" height="2" rx="1" fill="#94A3B8" />
              {/* Official stamp circle */}
              <circle cx="72" cy="100" r="6" stroke="#E74C3C" strokeWidth="1" fill="rgba(231,76,60,0.1)" />
            </g>

            {/* Status LED */}
            <circle cx="85" cy="50" r="3" fill={GOVERNMENT_THEME.accent}>
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="font-bold text-base mb-2" style={{ color: GOVERNMENT_THEME.text }}>
            {t('government.processing.message', '서류를 출력하고 있습니다...')}
          </p>
          <p className="text-sm" style={{ color: GOVERNMENT_THEME.textLight }}>
            {t('government.processing.wait', '잠시만 기다려 주세요')}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: GOVERNMENT_THEME.accent,
                animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
