import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
}

export default function PointsScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#3D2B1F' }}
      >
        <div className="flex justify-center">
          <span className="font-bold text-sm tracking-widest" style={{ color: 'white', fontFamily: 'Georgia, serif' }}>
            포인트 적립
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Approved badge */}
        <div
          className="mb-6 px-5 py-2 rounded"
          style={{ backgroundColor: '#C89B3C', color: 'white' }}
        >
          <p className="font-bold text-sm tracking-wide">
            [ {t('kiosk.screens.receipt.approved', '결제 승인 완료')} ]
          </p>
        </div>

        {/* Icon */}
        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, backgroundColor: '#F5EDE2', border: '2px solid #E8D5C0' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="#9C6B3C" strokeWidth="2" />
            <text x="20" y="25" textAnchor="middle" fill="#9C6B3C" fontSize="16" fontWeight="bold">P</text>
          </svg>
        </div>

        <p className="font-bold text-center mb-8" style={{ color: '#2C1A0E', fontSize: 16 }}>
          {t('kiosk.screens.points.ask', '포인트를 적립하시겠습니까?')}
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => { feedbackTap(); onNext(); }}
            className="flex-1 py-5 rounded font-bold text-lg transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#9C6B3C', color: 'white' }}
          >
            {t('kiosk.screens.points.yes', '예')}
          </button>
          <button
            onClick={() => { feedbackTap(); onNext(); }}
            className="flex-1 py-5 rounded font-bold text-lg transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#2C1A0E', color: 'white' }}
          >
            {t('kiosk.screens.points.no', '아니오')}
          </button>
        </div>
      </div>
    </div>
  );
}
