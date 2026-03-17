import { X } from 'lucide-react';
import type { KioskTheme } from './types';

interface KioskFrameProps {
  children: React.ReactNode;
  theme: KioskTheme;
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  onClose: () => void;
  helperMessage?: string;
  showHelper?: boolean;
  onToggleHelper?: () => void;
}

/**
 * KioskFrame – a realistic kiosk terminal outer shell.
 *
 * Visual layers (outside → inside):
 *  1. Full-screen dim overlay
 *  2. Dark metallic bezel (outer body of the physical terminal)
 *  3. Thin silver-tone inner ring (screen border)
 *  4. White screen canvas  ← children render here
 *
 * The bezel intentionally has visible screws, a power LED, speaker grille
 * dots, and a branded bottom bar to feel like an actual self-service terminal.
 */
export default function KioskFrame({
  children,
  theme,
  currentStep,
  totalSteps,
  stepLabel,
  onClose,
}: KioskFrameProps) {
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  // Theme-aware progress bar / header gradient.
  // Fallback: blue-to-purple (matches the original cafe kiosk).
  const headerGradient = theme?.primary
    ? `bg-${theme.primary}-600`
    : 'bg-blue-600';

  return (
    /* ── 1. Dim overlay ── */
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3">

      {/* ── 2. Outer metallic bezel ── */}
      <div
        className="relative flex flex-col w-full max-w-[420px]"
        style={{
          /* Subtle brushed-metal look via radial gradient */
          background: 'linear-gradient(160deg, #2e2e2e 0%, #1a1a1a 40%, #111 70%, #222 100%)',
          borderRadius: '1.75rem',
          padding: '10px 10px 14px',
          boxShadow:
            '0 0 0 1px #555, 0 8px 40px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)',
          maxHeight: '96vh',
        }}
      >
        {/* ── Bezel top row: brand bar + power LED + close ── */}
        <div className="flex items-center justify-between px-3 py-1.5 mb-1.5">
          <div className="flex items-center gap-2">
            {/* Power indicator LED */}
            <span
              className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]"
              aria-hidden="true"
            />
            <span className="text-gray-500 text-[10px] font-mono tracking-widest select-none uppercase">
              KIOSK
            </span>
          </div>

          {/* Close button (⨉ on the bezel, not on-screen) */}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close kiosk"
          >
            <X size={12} />
          </button>
        </div>

        {/* ── 3. Silver-tone screen ring ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #888 0%, #555 50%, #777 100%)',
            padding: '2px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
          }}
        >
          {/* ── 4. White screen canvas ── */}
          <div
            className="bg-white rounded-[calc(1rem-2px)] overflow-hidden flex flex-col"
            style={{ minHeight: '560px', maxHeight: 'calc(96vh - 90px)' }}
          >
            {/* Step-progress status bar (inside the screen, at the very top) */}
            <div className={`${headerGradient} px-4 py-2 flex items-center gap-3`}>
              <span className="text-white text-xs font-medium whitespace-nowrap select-none">
                {stepLabel ?? `${currentStep} / ${totalSteps}`}
              </span>

              {/* Progress track */}
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Scrollable screen content */}
            <div className="flex-1 overflow-y-auto relative">
              {children}
            </div>
          </div>
        </div>

        {/* ── Speaker grille (cosmetic dots at the bottom of the bezel) ── */}
        <div className="flex justify-center gap-1 mt-2.5 mb-0.5" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-gray-600"
              style={{ opacity: i % 3 === 1 ? 0.4 : 0.25 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
