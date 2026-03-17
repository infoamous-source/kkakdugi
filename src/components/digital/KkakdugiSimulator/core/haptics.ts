/**
 * Haptic feedback & touch sound utilities for kkakdugi simulators.
 *
 * Usage guidelines — apply sparingly for realism:
 *  - hapticTap()      → button press, menu item selection
 *  - hapticHeavy()    → important actions (add to cart, payment approve)
 *  - playTouchSound() → screen transitions, button confirmation
 *  - playBeep()       → payment approved, order complete
 */

// ─── Haptic vibration (mobile only, no-op on desktop) ─────────────────────────

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // silently ignore on unsupported devices
    }
  }
}

/** Light tap — button press, item selection */
export function hapticTap() {
  vibrate(8);
}

/** Medium feedback — add to cart, confirm action */
export function hapticMedium() {
  vibrate(15);
}

/** Heavy feedback — payment approved, order complete */
export function hapticHeavy() {
  vibrate([20, 40, 20]);
}

// ─── Audio feedback (Web Audio API — no external files needed) ────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, volume = 0.08, type: OscillatorType = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Soft click sound — button tap, menu selection */
export function playTouchSound() {
  playTone(800, 0.06, 0.06);
}

/** Confirmation beep — payment approved, order complete */
export function playBeep() {
  playTone(880, 0.08, 0.08);
  setTimeout(() => playTone(1100, 0.12, 0.08), 100);
}

/** Error/cancel tone */
export function playCancel() {
  playTone(300, 0.15, 0.05, 'triangle');
}

// ─── Combined feedback helpers ────────────────────────────────────────────────

/** Standard button press: light tap + click sound */
export function feedbackTap() {
  hapticTap();
  playTouchSound();
}

/** Important action: medium vibration + click */
export function feedbackConfirm() {
  hapticMedium();
  playTouchSound();
}

/** Major milestone: heavy vibration + beep (payment, order complete) */
export function feedbackSuccess() {
  hapticHeavy();
  playBeep();
}
