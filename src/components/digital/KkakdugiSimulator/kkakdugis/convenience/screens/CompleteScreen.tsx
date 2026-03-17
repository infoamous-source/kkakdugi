import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { CONVENIENCE_THEME, formatPrice } from '../data';

interface Props {
  total: number;
  onDone: () => void;
}

export default function CompleteScreen({ total, onDone }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          {t('kkakdugi.convenience.complete.header', '계산 완료')}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Green checkmark */}
        <div
          className="mb-6 flex items-center justify-center rounded-full"
          style={{ width: 90, height: 90, backgroundColor: CONVENIENCE_THEME.surface, border: `3px solid ${CONVENIENCE_THEME.accent}` }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path
              d="M10 22 L18 30 L34 14"
              stroke={CONVENIENCE_THEME.success}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2
          className="font-bold text-center mb-2"
          style={{ color: CONVENIENCE_THEME.text, fontSize: 20 }}
        >
          {t('kkakdugi.convenience.complete.title', '계산이 완료되었습니다')}
        </h2>

        <p
          className="text-center mb-6"
          style={{ color: CONVENIENCE_THEME.textLight, fontSize: 14 }}
        >
          {t('kkakdugi.convenience.complete.message', '상품을 가져가세요')}
        </p>

        {/* Total amount box */}
        <div
          className="rounded-lg px-8 py-4 mb-8"
          style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
        >
          <p className="text-center text-xs mb-1" style={{ color: 'rgba(167,243,208,0.7)' }}>
            {t('kkakdugi.convenience.complete.paid', '결제 금액')}
          </p>
          <p
            className="text-center font-bold"
            style={{ color: 'white', fontSize: 28, fontFamily: 'monospace' }}
          >
            {formatPrice(total)}{t('kkakdugi.currency', '원')}
          </p>
        </div>

        {/* Thank you */}
        <p className="text-center text-sm" style={{ color: CONVENIENCE_THEME.textLight }}>
          {t('kkakdugi.convenience.complete.thanks', '감사합니다. 안녕히 가세요.')}
        </p>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: `2px solid ${CONVENIENCE_THEME.border}` }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: CONVENIENCE_THEME.headerBg, color: 'white' }}
        >
          {t('kkakdugi.convenience.complete.done', '연습 끝내기')}
        </button>
      </div>
    </div>
  );
}
