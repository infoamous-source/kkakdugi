import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { BANK_THEME, formatAmount, type BankService } from '../data';

interface Props {
  service: BankService;
  onNext: (amount: number, targetAccount?: string) => void;
  onBack: () => void;
}

const QUICK_AMOUNTS = [
  { value: 10000,  label: '1만' },
  { value: 30000,  label: '3만' },
  { value: 50000,  label: '5만' },
  { value: 100000, label: '10만' },
];

export default function TransactionScreen({ service, onNext, onBack }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(0);
  const [targetAccount, setTargetAccount] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const isTransfer = service === 'transfer';
  const title = service === 'deposit'
    ? t('bank.transaction.depositTitle', '입금 금액')
    : service === 'withdraw'
      ? t('bank.transaction.withdrawTitle', '출금 금액')
      : t('bank.transaction.transferTitle', '이체 정보');

  const handleQuickAmount = (val: number) => {
    feedbackTap();
    setAmount(val);
    setCustomMode(false);
    setCustomInput('');
  };

  const handleCustomDigit = (d: string) => {
    feedbackTap();
    if (customInput.length < 8) {
      const next = customInput + d;
      setCustomInput(next);
      setAmount(Number(next));
    }
  };

  const handleCustomClear = () => {
    feedbackTap();
    setCustomInput('');
    setAmount(0);
  };

  const handleAccountDigit = (d: string) => {
    feedbackTap();
    if (targetAccount.length < 14) {
      setTargetAccount(prev => prev + d);
    }
  };

  const handleAccountClear = () => {
    feedbackTap();
    setTargetAccount('');
  };

  const canProceed = amount > 0 && (!isTransfer || targetAccount.length >= 10);

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
          {title}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* Transfer: target account */}
        {isTransfer && (
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: 'white', border: `1.5px solid ${BANK_THEME.borderLight}` }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: BANK_THEME.textMid }}>
              {t('bank.transaction.targetAccount', '받는 계좌번호')}
            </p>
            <div
              className="px-3 py-2.5 rounded text-sm font-mono font-medium"
              style={{
                backgroundColor: BANK_THEME.surface,
                color: targetAccount ? BANK_THEME.text : BANK_THEME.textLight,
                border: `1px solid ${BANK_THEME.borderLight}`,
                minHeight: 36,
              }}
            >
              {targetAccount || '계좌번호를 입력하세요'}
            </div>
            {/* Mini keypad for account */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                <button
                  key={n}
                  onClick={() => handleAccountDigit(String(n))}
                  className="py-2 rounded text-sm font-bold transition-all active:scale-[0.95]"
                  style={{ backgroundColor: BANK_THEME.surface, color: BANK_THEME.text, border: `1px solid ${BANK_THEME.borderLight}` }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={handleAccountClear}
                className="py-2 rounded text-xs font-bold col-span-2 transition-all active:scale-[0.95]"
                style={{ backgroundColor: '#E2E8F0', color: BANK_THEME.textMid }}
              >
                {t('bank.transaction.clearAccount', '지우기')}
              </button>
            </div>
          </div>
        )}

        {/* Amount display */}
        <div
          className="rounded-lg px-4 py-4 flex items-center justify-between"
          style={{ backgroundColor: BANK_THEME.headerBg }}
        >
          <span className="text-sm" style={{ color: 'rgba(190,227,248,0.7)' }}>
            {t('bank.transaction.amountLabel', '금액')}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ color: amount > 0 ? '#63B3ED' : 'rgba(190,227,248,0.4)', fontSize: 24 }}>
              {amount > 0 ? formatAmount(amount) : '0'}
            </span>
            <span className="text-sm font-medium" style={{ color: 'rgba(190,227,248,0.7)' }}>
              {t('bank.won', '원')}
            </span>
          </div>
        </div>

        {/* Quick amount buttons */}
        {!customMode && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_AMOUNTS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleQuickAmount(value)}
                className="py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
                style={{
                  backgroundColor: amount === value ? BANK_THEME.primary : 'white',
                  color: amount === value ? 'white' : BANK_THEME.text,
                  border: `1.5px solid ${amount === value ? BANK_THEME.primary : BANK_THEME.borderLight}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Custom input toggle */}
        {!customMode ? (
          <button
            onClick={() => { feedbackTap(); setCustomMode(true); setAmount(0); }}
            className="py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: BANK_THEME.surface, color: BANK_THEME.primary, border: `1px dashed ${BANK_THEME.primary}` }}
          >
            {t('bank.transaction.customAmount', '직접 입력')}
          </button>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCustomDigit(String(n))}
                  className="py-3 rounded-lg font-bold text-base transition-all active:scale-[0.95]"
                  style={{ backgroundColor: 'white', color: BANK_THEME.text, border: `1px solid ${BANK_THEME.borderLight}` }}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={handleCustomClear}
                className="py-3 rounded-lg font-bold text-xs transition-all active:scale-[0.95]"
                style={{ backgroundColor: '#E2E8F0', color: BANK_THEME.textMid }}
              >
                {t('bank.transaction.clear', '지우기')}
              </button>
              <button
                onClick={() => handleCustomDigit('0')}
                className="py-3 rounded-lg font-bold text-base transition-all active:scale-[0.95]"
                style={{ backgroundColor: 'white', color: BANK_THEME.text, border: `1px solid ${BANK_THEME.borderLight}` }}
              >
                0
              </button>
              <button
                onClick={() => { feedbackTap(); setCustomMode(false); }}
                className="py-3 rounded-lg font-bold text-xs transition-all active:scale-[0.95]"
                style={{ backgroundColor: BANK_THEME.surface, color: BANK_THEME.primary }}
              >
                {t('bank.transaction.quickSelect', '빠른선택')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: `1px solid ${BANK_THEME.borderLight}` }}>
        <button
          onClick={() => { if (canProceed) onNext(amount, isTransfer ? targetAccount : undefined); }}
          className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{
            backgroundColor: canProceed ? BANK_THEME.primary : '#E2E8F0',
            color: canProceed ? 'white' : BANK_THEME.textLight,
          }}
        >
          {t('bank.transaction.next', '다음')}
        </button>
      </div>
    </div>
  );
}
