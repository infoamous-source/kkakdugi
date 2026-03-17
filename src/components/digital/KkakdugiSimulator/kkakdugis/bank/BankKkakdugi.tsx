import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KioskComponentProps } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type BankScreen,
  type BankService,
  type BankTransaction,
  BANK_SCREEN_ORDER,
  BANK_THEME,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import ServiceSelectScreen from './screens/ServiceSelectScreen';
import AccountVerifyScreen from './screens/AccountVerifyScreen';
import TransactionScreen from './screens/TransactionScreen';
import ConfirmTransactionScreen from './screens/ConfirmTransactionScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import ReceiptScreen from './screens/ReceiptScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function BankKiosk({ onClose, onComplete }: KioskComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<BankScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setScreen = useCallback((next: BankScreen) => {
    setScreenFade(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    fadeTimeout.current = setTimeout(() => {
      setScreenRaw(next);
      setShowHelper(true);
      playTouchSound();
      setScreenFade(false);
    }, 120);
  }, []);

  // ── Service state ──────────────────────────────────────────────────────────
  const [service, setService] = useState<BankService | null>(null);
  const [transaction, setTransaction] = useState<BankTransaction>({ service: 'queue' });

  // ── Helper bubble ──────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  // Cleanup
  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // ── Screen flow indices ─────────────────────────────────────────────────────
  const currentStepIndex = BANK_SCREEN_ORDER.indexOf(screen);
  const totalSteps = BANK_SCREEN_ORDER.length;

  // ── Helper messages ─────────────────────────────────────────────────────────
  const helperMessages: Record<BankScreen, string> = useMemo(() => ({
    welcome:            t('kiosk.helper.bank.welcome',            '화면을 터치하여 시작하세요'),
    serviceSelect:      t('kiosk.helper.bank.serviceSelect',      '원하시는 업무를 선택하세요'),
    accountVerify:      t('kiosk.helper.bank.accountVerify',      '비밀번호 4자리를 입력하세요'),
    transaction:        t('kiosk.helper.bank.transaction',        '금액을 입력하세요'),
    confirmTransaction: t('kiosk.helper.bank.confirmTransaction', '거래 내용을 확인하세요'),
    processing:         t('kiosk.helper.bank.processing',         '거래를 처리하고 있습니다'),
    receipt:            t('kiosk.helper.bank.receipt',             '영수증 출력 여부를 선택하세요'),
    complete:           t('kiosk.helper.bank.complete',            '거래가 완료되었습니다'),
  }), [t]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleHome = useCallback(() => {
    setService(null);
    setTransaction({ service: 'queue' });
    setScreen('welcome');
  }, [setScreen]);

  const handleSelectService = useCallback((s: BankService) => {
    setService(s);
    setTransaction({ service: s });

    if (s === 'queue') {
      // Queue: skip directly to processing then complete
      const queueNumber = Math.floor(Math.random() * 50) + 1;
      setTransaction({ service: s, queueNumber });
      setScreen('processing');
    } else {
      setScreen('accountVerify');
    }
  }, [setScreen]);

  const handleAccountVerified = useCallback(() => {
    setScreen('transaction');
  }, [setScreen]);

  const handleTransactionNext = useCallback((amount: number, targetAccount?: string) => {
    setTransaction(prev => ({ ...prev, amount, targetAccount }));
    setScreen('confirmTransaction');
  }, [setScreen]);

  const handleConfirm = useCallback(() => {
    setScreen('processing');
  }, [setScreen]);

  const handleProcessingDone = useCallback(() => {
    if (service === 'queue') {
      setScreen('complete');
    } else {
      setScreen('receipt');
    }
  }, [setScreen, service]);

  const handleReceiptChoice = useCallback(() => {
    setScreen('complete');
  }, [setScreen]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Helper bubble component ─────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: BANK_THEME.primary, color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: BANK_THEME.primary, color: 'white' }}
        >
          <MessageCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed flex-1">{helperMessages[screen]}</p>
          <button
            onClick={() => setShowHelper(false)}
            className="flex-shrink-0 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Kiosk frame */}
      <div
        className="w-full flex flex-col overflow-hidden shadow-2xl"
        style={{
          maxWidth: 400,
          height: '90vh',
          maxHeight: 750,
          borderRadius: 12,
          backgroundColor: '#0F1B2D',
          border: '3px solid #1A365D',
          boxShadow: '0 0 0 1px #2B4A7A, 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: BANK_THEME.headerBg, borderBottom: '1px solid #2B4A7A' }}
        >
          <span className="text-xs font-medium" style={{ color: 'rgba(190,227,248,0.75)', minWidth: 60 }}>
            {t('kiosk.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: BANK_THEME.accent,
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: 'rgba(190,227,248,0.75)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: BANK_THEME.surface }}>
          <HelperBubble />

          <div
            className="h-full overflow-hidden flex flex-col transition-opacity duration-100"
            style={{ opacity: screenFade ? 0 : 1 }}
          >
            <div
              className="flex-shrink-0 transition-all duration-200"
              style={{ height: showHelper ? 48 : 0, overflow: 'hidden' }}
            />

            <div className="flex-1 overflow-hidden">
              {screen === 'welcome' && (
                <WelcomeScreen onNext={() => setScreen('serviceSelect')} />
              )}

              {screen === 'serviceSelect' && (
                <ServiceSelectScreen
                  onSelect={handleSelectService}
                  onBack={handleHome}
                />
              )}

              {screen === 'accountVerify' && (
                <AccountVerifyScreen
                  onNext={handleAccountVerified}
                  onBack={() => setScreen('serviceSelect')}
                />
              )}

              {screen === 'transaction' && service && service !== 'queue' && (
                <TransactionScreen
                  service={service}
                  onNext={handleTransactionNext}
                  onBack={() => setScreen('accountVerify')}
                />
              )}

              {screen === 'confirmTransaction' && (
                <ConfirmTransactionScreen
                  transaction={transaction}
                  onConfirm={handleConfirm}
                  onCancel={() => setScreen('transaction')}
                />
              )}

              {screen === 'processing' && (
                <ProcessingScreen onDone={handleProcessingDone} />
              )}

              {screen === 'receipt' && (
                <ReceiptScreen
                  onPrint={handleReceiptChoice}
                  onSkip={handleReceiptChoice}
                />
              )}

              {screen === 'complete' && (
                <CompleteScreen
                  transaction={transaction}
                  onDone={handleComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
