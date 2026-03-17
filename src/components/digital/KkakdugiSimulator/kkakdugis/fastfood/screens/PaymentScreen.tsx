import { useTranslation } from 'react-i18next';
import { ChevronLeft, CreditCard, Smartphone } from 'lucide-react';
import { feedbackTap } from '../../../core/haptics';
import { paymentMethods, formatPrice } from '../data';

interface Props {
  total: number;
  onBack: () => void;
  onSelectPayment: (methodId: string) => void;
}

function PaymentIcon({ icon }: { icon: string }) {
  if (icon === 'card') return <CreditCard size={28} style={{ color: '#CC0000' }} />;
  if (icon === 'smartphone') return <Smartphone size={28} style={{ color: '#CC0000' }} />;

  if (icon === 'kakao') {
    return (
      <div
        className="flex items-center justify-center rounded"
        style={{ width: 40, height: 28, backgroundColor: '#FEE500' }}
      >
        <span className="font-black text-xs" style={{ color: '#3A1D1D', letterSpacing: '-0.5px' }}>KAKAO</span>
      </div>
    );
  }
  if (icon === 'naver') {
    return (
      <div
        className="flex items-center justify-center rounded"
        style={{ width: 40, height: 28, backgroundColor: '#03C75A' }}
      >
        <span className="font-black text-xs" style={{ color: 'white', letterSpacing: '-0.5px' }}>N PAY</span>
      </div>
    );
  }
  return null;
}

export default function PaymentScreen({ total, onBack, onSelectPayment }: Props) {
  const { t } = useTranslation();

  const methodLabels: Record<string, { name: string; sub?: string }> = {
    'card':      { name: '신용 / 체크카드', sub: '국내외 전체 카드 가능' },
    'app-card':  { name: '앱카드', sub: '삼성·KB·신한·카카오페이 등' },
    'kakao-pay': { name: '카카오페이' },
    'naver-pay': { name: '네이버페이' },
  };

  const membershipOptions = ['KT VIP', 'SKT', 'CJ ONE'];

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
          {t('kiosk.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          결제 수단
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Total amount display */}
        <div
          className="rounded p-4 mb-5 flex items-center justify-between"
          style={{ backgroundColor: '#6B0000' }}
        >
          <span className="font-medium text-sm" style={{ color: 'rgba(255,249,240,0.7)' }}>
            {t('kiosk.screens.payment.payAmount', '결제 금액')}
          </span>
          <span className="font-bold" style={{ color: '#FFC107', fontSize: 24 }}>
            {formatPrice(total)}원
          </span>
        </div>

        {/* STEP 1: Membership */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ backgroundColor: '#CC0000', color: 'white' }}
            >
              STEP 1
            </span>
            <span className="font-medium text-sm" style={{ color: '#1A1A1A' }}>
              {t('kiosk.screens.payment.step1', '멤버십 할인 (선택)')}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {membershipOptions.map((name) => (
              <button
                key={name}
                className="py-3 rounded text-sm font-medium transition-opacity hover:opacity-75 active:scale-[0.97]"
                style={{
                  border: '1.5px solid #F0E0D0',
                  backgroundColor: 'white',
                  color: '#555555',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: Payment method */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ backgroundColor: '#CC0000', color: 'white' }}
            >
              STEP 2
            </span>
            <span className="font-medium text-sm" style={{ color: '#1A1A1A' }}>
              {t('kiosk.screens.payment.step2', '결제 방법 선택')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => {
              const lbl = methodLabels[method.id] ?? { name: t(method.nameKey) };
              const isCard = method.id === 'card';

              return (
                <button
                  key={method.id}
                  onClick={() => { feedbackTap(); onSelectPayment(method.id); }}
                  className="flex flex-col items-center justify-center gap-3 rounded py-5 transition-all active:scale-[0.97]"
                  style={{
                    border: `2px solid ${isCard ? '#CC0000' : '#F0E0D0'}`,
                    backgroundColor: isCard ? '#FFF9F0' : 'white',
                    minHeight: 110,
                  }}
                >
                  <PaymentIcon icon={method.icon} />
                  <div className="text-center">
                    <p className="font-bold" style={{ color: '#1A1A1A', fontSize: 12 }}>
                      {lbl.name}
                    </p>
                    {lbl.sub && (
                      <p className="text-xs mt-0.5" style={{ color: '#999999', fontSize: 10 }}>
                        {lbl.sub}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
