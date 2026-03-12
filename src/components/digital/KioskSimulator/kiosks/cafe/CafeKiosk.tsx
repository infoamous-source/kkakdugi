import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KioskComponentProps } from '../../core/types';
import type { OrderMenuItem, OrderOptionItem } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type CafeScreen,
  type CafeCartItem,
  type MenuCategory,
  CAFE_SCREEN_ORDER,
  calculateItemPrice,
  calculateCartTotal,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import DineOptionScreen from './screens/DineOptionScreen';
import MenuScreen from './screens/MenuScreen';
import OptionsScreen from './screens/OptionsScreen';
import OrderConfirmScreen from './screens/OrderConfirmScreen';
import PaymentScreen from './screens/PaymentScreen';
import CardPaymentScreen from './screens/CardPaymentScreen';
import PointsScreen from './screens/PointsScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function CafeKiosk({ onClose, onComplete }: KioskComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<CafeScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Screen transition with fade effect + helper reset
  const setScreen = useCallback((next: CafeScreen) => {
    // Quick fade out → switch → fade in
    setScreenFade(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    fadeTimeout.current = setTimeout(() => {
      setScreenRaw(next);
      setShowHelper(true); // re-show helper on each new screen
      playTouchSound();
      setScreenFade(false);
    }, 120);
  }, []);

  // ── Cart ────────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CafeCartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<(OrderMenuItem & { category: MenuCategory; color: string }) | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');

  // ── Dine-in / Takeout ────────────────────────────────────────────────────────
  const [dineIn, setDineIn] = useState<boolean | null>(null);

  // ── Inactivity timer (shown when cart has items) ─────────────────────────────
  const [timer, setTimer] = useState(120);

  // ── Helper bubble ────────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  // ── Order number (random 3-digit) ────────────────────────────────────────────
  const [orderNumber] = useState(() => Math.floor(Math.random() * 900) + 100);

  // Cleanup fade timeout
  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // Reset timer when arriving at menu with items
  useEffect(() => {
    if ((screen === 'menu' || screen === 'options') && cart.length > 0) {
      setTimer(120);
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown
  useEffect(() => {
    if (screen !== 'menu' && screen !== 'options') return;
    if (cart.length === 0) return;
    const id = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [screen, cart.length]);

  // ── Screen flow indices ──────────────────────────────────────────────────────
  const currentStepIndex = CAFE_SCREEN_ORDER.indexOf(screen);
  const totalSteps = CAFE_SCREEN_ORDER.length;

  // ── Helper messages ──────────────────────────────────────────────────────────
  const helperMessages: Record<CafeScreen, string> = useMemo(() => ({
    welcome:      t('kiosk.helper.welcome',      '화면을 터치해서 주문을 시작하세요.'),
    dineOption:   t('kiosk.helper.dineOption',   '매장에서 드실지 포장하실지 선택하세요.'),
    menu:         t('kiosk.helper.menu',         '원하는 메뉴를 선택하고 장바구니에 담으세요.'),
    options:      t('kiosk.helper.options',      '음료 옵션을 선택하고 담기를 눌러주세요.'),
    orderConfirm: t('kiosk.helper.orderConfirm', '주문 내역을 확인하고 결제하기를 누르세요.'),
    payment:      t('kiosk.helper.payment',      '결제 방법을 선택하세요. 신용카드로 연습해 보세요.'),
    cardPayment:  t('kiosk.helper.card',         '카드를 삽입하거나 승인 요청을 눌러보세요.'),
    points:       t('kiosk.helper.points',       '포인트 적립 여부를 선택하세요.'),
    receipt:      t('kiosk.helper.receipt',      '영수증 출력 여부를 선택하세요.'),
    complete:     t('kiosk.helper.complete',     '주문이 완료되었습니다! 주문 번호를 기억하세요.'),
  }), [t]);

  // ── Cart operations ──────────────────────────────────────────────────────────
  const addToCart = useCallback((options: OrderOptionItem[], quantity: number) => {
    if (!selectedItem) return;
    const price = calculateItemPrice(selectedItem, options);
    setCart((prev) => {
      const sameKey = prev.findIndex(
        (c) =>
          c.menuItem.id === selectedItem.id &&
          JSON.stringify(c.selectedOptions.map((o) => o.id).sort()) ===
            JSON.stringify(options.map((o) => o.id).sort()),
      );
      if (sameKey >= 0) {
        return prev.map((c, i) =>
          i === sameKey ? { ...c, quantity: c.quantity + quantity } : c,
        );
      }
      return [
        ...prev,
        { menuItem: selectedItem, selectedOptions: options, quantity, totalPrice: price },
      ];
    });
    setSelectedItem(null);
    setScreen('menu');
  }, [selectedItem]);

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const cartTotal = calculateCartTotal(cart);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectItem = (item: OrderMenuItem & { category: MenuCategory; color: string }) => {
    setSelectedItem(item);
    setScreen('options');
  };

  const handleDineOption = (isDineIn: boolean) => {
    setDineIn(isDineIn);
    setScreen('menu');
  };

  const handleSelectPayment = (methodId: string) => {
    if (methodId === 'card') {
      setScreen('cardPayment');
    }
    // Other payment methods would navigate similarly
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleHome = () => {
    setCart([]);
    setSelectedItem(null);
    setDineIn(null);
    setTimer(120);
    setScreen('welcome');
  };

  // ── Helper bubble component ───────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#9C6B3C', color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: '#9C6B3C', color: 'white' }}
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      {/* Kiosk frame */}
      <div
        className="w-full flex flex-col overflow-hidden shadow-2xl"
        style={{
          maxWidth: 400,
          height: '90vh',
          maxHeight: 750,
          borderRadius: 12,
          backgroundColor: '#1A0E08',
          border: '3px solid #2C1A0E',
          boxShadow: '0 0 0 1px #4A3020, 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: '#2C1A0E', borderBottom: '1px solid #4A3020' }}
        >
          <span className="text-xs font-medium" style={{ color: '#9E7E6A', minWidth: 60 }}>
            {t('kiosk.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#4A3020' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: '#C89B3C',
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: '#9E7E6A' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: '#FFF8F0' }}>
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
                  onNext={() => setScreen('dineOption')}
                />
              )}

              {screen === 'dineOption' && (
                <DineOptionScreen
                  onNext={handleDineOption}
                  onBack={handleHome}
                />
              )}

              {screen === 'menu' && (
                <MenuScreen
                  cart={cart}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  onSelectItem={handleSelectItem}
                  onRemoveFromCart={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                  onClearCart={() => setCart([])}
                  onCheckout={() => setScreen('orderConfirm')}
                  onHome={handleHome}
                  timer={timer}
                />
              )}

              {screen === 'options' && selectedItem && (
                <OptionsScreen
                  item={selectedItem}
                  onAdd={addToCart}
                  onBack={() => { setSelectedItem(null); setScreen('menu'); }}
                />
              )}

              {screen === 'orderConfirm' && (
                <OrderConfirmScreen
                  cart={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemoveFromCart={removeFromCart}
                  onSelectRecommend={handleSelectItem}
                  onBack={() => setScreen('menu')}
                  onNext={() => setScreen('payment')}
                />
              )}

              {screen === 'payment' && (
                <PaymentScreen
                  total={cartTotal}
                  onBack={() => setScreen('orderConfirm')}
                  onSelectPayment={handleSelectPayment}
                />
              )}

              {screen === 'cardPayment' && (
                <CardPaymentScreen
                  total={cartTotal}
                  onBack={() => setScreen('payment')}
                  onApprove={() => setScreen('points')}
                />
              )}

              {screen === 'points' && (
                <PointsScreen onNext={() => setScreen('receipt')} />
              )}

              {screen === 'receipt' && (
                <ReceiptScreen onNext={() => setScreen('complete')} />
              )}

              {screen === 'complete' && (
                <CompleteScreen
                  cart={cart}
                  orderNumber={orderNumber}
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
