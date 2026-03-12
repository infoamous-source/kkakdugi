import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { CONVENIENCE_THEME, type ScannedItem } from '../data';

interface Props {
  restrictedItems: ScannedItem[];
  onVerified: () => void;
  onBack: () => void;
}

export default function AgeVerifyScreen({ restrictedItems, onVerified, onBack }: Props) {
  const { t } = useTranslation();

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
          {t('kiosk.convenience.ageVerify.header', '성인인증')}
        </span>
        <div style={{ width: 50 }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Warning icon */}
        <div
          className="mb-5 flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, backgroundColor: '#FEF2F2', border: '2px solid #FECACA' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            {/* Shield with exclamation */}
            <path
              d="M20 4 L34 10 L34 20 Q34 32 20 38 Q6 32 6 20 L6 10 Z"
              fill="#FEE2E2"
              stroke="#EF4444"
              strokeWidth="1.5"
            />
            <rect x="18.5" y="12" width="3" height="12" rx="1.5" fill="#EF4444" />
            <circle cx="20" cy="29" r="2" fill="#EF4444" />
          </svg>
        </div>

        <h2
          className="font-bold text-center mb-2"
          style={{ color: '#DC2626', fontSize: 18 }}
        >
          {t('kiosk.convenience.ageVerify.title', '성인인증이 필요합니다')}
        </h2>

        <p
          className="text-center text-sm mb-6"
          style={{ color: CONVENIENCE_THEME.textLight }}
        >
          {t('kiosk.convenience.ageVerify.desc', '다음 상품은 만 19세 이상 구매 가능합니다')}
        </p>

        {/* Restricted items list */}
        <div
          className="w-full rounded-lg mb-8 overflow-hidden"
          style={{ border: '1px solid #FECACA', backgroundColor: '#FEF2F2' }}
        >
          {restrictedItems.map((s, i) => (
            <div
              key={s.item.id}
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                borderBottom: i < restrictedItems.length - 1 ? '1px solid #FECACA' : undefined,
              }}
            >
              <span className="text-sm font-medium" style={{ color: '#991B1B' }}>
                {s.item.name}
              </span>
              <span className="text-xs" style={{ color: '#DC2626' }}>
                x{s.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* ID scan button */}
        <button
          onClick={() => { feedbackConfirm(); onVerified(); }}
          className="w-full py-4 rounded-lg font-bold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          style={{ backgroundColor: CONVENIENCE_THEME.primary, color: 'white' }}
        >
          {/* ID card icon */}
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <rect x="1" y="1" width="18" height="14" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="7" cy="7" r="2.5" fill="white" opacity="0.7" />
            <rect x="4" y="11" width="6" height="1.5" rx="0.75" fill="white" opacity="0.5" />
            <rect x="12" y="5" width="5" height="1" rx="0.5" fill="white" opacity="0.5" />
            <rect x="12" y="8" width="4" height="1" rx="0.5" fill="white" opacity="0.5" />
            <rect x="12" y="11" width="5" height="1" rx="0.5" fill="white" opacity="0.5" />
          </svg>
          {t('kiosk.convenience.ageVerify.scanId', '신분증 확인')}
        </button>

        <p
          className="text-center mt-3"
          style={{ color: CONVENIENCE_THEME.textLight, fontSize: 11 }}
        >
          {t('kiosk.convenience.ageVerify.hint', '신분증을 리더기에 스캔해주세요')}
        </p>
      </div>
    </div>
  );
}
