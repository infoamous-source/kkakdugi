import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, Home, Globe, ChevronLeft, Minus, Plus, HelpCircle,
  CreditCard, MessageCircle,
} from 'lucide-react';
import {
  type KkakdugiScreen, type MenuItem, type OptionItem, type CartItem, type MenuCategory,
  menuItems, categories, optionGroups, paymentMethods, recommendItems,
  formatPrice, calculateItemPrice, calculateCartTotal, calculateTax,
  SCREEN_ORDER,
} from './kkakdugiData';

interface Props {
  onClose: () => void;
  onComplete: () => void;
}

export default function KkakdugiSimulator({ onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const [screen, setScreen] = useState<KkakdugiScreen>('welcome');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<OptionItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [dineIn, setDineIn] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(120);
  const [showHelper, setShowHelper] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Timer for cart screen
  useEffect(() => {
    if (screen !== 'menu' && screen !== 'options') return;
    if (cart.length === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, cart.length]);

  const currentStepIndex = SCREEN_ORDER.indexOf(screen);
  const totalSteps = SCREEN_ORDER.length;

  const helperMessages: Record<KkakdugiScreen, string> = {
    welcome: t('kkakdugi.helper.welcome'),
    menu: t('kkakdugi.helper.menu'),
    options: t('kkakdugi.helper.options'),
    orderConfirm: t('kkakdugi.helper.orderConfirm'),
    payment: t('kkakdugi.helper.payment'),
    cardPayment: t('kkakdugi.helper.card'),
    points: t('kkakdugi.helper.points'),
    receipt: t('kkakdugi.helper.receipt'),
    complete: t('kkakdugi.helper.complete'),
  };

  const addToCart = useCallback(() => {
    if (!selectedItem) return;
    const price = calculateItemPrice(selectedItem, selectedOptions);
    const existing = cart.findIndex(
      (c) => c.menuItem.id === selectedItem.id &&
        JSON.stringify(c.selectedOptions.map((o) => o.id).sort()) ===
        JSON.stringify(selectedOptions.map((o) => o.id).sort()),
    );
    if (existing >= 0) {
      setCart((prev) => prev.map((c, i) => i === existing ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart((prev) => [...prev, { menuItem: selectedItem, selectedOptions, quantity: 1, totalPrice: price }]);
    }
    setSelectedItem(null);
    setSelectedOptions([]);
    setScreen('menu');
  }, [selectedItem, selectedOptions, cart]);

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = item.quantity + delta;
      return newQty > 0 ? { ...item, quantity: newQty } : item;
    }));
  };

  const cartTotal = calculateCartTotal(cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const filteredMenu = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCategory);

  const handleComplete = () => {
    setShowConfetti(true);
    onComplete();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Helper bubble
  const HelperBubble = () => (
    showHelper ? (
      <div className="absolute top-2 left-2 right-2 z-20 animate-[slideUp_0.3s_ease-out]">
        <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-lg flex items-start gap-2">
          <MessageCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed flex-1">{helperMessages[screen]}</p>
          <button onClick={() => setShowHelper(false)} className="text-white/70 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      </div>
    ) : (
      <button
        onClick={() => setShowHelper(true)}
        className="absolute top-2 right-2 z-20 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <HelpCircle size={16} />
      </button>
    )
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 kiosk-overlay">
      <div className="bg-gray-100 w-full kiosk-legacy-frame overflow-hidden shadow-2xl flex flex-col relative">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 flex items-center justify-between">
          <span className="text-white text-sm font-medium">
            {t('kkakdugi.step', '단계')} {currentStepIndex + 1}/{totalSteps}
          </span>
          <div className="flex-1 mx-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Screen content */}
        <div className="flex-1 overflow-y-auto relative">
          <HelperBubble />

          <div className="pt-12">
            {/* WELCOME */}
            {screen === 'welcome' && (
              <div className="flex flex-col items-center justify-center h-full min-h-0 p-6">
                <div className="text-8xl mb-6">☕</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('kkakdugi.screens.welcome.title', '카페')}
                </h2>
                <button
                  onClick={() => { setScreen('menu'); setTimer(120); }}
                  className="mt-8 w-full py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-2xl hover:shadow-xl transition-all active:scale-[0.98] border-b-4 border-purple-700"
                >
                  {t('kkakdugi.screens.welcome.touch', '주문하시려면 터치하세요')}
                </button>
              </div>
            )}

            {/* MENU */}
            {screen === 'menu' && (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
                  <button onClick={() => { setScreen('welcome'); setCart([]); }} className="flex items-center gap-1 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm">
                    <Home size={14} />
                    {t('kkakdugi.screens.menu.home', '처음으로')}
                  </button>
                  <span className="text-white font-bold">{t('kkakdugi.screens.welcome.title', '카페')}</span>
                  <button className="flex items-center gap-1 bg-white/20 text-white px-3 py-1.5 rounded-full text-sm">
                    <Globe size={14} />
                    {t('kkakdugi.screens.menu.language', 'LANGUAGE')}
                  </button>
                </div>

                {/* Categories */}
                <div className="bg-white px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t(cat.nameKey)}
                    </button>
                  ))}
                </div>

                {/* Menu grid */}
                <div className="flex-1 p-3 grid grid-cols-2 gap-3 auto-rows-min">
                  {filteredMenu.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setSelectedOptions([]); setScreen('options'); }}
                      className="bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all active:scale-[0.97] text-center"
                    >
                      <div className="text-4xl mb-2">{item.emoji}</div>
                      <p className="text-xs font-medium text-gray-900 mb-1 leading-tight">{item.nameKey}</p>
                      <p className="text-sm font-bold text-blue-600">{formatPrice(item.price)}원</p>
                    </button>
                  ))}
                </div>

                {/* Cart bar */}
                <div className="bg-white border-t-2 border-gray-200">
                  <div className="px-4 py-1 flex text-xs text-gray-400 border-b border-gray-100">
                    <span className="flex-1">{t('kkakdugi.screens.menu.cartHeader.menu', '메뉴')}</span>
                    <span className="w-16 text-center">{t('kkakdugi.screens.menu.cartHeader.quantity', '수량')}</span>
                    <span className="w-20 text-right">{t('kkakdugi.screens.menu.cartHeader.price', '가격')}</span>
                  </div>
                  {cart.length === 0 ? (
                    <div className="px-4 py-3 text-center text-sm text-gray-400">
                      {t('kkakdugi.screens.menu.emptyCart', '메뉴를 선택해주세요')}
                    </div>
                  ) : (
                    <div className="max-h-24 overflow-y-auto">
                      {cart.map((item, i) => (
                        <div key={i} className="px-4 py-2 flex items-center text-sm">
                          <button onClick={() => removeFromCart(i)} className="text-gray-400 hover:text-red-500 mr-2">
                            <X size={14} />
                          </button>
                          <span className="flex-1 text-gray-700 truncate text-xs">{item.menuItem.nameKey}</span>
                          <div className="w-16 flex items-center justify-center gap-1">
                            <button onClick={() => updateQuantity(i, -1)} className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                              <Minus size={10} />
                            </button>
                            <span className="text-xs font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(i, 1)} className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                              <Plus size={10} />
                            </button>
                          </div>
                          <span className="w-20 text-right text-xs font-medium text-blue-600">{formatPrice(item.totalPrice * item.quantity)}원</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cart.length > 0 && (
                    <div className="px-3 py-2 flex items-center gap-2 bg-gray-50">
                      <span className="text-xs text-gray-500">{t('kkakdugi.screens.cart.timeLeft', '남은시간')} <span className="text-red-500 font-bold">{timer}{t('kkakdugi.screens.cart.seconds', '초')}</span></span>
                      <button onClick={() => setCart([])} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        {t('kkakdugi.screens.cart.clearAll', '전체삭제')}
                      </button>
                      <span className="text-xs text-gray-600 flex-1 text-center">{t('kkakdugi.screens.cart.selectedItems', '선택한 상품')} <span className="font-bold">{cartCount}{t('kkakdugi.screens.cart.itemUnit', '개')}</span></span>
                      <button
                        onClick={() => setScreen('orderConfirm')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-xs font-bold"
                      >
                        {formatPrice(cartTotal)}원 {t('kkakdugi.screens.cart.pay', '결제하기')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* OPTIONS */}
            {screen === 'options' && selectedItem && (
              <div className="p-4">
                <div className="bg-blue-600 text-white rounded-2xl p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm">{t('kkakdugi.screens.options.header', '선택하신 상품의 옵션을 선택하세요.')}</span>
                  <button onClick={() => { setScreen('menu'); setSelectedItem(null); }} className="text-white/70 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-2xl">
                  <div className="text-4xl">{selectedItem.emoji}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{selectedItem.nameKey}</p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{formatPrice(selectedItem.price)}원</p>
                </div>

                <div className="flex items-center justify-between mb-4 p-2 bg-gray-200 rounded-xl">
                  <span className="text-sm text-gray-600 ml-2">{t('kkakdugi.screens.options.selectedOptions', '선택된 옵션')}</span>
                  <div className="flex-1 mx-2 text-xs text-gray-500">
                    {selectedOptions.map((o) => t(o.nameKey)).join(', ') || '-'}
                  </div>
                  <button
                    onClick={() => setSelectedOptions([])}
                    className="px-3 py-1 bg-gray-800 text-white rounded-lg text-xs"
                  >
                    {t('kkakdugi.screens.options.reset', '초기화')}
                  </button>
                </div>

                {optionGroups.map((group) => (
                  <div key={group.id} className="mb-4">
                    <h4 className="text-sm font-bold text-blue-600 mb-2">{t(group.titleKey)}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {group.options.map((opt) => {
                        const isSelected = selectedOptions.some((o) => o.id === opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSelectedOptions((prev) =>
                                isSelected
                                  ? prev.filter((o) => o.id !== opt.id)
                                  : [...prev.filter((o) => !group.options.some((go) => go.id === o.id)), opt],
                              );
                            }}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <span className="text-2xl">{opt.emoji}</span>
                            <div className="text-left">
                              <p className="text-xs font-medium">{t(opt.nameKey)}</p>
                              <p className="text-xs font-bold text-blue-600">+{formatPrice(opt.priceAdd)}원</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setScreen('menu'); setSelectedItem(null); }}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm"
                  >
                    {t('kkakdugi.screens.options.cancel', '취소')}
                  </button>
                  <button
                    onClick={addToCart}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold text-sm border-b-4 border-purple-700 active:scale-[0.98]"
                  >
                    {t('kkakdugi.screens.options.addToCart', '주문담기')}
                  </button>
                </div>
              </div>
            )}

            {/* ORDER CONFIRM */}
            {screen === 'orderConfirm' && (
              <div className="p-4">
                <div className="bg-blue-600 text-white rounded-2xl p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">{t('kkakdugi.screens.orderConfirm.header')}</span>
                  <button onClick={() => setScreen('menu')} className="text-white/70 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                {cart.map((item, i) => (
                  <div key={i} className="flex items-center py-3 border-b border-gray-200 text-sm">
                    <span className="w-6 text-gray-400">{i + 1}</span>
                    <span className="flex-1 text-gray-900">{item.menuItem.nameKey}</span>
                    <span className="w-12 text-center text-gray-600">{item.quantity}{t('kkakdugi.screens.cart.itemUnit', '개')}</span>
                    <span className="w-20 text-right font-medium text-gray-900">{formatPrice(item.totalPrice * item.quantity)}원</span>
                  </div>
                ))}

                <p className="text-xs text-red-500 mt-3 mb-2">※ {t('kkakdugi.screens.orderConfirm.noDisposableCup')}</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('kkakdugi.screens.orderConfirm.totalQuantity')}</span>
                    <span className="font-bold">{cartCount}{t('kkakdugi.screens.cart.itemUnit', '개')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('kkakdugi.screens.orderConfirm.totalAmount')}</span>
                    <span className="font-bold text-blue-600 text-lg">{formatPrice(cartTotal)}원</span>
                  </div>
                </div>

                {/* Recommend */}
                <p className="text-sm font-medium text-gray-600 mb-2">{t('kkakdugi.screens.orderConfirm.recommend')}</p>
                <div className="flex gap-3 mb-6">
                  {recommendItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setSelectedOptions([]); setScreen('options'); }}
                      className="flex-1 bg-white border-2 border-gray-100 rounded-2xl p-3 text-center hover:border-blue-300 transition-all"
                    >
                      <div className="text-3xl mb-1">{item.emoji}</div>
                      <p className="text-xs font-medium">{item.nameKey}</p>
                      <p className="text-xs font-bold text-blue-600">{formatPrice(item.price)}원</p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => { setDineIn(true); setScreen('payment'); }}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-sm border-b-4 border-blue-700 active:scale-[0.98]"
                  >
                    {t('kkakdugi.screens.orderConfirm.dineIn', '먹고가기')}
                    <br /><span className="text-xs font-normal opacity-80">{t('kkakdugi.screens.orderConfirm.dineInSub', '(다회용컵)')}</span>
                  </button>
                  <button
                    onClick={() => { setDineIn(false); setScreen('payment'); }}
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-sm border-b-4 border-orange-700 active:scale-[0.98]"
                  >
                    {t('kkakdugi.screens.orderConfirm.takeout', '포장하기')}
                    <br /><span className="text-xs font-normal opacity-80">{t('kkakdugi.screens.orderConfirm.takeoutSub', '(일회용컵)')}</span>
                  </button>
                </div>
                <button
                  onClick={() => setScreen('menu')}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-2xl font-medium text-sm flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} />
                  {t('kkakdugi.screens.orderConfirm.back', '돌아가기')}
                </button>
              </div>
            )}

            {/* PAYMENT METHOD */}
            {screen === 'payment' && (
              <div className="p-4">
                <div className="bg-blue-600 text-white rounded-2xl p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">{t('kkakdugi.screens.payment.title')}</span>
                  <button onClick={() => setScreen('orderConfirm')} className="text-white/70 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded">STEP1</span>
                    <span className="text-sm">{t('kkakdugi.screens.payment.step1')}</span>
                  </div>
                  <div className="flex gap-2">
                    {['KT VIP', 'SKT', 'CJ ONE'].map((name) => (
                      <button key={name} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-xs text-gray-600 hover:border-blue-300 bg-white">
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-400 text-xs font-bold px-2 py-1 rounded">STEP2</span>
                    <span className="text-sm">{t('kkakdugi.screens.payment.step2')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => method.id === 'card' && setScreen('cardPayment')}
                        className={`py-4 border-2 rounded-2xl text-center transition-all ${
                          method.id === 'card'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{method.emoji}</div>
                        <p className="text-xs font-bold">{t(method.nameKey)}</p>
                        {method.subKey && <p className="text-xs text-gray-400">{t(method.subKey)}</p>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{t('kkakdugi.screens.payment.orderAmount')}</span>
                    <span className="font-bold">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-500 font-medium">{t('kkakdugi.screens.payment.payAmount')}</span>
                    <span className="text-lg font-bold text-red-500">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CARD PAYMENT */}
            {screen === 'cardPayment' && (
              <div className="p-4">
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                  <h3 className="text-lg font-bold mb-4">{t('kkakdugi.screens.cardPayment.title')}</h3>

                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('kkakdugi.screens.cardPayment.total')}</span>
                      <span className="text-xl font-bold text-red-500">{formatPrice(cartTotal)}원</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('kkakdugi.screens.cardPayment.installment')}</span>
                    <span>{t('kkakdugi.screens.cardPayment.lumpSum')}</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('kkakdugi.screens.cardPayment.cardNumber')}</span>
                      <span className="text-red-500">1234-5678-****-****</span>
                    </div>
                  </div>

                  <div className="text-center mb-4 p-4 bg-gray-50 rounded-xl">
                    <CreditCard size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{t('kkakdugi.screens.cardPayment.insertGuide')}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setScreen('payment')}
                      className="flex-1 py-4 bg-gray-800 text-white rounded-2xl font-bold"
                    >
                      {t('kkakdugi.screens.cardPayment.cancel', '취소')}
                    </button>
                    <button
                      onClick={() => setScreen('points')}
                      className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold border-b-4 border-purple-700 active:scale-[0.98]"
                    >
                      {t('kkakdugi.screens.cardPayment.approve', '승인요청')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* POINTS */}
            {screen === 'points' && (
              <div className="p-4 flex flex-col items-center justify-center min-h-0">
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 w-full text-center">
                  <p className="text-lg font-bold mb-8">{t('kkakdugi.screens.points.ask')}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setScreen('receipt')}
                      className="flex-1 py-5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl font-bold text-lg border-b-4 border-orange-600 active:scale-[0.98]"
                    >
                      {t('kkakdugi.screens.points.yes', '예')}
                    </button>
                    <button
                      onClick={() => setScreen('receipt')}
                      className="flex-1 py-5 bg-gray-800 text-white rounded-2xl font-bold text-lg border-b-4 border-gray-900 active:scale-[0.98]"
                    >
                      {t('kkakdugi.screens.points.no', '아니오')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RECEIPT ASK */}
            {screen === 'receipt' && (
              <div className="p-4 flex flex-col items-center justify-center min-h-0">
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 w-full text-center">
                  <div className="bg-yellow-400 text-center py-2 rounded-xl mb-4">
                    <p className="font-bold">[{t('kkakdugi.screens.receipt.approved')}]</p>
                  </div>
                  <p className="text-lg font-bold mb-8">{t('kkakdugi.screens.receipt.ask')}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setScreen('complete')}
                      className="flex-1 py-5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl font-bold text-lg border-b-4 border-orange-600 active:scale-[0.98]"
                    >
                      {t('kkakdugi.screens.receipt.print', '출력')}
                    </button>
                    <button
                      onClick={() => setScreen('complete')}
                      className="flex-1 py-5 bg-gray-800 text-white rounded-2xl font-bold text-lg border-b-4 border-gray-900 active:scale-[0.98]"
                    >
                      {t('kkakdugi.screens.receipt.noPrint', '미출력')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COMPLETE */}
            {screen === 'complete' && (
              <div className="p-4">
                <h2 className="text-xl font-bold text-center text-orange-500 mb-2">
                  {t('kkakdugi.screens.complete.receiptTitle', '영수증')}
                </h2>
                <p className="text-center text-gray-600 mb-4">{t('kkakdugi.screens.complete.receiptCollect')}</p>

                <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 mb-6">
                  <h3 className="text-center font-bold mb-2">{t('kkakdugi.screens.complete.receiptTitle')}</h3>
                  <p className="text-center text-sm text-gray-500 mb-1">{t('kkakdugi.screens.complete.paymentDetail')}</p>
                  <p className="text-center text-sm text-gray-500 mb-4">{t('kkakdugi.screens.complete.icApproval')}</p>

                  {(() => {
                    const { amount, tax } = calculateTax(cartTotal);
                    return (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span>{t('kkakdugi.screens.complete.amount')}</span>
                          <span>{formatPrice(amount)}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('kkakdugi.screens.complete.tax')}</span>
                          <span>{formatPrice(tax)}원</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>{t('kkakdugi.screens.complete.total')}</span>
                          <span>{formatPrice(cartTotal)}원</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{t('kkakdugi.screens.complete.cardName')}</span>
                          <span>{t('kkakdugi.screens.complete.lumpSum', '일시불')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{t('kkakdugi.screens.cardPayment.cardNumber')}</span>
                          <span>{t('kkakdugi.screens.complete.cardNumber')}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <p className="text-center font-bold text-lg">{t('kkakdugi.screens.complete.thanks')}</p>
                </div>

                {showConfetti && (
                  <div className="text-center mb-4 animate-bounce">
                    <span className="text-6xl">🎉</span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-green-600">{t('kkakdugi.screens.complete.congrats')}</h3>
                  <p className="text-gray-600 mt-1">{t('kkakdugi.screens.complete.message')}</p>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg border-b-4 border-green-700 active:scale-[0.98]"
                >
                  {t('kkakdugi.screens.complete.done', '연습 끝내기')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
