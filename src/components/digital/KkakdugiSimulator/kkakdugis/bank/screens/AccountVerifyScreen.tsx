import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { BANK_THEME } from '../data';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function AccountVerifyScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      feedbackTap();
      const next = pin + d;
      setPin(next);
      if (next.length === 4) {
        // Auto-accept after 4 digits
        setTimeout(() => {
          feedbackConfirm();
          onNext();
        }, 400);
      }
    }
  };

  const handleClear = () => {
    feedbackTap();
    setPin('');
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: BANK_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('bank.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('bank.accountVerify.title', '본인 확인')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Card insert illustration */}
        <div
          className="rounded-lg px-4 py-4 flex items-center gap-3"
          style={{ backgroundColor: 'white', border: `1.5px solid ${BANK_THEME.borderLight}` }}
        >
          <div
            className="flex items-center justify-center rounded flex-shrink-0"
            style={{ width: 40, height: 40, backgroundColor: BANK_THEME.surface }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="12" rx="2" stroke={BANK_THEME.primary} strokeWidth="1.5" />
              <rect x="2" y="8" width="18" height="3" fill={BANK_THEME.primary} opacity="0.2" />
              <rect x="4" y="13" width="6" height="2" rx="0.5" fill={BANK_THEME.primary} opacity="0.4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: BANK_THEME.text }}>
              {t('bank.accountVerify.cardInserted', '카드가 삽입되었습니다')}
            </p>
            <p className="text-xs" style={{ color: BANK_THEME.textLight }}>
              {t('bank.accountVerify.enterPin', '비밀번호 4자리를 입력하세요')}
            </p>
          </div>
        </div>

        {/* PIN display */}
        <div className="flex justify-center gap-4 py-4">
          {dots.map((filled, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg transition-all"
              style={{
                width: 48,
                height: 56,
                backgroundColor: filled ? BANK_THEME.primary : 'white',
                border: `2px solid ${filled ? BANK_THEME.primary : BANK_THEME.borderLight}`,
              }}
            >
              {filled && (
                <div className="rounded-full" style={{ width: 14, height: 14, backgroundColor: 'white' }} />
              )}
            </div>
          ))}
        </div>

        {/* Keypad */}
        <div className="flex-1 flex flex-col gap-2">
          {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, ri) => (
            <div key={ri} className="flex gap-2 flex-1">
              {row.map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigit(String(num))}
                  className="flex-1 rounded-lg font-bold text-xl transition-all active:scale-[0.95]"
                  style={{
                    backgroundColor: 'white',
                    color: BANK_THEME.text,
                    border: `1px solid ${BANK_THEME.borderLight}`,
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          ))}
          <div className="flex gap-2 flex-1">
            <button
              onClick={handleClear}
              className="flex-1 rounded-lg font-bold text-sm transition-all active:scale-[0.95]"
              style={{
                backgroundColor: '#E2E8F0',
                color: BANK_THEME.textMid,
                border: `1px solid ${BANK_THEME.borderLight}`,
              }}
            >
              {t('bank.accountVerify.clear', '지우기')}
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="flex-1 rounded-lg font-bold text-xl transition-all active:scale-[0.95]"
              style={{
                backgroundColor: 'white',
                color: BANK_THEME.text,
                border: `1px solid ${BANK_THEME.borderLight}`,
              }}
            >
              0
            </button>
            <button
              onClick={() => { if (pin.length === 4) { feedbackConfirm(); onNext(); } }}
              className="flex-1 rounded-lg font-bold text-sm transition-all active:scale-[0.95]"
              style={{
                backgroundColor: pin.length === 4 ? BANK_THEME.primary : '#E2E8F0',
                color: pin.length === 4 ? 'white' : BANK_THEME.textLight,
                border: `1px solid ${pin.length === 4 ? BANK_THEME.primary : BANK_THEME.borderLight}`,
              }}
            >
              {t('bank.accountVerify.confirm', '확인')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
