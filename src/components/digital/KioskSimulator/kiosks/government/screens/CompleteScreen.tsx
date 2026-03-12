import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { GOVERNMENT_THEME, type GovernmentDocument } from '../data';

interface Props {
  document: GovernmentDocument;
  onDone: () => void;
}

export default function CompleteScreen({ document: doc, onDone }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: GOVERNMENT_THEME.bgLight }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: GOVERNMENT_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('government.complete.title', '발급 완료')}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-5">
        {/* Success icon with document */}
        <div className="relative">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            {/* Document */}
            <rect x="20" y="10" width="60" height="75" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Header line */}
            <rect x="30" y="20" width="40" height="3" rx="1.5" fill="#334155" />
            {/* Text lines */}
            <rect x="28" y="30" width="44" height="2" rx="1" fill="#94A3B8" />
            <rect x="28" y="36" width="38" height="2" rx="1" fill="#94A3B8" />
            <rect x="28" y="42" width="42" height="2" rx="1" fill="#94A3B8" />
            <rect x="28" y="48" width="30" height="2" rx="1" fill="#94A3B8" />
            <rect x="28" y="54" width="44" height="2" rx="1" fill="#94A3B8" />
            <rect x="28" y="60" width="36" height="2" rx="1" fill="#94A3B8" />
            {/* Official stamp */}
            <circle cx="62" cy="68" r="10" stroke="#E74C3C" strokeWidth="1.5" fill="rgba(231,76,60,0.08)" />
            <rect x="56" y="66" width="12" height="2" rx="1" fill="#E74C3C" opacity="0.6" />
            <rect x="58" y="70" width="8" height="1.5" rx="0.75" fill="#E74C3C" opacity="0.4" />
            {/* Checkmark badge */}
            <circle cx="75" cy="18" r="12" fill={GOVERNMENT_THEME.success} />
            <path d="M69 18L73 22L81 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Success text */}
        <div className="text-center">
          <p className="font-bold text-lg mb-1" style={{ color: GOVERNMENT_THEME.text }}>
            {t('government.complete.message', '서류가 발급되었습니다')}
          </p>
          <p className="text-sm font-semibold mb-3" style={{ color: GOVERNMENT_THEME.accent }}>
            {doc.name}
          </p>
          <p className="text-sm" style={{ color: GOVERNMENT_THEME.textLight }}>
            {t('government.complete.takeDoc', '서류를 가져가세요')}
          </p>
        </div>

        {/* Notice */}
        <div
          className="rounded px-4 py-3 flex items-start gap-3 w-full max-w-xs"
          style={{ backgroundColor: '#E2E8F0', border: '1px solid #CBD5E1' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="8" stroke="#334155" strokeWidth="1.5" />
            <rect x="8.25" y="7.5" width="1.5" height="5" rx="0.75" fill="#334155" />
            <rect x="8.25" y="5" width="1.5" height="1.5" rx="0.75" fill="#334155" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: GOVERNMENT_THEME.text }}>
            {t('government.complete.notice', '발급된 서류를 반드시 수령하신 후 자리를 비워주세요.')}
          </p>
        </div>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #CBD5E1' }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: GOVERNMENT_THEME.accent, color: 'white' }}
        >
          {t('government.complete.done', '완료')}
        </button>
      </div>
    </div>
  );
}
