import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { CINEMA_THEME, TICKET_PRICES, formatPrice } from '../data';

interface Props {
  seatCount: number;
  onConfirm: (tickets: { adult: number; youth: number; senior: number }) => void;
  onBack: () => void;
}

export default function PersonCountScreen({ seatCount, onConfirm, onBack }: Props) {
  const { t } = useTranslation();
  const [adult, setAdult] = useState(seatCount);
  const [youth, setYouth] = useState(0);
  const [senior, setSenior] = useState(0);

  const total = adult + youth + senior;
  const totalPrice = adult * TICKET_PRICES.adult + youth * TICKET_PRICES.youth + senior * TICKET_PRICES.senior;
  const isValid = total === seatCount;

  const adjust = useCallback((setter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    feedbackTap();
    setter(prev => {
      const next = prev + delta;
      if (next < 0) return prev;
      return next;
    });
  }, []);

  const ticketTypes = [
    { label: t('cinema.personCount.adult', '일반'), price: TICKET_PRICES.adult, value: adult, setter: setAdult },
    { label: t('cinema.personCount.youth', '청소년'), price: TICKET_PRICES.youth, value: youth, setter: setYouth },
    { label: t('cinema.personCount.senior', '우대'), price: TICKET_PRICES.senior, value: senior, setter: setSenior },
  ];

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
          {t('cinema.personCount.title', '인원 선택')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Seat count notice */}
      <div
        className="px-4 py-2.5 text-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(124,58,237,0.08)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}
      >
        <span className="text-xs font-medium" style={{ color: CINEMA_THEME.accent }}>
          {t('cinema.personCount.seatNotice', '선택 좌석: {{count}}석 | 인원 합계가 좌석 수와 같아야 합니다', { count: seatCount })}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {ticketTypes.map(({ label, price, value, setter }) => (
          <div
            key={label}
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: CINEMA_THEME.textDark }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                {formatPrice(price)}{t('cinema.won', '원')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => adjust(setter, -1)}
                disabled={value === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all"
                style={{
                  backgroundColor: value > 0 ? CINEMA_THEME.accent : '#E5E7EB',
                  color: value > 0 ? 'white' : '#9CA3AF',
                  cursor: value > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <span
                className="font-bold text-lg"
                style={{ color: CINEMA_THEME.textDark, minWidth: 24, textAlign: 'center' }}
              >
                {value}
              </span>
              <button
                onClick={() => { if (total < seatCount) adjust(setter, 1); }}
                disabled={total >= seatCount}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all"
                style={{
                  backgroundColor: total < seatCount ? CINEMA_THEME.accent : '#E5E7EB',
                  color: total < seatCount ? 'white' : '#9CA3AF',
                  cursor: total < seatCount ? 'pointer' : 'not-allowed',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Total price */}
        <div
          className="rounded-lg px-4 py-4 flex items-center justify-between mt-2"
          style={{ backgroundColor: CINEMA_THEME.headerBg }}
        >
          <span className="text-sm font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>
            {t('cinema.personCount.subtotal', '소계')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ color: CINEMA_THEME.gold, fontSize: 22 }}>
              {formatPrice(totalPrice)}
            </span>
            <span className="text-sm font-medium" style={{ color: CINEMA_THEME.gold }}>{t('cinema.won', '원')}</span>
          </div>
        </div>

        {/* Validation message */}
        {!isValid && total > 0 && (
          <p className="text-xs text-center" style={{ color: '#EF4444' }}>
            {t('cinema.personCount.mismatch', '인원 합계({{total}})가 좌석 수({{seats}})와 다릅니다', { total, seats: seatCount })}
          </p>
        )}
      </div>

      {/* Confirm button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={() => { feedbackConfirm(); onConfirm({ adult, youth, senior }); }}
          disabled={!isValid}
          className="w-full py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: isValid ? CINEMA_THEME.accent : '#D1D5DB',
            color: isValid ? 'white' : '#9CA3AF',
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}
        >
          {t('cinema.personCount.confirm', '선택 완료')}
        </button>
      </div>
    </div>
  );
}
