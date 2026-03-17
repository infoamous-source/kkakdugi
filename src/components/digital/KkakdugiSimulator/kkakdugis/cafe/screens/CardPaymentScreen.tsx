import { useTranslation } from 'react-i18next';
import { formatPrice } from '../data';
import { feedbackSuccess } from '../../../core/haptics';

interface Props {
  total: number;
  onBack: () => void;
  onApprove: () => void;
}

export default function CardPaymentScreen({ total, onBack, onApprove }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#3D2B1F' }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: '#C89B3C', border: '1px solid rgba(200,155,60,0.4)' }}
        >
          {t('kiosk.screens.cardPayment.cancel', '취소')}
        </button>
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white', fontFamily: 'Georgia, serif' }}>
          카드 결제
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Amount */}
        <div
          className="rounded p-4 flex items-center justify-between"
          style={{ backgroundColor: '#2C1A0E' }}
        >
          <span className="text-sm" style={{ color: 'rgba(255,248,240,0.6)' }}>
            {t('kiosk.screens.cardPayment.total', '결제 금액')}
          </span>
          <span className="font-bold" style={{ color: '#DC2626', fontSize: 22 }}>
            {formatPrice(total)}원
          </span>
        </div>

        {/* Card info */}
        <div
          className="rounded p-4"
          style={{ backgroundColor: 'white', border: '1px solid #E8D5C0' }}
        >
          <div className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid #F5EDE2' }}>
            <span className="text-sm" style={{ color: '#6B4E35' }}>
              {t('kiosk.screens.cardPayment.installment', '할부')}
            </span>
            <span className="font-medium text-sm" style={{ color: '#2C1A0E' }}>
              {t('kiosk.screens.cardPayment.lumpSum', '일시불')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#6B4E35' }}>
              {t('kiosk.screens.cardPayment.cardNumber', '카드번호')}
            </span>
            <span className="font-mono text-sm" style={{ color: '#DC2626' }}>
              1234-5678-****-****
            </span>
          </div>
        </div>

        {/* Card reader illustration */}
        <div
          className="flex-1 flex flex-col items-center justify-center rounded"
          style={{ backgroundColor: 'white', border: '1.5px dashed #E8D5C0' }}
        >
          {/* Card reader SVG */}
          <div className="mb-4">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              {/* Terminal body */}
              <rect x="15" y="10" width="60" height="70" rx="6" fill="#E8D5C0" />
              <rect x="18" y="13" width="54" height="67" rx="4" fill="#F5EDE2" />

              {/* Screen */}
              <rect x="22" y="17" width="46" height="28" rx="3" fill="#3D2B1F" />
              <rect x="25" y="20" width="40" height="22" rx="2" fill="#2C1A0E" />
              {/* Screen text */}
              <rect x="28" y="25" width="20" height="2" rx="1" fill="rgba(200,155,60,0.6)" />
              <rect x="28" y="30" width="34" height="3" rx="1.5" fill="#C89B3C" />
              <rect x="28" y="36" width="16" height="2" rx="1" fill="rgba(200,155,60,0.4)" />

              {/* Keypad */}
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => (
                  <rect
                    key={`${row}-${col}`}
                    x={24 + col * 14}
                    y={52 + row * 8}
                    width="10"
                    height="5"
                    rx="1"
                    fill="#D4B896"
                  />
                ))
              )}

              {/* Card slot */}
              <rect x="22" y="76" width="46" height="5" rx="1" fill="#D4B896" />
              <rect x="25" y="77.5" width="40" height="2" rx="0.5" fill="#C8A87A" />

              {/* Card being inserted */}
              <g style={{ animation: 'slideIn 2s ease-in-out infinite' }}>
                <rect x="30" y="72" width="30" height="8" rx="1.5" fill="#9C6B3C" opacity="0.6" />
                <rect x="30" y="73" width="30" height="3" rx="0.5" fill="rgba(200,155,60,0.4)" />
              </g>
            </svg>
          </div>

          <p className="font-bold text-sm text-center mb-1" style={{ color: '#2C1A0E' }}>
            {t('kiosk.screens.cardPayment.insertGuide', '카드를 삽입하거나 접촉해 주세요')}
          </p>
          <p className="text-xs text-center" style={{ color: '#9E7E6A' }}>
            IC 카드 · 비접촉 결제 모두 가능
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded font-bold text-sm transition-opacity hover:opacity-75"
            style={{ backgroundColor: '#2C1A0E', color: 'white' }}
          >
            {t('kiosk.screens.cardPayment.cancel', '취소')}
          </button>
          <button
            onClick={() => { feedbackSuccess(); onApprove(); }}
            className="flex-1 py-4 rounded font-bold text-sm transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#9C6B3C', color: 'white' }}
          >
            {t('kiosk.screens.cardPayment.approve', '승인 요청')}
          </button>
        </div>
      </div>
    </div>
  );
}
