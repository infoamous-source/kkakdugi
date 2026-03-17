import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import {
  CONVENIENCE_THEME,
  type ScannedItem,
  type BagOption,
  formatPrice,
} from '../data';

interface Props {
  scannedItems: ScannedItem[];
  selectedBag: BagOption;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OrderReviewScreen({
  scannedItems,
  selectedBag,
  onUpdateQuantity,
  onRemoveItem,
  onNext,
  onBack,
}: Props) {
  const { t } = useTranslation();

  const subtotal = scannedItems.reduce((sum, s) => sum + s.item.price * s.quantity, 0);
  const bagFee = selectedBag.price;
  const total = subtotal + bagFee;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <button
          onClick={() => { feedbackTap(); onBack(); }}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: CONVENIENCE_THEME.border, border: '1px solid rgba(167,243,208,0.4)' }}
        >
          {t('kiosk.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-wider" style={{ color: 'white' }}>
          {t('kiosk.convenience.review.header', '주문 확인')}
        </span>
        <div style={{ width: 50 }} />
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="space-y-2">
          {scannedItems.map((s) => (
            <div
              key={s.item.id}
              className="flex items-center gap-3 px-3 py-3 rounded-lg"
              style={{ backgroundColor: 'white', border: `1px solid ${CONVENIENCE_THEME.border}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: CONVENIENCE_THEME.text }}>
                  {s.item.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: CONVENIENCE_THEME.textLight }}>
                  {formatPrice(s.item.price)}{t('kiosk.currency', '원')}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => { feedbackTap(); onUpdateQuantity(s.item.id, -1); }}
                  className="w-7 h-7 rounded flex items-center justify-center transition-opacity hover:opacity-75"
                  style={{ backgroundColor: CONVENIENCE_THEME.surface, border: `1px solid ${CONVENIENCE_THEME.border}` }}
                >
                  <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                    <rect width="10" height="2" rx="1" fill={CONVENIENCE_THEME.text} />
                  </svg>
                </button>
                <span
                  className="text-sm font-bold text-center"
                  style={{ color: CONVENIENCE_THEME.text, minWidth: 24 }}
                >
                  {s.quantity}
                </span>
                <button
                  onClick={() => { feedbackTap(); onUpdateQuantity(s.item.id, 1); }}
                  className="w-7 h-7 rounded flex items-center justify-center transition-opacity hover:opacity-75"
                  style={{ backgroundColor: CONVENIENCE_THEME.surface, border: `1px solid ${CONVENIENCE_THEME.border}` }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="4" y="0" width="2" height="10" rx="1" fill={CONVENIENCE_THEME.text} />
                    <rect x="0" y="4" width="10" height="2" rx="1" fill={CONVENIENCE_THEME.text} />
                  </svg>
                </button>
              </div>

              {/* Subtotal */}
              <span className="font-bold text-sm flex-shrink-0" style={{ color: CONVENIENCE_THEME.primary, minWidth: 60, textAlign: 'right' }}>
                {formatPrice(s.item.price * s.quantity)}{t('kiosk.currency', '원')}
              </span>

              {/* Remove button */}
              <button
                onClick={() => { feedbackTap(); onRemoveItem(s.item.id); }}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-75"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1 L7 7 M7 1 L1 7" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Bag option line */}
        <div
          className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg"
          style={{ backgroundColor: 'white', border: `1px solid ${CONVENIENCE_THEME.border}` }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 5 L5 14 L11 14 L12 5 Z" fill={CONVENIENCE_THEME.surface} stroke={CONVENIENCE_THEME.primary} strokeWidth="1" />
              <path d="M6 5 Q6 2 8 2 Q10 2 10 5" fill="none" stroke={CONVENIENCE_THEME.primary} strokeWidth="1" />
            </svg>
            <span className="text-sm" style={{ color: CONVENIENCE_THEME.textLight }}>
              {selectedBag.name}
            </span>
          </div>
          <span className="text-sm font-medium" style={{ color: CONVENIENCE_THEME.textLight }}>
            {bagFee > 0 ? `${formatPrice(bagFee)}${t('kiosk.currency', '원')}` : '0원'}
          </span>
        </div>
      </div>

      {/* Bottom: total + pay button */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ backgroundColor: 'white', borderTop: `2px solid ${CONVENIENCE_THEME.border}` }}
      >
        {/* Subtotal breakdown */}
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: CONVENIENCE_THEME.textLight }}>
              {t('kiosk.convenience.review.subtotal', '상품 금액')}
            </span>
            <span className="text-xs" style={{ color: CONVENIENCE_THEME.text }}>
              {formatPrice(subtotal)}{t('kiosk.currency', '원')}
            </span>
          </div>
          {bagFee > 0 && (
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: CONVENIENCE_THEME.textLight }}>
                {t('kiosk.convenience.review.bagFee', '봉투')}
              </span>
              <span className="text-xs" style={{ color: CONVENIENCE_THEME.text }}>
                {formatPrice(bagFee)}{t('kiosk.currency', '원')}
              </span>
            </div>
          )}
          <div
            className="flex justify-between pt-1.5 mt-1"
            style={{ borderTop: `1px solid ${CONVENIENCE_THEME.border}` }}
          >
            <span className="font-bold text-sm" style={{ color: CONVENIENCE_THEME.text }}>
              {t('kiosk.convenience.review.total', '합계')}
            </span>
            <span className="font-bold text-base" style={{ color: CONVENIENCE_THEME.primary }}>
              {formatPrice(total)}{t('kiosk.currency', '원')}
            </span>
          </div>
        </div>

        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          disabled={scannedItems.length === 0}
          className="w-full py-3.5 rounded font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: scannedItems.length > 0 ? CONVENIENCE_THEME.primary : '#D1D5DB',
            color: 'white',
          }}
        >
          {t('kiosk.convenience.review.pay', '결제하기')}
        </button>
      </div>
    </div>
  );
}
