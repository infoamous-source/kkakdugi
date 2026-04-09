import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import type { StrengthResult } from '../../../types/career/strengths';
import { traitsToKoNames } from '../../../data/career/traits';

interface Props {
  strengths: StrengthResult[];
  initialRejected: string[];
  onComplete: (acceptedIds: string[]) => void;
  onRedo: () => void;
}

/** Step 0-E: 강점 카드 5장 공개 — 👍👎 평가 */
export default function ResultRevealStep({
  strengths,
  initialRejected,
  onComplete,
  onRedo,
}: Props) {
  const [rejected, setRejected] = useState<Set<string>>(new Set(initialRejected));
  const [revealedCount, setRevealedCount] = useState(0);

  // 카드 하나씩 순차 공개 애니메이션
  useEffect(() => {
    setRevealedCount(0);
    const timers: number[] = [];
    strengths.forEach((_, i) => {
      const t = window.setTimeout(() => setRevealedCount((n) => n + 1), 600 + i * 500);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [strengths]);

  const toggleReject = (id: string) => {
    setRejected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const acceptedCount = strengths.filter((s) => !rejected.has(s.id)).length;

  return (
    <div>
      {/* 헤더 */}
      <div className="text-center mb-6">
        <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-800">당신의 강점 {strengths.length}가지</h2>
        <p className="text-sm text-gray-500 mt-1">Your strengths revealed!</p>
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-3 mb-6">
        {strengths.map((s, i) => {
          const isRevealed = i < revealedCount;
          const isRejected = rejected.has(s.id);
          return (
            <div
              key={s.id}
              className={`transition-all duration-500 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div
                className={`bg-white rounded-2xl shadow-sm border-2 p-5 flex items-start gap-4 ${
                  isRejected ? 'border-gray-200 opacity-50' : 'border-emerald-200'
                }`}
              >
                <div className="text-4xl">{s.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base">{s.nameKo}</h3>
                  <p className="text-[11px] text-gray-400 mb-2">{s.nameEn}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                  {s.coreTraits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {traitsToKoNames(s.coreTraits).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleReject(s.id)}
                    title={isRejected ? '다시 살리기' : '이 강점 빼기'}
                    className={`p-2 rounded-full border ${
                      isRejected
                        ? 'border-gray-300 bg-gray-50 text-gray-400'
                        : 'border-red-200 text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                  {!isRejected && (
                    <div className="p-2 rounded-full border border-emerald-200 text-emerald-500">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 액션 */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={acceptedCount === 0}
          onClick={() => {
            const acceptedIds = strengths
              .filter((s) => !rejected.has(s.id))
              .map((s) => s.id);
            onComplete(acceptedIds);
          }}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          이 강점으로 인터뷰 시작 ({acceptedCount}개 선택)
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('강점 찾기를 다시 할까요? 지금까지 고른 카드가 사라져요.')) {
              onRedo();
            }
          }}
          className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50"
        >
          <RotateCcw className="w-4 h-4" />
          강점 다시 찾기
        </button>
      </div>
    </div>
  );
}
