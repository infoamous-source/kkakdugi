import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KkakdugiComponentProps } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type ConvenienceScreen,
  type ConvenienceItem,
  type ScannedItem,
  type BagOption,
  CONVENIENCE_SCREEN_ORDER,
  CONVENIENCE_THEME,
  BAG_OPTIONS,
  hasAgeRestrictedItems,
  calculateScannedTotal,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import ScanScreen from './screens/ScanScreen';
import AgeVerifyScreen from './screens/AgeVerifyScreen';
import BagsScreen from './screens/BagsScreen';
import OrderReviewScreen from './screens/OrderReviewScreen';
import PaymentScreen from './screens/PaymentScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function ConvenienceKkakdugi({ onClose, onComplete }: KkakdugiComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<ConvenienceScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setScreen = useCallback((next: ConvenienceScreen) => {
    setScreenFade(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    fadeTimeout.current = setTimeout(() => {
      setScreenRaw(next);
      setShowHelper(true);
      playTouchSound();
      setScreenFade(false);
    }, 120);
  }, []);

  // ── State ───────────────────────────────────────────────────────────────────
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [selectedBag, setSelectedBag] = useState<BagOption>(BAG_OPTIONS[0]);

  // ── Helper bubble ───────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  // Cleanup fade timeout
  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // ── Screen flow indices ─────────────────────────────────────────────────────
  const currentStepIndex = CONVENIENCE_SCREEN_ORDER.indexOf(screen);
  const totalSteps = CONVENIENCE_SCREEN_ORDER.length;

  // ── Helper messages ─────────────────────────────────────────────────────────
  const helperMessages: Record<ConvenienceScreen, string> = useMemo(() => ({
    welcome:     t('kkakdugi.helper.convenience.welcome',     '화면을 터치하여 계산을 시작하세요'),
    scan:        t('kkakdugi.helper.convenience.scan',        '상품을 터치하여 스캔하세요. 완료 후 스캔 완료를 누르세요'),
    ageVerify:   t('kkakdugi.helper.convenience.ageVerify',   '주류/담배 구매 시 성인인증이 필요합니다'),
    bags:        t('kkakdugi.helper.convenience.bags',        '봉투가 필요하면 선택하세요'),
    orderReview: t('kkakdugi.helper.convenience.orderReview', '스캔한 상품을 확인하고 결제하기를 누르세요'),
    payment:     t('kkakdugi.helper.convenience.payment',     '결제 방법을 선택하고 승인을 요청하세요'),
    receipt:     t('kkakdugi.helper.convenience.receipt',     '영수증 출력 여부를 선택하세요'),
    complete:    t('kkakdugi.helper.convenience.complete',    '계산이 완료되었습니다. 상품을 가져가세요'),
  }), [t]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleHome = useCallback(() => {
    setScannedItems([]);
    setSelectedBag(BAG_OPTIONS[0]);
    setScreen('welcome');
  }, [setScreen]);

  const handleScanItem = useCallback((item: ConvenienceItem) => {
    setScannedItems((prev) => {
      const existing = prev.findIndex((s) => s.item.id === item.id);
      if (existing >= 0) {
        return prev.map((s, i) =>
          i === existing ? { ...s, quantity: s.quantity + 1 } : s,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const handleScanDone = useCallback(() => {
    if (hasAgeRestrictedItems(scannedItems)) {
      setScreen('ageVerify');
    } else {
      setScreen('bags');
    }
  }, [scannedItems, setScreen]);

  const handleAgeVerified = useCallback(() => {
    setScreen('bags');
  }, [setScreen]);

  const handleSelectBag = useCallback((bag: BagOption) => {
    setSelectedBag(bag);
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setScannedItems((prev) =>
      prev
        .map((s) => (s.item.id === itemId ? { ...s, quantity: s.quantity + delta } : s))
        .filter((s) => s.quantity > 0),
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setScannedItems((prev) => prev.filter((s) => s.item.id !== itemId));
  }, []);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalAmount = calculateScannedTotal(scannedItems) + selectedBag.price;
  const restrictedItems = scannedItems.filter((s) => s.item.ageRestricted);

  // ── Helper bubble component ─────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: CONVENIENCE_THEME.primary, color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: CONVENIENCE_THEME.primary, color: 'white' }}
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 kiosk-overlay">
      {/* Kkakdugi frame */}
      <div
        className="kiosk-frame w-full flex flex-col overflow-hidden shadow-2xl"
        style={{
          backgroundColor: '#0A2818',
          '--kiosk-border-color': '#0D3820',
          '--kiosk-shadow-color': '#1A5030',
        } as React.CSSProperties}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: CONVENIENCE_THEME.headerBg, borderBottom: '1px solid #0A4538' }}
        >
          <span className="text-xs font-medium" style={{ color: 'rgba(167,243,208,0.75)', minWidth: 60 }}>
            {t('kkakdugi.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: CONVENIENCE_THEME.accent,
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: 'rgba(167,243,208,0.75)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
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
                  onNext={() => setScreen('scan')}
                />
              )}

              {screen === 'scan' && (
                <ScanScreen
                  scannedItems={scannedItems}
                  onScanItem={handleScanItem}
                  onDone={handleScanDone}
                  onBack={handleHome}
                />
              )}

              {screen === 'ageVerify' && (
                <AgeVerifyScreen
                  restrictedItems={restrictedItems}
                  onVerified={handleAgeVerified}
                  onBack={() => setScreen('scan')}
                />
              )}

              {screen === 'bags' && (
                <BagsScreen
                  selectedBag={selectedBag}
                  onSelectBag={handleSelectBag}
                  onNext={() => setScreen('orderReview')}
                  onBack={() => hasAgeRestrictedItems(scannedItems) ? setScreen('ageVerify') : setScreen('scan')}
                />
              )}

              {screen === 'orderReview' && (
                <OrderReviewScreen
                  scannedItems={scannedItems}
                  selectedBag={selectedBag}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onNext={() => setScreen('payment')}
                  onBack={() => setScreen('bags')}
                />
              )}

              {screen === 'payment' && (
                <PaymentScreen
                  total={totalAmount}
                  onBack={() => setScreen('orderReview')}
                  onApprove={() => setScreen('receipt')}
                />
              )}

              {screen === 'receipt' && (
                <ReceiptScreen onNext={() => setScreen('complete')} />
              )}

              {screen === 'complete' && (
                <CompleteScreen
                  total={totalAmount}
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
