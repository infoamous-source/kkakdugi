import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onSave: () => Promise<void> | void;
  saved?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  savedLabel?: string;
}

/**
 * 6개 마케팅 도구 공통 — 검정 큰 버튼.
 * mockup 기준 라벨: "결과를 아이디어보석함에 저장하기 →"
 */
export function SaveToGemBoxButton({
  onSave,
  saved,
  disabled,
  className = '',
  label = '결과를 아이디어보석함에 저장하기 →',
  savedLabel = '✅ 보석함에 저장 완료!',
}: Props) {
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    if (busy || saved || disabled) return;
    setBusy(true);
    try {
      await onSave();
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      onClick={handleClick}
      disabled={busy || saved || disabled}
      className={`w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
      {saved ? savedLabel : label}
    </button>
  );
}
