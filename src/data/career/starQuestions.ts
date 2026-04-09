/**
 * STAR 인터뷰 질문 8개 (+ STAR 후속 질문)
 *
 * 자소서 빌더 1단계에서 사용자에게 던지는 메인 질문 풀.
 * 사용자는 8개 중 5개 이상을 선택해서 답변한다.
 *
 * 각 질문은 STAR 기법에 따라 상황(Situation) → 과제(Task) → 행동(Action) → 결과(Result)
 * 4개의 후속 질문으로 연결된다.
 *
 * 모든 질문은 TOPIK 3-4 수준의 쉬운 한국어로 작성되었다.
 */

import type { StarQuestion } from '../../types/career/strengths';
import { STRENGTH_RESULTS } from './strengthResults';

export const STAR_QUESTIONS: StarQuestion[] = [
  // 1. 성취 경험
  {
    id: 'star_achievement',
    category: 'achievement',
    mainQuestionKo:
      '지금까지 살면서 "내가 해냈다!"라고 느낀 순간이 있어요? 하나만 알려주세요.',
    mainQuestionEn:
      'Can you share a moment when you felt "I did it!"? Just one story.',
    hintKo: '일, 공부, 취미, 봉사 무엇이든 괜찮아요. 작은 일도 좋아요.',
    hintEn: 'Work, study, hobby, volunteer — anything is fine. Small wins count.',
    followUps: {
      situation: {
        ko: '그때 어떤 상황이었어요? 어디서, 언제 있었던 일이에요?',
        en: 'What was the situation? Where and when did it happen?',
      },
      task: {
        ko: '그때 본인이 해야 했던 일이나 목표가 뭐였어요?',
        en: 'What did you need to do? What was your goal?',
      },
      action: {
        ko: '본인이 직접 한 행동을 자세히 알려주세요. 다른 사람이 한 건 빼고요.',
        en: 'What did YOU do exactly? Only the things you did yourself.',
      },
      result: {
        ko: '결과가 어떻게 됐어요? 숫자나 변화가 있었다면 알려주세요.',
        en: 'What happened? Any numbers or changes you can share?',
      },
    },
    extractableTraits: [
      'goal_oriented',
      'execution',
      'drive',
      'responsibility',
      'planning',
    ],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 2. 문제 해결
  {
    id: 'star_problem_solving',
    category: 'problem_solving',
    mainQuestionKo: '어려운 문제가 생겼는데 본인이 직접 풀어낸 경험이 있어요?',
    mainQuestionEn: 'Have you solved a difficult problem by yourself?',
    hintKo:
      '고장난 것을 고쳤거나, 복잡한 일을 쉽게 바꿨거나, 아이디어로 해결했거나.',
    hintEn: 'Fixed something broken, simplified something complex, or found a clever idea.',
    followUps: {
      situation: {
        ko: '어떤 문제였어요? 왜 어려웠어요?',
        en: 'What was the problem? Why was it hard?',
      },
      task: {
        ko: '그 문제를 누가 해결해야 했어요? 본인 역할은 뭐였어요?',
        en: 'Whose job was it to solve? What was your role?',
      },
      action: {
        ko: '본인이 어떻게 했어요? 순서대로 알려주세요.',
        en: 'How did you do it? Step by step, please.',
      },
      result: {
        ko: '문제가 해결됐어요? 어떤 변화가 있었어요?',
        en: 'Did it get solved? What changed?',
      },
    },
    extractableTraits: ['analysis', 'creative_execution', 'execution', 'curiosity'],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 3. 협업·갈등
  {
    id: 'star_collaboration',
    category: 'collaboration',
    mainQuestionKo:
      '여러 명이 같이 일하다가 의견이 안 맞은 적 있어요? 그때 어떻게 했어요?',
    mainQuestionEn:
      'Have you worked with others and had disagreements? How did you handle it?',
    hintKo: '학교, 알바, 가족, 친구 모임 어디서든 괜찮아요.',
    hintEn: 'School, part-time work, family, friends — any setting is fine.',
    followUps: {
      situation: {
        ko: '몇 명이 있었어요? 무슨 일을 같이 했어요?',
        en: 'How many people? What were you working on?',
      },
      task: {
        ko: '어떤 부분에서 의견이 달랐어요?',
        en: 'What did you disagree about?',
      },
      action: {
        ko: '본인이 어떻게 했어요? 말로 설명했어요? 양보했어요?',
        en: 'What did you do? Did you talk it out? Compromise?',
      },
      result: {
        ko: '마지막엔 어떻게 됐어요? 관계는 어땠어요?',
        en: 'How did it end? How was the relationship?',
      },
    },
    extractableTraits: ['collaboration', 'mediation', 'communication', 'empathy'],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 4. 실패·배움
  {
    id: 'star_failure_learning',
    category: 'failure_learning',
    mainQuestionKo: '잘 안 됐던 경험이 있어요? 그때 무엇을 배웠어요?',
    mainQuestionEn: 'Have you experienced a failure? What did you learn from it?',
    hintKo:
      '창피하지 않아요. 솔직한 실패 경험은 자소서에서 가장 진실된 이야기가 돼요.',
    hintEn:
      "It's okay. An honest failure story is the most real part of a self-introduction.",
    followUps: {
      situation: {
        ko: '어떤 일이었어요? 무엇을 하려고 했어요?',
        en: 'What was it? What were you trying to do?',
      },
      task: {
        ko: '왜 잘 안 됐던 것 같아요?',
        en: 'Why do you think it went wrong?',
      },
      action: {
        ko: '그 다음에 본인은 어떻게 했어요? 다시 시도했어요?',
        en: 'What did you do next? Did you try again?',
      },
      result: {
        ko: '그 경험에서 지금 무엇을 기억하고 있어요?',
        en: 'What lesson do you still remember today?',
      },
    },
    extractableTraits: ['resilience', 'patience', 'learning_ability', 'curiosity'],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 5. 새로운 도전
  {
    id: 'star_new_challenge',
    category: 'new_challenge',
    mainQuestionKo:
      '처음 해보는 일이나 새로운 환경에 뛰어든 경험이 있어요? (한국에 온 것도 괜찮아요)',
    mainQuestionEn:
      'Have you jumped into something new? (Coming to Korea counts, too!)',
    hintKo: '처음 보는 앱을 익히거나, 처음 만난 동료와 일하거나, 낯선 도시에 가거나.',
    hintEn: 'Learning a new app, working with new coworkers, visiting a new city.',
    followUps: {
      situation: {
        ko: '그때 무엇이 새로웠어요? 왜 낯설었어요?',
        en: 'What was new? Why was it unfamiliar?',
      },
      task: {
        ko: '그 환경에서 본인이 해내야 했던 일이 뭐였어요?',
        en: 'What did you have to achieve in that situation?',
      },
      action: {
        ko: '어떻게 익숙해졌어요? 어떤 노력을 했어요?',
        en: 'How did you get used to it? What efforts did you make?',
      },
      result: {
        ko: '지금은 그것을 편하게 할 수 있어요?',
        en: 'Can you do it comfortably now?',
      },
    },
    extractableTraits: [
      'challenge_spirit',
      'adaptation',
      'learning_ability',
      'progressive',
    ],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 6. 꾸준함
  {
    id: 'star_persistence',
    category: 'persistence',
    mainQuestionKo:
      '오랫동안 꾸준히 한 일이 있어요? 어떻게 계속할 수 있었어요?',
    mainQuestionEn:
      'Is there something you have been doing for a long time? How did you keep going?',
    hintKo: '운동, 일기, 공부, 저축, 악기, 한국어 공부 같은 것이요.',
    hintEn: 'Exercise, journaling, studying, saving money, an instrument, Korean study.',
    followUps: {
      situation: {
        ko: '무엇을 꾸준히 했어요? 언제부터 시작했어요?',
        en: 'What did you keep doing? When did you start?',
      },
      task: {
        ko: '왜 그것을 시작했어요? 목표가 있었어요?',
        en: 'Why did you start? Did you have a goal?',
      },
      action: {
        ko: '힘들 때도 어떻게 계속했어요?',
        en: 'How did you keep going even when it was hard?',
      },
      result: {
        ko: '지금은 어떤 변화가 생겼어요?',
        en: 'What has changed in you because of it?',
      },
    },
    extractableTraits: ['persistence', 'patience', 'goal_oriented', 'responsibility'],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 7. 타인 도움
  {
    id: 'star_helping_others',
    category: 'helping_others',
    mainQuestionKo:
      '누군가에게 도움을 줬는데 그 사람이 정말 고마워했던 순간이 있어요?',
    mainQuestionEn:
      'Is there a moment when you helped someone and they were really grateful?',
    hintKo: '가족, 친구, 동료, 모르는 사람 누구든 괜찮아요.',
    hintEn: 'Family, friends, coworkers, strangers — anyone is fine.',
    followUps: {
      situation: {
        ko: '그 사람은 어떤 어려움이 있었어요?',
        en: 'What difficulty did that person have?',
      },
      task: {
        ko: '본인이 왜 돕기로 했어요? 부탁을 받았어요, 아니면 먼저 나섰어요?',
        en: 'Why did you decide to help? Were you asked, or did you step up?',
      },
      action: {
        ko: '구체적으로 어떤 도움을 줬어요?',
        en: 'What exactly did you do to help?',
      },
      result: {
        ko: '그 사람의 반응은 어땠어요? 본인은 어떻게 느꼈어요?',
        en: 'How did they react? How did you feel?',
      },
    },
    extractableTraits: ['altruism', 'empathy', 'service_spirit', 'communication'],
    requiresKoreaExperience: false,
    estimatedMinutes: 3,
  },

  // 8. 한국 적응
  {
    id: 'star_korea_adaptation',
    category: 'korea_adaptation',
    mainQuestionKo:
      '한국에 와서 가장 힘들었던 것과, 어떻게 극복했는지 알려주세요.',
    mainQuestionEn:
      'What was the hardest thing about coming to Korea, and how did you overcome it?',
    hintKo:
      '언어, 음식, 문화, 외로움, 행정 업무, 직장 예절 — 어떤 주제든 괜찮아요.',
    hintEn:
      'Language, food, culture, loneliness, paperwork, work etiquette — any topic is fine.',
    followUps: {
      situation: {
        ko: '어떤 상황이 가장 힘들었어요?',
        en: 'What situation was the hardest?',
      },
      task: {
        ko: '그 어려움을 해결해야 하는 이유가 뭐였어요?',
        en: 'Why did you have to overcome it?',
      },
      action: {
        ko: '어떤 방법으로 극복했어요? 도움을 구했어요, 혼자 했어요?',
        en: 'How did you get past it? Did you ask for help, or do it alone?',
      },
      result: {
        ko: '지금은 그 상황을 어떻게 생각해요? 더 편해졌어요?',
        en: 'How do you feel about it now? Is it easier?',
      },
    },
    extractableTraits: [
      'adaptation',
      'korean_learning',
      'cultural_literacy',
      'resilience',
      'info_search',
    ],
    requiresKoreaExperience: true,
    estimatedMinutes: 3,
  },
];

/** 질문 ID로 조회 */
export function getStarQuestionById(id: string): StarQuestion | null {
  return STAR_QUESTIONS.find((q) => q.id === id) ?? null;
}

/**
 * 선택한 강점 결과와 체류 기간에 맞는 STAR 질문을 필터링·정렬한다.
 *
 * - 체류 6개월 미만이면 requiresKoreaExperience=true 질문 제외
 * - 강점 결과의 preferredQuestionIds에 속하는 질문을 우선 순위로
 */
export function pickStarQuestions(options: {
  strengthResultIds?: string[];
  allowKoreaSpecific: boolean;
  limit?: number;
}): StarQuestion[] {
  const { strengthResultIds = [], allowKoreaSpecific, limit = 6 } = options;

  // 1. 한국 경험 필터
  const candidates = STAR_QUESTIONS.filter((q) =>
    allowKoreaSpecific ? true : !q.requiresKoreaExperience,
  );

  // 2. preferredQuestionIds와 일치 여부로 우선 순위 점수
  const preferredSet = new Set<string>();
  for (const rid of strengthResultIds) {
    const r = STRENGTH_RESULTS.find((x) => x.id === rid);
    if (r) r.preferredQuestionIds.forEach((qid) => preferredSet.add(qid));
  }

  candidates.sort((a, b) => {
    const aPref = preferredSet.has(a.id) ? 1 : 0;
    const bPref = preferredSet.has(b.id) ? 1 : 0;
    return bPref - aPref;
  });

  return candidates.slice(0, limit);
}
