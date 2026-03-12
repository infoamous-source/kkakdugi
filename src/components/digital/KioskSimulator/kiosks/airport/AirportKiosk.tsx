import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KioskComponentProps } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type AirportScreen,
  type SeatInfo,
  AIRPORT_SCREEN_ORDER,
  AIRPORT_THEME,
  MOCK_FLIGHT,
  EXTRA_BAG_PRICE,
  EXTRA_SERVICES,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import BookingSearchScreen from './screens/BookingSearchScreen';
import FlightInfoScreen from './screens/FlightInfoScreen';
import SeatSelectScreen from './screens/SeatSelectScreen';
import BaggageScreen from './screens/BaggageScreen';
import ExtrasScreen from './screens/ExtrasScreen';
import ConfirmAllScreen from './screens/ConfirmAllScreen';
import PaymentScreen from './screens/PaymentScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function AirportKiosk({ onClose, onComplete }: KioskComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<AirportScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const setScreen = useCallback((next: AirportScreen) => {
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
  const [selectedSeat, setSelectedSeat] = useState<SeatInfo | null>(null);
  const [bagCount, setBagCount] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState('none');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // ── Helper bubble ─────────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  // Cleanup fade timeout
  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // ── Computed values ─────────────────────────────────────────────────────────
  const currentStepIndex = AIRPORT_SCREEN_ORDER.indexOf(screen);
  const totalSteps = AIRPORT_SCREEN_ORDER.length;

  const totalExtraFee = useMemo(() => {
    const seatFee = selectedSeat?.price ?? 0;
    const bagFee = bagCount > 1 ? (bagCount - 1) * EXTRA_BAG_PRICE : 0;
    const serviceFee = EXTRA_SERVICES
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
    return seatFee + bagFee + serviceFee;
  }, [selectedSeat, bagCount, selectedServices]);

  // ── Helper messages ─────────────────────────────────────────────────────────
  const helperMessages: Record<AirportScreen, string> = useMemo(() => ({
    welcome:       t('kiosk.helper.airport.welcome',       '화면을 터치하여 체크인을 시작하세요'),
    bookingSearch: t('kiosk.helper.airport.bookingSearch', '예약번호, 여권, 또는 항공권으로 조회하세요'),
    flightInfo:    t('kiosk.helper.airport.flightInfo',    '항공편 정보를 확인하세요'),
    seatSelect:    t('kiosk.helper.airport.seatSelect',    '원하시는 좌석을 선택하세요'),
    baggage:       t('kiosk.helper.airport.baggage',       '위탁 수하물 개수를 선택하세요'),
    extras:        t('kiosk.helper.airport.extras',        '부가 서비스를 선택하거나 건너뛰세요'),
    confirmAll:    t('kiosk.helper.airport.confirmAll',    '체크인 정보를 확인하세요'),
    payment:       t('kiosk.helper.airport.payment',       '추가 요금을 결제하세요'),
    processing:    t('kiosk.helper.airport.processing',    '체크인을 처리하고 있습니다'),
    complete:      t('kiosk.helper.airport.complete',      '탑승권을 확인하세요'),
  }), [t]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleHome = useCallback(() => {
    setSelectedSeat(null);
    setBagCount(0);
    setSelectedMeal('none');
    setSelectedServices([]);
    setScreen('welcome');
  }, [setScreen]);

  const handleSeatSelect = useCallback((seat: SeatInfo) => {
    setSelectedSeat(seat);
    setScreen('baggage');
  }, [setScreen]);

  const handleServiceToggle = useCallback((serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const handleExtrasSkip = useCallback(() => {
    setSelectedMeal('none');
    setSelectedServices([]);
    setScreen('confirmAll');
  }, [setScreen]);

  const handleConfirmNext = useCallback(() => {
    if (totalExtraFee > 0) {
      setScreen('payment');
    } else {
      setScreen('processing');
    }
  }, [totalExtraFee, setScreen]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Helper bubble component ─────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
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

  // ── Render ──────────────────────────────────────────────────────────────────
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
          backgroundColor: '#082F49',
          border: '3px solid #0C4A6E',
          boxShadow: '0 0 0 1px #164E63, 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: AIRPORT_THEME.headerBg, borderBottom: '1px solid #164E63' }}
        >
          <span className="text-xs font-medium" style={{ color: 'rgba(186,230,253,0.75)', minWidth: 60 }}>
            {t('kiosk.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: AIRPORT_THEME.accent,
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: 'rgba(186,230,253,0.75)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: AIRPORT_THEME.surface }}>
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
                <WelcomeScreen
                  onNext={() => setScreen('bookingSearch')}
                />
              )}

              {screen === 'bookingSearch' && (
                <BookingSearchScreen
                  onNext={() => setScreen('flightInfo')}
                  onBack={handleHome}
                />
              )}

              {screen === 'flightInfo' && (
                <FlightInfoScreen
                  flight={MOCK_FLIGHT}
                  onNext={() => setScreen('seatSelect')}
                  onBack={() => setScreen('bookingSearch')}
                />
              )}

              {screen === 'seatSelect' && (
                <SeatSelectScreen
                  onNext={handleSeatSelect}
                  onBack={() => setScreen('flightInfo')}
                />
              )}

              {screen === 'baggage' && (
                <BaggageScreen
                  bagCount={bagCount}
                  onBagCountChange={setBagCount}
                  onNext={() => setScreen('extras')}
                  onBack={() => setScreen('seatSelect')}
                />
              )}

              {screen === 'extras' && (
                <ExtrasScreen
                  selectedMeal={selectedMeal}
                  selectedServices={selectedServices}
                  onMealChange={setSelectedMeal}
                  onServiceToggle={handleServiceToggle}
                  onNext={() => setScreen('confirmAll')}
                  onSkip={handleExtrasSkip}
                  onBack={() => setScreen('baggage')}
                />
              )}

              {screen === 'confirmAll' && (
                <ConfirmAllScreen
                  flight={MOCK_FLIGHT}
                  seat={selectedSeat}
                  bagCount={bagCount}
                  selectedMeal={selectedMeal}
                  selectedServices={selectedServices}
                  onNext={handleConfirmNext}
                  onBack={() => setScreen('extras')}
                />
              )}

              {screen === 'payment' && (
                <PaymentScreen
                  totalFee={totalExtraFee}
                  onNext={() => setScreen('processing')}
                  onBack={() => setScreen('confirmAll')}
                />
              )}

              {screen === 'processing' && (
                <ProcessingScreen
                  onNext={() => setScreen('complete')}
                />
              )}

              {screen === 'complete' && (
                <CompleteScreen
                  flight={MOCK_FLIGHT}
                  seat={selectedSeat}
                  bagCount={bagCount}
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
