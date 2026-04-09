/**
 * TOPIK 어휘 난이도 가이드
 *
 * 가입 폼 v6에서 수집한 korean_level을 AI 출력 한국어 수준 제어에 활용한다.
 * 자소서 빌더, K-이력서, 면접 시뮬레이터 등 모든 AI 도구가 이 가이드를 공통 사용.
 *
 * 원칙: 사용자가 면접에서 스스로 설명할 수 있는 수준의 한국어로만 AI가 출력해야 한다.
 * 너무 멋진 한국어로 자소서가 나오면 면접에서 본인이 그 단어를 못 읽는 재앙이 발생.
 */

import type { KoreanLevel } from '../../types/database';

export interface VocabularyGuide {
  level: KoreanLevel;
  label: string;
  labelEn: string;
  /** 한자어 허용 비율 (0~1). 낮을수록 순우리말 위주 */
  maxHanjaRatio: number;
  /** 문장당 최대 어절 수 */
  maxSentenceWords: number;
  /** 사용 금지 어휘 예시 (AI 출력 필터링 힌트) */
  forbidden: string[];
  /** 권장 어휘 예시 */
  preferred: string[];
  /** 기본 문체: '친근' or '정중' */
  tone: 'casual' | 'formal';
  /** 이 도구 자체를 권장하지 않는 수준인지 (TOPIK 0-2) */
  tooLowToUseTool: boolean;
  /** AI 시스템 프롬프트에 직접 주입되는 지시문 */
  aiInstruction: string;
}

const TOPIK_GUIDES: Record<KoreanLevel, VocabularyGuide> = {
  topik0: {
    level: 'topik0',
    label: 'TOPIK 0 (한국어 없음)',
    labelEn: 'No Korean',
    maxHanjaRatio: 0.1,
    maxSentenceWords: 8,
    forbidden: ['역량', '도모', '이행', '함양', '기여', '제고', '심화', '수반', '귀사', '본인은'],
    preferred: ['잘하는 것', '하다', '키우다', '돕다', '이 회사', '저는'],
    tone: 'casual',
    tooLowToUseTool: true,
    aiInstruction: [
      '사용자는 한국어를 거의 할 줄 모른다.',
      '한국어 출력이 필요하면 TOPIK 1 수준의 가장 쉬운 단어만 사용하라.',
      '가능하면 모국어 또는 영어 번역을 함께 제공하라.',
      '한자어는 절대 사용하지 말 것. 순우리말만 써라.',
      '한 문장은 8어절 이내로 짧게 끊어라.',
    ].join(' '),
  },
  topik1: {
    level: 'topik1',
    label: 'TOPIK 1 (초급)',
    labelEn: 'TOPIK 1 (Beginner)',
    maxHanjaRatio: 0.15,
    maxSentenceWords: 10,
    forbidden: ['역량', '도모', '이행', '함양', '기여', '제고', '수반', '귀사', '소인', '임하다'],
    preferred: ['잘하는 것', '하다', '키우다', '돕다', '이 회사', '저는', '노력하다'],
    tone: 'formal',
    tooLowToUseTool: true,
    aiInstruction: [
      '사용자의 한국어는 TOPIK 1 초급 수준이다.',
      '가장 기본적이고 쉬운 한국어 단어만 사용하라.',
      '한자어 동사(~하다 계열)는 최대한 피하고, 순우리말 동사를 우선 사용하라.',
      '한 문장은 10어절 이내로 끊어라.',
      '사자성어, 관용구, 한자성어는 절대 사용 금지.',
      '존댓말은 "~해요/~이에요/~입니다" 수준만 사용.',
    ].join(' '),
  },
  topik2: {
    level: 'topik2',
    label: 'TOPIK 2 (초급 상)',
    labelEn: 'TOPIK 2 (Upper Beginner)',
    maxHanjaRatio: 0.2,
    maxSentenceWords: 12,
    forbidden: ['역량', '도모', '이행', '함양', '제고', '수반', '귀사', '임하다', '일가견', '도약'],
    preferred: ['잘하는 것', '하다', '키우다', '이 회사', '저는', '노력하다', '배우다'],
    tone: 'formal',
    tooLowToUseTool: true,
    aiInstruction: [
      '사용자의 한국어는 TOPIK 2 초급 상 수준이다.',
      '쉬운 한국어 단어와 짧은 문장을 사용하라.',
      '한자어는 30% 이하로 유지하고, 어려운 비즈니스 용어는 피하라.',
      '한 문장은 12어절 이내.',
      '사자성어 사용 금지.',
      '존댓말 "~해요/~입니다" 일관 사용.',
    ].join(' '),
  },
  topik3: {
    level: 'topik3',
    label: 'TOPIK 3 (중급)',
    labelEn: 'TOPIK 3 (Intermediate)',
    maxHanjaRatio: 0.35,
    maxSentenceWords: 15,
    forbidden: ['도모', '함양', '제고', '수반', '귀사', '임하다', '일가견', '도약', '심기일전', '괄목상대'],
    preferred: ['키우다', '노력하다', '배우다', '성장하다', '이 회사', '저는', '책임감 있게'],
    tone: 'formal',
    tooLowToUseTool: false,
    aiInstruction: [
      '사용자의 한국어는 TOPIK 3 중급 수준이다.',
      '일상적인 비즈니스 한국어는 사용 가능하나, 어려운 한자어·사자성어·고급 관용구는 피하라.',
      '한 문장은 15어절 이내로 유지하라.',
      '한자어 비율은 35% 이하로 제한한다.',
      '존댓말 "~합니다/~입니다" 일관 사용.',
      '자소서에 사용자가 면접에서 설명 가능한 수준의 어휘만 써라. 화려한 표현 금지.',
      '모르는 단어가 없도록 친숙한 표현을 우선 선택하라.',
    ].join(' '),
  },
  topik4: {
    level: 'topik4',
    label: 'TOPIK 4 (중급 상)',
    labelEn: 'TOPIK 4 (Upper Intermediate)',
    maxHanjaRatio: 0.5,
    maxSentenceWords: 20,
    forbidden: ['함양', '제고', '수반', '귀사', '임하다', '괄목상대', '심기일전', '일취월장'],
    preferred: ['성장하다', '노력하다', '배우다', '책임감', '협업', '소통', '경험'],
    tone: 'formal',
    tooLowToUseTool: false,
    aiInstruction: [
      '사용자의 한국어는 TOPIK 4 중급 상 수준이다.',
      '일반적인 한국 자소서 문체 사용 가능. 단, 지나치게 화려한 한자어나 사자성어는 피하라.',
      '한 문장은 20어절 이내로 유지하라.',
      '한자어 비율 50% 이하.',
      '자소서는 정중하고 단정한 "~합니다/~입니다" 문체를 사용하라.',
      '비즈니스 용어는 사용 가능하나, 사용자가 면접에서 설명할 수 있는 수준이어야 한다.',
    ].join(' '),
  },
  topik5: {
    level: 'topik5',
    label: 'TOPIK 5 (고급)',
    labelEn: 'TOPIK 5 (Advanced)',
    maxHanjaRatio: 0.7,
    maxSentenceWords: 25,
    forbidden: [],
    preferred: ['주도적으로', '전문성', '협업', '성장', '기여', '책임감'],
    tone: 'formal',
    tooLowToUseTool: false,
    aiInstruction: [
      '사용자의 한국어는 TOPIK 5 고급 수준이다.',
      '일반적인 한국 자소서·이력서 문체를 자연스럽게 사용할 수 있다.',
      '비즈니스 한국어와 한자어 사용에 제약이 거의 없다.',
      '문장 길이도 일반 자소서 수준으로 자유롭게.',
      '단, 지나친 사자성어나 과도한 수사는 피하고 명확한 표현을 우선하라.',
    ].join(' '),
  },
  topik6: {
    level: 'topik6',
    label: 'TOPIK 6 (최고급)',
    labelEn: 'TOPIK 6 (Proficient)',
    maxHanjaRatio: 0.8,
    maxSentenceWords: 30,
    forbidden: [],
    preferred: [],
    tone: 'formal',
    tooLowToUseTool: false,
    aiInstruction: [
      '사용자는 한국어 원어민 수준(TOPIK 6)이다.',
      '일반 한국인 대상 자소서 문체를 자유롭게 사용하라.',
      '고급 어휘·사자성어·관용구 모두 허용된다. 단, 과도한 수사는 피하라.',
    ].join(' '),
  },
};

/** 한국어 수준에 맞는 어휘 가이드 조회. null이면 기본값(topik3) 사용. */
export function getVocabularyGuide(level: KoreanLevel | null | undefined): VocabularyGuide {
  if (!level) return TOPIK_GUIDES.topik3;
  return TOPIK_GUIDES[level] ?? TOPIK_GUIDES.topik3;
}

/** 이 TOPIK 수준에서 한국 자소서 도구 사용을 권장하는지 */
export function shouldRecommendTool(level: KoreanLevel | null | undefined): boolean {
  return !getVocabularyGuide(level).tooLowToUseTool;
}
