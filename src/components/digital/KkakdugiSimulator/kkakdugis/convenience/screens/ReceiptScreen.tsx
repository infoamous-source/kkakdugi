import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { CONVENIENCE_THEME } from '../data';

interface Props {
  onNext: () => void;
}

export default function ReceiptScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <div className="flex justify-center">
          <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
            {t('kkakdugi.convenience.receipt.header', '영수증')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Icon */}
        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, backgroundColor: CONVENIENCE_THEME.surface, border: `2px solid ${CONVENIENCE_THEME.border}` }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            {/* Paper receipt */}
            <rect x="8" y="4" width="20" height="28" rx="2" fill={CONVENIENCE_THEME.surface} />
            <rect x="8" y="4" width="20" height="28" rx="2" stroke={CONVENIENCE_THEME.border} strokeWidth="1" />
            {/* Lines on receipt */}
            <rect x="11" y="9" width="14" height="1.5" rx="0.75" fill={CONVENIENCE_THEME.primary} />
            <rect x="11" y="13" width="10" height="1" rx="0.5" fill={CONVENIENCE_THEME.accent} opacity="0.6" />
            <rect x="11" y="16" width="12" height="1" rx="0.5" fill={CONVENIENCE_THEME.accent} opacity="0.6" />
            <rect x="11" y="19" width="8" height="1" rx="0.5" fill={CONVENIENCE_THEME.accent} opacity="0.6" />
            {/* Zigzag bottom */}
            <path d="M8 30 L10 32 L12 30 L14 32 L16 30 L18 32 L20 30 L22 32 L24 30 L26 32 L28 30" stroke={CONVENIENCE_THEME.border} strokeWidth="1" fill="none" />
          </svg>
        </div>

        <p className="font-bold text-center mb-8" style={{ color: CONVENIENCE_THEME.text, fontSize: 16 }}>
          {t('kkakdugi.convenience.receipt.ask', '영수증을 출력하시겠습니까?')}
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => { feedbackTap(); onNext(); }}
            className="flex-1 py-5 rounded font-bold text-lg transition-all active:scale-[0.97]"
            style={{ backgroundColor: CONVENIENCE_THEME.primary, color: 'white' }}
          >
            {t('kkakdugi.convenience.receipt.print', '출력')}
          </button>
          <button
            onClick={() => { feedbackTap(); onNext(); }}
            className="flex-1 py-5 rounded font-bold text-lg transition-all active:scale-[0.97]"
            style={{ backgroundColor: CONVENIENCE_THEME.headerBg, color: 'white' }}
          >
            {t('kkakdugi.convenience.receipt.noPrint', '미출력')}
          </button>
        </div>
      </div>
    </div>
  );
}
