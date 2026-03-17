import React from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap } from '../../../core/haptics';
import { BANK_THEME, type BankService } from '../data';

interface Props {
  onSelect: (service: BankService) => void;
  onBack: () => void;
}

/* SVG icons for each service */
function QueueIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="6" y="4" width="24" height="28" rx="3" stroke={BANK_THEME.primary} strokeWidth="1.8" />
      <rect x="10" y="8" width="16" height="4" rx="1" fill={BANK_THEME.accent} opacity="0.3" />
      <line x1="10" y1="16" x2="26" y2="16" stroke={BANK_THEME.primary} strokeWidth="1.2" />
      <line x1="10" y1="20" x2="22" y2="20" stroke={BANK_THEME.primary} strokeWidth="1.2" opacity="0.5" />
      <line x1="10" y1="24" x2="18" y2="24" stroke={BANK_THEME.primary} strokeWidth="1.2" opacity="0.3" />
      <rect x="20" y="26" width="8" height="4" rx="1" fill={BANK_THEME.accent} opacity="0.4" />
    </svg>
  );
}

function DepositIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="6" y="8" width="24" height="20" rx="3" stroke={BANK_THEME.primary} strokeWidth="1.8" />
      <path d="M18 13V25" stroke={BANK_THEME.accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M13 20L18 25L23 20" stroke={BANK_THEME.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="8" x2="10" y2="6" stroke={BANK_THEME.primary} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="8" x2="26" y2="6" stroke={BANK_THEME.primary} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WithdrawIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="6" y="8" width="24" height="20" rx="3" stroke={BANK_THEME.primary} strokeWidth="1.8" />
      <path d="M18 25V13" stroke={BANK_THEME.accent} strokeWidth="2" strokeLinecap="round" />
      <path d="M13 18L18 13L23 18" stroke={BANK_THEME.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="8" x2="10" y2="6" stroke={BANK_THEME.primary} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="8" x2="26" y2="6" stroke={BANK_THEME.primary} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M8 14H28" stroke={BANK_THEME.primary} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M23 9L28 14L23 19" stroke={BANK_THEME.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 22H8" stroke={BANK_THEME.accent} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 17L8 22L13 27" stroke={BANK_THEME.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const services: { id: BankService; labelKey: string; label: string; descKey: string; desc: string; Icon: () => React.ReactNode }[] = [
  { id: 'queue',    labelKey: 'bank.service.queue',    label: '번호표 뽑기', descKey: 'bank.service.queueDesc',    desc: '대기 번호표를 발급합니다', Icon: QueueIcon },
  { id: 'deposit',  labelKey: 'bank.service.deposit',  label: '입금',       descKey: 'bank.service.depositDesc',  desc: '계좌에 입금합니다',       Icon: DepositIcon },
  { id: 'withdraw', labelKey: 'bank.service.withdraw', label: '출금',       descKey: 'bank.service.withdrawDesc', desc: '계좌에서 출금합니다',     Icon: WithdrawIcon },
  { id: 'transfer', labelKey: 'bank.service.transfer', label: '이체',       descKey: 'bank.service.transferDesc', desc: '다른 계좌로 이체합니다',   Icon: TransferIcon },
];

export default function ServiceSelectScreen({ onSelect, onBack }: Props) {
  const { t } = useTranslation();

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
          {t('bank.serviceSelect.title', '업무 선택')}
        </span>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4">
        <p className="text-sm text-center font-medium" style={{ color: BANK_THEME.textMid }}>
          {t('bank.serviceSelect.prompt', '원하시는 업무를 선택해 주세요')}
        </p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {services.map(({ id, labelKey, label, descKey, desc, Icon }) => (
            <button
              key={id}
              onClick={() => { feedbackTap(); onSelect(id); }}
              className="flex flex-col items-center justify-center gap-2 rounded-lg transition-all active:scale-[0.97]"
              style={{
                backgroundColor: 'white',
                border: `1.5px solid ${BANK_THEME.borderLight}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 56, height: 56, backgroundColor: BANK_THEME.surface }}
              >
                <Icon />
              </div>
              <span className="font-bold text-sm" style={{ color: BANK_THEME.text }}>
                {t(labelKey, label)}
              </span>
              <span className="text-xs px-2 text-center" style={{ color: BANK_THEME.textLight }}>
                {t(descKey, desc)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
