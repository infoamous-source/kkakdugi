/**
 * 존댓말 평가 서비스
 *
 * 학생이 입력한 존댓말 변환 답안을 AI가 채점하고,
 * 교정 버전과 간단한 설명을 반환한다.
 *
 * 출력: { score: 0-100, corrected: string, explanation: string }
 */

import { generateText } from '../gemini/geminiClient';
import { safeParseJSON } from '../gemini/jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export interface HonorificEvaluation {
  score: number;
  corrected: string;
  explanation: string;
}

export async function evaluateHonorific(
  input: {
    casual: string;
    studentAnswer: string;
    correctAnswer: string;
  },
  profile?: UserProfileView | null,
): Promise<HonorificEvaluation | null> {
  const { casual, studentAnswer, correctAnswer } = input;

  const fallback: HonorificEvaluation = {
    score: 0,
    corrected: correctAnswer,
    explanation: '정답을 확인해 주세요.',
  };

  const systemPrompt = buildSystemPrompt(profile ?? null, {
    toolName: '존댓말 평가기',
    toolPurpose:
      '학생이 반말을 존댓말로 바꾼 답안을 채점하고 교정과 설명을 제공한다.',
    extraInstructions: [
      '학생 답안이 의미·어미 모두 맞으면 100점, 어미만 틀리면 70점대, 의미도 다르면 50점 이하로 채점하라.',
      '교정 버전(corrected)은 가장 자연스러운 존댓말(합쇼체)로 작성하라.',
      '설명(explanation)은 TOPIK 3-4 학습자가 이해할 수 있는 짧고 친절한 한국어로 한 문장 이내로 작성하라.',
      '출력은 반드시 JSON 형식: { "score": 0~100, "corrected": "교정 문장", "explanation": "설명" }',
      'JSON 외 다른 텍스트는 절대 출력하지 마라.',
    ].join(' '),
    antiHallucination: 'strict',
    bilingualFeedback: false,
  });

  const userPrompt = `
# 존댓말 변환 채점
- 원문(반말): ${casual}
- 학생 답안: ${studentAnswer}
- 모범 답안: ${correctAnswer}

# 요청
학생 답안을 채점하고 교정·설명을 JSON으로 반환해줘.
형식: { "score": 점수(0-100), "corrected": "가장 자연스러운 존댓말", "explanation": "한 문장 설명" }
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);

  if (!response) return fallback;

  try {
    const parsed = safeParseJSON(response) as HonorificEvaluation;
    if (typeof parsed.score !== 'number' || !parsed.corrected || !parsed.explanation) {
      return fallback;
    }
    return {
      score: Math.max(0, Math.min(100, parsed.score)),
      corrected: parsed.corrected.trim(),
      explanation: parsed.explanation.trim(),
    };
  } catch (e) {
    console.error('[honorificService] parse error:', e);
    return fallback;
  }
}
