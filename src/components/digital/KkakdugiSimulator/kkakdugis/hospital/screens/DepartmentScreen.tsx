import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { departments, type Department } from '../data';

interface Props {
  onSelect: (dept: Department) => void;
  onBack: () => void;
}

// Simple inline SVG icons per department type
function DepartmentIcon({ icon, color }: { icon: string; color: string }) {
  switch (icon) {
    case 'heart':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 23 C14 23 4 16 4 9.5 C4 6.5 6.5 4 9.5 4 C11.5 4 13.2 5 14 6.5 C14.8 5 16.5 4 18.5 4 C21.5 4 24 6.5 24 9.5 C24 16 14 23 14 23Z"
            fill={color}
            opacity="0.85"
          />
        </svg>
      );
    case 'bone':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="7" cy="7" r="4" fill={color} opacity="0.85" />
          <circle cx="21" cy="21" r="4" fill={color} opacity="0.85" />
          <path d="M10 10 L18 18" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.85" />
          <circle cx="21" cy="7" r="4" fill={color} opacity="0.6" />
          <circle cx="7" cy="21" r="4" fill={color} opacity="0.6" />
          <path d="M18 10 L10 18" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case 'skin':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" fill={color} opacity="0.85" />
          <path d="M10 12 Q14 9 18 12 Q21 15 18 19 Q14 22 10 19 Q7 16 10 12Z" fill="white" opacity="0.3" />
        </svg>
      );
    case 'ear':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 4 C9 4 6 8 6 13 C6 18 9 20 11 20 C11 20 11 24 14 24 C17 24 18 22 18 20 C20 20 22 18 22 13 C22 8 19 4 14 4Z"
            fill={color}
            opacity="0.85"
          />
          <path d="M12 13 Q14 10 16 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        </svg>
      );
    case 'eye':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 14 Q14 6 24 14 Q14 22 4 14Z" fill={color} opacity="0.85" />
          <circle cx="14" cy="14" r="4" fill="white" opacity="0.9" />
          <circle cx="14" cy="14" r="2.5" fill={color} />
          <circle cx="15" cy="13" r="1" fill="white" opacity="0.7" />
        </svg>
      );
    case 'tooth':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M9 5 C6 5 5 8 5 10 C5 13 6 14 7 15 C8 18 8 23 10 23 C12 23 12 19 14 19 C16 19 16 23 18 23 C20 23 20 18 21 15 C22 14 23 13 23 10 C23 8 22 5 19 5 C17 5 16 6.5 14 6.5 C12 6.5 11 5 9 5Z"
            fill={color}
            opacity="0.85"
          />
        </svg>
      );
    case 'baby':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          {/* Body (pregnant) */}
          <ellipse cx="14" cy="17" rx="7" ry="8" fill={color} opacity="0.85" />
          {/* Head */}
          <circle cx="14" cy="7" r="4" fill={color} opacity="0.85" />
          {/* Baby inside */}
          <circle cx="14" cy="18" r="3" fill="white" opacity="0.35" />
        </svg>
      );
    case 'child':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          {/* Head */}
          <circle cx="14" cy="7" r="4" fill={color} opacity="0.85" />
          {/* Body */}
          <path d="M10 12 Q14 11 18 12 L19 20 L14 21 L9 20 Z" fill={color} opacity="0.85" />
          {/* Arms */}
          <path d="M10 13 L6 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <path d="M18 13 L22 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          {/* Legs */}
          <path d="M11 20 L10 25" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <path d="M17 20 L18 25" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        </svg>
      );
    case 'brain':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 5 C10 5 7 7 7 10 C5 10 4 12 5 14 C4 15 4 17 6 18 C6 20 8 22 10 22 L14 22 L18 22 C20 22 22 20 22 18 C24 17 24 15 23 14 C24 12 23 10 21 10 C21 7 18 5 14 5Z"
            fill={color}
            opacity="0.85"
          />
          <path d="M14 8 L14 20" stroke="white" strokeWidth="1" opacity="0.3" />
          <path d="M10 12 Q12 10 14 12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M14 12 Q16 10 18 12" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
        </svg>
      );
    case 'kidney':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M10 5 C7 5 5 8 5 12 C5 18 8 23 11 23 C13 23 14 21 14 19 C14 21 15 23 17 23 C20 23 23 18 23 12 C23 8 21 5 18 5 C16 5 15 7 14 9 C13 7 12 5 10 5Z"
            fill={color}
            opacity="0.85"
          />
        </svg>
      );
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="10" fill={color} opacity="0.85" />
        </svg>
      );
  }
}

export default function DepartmentScreen({ onSelect, onBack }: Props) {
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
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm" style={{ color: 'white' }}>
          {t('hospital.dept.title', '진료과 선택')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Subtitle */}
      <div className="px-5 pt-5 pb-3">
        <p style={{ color: '#4A6B6B', fontSize: 13 }}>
          {t('hospital.dept.subtitle', '진료받으실 과를 선택해 주세요')}
        </p>
      </div>

      {/* Department grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-5">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}
        >
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => { feedbackTap(); onSelect(dept); }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl transition-all active:scale-[0.97]"
              style={{
                backgroundColor: 'white',
                border: '1.5px solid #D4E8E8',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              {/* Colored circle with icon */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 54,
                  height: 54,
                  backgroundColor: `${dept.color}18`,
                  border: `1.5px solid ${dept.color}40`,
                }}
              >
                <DepartmentIcon icon={dept.icon} color={dept.color} />
              </div>

              <span
                className="font-bold text-center leading-tight"
                style={{ color: '#1A2F2F', fontSize: 13 }}
              >
                {t(dept.nameKey, dept.label)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
