import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { GOVERNMENT_THEME, DOCUMENTS, formatPrice, type GovernmentDocument } from '../data';

interface Props {
  onSelect: (doc: GovernmentDocument) => void;
  onBack: () => void;
}

export default function DocumentSelectScreen({ onSelect, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: GOVERNMENT_THEME.bgLight }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: GOVERNMENT_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('government.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('government.documentSelect.title', '서류 선택')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {DOCUMENTS.map((doc) => (
          <button
            key={doc.id}
            onClick={() => { feedbackTap(); onSelect(doc); }}
            className="w-full rounded px-4 py-3 flex items-center gap-3 text-left transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'white', border: '1px solid #CBD5E1' }}
          >
            {/* Document icon */}
            <div
              className="flex items-center justify-center rounded flex-shrink-0"
              style={{ width: 36, height: 36, backgroundColor: '#EFF6FF' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="2" width="12" height="14" rx="1.5" stroke={GOVERNMENT_THEME.accent} strokeWidth="1.3" />
                <path d="M6 6H12" stroke={GOVERNMENT_THEME.accent} strokeWidth="1" strokeLinecap="round" />
                <path d="M6 9H12" stroke={GOVERNMENT_THEME.accent} strokeWidth="1" strokeLinecap="round" />
                <path d="M6 12H9" stroke={GOVERNMENT_THEME.accent} strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: GOVERNMENT_THEME.text }}>
                {doc.name}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: GOVERNMENT_THEME.textLight }}>
                {doc.description}
              </p>
            </div>

            {/* Fee badge */}
            <span
              className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
              style={{
                backgroundColor: doc.fee === 0 ? '#F0FDF4' : '#EFF6FF',
                color: doc.fee === 0 ? '#16A34A' : GOVERNMENT_THEME.accent,
              }}
            >
              {doc.fee === 0 ? t('government.free', '무료') : `${formatPrice(doc.fee)}${t('government.won', '원')}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
