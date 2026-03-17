import { useTranslation } from 'react-i18next';
import { feedbackConfirm, feedbackTap } from '../../../core/haptics';
import { BANK_THEME, SERVICE_LABELS, formatAmount, type BankTransaction } from '../data';

interface Props {
  transaction: BankTransaction;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmTransactionScreen({ transaction, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();

  const serviceLabel = SERVICE_LABELS[transaction.service];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: BANK_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('bank.confirm.title', '거래 확인')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Notice */}
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: '#FFF5E6', border: '1px solid #F6E3B5' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="8" stroke={BANK_THEME.gold} strokeWidth="1.5" />
            <rect x="8.25" y="5" width="1.5" height="1.5" rx="0.75" fill={BANK_THEME.gold} />
            <rect x="8.25" y="7.5" width="1.5" height="5" rx="0.75" fill={BANK_THEME.gold} />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: '#7B6128' }}>
            {t('bank.confirm.notice', '아래 거래 내용을 확인하시고 확인 버튼을 눌러주세요.')}
          </p>
        </div>

        {/* Transaction detail card */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${BANK_THEME.borderLight}`, backgroundColor: 'white' }}
        >
          <div
            className="px-4 py-2.5"
            style={{ backgroundColor: BANK_THEME.surface, borderBottom: `1px solid ${BANK_THEME.borderLight}` }}
          >
            <span className="text-xs font-semibold tracking-wide" style={{ color: BANK_THEME.primary }}>
              {t('bank.confirm.details', '거래 내역')}
            </span>
          </div>

          <div>
            {/* Service type */}
            <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${BANK_THEME.surface}` }}>
              <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                {t('bank.confirm.serviceType', '거래 종류')}
              </span>
              <span className="text-sm font-medium flex-1 text-right" style={{ color: BANK_THEME.text }}>
                {serviceLabel}
              </span>
            </div>

            {/* Amount */}
            {transaction.amount != null && (
              <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${BANK_THEME.surface}` }}>
                <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                  {t('bank.confirm.amount', '금액')}
                </span>
                <span className="text-sm font-bold flex-1 text-right" style={{ color: BANK_THEME.text }}>
                  {formatAmount(transaction.amount)}{t('bank.won', '원')}
                </span>
              </div>
            )}

            {/* Target account (transfer only) */}
            {transaction.targetAccount && (
              <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${BANK_THEME.surface}` }}>
                <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                  {t('bank.confirm.targetAccount', '받는 계좌')}
                </span>
                <span className="text-sm font-medium font-mono flex-1 text-right" style={{ color: BANK_THEME.text }}>
                  {transaction.targetAccount}
                </span>
              </div>
            )}

            {/* Source account (simulated) */}
            <div className="flex items-center px-4 py-3">
              <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                {t('bank.confirm.myAccount', '내 계좌')}
              </span>
              <span className="text-sm font-medium font-mono flex-1 text-right" style={{ color: BANK_THEME.text }}>
                110-***-456789
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: `1px solid ${BANK_THEME.borderLight}` }}>
        <button
          onClick={() => { feedbackTap(); onCancel(); }}
          className="py-4 rounded-lg font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#E2E8F0', color: BANK_THEME.textMid, width: '35%' }}
        >
          {t('bank.confirm.cancel', '취소')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onConfirm(); }}
          className="flex-1 py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: BANK_THEME.primary, color: 'white' }}
        >
          {t('bank.confirm.confirm', '확인')}
        </button>
      </div>
    </div>
  );
}
