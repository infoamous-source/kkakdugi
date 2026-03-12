import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { CINEMA_THEME, TICKET_PRICES, SNACKS, formatPrice, type Movie, type Showtime } from '../data';

interface Props {
  movie: Movie;
  showtime: Showtime;
  seats: string[];
  tickets: { adult: number; youth: number; senior: number };
  snacks: Record<string, number>;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PaymentScreen({ movie, showtime, seats, tickets, snacks, onConfirm, onBack }: Props) {
  const { t } = useTranslation();

  const ticketTotal = tickets.adult * TICKET_PRICES.adult + tickets.youth * TICKET_PRICES.youth + tickets.senior * TICKET_PRICES.senior;
  const snackTotal = SNACKS.reduce((sum, s) => sum + (snacks[s.id] || 0) * s.price, 0);
  const grandTotal = ticketTotal + snackTotal;

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
          {t('cinema.payment.title', '결제')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Order summary */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid #E5E7EB', backgroundColor: 'white' }}
        >
          <div className="px-4 py-2.5" style={{ backgroundColor: 'rgba(124,58,237,0.06)', borderBottom: '1px solid #E5E7EB' }}>
            <span className="text-xs font-bold tracking-wide" style={{ color: CINEMA_THEME.primary }}>
              {t('cinema.payment.orderSummary', '주문 내역')}
            </span>
          </div>

          {/* Movie info */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <p className="font-bold text-sm" style={{ color: CINEMA_THEME.textDark }}>{movie.title}</p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              {showtime.time} / {showtime.theater}{t('cinema.payment.theater', '관')} / {showtime.format}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {t('cinema.payment.seats', '좌석')}: {seats.join(', ')}
            </p>
          </div>

          {/* Tickets */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
            {tickets.adult > 0 && (
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#6B7280' }}>{t('cinema.payment.adult', '일반')} x {tickets.adult}</span>
                <span style={{ color: CINEMA_THEME.textDark }}>{formatPrice(tickets.adult * TICKET_PRICES.adult)}{t('cinema.won', '원')}</span>
              </div>
            )}
            {tickets.youth > 0 && (
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#6B7280' }}>{t('cinema.payment.youth', '청소년')} x {tickets.youth}</span>
                <span style={{ color: CINEMA_THEME.textDark }}>{formatPrice(tickets.youth * TICKET_PRICES.youth)}{t('cinema.won', '원')}</span>
              </div>
            )}
            {tickets.senior > 0 && (
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: '#6B7280' }}>{t('cinema.payment.senior', '우대')} x {tickets.senior}</span>
                <span style={{ color: CINEMA_THEME.textDark }}>{formatPrice(tickets.senior * TICKET_PRICES.senior)}{t('cinema.won', '원')}</span>
              </div>
            )}
          </div>

          {/* Snacks */}
          {snackTotal > 0 && (
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
              {SNACKS.filter(s => snacks[s.id] > 0).map(s => (
                <div key={s.id} className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#6B7280' }}>{s.name} x {snacks[s.id]}</span>
                  <span style={{ color: CINEMA_THEME.textDark }}>{formatPrice(snacks[s.id] * s.price)}{t('cinema.won', '원')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="px-4 py-3 flex justify-between items-center">
            <span className="font-bold text-sm" style={{ color: CINEMA_THEME.textDark }}>
              {t('cinema.payment.total', '총 결제 금액')}
            </span>
            <span className="font-bold" style={{ color: CINEMA_THEME.accent, fontSize: 20 }}>
              {formatPrice(grandTotal)}{t('cinema.won', '원')}
            </span>
          </div>
        </div>

        {/* Card payment method */}
        <div
          className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'white', border: `1.5px solid ${CINEMA_THEME.accent}` }}
        >
          <div
            className="flex items-center justify-center rounded flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: 'rgba(124,58,237,0.08)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke={CINEMA_THEME.accent} strokeWidth="1.5" />
              <path d="M2 8.5H18" stroke={CINEMA_THEME.accent} strokeWidth="1.5" />
              <rect x="4.5" y="11" width="4" height="2" rx="0.5" fill={CINEMA_THEME.accent} />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: CINEMA_THEME.textDark }}>
              {t('cinema.payment.cardMethod', '카드 결제')}
            </p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {t('cinema.payment.cardSub', 'IC 카드 / 비접촉 결제')}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 20, height: 20, backgroundColor: CINEMA_THEME.accent }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.5 7.5L8 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card reader illustration */}
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-lg"
          style={{ backgroundColor: 'white', border: '1.5px dashed #D1D5DB', minHeight: 120 }}
        >
          <div className="mb-3">
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
              <rect x="12" y="8" width="46" height="54" rx="5" fill="#EDE9FE" />
              <rect x="15" y="11" width="40" height="51" rx="3" fill="#F5F3FF" />
              <rect x="18" y="14" width="34" height="20" rx="2" fill={CINEMA_THEME.primary} />
              <rect x="20" y="17" width="30" height="14" rx="1.5" fill="#3B1A70" />
              <rect x="22" y="20" width="14" height="2" rx="1" fill="rgba(124,58,237,0.5)" />
              <rect x="22" y="24" width="22" height="2.5" rx="1" fill={CINEMA_THEME.accent} />
              {[0, 1, 2].map(row =>
                [0, 1, 2].map(col => (
                  <rect key={`${row}-${col}`} x={19 + col * 11} y={39 + row * 6} width="8" height="4" rx="1" fill="#C4B5FD" />
                ))
              )}
              <rect x="18" y="58" width="34" height="4" rx="1" fill="#C4B5FD" />
              <rect x="24" y="55" width="22" height="6" rx="1" fill="rgba(124,58,237,0.3)" />
            </svg>
          </div>
          <p className="font-bold text-xs text-center" style={{ color: CINEMA_THEME.textDark }}>
            {t('cinema.payment.insertGuide', '카드를 삽입하거나 접촉해 주세요')}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={() => { feedbackTap(); onBack(); }}
          className="py-3.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#E5E7EB', color: '#6B7280', width: '35%' }}
        >
          {t('cinema.payment.cancel', '취소')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onConfirm(); }}
          className="flex-1 py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
          style={{ backgroundColor: CINEMA_THEME.accent, color: 'white' }}
        >
          {t('cinema.payment.pay', '결제하기')}
        </button>
      </div>
    </div>
  );
}
