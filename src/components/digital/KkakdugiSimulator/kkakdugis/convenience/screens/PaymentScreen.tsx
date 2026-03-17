import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackSuccess } from '../../../core/haptics';
import { CONVENIENCE_THEME, formatPrice } from '../data';

interface Props {
  total: number;
  onBack: () => void;
  onApprove: () => void;
}

export default function PaymentScreen({ total, onBack, onApprove }: Props) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | null>(null);
  const [showCardReader, setShowCardReader] = useState(false);

  const handleSelectMethod = (method: 'card' | 'mobile') => {
    feedbackTap();
    setPaymentMethod(method);
    setShowCardReader(true);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: CONVENIENCE_THEME.border, border: '1px solid rgba(167,243,208,0.4)' }}
        >
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-wider" style={{ color: 'white' }}>
          {t('kkakdugi.convenience.payment.header', '결제')}
        </span>
        <div style={{ width: 50 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Amount */}
        <div
          className="rounded-lg p-4 flex items-center justify-between"
          style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
        >
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('kkakdugi.convenience.payment.amount', '결제 금액')}
          </span>
          <span className="font-bold" style={{ color: 'white', fontSize: 24 }}>
            {formatPrice(total)}{t('kkakdugi.currency', '원')}
          </span>
        </div>

        {!showCardReader ? (
          /* Payment method selection */
          <div className="flex-1">
            <p className="font-medium text-sm mb-3" style={{ color: CONVENIENCE_THEME.text }}>
              {t('kkakdugi.convenience.payment.selectMethod', '결제 방법을 선택하세요')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Card */}
              <button
                onClick={() => handleSelectMethod('card')}
                className="flex flex-col items-center justify-center gap-3 rounded-lg py-6 transition-all active:scale-[0.97]"
                style={{
                  border: `2px solid ${CONVENIENCE_THEME.primary}`,
                  backgroundColor: CONVENIENCE_THEME.surface,
                  minHeight: 120,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="3" y="8" width="30" height="20" rx="3" fill={CONVENIENCE_THEME.surface} stroke={CONVENIENCE_THEME.primary} strokeWidth="1.5" />
                  <rect x="3" y="13" width="30" height="5" fill={CONVENIENCE_THEME.primary} opacity="0.3" />
                  <rect x="7" y="22" width="10" height="2" rx="1" fill={CONVENIENCE_THEME.primary} opacity="0.5" />
                </svg>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: CONVENIENCE_THEME.text }}>
                    {t('kkakdugi.convenience.payment.card', '카드')}
                  </p>
                  <p style={{ color: CONVENIENCE_THEME.textLight, fontSize: 10 }}>
                    {t('kkakdugi.convenience.payment.cardSub', '신용/체크카드')}
                  </p>
                </div>
              </button>

              {/* Mobile payment */}
              <button
                onClick={() => handleSelectMethod('mobile')}
                className="flex flex-col items-center justify-center gap-3 rounded-lg py-6 transition-all active:scale-[0.97]"
                style={{
                  border: `2px solid ${CONVENIENCE_THEME.border}`,
                  backgroundColor: 'white',
                  minHeight: 120,
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="10" y="3" width="16" height="30" rx="3" fill="white" stroke={CONVENIENCE_THEME.primary} strokeWidth="1.5" />
                  <rect x="12" y="7" width="12" height="20" rx="1" fill={CONVENIENCE_THEME.surface} />
                  <circle cx="18" cy="30" r="1.5" fill={CONVENIENCE_THEME.primary} opacity="0.5" />
                </svg>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: CONVENIENCE_THEME.text }}>
                    {t('kkakdugi.convenience.payment.mobile', '간편결제')}
                  </p>
                  <p style={{ color: CONVENIENCE_THEME.textLight, fontSize: 10 }}>
                    {t('kkakdugi.convenience.payment.mobileSub', '삼성페이/카카오페이')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* Card reader view */
          <>
            {/* Card info */}
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'white', border: `1px solid ${CONVENIENCE_THEME.border}` }}
            >
              <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: `1px solid ${CONVENIENCE_THEME.surface}` }}>
                <span className="text-sm" style={{ color: CONVENIENCE_THEME.textLight }}>
                  {t('kkakdugi.convenience.payment.installment', '할부')}
                </span>
                <span className="font-medium text-sm" style={{ color: CONVENIENCE_THEME.text }}>
                  {t('kkakdugi.convenience.payment.lumpSum', '일시불')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: CONVENIENCE_THEME.textLight }}>
                  {t('kkakdugi.convenience.payment.method', '결제수단')}
                </span>
                <span className="font-medium text-sm" style={{ color: CONVENIENCE_THEME.text }}>
                  {paymentMethod === 'card'
                    ? t('kkakdugi.convenience.payment.cardLabel', '신용카드')
                    : t('kkakdugi.convenience.payment.mobileLabel', '간편결제')}
                </span>
              </div>
            </div>

            {/* Card reader illustration */}
            <div
              className="flex-1 flex flex-col items-center justify-center rounded-lg"
              style={{ backgroundColor: 'white', border: `1.5px dashed ${CONVENIENCE_THEME.border}` }}
            >
              <div className="mb-4">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  {/* Terminal body */}
                  <rect x="15" y="8" width="50" height="60" rx="5" fill={CONVENIENCE_THEME.surface} stroke={CONVENIENCE_THEME.border} strokeWidth="1.5" />
                  {/* Screen */}
                  <rect x="20" y="14" width="40" height="22" rx="2" fill={CONVENIENCE_THEME.headerBg} />
                  {/* Screen content */}
                  <rect x="24" y="20" width="18" height="2" rx="1" fill="rgba(167,243,208,0.5)" />
                  <rect x="24" y="25" width="32" height="3" rx="1.5" fill={CONVENIENCE_THEME.accent} />
                  <rect x="24" y="31" width="14" height="2" rx="1" fill="rgba(167,243,208,0.3)" />
                  {/* Keypad */}
                  {[0, 1, 2].map((row) =>
                    [0, 1, 2].map((col) => (
                      <rect
                        key={`${row}-${col}`}
                        x={22 + col * 12}
                        y={42 + row * 7}
                        width="8"
                        height="4"
                        rx="1"
                        fill={CONVENIENCE_THEME.border}
                      />
                    ))
                  )}
                  {/* Card slot */}
                  <rect x="20" y="64" width="40" height="4" rx="1" fill={CONVENIENCE_THEME.border} />
                </svg>
              </div>

              <p className="font-bold text-sm text-center mb-1" style={{ color: CONVENIENCE_THEME.text }}>
                {t('kkakdugi.convenience.payment.insertCard', '카드를 삽입해 주세요')}
              </p>
              <p className="text-xs text-center" style={{ color: CONVENIENCE_THEME.textLight }}>
                {t('kkakdugi.convenience.payment.insertHint', 'IC 카드 / NFC 결제 가능')}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { feedbackTap(); setShowCardReader(false); setPaymentMethod(null); }}
                className="flex-1 py-3.5 rounded font-bold text-sm transition-opacity hover:opacity-75"
                style={{ backgroundColor: CONVENIENCE_THEME.headerBg, color: 'white' }}
              >
                {t('kkakdugi.convenience.payment.cancel', '취소')}
              </button>
              <button
                onClick={() => { feedbackSuccess(); onApprove(); }}
                className="flex-1 py-3.5 rounded font-bold text-sm transition-all active:scale-[0.97]"
                style={{ backgroundColor: CONVENIENCE_THEME.primary, color: 'white' }}
              >
                {t('kkakdugi.convenience.payment.approve', '승인 요청')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
