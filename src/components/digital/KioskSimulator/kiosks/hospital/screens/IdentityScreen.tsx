import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function IdentityScreen({ onNext, onBack }: Props) {
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
          {t('hospital.screens.identity.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('hospital.screens.identity.title', '본인 확인')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Notice */}
        <div
          className="rounded px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: '#D4E8E8', border: '1px solid #B0D4D4' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="8" stroke="#0D7377" strokeWidth="1.5" />
            <rect x="8.25" y="7.5" width="1.5" height="5" rx="0.75" fill="#0D7377" />
            <rect x="8.25" y="5" width="1.5" height="1.5" rx="0.75" fill="#0D7377" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: '#1A2F2F' }}>
            {t('hospital.screens.identity.notice', '개인정보 보호를 위해 본인 확인이 필요합니다. 아래 정보를 확인해 주세요.')}
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded overflow-hidden flex-1"
          style={{ border: '1px solid #D4E8E8', backgroundColor: 'white' }}
        >
          {/* Section label */}
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: '#E8F5F5', borderBottom: '1px solid #D4E8E8' }}
          >
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#0D7377' }}>
              {t('hospital.screens.identity.sectionLabel', '주민등록번호로 확인')}
            </span>
          </div>

          {/* Fields */}
          <div className="divide-y" style={{ borderColor: '#EBF4F4' }}>
            {/* Name */}
            <div className="flex items-center px-4 py-3.5">
              <span className="text-sm w-28 flex-shrink-0" style={{ color: '#4A6B6B' }}>
                {t('hospital.screens.identity.name', '이름')}
              </span>
              <div
                className="flex-1 px-3 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: '#F0FAFA', color: '#1A2F2F', border: '1px solid #D4E8E8' }}
              >
                홍길동
              </div>
            </div>

            {/* Birth date */}
            <div className="flex items-center px-4 py-3.5">
              <span className="text-sm w-28 flex-shrink-0" style={{ color: '#4A6B6B' }}>
                {t('hospital.screens.identity.birthDate', '생년월일')}
              </span>
              <div
                className="flex-1 px-3 py-2 rounded text-sm font-medium"
                style={{ backgroundColor: '#F0FAFA', color: '#1A2F2F', border: '1px solid #D4E8E8' }}
              >
                1988.01.01
              </div>
            </div>

            {/* ID number */}
            <div className="flex items-center px-4 py-3.5">
              <span className="text-sm w-28 flex-shrink-0" style={{ color: '#4A6B6B' }}>
                {t('hospital.screens.identity.idNumber', '주민등록번호')}
              </span>
              <div
                className="flex-1 px-3 py-2 rounded text-sm font-mono font-medium"
                style={{ backgroundColor: '#F0FAFA', color: '#1A2F2F', border: '1px solid #D4E8E8' }}
              >
                880101-1******
              </div>
            </div>
          </div>

          {/* Simulated verification status */}
          <div className="px-4 py-4 flex items-center gap-2" style={{ borderTop: '1px solid #D4E8E8' }}>
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 22, height: 22, backgroundColor: '#2ECC71' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-medium" style={{ color: '#2ECC71' }}>
              {t('hospital.screens.identity.verified', '신원 확인 완료 (시뮬레이션)')}
            </span>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={() => { feedbackTap(); onNext(); }}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#14919B', color: 'white' }}
        >
          {t('hospital.screens.identity.confirm', '확인')}
        </button>
      </div>
    </div>
  );
}
