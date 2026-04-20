import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Gift, GraduationCap } from 'lucide-react';
import { useSchoolProgress } from '../../hooks/useSchoolProgress';
import confetti from 'canvas-confetti';
import GraduationCertificate from './GraduationCertificate';

interface GraduationModalProps {
  userId: string;
  userName: string;
  userOrg: string;
  teamName: string;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'ceremony' | 'result';

/* ── CSS keyframes injected once ── */
const styleId = 'graduation-modal-keyframes';
function ensureKeyframes() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes capFlyUp {
      0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
      40%  { transform: translate(10px, -80px) rotate(30deg); opacity: 1; }
      70%  { transform: translate(-5px, -140px) rotate(-15deg); opacity: 1; }
      100% { transform: translate(15px, -200px) rotate(360deg); opacity: 0; }
    }
    @keyframes ceremonyFloat {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes ceremonySpin {
      0%   { transform: scale(0.8) rotate(-5deg); opacity: 0; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes ceremonyPulse {
      0%, 100% { opacity: 0.6; }
      50%      { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Confetti multi-burst ── */
function fireConfettiBursts(): ReturnType<typeof setTimeout>[] {
  const defaults = {
    spread: 80,
    colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1', '#FF69B4'],
  };

  const t1 = setTimeout(() => {
    confetti({ ...defaults, particleCount: 120, origin: { x: 0.5, y: 0.5 } });
  }, 500);

  const t2 = setTimeout(() => {
    confetti({ ...defaults, particleCount: 80, origin: { x: 0.3, y: 0.6 }, angle: 60 });
    confetti({ ...defaults, particleCount: 80, origin: { x: 0.7, y: 0.6 }, angle: 120 });
  }, 1500);

  const t3 = setTimeout(() => {
    confetti({ ...defaults, particleCount: 200, spread: 120, origin: { x: 0.5, y: 0.4 } });
  }, 3000);

  return [t1, t2, t3];
}

/* ── Inline Kkakdugi SVG (simplified) ── */
function KkakdugiCeremony({ capFlying }: { capFlying: boolean }) {
  return (
    <div className="relative" style={{ width: 200, height: 240 }}>
      {/* Character body */}
      <svg
        width={200}
        height={240}
        viewBox="0 0 360 440"
        fill="none"
        style={{ animation: 'ceremonyFloat 2.4s ease-in-out infinite' }}
      >
        <defs>
          <linearGradient id="gm-bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3dc" />
            <stop offset="100%" stopColor="#fce8c3" />
          </linearGradient>
          <linearGradient id="gm-topGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c43025" />
            <stop offset="50%" stopColor="#d44035" />
            <stop offset="100%" stopColor="#e05545" />
          </linearGradient>
          <linearGradient id="gm-midGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0a090" />
            <stop offset="100%" stopColor="#f5c0aa" />
          </linearGradient>
          <radialGradient id="gm-cheekGrad">
            <stop offset="0%" stopColor="#f4a08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f4a08a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gm-blazerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c3e6b" />
            <stop offset="100%" stopColor="#1e2d52" />
          </linearGradient>
        </defs>

        {/* Legs */}
        <line x1="148" y1="348" x2="142" y2="380" stroke="#4a3a2e" strokeWidth="5" strokeLinecap="round" />
        <rect x="132" y="377" width="20" height="12" rx="6" fill="#fff" stroke="#e0ddd8" strokeWidth="2" />
        <line x1="212" y1="348" x2="218" y2="380" stroke="#4a3a2e" strokeWidth="5" strokeLinecap="round" />
        <rect x="208" y="377" width="20" height="12" rx="6" fill="#fff" stroke="#e0ddd8" strokeWidth="2" />

        {/* Body */}
        <rect x="48" y="85" width="264" height="265" rx="16" fill="url(#gm-bodyGrad)" stroke="#d4a060" strokeWidth="5" />

        {/* Blazer */}
        <path d="M48 280 L48 334 Q48 350 64 350 L296 350 Q312 350 312 334 L312 280 Z" fill="url(#gm-blazerGrad)" stroke="#1a2440" strokeWidth="5" />
        <path d="M150 280 L180 302 L210 280 Z" fill="#f5f0e8" />
        <path d="M173 290 L180 293 L187 290 L184 326 Q180 332 176 326 Z" fill="#c43025" stroke="#9a2520" strokeWidth="2" />

        {/* Top layer (kimchi) */}
        <path d="M48 133 Q48 123 58 120 L302 120 Q312 123 312 133 L310 145 Q292 155 274 149 Q252 141 232 153 Q210 163 180 153 Q150 141 130 153 Q110 163 88 151 Q66 141 52 147 Z" fill="url(#gm-midGrad)" />
        <path d="M48 120 Q48 85 64 85 L296 85 Q312 85 312 120 L310 130 Q292 143 274 135 Q252 125 232 137 Q210 149 180 137 Q150 125 130 137 Q110 149 88 137 Q66 125 52 133 Z" fill="url(#gm-topGrad)" stroke="#9a2520" strokeWidth="5" />

        {/* Eyes */}
        <circle cx="134" cy="200" r="16" fill="#fff" stroke="#4a3a2e" strokeWidth="3.5" />
        <circle cx="136" cy="202" r="10" fill="#1a1a1a" />
        <circle cx="130" cy="195" r="5" fill="#fff" opacity="0.9" />
        <circle cx="226" cy="200" r="16" fill="#fff" stroke="#4a3a2e" strokeWidth="3.5" />
        <circle cx="228" cy="202" r="10" fill="#1a1a1a" />
        <circle cx="222" cy="195" r="5" fill="#fff" opacity="0.9" />

        {/* Happy mouth (bigger smile for ceremony) */}
        <path d="M160 238 Q180 260 200 238" fill="none" stroke="#4a3a2e" strokeWidth="4" strokeLinecap="round" />

        {/* Cheeks */}
        <ellipse cx="118" cy="230" rx="30" ry="20" fill="url(#gm-cheekGrad)" opacity="0.7" />
        <ellipse cx="242" cy="230" rx="30" ry="20" fill="url(#gm-cheekGrad)" opacity="0.7" />

        {/* Arms raised up in celebration */}
        <line x1="48" y1="260" x2="10" y2="220" stroke="#4a3a2e" strokeWidth="5" strokeLinecap="round" />
        <line x1="312" y1="260" x2="350" y2="220" stroke="#4a3a2e" strokeWidth="5" strokeLinecap="round" />

        {/* Graduation cap — stays on head when not flying */}
        {!capFlying && (
          <g style={{ transformOrigin: '180px 48px' }}>
            <rect x="140" y="38" width="80" height="10" rx="2" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5" />
            <polygon points="180,28 230,45 180,52 130,45" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5" />
            <rect x="158" y="48" width="44" height="28" rx="3" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5" />
            <circle cx="180" cy="35" r="3.5" fill="#4a4a4a" stroke="#2a2a2a" strokeWidth="1" />
            <path d="M180 35 Q195 32 205 45 Q208 52 206 62" fill="none" stroke="#4a4a4a" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="206" cy="64" r="3" fill="#4a4a4a" />
          </g>
        )}
      </svg>

      {/* Graduation cap — separate element that flies up */}
      {capFlying && (
        <svg
          width={80}
          height={60}
          viewBox="120 20 120 55"
          fill="none"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -40,
            animation: 'capFlyUp 2s ease-out forwards',
          }}
        >
          <rect x="140" y="38" width="80" height="10" rx="2" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5" />
          <polygon points="180,28 230,45 180,52 130,45" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5" />
          <rect x="158" y="48" width="44" height="28" rx="3" fill="#3a3a3a" stroke="#2a2a2a" strokeWidth="1.5" />
          <circle cx="180" cy="35" r="3.5" fill="#4a4a4a" stroke="#2a2a2a" strokeWidth="1" />
          <path d="M180 35 Q195 32 205 45 Q208 52 206 62" fill="none" stroke="#4a4a4a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="206" cy="64" r="3" fill="#4a4a4a" />
        </svg>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   GraduationModal
   ══════════════════════════════════════════ */
export default function GraduationModal({
  userId,
  userName,
  userOrg,
  teamName,
  onClose,
  onComplete,
}: GraduationModalProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { graduate: doGraduate } = useSchoolProgress();
  const [step, setStep] = useState<Step>('ceremony');
  const [capFlying, setCapFlying] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [graduated, setGraduated] = useState(false);

  // Inject keyframes on mount
  useEffect(() => {
    ensureKeyframes();
  }, []);

  // Ceremony auto-transition
  useEffect(() => {
    if (step !== 'ceremony') return;

    const confettiTimers = fireConfettiBursts();
    const capTimer = setTimeout(() => setCapFlying(true), 800);
    const transTimer = setTimeout(() => setStep('result'), 5000);

    return () => {
      confettiTimers.forEach(clearTimeout);
      clearTimeout(capTimer);
      clearTimeout(transTimer);
      confetti.reset();
    };
  }, [step]);

  const handleGraduate = useCallback(async () => {
    if (graduated) return;
    await doGraduate();
    setGraduated(true);
  }, [graduated, doGraduate]);

  const handleGoToPro = () => {
    handleGraduate();
    onComplete();
    navigate('/marketing/pro');
  };

  const handleGetCertificate = () => {
    handleGraduate();
    setShowCertificate(true);
  };

  /* ── Ceremony screen ── */
  if (step === 'ceremony') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #ec4899 70%, #f472b6 100%)',
          }}
        />

        {/* Content */}
        <div
          className="relative flex flex-col items-center gap-6 text-white"
          style={{ animation: 'ceremonySpin 0.6s ease-out both' }}
        >
          <KkakdugiCeremony capFlying={capFlying} />

          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg">
            {t('school.graduation.ceremonyTitle', '축하합니다! 🎉')}
          </h1>
          <p
            className="text-lg text-white/80 font-medium"
            style={{ animation: 'ceremonyPulse 2s ease-in-out infinite' }}
          >
            {userName}님의 졸업을 축하합니다!
          </p>
        </div>
      </div>
    );
  }

  /* ── Certificate overlay ── */
  if (showCertificate) {
    return (
      <GraduationCertificate
        userName={userName}
        userOrg={userOrg}
        teamName={teamName}
        onClose={() => setShowCertificate(false)}
      />
    );
  }

  /* ── Result screen ── */
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} aria-label="닫기" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Pro classroom gift */}
          <button
            onClick={handleGoToPro}
            className="w-full p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-left hover:opacity-90 transition-opacity mb-3"
          >
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 flex-shrink-0" />
              <span className="text-lg font-bold">
                {t('school.graduation.proGiftButton', '🎁 졸업 선물: 프로 마케터 교실 Open!')}
              </span>
            </div>
            <p className="text-sm text-white/80 ml-9">
              {t('school.graduation.proGiftDesc', '프로 마케터 교실에서는 전문 마케팅 도구를 사용할 수 있습니다.')}
            </p>
          </button>

          {/* Certificate button */}
          <button
            onClick={handleGetCertificate}
            className="w-full p-4 border-2 border-amber-300 bg-amber-50 rounded-2xl text-left hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <span className="text-lg font-bold text-amber-800">
                {t('school.graduation.getCertificateButton', '🎓 졸업장 받기')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
