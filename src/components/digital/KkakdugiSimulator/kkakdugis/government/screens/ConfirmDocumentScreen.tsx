import { useTranslation } from 'react-i18next';
import { feedbackConfirm, feedbackTap } from '../../../core/haptics';
import { GOVERNMENT_THEME, formatPrice, type GovernmentDocument, type Purpose } from '../data';

interface Props {
  document: GovernmentDocument;
  purpose: Purpose;
  copies: number;
  onConfirm: () => void;
  onBack: () => void;
}

export default function ConfirmDocumentScreen({ document: doc, purpose, copies, onConfirm, onBack }: Props) {
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
          {t('government.confirm.title', '발급 확인')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Summary card */}
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid #CBD5E1', backgroundColor: 'white' }}
        >
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}
          >
            <span className="text-xs font-semibold tracking-wide" style={{ color: GOVERNMENT_THEME.primary }}>
              {t('government.confirm.summaryTitle', '발급 정보')}
            </span>
          </div>

          <div>
            {/* Document name */}
            <div className="flex items-center px-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span className="text-sm w-24 flex-shrink-0" style={{ color: GOVERNMENT_THEME.textLight }}>
                {t('government.confirm.docName', '서류명')}
              </span>
              <span className="text-sm font-semibold flex-1 text-right" style={{ color: GOVERNMENT_THEME.text }}>
                {doc.name}
              </span>
            </div>

            {/* Purpose */}
            <div className="flex items-center px-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span className="text-sm w-24 flex-shrink-0" style={{ color: GOVERNMENT_THEME.textLight }}>
                {t('government.confirm.purpose', '용도')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: GOVERNMENT_THEME.text }}>
                {purpose}
              </span>
            </div>

            {/* Copies */}
            <div className="flex items-center px-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span className="text-sm w-24 flex-shrink-0" style={{ color: GOVERNMENT_THEME.textLight }}>
                {t('government.confirm.copies', '부수')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: GOVERNMENT_THEME.text }}>
                {copies}{t('government.confirm.copiesUnit', '부')}
              </span>
            </div>

            {/* Unit fee */}
            <div className="flex items-center px-4 py-3.5" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span className="text-sm w-24 flex-shrink-0" style={{ color: GOVERNMENT_THEME.textLight }}>
                {t('government.confirm.unitFee', '건당 수수료')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: GOVERNMENT_THEME.text }}>
                {doc.fee === 0 ? t('government.free', '무료') : `${formatPrice(doc.fee)}${t('government.won', '원')}`}
              </span>
            </div>

            {/* Total fee */}
            <div className="flex items-center px-4 py-4">
              <span className="text-sm w-24 flex-shrink-0 font-semibold" style={{ color: GOVERNMENT_THEME.text }}>
                {t('government.confirm.totalFee', '총 수수료')}
              </span>
              <span
                className="font-bold text-lg flex-1 text-right"
                style={{ color: totalFee === 0 ? '#16A34A' : GOVERNMENT_THEME.accent }}
              >
                {totalFee === 0 ? t('government.free', '무료') : `${formatPrice(totalFee)}${t('government.won', '원')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div
          className="rounded px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: '#E2E8F0', border: '1px solid #CBD5E1' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="8" stroke="#334155" strokeWidth="1.5" />
            <rect x="8.25" y="7.5" width="1.5" height="5" rx="0.75" fill="#334155" />
            <rect x="8.25" y="5" width="1.5" height="1.5" rx="0.75" fill="#334155" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: GOVERNMENT_THEME.text }}>
            {t('government.confirm.notice', '발급 정보를 확인하신 후 확인 버튼을 눌러주세요.')}
          </p>
        </div>

        <div className="flex-1" />
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: '1px solid #CBD5E1' }}>
        <button
          onClick={() => { feedbackTap(); onBack(); }}
          className="py-4 rounded font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#E2E8F0', color: GOVERNMENT_THEME.textLight, width: '35%' }}
        >
          {t('government.confirm.cancel', '취소')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onConfirm(); }}
          className="flex-1 py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: GOVERNMENT_THEME.accent, color: 'white' }}
        >
          {t('government.confirm.confirm', '확인')}
        </button>
      </div>
    </div>
  );
}
