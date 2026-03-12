import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { AIRPORT_THEME, EXTRA_BAG_PRICE, formatPrice } from '../data';

interface Props {
  bagCount: number;
  onBagCountChange: (count: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BaggageScreen({ bagCount, onBagCountChange, onNext, onBack }: Props) {
  const { t } = useTranslation();

  const extraFee = bagCount > 1 ? (bagCount - 1) * EXTRA_BAG_PRICE : 0;

  const handleDecrease = () => {
    if (bagCount > 0) {
      feedbackTap();
      onBagCountChange(bagCount - 1);
    }
  };

  const handleIncrease = () => {
    if (bagCount < 3) {
      feedbackTap();
      onBagCountChange(bagCount + 1);
    }
  };

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
          {t('airport.common.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('airport.baggage.title', '수하물 등록')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Suitcase icon */}
        <div className="flex justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="14" y="18" width="36" height="36" rx="4" stroke={AIRPORT_THEME.primary} strokeWidth="2" />
            <path d="M24 18V14C24 12.9 24.9 12 26 12H38C39.1 12 40 12.9 40 14V18" stroke={AIRPORT_THEME.primary} strokeWidth="2" strokeLinecap="round" />
            <rect x="20" y="24" width="24" height="3" rx="1" fill={AIRPORT_THEME.accent} opacity="0.3" />
            <circle cx="22" cy="56" r="3" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
            <circle cx="42" cy="56" r="3" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
            <path d="M30 18V12" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
            <path d="M34 18V12" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
          </svg>
        </div>

        {/* Checked baggage */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: 'white', border: '1.5px solid #E2E8F0' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: AIRPORT_THEME.text }}>
                {t('airport.baggage.checked', '위탁 수하물')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: AIRPORT_THEME.textLight }}>
                {t('airport.baggage.weightLimit', '1개당 23kg 이내')}
              </p>
            </div>
            {/* Counter */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrease}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  backgroundColor: bagCount > 0 ? AIRPORT_THEME.primary : '#E2E8F0',
                  color: 'white',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <span
                className="text-xl font-bold"
                style={{ color: AIRPORT_THEME.text, minWidth: 24, textAlign: 'center' }}
              >
                {bagCount}
              </span>
              <button
                onClick={handleIncrease}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  backgroundColor: bagCount < 3 ? AIRPORT_THEME.primary : '#E2E8F0',
                  color: 'white',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bag breakdown */}
          {bagCount > 0 && (
            <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid #E2E8F0' }}>
              {Array.from({ length: bagCount }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
                    {t('airport.baggage.bag', '수하물')} {i + 1} (23kg)
                  </span>
                  <span className="text-xs font-medium" style={{ color: i === 0 ? AIRPORT_THEME.success : AIRPORT_THEME.text }}>
                    {i === 0
                      ? t('airport.baggage.free', '무료')
                      : `${formatPrice(EXTRA_BAG_PRICE)}${t('airport.common.won', '원')}`
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cabin baggage info */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ backgroundColor: 'white', border: '1.5px solid #E2E8F0' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="12" height="16" rx="2" stroke={AIRPORT_THEME.textLight} strokeWidth="1.3" />
            <path d="M9 4V2M15 4V2" stroke={AIRPORT_THEME.textLight} strokeWidth="1.3" strokeLinecap="round" />
            <rect x="8" y="8" width="8" height="2" rx="0.5" fill={AIRPORT_THEME.textLight} opacity="0.3" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: AIRPORT_THEME.text }}>
              {t('airport.baggage.cabin', '기내 수하물')}
            </p>
            <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
              {t('airport.baggage.cabinInfo', '1개 (10kg 이내) - 기본 포함')}
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
            {t('airport.baggage.included', '포함')}
          </span>
        </div>

        {/* Extra fee */}
        {extraFee > 0 && (
          <div
            className="rounded-lg px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}
          >
            <span className="text-xs font-medium" style={{ color: '#92400E' }}>
              {t('airport.baggage.extraFee', '추가 수하물 요금')}
            </span>
            <span className="text-sm font-bold" style={{ color: '#92400E' }}>
              {formatPrice(extraFee)}{t('airport.common.won', '원')}
            </span>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          className="w-full py-4 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
        >
          {t('airport.baggage.confirm', '다음')}
        </button>
      </div>
    </div>
  );
}
