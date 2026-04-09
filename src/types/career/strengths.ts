/**
 * 커리어학과 자소서 빌더 — 강점 발견 도메인 타입
 *
 * Phase C1 (PRD 기반): 인터뷰형 자소서 빌더의 0단계 "강점 발견 게임" 데이터 계약
 *
 * 핵심 공식 (절대 위반 금지):
 *   한국 자소서 1개 항목 = 1~2개 역량 + 1~2개 구체 사례
 *   → 강점 카드 5장, STAR 답변 5~7개가 정확히 매칭됨
 */

// ─── 카드 카테고리 ─────────────────────────────────────

export type StrengthCategory =
  | 'people'   // 사람 관계
  | 'work'     // 일 처리
  | 'head'     // 머리 (학습·분석)
  | 'heart'    // 마음 (가치관·성향)
  | 'hands'    // 손 (실행·제작)
  | 'korea';   // 한국 적응

// ─── 역량(Trait) ID ──────────────────────────────────
//
// 카드 → trait 집계 → 결과 카드 생성 → 자소서 역량 키워드로 흘러감.
// 이 ID는 자소서 매핑 엔진에서 "1~2개 역량"을 선택하는 단위가 된다.

export type TraitId =
  // people
  | 'listening'           // 경청
  | 'empathy'             // 공감력
  | 'friendliness'        // 친화력
  | 'sociability'         // 사교성
  | 'mediation'           // 갈등 조정
  | 'collaboration'       // 협업
  | 'mentorship'          // 멘토십
  | 'communication'       // 커뮤니케이션
  // work
  | 'planning'            // 기획력
  | 'systematic'          // 체계성
  | 'execution'           // 실행력
  | 'drive'               // 추진력
  | 'accuracy'            // 정확성
  | 'responsibility'      // 책임감
  | 'goal_oriented'       // 목표 지향
  | 'persistence'         // 끈기
  // head
  | 'numeracy'            // 수리력
  | 'analysis'            // 분석력
  | 'documentation'       // 문서화
  | 'expression'          // 표현력
  | 'learning_ability'    // 학습력
  | 'curiosity'           // 호기심
  | 'language_sense'      // 언어 감각
  | 'global_mindset'      // 글로벌 마인드
  // heart
  | 'resilience'          // 회복탄력성
  | 'patience'            // 인내
  | 'trustworthy'         // 신뢰성
  | 'challenge_spirit'    // 도전 정신
  | 'progressive'         // 진취성
  | 'altruism'            // 이타성
  | 'service_spirit'      // 봉사 정신
  // hands
  | 'craftsmanship'       // 손재주
  | 'creative_execution'  // 창의 실행
  | 'technical_skill'     // 기능 숙련
  | 'safety_awareness'    // 안전 의식
  | 'digital_literacy'    // 디지털 활용
  | 'tool_use'            // 도구 활용
  | 'content_sense'       // 콘텐츠 감각
  | 'visual_expression'   // 시각 표현
  // korea
  | 'korean_learning'     // 한국어 학습력
  | 'adaptation'          // 적응력
  | 'cultural_literacy'   // 문화 이해
  | 'openness'            // 개방성
  | 'info_search'         // 정보 탐색
  | 'leadership'          // 리더십
  | 'community_support';  // 지역사회 기여

// ─── Trait 정의 ──────────────────────────────────────

export interface Trait {
  id: TraitId;
  ko: string;              // 한국어 라벨
  en: string;              // 영어 라벨
  /** 자소서에 들어갈 설명 한 줄 (TOPIK 3-4 친화) */
  description: string;
  /** 이 trait가 어느 카테고리에 속하는지 */
  category: StrengthCategory;
}

// ─── 강점 카드 (24장) ─────────────────────────────────

export interface StrengthCard {
  /** 카드 고유 ID (예: 'card_listen') */
  id: string;
  category: StrengthCategory;
  /** 시각 단서용 이모지 */
  emoji: string;
  /** TOPIK 3-4 친화 짧은 한 마디 */
  labelKo: string;
  /** 영어 라벨 (병기용) */
  labelEn: string;
  /** 이 카드가 매핑되는 trait들 (1~3개) */
  traits: TraitId[];
}

// ─── 강점 결과 카드 (라이브러리) ──────────────────────
//
// 사용자가 카드 6장을 고르고 별명·퀴즈를 답하면
// AI가 이 라이브러리 중에서 5개를 뽑거나, 필요 시 새로 생성한다.
// 라이브러리의 결과는 "안전한 기본 선택지" 역할.

export interface StrengthResult {
  /** 결과 ID */
  id: string;
  /** 사용자가 보는 카드 이름 (예: "끈기 있는 학습자") */
  nameKo: string;
  nameEn: string;
  /** 카드에 들어갈 큰 이모지 */
  icon: string;
  /** 한 줄 설명 (사용자 표시 + 자소서 투입 재료) */
  description: string;
  /** 이 결과를 대표하는 핵심 trait들 (2~4개) */
  coreTraits: TraitId[];
  /** 이 결과가 뽑히는 카드 조합 힌트 (AI 추천 가중치용) */
  triggerCardIds?: string[];
  /** 이 강점을 가진 사용자에게 우선 던질 STAR 질문 ID 목록 */
  preferredQuestionIds: string[];
}

// ─── STAR 질문 ────────────────────────────────────────

export type StarQuestionCategory =
  | 'achievement'         // 성취
  | 'problem_solving'     // 문제 해결
  | 'collaboration'       // 협업·갈등
  | 'failure_learning'    // 실패·배움
  | 'new_challenge'       // 새로운 도전
  | 'persistence'         // 꾸준함
  | 'helping_others'      // 타인 도움
  | 'korea_adaptation';   // 한국 적응

export interface StarQuestion {
  id: string;
  category: StarQuestionCategory;
  /** 메인 질문 (TOPIK 3-4 친화) */
  mainQuestionKo: string;
  mainQuestionEn: string;
  /** 짧은 설명/예시 (건너뛰기 방지용 힌트) */
  hintKo: string;
  hintEn: string;
  /** STAR 후속 질문 4개 (상황-과제-행동-결과 순) */
  followUps: {
    situation: { ko: string; en: string };
    task: { ko: string; en: string };
    action: { ko: string; en: string };
    result: { ko: string; en: string };
  };
  /** 이 질문에서 추출 가능한 역량 후보 */
  extractableTraits: TraitId[];
  /** 한국 경험이 없으면 이 질문을 노출하지 말아야 하는지 */
  requiresKoreaExperience: boolean;
  /** 예상 답변 소요 시간 (분) */
  estimatedMinutes: number;
}

// ─── 사용자 세션 상태 (0단계 진행 중) ──────────────────

export interface StrengthDiscoverySession {
  sessionId: string;
  userId: string;
  /** 0-A: 초기 프로필 입력 */
  initialProfile?: {
    desiredJob?: string;                  // 희망 직무 (선택)
    homeCountryJob?: string;              // 모국 경력 (선택)
  };
  /** 0-B: 선택한 카드 6개 ID */
  selectedCardIds?: string[];
  /** 0-C: 별명 한 줄 */
  nickname?: string;
  /** 0-D: 스타일 퀴즈 답 */
  quizAnswers?: {
    workStyle?: 'alone' | 'team';
    praiseType?: 'accurate' | 'fast' | 'kind' | 'creative';
    taskType?: 'routine' | 'new';
  };
  /** 0-E: AI가 도출한 최종 강점 5장 */
  resultStrengths?: StrengthResult[];
  /** 사용자가 👎 한 강점 ID (제외됨) */
  rejectedResultIds?: string[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}
