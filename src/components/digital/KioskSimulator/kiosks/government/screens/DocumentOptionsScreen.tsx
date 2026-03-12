import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { GOVERNMENT_THEME, PURPOSES, formatPrice, type GovernmentDocument, type Purpose } from '../data';

interface Props {
  document: GovernmentDocument;
  purpose: Purpose;
  copies: number;
  onPurposeChange: (p: Purpose) => void;
  onCopiesChange: (n: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DocumentOptionsScreen({
  document: doc,
  purpose,
  copies,
  onPurposeChange,
  onCopiesChange,
  onNext,
  onBack,
}: Props) {
  const { t } = useTranslation();

  const totalFee = doc.fee * copies;

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
          {t('government.options.title', '발급 옵션')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Document name */}
        <div
          className="rounded px-4 py-3 text-center"
          style={{ backgroundColor: '#1E293B' }}
        >
          <p className="text-xs mb-1" style={{ color: 'rgba(203,213,225,0.7)' }}>
            {t('government.options.selectedDoc', '선택 서류')}
          </p>
          <p className="font-bold text-base" style={{ color: 'white' }}>
            {doc.name}
          </p>
        </div>

        {/* Purpose selection */}
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid #CBD5E1', backgroundColor: 'white' }}
        >
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}
          >
            <span className="text-xs font-semibold tracking-wide" style={{ color: GOVERNMENT_THEME.primary }}>
              {t('government.options.purposeLabel', '용도 선택')}
            </span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {PURPOSES.map((p) => (
              <button
                key={p}
                onClick={() => { feedbackTap(); onPurposeChange(p); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors"
                style={{
                  backgroundColor: purpose === p ? '#EFF6FF' : 'transparent',
                  border: purpose === p ? `1.5px solid ${GOVERNMENT_THEME.accent}` : '1.5px solid transparent',
                }}
              >
                {/* Radio circle */}
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    border: `2px solid ${purpose === p ? GOVERNMENT_THEME.accent : '#CBD5E1'}`,
                  }}
                >
                  {purpose === p && (
                    <div
                      className="rounded-full"
                      style={{ width: 10, height: 10, backgroundColor: GOVERNMENT_THEME.accent }}
                    />
                  )}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: purpose === p ? GOVERNMENT_THEME.accent : GOVERNMENT_THEME.text }}
                >
                  {p}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Copies counter */}
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid #CBD5E1', backgroundColor: 'white' }}
        >
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}
          >
            <span className="text-xs font-semibold tracking-wide" style={{ color: GOVERNMENT_THEME.primary }}>
              {t('government.options.copiesLabel', '발급 부수')}
            </span>
          </div>
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => { feedbackTap(); onCopiesChange(Math.max(1, copies - 1)); }}
              disabled={copies <= 1}
              className="flex items-center justify-center rounded transition-colors"
              style={{
                width: 40,
                height: 40,
                backgroundColor: copies <= 1 ? '#F1F5F9' : '#EFF6FF',
                border: `1.5px solid ${copies <= 1 ? '#E2E8F0' : GOVERNMENT_THEME.accent}`,
                color: copies <= 1 ? '#CBD5E1' : GOVERNMENT_THEME.accent,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-baseline gap-1">
              <span className="font-bold" style={{ fontSize: 28, color: GOVERNMENT_THEME.text }}>
                {copies}
              </span>
              <span className="text-sm" style={{ color: GOVERNMENT_THEME.textLight }}>
                {t('government.options.copiesUnit', '부')}
              </span>
            </div>
            <button
              onClick={() => { feedbackTap(); onCopiesChange(Math.min(5, copies + 1)); }}
              disabled={copies >= 5}
              className="flex items-center justify-center rounded transition-colors"
              style={{
                width: 40,
                height: 40,
                backgroundColor: copies >= 5 ? '#F1F5F9' : '#EFF6FF',
                border: `1.5px solid ${copies >= 5 ? '#E2E8F0' : GOVERNMENT_THEME.accent}`,
                color: copies >= 5 ? '#CBD5E1' : GOVERNMENT_THEME.accent,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Fee summary */}
        <div
          className="rounded px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1' }}
        >
          <span className="text-sm font-medium" style={{ color: GOVERNMENT_THEME.textLight }}>
            {t('government.options.totalFee', '총 수수료')}
          </span>
          <span className="font-bold text-lg" style={{ color: totalFee === 0 ? '#16A34A' : GOVERNMENT_THEME.accent }}>
            {totalFee === 0 ? t('government.free', '무료') : `${formatPrice(totalFee)}${t('government.won', '원')}`}
          </span>
        </div>
      </div>

      {/* Next button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid #CBD5E1' }}>
        <button
          onClick={() => { feedbackTap(); onNext(); }}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: GOVERNMENT_THEME.accent, color: 'white' }}
        >
          {t('government.options.next', '다음')}
        </button>
      </div>
    </div>
  );
}
