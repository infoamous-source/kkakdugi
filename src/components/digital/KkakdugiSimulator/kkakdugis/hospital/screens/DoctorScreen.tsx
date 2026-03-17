import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { doctors, type Doctor, type Department } from '../data';

interface Props {
  department: Department;
  onSelect: (doctor: Doctor) => void;
  onBack: () => void;
}

export default function DoctorScreen({ department, onSelect, onBack }: Props) {
  const { t } = useTranslation();

  const deptDoctors = doctors.filter((d) => d.departmentId === department.id);

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
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <div className="text-center">
          <span className="font-bold text-sm block" style={{ color: 'white' }}>
            {t('hospital.doctor.title', '의사 선택')}
          </span>
          <span className="text-xs" style={{ color: 'rgba(178,236,232,0.8)' }}>
            {t(department.nameKey, department.label)}
          </span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Department label */}
      <div
        className="mx-4 mt-4 mb-3 px-4 py-2.5 rounded-lg flex items-center gap-2"
        style={{ backgroundColor: `${department.color}14`, border: `1px solid ${department.color}30` }}
      >
        <div
          className="rounded-full flex-shrink-0"
          style={{ width: 10, height: 10, backgroundColor: department.color }}
        />
        <span style={{ color: '#1A2F2F', fontSize: 13, fontWeight: 600 }}>
          {t('hospital.doctor.selected', '선택하신 진료과')}{' '}
          <span style={{ color: department.color }}>
            {t(department.nameKey, department.label)}
          </span>
        </span>
      </div>

      {/* Doctor list */}
      <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-3">
        {deptDoctors.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p style={{ color: '#8BAAAA', fontSize: 14 }}>
              {t('hospital.doctor.none', '등록된 의사가 없습니다')}
            </p>
          </div>
        ) : (
          deptDoctors.map((doctor) => (
            <button
              key={doctor.id}
              disabled={!doctor.available}
              onClick={() => {
                if (doctor.available) {
                  feedbackTap();
                  onSelect(doctor);
                }
              }}
              className="w-full text-left rounded-xl transition-all active:scale-[0.98] flex items-stretch overflow-hidden"
              style={{
                backgroundColor: doctor.available ? 'white' : '#F5F5F5',
                border: `1.5px solid ${doctor.available ? '#D4E8E8' : '#E0E0E0'}`,
                cursor: doctor.available ? 'pointer' : 'not-allowed',
              }}
            >
              {/* Left accent bar */}
              <div
                style={{
                  width: 4,
                  backgroundColor: doctor.available ? '#14919B' : '#BDBDBD',
                  flexShrink: 0,
                }}
              />

              {/* Content */}
              <div className="flex-1 px-4 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p
                      className="font-bold mb-0.5"
                      style={{
                        color: doctor.available ? '#1A2F2F' : '#9E9E9E',
                        fontSize: 15,
                      }}
                    >
                      {doctor.name}
                      {doctor.available ? (
                        <span
                          className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: '#E8F8EE', color: '#27AE60' }}
                        >
                          {t('hospital.doctor.available', '진료 가능')}
                        </span>
                      ) : null}
                    </p>
                    <p style={{ color: doctor.available ? '#4A6B6B' : '#BDBDBD', fontSize: 12 }}>
                      {doctor.specialty}
                    </p>
                  </div>

                  {/* Unavailable badge */}
                  {!doctor.available && (
                    <span
                      className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: '#FFEBEE', color: '#E53935' }}
                    >
                      {t('hospital.doctor.closed', '휴진')}
                    </span>
                  )}
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-1.5 mt-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle
                      cx="6" cy="6" r="5"
                      stroke={doctor.available ? '#8BAAAA' : '#BDBDBD'}
                      strokeWidth="1.2"
                    />
                    <path
                      d="M6 3.5 L6 6.5 L8 8"
                      stroke={doctor.available ? '#8BAAAA' : '#BDBDBD'}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ color: doctor.available ? '#8BAAAA' : '#BDBDBD', fontSize: 11 }}>
                    {doctor.schedule}
                  </span>
                </div>
              </div>

              {/* Chevron for available */}
              {doctor.available && (
                <div className="flex items-center pr-4" style={{ color: '#8BAAAA' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
