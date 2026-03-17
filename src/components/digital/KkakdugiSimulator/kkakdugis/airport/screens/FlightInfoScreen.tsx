import { useTranslation } from 'react-i18next';
import { feedbackConfirm } from '../../../core/haptics';
import { AIRPORT_THEME, type FlightInfo } from '../data';

interface Props {
  flight: FlightInfo;
  onNext: () => void;
  onBack: () => void;
}

export default function FlightInfoScreen({ flight, onNext, onBack }: Props) {
  const { t } = useTranslation();

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
          {t('airport.flightInfo.title', '항공편 정보')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Flight card */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1.5px solid #BAE6FD`, backgroundColor: 'white' }}
        >
          {/* Card header */}
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
          <div className="px-4 py-5 flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: AIRPORT_THEME.text }}>{flight.departure.code}</p>
              <p className="text-xs mt-1" style={{ color: AIRPORT_THEME.textLight }}>{flight.departure.city}</p>
            </div>
            <div className="flex-1 flex items-center justify-center px-3">
              <div className="flex items-center gap-1 w-full">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AIRPORT_THEME.primary }} />
                <div className="flex-1 h-px" style={{ backgroundColor: '#CBD5E1' }} />
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 10H14M14 10L10 6M14 10L10 14"
                    stroke={AIRPORT_THEME.primary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex-1 h-px" style={{ backgroundColor: '#CBD5E1' }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: AIRPORT_THEME.accent }} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: AIRPORT_THEME.text }}>{flight.arrival.code}</p>
              <p className="text-xs mt-1" style={{ color: AIRPORT_THEME.textLight }}>{flight.arrival.city}</p>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ borderTop: '1px solid #E2E8F0' }}>
            <div className="grid grid-cols-2">
              <InfoCell
                label={t('airport.flightInfo.date', '날짜')}
                value={flight.date}
              />
              <InfoCell
                label={t('airport.flightInfo.departure', '출발 시간')}
                value={flight.time}
                border="left"
              />
              <InfoCell
                label={t('airport.flightInfo.passenger', '탑승자')}
                value={flight.passenger}
                border="top"
              />
              <InfoCell
                label={t('airport.flightInfo.class', '좌석 등급')}
                value={flight.class}
                border="topLeft"
              />
            </div>
          </div>
        </div>

        {/* Notice */}
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-2"
          style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="6.5" stroke={AIRPORT_THEME.primary} strokeWidth="1.2" />
            <path d="M8 5V8.5M8 10.5V11" stroke={AIRPORT_THEME.primary} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: AIRPORT_THEME.text }}>
            {t('airport.flightInfo.notice', '탑승 정보를 확인하시고 맞으면 확인 버튼을 눌러주세요.')}
          </p>
        </div>
      </div>

      {/* Bottom button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
        >
          {t('airport.flightInfo.confirm', '확인')}
        </button>
      </div>
    </div>
  );
}

function InfoCell({ label, value, border }: { label: string; value: string; border?: string }) {
  const style: React.CSSProperties = {
    padding: '12px 16px',
  };
  if (border?.includes('top')) style.borderTop = '1px solid #E2E8F0';
  if (border?.includes('left') || border?.includes('Left')) style.borderLeft = '1px solid #E2E8F0';

  return (
    <div style={style}>
      <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: '#0C4A6E' }}>{value}</p>
    </div>
  );
}
