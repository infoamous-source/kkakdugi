import { MessageCircle, HelpCircle, X } from 'lucide-react';
import type { KioskTheme } from './types';

interface KioskHelperProps {
  message: string;
  visible: boolean;
  onToggle: () => void;
  theme?: KioskTheme;
}

/**
 * Floating helper bubble / toggle button shown inside the kiosk screen area.
 *
 * - When visible: shows an expandable speech-bubble card with the hint message.
 * - When hidden: collapses to a small circular help icon button.
 *
 * The active colour is derived from the kiosk theme when provided;
 * it falls back to the project's standard blue-600.
 */
export default function KioskHelper({
  message,
  visible,
  onToggle,
  theme,
}: KioskHelperProps) {
  // Build a background colour class from theme.primary or fall back to blue-600.
  // We rely on Tailwind's safelist / JIT: the calling code must ensure the
  // colour classes (e.g. bg-amber-600, bg-blue-600) are present in the bundle.
  const bgClass = theme?.primary ? `bg-${theme.primary}-600` : 'bg-blue-600';

  if (visible) {
    return (
      <div
        className="absolute top-2 left-2 right-2 z-20"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div
          className={`${bgClass} text-white rounded-2xl p-3 shadow-lg flex items-start gap-2`}
        >
          <MessageCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed flex-1">{message}</p>
          <button
            onClick={onToggle}
            className="text-white/70 hover:text-white flex-shrink-0 transition-colors"
            aria-label="Close helper"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={`absolute top-2 right-2 z-20 w-8 h-8 ${bgClass} text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity`}
      aria-label="Show helper"
    >
      <HelpCircle size={16} />
    </button>
  );
}
