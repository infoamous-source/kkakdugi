/**
 * 강점-질문 매핑 헬퍼 & 배럴
 *
 * 자소서 빌더 UI·AI 호출 로직이 사용하는 한 줄 함수들.
 * 카드 → trait → 결과 → STAR 질문 → 자소서 역량으로 흘러가는 파이프라인.
 */

import type {
  StrengthCard,
  StrengthResult,
  StarQuestion,
  TraitId,
  Trait,
} from '../../types/career/strengths';

import { STRENGTH_CARDS, aggregateTraitsFromCards, getCardById } from './strengthCards';
import {
  STRENGTH_RESULTS,
  getStrengthResultById,
  recommendStrengthResults,
} from './strengthResults';
import { STAR_QUESTIONS, getStarQuestionById, pickStarQuestions } from './starQuestions';
import { TRAITS, getTrait, traitsToKoNames, traitsToDescriptions } from './traits';

// ─── 고차 헬퍼 ─────────────────────────────────

/**
 * 0단계 전체 파이프라인을 한 번에 실행.
 * 1. 선택한 카드 → trait 집계
 * 2. trait 기반으로 결과 카드 후보 5개 추천
 * 3. 추천된 결과의 preferredQuestionIds로 STAR 질문 6개 필터
 */
export function runStrengthPipeline(options: {
  selectedCardIds: string[];
  allowKoreaSpecific: boolean;
}): {
  traits: Record<string, number>;
  recommendedResults: StrengthResult[];
  starQuestions: StarQuestion[];
} {
  const { selectedCardIds, allowKoreaSpecific } = options;

  const traits = aggregateTraitsFromCards(selectedCardIds);
  const recommendedResults = recommendStrengthResults(selectedCardIds, 5);
  const starQuestions = pickStarQuestions({
    strengthResultIds: recommendedResults.map((r) => r.id),
    allowKoreaSpecific,
    limit: 6,
  });

  return { traits, recommendedResults, starQuestions };
}

/**
 * 자소서 4항목에 사용할 "1~2개 역량" 조합을 결정한다.
 * 공식: 4항목 × (1~2 역량) = 4~8개 역량
 *
 * 우선 순위:
 *  1. 사용자가 고른 카드에서 집계된 trait 빈도 높은 것
 *  2. 결과 카드의 coreTraits (사용자가 인정한 것만)
 *  3. 부족하면 카테고리 균형 맞추기
 */
export function selectTraitsForResume(options: {
  selectedCardIds: string[];
  acceptedResultIds: string[];
  itemCount?: number; // 기본 4항목
}): TraitId[][] {
  const { selectedCardIds, acceptedResultIds, itemCount = 4 } = options;

  const aggregated = aggregateTraitsFromCards(selectedCardIds);
  const acceptedTraits = new Set<TraitId>();
  for (const rid of acceptedResultIds) {
    const r = getStrengthResultById(rid);
    if (r) r.coreTraits.forEach((t) => acceptedTraits.add(t));
  }

  // 점수: 사용자 인정한 결과 trait(+10) + 카드 빈도(+n)
  const scored = Object.entries(TRAITS).map(([id, trait]) => {
    const card = aggregated[id] ?? 0;
    const accepted = acceptedTraits.has(id as TraitId) ? 10 : 0;
    return { trait, score: card + accepted };
  });
  scored.sort((a, b) => b.score - a.score);

  // 점수가 있는 trait만 후보로
  const pool = scored.filter((s) => s.score > 0).map((s) => s.trait.id as TraitId);

  // 4항목에 각 1~2개씩 배치. 공식: 총 4~8개 중 가용 pool만큼.
  const result: TraitId[][] = [];
  let poolIdx = 0;
  for (let item = 0; item < itemCount; item++) {
    const slot: TraitId[] = [];
    // 각 항목에 기본 1개, pool 여유 있으면 2개
    for (let k = 0; k < 2 && poolIdx < pool.length; k++) {
      slot.push(pool[poolIdx]);
      poolIdx += 1;
      if (slot.length === 1 && k === 0 && pool.length - poolIdx < itemCount - item) {
        // pool이 부족하면 항목당 1개씩만 배분해서 다 채움
        break;
      }
    }
    // 최소 1개는 있어야 함 (pool 고갈 시 앞 trait 재사용)
    if (slot.length === 0 && pool.length > 0) {
      slot.push(pool[item % pool.length]);
    }
    if (slot.length > 0) result.push(slot);
  }

  return result;
}

// ─── 배럴 export ──────────────────────────────

export {
  // traits
  TRAITS,
  getTrait,
  traitsToKoNames,
  traitsToDescriptions,
  // cards
  STRENGTH_CARDS,
  getCardById,
  aggregateTraitsFromCards,
  // results
  STRENGTH_RESULTS,
  getStrengthResultById,
  recommendStrengthResults,
  // questions
  STAR_QUESTIONS,
  getStarQuestionById,
  pickStarQuestions,
};

export type { StrengthCard, StrengthResult, StarQuestion, TraitId, Trait };
