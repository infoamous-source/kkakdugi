import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mic,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../lib/userProfile';
import { useResumeBuilderSession } from '../../hooks/useResumeBuilderSession';
import {
  generatePersonalizedQuestions,
  evaluateAnswer,
  type InterviewFeedback,
} from '../../services/career/interviewSimulatorService';

interface QuestionItem {
  id: string;
  category: string;
  text: string;
}

/**
 * 면접 시뮬레이터 페이지
 *
 * 1. 자소서 빌더 세션이 있으면 맞춤 질문 8개 생성, 없으면 범용 질문
 * 2. 한 질문씩 답변 입력 → AI 평가 (score + strengths + improvements + 모범 답변)
 * 3. 8개 질문 완료 시 총평
 */
export default function InterviewSimulatorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
  const { session, updateSession } = useResumeBuilderSession(user?.id);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  // 질문 세트 로딩 (start 클릭 시)
  const handleStart = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);
    try {
      const acceptedStrengths = session.resultStrengths.filter(
        (r) => !session.rejectedResultIds.includes(r.id),
      );
      const latestDraft = session.resumeDrafts[session.resumeDrafts.length - 1];
      const target = session.resumeTarget
        ? { company: session.resumeTarget.company, jobTitle: session.resumeTarget.jobTitle }
        : undefined;

      const qs = await generatePersonalizedQuestions({
        profile,
        strengths: acceptedStrengths,
        resumeDraft: latestDraft,
        target,
      });
      setQuestions(qs);
      setStarted(true);
      setCurrentIdx(0);
    } catch (e) {
      console.error('[InterviewSimulator] start error:', e);
      setError('질문을 준비하지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!profile || !questions[currentIdx] || currentAnswer.trim().length === 0) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const fb = await evaluateAnswer({
        profile,
        question: questions[currentIdx].text,
        answer: currentAnswer,
      });
      setFeedback(fb);

      // 세션에 기록
      const practices = session.interviewPractices ?? [];
      updateSession({
        interviewPractices: [
          ...practices,
          {
            id: `${Date.now()}`,
            question: questions[currentIdx].text,
            userAnswer: currentAnswer,
            feedback: fb.overallComment,
            score: fb.score,
            practicedAt: new Date().toISOString(),
          },
        ],
      });
    } catch (e) {
      console.error('[InterviewSimulator] evaluate error:', e);
      setError('평가 중 오류가 발생했어요.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setCurrentAnswer('');
    setCurrentIdx((i) => i + 1);
  };

  const handleRestart = () => {
    setStarted(false);
    setQuestions([]);
    setCurrentIdx(0);
    setCurrentAnswer('');
    setFeedback(null);
  };

  const isFinished = started && currentIdx >= questions.length;

  // 총점 계산
  const scores = (session.interviewPractices ?? [])
    .slice(-questions.length)
    .map((p) => p.score);
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  if (!profile?.isReady) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
        프로필을 먼저 완성해주세요
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/track/career')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
      </div>

      {/* 헤더 */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-5 mb-4">
        <Mic className="w-6 h-6 text-purple-600 mb-2" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">면접 시뮬레이터</h1>
        <p className="text-sm text-gray-600">
          AI 면접관과 연습하면서 답변 실력을 키워요
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* 시작 전 */}
      {!started && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-2">면접 연습을 시작할 준비됐어요?</h2>
          <p className="text-sm text-gray-500 mb-4">
            8개 질문에 답해요. 각 답변에 AI가 점수·피드백을 알려줘요.
          </p>
          {!session.resultStrengths.length && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                자소서 빌더를 먼저 하면 훨씬 더 맞춤형 질문이 나와요.
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleStart}
            disabled={isLoading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                질문을 준비하고 있어요...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                면접 시작
              </>
            )}
          </button>
        </div>
      )}

      {/* 진행 중 */}
      {started && !isFinished && questions[currentIdx] && (
        <div>
          {/* 진행률 */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{questions[currentIdx].category}</span>
              <span>
                {currentIdx + 1} / {questions.length}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-purple-600 font-bold mb-1">면접관</div>
                <p className="text-base text-gray-800 font-medium leading-snug">
                  {questions[currentIdx].text}
                </p>
              </div>
            </div>
          </div>

          {/* 답변 입력 or 피드백 */}
          {!feedback ? (
            <>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="여기에 답변을 입력해주세요. 한국어·모국어·영어 모두 OK."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-2"
              />
              <p className="text-[11px] text-gray-400 mb-4">
                💡 짧아도 괜찮아요. 솔직한 답변이 가장 좋은 답변이에요.
              </p>
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || currentAnswer.trim().length === 0}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    평가 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    답변 제출
                  </>
                )}
              </button>
            </>
          ) : (
            <FeedbackCard feedback={feedback} onNext={handleNext} isLast={currentIdx === questions.length - 1} />
          )}
        </div>
      )}

      {/* 완료 */}
      {isFinished && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">면접 연습 완료!</h2>
          <p className="text-sm text-gray-500 mb-4">
            총 {questions.length}개 질문에 답했어요
          </p>
          <div className="mb-4 p-4 bg-purple-50 rounded-xl">
            <div className="text-xs text-purple-600 mb-1">평균 점수</div>
            <div className="text-3xl font-bold text-purple-700">{avgScore}점</div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            꾸준히 연습하면 실제 면접에서 자연스럽게 답할 수 있어요!
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              다시 연습
            </button>
            <button
              type="button"
              onClick={() => navigate('/track/career')}
              className="py-3 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700"
            >
              학과로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  feedback,
  onNext,
  isLast,
}: {
  feedback: InterviewFeedback;
  onNext: () => void;
  isLast: boolean;
}) {
  const scoreColor =
    feedback.score >= 80
      ? 'text-emerald-600'
      : feedback.score >= 60
      ? 'text-amber-600'
      : 'text-red-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      {/* 점수 */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-800">AI 피드백</div>
        <div className={`text-2xl font-bold ${scoreColor}`}>{feedback.score}점</div>
      </div>

      {/* 총평 */}
      {feedback.overallComment && (
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl">
          {feedback.overallComment}
        </p>
      )}

      {/* 잘한 점 */}
      {feedback.strengths.length > 0 && (
        <div>
          <div className="text-xs font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            잘한 점
          </div>
          <ul className="space-y-1 text-xs text-gray-700">
            {feedback.strengths.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 개선할 점 */}
      {feedback.improvements.length > 0 && (
        <div>
          <div className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            다음엔 이렇게 해봐요
          </div>
          <ul className="space-y-1 text-xs text-gray-700">
            {feedback.improvements.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 모범 답변 */}
      {feedback.suggestedAnswer && (
        <div className="p-3 bg-purple-50 rounded-xl">
          <div className="text-xs font-bold text-purple-700 mb-1.5">💡 모범 답변 예시</div>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {feedback.suggestedAnswer}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
      >
        {isLast ? (
          <>
            <Trophy className="w-4 h-4" />
            결과 보기
          </>
        ) : (
          <>
            다음 질문
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
