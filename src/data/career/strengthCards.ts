/**
 * 강점 카드 24장 (Phase C1)
 *
 * 사용자가 0단계 카드 픽킹 게임에서 고르는 카드 라이브러리.
 * 6개 카테고리 × 4장 = 24장.
 *
 * 각 카드는 1~3개의 trait와 매핑되어 있으며,
 * 사용자가 고른 카드의 trait 빈도를 집계해서 결과 카드를 도출한다.
 *
 * 라벨은 TOPIK 3-4 수준으로 작성 (짧고 친근한 구어체).
 */

import type { StrengthCard } from '../../types/career/strengths';

export const STRENGTH_CARDS: StrengthCard[] = [
  // ─── 사람 관계 (people) ────────────────────
  {
    id: 'card_listen',
    category: 'people',
    emoji: '👂',
    labelKo: '잘 들어줘요',
    labelEn: 'I listen well',
    traits: ['listening', 'empathy'],
  },
  {
    id: 'card_friendly',
    category: 'people',
    emoji: '🤝',
    labelKo: '처음 본 사람과 잘 친해져요',
    labelEn: 'I make friends easily',
    traits: ['friendliness', 'sociability'],
  },
  {
    id: 'card_mediate',
    category: 'people',
    emoji: '🕊️',
    labelKo: '다툴 때 중재해요',
    labelEn: 'I mediate conflicts',
    traits: ['mediation', 'collaboration'],
  },
  {
    id: 'card_teach',
    category: 'people',
    emoji: '🧑‍🏫',
    labelKo: '알려주는 게 좋아요',
    labelEn: 'I enjoy teaching others',
    traits: ['mentorship', 'communication'],
  },

  // ─── 일 처리 (work) ───────────────────────
  {
    id: 'card_plan',
    category: 'work',
    emoji: '📋',
    labelKo: '계획 세우는 걸 좋아해요',
    labelEn: 'I love making plans',
    traits: ['planning', 'systematic'],
  },
  {
    id: 'card_fast',
    category: 'work',
    emoji: '⚡',
    labelKo: '일을 빨리 끝내요',
    labelEn: 'I get things done fast',
    traits: ['execution', 'drive'],
  },
  {
    id: 'card_detail',
    category: 'work',
    emoji: '🔍',
    labelKo: '꼼꼼하게 봐요',
    labelEn: 'I pay attention to details',
    traits: ['accuracy', 'responsibility'],
  },
  {
    id: 'card_goal',
    category: 'work',
    emoji: '🎯',
    labelKo: '목표가 있으면 끝까지 해요',
    labelEn: 'I finish what I set out to do',
    traits: ['goal_oriented', 'persistence'],
  },

  // ─── 머리 (head) ──────────────────────────
  {
    id: 'card_numbers',
    category: 'head',
    emoji: '🔢',
    labelKo: '숫자에 강해요',
    labelEn: 'I am good with numbers',
    traits: ['numeracy', 'analysis'],
  },
  {
    id: 'card_write',
    category: 'head',
    emoji: '✏️',
    labelKo: '글쓰는 게 어렵지 않아요',
    labelEn: 'Writing comes easy to me',
    traits: ['documentation', 'expression'],
  },
  {
    id: 'card_learn',
    category: 'head',
    emoji: '💡',
    labelKo: '새로운 거 빨리 배워요',
    labelEn: 'I learn new things fast',
    traits: ['learning_ability', 'curiosity'],
  },
  {
    id: 'card_language',
    category: 'head',
    emoji: '🌍',
    labelKo: '언어에 관심 많아요',
    labelEn: 'I love languages',
    traits: ['language_sense', 'global_mindset'],
  },

  // ─── 마음 (heart) ─────────────────────────
  {
    id: 'card_persistent',
    category: 'heart',
    emoji: '🪨',
    labelKo: '포기 안 해요',
    labelEn: 'I never give up',
    traits: ['persistence', 'patience'],
  },
  {
    id: 'card_responsible',
    category: 'heart',
    emoji: '🛡️',
    labelKo: '책임감이 강해요',
    labelEn: 'I have strong responsibility',
    traits: ['responsibility', 'trustworthy'],
  },
  {
    id: 'card_challenge',
    category: 'heart',
    emoji: '🚀',
    labelKo: '새로운 도전이 즐거워요',
    labelEn: 'I enjoy new challenges',
    traits: ['challenge_spirit', 'progressive'],
  },
  {
    id: 'card_kind',
    category: 'heart',
    emoji: '❤️',
    labelKo: '어려운 사람을 그냥 못 지나쳐요',
    labelEn: 'I help people in need',
    traits: ['altruism', 'service_spirit'],
  },

  // ─── 손 (hands) ───────────────────────────
  {
    id: 'card_craft',
    category: 'hands',
    emoji: '🍳',
    labelKo: '요리·만드는 게 좋아요',
    labelEn: 'I love cooking and making things',
    traits: ['craftsmanship', 'creative_execution'],
  },
  {
    id: 'card_machine',
    category: 'hands',
    emoji: '🔧',
    labelKo: '기계를 잘 다뤄요',
    labelEn: 'I handle machines well',
    traits: ['technical_skill', 'safety_awareness'],
  },
  {
    id: 'card_digital',
    category: 'hands',
    emoji: '💻',
    labelKo: '컴퓨터·스마트폰을 잘 써요',
    labelEn: 'I am good with tech',
    traits: ['digital_literacy', 'tool_use'],
  },
  {
    id: 'card_sns',
    category: 'hands',
    emoji: '📱',
    labelKo: 'SNS·사진 만들기가 재밌어요',
    labelEn: 'I love social media and photos',
    traits: ['content_sense', 'visual_expression'],
  },

  // ─── 한국 적응 (korea) ────────────────────
  {
    id: 'card_korean',
    category: 'korea',
    emoji: '🇰🇷',
    labelKo: '한국어가 빨리 늘어요',
    labelEn: 'My Korean improves fast',
    traits: ['korean_learning', 'adaptation'],
  },
  {
    id: 'card_culture',
    category: 'korea',
    emoji: '🍚',
    labelKo: '한국 음식·문화가 좋아요',
    labelEn: 'I love Korean food and culture',
    traits: ['cultural_literacy', 'openness'],
  },
  {
    id: 'card_system',
    category: 'korea',
    emoji: '🧭',
    labelKo: '한국 시스템을 잘 알아요',
    labelEn: 'I know how Korea works',
    traits: ['info_search', 'adaptation'],
  },
  {
    id: 'card_help',
    category: 'korea',
    emoji: '🤲',
    labelKo: '다른 외국인을 도와줘요',
    labelEn: 'I help other foreigners',
    traits: ['leadership', 'community_support'],
  },
];

/** 카테고리별로 카드 그룹핑 */
export function getCardsByCategory(category: string): StrengthCard[] {
  return STRENGTH_CARDS.filter((c) => c.category === category);
}

/** 카드 ID로 카드 조회 */
export function getCardById(id: string): StrengthCard | null {
  return STRENGTH_CARDS.find((c) => c.id === id) ?? null;
}

/** 선택한 카드 ID들에서 trait 빈도 집계 */
export function aggregateTraitsFromCards(cardIds: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cardId of cardIds) {
    const card = getCardById(cardId);
    if (!card) continue;
    for (const trait of card.traits) {
      counts[trait] = (counts[trait] ?? 0) + 1;
    }
  }
  return counts;
}
