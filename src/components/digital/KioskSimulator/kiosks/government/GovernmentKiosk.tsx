import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KioskComponentProps } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type GovernmentScreen,
  type GovernmentDocument,
  type Purpose,
  GOVERNMENT_SCREEN_ORDER,
  GOVERNMENT_THEME,
  PURPOSES,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import IdentityScreen from './screens/IdentityScreen';
import DocumentSelectScreen from './screens/DocumentSelectScreen';
import DocumentOptionsScreen from './screens/DocumentOptionsScreen';
import ConfirmDocumentScreen from './screens/ConfirmDocumentScreen';
import PaymentScreen from './screens/PaymentScreen';
import ProcessingScreen from './screens/ProcessingScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function GovernmentKiosk({ onClose, onComplete }: KioskComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<GovernmentScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Screen transition with fade effect + helper reset
  const setScreen = useCallback((next: GovernmentScreen) => {
    setScreenFade(true);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    fadeTimeout.current = setTimeout(() => {
      setScreenRaw(next);
      setShowHelper(true);
      playTouchSound();
      setScreenFade(false);
    }, 120);
  }, []);

  // ── Service state ────────────────────────────────────────────────────────────
  const [selectedDocument, setSelectedDocument] = useState<GovernmentDocument | null>(null);
  const [purpose, setPurpose] = useState<Purpose>(PURPOSES[0]);
  const [copies, setCopies] = useState(1);

  // ── Helper bubble ─────────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  // Cleanup fade timeout
  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // ── Screen flow indices ───────────────────────────────────────────────────────
  const currentStepIndex = GOVERNMENT_SCREEN_ORDER.indexOf(screen);
  const totalSteps = GOVERNMENT_SCREEN_ORDER.length;

  // ── Helper messages ───────────────────────────────────────────────────────────
  const helperMessages: Record<GovernmentScreen, string> = useMemo(() => ({
    welcome:         t('kiosk.helper.government.welcome',         '화면을 터치하여 시작하세요'),
    identity:        t('kiosk.helper.government.identity',        '주민등록번호를 입력해 주세요'),
    documentSelect:  t('kiosk.helper.government.documentSelect',  '발급할 서류를 선택하세요'),
    documentOptions: t('kiosk.helper.government.documentOptions', '용도와 부수를 선택하세요'),
    confirmDocument: t('kiosk.helper.government.confirmDocument', '발급 정보를 확인하세요'),
    payment:         t('kiosk.helper.government.payment',         '수수료를 결제하세요'),
    processing:      t('kiosk.helper.government.processing',      '서류를 출력 중입니다'),
    complete:        t('kiosk.helper.government.complete',        '서류 발급이 완료되었습니다'),
  }), [t]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleHome = useCallback(() => {
    setSelectedDocument(null);
    setPurpose(PURPOSES[0]);
    setCopies(1);
    setScreen('welcome');
  }, [setScreen]);

  const handleSelectDocument = useCallback((doc: GovernmentDocument) => {
    setSelectedDocument(doc);
    setPurpose(PURPOSES[0]);
    setCopies(1);
    setScreen('documentOptions');
  }, [setScreen]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Total fee ──────────────────────────────────────────────────────────────────
  const totalFee = selectedDocument ? selectedDocument.fee * copies : 0;

  // ── Helper bubble component ───────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: GOVERNMENT_THEME.accent, color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: GOVERNMENT_THEME.accent, color: 'white' }}
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

  // ── Render ────────────────────────────────────────────────────────────────────
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
          backgroundColor: '#0F172A',
          border: '3px solid #1E293B',
          boxShadow: '0 0 0 1px #334155, 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: GOVERNMENT_THEME.headerBg, borderBottom: '1px solid #334155' }}
        >
          <span className="text-xs font-medium" style={{ color: 'rgba(203,213,225,0.75)', minWidth: 60 }}>
            {t('kiosk.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: GOVERNMENT_THEME.accent,
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: 'rgba(203,213,225,0.75)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: GOVERNMENT_THEME.bgLight }}>
          {/* Helper bubble overlay */}
          <HelperBubble />

          {/* Screen renders with fade transition */}
          <div
            className="h-full overflow-hidden flex flex-col transition-opacity duration-100"
            style={{ opacity: screenFade ? 0 : 1 }}
          >
            {/* Extra space for helper bubble on all screens */}
            <div
              className="flex-shrink-0 transition-all duration-200"
              style={{ height: showHelper ? 48 : 0, overflow: 'hidden' }}
            />

            <div className="flex-1 overflow-hidden">
              {screen === 'welcome' && (
                <WelcomeScreen
                  onNext={() => setScreen('identity')}
                />
              )}

              {screen === 'identity' && (
                <IdentityScreen
                  onNext={() => setScreen('documentSelect')}
                  onBack={handleHome}
                />
              )}

              {screen === 'documentSelect' && (
                <DocumentSelectScreen
                  onSelect={handleSelectDocument}
                  onBack={() => setScreen('identity')}
                />
              )}

              {screen === 'documentOptions' && selectedDocument && (
                <DocumentOptionsScreen
                  document={selectedDocument}
                  purpose={purpose}
                  copies={copies}
                  onPurposeChange={setPurpose}
                  onCopiesChange={setCopies}
                  onNext={() => setScreen('confirmDocument')}
                  onBack={() => setScreen('documentSelect')}
                />
              )}

              {screen === 'confirmDocument' && selectedDocument && (
                <ConfirmDocumentScreen
                  document={selectedDocument}
                  purpose={purpose}
                  copies={copies}
                  onConfirm={() => {
                    if (totalFee === 0) {
                      setScreen('processing');
                    } else {
                      setScreen('payment');
                    }
                  }}
                  onBack={() => setScreen('documentOptions')}
                />
              )}

              {screen === 'payment' && (
                <PaymentScreen
                  totalFee={totalFee}
                  onNext={() => setScreen('processing')}
                  onBack={() => setScreen('confirmDocument')}
                />
              )}

              {screen === 'processing' && (
                <ProcessingScreen
                  onNext={() => setScreen('complete')}
                />
              )}

              {screen === 'complete' && selectedDocument && (
                <CompleteScreen
                  document={selectedDocument}
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
