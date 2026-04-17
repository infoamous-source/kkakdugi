/**
 * 비즈니스 이메일 생성 서비스
 *
 * 상황·수신자 직급·세부 내용·발신자 이름을 받아
 * 한국 직장 문화에 맞는 공식 이메일(제목 + 본문)을 생성한다.
 *
 * 구조: 인사 → 본문 → 마무리 인사 → 서명
 * 출력: { subject, body }
 */

import { generateText } from '../gemini/geminiClient';
import { safeParseJSON } from '../gemini/jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';

export async function generateBusinessEmail(
  input: {
    situation: string;
    recipientTitle: string;
    details: string;
    senderName: string;
  },
  profile?: UserProfileView | null,
): Promise<{ subject: string; body: string } | null> {
  const { situation, recipientTitle, details, senderName } = input;

  const systemPrompt = buildSystemPrompt(profile ?? null, {
    toolName: '비즈니스 이메일 생성기',
    toolPurpose:
      '외국인 구직자·직장인이 한국 직장에서 사용할 공식 이메일을 작성한다.',
    extraInstructions: [
      '반드시 존댓말(합쇼체)을 사용하라.',
      '이메일 구조를 지켜라: ① 첫인사 → ② 본문 → ③ 마무리 인사 → ④ 서명.',
      '한국 직장 관습에 맞는 정중하고 간결한 톤을 유지하라.',
      '출력은 반드시 JSON 형식: { "subject": "이메일 제목", "body": "이메일 본문" }',
      'JSON 외 다른 텍스트는 절대 출력하지 마라.',
    ].join(' '),
    antiHallucination: 'normal',
    bilingualFeedback: false,
  });

  const userPrompt = `
# 이메일 작성 요청
- 상황: ${situation}
- 수신자 직급/호칭: ${recipientTitle}
- 세부 내용: ${details}
- 발신자 이름: ${senderName}

# 요청
위 정보를 바탕으로 한국 비즈니스 이메일을 작성해서 JSON으로 반환해줘.
형식: { "subject": "제목", "body": "본문" }
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);

  if (!response) return null;

  try {
    const parsed = safeParseJSON(response) as { subject: string; body: string };
    if (!parsed.subject || !parsed.body) return null;
    return {
      subject: parsed.subject.trim(),
      body: parsed.body.trim(),
    };
  } catch (e) {
    console.error('[businessEmailService] parse error:', e);
    return null;
  }
}
