import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KioskComponentProps } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type CinemaScreen,
  type Movie,
  type Showtime,
  CINEMA_SCREEN_ORDER,
  CINEMA_THEME,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import MovieSelectScreen from './screens/MovieSelectScreen';
import TimeSelectScreen from './screens/TimeSelectScreen';
import SeatSelectScreen from './screens/SeatSelectScreen';
import PersonCountScreen from './screens/PersonCountScreen';
import SnackSelectScreen from './screens/SnackSelectScreen';
import PaymentScreen from './screens/PaymentScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function CinemaKiosk({ onClose, onComplete }: KioskComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<CinemaScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const setScreen = useCallback((next: CinemaScreen) => {
    setScreenFade(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    fadeTimeout.current = setTimeout(() => {
      setScreenRaw(next);
      setShowHelper(true);
      playTouchSound();
      setScreenFade(false);
    }, 120);
  }, []);

  // ── Service state ────────────────────────────────────────────────────────────
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [tickets, setTickets] = useState<{ adult: number; youth: number; senior: number }>({ adult: 0, youth: 0, senior: 0 });
  const [snacks, setSnacks] = useState<Record<string, number>>({});

  // ── Helper bubble ─────────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // ── Screen flow indices ───────────────────────────────────────────────────────
  const currentStepIndex = CINEMA_SCREEN_ORDER.indexOf(screen);
  const totalSteps = CINEMA_SCREEN_ORDER.length;

  // ── Helper messages ───────────────────────────────────────────────────────────
  const helperMessages: Record<CinemaScreen, string> = useMemo(() => ({
    welcome:     t('kiosk.helper.cinema.welcome',     '화면을 터치하여 예매를 시작하세요'),
    movieSelect: t('kiosk.helper.cinema.movieSelect', '관람할 영화를 선택하세요'),
    timeSelect:  t('kiosk.helper.cinema.timeSelect',  '원하는 상영 시간을 선택하세요'),
    seatSelect:  t('kiosk.helper.cinema.seatSelect',  '좌석을 선택하세요 (최대 4석)'),
    personCount: t('kiosk.helper.cinema.personCount', '인원 유형별 수를 선택하세요'),
    snackSelect: t('kiosk.helper.cinema.snackSelect', '스낵을 선택하거나 건너뛸 수 있습니다'),
    payment:     t('kiosk.helper.cinema.payment',     '결제 정보를 확인하고 결제하세요'),
    processing:  t('kiosk.helper.cinema.processing',  '결제를 처리하고 있습니다'),
    complete:    t('kiosk.helper.cinema.complete',     '발권이 완료되었습니다. 티켓을 가져가세요'),
  }), [t]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleHome = useCallback(() => {
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setTickets({ adult: 0, youth: 0, senior: 0 });
    setSnacks({});
    setScreen('welcome');
  }, [setScreen]);

  const handleSelectMovie = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setScreen('timeSelect');
  }, [setScreen]);

  const handleSelectShowtime = useCallback((showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setScreen('seatSelect');
  }, [setScreen]);

  const handleConfirmSeats = useCallback((seats: string[]) => {
    setSelectedSeats(seats);
    setTickets({ adult: seats.length, youth: 0, senior: 0 });
    setScreen('personCount');
  }, [setScreen]);

  const handleConfirmPersonCount = useCallback((t: { adult: number; youth: number; senior: number }) => {
    setTickets(t);
    setScreen('snackSelect');
  }, [setScreen]);

  const handleConfirmSnacks = useCallback((s: Record<string, number>) => {
    setSnacks(s);
    setScreen('payment');
  }, [setScreen]);

  const handleSkipSnacks = useCallback(() => {
    setSnacks({});
    setScreen('payment');
  }, [setScreen]);

  const handlePayment = useCallback(() => {
    setScreen('processing');
  }, [setScreen]);

  const handleProcessingDone = useCallback(() => {
    setScreen('complete');
  }, [setScreen]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Helper bubble component ───────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: CINEMA_THEME.accent, color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: CINEMA_THEME.accent, color: 'white' }}
        >
          <MessageCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed flex-1">{helperMessages[screen]}</p>
          <button
            onClick={() => setShowHelper(false)}
            className="flex-shrink-0 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Kiosk frame */}
      <div
        className="w-full flex flex-col overflow-hidden shadow-2xl"
        style={{
          maxWidth: 400,
          height: '90vh',
          maxHeight: 750,
          borderRadius: 12,
          backgroundColor: CINEMA_THEME.bg,
          border: '3px solid #2D1B4E',
          boxShadow: '0 0 0 1px #3B2064, 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: CINEMA_THEME.headerBg, borderBottom: '1px solid #2D1B4E' }}
        >
          <span className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.75)', minWidth: 60 }}>
            {t('kiosk.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: CINEMA_THEME.gold,
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: 'rgba(196,181,253,0.75)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: CINEMA_THEME.surface }}>
          {/* Helper bubble overlay */}
          <HelperBubble />

          {/* Screen renders with fade transition */}
          <div
            className="h-full overflow-hidden flex flex-col transition-opacity duration-100"
            style={{ opacity: screenFade ? 0 : 1 }}
          >
            {/* Extra space for helper bubble on all screens */}
            <div
              className="flex-shrink-0 transition-all duration-200"
              style={{ height: showHelper ? 48 : 0, overflow: 'hidden' }}
            />

            <div className="flex-1 overflow-hidden">
              {screen === 'welcome' && (
                <WelcomeScreen onNext={() => setScreen('movieSelect')} />
              )}

              {screen === 'movieSelect' && (
                <MovieSelectScreen onSelect={handleSelectMovie} />
              )}

              {screen === 'timeSelect' && selectedMovie && (
                <TimeSelectScreen
                  movie={selectedMovie}
                  onSelect={handleSelectShowtime}
                  onBack={() => setScreen('movieSelect')}
                />
              )}

              {screen === 'seatSelect' && (
                <SeatSelectScreen
                  onConfirm={handleConfirmSeats}
                  onBack={() => setScreen('timeSelect')}
                />
              )}

              {screen === 'personCount' && (
                <PersonCountScreen
                  seatCount={selectedSeats.length}
                  onConfirm={handleConfirmPersonCount}
                  onBack={() => setScreen('seatSelect')}
                />
              )}

              {screen === 'snackSelect' && (
                <SnackSelectScreen
                  onConfirm={handleConfirmSnacks}
                  onSkip={handleSkipSnacks}
                  onBack={() => setScreen('personCount')}
                />
              )}

              {screen === 'payment' && selectedMovie && selectedShowtime && (
                <PaymentScreen
                  movie={selectedMovie}
                  showtime={selectedShowtime}
                  seats={selectedSeats}
                  tickets={tickets}
                  snacks={snacks}
                  onConfirm={handlePayment}
                  onBack={() => setScreen('snackSelect')}
                />
              )}

              {screen === 'processing' && (
                <ProcessingScreen onDone={handleProcessingDone} />
              )}

              {screen === 'complete' && selectedMovie && selectedShowtime && (
                <CompleteScreen
                  movie={selectedMovie}
                  showtime={selectedShowtime}
                  seats={selectedSeats}
                  tickets={tickets}
                  snacks={snacks}
                  onDone={handleComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
