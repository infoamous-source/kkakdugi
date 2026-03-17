import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { CINEMA_THEME, MOVIES, RATING_COLORS, RATING_LABELS, type Movie } from '../data';

interface Props {
  onSelect: (movie: Movie) => void;
}

export default function MovieSelectScreen({ onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CINEMA_THEME.surface }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: CINEMA_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: CINEMA_THEME.text }}>
          {t('cinema.movieSelect.title', '영화 선택')}
        </span>
      </div>

      {/* Movie grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {MOVIES.map((movie) => {
            const ratingColor = RATING_COLORS[movie.rating];
            return (
              <button
                key={movie.id}
                onClick={() => { feedbackTap(); onSelect(movie); }}
                className="rounded-lg overflow-hidden text-left transition-all active:scale-[0.97]"
                style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              >
                {/* Poster placeholder */}
                <div
                  className="relative flex items-end justify-center"
                  style={{ backgroundColor: movie.color, height: 120 }}
                >
                  {/* Film frame overlay */}
                  <svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}>
                    <rect x="0" y="0" width="8" height="80" fill="white" />
                    <rect x="92" y="0" width="8" height="80" fill="white" />
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <rect key={`l${i}`} x="1.5" y={4 + i * 13} width="5" height="8" rx="1" fill="rgba(0,0,0,0.3)" />
                    ))}
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <rect key={`r${i}`} x="93.5" y={4 + i * 13} width="5" height="8" rx="1" fill="rgba(0,0,0,0.3)" />
                    ))}
                  </svg>
                  {/* Rating badge */}
                  <div
                    className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{ backgroundColor: ratingColor.bg, color: ratingColor.text, fontSize: 10 }}
                  >
                    {RATING_LABELS[movie.rating]}
                  </div>
                  {/* Genre tag at bottom */}
                  <span
                    className="relative z-10 mb-2 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 10 }}
                  >
                    {movie.genre}
                  </span>
                </div>
                {/* Info */}
                <div className="p-2.5">
                  <p className="font-bold text-sm truncate" style={{ color: CINEMA_THEME.textDark }}>
                    {movie.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                    {movie.duration}{t('cinema.movieSelect.minutes', '분')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
