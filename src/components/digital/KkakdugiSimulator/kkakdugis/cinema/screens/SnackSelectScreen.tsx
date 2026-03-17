import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { CINEMA_THEME, SNACKS, formatPrice } from '../data';

interface Props {
  onConfirm: (snacks: Record<string, number>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function SnackSelectScreen({ onConfirm, onSkip, onBack }: Props) {
  const { t } = useTranslation();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const adjust = (id: string, delta: number) => {
    feedbackTap();
    setQuantities(prev => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalPrice = SNACKS.reduce((sum, s) => sum + (quantities[s.id] || 0) * s.price, 0);
  const hasSelection = Object.keys(quantities).length > 0;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CINEMA_THEME.surface }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: CINEMA_THEME.headerBg }}
      >
        <button
          onClick={() => { feedbackTap(); onBack(); }}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('cinema.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: CINEMA_THEME.text }}>
          {t('cinema.snackSelect.title', '스낵 선택')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Snack list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {SNACKS.map(snack => {
          const qty = quantities[snack.id] || 0;
          return (
            <div
              key={snack.id}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
            >
              {/* Snack icon */}
              <div
                className="flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{ width: 40, height: 40, backgroundColor: 'rgba(124,58,237,0.08)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {snack.id.startsWith('popcorn') ? (
                    <>
                      <path d="M5 8C5 6 7 4 10 4C13 4 15 6 15 8" stroke={CINEMA_THEME.accent} strokeWidth="1.2" fill="rgba(124,58,237,0.1)" />
                      <rect x="6" y="8" width="8" height="8" rx="1" fill="rgba(124,58,237,0.15)" stroke={CINEMA_THEME.accent} strokeWidth="1.2" />
                      <circle cx="8" cy="6" r="1.5" fill="rgba(253,230,138,0.6)" />
                      <circle cx="12" cy="5.5" r="1.5" fill="rgba(253,230,138,0.6)" />
                      <circle cx="10" cy="4.5" r="1.5" fill="rgba(253,230,138,0.6)" />
                    </>
                  ) : snack.id.startsWith('drink') ? (
                    <>
                      <rect x="6" y="4" width="8" height="12" rx="1.5" fill="rgba(124,58,237,0.1)" stroke={CINEMA_THEME.accent} strokeWidth="1.2" />
                      <path d="M6 7H14" stroke={CINEMA_THEME.accent} strokeWidth="0.8" />
                      <circle cx="10" cy="11" r="2" fill="rgba(124,58,237,0.15)" />
                    </>
                  ) : (
                    <>
                      <rect x="3" y="5" width="14" height="11" rx="2" fill="rgba(124,58,237,0.1)" stroke={CINEMA_THEME.accent} strokeWidth="1.2" />
                      <path d="M6 5V3M14 5V3" stroke={CINEMA_THEME.accent} strokeWidth="1" strokeLinecap="round" />
                      <rect x="5" y="8" width="4" height="5" rx="1" fill="rgba(253,230,138,0.4)" />
                      <rect x="11" y="8" width="3" height="5" rx="1" fill="rgba(124,58,237,0.15)" />
                    </>
                  )}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: CINEMA_THEME.textDark }}>{snack.name}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{snack.description}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: CINEMA_THEME.accent }}>
                  {formatPrice(snack.price)}{t('cinema.won', '원')}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {qty > 0 && (
                  <>
                    <button
                      onClick={() => adjust(snack.id, -1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: CINEMA_THEME.accent, color: 'white' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="font-bold text-sm" style={{ color: CINEMA_THEME.textDark, minWidth: 16, textAlign: 'center' }}>
                      {qty}
                    </span>
                  </>
                )}
                <button
                  onClick={() => adjust(snack.id, 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: CINEMA_THEME.accent, color: 'white' }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 3V9M3 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total & buttons */}
      <div className="flex-shrink-0" style={{ borderTop: '1px solid #E5E7EB' }}>
        {hasSelection && (
          <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: CINEMA_THEME.headerBg }}>
            <span className="text-xs" style={{ color: 'rgba(196,181,253,0.7)' }}>
              {t('cinema.snackSelect.total', '스낵 합계')}
            </span>
            <span className="font-bold text-sm" style={{ color: CINEMA_THEME.gold }}>
              {formatPrice(totalPrice)}{t('cinema.won', '원')}
            </span>
          </div>
        )}
        <div className="flex gap-3 p-4">
          <button
            onClick={() => { feedbackTap(); onSkip(); }}
            className="py-3.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-75"
            style={{ backgroundColor: '#E5E7EB', color: '#6B7280', width: '40%' }}
          >
            {t('cinema.snackSelect.skip', '건너뛰기')}
          </button>
          <button
            onClick={() => { feedbackConfirm(); onConfirm(quantities); }}
            disabled={!hasSelection}
            className="flex-1 py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
            style={{
              backgroundColor: hasSelection ? CINEMA_THEME.accent : '#D1D5DB',
              color: hasSelection ? 'white' : '#9CA3AF',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
            }}
          >
            {t('cinema.snackSelect.confirm', '선택 완료')}
          </button>
        </div>
      </div>
    </div>
  );
}
