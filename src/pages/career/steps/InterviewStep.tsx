import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, SkipForward } from 'lucide-react';
import type { UserProfileView } from '../../../lib/userProfile';
import type { InterviewAnswer } from '../../../hooks/useResumeBuilderSession';
import { getStarQuestionById } from '../../../data/career/starQuestions';

interface Props {
  profile: UserProfileView;
  selectedQuestionIds: string[];
  answers: InterviewAnswer[];
  onAnswersChange: (answers: InterviewAnswer[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

const MIN_COMPLETE = 5;

/** Step 1: STAR 인터뷰 — 카드형 Q&A (각 질문에 S/T/A/R 4칸 입력) */
export default function InterviewStep({
  profile,
  selectedQuestionIds,
  answers,
  onAnswersChange,
  onComplete,
  onBack,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  const questions = useMemo(
    () =>
      selectedQuestionIds
        .map((id) => getStarQuestionById(id))
        .filter((q): q is NonNullable<ReturnType<typeof getStarQuestionById>> => !!q),
    [selectedQuestionIds],
  );

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
        질문을 불러올 수 없어요. 이전 단계로 돌아가주세요.
        <button
          type="button"
          onClick={onBack}
          className="block mx-auto mt-4 px-4 py-2 text-emerald-600 underline"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const activeQuestion = questions[activeIdx];
  const activeAnswer = answers.find((a) => a.questionId === activeQuestion.id);

  const updateAnswer = (
    field: 'situation' | 'task' | 'action' | 'result',
    value: string,
  ) => {
    const existing = answers.find((a) => a.questionId === activeQuestion.id);
    const next: InterviewAnswer = existing
      ? {
          ...existing,
          starBreakdown: { ...existing.starBreakdown, [field]: value },
          answeredAt: new Date().toISOString(),
        }
      : {
          questionId: activeQuestion.id,
          answeredAt: new Date().toISOString(),
          starBreakdown: { [field]: value },
        };
    const nextList = existing
      ? answers.map((a) => (a.questionId === activeQuestion.id ? next : a))
      : [...answers, next];
    onAnswersChange(nextList);
  };

  const completedCount = answers.filter(
    (a) =>
      a.starBreakdown &&
      (a.starBreakdown.situation ||
        a.starBreakdown.task ||
        a.starBreakdown.action ||
        a.starBreakdown.result),
  ).length;

  const canFinish = completedCount >= MIN_COMPLETE;

  return (
    <div>
      {/* 상단 진행 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
          강점 다시 보기
        </button>
        <div className="text-xs text-gray-500">
          답변: <strong className="text-emerald-600">{completedCount}</strong> / {questions.length}
        </div>
      </div>

      {/* 질문 내비게이션 */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {questions.map((q, i) => {
          const hasAnswer = answers.some(
            (a) =>
              a.questionId === q.id &&
              (a.starBreakdown?.situation ||
                a.starBreakdown?.task ||
                a.starBreakdown?.action ||
                a.starBreakdown?.result),
          );
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i === activeIdx
                  ? 'bg-emerald-600 text-white scale-110'
                  : hasAnswer
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {hasAnswer ? '✓' : i + 1}
            </button>
          );
        })}
      </div>

      {/* 메인 질문 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="text-xs text-emerald-600 font-bold mb-1">
          질문 {activeIdx + 1} / {questions.length}
        </div>
        <h2 className="text-lg font-bold text-gray-800 leading-snug mb-2">
          {activeQuestion.mainQuestionKo}
        </h2>
        <p className="text-[12px] text-gray-400 mb-2">{activeQuestion.mainQuestionEn}</p>
        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg">
          💡 {activeQuestion.hintKo}
        </p>
      </div>

      {/* STAR 입력 4칸 */}
      <div className="space-y-3 mb-5">
        {(['situation', 'task', 'action', 'result'] as const).map((field) => {
          const labels = {
            situation: { ko: '상황 · Situation', emoji: '🎬' },
            task: { ko: '과제 · Task', emoji: '🎯' },
            action: { ko: '내 행동 · Action', emoji: '⚡' },
            result: { ko: '결과 · Result', emoji: '✨' },
          } as const;
          const label = labels[field];
          const questionText = activeQuestion.followUps[field].ko;
          const value = activeAnswer?.starBreakdown?.[field] ?? '';

          return (
            <div key={field}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <span>{label.emoji}</span>
                {label.ko}
              </label>
              <p className="text-[11px] text-gray-500 mb-1.5">{questionText}</p>
              <textarea
                value={value}
                onChange={(e) => updateAnswer(field, e.target.value)}
                placeholder="짧아도 괜찮아요. 한국어·모국어 모두 OK."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={activeIdx === 0}
          onClick={() => setActiveIdx((i) => i - 1)}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {activeIdx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setActiveIdx((i) => i + 1)}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            다음 질문
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canFinish}
            onClick={onComplete}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {canFinish ? (
              <>
                <Check className="w-4 h-4" />
                인터뷰 끝내기
              </>
            ) : (
              <>
                <SkipForward className="w-4 h-4" />
                {MIN_COMPLETE - completedCount}개 답변 더 필요해요
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-center mt-3">
        답변은 자동으로 저장돼요. 나중에 이어서 할 수 있어요.
        <br />
        {profile.vocabularyGuide.labelEn} 수준에 맞춰 자소서가 만들어져요.
      </p>
    </div>
  );
}
