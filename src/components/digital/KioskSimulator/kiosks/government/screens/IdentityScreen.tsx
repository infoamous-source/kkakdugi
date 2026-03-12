import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { GOVERNMENT_THEME } from '../data';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function IdentityScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');

  const handleDigit = useCallback((d: string) => {
    feedbackTap();
    setDigits(prev => {
      if (prev.length >= 13) return prev;
      return prev + d;
    });
  }, []);

  const handleClear = useCallback(() => {
    feedbackTap();
    setDigits('');
  }, []);

  const handleBackspace = useCallback(() => {
    feedbackTap();
    setDigits(prev => prev.slice(0, -1));
  }, []);

  const handleConfirm = useCallback(() => {
    if (digits.length === 13) {
      feedbackConfirm();
      onNext();
    }
  }, [digits.length, onNext]);

  // Format display: ●●●●●●-●●●●●●●
  const formatDisplay = () => {
    const first = digits.slice(0, 6);
    const second = digits.slice(6);
    const firstDisplay = first.padEnd(6, '_').split('').map(c => c === '_' ? '_' : '\u25CF').join('');
    const secondDisplay = second.padEnd(7, '_').split('').map(c => c === '_' ? '_' : '\u25CF').join('');
    return `${firstDisplay}-${secondDisplay}`;
  };

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
          {t('government.identity.title', '본인 확인')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3">
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
            {t('government.identity.notice', '주민등록번호 13자리를 입력해 주세요.')}
          </p>
        </div>

        {/* ID display */}
        <div
          className="rounded px-4 py-5 text-center"
          style={{ backgroundColor: 'white', border: '1px solid #CBD5E1' }}
        >
          <p className="text-xs mb-2 font-medium" style={{ color: GOVERNMENT_THEME.textLight }}>
            {t('government.identity.idLabel', '주민등록번호')}
          </p>
          <p
            className="font-mono font-bold tracking-widest"
            style={{ fontSize: 24, color: GOVERNMENT_THEME.text, letterSpacing: '0.15em' }}
          >
            {formatDisplay()}
          </p>
        </div>

        {/* Numeric keypad */}
        <div
          className="rounded overflow-hidden flex-1 flex flex-col"
          style={{ backgroundColor: 'white', border: '1px solid #CBD5E1' }}
        >
          <div className="grid grid-cols-3 flex-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (key === 'clear') handleClear();
                  else if (key === 'back') handleBackspace();
                  else handleDigit(key);
                }}
                className="flex items-center justify-center font-bold text-lg transition-colors active:bg-slate-100"
                style={{
                  color: key === 'clear' || key === 'back' ? GOVERNMENT_THEME.textLight : GOVERNMENT_THEME.text,
                  borderRight: '1px solid #E2E8F0',
                  borderBottom: '1px solid #E2E8F0',
                  fontSize: key === 'clear' || key === 'back' ? 13 : 20,
                }}
              >
                {key === 'clear' ? t('government.identity.clear', '전체삭제') : key === 'back' ? t('government.identity.backspace', '삭제') : key}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={digits.length < 13}
          className="w-full py-4 rounded font-bold text-base transition-all active:scale-[0.97]"
          style={{
            backgroundColor: digits.length === 13 ? GOVERNMENT_THEME.accent : '#CBD5E1',
            color: digits.length === 13 ? 'white' : '#94A3B8',
          }}
        >
          {t('government.identity.confirm', '확인')}
        </button>
      </div>
    </div>
  );
}
