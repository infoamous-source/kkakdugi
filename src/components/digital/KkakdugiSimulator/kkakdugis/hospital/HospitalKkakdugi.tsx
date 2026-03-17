import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageCircle, HelpCircle } from 'lucide-react';

import type { KkakdugiComponentProps } from '../../core/types';
import { playTouchSound } from '../../core/haptics';
import {
  type HospitalScreen,
  type VisitType,
  type Department,
  type Doctor,
  HOSPITAL_SCREEN_ORDER,
  HOSPITAL_THEME,
} from './data';

import WelcomeScreen from './screens/WelcomeScreen';
import VisitTypeScreen from './screens/VisitTypeScreen';
import DepartmentScreen from './screens/DepartmentScreen';
import DoctorScreen from './screens/DoctorScreen';
import IdentityScreen from './screens/IdentityScreen';
import ConfirmInfoScreen from './screens/ConfirmInfoScreen';
import PaymentScreen from './screens/PaymentScreen';
import CompleteScreen from './screens/CompleteScreen';

export default function HospitalKkakdugi({ onClose, onComplete }: KkakdugiComponentProps) {
  const { t } = useTranslation();

  // ── Navigation ──────────────────────────────────────────────────────────────
  const [screen, setScreenRaw] = useState<HospitalScreen>('welcome');
  const [screenFade, setScreenFade] = useState(false);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Screen transition with fade effect + helper reset
  const setScreen = useCallback((next: HospitalScreen) => {
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
  const [visitType, setVisitType] = useState<VisitType | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // ── Waiting number (random 1-99) ─────────────────────────────────────────────
  const [waitingNumber] = useState(() => Math.floor(Math.random() * 99) + 1);

  // ── Helper bubble ─────────────────────────────────────────────────────────────
  const [showHelper, setShowHelper] = useState(true);

  // Cleanup fade timeout
  useEffect(() => {
    return () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); };
  }, []);

  // ── Screen flow indices ───────────────────────────────────────────────────────
  const currentStepIndex = HOSPITAL_SCREEN_ORDER.indexOf(screen);
  const totalSteps = HOSPITAL_SCREEN_ORDER.length;

  // ── Helper messages ───────────────────────────────────────────────────────────
  const helperMessages: Record<HospitalScreen, string> = useMemo(() => ({
    welcome:     t('kkakdugi.helper.hospital.welcome',     '화면을 터치하여 접수를 시작하세요'),
    visitType:   t('kkakdugi.helper.hospital.visitType',   '초진(처음) 또는 재진(다시 방문)을 선택하세요'),
    department:  t('kkakdugi.helper.hospital.department',  '진료받을 과를 선택하세요'),
    doctor:      t('kkakdugi.helper.hospital.doctor',      '진료 의사를 선택하세요'),
    identity:    t('kkakdugi.helper.hospital.identity',    '본인 확인 정보를 입력하세요'),
    confirmInfo: t('kkakdugi.helper.hospital.confirmInfo', '접수 정보를 확인하세요'),
    payment:     t('kkakdugi.helper.hospital.payment',     '진찰료를 수납하세요'),
    complete:    t('kkakdugi.helper.hospital.complete',    '접수가 완료되었습니다. 대기번호를 확인하세요'),
  }), [t]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleHome = useCallback(() => {
    setVisitType(null);
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setScreen('welcome');
  }, [setScreen]);

  const handleSelectVisitType = useCallback((type: VisitType) => {
    setVisitType(type);
    setScreen('department');
  }, [setScreen]);

  const handleSelectDepartment = useCallback((dept: Department) => {
    setSelectedDepartment(dept);
    setScreen('doctor');
  }, [setScreen]);

  const handleSelectDoctor = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setScreen('identity');
  }, [setScreen]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Helper bubble component ───────────────────────────────────────────────────
  const HelperBubble = () => {
    if (!showHelper) {
      return (
        <button
          onClick={() => setShowHelper(true)}
          className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: HOSPITAL_THEME.primaryBtn, color: 'white' }}
        >
          <HelpCircle size={16} />
        </button>
      );
    }
    return (
      <div className="absolute top-2 left-2 right-2 z-20">
        <div
          className="rounded-xl p-2.5 shadow-lg flex items-start gap-2"
          style={{ backgroundColor: HOSPITAL_THEME.primaryBtn, color: 'white' }}
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
      {/* Kkakdugi frame */}
      <div
        className="w-full flex flex-col overflow-hidden shadow-2xl"
        style={{
          maxWidth: 400,
          height: '90vh',
          maxHeight: 750,
          borderRadius: 12,
          backgroundColor: '#0A2828',
          border: '3px solid #0D3838',
          boxShadow: '0 0 0 1px #1A5050, 0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Progress bar header ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ backgroundColor: HOSPITAL_THEME.headerBg, borderBottom: `1px solid #0A5558` }}
        >
          <span className="text-xs font-medium" style={{ color: 'rgba(178,236,232,0.75)', minWidth: 60 }}>
            {t('kkakdugi.step', '단계')} {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                backgroundColor: HOSPITAL_THEME.accentGreen,
              }}
            />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 transition-opacity hover:opacity-75"
            style={{ color: 'rgba(178,236,232,0.75)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Screen content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: HOSPITAL_THEME.bgLight }}>
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
                  onNext={() => setScreen('visitType')}
                />
              )}

              {screen === 'visitType' && (
                <VisitTypeScreen
                  onNext={handleSelectVisitType}
                  onBack={handleHome}
                />
              )}

              {screen === 'department' && (
                <DepartmentScreen
                  onSelect={handleSelectDepartment}
                  onBack={() => setScreen('visitType')}
                />
              )}

              {screen === 'doctor' && selectedDepartment && (
                <DoctorScreen
                  department={selectedDepartment}
                  onSelect={handleSelectDoctor}
                  onBack={() => setScreen('department')}
                />
              )}

              {screen === 'identity' && (
                <IdentityScreen
                  onNext={() => setScreen('confirmInfo')}
                  onBack={() => setScreen('doctor')}
                />
              )}

              {screen === 'confirmInfo' && visitType && selectedDepartment && selectedDoctor && (
                <ConfirmInfoScreen
                  visitType={visitType}
                  department={selectedDepartment}
                  doctor={selectedDoctor}
                  onNext={() => setScreen('payment')}
                  onBack={() => setScreen('identity')}
                />
              )}

              {screen === 'payment' && (
                <PaymentScreen
                  onNext={() => setScreen('complete')}
                  onBack={() => setScreen('confirmInfo')}
                />
              )}

              {screen === 'complete' && selectedDepartment && selectedDoctor && (
                <CompleteScreen
                  waitingNumber={waitingNumber}
                  department={selectedDepartment}
                  doctor={selectedDoctor}
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
