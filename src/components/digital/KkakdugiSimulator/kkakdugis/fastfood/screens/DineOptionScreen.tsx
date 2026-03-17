import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: (dineIn: boolean) => void;
  onBack: () => void;
}

export default function DineOptionScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#8B0000' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: '#FFC107' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <span className="font-black text-sm tracking-widest" style={{ color: 'white' }}>
          BURGER
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Title */}
      <div className="px-6 pt-8 pb-5 text-center">
        <h2
          className="font-bold mb-2"
          style={{ color: '#1A1A1A', fontSize: 20, letterSpacing: '0.02em' }}
        >
          {t('kkakdugi.screens.dineOption.title', '주문 방식을 선택하세요')}
        </h2>
        <p style={{ color: '#999999', fontSize: 13 }}>
          {t('kkakdugi.screens.dineOption.subtitle', '포장 여부를 선택해 주세요')}
        </p>
      </div>

      {/* Two option buttons */}
      <div className="flex-1 flex gap-4 px-5 pb-8">
        {/* Dine In */}
        <button
          onClick={() => { feedbackTap(); onNext(true); }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg transition-all active:scale-[0.97] border-2"
          style={{
            borderColor: '#FFC107',
            backgroundColor: 'white',
            minHeight: 200,
          }}
        >
          {/* Icon: tray */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#FFF9F0', border: '2px solid #F0E0D0' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* Tray */}
              <rect x="4" y="26" width="30" height="4" rx="2" fill="#CC0000" />
              {/* Burger on tray */}
              <path d="M10 20 Q10 12 19 12 Q28 12 28 20 Z" fill="#B86B1D" />
              <rect x="9" y="20" width="20" height="3" rx="1" fill="#4CAF50" opacity="0.8" />
              <rect x="9" y="23" width="20" height="3" rx="1" fill="#8B4513" />
              {/* Fries box */}
              <rect x="27" y="18" width="6" height="8" rx="1" fill="#CC0000" />
              <rect x="28" y="13" width="1.5" height="6" rx="0.5" fill="#DAA520" />
              <rect x="30" y="12" width="1.5" height="7" rx="0.5" fill="#DAA520" />
              <rect x="32" y="13" width="1.5" height="6" rx="0.5" fill="#DAA520" />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="font-bold mb-1"
              style={{ color: '#1A1A1A', fontSize: 18, letterSpacing: '0.02em' }}
            >
              {t('kkakdugi.screens.dineOption.dineIn', '매장')}
            </p>
            <p style={{ color: '#CC0000', fontSize: 12, fontWeight: 700 }}>FOR HERE</p>
            <p
              className="mt-2 text-xs px-3"
              style={{ color: '#999999', lineHeight: 1.5 }}
            >
              {t('kkakdugi.screens.dineOption.dineInSub', '트레이에 제공됩니다')}
            </p>
          </div>
        </button>

        {/* Take Out */}
        <button
          onClick={() => { feedbackTap(); onNext(false); }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg transition-all active:scale-[0.97] border-2"
          style={{
            borderColor: '#F0E0D0',
            backgroundColor: 'white',
            minHeight: 200,
          }}
        >
          {/* Icon: paper bag */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#FFF9F0', border: '2px solid #F0E0D0' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* Bag */}
              <rect x="9" y="16" width="20" height="18" rx="2" fill="#FFC107" />
              <path d="M9 18 L29 18" stroke="#DAA520" strokeWidth="1" />
              {/* Bag handles */}
              <path d="M14 16 Q14 10 19 10 Q24 10 24 16" stroke="#DAA520" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Text on bag */}
              <rect x="13" y="22" width="12" height="2" rx="1" fill="rgba(139,69,19,0.4)" />
              <rect x="14" y="26" width="10" height="2" rx="1" fill="rgba(139,69,19,0.4)" />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="font-bold mb-1"
              style={{ color: '#1A1A1A', fontSize: 18, letterSpacing: '0.02em' }}
            >
              {t('kkakdugi.screens.dineOption.takeout', '포장')}
            </p>
            <p style={{ color: '#CC0000', fontSize: 12, fontWeight: 700 }}>TAKE OUT</p>
            <p
              className="mt-2 text-xs px-3"
              style={{ color: '#999999', lineHeight: 1.5 }}
            >
              {t('kkakdugi.screens.dineOption.takeoutSub', '봉투에 담아 드립니다')}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
