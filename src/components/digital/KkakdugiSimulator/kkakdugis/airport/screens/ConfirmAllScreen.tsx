import { useTranslation } from 'react-i18next';
import { feedbackConfirm } from '../../../core/haptics';
import {
  AIRPORT_THEME,
  EXTRA_BAG_PRICE,
  EXTRA_SERVICES,
  MEAL_OPTIONS,
  formatPrice,
  type FlightInfo,
  type SeatInfo,
} from '../data';

interface Props {
  flight: FlightInfo;
  seat: SeatInfo | null;
  bagCount: number;
  selectedMeal: string;
  selectedServices: string[];
  onNext: () => void;
  onBack: () => void;
}

export default function ConfirmAllScreen({
  flight, seat, bagCount, selectedMeal, selectedServices,
  onNext, onBack,
}: Props) {
  const { t } = useTranslation();

  const seatFee = seat?.price ?? 0;
  const bagFee = bagCount > 1 ? (bagCount - 1) * EXTRA_BAG_PRICE : 0;
  const serviceFee = EXTRA_SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);
  const totalFee = seatFee + bagFee + serviceFee;

  const mealLabel = MEAL_OPTIONS.find(m => m.id === selectedMeal)?.name ?? '선택 안함';

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
          {t('airport.confirm.title', '체크인 확인')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Flight summary */}
        <SectionCard title={t('airport.confirm.flightSection', '항공편 정보')}>
          <InfoRow label={t('airport.confirm.flight', '항공편')} value={`${flight.airline} ${flight.flightNumber}`} />
          <InfoRow label={t('airport.confirm.route', '노선')} value={`${flight.departure.code} → ${flight.arrival.code}`} />
          <InfoRow label={t('airport.confirm.date', '날짜')} value={flight.date} />
          <InfoRow label={t('airport.confirm.time', '출발')} value={flight.time} />
          <InfoRow label={t('airport.confirm.passenger', '탑승자')} value={flight.passenger} last />
        </SectionCard>

        {/* Seat */}
        <SectionCard title={t('airport.confirm.seatSection', '좌석')}>
          <InfoRow
            label={t('airport.confirm.seat', '좌석')}
            value={seat ? `${seat.row}${seat.col}` : '-'}
          />
          {seatFee > 0 && (
            <InfoRow
              label={t('airport.confirm.seatFee', '좌석 추가요금')}
              value={`+${formatPrice(seatFee)}${t('airport.common.won', '원')}`}
              highlight
              last
            />
          )}
          {seatFee === 0 && <InfoRow label="" value="" last hidden />}
        </SectionCard>

        {/* Baggage */}
        <SectionCard title={t('airport.confirm.baggageSection', '수하물')}>
          <InfoRow
            label={t('airport.confirm.checkedBag', '위탁 수하물')}
            value={`${bagCount}${t('airport.confirm.bags', '개')}`}
          />
          {bagFee > 0 && (
            <InfoRow
              label={t('airport.confirm.bagFee', '추가 수하물 요금')}
              value={`+${formatPrice(bagFee)}${t('airport.common.won', '원')}`}
              highlight
              last
            />
          )}
          <InfoRow label={t('airport.confirm.cabinBag', '기내 수하물')} value={`1${t('airport.confirm.bags', '개')}`} last />
        </SectionCard>

        {/* Extras */}
        <SectionCard title={t('airport.confirm.extrasSection', '부가 서비스')}>
          <InfoRow label={t('airport.confirm.meal', '기내식')} value={mealLabel} />
          {EXTRA_SERVICES.map((service) => (
            <InfoRow
              key={service.id}
              label={service.name}
              value={selectedServices.includes(service.id)
                ? `${formatPrice(service.price)}${t('airport.common.won', '원')}`
                : t('airport.confirm.notSelected', '미선택')
              }
              highlight={selectedServices.includes(service.id)}
            />
          ))}
          <div style={{ height: 0 }} />
        </SectionCard>

        {/* Total */}
        <div
          className="rounded-xl px-4 py-4 flex items-center justify-between"
          style={{ backgroundColor: AIRPORT_THEME.headerBg }}
        >
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('airport.confirm.totalFee', '총 추가 요금')}
          </span>
          <span className="text-xl font-bold" style={{ color: totalFee > 0 ? AIRPORT_THEME.gold : '#10B981' }}>
            {totalFee > 0
              ? `${formatPrice(totalFee)}${t('airport.common.won', '원')}`
              : t('airport.confirm.noExtra', '추가 요금 없음')
            }
          </span>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={onBack}
          className="py-4 rounded-lg font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#E2E8F0', color: AIRPORT_THEME.textLight, width: '30%' }}
        >
          {t('airport.confirm.back', '뒤로')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          className="flex-1 py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
        >
          {t('airport.confirm.checkin', '체크인 완료')}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0' }}>
      <div className="px-4 py-2" style={{ backgroundColor: '#E0F2FE', borderBottom: '1px solid #BAE6FD' }}>
        <span className="text-xs font-semibold" style={{ color: AIRPORT_THEME.text }}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight, last, hidden }: {
  label: string; value: string; highlight?: boolean; last?: boolean; hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5"
      style={{ borderBottom: last ? 'none' : '1px solid #F1F5F9' }}
    >
      <span className="text-xs" style={{ color: '#64748B' }}>{label}</span>
      <span
        className="text-xs font-semibold"
        style={{ color: highlight ? AIRPORT_THEME.primary : AIRPORT_THEME.text }}
      >
        {value}
      </span>
    </div>
  );
}
