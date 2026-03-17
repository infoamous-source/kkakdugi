import { useTranslation } from 'react-i18next';
import { ChevronLeft, X, Minus, Plus } from 'lucide-react';
import { feedbackConfirm } from '../../../core/haptics';
import { formatPrice, calculateCartTotal, recommendItems, type FastfoodCartItem, type MenuCategory } from '../data';
import type { OrderMenuItem } from '../../../core/types';

interface Props {
  cart: FastfoodCartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveFromCart: (index: number) => void;
  onSelectRecommend: (item: OrderMenuItem & { category: MenuCategory; color: string }) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function OrderConfirmScreen({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onSelectRecommend,
  onBack,
  onNext,
}: Props) {
  const { t } = useTranslation();
  const total = calculateCartTotal(cart);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#8B0000' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: '#FFC107', border: '1px solid rgba(255,193,7,0.4)' }}
        >
          <ChevronLeft size={12} />
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          주문 확인
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Cart items list */}
      <div className="flex-1 overflow-y-auto">
        {/* Column headers */}
        <div
          className="flex items-center px-4 py-2"
          style={{ borderBottom: '1px solid #F0E0D0', backgroundColor: 'white' }}
        >
          <span className="flex-1 text-xs" style={{ color: '#999999' }}>
            {t('kkakdugi.screens.menu.cartHeader.menu', '메뉴')}
          </span>
          <span className="text-xs mr-8" style={{ color: '#999999' }}>
            {t('kkakdugi.screens.menu.cartHeader.quantity', '수량')}
          </span>
          <span className="text-xs" style={{ color: '#999999', minWidth: 64, textAlign: 'right' }}>
            {t('kkakdugi.screens.menu.cartHeader.price', '금액')}
          </span>
        </div>

        {cart.map((cartItem, i) => (
          <div
            key={i}
            className="flex items-center px-4 py-3"
            style={{ borderBottom: '1px solid #FFF0E8', backgroundColor: 'white' }}
          >
            <button
              onClick={() => onRemoveFromCart(i)}
              className="flex-shrink-0 mr-3"
              style={{ color: '#DDD' }}
            >
              <X size={14} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ color: '#1A1A1A', fontSize: 13 }}>
                {cartItem.menuItem.nameKey}
              </p>
              {cartItem.selectedOptions.length > 0 && (
                <p className="text-xs truncate" style={{ color: '#999999' }}>
                  {cartItem.selectedOptions.map((o) => o.nameKey).join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 mx-3">
              <button
                onClick={() => onUpdateQuantity(i, -1)}
                className="flex items-center justify-center rounded"
                style={{ width: 24, height: 24, border: '1px solid #F0E0D0', color: '#555555', backgroundColor: 'white' }}
              >
                <Minus size={10} />
              </button>
              <span
                className="font-bold text-center"
                style={{ color: '#1A1A1A', fontSize: 13, minWidth: 20 }}
              >
                {cartItem.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(i, 1)}
                className="flex items-center justify-center rounded"
                style={{ width: 24, height: 24, border: '1px solid #CC0000', color: '#CC0000', backgroundColor: 'white' }}
              >
                <Plus size={10} />
              </button>
            </div>
            <span
              className="font-bold"
              style={{ color: '#1A1A1A', fontSize: 13, minWidth: 64, textAlign: 'right' }}
            >
              {formatPrice(cartItem.totalPrice * cartItem.quantity)}원
            </span>
          </div>
        ))}

        {/* Notice */}
        <div className="px-4 py-2">
          <p className="text-xs" style={{ color: '#DC2626' }}>
            ※ {t('kkakdugi.screens.orderConfirm.notice', '세트 메뉴는 감자튀김(M)과 콜라(M)가 포함됩니다')}
          </p>
        </div>

        {/* Recommend section */}
        <div className="px-4 pt-3 pb-2">
          <p className="font-bold mb-2.5" style={{ color: '#1A1A1A', fontSize: 13 }}>
            {t('kkakdugi.screens.orderConfirm.recommend', '이런 메뉴는 어떠세요?')}
          </p>
          <div className="flex gap-3">
            {recommendItems.map((rec) => (
              <button
                key={rec.id}
                onClick={() => onSelectRecommend(rec)}
                className="flex-1 rounded overflow-hidden transition-all active:scale-[0.97]"
                style={{ border: '1px solid #F0E0D0', backgroundColor: 'white' }}
              >
                <div
                  className="w-full flex items-center justify-center"
                  style={{ height: 52, backgroundColor: rec.color }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, fontWeight: 700 }}>
                    {rec.nameKey.charAt(0)}
                  </span>
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-medium truncate" style={{ color: '#1A1A1A', fontSize: 11 }}>
                    {rec.nameKey}
                  </p>
                  <p className="font-bold" style={{ color: '#CC0000', fontSize: 11 }}>
                    {formatPrice(rec.price)}원
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Total summary */}
        <div
          className="mx-4 my-3 rounded p-4"
          style={{ backgroundColor: 'white', border: '1px solid #F0E0D0' }}
        >
          <div className="flex justify-between mb-2">
            <span style={{ color: '#555555', fontSize: 13 }}>
              {t('kkakdugi.screens.orderConfirm.totalQuantity', '총 수량')}
            </span>
            <span className="font-bold" style={{ color: '#1A1A1A', fontSize: 13 }}>
              {count}{t('kkakdugi.screens.cart.itemUnit', '개')}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid #FFF0E8' }}>
            <span className="font-bold" style={{ color: '#1A1A1A', fontSize: 14 }}>
              {t('kkakdugi.screens.orderConfirm.totalAmount', '합계')}
            </span>
            <span className="font-bold" style={{ color: '#CC0000', fontSize: 22 }}>
              {formatPrice(total)}원
            </span>
          </div>
        </div>
      </div>

      {/* Bottom action buttons */}
      <div
        className="flex-shrink-0 p-4 flex gap-3"
        style={{ borderTop: '2px solid #F0E0D0', backgroundColor: 'white' }}
      >
        <button
          onClick={onBack}
          className="flex-1 py-4 rounded font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#FFF0E8', color: '#555555' }}
        >
          {t('kkakdugi.screens.orderConfirm.back', '주문취소')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          className="flex-[2] py-4 rounded font-bold text-sm transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#8B0000', color: 'white' }}
        >
          <span style={{ color: '#FFC107' }}>{formatPrice(total)}원 </span>
          {t('kkakdugi.screens.cart.pay', '결제하기')}
        </button>
      </div>
    </div>
  );
}
