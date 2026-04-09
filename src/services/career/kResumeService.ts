/**
 * K-이력서 AI 생성 서비스
 *
 * 자소서 빌더 세션의 강점·인터뷰 답변·프로필을 받아서
 * 한국식 이력서(K-Resume)로 변환한다.
 *
 * 핵심: 인터뷰 한 번 → 자소서 + 이력서 두 개 산출 (재인터뷰 금지)
 */

import { generateText } from '../gemini/geminiClient';
import { safeParseJSON } from '../gemini/jsonHelper';
import { buildSystemPrompt } from '../../lib/userProfile/promptBuilder';
import type { UserProfileView } from '../../lib/userProfile/useUserProfile';
import type { StrengthResult } from '../../types/career/strengths';
import type { KResume } from '../../types/career/resume';
import type { InterviewAnswer } from '../../hooks/useResumeBuilderSession';

export async function generateKResume(input: {
  profile: UserProfileView;
  strengths: StrengthResult[];
  interviewAnswers: InterviewAnswer[];
  initialProfile: {
    desiredJob?: string;
    homeCountryJob?: string;
  };
  target?: { company: string; jobTitle: string; industry?: string };
}): Promise<KResume | null> {
  const { profile, strengths, interviewAnswers, initialProfile, target } = input;

  const systemPrompt = buildSystemPrompt(profile, {
    toolName: 'K-이력서 빌더',
    toolPurpose:
      '사용자의 강점·인터뷰 답변·기본 프로필을 한국식 이력서 양식으로 변환한다.',
    extraInstructions: [
      '한국식 이력서는 인적사항 → 자기소개(3~5줄) → 학력 → 경력 → 자격증 순서로 작성된다.',
      '사용자가 말하지 않은 학력/경력/자격증은 절대 만들어내지 말라 (환각 금지).',
      '모국에서의 경력·학력이 있다면 모국 섹션으로, 한국에서의 것은 한국 섹션으로 분리하라.',
      '경력의 "achievements"는 사용자 STAR 인터뷰 답변에서 직접 추출한 성과만 bullet로 사용하라.',
      'TOPIK 등급, 운전면허 등 프로필에 명시된 자격증만 포함하라.',
      '자기소개 요약(summary.body)은 3~5줄, 사용자의 강점 5개와 직무 적합성을 담되 사용자 발언 기반으로만.',
      '출력은 반드시 아래 JSON 스키마:',
      '{ personal: {...}, summary: { body, keywords }, education: [...], career: [...], certifications: [...] }',
    ].join(' '),
    antiHallucination: 'strict',
  });

  const userPrompt = `
# 사용자 기본 정보
- 이름: ${profile.name}
- 국적: ${profile.country ?? '(없음)'}
- 한국어: ${profile.vocabularyGuide.label}
- 체류: ${profile.yearsStrategy.label}
- 비자: ${profile.visaStrategy.label}
- 나이: ${profile.age ?? '미입력'}
- 성별: ${profile.gender ?? '미입력'}

# 모국 경력 (초기 입력)
${initialProfile.homeCountryJob ?? '(미입력)'}

# 희망 직무
${initialProfile.desiredJob ?? target?.jobTitle ?? '(미입력)'}

# 지원 대상 (있으면)
${target ? `- 회사: ${target.company}\n- 직무: ${target.jobTitle}\n- 산업: ${target.industry ?? ''}` : '(미입력)'}

# 확정된 강점 5개
${strengths.map((s) => `- ${s.nameKo}: ${s.description}`).join('\n')}

# STAR 인터뷰 답변
${interviewAnswers
  .map((a) => {
    const star = a.starBreakdown;
    return `
## ${a.questionId}
- 상황: ${star?.situation ?? '(없음)'}
- 과제: ${star?.task ?? '(없음)'}
- 행동: ${star?.action ?? '(없음)'}
- 결과: ${star?.result ?? '(없음)'}
`.trim();
  })
  .join('\n\n')}

# 출력 JSON 형식
{
  "personal": {
    "name": "${profile.name}",
    "country": "${profile.country ?? ''}",
    "visaType": "${profile.visaType ?? ''}",
    "yearsInKorea": "${profile.yearsInKorea ?? ''}",
    "koreanLevel": "${profile.koreanLevel ?? ''}"
  },
  "summary": {
    "body": "3~5줄 자기소개",
    "keywords": ["키워드1", "키워드2", ...]
  },
  "education": [
    { "id": "edu_1", "schoolName": "...", "degree": "...", "country": "home|korea" }
  ],
  "career": [
    {
      "id": "car_1",
      "company": "...",
      "role": "...",
      "country": "home|korea",
      "achievements": ["성과 1", "성과 2"]
    }
  ],
  "certifications": [
    { "id": "cert_1", "name": "TOPIK ${profile.koreanLevel ?? ''}" }
  ]
}

**중요**: 사용자가 답변에 언급하지 않은 회사명, 학교명, 연도는 비워두거나 "미입력"으로 표시하라.
`.trim();

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
  const response = await generateText(fullPrompt);
  if (!response) return null;

  try {
    const parsed = safeParseJSON(response) as Omit<KResume, 'version' | 'generatedAt'>;
    if (!parsed.personal || !parsed.summary) return null;
    return {
      ...parsed,
      version: '1.0',
      generatedAt: new Date().toISOString(),
      targetCompany: target?.company,
      targetJobTitle: target?.jobTitle,
    };
  } catch (e) {
    console.error('[kResumeService] generateKResume parse error:', e);
    return null;
  }
}
