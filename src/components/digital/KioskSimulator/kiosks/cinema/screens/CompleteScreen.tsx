import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { CINEMA_THEME, TICKET_PRICES, SNACKS, formatPrice, type Movie, type Showtime } from '../data';

interface Props {
  movie: Movie;
  showtime: Showtime;
  seats: string[];
  tickets: { adult: number; youth: number; senior: number };
  snacks: Record<string, number>;
  onDone: () => void;
}

export default function CompleteScreen({ movie, showtime, seats, tickets, snacks, onDone }: Props) {
  const { t } = useTranslation();

  const ticketTotal = tickets.adult * TICKET_PRICES.adult + tickets.youth * TICKET_PRICES.youth + tickets.senior * TICKET_PRICES.senior;
  const snackTotal = SNACKS.reduce((sum, s) => sum + (snacks[s.id] || 0) * s.price, 0);
  const grandTotal = ticketTotal + snackTotal;

  // Generate deterministic barcode pattern
  const barWidths: number[] = [];
  let seed = movie.id.length + seats.length + showtime.theater;
  for (let i = 0; i < 40; i++) {
    seed = (seed * 7 + 13) % 97;
    barWidths.push(seed % 3 === 0 ? 2 : 1);
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CINEMA_THEME.surface }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: CINEMA_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: CINEMA_THEME.gold }}>
          {t('cinema.complete.title', '발권 완료')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Ticket card */}
        <div
          className="w-full rounded-xl overflow-hidden"
          style={{ backgroundColor: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}
        >
          {/* Ticket header */}
          <div
            className="px-4 py-4 text-center"
            style={{ background: `linear-gradient(135deg, ${CINEMA_THEME.primary} 0%, ${CINEMA_THEME.accent} 100%)` }}
          >
            <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('cinema.complete.cinema', 'CINEMA')}
            </p>
            <p className="font-bold text-lg" style={{ color: 'white' }}>
              {movie.title}
            </p>
          </div>

          {/* Ticket details */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{t('cinema.complete.date', '날짜')}</p>
                <p className="text-sm font-bold" style={{ color: CINEMA_THEME.textDark }}>2026.03.12</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{t('cinema.complete.time', '시간')}</p>
                <p className="text-sm font-bold" style={{ color: CINEMA_THEME.textDark }}>{showtime.time}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{t('cinema.complete.theater', '상영관')}</p>
                <p className="text-sm font-bold" style={{ color: CINEMA_THEME.textDark }}>{showtime.theater}{t('cinema.complete.theaterSuffix', '관')} ({showtime.format})</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{t('cinema.complete.seats', '좌석')}</p>
                <p className="text-sm font-bold" style={{ color: CINEMA_THEME.textDark }}>{seats.join(', ')}</p>
              </div>
            </div>

            {/* Ticket breakdown */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{t('cinema.complete.ticketCount', '인원')}</span>
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  {[
                    tickets.adult > 0 ? `${t('cinema.complete.adult', '일반')} ${tickets.adult}` : '',
                    tickets.youth > 0 ? `${t('cinema.complete.youth', '청소년')} ${tickets.youth}` : '',
                    tickets.senior > 0 ? `${t('cinema.complete.senior', '우대')} ${tickets.senior}` : '',
                  ].filter(Boolean).join(' / ')}
                </span>
              </div>
              {snackTotal > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{t('cinema.complete.snacks', '스낵')}</span>
                  <span className="text-xs" style={{ color: '#6B7280' }}>
                    {formatPrice(snackTotal)}{t('cinema.won', '원')}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
                <span className="text-sm font-bold" style={{ color: CINEMA_THEME.textDark }}>
                  {t('cinema.complete.total', '합계')}
                </span>
                <span className="font-bold" style={{ color: CINEMA_THEME.accent, fontSize: 18 }}>
                  {formatPrice(grandTotal)}{t('cinema.won', '원')}
                </span>
              </div>
            </div>
          </div>

          {/* Dotted tear line */}
          <div className="flex items-center px-2">
            <div className="flex-1" style={{ borderTop: '2px dashed #E5E7EB' }} />
          </div>

          {/* Barcode */}
          <div className="px-4 py-4 flex flex-col items-center">
            <svg width="200" height="40" viewBox="0 0 200 40">
              {(() => {
                let x = 10;
                return barWidths.map((w, i) => {
                  const bar = (
                    <rect
                      key={i}
                      x={x}
                      y={2}
                      width={w}
                      height={30}
                      fill={i % 2 === 0 ? '#1F2937' : 'transparent'}
                    />
                  );
                  x += w + 2;
                  return bar;
                });
              })()}
              <text x="100" y="38" textAnchor="middle" fill="#9CA3AF" fontSize="6" fontFamily="monospace">
                {movie.id.toUpperCase()}-{showtime.id.toUpperCase()}-{seats[0] || 'A1'}
              </text>
            </svg>
          </div>
        </div>

        {/* Instruction */}
        <div
          className="mt-4 rounded-lg px-4 py-3 flex items-start gap-3 w-full"
          style={{ backgroundColor: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="7" stroke={CINEMA_THEME.accent} strokeWidth="1.2" />
            <path d="M9 5.5V10" stroke={CINEMA_THEME.accent} strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="9" cy="12.5" r="0.8" fill={CINEMA_THEME.accent} />
          </svg>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: CINEMA_THEME.textDark }}>
              {t('cinema.complete.notice', '티켓을 가져가세요')}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
              {t('cinema.complete.noticeSub', '상영 시간 10분 전까지 입장해 주세요.')}
            </p>
          </div>
        </div>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: CINEMA_THEME.accent, color: 'white' }}
        >
          {t('cinema.complete.done', '완료')}
        </button>
      </div>
    </div>
  );
}
