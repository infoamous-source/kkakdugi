import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { CINEMA_THEME, generateSeatLayout, type Seat } from '../data';

interface Props {
  onConfirm: (seats: string[]) => void;
  onBack: () => void;
}

export default function SeatSelectScreen({ onConfirm, onBack }: Props) {
  const { t } = useTranslation();
  const seatLayout = useMemo(() => generateSeatLayout(), []);
  const [selected, setSelected] = useState<string[]>([]);

  const seatId = (s: Seat) => `${s.row}${s.col}`;

  const toggleSeat = (seat: Seat) => {
    if (seat.taken) return;
    const id = seatId(seat);
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
    feedbackTap();
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

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
          {t('cinema.seatSelect.title', '좌석 선택')}
        </span>
        <span className="text-xs" style={{ color: CINEMA_THEME.gold }}>
          {selected.length}/4
        </span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-3">
        {/* Screen indicator */}
        <div className="w-full max-w-[280px] mb-4">
          <div
            className="mx-auto rounded-t-lg text-center py-1.5"
            style={{
              width: '80%',
              background: 'linear-gradient(180deg, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.1) 100%)',
              borderBottom: '2px solid rgba(124,58,237,0.6)',
            }}
          >
            <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(124,58,237,0.8)' }}>
              SCREEN
            </span>
          </div>
        </div>

        {/* Seat grid */}
        <div className="flex flex-col gap-1.5">
          {rows.map(row => {
            const rowSeats = seatLayout.filter(s => s.row === row);
            return (
              <div key={row} className="flex items-center gap-1">
                <span className="text-xs font-bold w-4 text-center" style={{ color: '#9CA3AF' }}>
                  {row}
                </span>
                <div className="flex gap-1">
                  {rowSeats.slice(0, 4).map(seat => {
                    const id = seatId(seat);
                    const isSelected = selected.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleSeat(seat)}
                        disabled={seat.taken}
                        className="rounded-t-md transition-all"
                        style={{
                          width: 28,
                          height: 24,
                          backgroundColor: seat.taken
                            ? '#D1D5DB'
                            : isSelected
                              ? CINEMA_THEME.accent
                              : 'white',
                          border: seat.taken
                            ? '1px solid #9CA3AF'
                            : isSelected
                              ? `1px solid ${CINEMA_THEME.primary}`
                              : '1px solid #D1D5DB',
                          cursor: seat.taken ? 'not-allowed' : 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
                {/* Aisle gap */}
                <div style={{ width: 12 }} />
                <div className="flex gap-1">
                  {rowSeats.slice(4, 8).map(seat => {
                    const id = seatId(seat);
                    const isSelected = selected.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleSeat(seat)}
                        disabled={seat.taken}
                        className="rounded-t-md transition-all"
                        style={{
                          width: 28,
                          height: 24,
                          backgroundColor: seat.taken
                            ? '#D1D5DB'
                            : isSelected
                              ? CINEMA_THEME.accent
                              : 'white',
                          border: seat.taken
                            ? '1px solid #9CA3AF'
                            : isSelected
                              ? `1px solid ${CINEMA_THEME.primary}`
                              : '1px solid #D1D5DB',
                          cursor: seat.taken ? 'not-allowed' : 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-bold w-4 text-center" style={{ color: '#9CA3AF' }}>
                  {row}
                </span>
              </div>
            );
          })}
          {/* Column numbers */}
          <div className="flex items-center gap-1 mt-1">
            <div style={{ width: 16 }} />
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(n => (
                <span key={n} className="text-center" style={{ width: 28, fontSize: 9, color: '#9CA3AF' }}>{n}</span>
              ))}
            </div>
            <div style={{ width: 12 }} />
            <div className="flex gap-1">
              {[5, 6, 7, 8].map(n => (
                <span key={n} className="text-center" style={{ width: 28, fontSize: 9, color: '#9CA3AF' }}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="rounded-t-sm" style={{ width: 14, height: 12, backgroundColor: 'white', border: '1px solid #D1D5DB' }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>{t('cinema.seatSelect.available', '선택가능')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="rounded-t-sm" style={{ width: 14, height: 12, backgroundColor: CINEMA_THEME.accent, border: `1px solid ${CINEMA_THEME.primary}` }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>{t('cinema.seatSelect.selected', '선택')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="rounded-t-sm" style={{ width: 14, height: 12, backgroundColor: '#D1D5DB', border: '1px solid #9CA3AF' }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>{t('cinema.seatSelect.taken', '예매됨')}</span>
          </div>
        </div>

        {/* Selected seats display */}
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
            {selected.map(s => (
              <span
                key={s}
                className="px-2 py-1 rounded text-xs font-bold"
                style={{ backgroundColor: 'rgba(124,58,237,0.15)', color: CINEMA_THEME.accent }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #E5E7EB' }}>
        <button
          onClick={() => { feedbackConfirm(); onConfirm(selected); }}
          disabled={selected.length === 0}
          className="w-full py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: selected.length > 0 ? CINEMA_THEME.accent : '#D1D5DB',
            color: selected.length > 0 ? 'white' : '#9CA3AF',
            cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {selected.length > 0
            ? t('cinema.seatSelect.confirm', '{{count}}석 선택 완료', { count: selected.length })
            : t('cinema.seatSelect.prompt', '좌석을 선택하세요 (최대 4석)')
          }
        </button>
      </div>
    </div>
  );
}
