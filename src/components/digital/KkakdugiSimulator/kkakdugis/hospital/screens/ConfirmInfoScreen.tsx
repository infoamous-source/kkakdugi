import { useTranslation } from 'react-i18next';
import { feedbackConfirm } from '../../../core/haptics';
import { formatPrice, CONSULTATION_FEE, type Department, type Doctor, type VisitType } from '../data';

interface Props {
  visitType: VisitType;
  department: Department;
  doctor: Doctor;
  onNext: () => void;
  onBack: () => void;
}

interface InfoRowProps {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}

function InfoRow({ label, value, valueStyle }: InfoRowProps) {
  return (
    <div className="flex items-center px-4 py-3.5" style={{ borderBottom: '1px solid #EBF4F4' }}>
      <span className="text-sm w-24 flex-shrink-0" style={{ color: '#8BAAAA' }}>
        {label}
      </span>
      <span className="text-sm font-medium flex-1 text-right" style={{ color: '#1A2F2F', ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

export default function ConfirmInfoScreen({ visitType, department, doctor, onNext, onBack }: Props) {
  const { t } = useTranslation();

  const visitTypeLabel = visitType === 'first'
    ? t('hospital.visitType.first', '초진')
    : t('hospital.visitType.return', '재진');

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
          {t('hospital.screens.confirm.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('hospital.screens.confirm.title', '접수 정보 확인')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Info card */}
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid #D4E8E8', backgroundColor: 'white' }}
        >
          {/* Card header */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: '#0D7377' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="1" width="12" height="14" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" />
              <path d="M5 5.5H11M5 8H11M5 10.5H8.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-semibold tracking-wide" style={{ color: 'white' }}>
              {t('hospital.screens.confirm.cardTitle', '접수 내역')}
            </span>
          </div>

          {/* Rows */}
          <div>
            <InfoRow
              label={t('hospital.screens.confirm.patient', '환자명')}
              value="홍길동"
            />
            <InfoRow
              label={t('hospital.screens.confirm.visitType', '방문유형')}
              value={visitTypeLabel}
            />
            <InfoRow
              label={t('hospital.screens.confirm.department', '진료과')}
              value={department.label}
            />
            <InfoRow
              label={t('hospital.screens.confirm.doctor', '담당의사')}
              value={`${doctor.name} 선생님`}
            />
            <InfoRow
              label={t('hospital.screens.confirm.schedule', '진료시간')}
              value={doctor.schedule}
            />
            {/* Fee row — no bottom border on last */}
            <div className="flex items-center px-4 py-3.5">
              <span className="text-sm w-24 flex-shrink-0" style={{ color: '#8BAAAA' }}>
                {t('hospital.screens.confirm.fee', '진찰료')}
              </span>
              <span className="text-sm font-bold flex-1 text-right" style={{ color: '#14919B' }}>
                {formatPrice(CONSULTATION_FEE)}원
              </span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <p className="text-xs text-center" style={{ color: '#8BAAAA' }}>
          {t('hospital.screens.confirm.notice', '위 정보가 맞으면 접수하기 버튼을 눌러주세요.')}
        </p>
      </div>

      {/* Bottom buttons */}
      <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: '1px solid #D4E8E8' }}>
        <button
          onClick={onBack}
          className="py-4 rounded font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#E0EDED', color: '#4A6B6B', width: '35%' }}
        >
          {t('hospital.screens.confirm.cancel', '취소')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          className="flex-1 py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#14919B', color: 'white' }}
        >
          {t('hospital.screens.confirm.submit', '접수하기')}
        </button>
      </div>
    </div>
  );
}
