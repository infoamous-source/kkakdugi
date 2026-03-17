export type BankScreen =
  | 'welcome'
  | 'serviceSelect'
  | 'accountVerify'
  | 'transaction'
  | 'confirmTransaction'
  | 'processing'
  | 'receipt'
  | 'complete';

export const BANK_SCREEN_ORDER: BankScreen[] = [
  'welcome', 'serviceSelect', 'accountVerify', 'transaction',
  'confirmTransaction', 'processing', 'receipt', 'complete',
];

export type BankService = 'queue' | 'deposit' | 'withdraw' | 'transfer';

export interface BankTransaction {
  service: BankService;
  amount?: number;
  targetAccount?: string;
  queueNumber?: number;
}

export const BANK_THEME = {
  headerBg:    '#1A365D',
  primary:     '#2B6CB0',
  accent:      '#3182CE',
  surface:     '#EBF4FF',
  bgCard:      '#FFFFFF',
  borderLight: '#C3DAFE',
  text:        '#1A202C',
  textMid:     '#4A5568',
  textLight:   '#A0AEC0',
  gold:        '#D69E2E',
  success:     '#38A169',
} as const;

export const SERVICE_LABELS: Record<BankService, string> = {
  queue:    '번호표 뽑기',
  deposit:  '입금',
  withdraw: '출금',
  transfer: '이체',
};

export function formatAmount(n: number): string {
  return n.toLocaleString('ko-KR');
}
