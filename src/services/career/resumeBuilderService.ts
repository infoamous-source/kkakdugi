/**
 * 자소서 빌더 AI 서비스
 *
 * Gemini를 호출해서 강점 발견, STAR 인터뷰 후속, 자소서 생성 등을 수행한다.
 * Phase B의 buildSystemPrompt()를 활용해 사용자 프로필(TOPIK/비자/체류 기간)을
 * 모든 AI 호출에 자동 주입한다.
 *
 * 핵심 공식 (절대 위반 금지):
 *   자소서 1항목 = 1~2개 역량 + 1~2개 구체 사례
 */

import { generateText } from '../gemini/geminiClient';
import { safeParseJSON } from '../gemini/jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';
import type {
  StrengthResult,
  StarQuestion,
  TraitId,
} from '../../types/career/strengths';
import { STRENGTH_RESULTS } from '../../data/career/strengthResults';
import { getCardById } from '../../data/career/strengthCards';
import { traitsToKoNames } from '../../data/career/traits';
import type { InterviewAnswer, ResumeTarget, ResumeDraft } from '../../hooks/useResumeBuilderSession';

// ─── 1. 강점 도출 (Step 0-E) ────────────────────────

export async function deriveStrengths(input: {
  profile: UserProfileView | null;
  selectedCardIds: string[];
  nickname?: string;
  quizAnswers: {
    workStyle?: 'alone' | 'team';
    praiseType?: 'accurate' | 'fast' | 'kind' | 'creative';
    taskType?: 'routine' | 'new';
  };
}): Promise<StrengthResult[]> {
  const { profile, selectedCardIds, nickname, quizAnswers } = input;

  // 로컬 추천(폴백): AI 실패 시에도 최소 결과 보장
  const localFallback = (): StrengthResult[] => {
    const scored = STRENGTH_RESULTS.map((r) => {
      const match = (r.triggerCardIds ?? []).filter((id) => selectedCardIds.includes(id)).length;
      return { r, score: match };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((s) => s.score > 0).slice(0, 5).map((s) => s.r);
  };

  const cards = selectedCardIds.map((id) => getCardById(id)).filter((c) => !!c);
  if (cards.length === 0) return [];

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: '강점 발견 게임',
    toolPurpose:
      '사용자가 고른 카드와 답변으로부터 자소서에 쓸 수 있는 "강점 5가지"를 도출한다.',
    extraInstructions: [
      '아래 라이브러리 중에서 사용자에게 가장 잘 맞는 결과 5개를 JSON 배열로 반환하라.',
      '라이브러리에 정확히 맞는 것이 없으면, 라이브러리 형식을 따라 새 결과를 만들어도 된다.',
      '각 결과는 반드시 id, nameKo, nameEn, icon, description, coreTraits, preferredQuestionIds 필드를 포함해야 한다.',
      'description은 TOPIK 3-4 사용자가 이해할 수 있는 한 줄 설명.',
    ].join(' '),
    antiHallucination: 'normal',
  });

  const userPrompt = `
# 사용자 입력

## 선택한 카드 6개
${cards.map((c) => `- [${c!.emoji}] ${c!.labelKo} (traits: ${c!.traits.join(', ')})`).join('\n')}

## 별명
${nickname ?? '(없음)'}

## 스타일 퀴즈 답변
- 일하는 스타일: ${quizAnswers.workStyle ?? '(없음)'}
- 받고 싶은 칭찬: ${quizAnswers.praiseType ?? '(없음)'}
- 선호하는 업무: ${quizAnswers.taskType ?? '(없음)'}

## 라이브러리 결과 후보 20개
${STRENGTH_RESULTS.map((r) => `- ${r.id}: ${r.nameKo} — ${r.description} (coreTraits: ${r.coreTraits.join(', ')})`).join('\n')}

# 요청
위 입력을 기반으로 사용자에게 가장 잘 맞는 강점 5개를 JSON 배열로 반환하라.
형식 예시:
[
  {
    "id": "persistent_learner",
    "nameKo": "끈기 있는 학습자",
    "nameEn": "Persistent Learner",
    "icon": "🪨",
    "description": "한 번 시작한 일은 포기하지 않고 끝까지 배우는 사람이에요",
    "coreTraits": ["persistence", "learning_ability", "patience"],
    "preferredQuestionIds": ["star_persistence", "star_new_challenge"]
  }
]
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);

  if (!response) return localFallback();

  try {
    const parsed = safeParseJSON(response) as StrengthResult[];
    if (!Array.isArray(parsed) || parsed.length === 0) return localFallback();
    return parsed.slice(0, 5);
  } catch {
    return localFallback();
  }
}

// ─── 2. STAR 후속 질문 생성 (Phase D) ────────────────

export async function generateFollowUpQuestion(input: {
  profile: UserProfileView | null;
  question: StarQuestion;
  /** 사용자의 이전 답변들 (점진 누적) */
  previousAnswers: { label: string; text: string }[];
  /** 어느 STAR 단계(situation/task/action/result)를 물을지 */
  starStage: 'situation' | 'task' | 'action' | 'result';
}): Promise<string> {
  const { profile, question, previousAnswers, starStage } = input;

  // 기본 폴백: 라이브러리 후속 질문 그대로 반환
  const fallback = question.followUps[starStage].ko;

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: 'STAR 인터뷰 챗봇',
    toolPurpose: '사용자가 답한 내용을 바탕으로 STAR 단계별 후속 질문을 부드럽게 던진다.',
    extraInstructions: [
      '사용자가 방금 답한 내용을 받아, 자연스럽게 이어지는 한 문장 후속 질문만 반환하라.',
      '질문만 출력하고 설명이나 서론은 덧붙이지 말라.',
      '친근하고 격려하는 톤을 유지하라.',
      '사용자가 답하기 쉽도록 예시를 한 가지 포함해도 좋다.',
    ].join(' '),
    antiHallucination: 'normal',
  });

  const userPrompt = `
# 질문 컨텍스트
- 메인 질문: ${question.mainQuestionKo}
- 지금 물어볼 STAR 단계: ${starStage}
- 라이브러리 기본 질문: ${fallback}

# 사용자 이전 답변
${previousAnswers.map((a) => `- [${a.label}] ${a.text}`).join('\n') || '(아직 없음)'}

# 요청
사용자의 답변에 자연스럽게 이어지는 ${starStage} 단계 후속 질문을 한 문장으로 만들어줘.
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);

  if (!response) return fallback;
  return response.trim().split('\n')[0] || fallback;
}

// ─── 3. 자소서 생성 (Phase E) ────────────────────────

export async function generateResume(input: {
  profile: UserProfileView | null;
  acceptedStrengths: StrengthResult[];
  interviewAnswers: InterviewAnswer[];
  target: ResumeTarget;
  /** 선택된 역량 배분 (selectTraitsForResume 결과) */
  traitsByItem: TraitId[][];
}): Promise<ResumeDraft | null> {
  const { profile, acceptedStrengths, interviewAnswers, target, traitsByItem } = input;

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: '자소서 생성 엔진',
    toolPurpose:
      '사용자의 강점과 STAR 인터뷰 답변을 한국 자소서 4항목으로 재구성한다.',
    extraInstructions: [
      '**핵심 공식 (절대 위반 금지)**: 4개 항목 각각에 1~2개 역량(trait) + 1~2개 구체 사례를 반드시 사용하라.',
      '각 항목은 다른 사례를 우선 사용하되, 필요 시 같은 사례를 다른 각도로 재활용할 수 있다.',
      '사용자가 말하지 않은 내용은 절대 추가·창작하지 말라 (환각 금지).',
      '구체적인 숫자, 회사명, 연도는 사용자가 명시적으로 말한 것만 사용하라.',
      '각 항목 마지막에 어느 trait·어느 답변에서 나왔는지 메타데이터를 함께 출력하라.',
      '지원 동기와 입사 후 포부는 사용자가 입력한 회사·직무 정보를 반드시 반영하라.',
      '출력은 반드시 JSON 형식: { growth, personality, motivation, aspiration, sources }',
    ].join(' '),
    antiHallucination: 'strict',
    outputLength: target.wordLimits?.growth ?? 800,
  });

  const userPrompt = `
# 자소서 작성 요청

## 지원 대상
- 회사: ${target.company}
- 직무: ${target.jobTitle}
- 산업: ${target.industry ?? '(미입력)'}

## 항목별 글자 수
- 성장 과정: ${target.wordLimits?.growth ?? 800}자
- 성격 장단점: ${target.wordLimits?.personality ?? 500}자
- 지원 동기: ${target.wordLimits?.motivation ?? 800}자
- 입사 후 포부: ${target.wordLimits?.aspiration ?? 500}자

## 사용자가 인정한 강점 카드
${acceptedStrengths.map((s) => `- [${s.icon}] ${s.nameKo}: ${s.description} (coreTraits: ${s.coreTraits.join(', ')})`).join('\n')}

## 항목별 사용할 역량 (selectTraitsForResume 결과)
- 성장 과정: ${traitsByItem[0] ? traitsToKoNames(traitsByItem[0]).join(', ') : '(없음)'}
- 성격 장단점: ${traitsByItem[1] ? traitsToKoNames(traitsByItem[1]).join(', ') : '(없음)'}
- 지원 동기: ${traitsByItem[2] ? traitsToKoNames(traitsByItem[2]).join(', ') : '(없음)'}
- 입사 후 포부: ${traitsByItem[3] ? traitsToKoNames(traitsByItem[3]).join(', ') : '(없음)'}

## 사용자 STAR 인터뷰 답변
${interviewAnswers
  .map((a) => {
    const star = a.starBreakdown;
    return `
### 질문 ID: ${a.questionId}
- 상황: ${star?.situation ?? '(없음)'}
- 과제: ${star?.task ?? '(없음)'}
- 행동: ${star?.action ?? '(없음)'}
- 결과: ${star?.result ?? '(없음)'}
`.trim();
  })
  .join('\n\n')}

# 출력 형식
반드시 아래 JSON 형식으로만 출력:
{
  "growth": "성장 과정 본문 (글자 수 준수)",
  "personality": "성격 장단점 본문",
  "motivation": "지원 동기 본문",
  "aspiration": "입사 후 포부 본문",
  "sources": {
    "growth": { "traitIds": [...], "interviewQuestionIds": [...] },
    "personality": { "traitIds": [...], "interviewQuestionIds": [...] },
    "motivation": { "traitIds": [...], "interviewQuestionIds": [...] },
    "aspiration": { "traitIds": [...], "interviewQuestionIds": [...] }
  }
}
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);

  if (!response) return null;

  try {
    const parsed = safeParseJSON(response) as Omit<ResumeDraft, 'generatedAt'>;
    if (!parsed.growth || !parsed.personality) return null;
    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error('[resumeBuilderService] generateResume parse error:', e);
    return null;
  }
}

// ─── 4. 면접 예상 질문 생성 (bonus) ─────────────────

export async function generateInterviewQuestions(input: {
  profile: UserProfileView | null;
  resumeDraft: ResumeDraft;
  target: ResumeTarget;
}): Promise<string[]> {
  const { profile, resumeDraft, target } = input;

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: '면접 예상 질문 생성기',
    toolPurpose: '사용자의 자소서와 지원 정보를 바탕으로 면접에서 나올 질문 5개를 예측한다.',
    extraInstructions: [
      '질문은 5개, 한국어, 면접관이 실제로 물을 법한 수준.',
      '각 질문은 사용자가 자소서에 쓴 내용과 직접 연결되어야 한다.',
      '출력은 JSON 배열: ["질문 1", "질문 2", ...]',
    ].join(' '),
    antiHallucination: 'normal',
  });

  const userPrompt = `
## 지원 회사·직무
- 회사: ${target.company}
- 직무: ${target.jobTitle}

## 자소서 본문
### 성장 과정
${resumeDraft.growth}

### 성격 장단점
${resumeDraft.personality}

### 지원 동기
${resumeDraft.motivation}

### 입사 후 포부
${resumeDraft.aspiration}

# 요청
면접관이 이 자소서를 보고 물어볼 질문 5개를 JSON 배열로 생성하라.
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);
  if (!response) return [];

  try {
    const parsed = safeParseJSON(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
