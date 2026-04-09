/**
 * AI 시스템 프롬프트 빌더
 *
 * 사용자 프로필(koreanLevel/visaType/yearsInKorea/country 등)을
 * AI 시스템 프롬프트에 자동 주입한다.
 *
 * 모든 커리어·자소서·이력서·면접 도구가 이 함수를 호출해서
 * AI 호출 시 시스템 프롬프트를 일관되게 생성한다.
 *
 * 사용 예:
 *   const profile = useUserProfile();
 *   const systemPrompt = buildSystemPrompt(profile, {
 *     toolName: '자소서 빌더',
 *     toolPurpose: '사용자의 인터뷰 답변을 한국 자소서 4항목으로 변환',
 *     extraInstructions: '항목별로 1~2개 역량 + 1~2개 사례를 반드시 사용하라.',
 *   });
 */

import type { UserProfileView } from './useUserProfile';

export interface PromptContext {
  /** 도구 이름 (예: "자소서 빌더") */
  toolName: string;
  /** 도구 목적 한 줄 설명 */
  toolPurpose: string;
  /** 도구 특화 추가 지시문 */
  extraInstructions?: string;
  /** 출력 언어 제약 */
  outputLanguage?: 'ko' | 'en' | 'auto';
  /** 출력 글자 수 가이드 (자소서 등) */
  outputLength?: number;
  /** 환각 방지 강도 */
  antiHallucination?: 'strict' | 'normal';
}

/** 기본 가드레일 (모든 도구 공통) */
const BASE_GUARDRAILS = [
  '당신은 깍두기학교의 AI 교육 도우미다.',
  '대상 사용자는 한국에 사는 외국인 학습자(노동자·유학생·결혼이민 등)이며, 한국어 수준과 배경이 다양하다.',
  '사용자가 명시적으로 말한 사실·경험 외에는 어떤 정보도 추가·창작·추정하지 말라.',
  '사용자의 비자 번호, 여권 번호, 외국인등록번호 같은 민감 개인정보는 절대 요청하거나 포함하지 말라.',
  '법률·의료·세무 조언이 필요한 경우 "전문가와 상담하세요"라고 안내하라.',
  '사자성어, 관용구, 과도한 수사, 낯선 한자어는 피하라.',
  '정중하고 친근한 톤을 유지하라.',
];

/** 환각 방지 강화 지시문 */
const ANTI_HALLUCINATION_STRICT = [
  '[중요] 사용자가 말하지 않은 내용을 절대 추가하지 말라.',
  '[중요] 구체적인 숫자, 회사명, 연도, 수상 경력 등은 사용자가 명시적으로 말한 것만 사용하라.',
  '[중요] 확신이 없는 내용은 추측 대신 "사용자가 제공한 정보를 바탕으로"라고 명시하거나 생략하라.',
];

/**
 * 사용자 프로필과 컨텍스트로부터 AI 시스템 프롬프트 생성
 */
export function buildSystemPrompt(
  profile: UserProfileView | null,
  context: PromptContext
): string {
  const sections: string[] = [];

  // ─── 1. 도구 소개 ────────────────────────────────────
  sections.push(
    `# ${context.toolName}`,
    '',
    `## 목적`,
    context.toolPurpose,
    '',
  );

  // ─── 2. 기본 가드레일 ────────────────────────────────
  sections.push('## 기본 원칙');
  sections.push(...BASE_GUARDRAILS.map((g) => `- ${g}`));
  sections.push('');

  // ─── 3. 환각 방지 (강도 선택) ─────────────────────────
  if (context.antiHallucination === 'strict') {
    sections.push('## 환각 방지 (엄격 모드)');
    sections.push(...ANTI_HALLUCINATION_STRICT.map((g) => `- ${g}`));
    sections.push('');
  }

  // ─── 4. 사용자 프로필 요약 ────────────────────────────
  if (profile) {
    sections.push('## 사용자 프로필');
    if (profile.country) sections.push(`- 국가: ${profile.country}`);
    if (profile.age) sections.push(`- 연령대: ${profile.age}세 추정`);
    if (profile.gender) sections.push(`- 성별: ${profile.gender}`);
    if (profile.vocabularyGuide) {
      sections.push(`- 한국어 수준: ${profile.vocabularyGuide.label} (${profile.vocabularyGuide.labelEn})`);
    }
    if (profile.yearsStrategy) {
      sections.push(`- 한국 체류 기간: ${profile.yearsStrategy.label}`);
    }
    if (profile.visaStrategy) {
      sections.push(`- 비자: ${profile.visaStrategy.label}`);
    }
    sections.push('');

    // ─── 5. 한국어 수준에 따른 출력 지시 ────────────────
    if (profile.vocabularyGuide) {
      sections.push('## 출력 한국어 수준 (반드시 준수)');
      sections.push(profile.vocabularyGuide.aiInstruction);
      if (profile.vocabularyGuide.forbidden.length > 0) {
        sections.push(
          `금지 어휘 예시: ${profile.vocabularyGuide.forbidden.join(', ')}`
        );
      }
      sections.push('');
    }

    // ─── 6. 체류 기간에 따른 내러티브 ───────────────────
    if (profile.yearsStrategy) {
      sections.push('## 체류 기간 기반 내러티브');
      sections.push(profile.yearsStrategy.aiInstruction);
      sections.push('');
    }

    // ─── 7. 비자별 전략 ────────────────────────────────
    if (profile.visaStrategy) {
      sections.push('## 비자 기반 전략');
      sections.push(profile.visaStrategy.aiInstruction);
      if (profile.visaStrategy.emphasisPoints.length > 0) {
        sections.push(
          `강조할 포인트: ${profile.visaStrategy.emphasisPoints.join('; ')}`
        );
      }
      if (profile.visaStrategy.avoidTopics.length > 0) {
        sections.push(
          `피해야 할 주제: ${profile.visaStrategy.avoidTopics.join('; ')}`
        );
      }
      sections.push('');
    }
  } else {
    sections.push('## 사용자 프로필');
    sections.push('- 프로필 정보가 없습니다. 일반적이고 중립적인 톤을 사용하세요.');
    sections.push('');
  }

  // ─── 8. 출력 형식 ───────────────────────────────────
  if (context.outputLanguage) {
    const langMap = { ko: '한국어', en: '영어', auto: '사용자 답변의 언어와 동일' };
    sections.push(`## 출력 언어: ${langMap[context.outputLanguage]}`);
    sections.push('');
  }

  if (context.outputLength) {
    sections.push(`## 출력 길이: 약 ${context.outputLength}자 (±50자 이내)`);
    sections.push('');
  }

  // ─── 9. 도구 특화 지시문 ────────────────────────────
  if (context.extraInstructions) {
    sections.push('## 이 도구 특화 지시사항');
    sections.push(context.extraInstructions);
    sections.push('');
  }

  // ─── 10. 마무리 안내 ────────────────────────────────
  sections.push('## 마무리');
  sections.push(
    '위 원칙과 프로필을 반드시 준수하여 사용자에게 도움이 되는 응답을 생성하라. ' +
      '사용자가 면접·제출·발표에서 실제로 사용할 수 있는 수준의 결과물이어야 한다.'
  );

  return sections.join('\n');
}
