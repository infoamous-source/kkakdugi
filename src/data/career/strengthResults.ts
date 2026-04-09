/**
 * 강점 결과 카드 라이브러리 (20개)
 *
 * 0단계 마지막에 사용자에게 공개되는 "당신의 강점 카드 5장".
 * AI가 사용자 입력(선택 카드 6장 + 별명 + 퀴즈)을 보고
 * 이 라이브러리에서 5개를 선정하거나, 필요 시 새로 생성한다.
 *
 * 라이브러리 기반 결과는 "안전한 기본 선택지" 역할을 하며,
 * preferredQuestionIds로 STAR 질문 풀과 연결된다.
 */

import type { StrengthResult } from '../../types/career/strengths';

export const STRENGTH_RESULTS: StrengthResult[] = [
  {
    id: 'persistent_learner',
    nameKo: '끈기 있는 학습자',
    nameEn: 'Persistent Learner',
    icon: '🪨',
    description: '한 번 시작한 일은 포기하지 않고 끝까지 배우는 사람이에요',
    coreTraits: ['persistence', 'learning_ability', 'patience'],
    triggerCardIds: ['card_persistent', 'card_learn', 'card_goal'],
    preferredQuestionIds: ['star_persistence', 'star_new_challenge', 'star_korea_adaptation'],
  },
  {
    id: 'warm_mediator',
    nameKo: '따뜻한 중재자',
    nameEn: 'Warm Mediator',
    icon: '🕊️',
    description: '사람들 사이에서 이야기를 잘 듣고 다리를 놓는 사람이에요',
    coreTraits: ['listening', 'mediation', 'empathy'],
    triggerCardIds: ['card_listen', 'card_mediate', 'card_friendly'],
    preferredQuestionIds: ['star_collaboration', 'star_helping_others'],
  },
  {
    id: 'reliable_finisher',
    nameKo: '믿을 수 있는 마무리꾼',
    nameEn: 'Reliable Finisher',
    icon: '🛡️',
    description: '맡은 일은 꼼꼼하게 끝까지 책임지는 사람이에요',
    coreTraits: ['responsibility', 'accuracy', 'trustworthy'],
    triggerCardIds: ['card_responsible', 'card_detail', 'card_goal'],
    preferredQuestionIds: ['star_achievement', 'star_persistence'],
  },
  {
    id: 'quick_explorer',
    nameKo: '빠른 탐험가',
    nameEn: 'Quick Explorer',
    icon: '🚀',
    description: '새로운 것을 두려워하지 않고 먼저 뛰어드는 사람이에요',
    coreTraits: ['challenge_spirit', 'curiosity', 'progressive'],
    triggerCardIds: ['card_challenge', 'card_learn', 'card_language'],
    preferredQuestionIds: ['star_new_challenge', 'star_problem_solving'],
  },
  {
    id: 'caring_helper',
    nameKo: '마음 따뜻한 조력자',
    nameEn: 'Caring Helper',
    icon: '❤️',
    description: '어려운 사람을 그냥 지나치지 못하는 마음을 가진 사람이에요',
    coreTraits: ['altruism', 'service_spirit', 'empathy'],
    triggerCardIds: ['card_kind', 'card_help', 'card_listen'],
    preferredQuestionIds: ['star_helping_others', 'star_collaboration'],
  },
  {
    id: 'organized_planner',
    nameKo: '체계적인 기획자',
    nameEn: 'Organized Planner',
    icon: '📋',
    description: '일을 시작하기 전에 순서를 정하고 꼼꼼하게 준비하는 사람이에요',
    coreTraits: ['planning', 'systematic', 'accuracy'],
    triggerCardIds: ['card_plan', 'card_detail', 'card_goal'],
    preferredQuestionIds: ['star_achievement', 'star_problem_solving'],
  },
  {
    id: 'hands_on_maker',
    nameKo: '손재주 실행가',
    nameEn: 'Hands-on Maker',
    icon: '🛠️',
    description: '머리로 생각한 것을 직접 손으로 만들어내는 사람이에요',
    coreTraits: ['craftsmanship', 'creative_execution', 'execution'],
    triggerCardIds: ['card_craft', 'card_machine', 'card_fast'],
    preferredQuestionIds: ['star_achievement', 'star_problem_solving'],
  },
  {
    id: 'digital_navigator',
    nameKo: '디지털 길잡이',
    nameEn: 'Digital Navigator',
    icon: '💻',
    description: '컴퓨터와 새로운 앱을 빠르게 배워서 활용하는 사람이에요',
    coreTraits: ['digital_literacy', 'learning_ability', 'tool_use'],
    triggerCardIds: ['card_digital', 'card_learn', 'card_sns'],
    preferredQuestionIds: ['star_new_challenge', 'star_problem_solving'],
  },
  {
    id: 'korea_adapter',
    nameKo: '한국 적응의 달인',
    nameEn: 'Korea Adaptation Master',
    icon: '🇰🇷',
    description: '한국의 문화와 시스템을 빠르게 이해하고 적응한 사람이에요',
    coreTraits: ['adaptation', 'cultural_literacy', 'info_search'],
    triggerCardIds: ['card_culture', 'card_system', 'card_korean'],
    preferredQuestionIds: ['star_korea_adaptation', 'star_new_challenge'],
  },
  {
    id: 'language_absorber',
    nameKo: '언어를 빨아들이는 사람',
    nameEn: 'Language Absorber',
    icon: '🗣️',
    description: '한국어를 포함해 새 언어를 빠르게 익히는 사람이에요',
    coreTraits: ['language_sense', 'korean_learning', 'learning_ability'],
    triggerCardIds: ['card_language', 'card_korean', 'card_learn'],
    preferredQuestionIds: ['star_korea_adaptation', 'star_persistence'],
  },
  {
    id: 'team_builder',
    nameKo: '분위기 메이커',
    nameEn: 'Team Builder',
    icon: '🤝',
    description: '사람들 사이에서 밝은 에너지를 만드는 사람이에요',
    coreTraits: ['sociability', 'friendliness', 'communication'],
    triggerCardIds: ['card_friendly', 'card_teach', 'card_mediate'],
    preferredQuestionIds: ['star_collaboration', 'star_helping_others'],
  },
  {
    id: 'patient_craftsman',
    nameKo: '인내의 장인',
    nameEn: 'Patient Craftsman',
    icon: '🏺',
    description: '오래 걸리는 일도 마음을 다해 천천히 해내는 사람이에요',
    coreTraits: ['patience', 'craftsmanship', 'persistence'],
    triggerCardIds: ['card_craft', 'card_persistent', 'card_detail'],
    preferredQuestionIds: ['star_persistence', 'star_achievement'],
  },
  {
    id: 'curious_student',
    nameKo: '호기심 많은 학생',
    nameEn: 'Curious Student',
    icon: '📚',
    description: '질문이 많고 모르는 것을 그냥 넘기지 않는 사람이에요',
    coreTraits: ['curiosity', 'learning_ability', 'analysis'],
    triggerCardIds: ['card_learn', 'card_numbers', 'card_write'],
    preferredQuestionIds: ['star_new_challenge', 'star_problem_solving'],
  },
  {
    id: 'creative_storyteller',
    nameKo: '이야기를 만드는 사람',
    nameEn: 'Creative Storyteller',
    icon: '✏️',
    description: '생각과 경험을 재미있게 표현하고 전달하는 사람이에요',
    coreTraits: ['expression', 'content_sense', 'documentation'],
    triggerCardIds: ['card_write', 'card_sns', 'card_language'],
    preferredQuestionIds: ['star_achievement', 'star_helping_others'],
  },
  {
    id: 'resilient_survivor',
    nameKo: '다시 일어서는 사람',
    nameEn: 'Resilient Survivor',
    icon: '🌱',
    description: '힘든 일이 있어도 포기하지 않고 다시 시작하는 사람이에요',
    coreTraits: ['resilience', 'patience', 'adaptation'],
    triggerCardIds: ['card_persistent', 'card_challenge', 'card_korean'],
    preferredQuestionIds: ['star_failure_learning', 'star_korea_adaptation'],
  },
  {
    id: 'safety_first_worker',
    nameKo: '안전을 먼저 생각하는 일꾼',
    nameEn: 'Safety-First Worker',
    icon: '🦺',
    description: '일할 때 안전과 규칙을 먼저 생각하는 믿음직한 사람이에요',
    coreTraits: ['safety_awareness', 'responsibility', 'technical_skill'],
    triggerCardIds: ['card_machine', 'card_responsible', 'card_detail'],
    preferredQuestionIds: ['star_persistence', 'star_achievement'],
  },
  {
    id: 'community_leader',
    nameKo: '따뜻한 리더',
    nameEn: 'Community Leader',
    icon: '🌟',
    description: '주변 사람을 돕고 함께 나아가는 힘이 있는 사람이에요',
    coreTraits: ['leadership', 'community_support', 'collaboration'],
    triggerCardIds: ['card_help', 'card_teach', 'card_mediate'],
    preferredQuestionIds: ['star_helping_others', 'star_collaboration'],
  },
  {
    id: 'open_minded_bridger',
    nameKo: '열린 마음의 다리',
    nameEn: 'Open-minded Bridger',
    icon: '🌉',
    description: '다른 문화를 존중하고 사람들을 이어주는 사람이에요',
    coreTraits: ['openness', 'global_mindset', 'cultural_literacy'],
    triggerCardIds: ['card_culture', 'card_language', 'card_friendly'],
    preferredQuestionIds: ['star_korea_adaptation', 'star_collaboration'],
  },
  {
    id: 'fast_executor',
    nameKo: '빠른 실행가',
    nameEn: 'Fast Executor',
    icon: '⚡',
    description: '생각한 것을 미루지 않고 바로 행동으로 옮기는 사람이에요',
    coreTraits: ['execution', 'drive', 'progressive'],
    triggerCardIds: ['card_fast', 'card_plan', 'card_challenge'],
    preferredQuestionIds: ['star_achievement', 'star_problem_solving'],
  },
  {
    id: 'detail_guardian',
    nameKo: '꼼꼼함의 수호자',
    nameEn: 'Detail Guardian',
    icon: '🔍',
    description: '작은 실수도 놓치지 않는 정확한 사람이에요',
    coreTraits: ['accuracy', 'analysis', 'responsibility'],
    triggerCardIds: ['card_detail', 'card_numbers', 'card_responsible'],
    preferredQuestionIds: ['star_achievement', 'star_problem_solving'],
  },
];

/** 결과 ID로 조회 */
export function getStrengthResultById(id: string): StrengthResult | null {
  return STRENGTH_RESULTS.find((r) => r.id === id) ?? null;
}

/** 사용자가 선택한 카드 ID에 가장 잘 맞는 결과 후보를 점수 순으로 반환 */
export function recommendStrengthResults(
  selectedCardIds: string[],
  limit = 5,
): StrengthResult[] {
  const scored = STRENGTH_RESULTS.map((result) => {
    let score = 0;
    if (result.triggerCardIds) {
      for (const triggerId of result.triggerCardIds) {
        if (selectedCardIds.includes(triggerId)) score += 10;
      }
    }
    return { result, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, limit)
    .map((s) => s.result);
}
