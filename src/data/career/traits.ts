/**
 * 역량(Trait) 라이브러리
 *
 * 자소서 빌더가 "1~2개 역량 + 1~2개 사례" 공식으로 자소서를 만들 때
 * 사용하는 역량 키워드 풀.
 *
 * 각 trait는 TOPIK 3-4 친화적인 한국어 설명과 함께 정의된다.
 * 자소서 본문에는 이 description이 자연스러운 문장으로 녹아들어간다.
 */

import type { Trait } from '../../types/career/strengths';

export const TRAITS: Record<string, Trait> = {
  // ─── people ───────────────────────────────
  listening: {
    id: 'listening',
    ko: '경청',
    en: 'Active Listening',
    description: '상대방의 말을 끝까지 듣고 이해하려는 자세를 가지고 있어요',
    category: 'people',
  },
  empathy: {
    id: 'empathy',
    ko: '공감력',
    en: 'Empathy',
    description: '다른 사람의 감정을 이해하고 함께 느낄 수 있어요',
    category: 'people',
  },
  friendliness: {
    id: 'friendliness',
    ko: '친화력',
    en: 'Approachability',
    description: '처음 만난 사람과도 편하게 대화하고 가까워질 수 있어요',
    category: 'people',
  },
  sociability: {
    id: 'sociability',
    ko: '사교성',
    en: 'Sociability',
    description: '여러 사람과 잘 어울리고 좋은 관계를 만들어요',
    category: 'people',
  },
  mediation: {
    id: 'mediation',
    ko: '갈등 조정',
    en: 'Conflict Mediation',
    description: '의견이 다를 때 중간에서 잘 이야기를 나누게 해요',
    category: 'people',
  },
  collaboration: {
    id: 'collaboration',
    ko: '협업',
    en: 'Teamwork',
    description: '여러 사람이 같이 일할 때 제 역할을 잘 해내요',
    category: 'people',
  },
  mentorship: {
    id: 'mentorship',
    ko: '가르치는 힘',
    en: 'Mentorship',
    description: '아는 것을 다른 사람에게 쉽게 설명하고 알려줘요',
    category: 'people',
  },
  communication: {
    id: 'communication',
    ko: '의사소통',
    en: 'Communication',
    description: '제 생각을 상대방이 알기 쉽게 전달할 수 있어요',
    category: 'people',
  },

  // ─── work ─────────────────────────────────
  planning: {
    id: 'planning',
    ko: '기획력',
    en: 'Planning',
    description: '일을 시작하기 전에 순서와 방법을 미리 생각해요',
    category: 'work',
  },
  systematic: {
    id: 'systematic',
    ko: '체계성',
    en: 'Systematic',
    description: '여러 가지 일을 순서대로 정리해서 해내요',
    category: 'work',
  },
  execution: {
    id: 'execution',
    ko: '실행력',
    en: 'Execution',
    description: '해야 할 일을 미루지 않고 바로 시작해서 끝내요',
    category: 'work',
  },
  drive: {
    id: 'drive',
    ko: '추진력',
    en: 'Drive',
    description: '어려운 일도 포기하지 않고 끝까지 밀고 나가요',
    category: 'work',
  },
  accuracy: {
    id: 'accuracy',
    ko: '정확성',
    en: 'Accuracy',
    description: '작은 실수도 놓치지 않고 꼼꼼하게 확인해요',
    category: 'work',
  },
  responsibility: {
    id: 'responsibility',
    ko: '책임감',
    en: 'Responsibility',
    description: '맡은 일은 끝까지 책임지고 해내요',
    category: 'work',
  },
  goal_oriented: {
    id: 'goal_oriented',
    ko: '목표 지향',
    en: 'Goal-oriented',
    description: '목표가 생기면 그것을 이루기 위해 노력해요',
    category: 'work',
  },
  persistence: {
    id: 'persistence',
    ko: '끈기',
    en: 'Persistence',
    description: '힘든 일도 포기하지 않고 계속 해내요',
    category: 'work',
  },

  // ─── head ─────────────────────────────────
  numeracy: {
    id: 'numeracy',
    ko: '수리력',
    en: 'Numeracy',
    description: '숫자를 다루는 일을 편안하게 할 수 있어요',
    category: 'head',
  },
  analysis: {
    id: 'analysis',
    ko: '분석력',
    en: 'Analysis',
    description: '복잡한 일도 차근차근 나누어 이해해요',
    category: 'head',
  },
  documentation: {
    id: 'documentation',
    ko: '글쓰기',
    en: 'Writing',
    description: '생각이나 정보를 글로 잘 정리할 수 있어요',
    category: 'head',
  },
  expression: {
    id: 'expression',
    ko: '표현력',
    en: 'Expression',
    description: '제가 느낀 것이나 생각한 것을 잘 나타내요',
    category: 'head',
  },
  learning_ability: {
    id: 'learning_ability',
    ko: '학습력',
    en: 'Quick Learning',
    description: '새로운 것을 빨리 배우고 제 것으로 만들어요',
    category: 'head',
  },
  curiosity: {
    id: 'curiosity',
    ko: '호기심',
    en: 'Curiosity',
    description: '모르는 것이 있으면 알아보고 싶어해요',
    category: 'head',
  },
  language_sense: {
    id: 'language_sense',
    ko: '언어 감각',
    en: 'Language Sense',
    description: '새 언어를 듣고 익히는 것이 어렵지 않아요',
    category: 'head',
  },
  global_mindset: {
    id: 'global_mindset',
    ko: '글로벌 감각',
    en: 'Global Mindset',
    description: '다른 나라의 문화나 사람을 이해하는 열린 마음이 있어요',
    category: 'head',
  },

  // ─── heart ────────────────────────────────
  resilience: {
    id: 'resilience',
    ko: '다시 일어서는 힘',
    en: 'Resilience',
    description: '힘든 일이 있어도 다시 일어나서 도전해요',
    category: 'heart',
  },
  patience: {
    id: 'patience',
    ko: '인내',
    en: 'Patience',
    description: '천천히 기다려야 하는 일도 잘 참아내요',
    category: 'heart',
  },
  trustworthy: {
    id: 'trustworthy',
    ko: '신뢰성',
    en: 'Trustworthiness',
    description: '약속을 지키고 믿을 수 있는 사람이에요',
    category: 'heart',
  },
  challenge_spirit: {
    id: 'challenge_spirit',
    ko: '도전 정신',
    en: 'Challenge Spirit',
    description: '새로운 일에 도전하는 것을 즐겨요',
    category: 'heart',
  },
  progressive: {
    id: 'progressive',
    ko: '진취성',
    en: 'Proactive Attitude',
    description: '먼저 나서서 일을 시작하는 자세를 가지고 있어요',
    category: 'heart',
  },
  altruism: {
    id: 'altruism',
    ko: '이타성',
    en: 'Altruism',
    description: '다른 사람에게 도움이 되는 일을 기쁘게 해요',
    category: 'heart',
  },
  service_spirit: {
    id: 'service_spirit',
    ko: '봉사 정신',
    en: 'Service Spirit',
    description: '어려운 사람을 그냥 지나치지 못해요',
    category: 'heart',
  },

  // ─── hands ────────────────────────────────
  craftsmanship: {
    id: 'craftsmanship',
    ko: '손재주',
    en: 'Craftsmanship',
    description: '손으로 무엇인가를 만드는 일을 잘해요',
    category: 'hands',
  },
  creative_execution: {
    id: 'creative_execution',
    ko: '창의 실행',
    en: 'Creative Execution',
    description: '새로운 아이디어를 직접 만들어 볼 수 있어요',
    category: 'hands',
  },
  technical_skill: {
    id: 'technical_skill',
    ko: '기능 숙련',
    en: 'Technical Skill',
    description: '기계나 도구를 능숙하게 다룰 수 있어요',
    category: 'hands',
  },
  safety_awareness: {
    id: 'safety_awareness',
    ko: '안전 의식',
    en: 'Safety Awareness',
    description: '일할 때 안전을 먼저 생각해요',
    category: 'hands',
  },
  digital_literacy: {
    id: 'digital_literacy',
    ko: '디지털 활용',
    en: 'Digital Literacy',
    description: '컴퓨터와 스마트폰을 잘 다룰 수 있어요',
    category: 'hands',
  },
  tool_use: {
    id: 'tool_use',
    ko: '도구 활용',
    en: 'Tool Use',
    description: '다양한 도구를 배워서 일에 활용해요',
    category: 'hands',
  },
  content_sense: {
    id: 'content_sense',
    ko: '콘텐츠 감각',
    en: 'Content Sense',
    description: '사진이나 글로 내용을 보기 좋게 만들 수 있어요',
    category: 'hands',
  },
  visual_expression: {
    id: 'visual_expression',
    ko: '시각 표현',
    en: 'Visual Expression',
    description: '보기 좋게 꾸미고 정리하는 감각이 있어요',
    category: 'hands',
  },

  // ─── korea ────────────────────────────────
  korean_learning: {
    id: 'korean_learning',
    ko: '한국어 학습력',
    en: 'Korean Learning',
    description: '한국어를 배우는 일에 꾸준히 노력하고 있어요',
    category: 'korea',
  },
  adaptation: {
    id: 'adaptation',
    ko: '적응력',
    en: 'Adaptability',
    description: '새로운 환경에도 빠르게 익숙해져요',
    category: 'korea',
  },
  cultural_literacy: {
    id: 'cultural_literacy',
    ko: '문화 이해',
    en: 'Cultural Understanding',
    description: '한국의 문화와 예의를 존중하고 배우고 있어요',
    category: 'korea',
  },
  openness: {
    id: 'openness',
    ko: '개방성',
    en: 'Openness',
    description: '다른 생각과 문화를 편견 없이 받아들여요',
    category: 'korea',
  },
  info_search: {
    id: 'info_search',
    ko: '정보 탐색',
    en: 'Information Seeking',
    description: '필요한 정보를 스스로 찾아내는 힘이 있어요',
    category: 'korea',
  },
  leadership: {
    id: 'leadership',
    ko: '리더십',
    en: 'Leadership',
    description: '여러 사람을 이끌고 함께 나아갈 수 있어요',
    category: 'korea',
  },
  community_support: {
    id: 'community_support',
    ko: '지역사회 기여',
    en: 'Community Support',
    description: '주변의 외국인 친구들을 도와주는 일을 해요',
    category: 'korea',
  },
};

/** trait ID → Trait 객체 조회 (안전) */
export function getTrait(id: string): Trait | null {
  return TRAITS[id] ?? null;
}

/** 여러 trait ID를 한국어 이름 배열로 변환 */
export function traitsToKoNames(ids: string[]): string[] {
  return ids.map((id) => TRAITS[id]?.ko).filter((v): v is string => !!v);
}

/** 여러 trait ID의 설명 배열 (자소서 투입용) */
export function traitsToDescriptions(ids: string[]): string[] {
  return ids.map((id) => TRAITS[id]?.description).filter((v): v is string => !!v);
}
