import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';

interface Props {
  onNext: (type: 'first' | 'return') => void;
  onBack: () => void;
}

export default function VisitTypeScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F0FAFA' }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#0D7377' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: '#8BDBDB' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('kiosk.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          {t('hospital.name', '종합병원')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Title */}
      <div className="px-6 pt-8 pb-5 text-center">
        <h2
          className="font-bold mb-2"
          style={{ color: '#1A2F2F', fontSize: 20, letterSpacing: '0.02em' }}
        >
          {t('hospital.visitType.title', '방문 유형을 선택해 주세요')}
        </h2>
        <p style={{ color: '#4A6B6B', fontSize: 13 }}>
          {t('hospital.visitType.subtitle', '처음 오시는 분은 초진을 선택해 주세요')}
        </p>
      </div>

      {/* Two option buttons */}
      <div className="flex-1 flex gap-4 px-5 pb-8">
        {/* 초진 – First Visit */}
        <button
          onClick={() => { feedbackTap(); onNext('first'); }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg transition-all active:scale-[0.97] border-2"
          style={{
            borderColor: '#14919B',
            backgroundColor: 'white',
            minHeight: 200,
          }}
        >
          {/* Clipboard + plus icon */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#F0FAFA', border: '2px solid #D4E8E8' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* Clipboard body */}
              <rect x="8" y="8" width="22" height="28" rx="3" fill="#E8F5F5" stroke="#14919B" strokeWidth="1.5" />
              {/* Clipboard clip */}
              <rect x="14" y="5" width="10" height="6" rx="2" fill="#14919B" />
              {/* Plus sign */}
              <path d="M19 18 L19 26" stroke="#14919B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M15 22 L23 22" stroke="#14919B" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="font-bold mb-1"
              style={{ color: '#1A2F2F', fontSize: 18, letterSpacing: '0.02em' }}
            >
              {t('hospital.visitType.first', '초진')}
            </p>
            <p style={{ color: '#14919B', fontSize: 12, fontWeight: 600 }}>FIRST VISIT</p>
            <p
              className="mt-2 text-xs px-3"
              style={{ color: '#4A6B6B', lineHeight: 1.5 }}
            >
              {t('hospital.visitType.firstSub', '처음 방문하시는 분')}
            </p>
          </div>
        </button>

        {/* 재진 – Return Visit */}
        <button
          onClick={() => { feedbackTap(); onNext('return'); }}
          className="flex-1 flex flex-col items-center justify-center gap-4 rounded-lg transition-all active:scale-[0.97] border-2"
          style={{
            borderColor: '#D4E8E8',
            backgroundColor: 'white',
            minHeight: 200,
          }}
        >
          {/* Clipboard + checkmark icon */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 72, height: 72, backgroundColor: '#F0FAFA', border: '2px solid #D4E8E8' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              {/* Clipboard body */}
              <rect x="8" y="8" width="22" height="28" rx="3" fill="#E8F5F5" stroke="#8BAAAA" strokeWidth="1.5" />
              {/* Clipboard clip */}
              <rect x="14" y="5" width="10" height="6" rx="2" fill="#8BAAAA" />
              {/* Checkmark */}
              <path d="M14 22 L17.5 25.5 L24 18" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="text-center">
            <p
              className="font-bold mb-1"
              style={{ color: '#1A2F2F', fontSize: 18, letterSpacing: '0.02em' }}
            >
              {t('hospital.visitType.return', '재진')}
            </p>
            <p style={{ color: '#8BAAAA', fontSize: 12, fontWeight: 600 }}>RETURN VISIT</p>
            <p
              className="mt-2 text-xs px-3"
              style={{ color: '#4A6B6B', lineHeight: 1.5 }}
            >
              {t('hospital.visitType.returnSub', '이전에 방문한 적이 있는 분')}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
