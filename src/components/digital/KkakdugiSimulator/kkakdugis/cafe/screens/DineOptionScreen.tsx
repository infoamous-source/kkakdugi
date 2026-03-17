import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: (dineIn: boolean) => void;
  onBack: () => void;
}

export default function DineOptionScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#3D2B1F' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: '#C89B3C' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          CAFE
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Title */}
      <div className="px-6 pt-8 pb-5 text-center">
        <h2
          className="font-bold mb-2"
          style={{ color: '#2C1A0E', fontSize: 20, letterSpacing: '0.02em' }}
        >
          {t('kkakdugi.screens.dineOption.title', '주문 방식을 선택하세요')}
        </h2>
        <p style={{ color: '#9E7E6A', fontSize: 13 }}>
          {t('kkakdugi.screens.dineOption.subtitle', '컵 종류가 달라집니다')}
        </p>
      </div>

      {/* Two option buttons */}
      <div className="flex-1 flex gap-4 px-5 pb-8">
        {/* Dine In */}
        <button
          onClick={() => { feedbackTap(); onNext(true); }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg transition-all active:scale-[0.97] border-2"
          style={{
            borderColor: '#C89B3C',
            backgroundColor: 'white',
            minHeight: 200,
          }}
        >
          {/* Icon: reusable cup */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#FFF8F0', border: '2px solid #E8D5C0' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* Cup */}
              <path d="M10 12 L14 32 Q14 35 19 35 L19 35 Q24 35 24 32 L28 12 Z" fill="#9C6B3C" />
              <path d="M10 12 L28 12" stroke="#7A5230" strokeWidth="1.5" strokeLinecap="round" />
              {/* Lid */}
              <rect x="8" y="9" width="22" height="4" rx="2" fill="#C89B3C" />
              {/* Straw hole */}
              <circle cx="19" cy="11" r="1.5" fill="#7A5230" />
              {/* Straw */}
              <path d="M19 11 L23 3" stroke="#7A5230" strokeWidth="1.5" strokeLinecap="round" />
              {/* Handle (reusable indicator) */}
              <path d="M28 18 Q35 18 35 24 Q35 30 28 30" stroke="#9C6B3C" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="font-bold mb-1"
              style={{ color: '#2C1A0E', fontSize: 18, letterSpacing: '0.02em' }}
            >
              {t('kkakdugi.screens.dineOption.dineIn', '매장')}
            </p>
            <p style={{ color: '#9C6B3C', fontSize: 12, fontWeight: 600 }}>FOR HERE</p>
            <p
              className="mt-2 text-xs px-3"
              style={{ color: '#9E7E6A', lineHeight: 1.5 }}
            >
              {t('kkakdugi.screens.dineOption.dineInSub', '다회용컵 제공')}
            </p>
          </div>
        </button>

        {/* Take Out */}
        <button
          onClick={() => { feedbackTap(); onNext(false); }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg transition-all active:scale-[0.97] border-2"
          style={{
            borderColor: '#E8D5C0',
            backgroundColor: 'white',
            minHeight: 200,
          }}
        >
          {/* Icon: disposable cup */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#FFF8F0', border: '2px solid #E8D5C0' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* Bag */}
              <rect x="9" y="16" width="20" height="18" rx="2" fill="#C89B3C" />
              <path d="M9 18 L29 18" stroke="#9C6B3C" strokeWidth="1" />
              {/* Bag handles */}
              <path d="M14 16 Q14 10 19 10 Q24 10 24 16" stroke="#9C6B3C" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Text on bag */}
              <rect x="13" y="22" width="12" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
              <rect x="14" y="26" width="10" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="font-bold mb-1"
              style={{ color: '#2C1A0E', fontSize: 18, letterSpacing: '0.02em' }}
            >
              {t('kkakdugi.screens.dineOption.takeout', '포장')}
            </p>
            <p style={{ color: '#9C6B3C', fontSize: 12, fontWeight: 600 }}>TAKE OUT</p>
            <p
              className="mt-2 text-xs px-3"
              style={{ color: '#9E7E6A', lineHeight: 1.5 }}
            >
              {t('kkakdugi.screens.dineOption.takeoutSub', '일회용컵 제공')}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
