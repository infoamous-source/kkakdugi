import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
}

export default function ReceiptScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#8B0000' }}
      >
        <div className="flex justify-center">
          <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
            영수증
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Icon */}
        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, backgroundColor: '#FFF0E8', border: '2px solid #F0E0D0' }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            {/* Paper receipt */}
            <rect x="8" y="4" width="20" height="28" rx="2" fill="#F0E0D0" />
            <rect x="8" y="4" width="20" height="28" rx="2" stroke="#E0C8B0" strokeWidth="1" />
            {/* Lines on receipt */}
            <rect x="11" y="9" width="14" height="1.5" rx="0.75" fill="#CC0000" />
            <rect x="11" y="13" width="10" height="1" rx="0.5" fill="#FFC107" opacity="0.6" />
            <rect x="11" y="16" width="12" height="1" rx="0.5" fill="#FFC107" opacity="0.6" />
            <rect x="11" y="19" width="8" height="1" rx="0.5" fill="#FFC107" opacity="0.6" />
            {/* Zigzag bottom */}
            <path d="M8 30 L10 32 L12 30 L14 32 L16 30 L18 32 L20 30 L22 32 L24 30 L26 32 L28 30" stroke="#E0C8B0" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <p className="font-bold text-center mb-8" style={{ color: '#1A1A1A', fontSize: 16 }}>
          {t('kkakdugi.screens.receipt.ask', '영수증을 출력하시겠습니까?')}
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => { feedbackTap(); onNext(); }}
            className="flex-1 py-5 rounded font-bold text-lg transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#CC0000', color: 'white' }}
          >
            {t('kkakdugi.screens.receipt.print', '출력')}
          </button>
          <button
            onClick={() => { feedbackTap(); onNext(); }}
            className="flex-1 py-5 rounded font-bold text-lg transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#6B0000', color: 'white' }}
          >
            {t('kkakdugi.screens.receipt.noPrint', '미출력')}
          </button>
        </div>
      </div>
    </div>
  );
}
