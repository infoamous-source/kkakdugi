import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { AIRPORT_THEME, type FlightInfo, type SeatInfo } from '../data';

interface Props {
  flight: FlightInfo;
  seat: SeatInfo | null;
  bagCount: number;
  onDone: () => void;
}

export default function CompleteScreen({ flight, seat, bagCount, onDone }: Props) {
  const { t } = useTranslation();

  // Generate pseudo-random barcode pattern
  const barWidths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 2];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: AIRPORT_THEME.surface }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: AIRPORT_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('airport.complete.title', '체크인 완료')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Success message */}
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
            {t('airport.complete.success', '체크인이 완료되었습니다')}
          </p>
        </div>

        {/* Boarding pass card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `2px solid ${AIRPORT_THEME.primary}`, backgroundColor: 'white' }}
        >
          {/* Top section - airline & flight */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: AIRPORT_THEME.headerBg }}
          >
            <span className="text-sm font-semibold" style={{ color: 'white' }}>
              {flight.airline}
            </span>
            <span className="text-sm font-bold tracking-wider" style={{ color: AIRPORT_THEME.gold }}>
              {flight.flightNumber}
            </span>
          </div>

          {/* Route */}
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: AIRPORT_THEME.text }}>{flight.departure.code}</p>
              <p className="text-[10px] mt-0.5" style={{ color: AIRPORT_THEME.textLight }}>{flight.departure.city}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-px" style={{ backgroundColor: '#CBD5E1' }} />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 8H12M12 8L8.5 4.5M12 8L8.5 11.5"
                  stroke={AIRPORT_THEME.primary}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="w-8 h-px" style={{ backgroundColor: '#CBD5E1' }} />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: AIRPORT_THEME.text }}>{flight.arrival.code}</p>
              <p className="text-[10px] mt-0.5" style={{ color: AIRPORT_THEME.textLight }}>{flight.arrival.city}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: '#E2E8F0' }}>
            <DetailCell label={t('airport.complete.passenger', '탑승자')} value={flight.passenger} />
            <DetailCell label={t('airport.complete.date', '날짜')} value={flight.date} />
            <DetailCell label={t('airport.complete.departure', '출발')} value={flight.time} />
            <DetailCell label={t('airport.complete.boarding', '탑승시간')} value={flight.boardingTime} />
            <DetailCell label={t('airport.complete.gate', '게이트')} value={flight.gate} highlight />
            <DetailCell label={t('airport.complete.seat', '좌석')} value={seat ? `${seat.row}${seat.col}` : '-'} highlight />
          </div>

          {/* Dotted tear line */}
          <div className="relative py-3">
            <div
              className="absolute inset-x-0 top-1/2"
              style={{
                borderTop: '2px dashed #CBD5E1',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              className="absolute left-0 top-1/2 w-4 h-4 rounded-full"
              style={{ backgroundColor: AIRPORT_THEME.surface, transform: 'translate(-50%, -50%)' }}
            />
            <div
              className="absolute right-0 top-1/2 w-4 h-4 rounded-full"
              style={{ backgroundColor: AIRPORT_THEME.surface, transform: 'translate(50%, -50%)' }}
            />
          </div>

          {/* Barcode */}
          <div className="px-6 pb-4 flex flex-col items-center">
            <svg width="200" height="40" viewBox="0 0 200 40">
              {(() => {
                let x = 10;
                return barWidths.map((w, i) => {
                  const bar = (
                    <rect
                      key={i}
                      x={x}
                      y="2"
                      width={w}
                      height="30"
                      fill={i % 2 === 0 ? AIRPORT_THEME.headerBg : 'white'}
                    />
                  );
                  x += w + 1.5;
                  return bar;
                });
              })()}
              <text x="100" y="38" textAnchor="middle" fontSize="6" fill="#64748B">
                {flight.flightNumber}-{flight.passenger}
              </text>
            </svg>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-bold text-center" style={{ color: AIRPORT_THEME.text }}>
            {t('airport.complete.takePass', '탑승권을 가져가세요')}
          </p>
          {bagCount > 0 && (
            <div
              className="rounded-lg px-4 py-2.5 flex items-start gap-2"
              style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="7" cy="7" r="5.5" stroke="#D97706" strokeWidth="1" />
                <path d="M7 4.5V7.5M7 9V9.5" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <p className="text-xs" style={{ color: '#92400E' }}>
                {t('airport.complete.baggageTag', '수하물 태그는 카운터에서 수령하세요')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
        >
          {t('airport.complete.done', '완료')}
        </button>
      </div>
    </div>
  );
}

function DetailCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="px-4 py-2.5" style={{ backgroundColor: 'white' }}>
      <p className="text-[10px] mb-0.5" style={{ color: '#64748B' }}>{label}</p>
      <p
        className="text-sm font-bold"
        style={{ color: highlight ? AIRPORT_THEME.primary : AIRPORT_THEME.text }}
      >
        {value}
      </p>
    </div>
  );
}
