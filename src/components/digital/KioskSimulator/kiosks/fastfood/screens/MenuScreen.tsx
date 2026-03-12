import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { type MenuCategory, type FastfoodCartItem, categories, menuItems, formatPrice } from '../data';
import type { OrderMenuItem } from '../../../core/types';

interface Props {
  cart: FastfoodCartItem[];
  selectedCategory: MenuCategory;
  onCategoryChange: (cat: MenuCategory) => void;
  onSelectItem: (item: OrderMenuItem & { category: MenuCategory; color: string }) => void;
  onRemoveFromCart: (index: number) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onHome: () => void;
  timer: number;
}

export default function MenuScreen({
  cart,
  selectedCategory,
  onCategoryChange,
  onSelectItem,
  onRemoveFromCart,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
  onHome,
  timer,
}: Props) {
  const { t } = useTranslation();

  const filtered = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Top header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#8B0000' }}
      >
        <button
          onClick={onHome}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: '#FFC107', border: '1px solid rgba(255,193,7,0.4)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L1 5.5V11H4.5V8H7.5V11H11V5.5L6 1Z" fill="currentColor" />
          </svg>
          {t('kiosk.screens.menu.home', '처음으로')}
        </button>
        <span
          className="font-black tracking-widest text-sm"
          style={{ color: 'white' }}
        >
          BURGER
        </span>
        <button
          className="text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: '#FFC107', border: '1px solid rgba(255,193,7,0.4)' }}
        >
          KO
        </button>
      </div>

      {/* Main content: sidebar + grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: categories */}
        <div
          className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ width: 72, backgroundColor: '#6B0000', borderRight: '1px solid #8B0000' }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { feedbackTap(); onCategoryChange(cat.id); }}
                className="flex flex-col items-center justify-center py-3 px-1 text-center transition-all relative flex-shrink-0"
                style={{
                  minHeight: 64,
                  backgroundColor: isActive ? '#CC0000' : 'transparent',
                  color: isActive ? 'white' : '#FFCDD2',
                  borderLeft: isActive ? '3px solid #FFC107' : '3px solid transparent',
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 400,
                  lineHeight: 1.3,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right: product grid */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((item) => {
              const inCart = cart.find((c) => c.menuItem.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { feedbackTap(); onSelectItem(item); }}
                  className="text-left rounded overflow-hidden transition-all active:scale-[0.97] relative"
                  style={{ backgroundColor: 'white', border: '1px solid #F0E0D0', boxShadow: '0 1px 3px rgba(139,0,0,0.08)' }}
                >
                  {/* Image placeholder */}
                  <div
                    className="w-full flex items-center justify-center relative"
                    style={{ height: 80, backgroundColor: item.color }}
                  >
                    <span
                      className="font-bold select-none"
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: 28 }}
                    >
                      {item.nameKey.charAt(0)}
                    </span>
                    {item.popular && (
                      <span
                        className="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-sm"
                        style={{ backgroundColor: '#FFC107', color: '#1A1A1A', fontSize: 9 }}
                      >
                        인기
                      </span>
                    )}
                    {inCart && (
                      <span
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#8B0000', color: 'white', fontSize: 10 }}
                      >
                        {inCart.quantity}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p
                      className="font-medium leading-tight mb-1"
                      style={{ color: '#1A1A1A', fontSize: 11 }}
                    >
                      {item.nameKey}
                    </p>
                    <p
                      className="font-bold"
                      style={{ color: '#CC0000', fontSize: 12 }}
                    >
                      {formatPrice(item.price)}원
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom cart bar */}
      <div
        className="flex-shrink-0"
        style={{ borderTop: '2px solid #F0E0D0', backgroundColor: 'white' }}
      >
        {/* Cart items (compact) */}
        {cart.length > 0 && (
          <div style={{ maxHeight: 90, overflowY: 'auto', borderBottom: '1px solid #F0E0D0' }}>
            {cart.map((item, i) => (
              <div
                key={i}
                className="flex items-center px-3 py-1.5 gap-2"
                style={{ borderBottom: i < cart.length - 1 ? '1px solid #FFF0E8' : 'none' }}
              >
                <button
                  onClick={() => onRemoveFromCart(i)}
                  className="flex-shrink-0 rounded-full flex items-center justify-center transition-colors hover:opacity-75"
                  style={{ width: 18, height: 18, backgroundColor: '#FFF0E8', color: '#999999' }}
                >
                  <X size={10} />
                </button>
                <span
                  className="flex-1 truncate"
                  style={{ color: '#1A1A1A', fontSize: 11 }}
                >
                  {item.menuItem.nameKey}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQuantity(i, -1)}
                    className="flex items-center justify-center rounded transition-colors"
                    style={{ width: 20, height: 20, backgroundColor: '#FFF0E8', color: '#555555' }}
                  >
                    <Minus size={10} />
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', minWidth: 16, textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(i, 1)}
                    className="flex items-center justify-center rounded transition-colors"
                    style={{ width: 20, height: 20, backgroundColor: '#CC0000', color: 'white' }}
                  >
                    <Plus size={10} />
                  </button>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#CC0000', minWidth: 52, textAlign: 'right' }}>
                  {formatPrice(item.totalPrice * item.quantity)}원
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cart action bar */}
        <div className="flex items-center px-3 py-2 gap-2">
          {cart.length === 0 ? (
            <p className="flex-1 text-center text-xs" style={{ color: '#999999' }}>
              {t('kiosk.screens.menu.emptyCart', '메뉴를 선택해 주세요')}
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-1">
                <span style={{ color: '#999999', fontSize: 10 }}>
                  {t('kiosk.screens.cart.timeLeft', '남은 시간')}{' '}
                  <span style={{ color: timer <= 30 ? '#DC2626' : '#555555', fontWeight: 700 }}>
                    {timer}{t('kiosk.screens.cart.seconds', '초')}
                  </span>
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-75"
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: 10 }}
                >
                  {t('kiosk.screens.cart.clearAll', '전체삭제')}
                </button>
              </div>
              <button
                onClick={() => { feedbackConfirm(); onCheckout(); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded font-bold transition-all active:scale-[0.97]"
                style={{ backgroundColor: '#8B0000', color: 'white', fontSize: 12 }}
              >
                <ShoppingBag size={14} />
                <span>{cartCount}{t('kiosk.screens.cart.itemUnit', '개')}</span>
                <span style={{ color: '#FFC107' }}>|</span>
                <span>{formatPrice(cartTotal)}원</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
