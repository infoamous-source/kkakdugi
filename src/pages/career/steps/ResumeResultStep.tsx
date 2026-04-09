import { useState } from 'react';
import { ArrowLeft, RefreshCw, Copy, Download, Sparkles, MessageSquare } from 'lucide-react';
import type { ResumeDraft, ResumeTarget } from '../../../hooks/useResumeBuilderSession';
import type { StrengthResult } from '../../../types/career/strengths';
import type { UserProfileView } from '../../../lib/userProfile';
import { traitsToKoNames } from '../../../data/career/traits';

interface Props {
  drafts: ResumeDraft[];
  strengths: StrengthResult[];
  target: ResumeTarget;
  profile: UserProfileView;
  onRegenerate: () => void;
  onBack: () => void;
  onLoadInterviewQuestions: (draft: ResumeDraft) => Promise<string[]>;
}

const ITEMS = [
  { key: 'growth',      label: '성장 과정',       limitKey: 'growth' },
  { key: 'personality', label: '성격 장단점',     limitKey: 'personality' },
  { key: 'motivation',  label: '지원 동기',       limitKey: 'motivation' },
  { key: 'aspiration',  label: '입사 후 포부',    limitKey: 'aspiration' },
] as const;

/** Step 4: 자소서 결과 — 본문 표시 + 복사/다운로드 + 면접 질문 */
export default function ResumeResultStep({
  drafts,
  strengths,
  target,
  onRegenerate,
  onBack,
  onLoadInterviewQuestions,
}: Props) {
  const latestDraft = drafts[drafts.length - 1];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // 무시
    }
  };

  const handleCopyAll = async () => {
    const fullText = ITEMS.map((item) => {
      const content = (latestDraft as unknown as Record<string, string>)[item.key];
      return `[${item.label}]\n${content}\n`;
    }).join('\n');
    await handleCopy('all', fullText);
  };

  const handleDownloadText = () => {
    const fullText = `
${target.company} - ${target.jobTitle} 자기소개서
생성일: ${new Date(latestDraft.generatedAt).toLocaleString('ko-KR')}

${ITEMS.map((item) => {
  const content = (latestDraft as unknown as Record<string, string>)[item.key];
  return `[${item.label}]\n${content}`;
}).join('\n\n')}
`.trim();

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `자기소개서_${target.company}_${target.jobTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const qs = await onLoadInterviewQuestions(latestDraft);
      setInterviewQuestions(qs);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 mb-4">
        <Sparkles className="w-6 h-6 text-emerald-600 mb-2" />
        <h2 className="text-xl font-bold text-gray-800 mb-1">자기소개서 초안이 완성됐어요!</h2>
        <p className="text-sm text-gray-600">
          📍 {target.company} · {target.jobTitle}
        </p>
        <p className="text-[11px] text-gray-500 mt-1">
          면접에서 본인이 설명할 수 있는 수준으로 만들어졌어요.
        </p>
      </div>

      {/* 내 강점 요약 */}
      <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-100">
        <p className="text-xs font-bold text-gray-500 mb-2">💎 사용된 강점</p>
        <div className="flex flex-wrap gap-1.5">
          {strengths.map((s) => (
            <span
              key={s.id}
              className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full"
            >
              {s.icon} {s.nameKo}
            </span>
          ))}
        </div>
      </div>

      {/* 자소서 항목 4개 */}
      <div className="space-y-3 mb-5">
        {ITEMS.map((item) => {
          const content = (latestDraft as unknown as Record<string, string>)[item.key];
          const sources = (latestDraft.sources as unknown as Record<string, { traitIds: string[]; interviewQuestionIds: string[] }>)[item.key];
          const wordCount = content?.length ?? 0;
          const limit = target.wordLimits?.[item.limitKey] ?? 0;

          return (
            <div key={item.key} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800">{item.label}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      limit && Math.abs(wordCount - limit) <= 50
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {wordCount} / {limit}자
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.key, content)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                    title="복사"
                  >
                    {copiedKey === item.key ? (
                      <span className="text-[11px] text-emerald-600 px-1">복사됨 ✓</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                {content}
              </p>
              {sources && (
                <div className="text-[11px] text-gray-400 flex flex-wrap gap-1 border-t border-gray-100 pt-2">
                  <span className="font-medium">출처:</span>
                  {sources.traitIds?.length > 0 && (
                    <span>역량 — {traitsToKoNames(sources.traitIds).join(', ')}</span>
                  )}
                  {sources.interviewQuestionIds?.length > 0 && (
                    <span>· 답변 — {sources.interviewQuestionIds.join(', ')}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 액션 바 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={handleCopyAll}
          className="py-3 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
        >
          <Copy className="w-4 h-4" />
          전체 복사
        </button>
        <button
          type="button"
          onClick={handleDownloadText}
          className="py-3 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          텍스트 저장
        </button>
      </div>

      {/* 면접 예상 질문 */}
      <div className="mb-4 p-4 bg-white border border-gray-100 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            면접 예상 질문
          </h3>
          {interviewQuestions.length === 0 && (
            <button
              type="button"
              onClick={handleLoadQuestions}
              disabled={loadingQuestions}
              className="text-xs text-emerald-600 underline disabled:text-gray-400"
            >
              {loadingQuestions ? '만드는 중...' : '질문 만들기'}
            </button>
          )}
        </div>
        {interviewQuestions.length === 0 ? (
          <p className="text-xs text-gray-400">
            이 자소서를 보고 면접관이 물어볼 질문을 AI가 예측해줘요
          </p>
        ) : (
          <ol className="space-y-1.5 text-sm text-gray-700">
            {interviewQuestions.map((q, i) => (
              <li key={i}>
                <span className="text-emerald-600 font-bold mr-1">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          다시 만들기
        </button>
      </div>
    </div>
  );
}
