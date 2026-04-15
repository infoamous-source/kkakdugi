/**
 * 면접 시뮬레이터 서비스
 *
 * 자소서 빌더 세션의 데이터를 활용해 맞춤 면접 질문을 생성하고,
 * 사용자의 답변에 AI 피드백을 제공한다.
 *
 * - 질문 풀: 자소서에서 유래(`generateInterviewQuestions` 재활용) + 범용 질문 풀
 * - 피드백: STAR 구조, 한국어 수준, 비자 전략 적합성, 환각 경계 체크
 */

import { generateText } from '../gemini/geminiClient';
import { safeParseJSON } from '../gemini/jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';
import type { StrengthResult } from '../../types/career/strengths';
import type { ResumeDraft } from '../../hooks/useResumeBuilderSession';

// ─── 범용 면접 질문 풀 (자소서 없을 때 폴백) ──────────

export const GENERIC_INTERVIEW_QUESTIONS: Array<{
  id: string;
  category: string;
  textKo: string;
  textEn: string;
}> = [
  {
    id: 'g_intro',
    category: '자기소개',
    textKo: '간단히 자기소개 부탁드립니다.',
    textEn: 'Please briefly introduce yourself.',
  },
  {
    id: 'g_motivation',
    category: '지원 동기',
    textKo: '저희 회사에 지원하신 이유가 무엇인가요?',
    textEn: 'Why did you apply to our company?',
  },
  {
    id: 'g_strength',
    category: '강점',
    textKo: '본인의 가장 큰 강점 하나만 구체적인 사례로 설명해주세요.',
    textEn: 'Share your strongest point with a specific example.',
  },
  {
    id: 'g_weakness',
    category: '단점',
    textKo: '본인의 단점과 그것을 극복하려는 노력을 알려주세요.',
    textEn: 'Tell me a weakness and how you work on it.',
  },
  {
    id: 'g_teamwork',
    category: '협업',
    textKo: '팀으로 일하면서 갈등이 있었던 경험과 해결 방법을 알려주세요.',
    textEn: 'Share a team conflict and how you resolved it.',
  },
  {
    id: 'g_korea',
    category: '한국 적응',
    textKo: '한국에서 일할 때 가장 어려운 점은 무엇일까요?',
    textEn: 'What would be the hardest part of working in Korea?',
  },
  {
    id: 'g_growth',
    category: '성장',
    textKo: '5년 뒤 본인의 모습은 어떨 것 같아요?',
    textEn: 'What do you see yourself as in 5 years?',
  },
  {
    id: 'g_learn',
    category: '학습',
    textKo: '최근에 새로 배운 것 중에 가장 의미 있었던 것은?',
    textEn: 'What is the most meaningful thing you learned recently?',
  },
];

// ─── 1. 면접 질문 세트 생성 ──────────────────────────

export async function generatePersonalizedQuestions(input: {
  profile: UserProfileView;
  strengths: StrengthResult[];
  resumeDraft?: ResumeDraft;
  target?: { company: string; jobTitle: string };
}): Promise<Array<{ id: string; category: string; text: string }>> {
  const { profile, strengths, resumeDraft, target } = input;

  // 폴백: 범용 질문 풀 중 8개 반환
  const fallback = () =>
    GENERIC_INTERVIEW_QUESTIONS.slice(0, 8).map((q) => ({
      id: q.id,
      category: q.category,
      text: q.textKo,
    }));

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: '면접 시뮬레이터',
    toolPurpose: '사용자 맞춤 면접 질문 8개를 생성한다.',
    extraInstructions: [
      '사용자의 강점, 자소서 내용, 지원 회사·직무를 반영한 질문 8개를 JSON 배열로 반환하라.',
      '질문은 한국 면접관이 실제로 물을 법한 수준이어야 한다.',
      '자기소개, 지원 동기, 강점·단점, 협업, 갈등, 한국 적응, 장기 계획 등을 골고루 다뤄라.',
      '출력 JSON 형식: [{ "id": "q_1", "category": "카테고리", "text": "질문" }, ...]',
    ].join(' '),
    antiHallucination: 'normal',
    bilingualFeedback: false, // 질문 자체는 한국어만 (한국 면접 연습)
  });

  const userPrompt = `
# 사용자 강점
${strengths.map((s) => `- ${s.nameKo}: ${s.description}`).join('\n')}

# 지원 대상
${target ? `- 회사: ${target.company}\n- 직무: ${target.jobTitle}` : '(미입력)'}

# 자소서 요약
${
  resumeDraft
    ? `
- 성장 과정: ${resumeDraft.growth.slice(0, 200)}...
- 성격 장단점: ${resumeDraft.personality.slice(0, 200)}...
- 지원 동기: ${resumeDraft.motivation.slice(0, 200)}...
- 입사 후 포부: ${resumeDraft.aspiration.slice(0, 200)}...
`.trim()
    : '(자소서 미작성 — 기본 질문으로)'
}

# 요청
위 정보를 바탕으로 이 사용자에게 던질 면접 질문 8개를 생성해줘.
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);
  if (!response) return fallback();

  try {
    const parsed = safeParseJSON(response);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback();
    return parsed.slice(0, 8).map((q, i) => ({
      id: q.id ?? `q_${i + 1}`,
      category: q.category ?? '일반',
      text: q.text ?? String(q),
    }));
  } catch {
    return fallback();
  }
}

// ─── 2. 답변 피드백 ──────────────────────────────────

export interface InterviewFeedback {
  score: number; // 0~100
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string; // 모범 답변 예시 (TOPIK 수준에 맞춤)
  overallComment: string;
}

export async function evaluateAnswer(input: {
  profile: UserProfileView;
  question: string;
  answer: string;
}): Promise<InterviewFeedback> {
  const { profile, question, answer } = input;

  const fallback: InterviewFeedback = {
    score: 70,
    strengths: ['답변을 끝까지 했어요'],
    improvements: ['구체적인 사례를 한 가지 더해보세요'],
    overallComment: '잘하고 있어요. 계속 연습해봐요!',
  };

  if (answer.trim().length < 5) {
    return {
      score: 30,
      strengths: [],
      improvements: ['답변이 너무 짧아요. 조금 더 자세히 말해보세요.'],
      overallComment: '답변이 너무 짧아 평가하기 어려워요.',
    };
  }

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: '면접 답변 피드백',
    toolPurpose: '사용자의 면접 답변을 평가하고 개선 방향을 제시한다.',
    extraInstructions: [
      '사용자가 한국에 사는 외국인 학습자임을 염두에 두고 친절하고 격려하는 톤으로 피드백하라.',
      'STAR 구조(상황-과제-행동-결과), 구체성, 진정성을 기준으로 평가하라.',
      '한국어가 완벽하지 않아도 내용이 진실되면 높게 평가하라.',
      '모범 답변은 사용자 TOPIK 수준에 맞춘 현실적인 예시로 제시하라 (과장된 비즈니스 한국어 금지).',
      '출력 JSON 형식:',
      '{ "score": 0~100, "strengths": ["잘한 점"], "improvements": ["개선할 점"], "suggestedAnswer": "모범 답변", "overallComment": "전체 코멘트" }',
    ].join(' '),
    antiHallucination: 'normal',
    bilingualFeedback: true, // 코칭 피드백은 한국어+영어 병기
  });

  const userPrompt = `
# 질문
${question}

# 사용자 답변
${answer}

# 요청
위 답변을 평가해서 JSON으로 피드백을 돌려줘.
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);
  if (!response) return fallback;

  try {
    const parsed = safeParseJSON(response) as InterviewFeedback;
    if (typeof parsed.score !== 'number') return fallback;
    return {
      score: Math.max(0, Math.min(100, parsed.score)),
      strengths: parsed.strengths ?? [],
      improvements: parsed.improvements ?? [],
      suggestedAnswer: parsed.suggestedAnswer,
      overallComment: parsed.overallComment ?? '',
    };
  } catch {
    return fallback;
  }
}
