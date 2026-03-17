import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { AIRPORT_THEME, formatPrice } from '../data';

interface Props {
  totalFee: number;
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentScreen({ totalFee, onNext, onBack }: Props) {
  const { t } = useTranslation();

  // Auto-advance if no fees
  useEffect(() => {
    if (totalFee === 0) {
      onNext();
    }
  }, [totalFee, onNext]);

  if (totalFee === 0) return null;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: AIRPORT_THEME.surface }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: AIRPORT_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('airport.payment.cancel', '취소')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('airport.payment.title', '추가 요금 결제')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Amount */}
        <div
          className="rounded-xl px-4 py-5 flex items-center justify-between"
          style={{ backgroundColor: AIRPORT_THEME.headerBg }}
        >
          <span className="text-sm" style={{ color: 'rgba(186,230,253,0.7)' }}>
            {t('airport.payment.amount', '결제 금액')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ color: AIRPORT_THEME.gold, fontSize: 28 }}>
              {formatPrice(totalFee)}
            </span>
            <span className="text-sm font-medium" style={{ color: AIRPORT_THEME.gold }}>
              {t('airport.common.won', '원')}
            </span>
          </div>
        </div>

        {/* Card method */}
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'white', border: `1.5px solid ${AIRPORT_THEME.primary}` }}
        >
          <div
            className="flex items-center justify-center rounded flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: '#E0F2FE' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
              <path d="M2 8.5H18" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
              <rect x="4.5" y="11" width="4" height="2" rx="0.5" fill={AIRPORT_THEME.primary} />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: AIRPORT_THEME.text }}>
              {t('airport.payment.card', '카드 결제')}
            </p>
            <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
              {t('airport.payment.cardSub', '신용카드 / 체크카드')}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 20, height: 20, backgroundColor: AIRPORT_THEME.primary }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.5 7.5L8 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card reader */}
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-xl"
          style={{ backgroundColor: 'white', border: '1.5px dashed #CBD5E1' }}
        >
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="15" y="10" width="50" height="60" rx="5" fill="#E0F2FE" />
              <rect x="18" y="13" width="44" height="57" rx="3" fill="#F0F9FF" />
              <rect x="22" y="17" width="36" height="22" rx="2" fill={AIRPORT_THEME.headerBg} />
              <rect x="25" y="21" width="16" height="2" rx="1" fill="rgba(14,165,233,0.5)" />
              <rect x="25" y="26" width="26" height="3" rx="1.5" fill={AIRPORT_THEME.accent} />
              <rect x="25" y="32" width="12" height="2" rx="1" fill="rgba(14,165,233,0.35)" />
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={23 + col * 12}
                    y={44 + row * 7}
                    width="8"
                    height="4"
                    rx="1"
                    fill="#BAE6FD"
                  />
                ))
              )}
              <rect x="22" y="66" width="36" height="4" rx="1" fill="#BAE6FD" />
              <rect x="28" y="62" width="24" height="7" rx="1" fill={AIRPORT_THEME.primary} opacity="0.4" />
            </svg>
          </div>
          <p className="font-bold text-sm text-center mb-1" style={{ color: AIRPORT_THEME.text }}>
            {t('airport.payment.insertGuide', '카드를 삽입해 주세요')}
          </p>
          <p className="text-xs text-center" style={{ color: AIRPORT_THEME.textLight }}>
            {t('airport.payment.insertSub', 'IC칩 방향으로 삽입하세요')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="py-4 rounded-lg font-bold text-sm transition-opacity hover:opacity-75"
            style={{ backgroundColor: '#E2E8F0', color: AIRPORT_THEME.textLight, width: '35%' }}
          >
            {t('airport.payment.cancelBtn', '취소')}
          </button>
          <button
            onClick={() => { feedbackSuccess(); onNext(); }}
            className="flex-1 py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
          >
            {t('airport.payment.payBtn', '결제')}
          </button>
        </div>
      </div>
    </div>
  );
}
