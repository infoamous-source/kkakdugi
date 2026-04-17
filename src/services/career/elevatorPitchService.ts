/**
 * 엘리베이터 피치 서비스
 *
 * 이름·국적·목표 직무·강점을 입력받아 30초 자기소개(~150자)를
 * TOPIK 3-4 수준의 자연스러운 한국어로 생성한다.
 *
 * 구조: 자기소개(이름, 국적) → 강점 1-2개 → 희망 직무 → 마무리 인사
 */

import { generateText } from '../gemini/geminiClient';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export async function generateElevatorPitch(
  input: {
    name: string;
    country: string;
    targetJob: string;
    strengths: string[];
  },
  profile?: UserProfileView | null,
): Promise<string | null> {
  const { name, country, targetJob, strengths } = input;

  const systemPrompt = buildSystemPrompt(profile ?? null, {
    toolName: '엘리베이터 피치 생성기',
    toolPurpose:
      '외국인 구직자가 한국 면접에서 30초 안에 말할 수 있는 자기소개를 생성한다.',
    extraInstructions: [
      'TOPIK 3-4 수준의 한국어를 사용하라. 지나치게 어려운 단어나 문어체는 피하라.',
      '구조를 반드시 지켜라: ① 이름과 국적 소개 → ② 핵심 강점 1-2개 → ③ 희망 직무 언급 → ④ 마무리 인사.',
      '전체 4-5문장, 150자 내외의 평문(plain text)으로만 출력하라.',
      'JSON, 마크다운, 부연 설명 없이 자기소개 본문만 반환하라.',
    ].join(' '),
    antiHallucination: 'strict',
    bilingualFeedback: false,
  });

  const userPrompt = `
# 입력 정보
- 이름: ${name}
- 국적: ${country}
- 희망 직무: ${targetJob}
- 강점: ${strengths.slice(0, 3).join(', ')}

# 요청
위 정보를 바탕으로 30초 자기소개(4-5문장, 150자 내외)를 한국어로 생성해줘.
자기소개 본문만 출력하고 다른 설명은 절대 붙이지 마라.
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);

  if (!response) return null;
  return response.trim();
}
