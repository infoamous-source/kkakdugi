import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackSuccess, feedbackTap } from '../../../core/haptics';
import { GOVERNMENT_THEME, formatPrice } from '../data';

interface Props {
  totalFee: number;
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentScreen({ totalFee, onNext, onBack }: Props) {
  const { t } = useTranslation();

  // Auto-advance if free
  useEffect(() => {
    if (totalFee === 0) {
      const timer = setTimeout(() => {
        onNext();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [totalFee, onNext]);

  // Free document - auto-skip
  if (totalFee === 0) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: GOVERNMENT_THEME.bgLight }}>
        <div
          className="px-4 py-3 flex-shrink-0 text-center"
          style={{ backgroundColor: GOVERNMENT_THEME.headerBg }}
        >
          <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
            {t('government.payment.title', '결제')}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 64, height: 64, backgroundColor: '#F0FDF4' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 16L14 22L24 10" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-bold text-lg" style={{ color: '#16A34A' }}>
            {t('government.payment.noFee', '수수료 없음')}
          </p>
          <p className="text-sm" style={{ color: GOVERNMENT_THEME.textLight }}>
            {t('government.payment.freeAdvance', '자동으로 진행됩니다...')}
          </p>
        </div>
      </div>
    );
  }

  // Paid document
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: GOVERNMENT_THEME.bgLight }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: GOVERNMENT_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('government.payment.cancel', '취소')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('government.payment.title', '결제')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Amount display */}
        <div
          className="rounded px-4 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#1E293B' }}
        >
          <span className="text-sm" style={{ color: 'rgba(203,213,225,0.6)' }}>
            {t('government.payment.amountLabel', '납부 금액')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ color: GOVERNMENT_THEME.accent, fontSize: 26 }}>
              {formatPrice(totalFee)}
            </span>
            <span className="text-sm font-medium" style={{ color: GOVERNMENT_THEME.accent }}>
              {t('government.won', '원')}
            </span>
          </div>
        </div>

        {/* Payment method - card */}
        <div
          className="rounded px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'white', border: `1.5px solid ${GOVERNMENT_THEME.accent}` }}
        >
          <div
            className="flex items-center justify-center rounded flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: '#EFF6FF' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke={GOVERNMENT_THEME.accent} strokeWidth="1.5" />
              <path d="M2 8.5H18" stroke={GOVERNMENT_THEME.accent} strokeWidth="1.5" />
              <rect x="4.5" y="11" width="4" height="2" rx="0.5" fill={GOVERNMENT_THEME.accent} />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: GOVERNMENT_THEME.text }}>
              {t('government.payment.cardMethod', '카드 결제')}
            </p>
            <p className="text-xs" style={{ color: GOVERNMENT_THEME.textLight }}>
              {t('government.payment.cardSub', '신용카드 / 체크카드')}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 20, height: 20, backgroundColor: GOVERNMENT_THEME.accent }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.5 7.5L8 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card reader illustration */}
        <div
          className="flex-1 flex flex-col items-center justify-center rounded"
          style={{ backgroundColor: 'white', border: '1.5px dashed #CBD5E1' }}
        >
          <div className="mb-4">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              {/* Terminal body */}
              <rect x="15" y="10" width="60" height="70" rx="6" fill="#E2E8F0" />
              <rect x="18" y="13" width="54" height="67" rx="4" fill="#F1F5F9" />
              {/* Screen */}
              <rect x="22" y="17" width="46" height="28" rx="3" fill="#1E293B" />
              <rect x="25" y="20" width="40" height="22" rx="2" fill="#0F172A" />
              {/* Screen text lines */}
              <rect x="28" y="25" width="18" height="2" rx="1" fill="rgba(14,165,233,0.5)" />
              <rect x="28" y="30" width="30" height="3" rx="1.5" fill={GOVERNMENT_THEME.accent} />
              <rect x="28" y="36" width="14" height="2" rx="1" fill="rgba(14,165,233,0.35)" />
              {/* Keypad */}
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={24 + col * 14}
                    y={52 + row * 8}
                    width="10"
                    height="5"
                    rx="1"
                    fill="#CBD5E1"
                  />
                ))
              )}
              {/* Card slot */}
              <rect x="22" y="76" width="46" height="5" rx="1" fill="#CBD5E1" />
              <rect x="25" y="77.5" width="40" height="2" rx="0.5" fill="#94A3B8" />
              {/* Card being inserted */}
              <rect x="30" y="72" width="30" height="8" rx="1.5" fill={GOVERNMENT_THEME.accent} opacity="0.55" />
              <rect x="30" y="73" width="30" height="3" rx="0.5" fill="rgba(14,165,233,0.35)" />
            </svg>
          </div>

          <p className="font-bold text-sm text-center mb-1" style={{ color: GOVERNMENT_THEME.text }}>
            {t('government.payment.insertGuide', '카드를 삽입해 주세요')}
          </p>
          <p className="text-xs text-center" style={{ color: GOVERNMENT_THEME.textLight }}>
            {t('government.payment.insertSub', '신용카드 또는 체크카드')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => { feedbackTap(); onBack(); }}
            className="py-4 rounded font-bold text-sm transition-opacity hover:opacity-75"
            style={{ backgroundColor: '#E2E8F0', color: GOVERNMENT_THEME.textLight, width: '35%' }}
          >
            {t('government.payment.cancelBtn', '취소')}
          </button>
          <button
            onClick={() => { feedbackSuccess(); onNext(); }}
            className="flex-1 py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: GOVERNMENT_THEME.accent, color: 'white' }}
          >
            {t('government.payment.payBtn', '결제')}
          </button>
        </div>
      </div>
    </div>
  );
}
