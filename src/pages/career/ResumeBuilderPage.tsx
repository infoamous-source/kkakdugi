import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../lib/userProfile';
import {
  useResumeBuilderSession,
  type BuilderStep,
} from '../../hooks/useResumeBuilderSession';
import { runStrengthPipeline } from '../../data/career/strengthMapping';
import {
  deriveStrengths,
  generateResume,
  generateInterviewQuestions,
} from '../../services/career/resumeBuilderService';
import { selectTraitsForResume } from '../../data/career/strengthMapping';

import InitialProfileStep from './steps/InitialProfileStep';
import CardPickingStep from './steps/CardPickingStep';
import NicknameStep from './steps/NicknameStep';
import QuizStep from './steps/QuizStep';
import ResultRevealStep from './steps/ResultRevealStep';
import InterviewStep from './steps/InterviewStep';
import ResumeTargetStep from './steps/ResumeTargetStep';
import ResumeResultStep from './steps/ResumeResultStep';

/**
 * 커리어학과 자소서 빌더 — 메인 오케스트레이터
 *
 * 0단계: 강점 발견 게임 (5 하위 스텝)
 * 1단계: STAR 인터뷰
 * 3단계: 자소서 타깃 입력
 * 4단계: 자소서 결과 (PDF/복사/공유)
 *
 * 모든 상태는 useResumeBuilderSession으로 자동 저장·복원된다.
 */
export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
  const { session, updateSession, goToStep, resetStrengthDiscovery, resetAll } =
    useResumeBuilderSession(user?.id);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로필 준비 확인
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center text-gray-500">
        로그인이 필요해요 (Login required)
      </div>
    );
  }
  if (!profile.isReady) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center text-gray-500">
        프로필을 먼저 완성해주세요 (Please complete your profile first)
      </div>
    );
  }

  const { currentStep } = session;

  // ─── 스텝별 핸들러 ─────────────────────────────

  const handleInitialProfileComplete = useCallback(
    (data: { desiredJob?: string; homeCountryJob?: string }) => {
      updateSession({
        initialProfile: data,
        currentStep: 'card_picking',
      });
    },
    [updateSession],
  );

  const handleCardPickingComplete = useCallback(
    (cardIds: string[]) => {
      updateSession({ selectedCardIds: cardIds, currentStep: 'nickname' });
    },
    [updateSession],
  );

  const handleNicknameComplete = useCallback(
    (nickname: string | undefined) => {
      updateSession({ nickname, currentStep: 'quiz' });
    },
    [updateSession],
  );

  const handleQuizComplete = useCallback(
    async (
      answers: {
        workStyle?: 'alone' | 'team';
        praiseType?: 'accurate' | 'fast' | 'kind' | 'creative';
        taskType?: 'routine' | 'new';
      },
    ) => {
      updateSession({ quizAnswers: answers });
      setIsProcessing(true);
      setError(null);

      try {
        const strengths = await deriveStrengths({
          profile,
          selectedCardIds: session.selectedCardIds,
          nickname: session.nickname,
          quizAnswers: answers,
        });

        if (strengths.length === 0) {
          // AI 실패 → 로컬 파이프라인 폴백
          const pipeline = runStrengthPipeline({
            selectedCardIds: session.selectedCardIds,
            allowKoreaSpecific:
              profile.yearsStrategy.starQuestionFilter.allowKoreaSpecific,
          });
          updateSession({
            resultStrengths: pipeline.recommendedResults,
            currentStep: 'reveal',
          });
        } else {
          updateSession({ resultStrengths: strengths, currentStep: 'reveal' });
        }
      } catch (e) {
        console.error('[ResumeBuilder] deriveStrengths error:', e);
        setError('강점을 찾는 중 문제가 생겼어요. 다시 시도해주세요.');
      } finally {
        setIsProcessing(false);
      }
    },
    [profile, session.selectedCardIds, session.nickname, updateSession],
  );

  const handleResultRevealComplete = useCallback(
    (acceptedIds: string[]) => {
      const rejected = session.resultStrengths
        .filter((r) => !acceptedIds.includes(r.id))
        .map((r) => r.id);

      // STAR 질문 추천 (맞춤 필터)
      const pipeline = runStrengthPipeline({
        selectedCardIds: session.selectedCardIds,
        allowKoreaSpecific: profile.yearsStrategy.starQuestionFilter.allowKoreaSpecific,
      });

      updateSession({
        rejectedResultIds: rejected,
        selectedQuestionIds: pipeline.starQuestions.map((q) => q.id),
        currentStep: 'interview',
      });
    },
    [profile, session.resultStrengths, session.selectedCardIds, updateSession],
  );

  const handleInterviewComplete = useCallback(() => {
    updateSession({ currentStep: 'resume_target' });
  }, [updateSession]);

  const handleResumeTargetComplete = useCallback(
    async (target: {
      company: string;
      jobTitle: string;
      industry?: string;
      wordLimits?: {
        growth?: number;
        personality?: number;
        motivation?: number;
        aspiration?: number;
      };
    }) => {
      updateSession({ resumeTarget: target });
      setIsProcessing(true);
      setError(null);

      try {
        const acceptedStrengths = session.resultStrengths.filter(
          (r) => !session.rejectedResultIds.includes(r.id),
        );
        const traitsByItem = selectTraitsForResume({
          selectedCardIds: session.selectedCardIds,
          acceptedResultIds: acceptedStrengths.map((r) => r.id),
          itemCount: 4,
        });

        const draft = await generateResume({
          profile,
          acceptedStrengths,
          interviewAnswers: session.interviewAnswers,
          target,
          traitsByItem,
        });

        if (!draft) {
          setError('자소서 생성에 실패했어요. 다시 시도해주세요.');
          setIsProcessing(false);
          return;
        }

        updateSession({
          resumeDrafts: [...session.resumeDrafts, draft],
          currentStep: 'resume_result',
        });
      } catch (e) {
        console.error('[ResumeBuilder] generateResume error:', e);
        setError('자소서 생성 중 오류가 발생했어요.');
      } finally {
        setIsProcessing(false);
      }
    },
    [
      profile,
      session.resultStrengths,
      session.rejectedResultIds,
      session.interviewAnswers,
      session.selectedCardIds,
      session.resumeDrafts,
      updateSession,
    ],
  );

  // ─── 렌더링 ────────────────────────────────────

  const stepOrder: BuilderStep[] = [
    'initial_profile',
    'card_picking',
    'nickname',
    'quiz',
    'reveal',
    'interview',
    'resume_target',
    'resume_result',
  ];
  const stepIndex = stepOrder.indexOf(currentStep);
  const stepLabels: Record<BuilderStep, string> = {
    initial_profile: '1. 나에 대해',
    card_picking: '2. 카드 고르기',
    nickname: '3. 별명',
    quiz: '4. 퀴즈',
    reveal: '5. 강점 공개',
    interview: '6. 이야기 인터뷰',
    resume_target: '7. 자소서 준비',
    resume_result: '8. 자소서 완성',
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('강점 찾기를 다시 할까요? 지금까지 고른 카드가 사라져요.')) {
                resetStrengthDiscovery();
              }
            }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-kk-red px-2 py-1 rounded-lg border border-gray-200"
            title="강점 다시 찾기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            강점 다시 찾기
          </button>
          <button
            onClick={() => {
              if (confirm('처음부터 다시 시작할까요? 모든 입력이 사라져요.')) {
                resetAll();
              }
            }}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1"
          >
            전체 초기화
          </button>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{stepLabels[currentStep]}</span>
          <span>
            {stepIndex + 1} / {stepOrder.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${((stepIndex + 1) / stepOrder.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* 로딩 오버레이 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-3 shadow-xl">
            <Loader2 className="w-5 h-5 animate-spin text-kk-red" />
            <span className="text-sm text-gray-700">잠시만 기다려주세요...</span>
          </div>
        </div>
      )}

      {/* 스텝 렌더링 */}
      {currentStep === 'initial_profile' && (
        <InitialProfileStep
          initial={session.initialProfile}
          onComplete={handleInitialProfileComplete}
        />
      )}
      {currentStep === 'card_picking' && (
        <CardPickingStep
          initialSelected={session.selectedCardIds}
          onComplete={handleCardPickingComplete}
        />
      )}
      {currentStep === 'nickname' && (
        <NicknameStep
          initial={session.nickname}
          onComplete={handleNicknameComplete}
          onBack={() => goToStep('card_picking')}
        />
      )}
      {currentStep === 'quiz' && (
        <QuizStep
          initial={session.quizAnswers}
          onComplete={handleQuizComplete}
          onBack={() => goToStep('nickname')}
        />
      )}
      {currentStep === 'reveal' && (
        <ResultRevealStep
          strengths={session.resultStrengths}
          initialRejected={session.rejectedResultIds}
          onComplete={handleResultRevealComplete}
          onRedo={resetStrengthDiscovery}
        />
      )}
      {currentStep === 'interview' && (
        <InterviewStep
          profile={profile}
          selectedQuestionIds={session.selectedQuestionIds}
          answers={session.interviewAnswers}
          onAnswersChange={(answers) => updateSession({ interviewAnswers: answers })}
          onComplete={handleInterviewComplete}
          onBack={() => goToStep('reveal')}
        />
      )}
      {currentStep === 'resume_target' && (
        <ResumeTargetStep
          initial={session.resumeTarget}
          desiredJobFromProfile={session.initialProfile.desiredJob}
          onComplete={handleResumeTargetComplete}
          onBack={() => goToStep('interview')}
        />
      )}
      {currentStep === 'resume_result' && session.resumeDrafts.length > 0 && (
        <ResumeResultStep
          drafts={session.resumeDrafts}
          strengths={session.resultStrengths.filter(
            (r) => !session.rejectedResultIds.includes(r.id),
          )}
          target={session.resumeTarget!}
          profile={profile}
          onRegenerate={() => handleResumeTargetComplete(session.resumeTarget!)}
          onBack={() => goToStep('resume_target')}
          onLoadInterviewQuestions={async (draft) => {
            return generateInterviewQuestions({
              profile,
              resumeDraft: draft,
              target: session.resumeTarget!,
            });
          }}
        />
      )}
    </div>
  );
}
