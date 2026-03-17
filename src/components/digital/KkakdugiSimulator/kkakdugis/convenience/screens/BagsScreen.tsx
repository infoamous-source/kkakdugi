import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { CONVENIENCE_THEME, BAG_OPTIONS, type BagOption, formatPrice } from '../data';

interface Props {
  selectedBag: BagOption | null;
  onSelectBag: (bag: BagOption) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BagsScreen({ selectedBag, onSelectBag, onNext, onBack }: Props) {
  const { t } = useTranslation();

  // Bag SVG icons
  const BagIcon = ({ optionId }: { optionId: string }) => {
    if (optionId === 'none') {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* No bag - X mark */}
          <circle cx="20" cy="20" r="16" fill={CONVENIENCE_THEME.surface} stroke={CONVENIENCE_THEME.border} strokeWidth="1.5" />
          <path d="M14 14 L26 26 M26 14 L14 26" stroke={CONVENIENCE_THEME.textLight} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (optionId === 'small') {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          {/* Small bag */}
          <path d="M10 14 L14 36 L26 36 L30 14 Z" fill={CONVENIENCE_THEME.surface} stroke={CONVENIENCE_THEME.primary} strokeWidth="1.5" />
          <path d="M14 14 Q14 6 20 6 Q26 6 26 14" fill="none" stroke={CONVENIENCE_THEME.primary} strokeWidth="1.5" />
        </svg>
      );
    }
    // large
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        {/* Large bag */}
        <path d="M7 12 L11 38 L29 38 L33 12 Z" fill={CONVENIENCE_THEME.surface} stroke={CONVENIENCE_THEME.primary} strokeWidth="1.5" />
        <path d="M13 12 Q13 4 20 4 Q27 4 27 12" fill="none" stroke={CONVENIENCE_THEME.primary} strokeWidth="1.5" />
        <rect x="15" y="20" width="10" height="6" rx="1" fill={CONVENIENCE_THEME.border} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <button
          onClick={() => { feedbackTap(); onBack(); }}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: CONVENIENCE_THEME.border, border: '1px solid rgba(167,243,208,0.4)' }}
        >
          {t('kkakdugi.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-wider" style={{ color: 'white' }}>
          {t('kkakdugi.convenience.bags.header', '봉투 선택')}
        </span>
        <div style={{ width: 50 }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <h2
          className="font-bold text-center mb-8"
          style={{ color: CONVENIENCE_THEME.text, fontSize: 18 }}
        >
          {t('kkakdugi.convenience.bags.title', '봉투가 필요하신가요?')}
        </h2>

        <div className="w-full space-y-3">
          {BAG_OPTIONS.map((bag) => {
            const isSelected = selectedBag?.id === bag.id;
            return (
              <button
                key={bag.id}
                onClick={() => { feedbackTap(); onSelectBag(bag); }}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: isSelected ? CONVENIENCE_THEME.surface : 'white',
                  border: `2px solid ${isSelected ? CONVENIENCE_THEME.primary : CONVENIENCE_THEME.border}`,
                }}
              >
                {/* Radio circle */}
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    border: `2px solid ${isSelected ? CONVENIENCE_THEME.primary : CONVENIENCE_THEME.border}`,
                  }}
                >
                  {isSelected && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CONVENIENCE_THEME.primary }}
                    />
                  )}
                </div>
                {/* Icon */}
                <BagIcon optionId={bag.id} />
                {/* Label */}
                <div className="flex-1 text-left">
                  <p className="font-bold text-sm" style={{ color: CONVENIENCE_THEME.text }}>
                    {bag.name}
                  </p>
                </div>
                {/* Price */}
                <span
                  className="font-bold text-sm flex-shrink-0"
                  style={{ color: bag.price > 0 ? CONVENIENCE_THEME.primary : CONVENIENCE_THEME.textLight }}
                >
                  {bag.price > 0 ? `${formatPrice(bag.price)}${t('kkakdugi.currency', '원')}` : t('kkakdugi.convenience.bags.free', '0원')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ borderTop: `2px solid ${CONVENIENCE_THEME.border}` }}
      >
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          disabled={!selectedBag}
          className="w-full py-3.5 rounded font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: selectedBag ? CONVENIENCE_THEME.primary : '#D1D5DB',
            color: 'white',
            opacity: selectedBag ? 1 : 0.6,
          }}
        >
          {t('kkakdugi.nav.next', '다음')}
        </button>
      </div>
    </div>
  );
}
