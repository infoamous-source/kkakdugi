import { useTranslation } from 'react-i18next';
import { formatPrice, calculateTax, type FastfoodCartItem } from '../data';
import { feedbackSuccess } from '../../../core/haptics';

interface Props {
  cart: FastfoodCartItem[];
  orderNumber: number;
  onDone: () => void;
}

export default function CompleteScreen({ cart, orderNumber, onDone }: Props) {
  const { t } = useTranslation();
  const total = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  const { amount, tax } = calculateTax(total);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: '#8B0000' }}
      >
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          {t('kkakdugi.screens.complete.receiptTitle', '영수증')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Order number */}
        <div className="text-center mb-4">
          <p className="text-xs mb-1" style={{ color: '#999999' }}>
            {t('kkakdugi.screens.complete.congrats', '주문이 완료되었습니다')}
          </p>
          <div
            className="inline-flex flex-col items-center px-8 py-3 rounded"
            style={{ backgroundColor: '#6B0000' }}
          >
            <span className="text-xs mb-1" style={{ color: 'rgba(255,193,7,0.7)', letterSpacing: '0.1em' }}>
              ORDER NUMBER
            </span>
            <span className="font-bold" style={{ color: '#FFC107', fontSize: 36, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
              {String(orderNumber).padStart(3, '0')}
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: '#999999' }}>
            {t('kkakdugi.screens.complete.message', '번호판이 호출되면 수령하세요')}
          </p>
        </div>

        {/* Receipt */}
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid #F0E0D0', fontFamily: 'monospace' }}
        >
          {/* Receipt header */}
          <div className="text-center py-3 px-4" style={{ backgroundColor: '#6B0000' }}>
            <p className="font-bold text-sm" style={{ color: 'white', letterSpacing: '0.1em' }}>
              BURGER
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,193,7,0.6)' }}>
              {dateStr} {timeStr}
            </p>
          </div>

          {/* Receipt body */}
          <div className="bg-white px-4 py-3">
            {/* Divider */}
            <p className="text-center text-xs mb-3" style={{ color: '#F0E0D0', letterSpacing: '0.05em' }}>
              ─────────────────
            </p>

            {/* Items */}
            {cart.map((item, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <span className="text-xs truncate flex-1 mr-2" style={{ color: '#1A1A1A' }}>
                    {item.menuItem.nameKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#999999' }}>
                    &nbsp;&nbsp;x{item.quantity} @ {formatPrice(item.totalPrice)}
                  </span>
                  <span className="text-xs font-bold" style={{ color: '#1A1A1A' }}>
                    {formatPrice(item.totalPrice * item.quantity)}원
                  </span>
                </div>
                {item.selectedOptions.length > 0 && (
                  <p className="text-xs" style={{ color: '#999999' }}>
                    &nbsp;&nbsp;({item.selectedOptions.map((o) => o.nameKey).join(', ')})
                  </p>
                )}
              </div>
            ))}

            <p className="text-center text-xs my-3" style={{ color: '#F0E0D0' }}>
              ─────────────────
            </p>

            {/* Totals */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#555555' }}>
                  {t('kkakdugi.screens.complete.amount', '공급가액')}
                </span>
                <span className="text-xs" style={{ color: '#1A1A1A' }}>
                  {formatPrice(amount)}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#555555' }}>
                  {t('kkakdugi.screens.complete.tax', '부가세')}
                </span>
                <span className="text-xs" style={{ color: '#1A1A1A' }}>
                  {formatPrice(tax)}원
                </span>
              </div>
              <div
                className="flex justify-between pt-2 mt-1"
                style={{ borderTop: '1px solid #F0E0D0' }}
              >
                <span className="font-bold text-sm" style={{ color: '#1A1A1A' }}>
                  {t('kkakdugi.screens.complete.total', '합계')}
                </span>
                <span className="font-bold text-sm" style={{ color: '#CC0000' }}>
                  {formatPrice(total)}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#555555' }}>
                  {t('kkakdugi.screens.complete.cardName', '결제수단')}
                </span>
                <span className="text-xs" style={{ color: '#1A1A1A' }}>
                  {t('kkakdugi.screens.complete.lumpSum', '신용카드 일시불')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#555555' }}>
                  {t('kkakdugi.screens.cardPayment.cardNumber', '카드번호')}
                </span>
                <span className="text-xs font-mono" style={{ color: '#1A1A1A' }}>
                  {t('kkakdugi.screens.complete.cardNumber', '****-****-****-1234')}
                </span>
              </div>
            </div>

            <p className="text-center text-xs my-3" style={{ color: '#F0E0D0' }}>
              ─────────────────
            </p>

            <p className="text-center font-bold text-sm" style={{ color: '#1A1A1A' }}>
              {t('kkakdugi.screens.complete.thanks', '감사합니다')}
            </p>
            <p className="text-center text-xs mt-1" style={{ color: '#999999' }}>
              {t('kkakdugi.screens.complete.paymentDetail', 'IC 승인')}
            </p>
          </div>
        </div>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '2px solid #F0E0D0' }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#8B0000', color: 'white' }}
        >
          {t('kkakdugi.screens.complete.done', '연습 끝내기')}
        </button>
      </div>
    </div>
  );
}
