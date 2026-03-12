import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { CINEMA_THEME, SHOWTIMES, RATING_COLORS, RATING_LABELS, type Movie, type Showtime } from '../data';

interface Props {
  movie: Movie;
  onSelect: (showtime: Showtime) => void;
  onBack: () => void;
}

function getTimeSlot(time: string): string {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return '오전';
  if (hour < 18) return '오후';
  return '저녁';
}

export default function TimeSelectScreen({ movie, onSelect, onBack }: Props) {
  const { t } = useTranslation();
  const showtimes = SHOWTIMES[movie.id] || [];

  const grouped: Record<string, Showtime[]> = {};
  showtimes.forEach(st => {
    const slot = getTimeSlot(st.time);
    if (!grouped[slot]) grouped[slot] = [];
    grouped[slot].push(st);
  });

  const slotOrder = ['오전', '오후', '저녁'];
  const ratingColor = RATING_COLORS[movie.rating];

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
          {t('cinema.timeSelect.title', '상영 시간')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Selected movie info */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#2D1B4E', borderBottom: '1px solid rgba(124,58,237,0.3)' }}
      >
        <div
          className="rounded flex-shrink-0 flex items-center justify-center"
          style={{ width: 40, height: 52, backgroundColor: movie.color }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="16" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
            <polygon points="8,7 14,10 8,13" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: CINEMA_THEME.text }}>
            {movie.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="px-1.5 py-0.5 rounded text-xs font-bold"
              style={{ backgroundColor: ratingColor.bg, color: ratingColor.text, fontSize: 10 }}
            >
              {RATING_LABELS[movie.rating]}
            </span>
            <span className="text-xs" style={{ color: 'rgba(196,181,253,0.7)' }}>
              {movie.genre} / {movie.duration}{t('cinema.minutes', '분')}
            </span>
          </div>
        </div>
      </div>

      {/* Showtimes grouped */}
      <div className="flex-1 overflow-y-auto p-4">
        {slotOrder.map(slot => {
          const items = grouped[slot];
          if (!items || items.length === 0) return null;
          return (
            <div key={slot} className="mb-4">
              <p className="text-xs font-bold mb-2 tracking-wide" style={{ color: CINEMA_THEME.primary }}>
                {slot}
              </p>
              <div className="flex flex-col gap-2">
                {items.map(st => (
                  <button
                    key={st.id}
                    onClick={() => { feedbackTap(); onSelect(st); }}
                    className="flex items-center gap-3 p-3 rounded-lg transition-all active:scale-[0.98]"
                    style={{ backgroundColor: 'white', border: '1px solid #E5E7EB' }}
                  >
                    <span className="font-bold text-lg" style={{ color: CINEMA_THEME.textDark, minWidth: 52 }}>
                      {st.time}
                    </span>
                    <div className="flex-1 flex flex-col items-start">
                      <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
                        {st.theater}{t('cinema.timeSelect.theater', '관')}
                      </span>
                      <span className="text-xs" style={{ color: st.availableSeats < 20 ? '#EF4444' : '#6B7280' }}>
                        {t('cinema.timeSelect.remaining', '잔여')} {st.availableSeats}{t('cinema.timeSelect.seats', '석')}
                      </span>
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: st.format === '3D' ? 'rgba(124,58,237,0.15)' : 'rgba(107,114,128,0.1)',
                        color: st.format === '3D' ? CINEMA_THEME.accent : '#6B7280',
                      }}
                    >
                      {st.format}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
