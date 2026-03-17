import { useTranslation } from 'react-i18next';
import { feedbackSuccess } from '../../../core/haptics';
import { BANK_THEME, SERVICE_LABELS, formatAmount, type BankTransaction } from '../data';

interface Props {
  transaction: BankTransaction;
  onDone: () => void;
}

export default function CompleteScreen({ transaction, onDone }: Props) {
  const { t } = useTranslation();
  const isQueue = transaction.service === 'queue';

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#EBF4FF' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0 text-center"
        style={{ backgroundColor: BANK_THEME.headerBg }}
      >
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {isQueue
            ? t('bank.complete.queueTitle', '번호표 발급 완료')
            : t('bank.complete.title', '거래 완료')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Success icon */}
        <div className="flex flex-col items-center">
          <div
            className="flex items-center justify-center rounded-full mb-3"
            style={{ width: 56, height: 56, backgroundColor: BANK_THEME.success }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14L11.5 19.5L22 8.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: BANK_THEME.textMid }}>
            {isQueue
              ? t('bank.complete.queueIssued', '번호표가 발급되었습니다')
              : t('bank.complete.done', '거래가 완료되었습니다')}
          </p>
        </div>

        {/* Queue number display */}
        {isQueue && transaction.queueNumber != null && (
          <div className="flex flex-col items-center">
            <div
              className="flex flex-col items-center px-10 py-5 rounded-lg"
              style={{ backgroundColor: BANK_THEME.headerBg }}
            >
              <span
                className="text-xs font-medium tracking-widest mb-1"
                style={{ color: 'rgba(190,227,248,0.55)', letterSpacing: '0.18em' }}
              >
                {t('bank.complete.queueLabel', '대기번호')}
              </span>
              <span
                style={{
                  color: '#63B3ED',
                  fontSize: 52,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  lineHeight: 1.1,
                }}
              >
                {transaction.queueNumber}
              </span>
            </div>
            <p className="text-sm mt-4 font-bold" style={{ color: BANK_THEME.primary }}>
              {t('bank.complete.goToCounter', '창구 3번으로 가세요')}
            </p>
          </div>
        )}

        {/* Transaction summary (non-queue) */}
        {!isQueue && (
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${BANK_THEME.borderLight}`, backgroundColor: 'white' }}
          >
            <div
              className="px-4 py-2.5"
              style={{ backgroundColor: BANK_THEME.surface, borderBottom: `1px solid ${BANK_THEME.borderLight}` }}
            >
              <span className="text-xs font-semibold tracking-wide" style={{ color: BANK_THEME.primary }}>
                {t('bank.complete.summary', '거래 내역')}
              </span>
            </div>

            <div>
              {/* Service type */}
              <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${BANK_THEME.surface}` }}>
                <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                  {t('bank.complete.serviceType', '거래 종류')}
                </span>
                <span className="text-sm font-medium flex-1 text-right" style={{ color: BANK_THEME.text }}>
                  {SERVICE_LABELS[transaction.service]}
                </span>
              </div>

              {/* Amount */}
              {transaction.amount != null && (
                <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${BANK_THEME.surface}` }}>
                  <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                    {t('bank.complete.amount', '금액')}
                  </span>
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <span className="text-sm font-bold" style={{ color: BANK_THEME.text }}>
                      {formatAmount(transaction.amount)}{t('bank.won', '원')}
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#C6F6D5', color: '#276749' }}
                    >
                      {t('bank.complete.completed', '완료')}
                    </span>
                  </div>
                </div>
              )}

              {/* Target account */}
              {transaction.targetAccount && (
                <div className="flex items-center px-4 py-3" style={{ borderBottom: `1px solid ${BANK_THEME.surface}` }}>
                  <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                    {t('bank.complete.targetAccount', '받는 계좌')}
                  </span>
                  <span className="text-sm font-medium font-mono flex-1 text-right" style={{ color: BANK_THEME.text }}>
                    {transaction.targetAccount}
                  </span>
                </div>
              )}

              {/* My account */}
              <div className="flex items-center px-4 py-3">
                <span className="text-sm w-24 flex-shrink-0" style={{ color: BANK_THEME.textLight }}>
                  {t('bank.complete.myAccount', '내 계좌')}
                </span>
                <span className="text-sm font-medium font-mono flex-1 text-right" style={{ color: BANK_THEME.text }}>
                  110-***-456789
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notice */}
        <div
          className="rounded-lg px-4 py-3 flex items-start gap-3"
          style={{ backgroundColor: BANK_THEME.surface, border: `1px solid ${BANK_THEME.borderLight}` }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="8" stroke={BANK_THEME.primary} strokeWidth="1.5" />
            <rect x="8.25" y="5" width="1.5" height="1.5" rx="0.75" fill={BANK_THEME.primary} />
            <rect x="8.25" y="7.5" width="1.5" height="5" rx="0.75" fill={BANK_THEME.primary} />
          </svg>
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: BANK_THEME.text }}>
              {t('bank.complete.noticeTitle', '안내')}
            </p>
            <p className="text-xs leading-relaxed" style={{ color: BANK_THEME.textMid }}>
              {isQueue
                ? t('bank.complete.queueNotice', '번호가 호출되면 해당 창구로 이동해 주세요.')
                : t('bank.complete.transactionNotice', '카드를 꺼내 주세요. 감사합니다.')}
            </p>
          </div>
        </div>
      </div>

      {/* Done button */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: `1px solid ${BANK_THEME.borderLight}` }}>
        <button
          onClick={() => { feedbackSuccess(); onDone(); }}
          className="w-full py-4 rounded-lg font-bold text-base transition-all active:scale-[0.97]"
          style={{ backgroundColor: BANK_THEME.primary, color: 'white' }}
        >
          {t('bank.complete.finish', '완료')}
        </button>
      </div>
    </div>
  );
}
