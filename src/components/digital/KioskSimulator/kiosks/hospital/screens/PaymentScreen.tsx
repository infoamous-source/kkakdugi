import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { formatPrice, CONSULTATION_FEE } from '../data';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F0FAFA' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#0D7377' }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('hospital.screens.payment.cancel', '취소')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('hospital.screens.payment.title', '수납')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Amount display */}
        <div
          className="rounded px-4 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#1A2F2F' }}
        >
          <span className="text-sm" style={{ color: 'rgba(212,232,232,0.6)' }}>
            {t('hospital.screens.payment.amountLabel', '납부 금액')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ color: '#2ECC71', fontSize: 26 }}>
              {formatPrice(CONSULTATION_FEE)}
            </span>
            <span className="text-sm font-medium" style={{ color: '#2ECC71' }}>원</span>
          </div>
        </div>

        {/* Payment method */}
        <div
          className="rounded px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: 'white', border: '1.5px solid #14919B' }}
        >
          <div
            className="flex items-center justify-center rounded flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: '#E8F5F5' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="11" rx="2" stroke="#14919B" strokeWidth="1.5" />
              <path d="M2 8.5H18" stroke="#14919B" strokeWidth="1.5" />
              <rect x="4.5" y="11" width="4" height="2" rx="0.5" fill="#14919B" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#1A2F2F' }}>
              {t('hospital.screens.payment.cardMethod', '카드 결제')}
            </p>
            <p className="text-xs" style={{ color: '#8BAAAA' }}>
              {t('hospital.screens.payment.cardSub', 'IC 카드 · 비접촉 결제')}
            </p>
          </div>
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 20, height: 20, backgroundColor: '#14919B' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.5 7.5L8 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card reader illustration */}
        <div
          className="flex-1 flex flex-col items-center justify-center rounded"
          style={{ backgroundColor: 'white', border: '1.5px dashed #D4E8E8' }}
        >
          {/* Card reader SVG — teal theme */}
          <div className="mb-4">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
              {/* Terminal body */}
              <rect x="15" y="10" width="60" height="70" rx="6" fill="#D4E8E8" />
              <rect x="18" y="13" width="54" height="67" rx="4" fill="#E8F5F5" />

              {/* Screen */}
              <rect x="22" y="17" width="46" height="28" rx="3" fill="#0D7377" />
              <rect x="25" y="20" width="40" height="22" rx="2" fill="#0A5E62" />
              {/* Screen text lines */}
              <rect x="28" y="25" width="18" height="2" rx="1" fill="rgba(46,204,113,0.5)" />
              <rect x="28" y="30" width="30" height="3" rx="1.5" fill="#2ECC71" />
              <rect x="28" y="36" width="14" height="2" rx="1" fill="rgba(46,204,113,0.35)" />

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
                    fill="#B0D4D4"
                  />
                ))
              )}

              {/* Card slot */}
              <rect x="22" y="76" width="46" height="5" rx="1" fill="#B0D4D4" />
              <rect x="25" y="77.5" width="40" height="2" rx="0.5" fill="#8BAAAA" />

              {/* Card being inserted */}
              <rect x="30" y="72" width="30" height="8" rx="1.5" fill="#14919B" opacity="0.55" />
              <rect x="30" y="73" width="30" height="3" rx="0.5" fill="rgba(46,204,113,0.35)" />
            </svg>
          </div>

          <p className="font-bold text-sm text-center mb-1" style={{ color: '#1A2F2F' }}>
            {t('hospital.screens.payment.insertGuide', '카드를 삽입하거나 접촉해 주세요')}
          </p>
          <p className="text-xs text-center" style={{ color: '#8BAAAA' }}>
            {t('hospital.screens.payment.insertSub', 'IC 카드 · 비접촉 결제 모두 가능')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="py-4 rounded font-bold text-sm transition-opacity hover:opacity-75"
            style={{ backgroundColor: '#E0EDED', color: '#4A6B6B', width: '35%' }}
          >
            {t('hospital.screens.payment.cancelBtn', '취소')}
          </button>
          <button
            onClick={() => { feedbackSuccess(); onNext(); }}
            className="flex-1 py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#14919B', color: 'white' }}
          >
            {t('hospital.screens.payment.payBtn', '결제')}
          </button>
        </div>
      </div>
    </div>
  );
}
