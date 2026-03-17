import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { formatPrice, CONSULTATION_FEE, type Department, type Doctor } from '../data';

interface Props {
  waitingNumber: number;
  department: Department;
  doctor: Doctor;
  onDone: () => void;
}

export default function CompleteScreen({ waitingNumber, department, doctor, onDone }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F0FAFA' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: '#0D7377' }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('hospital.screens.complete.title', '접수 완료')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Waiting number display */}
        <div className="flex flex-col items-center">
          <p className="text-xs mb-2" style={{ color: '#8BAAAA' }}>
            {t('hospital.screens.complete.registered', '접수가 완료되었습니다')}
          </p>
          <div
            className="flex flex-col items-center px-10 py-5 rounded-lg"
            style={{ backgroundColor: '#1A2F2F' }}
          >
            <span
              className="text-xs font-medium tracking-widest mb-1"
              style={{ color: 'rgba(212,232,232,0.55)', letterSpacing: '0.18em' }}
            >
              {t('hospital.screens.complete.waitingLabel', '대기번호')}
            </span>
            <span
              style={{
                color: '#2ECC71',
                fontSize: 52,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.12em',
                lineHeight: 1.1,
              }}
            >
              {String(waitingNumber).padStart(3, '0')}
            </span>
          </div>
          <p className="text-xs mt-3 text-center font-medium" style={{ color: '#4A6B6B' }}>
            {t('hospital.screens.complete.callNotice', '대기 순서가 되면 이름이 호출됩니다')}
          </p>
        </div>

        {/* Info summary card */}
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid #D4E8E8', backgroundColor: 'white' }}
        >
          {/* Card header */}
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: '#E8F5F5', borderBottom: '1px solid #D4E8E8' }}
          >
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#0D7377' }}>
              {t('hospital.screens.complete.summaryTitle', '접수 정보')}
            </span>
          </div>

          {/* Rows */}
          <div>
            {/* Department */}
            <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #EBF4F4' }}>
              <span className="text-sm w-20 flex-shrink-0" style={{ color: '#8BAAAA' }}>
                {t('hospital.screens.complete.department', '진료과')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: '#1A2F2F' }}>
                {department.label}
              </span>
            </div>

            {/* Doctor */}
            <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #EBF4F4' }}>
              <span className="text-sm w-20 flex-shrink-0" style={{ color: '#8BAAAA' }}>
                {t('hospital.screens.complete.doctor', '담당의사')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: '#1A2F2F' }}>
                {doctor.name} 선생님
              </span>
            </div>

            {/* Schedule */}
            <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #EBF4F4' }}>
              <span className="text-sm w-20 flex-shrink-0" style={{ color: '#8BAAAA' }}>
                {t('hospital.screens.complete.schedule', '진료시간')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: '#1A2F2F' }}>
                {doctor.schedule}
              </span>
            </div>

            {/* Fee */}
            <div className="flex items-center px-4 py-3">
              <span className="text-sm w-20 flex-shrink-0" style={{ color: '#8BAAAA' }}>
                {t('hospital.screens.complete.fee', '진찰료')}
              </span>
              <div className="flex-1 flex items-center justify-end gap-2">
                <span className="text-sm font-bold" style={{ color: '#1A2F2F' }}>
                  {formatPrice(CONSULTATION_FEE)}원
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: '#D4F4E4', color: '#1A8A4A' }}
                >
                  {t('hospital.screens.complete.paid', '결제완료')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info desk notice */}
        <div
          className="rounded px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: '#D4E8E8', border: '1px solid #B0D4D4' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="2" y="6" width="14" height="9" rx="2" stroke="#0D7377" strokeWidth="1.2" />
            <path d="M5.5 6V4.5C5.5 3.12 7.07 2 9 2C10.93 2 12.5 3.12 12.5 4.5V6" stroke="#0D7377" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="9" cy="10.5" r="1.2" fill="#0D7377" />
          </svg>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#1A2F2F' }}>
              {t('hospital.screens.complete.deskTitle', '안내데스크')}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#4A6B6B' }}>
              {t('hospital.screens.complete.deskNotice', '궁금한 사항은 안내데스크에 문의하세요.')}
            </p>
          </div>
        </div>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #D4E8E8' }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: '#14919B', color: 'white' }}
        >
          {t('hospital.screens.complete.done', '완료')}
        </button>
      </div>
    </div>
  );
}
