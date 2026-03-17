import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { BANK_THEME } from '../data';

interface Props {
  onPrint: () => void;
  onSkip: () => void;
}

export default function ReceiptScreen({ onPrint, onSkip }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: BANK_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('bank.receipt.title', '영수증')}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Receipt icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, backgroundColor: BANK_THEME.surface }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="4" width="24" height="32" rx="2" stroke={BANK_THEME.primary} strokeWidth="1.8" />
            <line x1="12" y1="12" x2="28" y2="12" stroke={BANK_THEME.primary} strokeWidth="1.2" />
            <line x1="12" y1="17" x2="24" y2="17" stroke={BANK_THEME.primary} strokeWidth="1.2" opacity="0.5" />
            <line x1="12" y1="22" x2="20" y2="22" stroke={BANK_THEME.primary} strokeWidth="1.2" opacity="0.3" />
            <path d="M8 32L12 28L16 32L20 28L24 32L28 28L32 32V36H8V32Z" fill={BANK_THEME.surface} stroke={BANK_THEME.primary} strokeWidth="1.2" />
          </svg>
        </div>

        <p className="text-base font-bold text-center" style={{ color: BANK_THEME.text }}>
          {t('bank.receipt.question', '영수증을 출력하시겠습니까?')}
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={() => { feedbackTap(); onPrint(); }}
            className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: BANK_THEME.primary, color: 'white' }}
          >
            {t('bank.receipt.print', '출력')}
          </button>
          <button
            onClick={() => { feedbackTap(); onSkip(); }}
            className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#E2E8F0', color: BANK_THEME.textMid }}
          >
            {t('bank.receipt.skip', '미출력')}
          </button>
        </div>
      </div>
    </div>
  );
}
