import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { AIRPORT_THEME, SEAT_COLS, generateAirplaneSeatLayout, formatPrice, type SeatInfo } from '../data';

interface Props {
  onNext: (seat: SeatInfo) => void;
  onBack: () => void;
}

export default function SeatSelectScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();
  const seats = useMemo(() => generateAirplaneSeatLayout(), []);
  const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);

  const handleSeatClick = (seat: SeatInfo) => {
    if (!seat.available) return;
    feedbackTap();
    setSelectedSeat(seat);
  };

  const handleConfirm = () => {
    if (selectedSeat) {
      feedbackConfirm();
      onNext(selectedSeat);
    }
  };

  const getSeatColor = (seat: SeatInfo) => {
    if (selectedSeat && selectedSeat.row === seat.row && selectedSeat.col === seat.col) {
      return { bg: AIRPORT_THEME.primary, border: AIRPORT_THEME.primary, text: 'white' };
    }
    if (!seat.available) {
      return { bg: '#E2E8F0', border: '#CBD5E1', text: '#94A3B8' };
    }
    if (seat.type === 'emergency') {
      return { bg: '#FEF9C3', border: '#FCD34D', text: '#92400E' };
    }
    if (seat.type === 'front') {
      return { bg: '#DBEAFE', border: '#93C5FD', text: AIRPORT_THEME.text };
    }
    return { bg: 'white', border: '#CBD5E1', text: AIRPORT_THEME.text };
  };

  const rows = useMemo(() => {
    const grouped: Record<number, SeatInfo[]> = {};
    for (const seat of seats) {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    }
    return grouped;
  }, [seats]);

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
          {t('airport.seat.title', '좌석 선택')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 px-3 py-2 flex-shrink-0" style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'white', border: '1px solid #CBD5E1' }} />
          <span className="text-[10px]" style={{ color: AIRPORT_THEME.textLight }}>{t('airport.seat.available', '일반석')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#DBEAFE', border: '1px solid #93C5FD' }} />
          <span className="text-[10px]" style={{ color: AIRPORT_THEME.textLight }}>{t('airport.seat.front', '앞좌석 +10,000')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FEF9C3', border: '1px solid #FCD34D' }} />
          <span className="text-[10px]" style={{ color: AIRPORT_THEME.textLight }}>{t('airport.seat.emergency', '비상구 +20,000')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#E2E8F0', border: '1px solid #CBD5E1' }} />
          <span className="text-[10px]" style={{ color: AIRPORT_THEME.textLight }}>{t('airport.seat.taken', '선택불가')}</span>
        </div>
      </div>

      {/* Seat map */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* Column headers */}
        <div className="flex items-center justify-center mb-1">
          <div style={{ width: 18 }} />
          {SEAT_COLS.map((col, i) => (
            <div key={col} className="flex items-center justify-center" style={{ width: 28, marginRight: i === 2 ? 16 : 2 }}>
              <span className="text-[10px] font-medium" style={{ color: AIRPORT_THEME.textLight }}>{col}</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {Object.entries(rows).map(([rowNum, rowSeats]) => (
          <div key={rowNum} className="flex items-center justify-center mb-1">
            <div className="text-[10px] font-medium" style={{ width: 18, color: AIRPORT_THEME.textLight, textAlign: 'center' }}>
              {rowNum}
            </div>
            {rowSeats.map((seat, i) => {
              const colors = getSeatColor(seat);
              return (
                <button
                  key={seat.col}
                  onClick={() => handleSeatClick(seat)}
                  disabled={!seat.available}
                  className="rounded-sm flex items-center justify-center transition-all text-[9px] font-medium"
                  style={{
                    width: 28,
                    height: 24,
                    marginRight: i === 2 ? 16 : 2,
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    cursor: seat.available ? 'pointer' : 'default',
                  }}
                >
                  {seat.available ? `${seat.col}` : ''}
                </button>
              );
            })}
          </div>
        ))}

        {/* Emergency exit label for row 11 */}
        <div className="flex justify-center mt-1 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}>
            {t('airport.seat.exitRow', '11열: 비상구 좌석')}
          </span>
        </div>
      </div>

      {/* Selected seat info + confirm */}
      <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid #E2E8F0', backgroundColor: 'white' }}>
        {selectedSeat ? (
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
                {t('airport.seat.selected', '선택한 좌석')}
              </p>
              <p className="text-lg font-bold" style={{ color: AIRPORT_THEME.text }}>
                {selectedSeat.row}{selectedSeat.col}
              </p>
            </div>
            {selectedSeat.price > 0 && (
              <div className="text-right">
                <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
                  {t('airport.seat.extraCharge', '추가 요금')}
                </p>
                <p className="text-sm font-bold" style={{ color: AIRPORT_THEME.primary }}>
                  +{formatPrice(selectedSeat.price)}{t('airport.common.won', '원')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-center mb-3" style={{ color: AIRPORT_THEME.textLight }}>
            {t('airport.seat.selectPrompt', '원하시는 좌석을 선택해주세요')}
          </p>
        )}
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: selectedSeat ? AIRPORT_THEME.primary : '#CBD5E1',
            color: 'white',
          }}
        >
          {t('airport.seat.confirm', '좌석 선택 완료')}
        </button>
      </div>
    </div>
  );
}
