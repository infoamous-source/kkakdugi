// ─── 마케팅 학교 타입 정의 ───

/** 6교시 커리큘럼 교시 ID */
export type PeriodId = 'aptitude-test' | 'market-scanner' | 'edge-maker' | 'viral-card-maker' | 'perfect-planner' | 'roas-simulator';

/** 교시 정보 */
export interface SchoolPeriod {
  id: PeriodId;
  period: number;           // 1~6
  nameKey: string;           // i18n 키
  descriptionKey: string;    // i18n 키
  icon: string;              // lucide 아이콘 이름
  color: string;             // tailwind 색상
  toolRoute: string;         // 도구 라우트
}

/** 스탬프 진행도 */
export interface StampProgress {
  periodId: PeriodId;
  completed: boolean;
  completedAt?: string;      // ISO date string
}

/** 졸업 상태 */
export interface GraduationStatus {
  isGraduated: boolean;
  graduatedAt?: string;      // ISO date string
  review?: string;           // "선생님께 한마디"
  proExpiresAt?: string;     // Pro 도구 만료일 (졸업 후 30일)
}

export type PersonaId = 'CEO' | 'PM' | 'CPO' | 'CMO' | 'CSL';

export interface PersonaInfo {
  id: PersonaId;
  emoji: string;
  nameKey: string;
  titleKey: string;
  descriptionKey: string;
  color: string;
  strengths: string[];
}

export interface AptitudeResult {
  completedAt: string;
  answers: Record<string, string>;
  resultType: PersonaId;
  scores: Record<PersonaId, number>;
  questionSetId?: string;  // 'set1' | 'set2' | 'set3'
}

// ─── Market Compass 타입 ───

export interface MarketCompassData {
  marketScannerResult?: MarketScannerResult;
  edgeMakerResult?: EdgeMakerResult;
  viralCardResult?: ViralCardResult;
  perfectPlannerResult?: PerfectPlannerResult;
}

export interface MarketScannerResult {
  completedAt: string;
  input: { itemKeyword: string; targetAge: string; targetGender: string; itemType?: string };
  output: {
    relatedKeywords: string[];
    competitors: CompetitorInfo[];
    painPoints: string[];
    analysisReport?: string;
  };
}

export interface CompetitorInfo {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export interface EdgeMakerResult {
  completedAt: string;
  input: { painPoints: string[]; myStrengths: string[]; competitors?: CompetitorInfo[] };
  output: {
    usp: string;
    brandNames: { name: string; type: 'emotional' | 'intuitive' | 'fun'; reasoning: string }[];
    slogan: string;
    brandMood: { primaryColor: string; secondaryColor: string; tone: string; keywords: string[] };
    brandingReport?: string;
  };
}

// ─── Viral Card Maker (4교시) 타입 ───
// mockup 확정안: Pexels 이미지 + 5가지 레이아웃 템플릿

export type ViralTone = 'spicy' | 'emotional' | 'informative';
export type ViralImageSource = 'pexels' | 'ai';
export type ViralCardTemplate = 'A' | 'B' | 'C' | 'D' | 'E';
export type ViralStep = 'hook' | 'empathy' | 'solution' | 'action';

export interface ViralCardSlide {
  step: ViralStep;
  stepLabel: string;  // "HOOK" / "EMPATHY" / "SOLUTION" / "ACTION"
  stepKoLabel: string; // "시선잡기" / "공감" / "해결" / "행동"
  copyText: string;   // 짧은 한국어 카피 (2-3줄, \n 허용)
  highlightWord?: string; // 노란색으로 강조할 단어
  imageKeyword: string; // Pexels용 짧은 영어 키워드 (5단어 이내)
  imageUrl?: string;   // Pexels URL (런타임에 채워짐)
  template: ViralCardTemplate; // A~E
  showBrand: boolean;  // 카드 3,4번만 true
}

export interface ViralCardResult {
  completedAt: string;
  input: {
    productName: string;
    targetPersonas: string[];
    usp: string;
    tone: ViralTone;
    imageSource: ViralImageSource;
  };
  output: {
    slides: ViralCardSlide[];
  };
}

// ─── Perfect Planner (5교시) 타입 ───
// mockup 확정안: 상세페이지(모바일 쇼핑몰 톤) + 라이브 방송 대본(큐시트)

export type PlannerMode = 'detail' | 'live';
export type AttentionType = 'B' | 'C'; // B: 어그로형, C: 사회적 증거형

export interface DetailPagePainPoint {
  emoji: string;
  text: string; // "출근 전 카페에서\n줄 서는 게 지치는 사람!" 형태
}

export interface DetailPageFeature {
  emoji: string;
  title: string;       // "단 3분"
  description: string; // "물 붓고 기다리면 끝!\n카페 줄 안 서도 돼요"
  colorKey: 'amber' | 'green' | 'blue';
}

export interface DetailPageReview {
  stars: string; // "★★★★★"
  text: string;
  author: string;
}

export interface DetailPagePlan {
  productTitle: string;        // 긴 상품명
  brandLine: string;           // "DripQ 공식"
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  rating: number;              // 4.8
  reviewCount: number;         // 2341
  countdownLabel: string;      // "⏰ 오늘 자정 종료까지"
  countdownValue: string;      // "06:23:41"
  attentionLine: { type: AttentionType; text: string }; // 어그로 한 줄 (\n 허용)
  headlinePrefix: string;      // "잠깐, 혹시"
  headline: string;            // "3분이면\n카페가\n우리집?!" (\n 허용)
  headlineHighlight: string;   // "우리집?!" (노란색 하이라이트 단어)
  painPointsTitle: string;     // "😩 혹시 이런 분\n아니세요?"
  painPoints: DetailPagePainPoint[];
  solutionPrefix: string;      // "그래서 만들었어요"
  solutionHeadline: string;    // "캡슐 한 알이면\n카페가 부엌에"
  featuresTitle: string;       // "✅ DripQ만의\n3가지 약속"
  features: DetailPageFeature[];
  reviews: DetailPageReview[];
  finalCtaDeadline: string;    // "⏰ 오늘 자정 종료"
  finalCtaHeadline: string;    // "놓치면\n30,000원 그대로"
  stickyCtaText: string;       // "21,000원 · 구매하기"
}

export interface LiveCueSheetItem {
  emoji: string;          // "🎬"
  timeRange: string;      // "0:00 ~ 2:00"
  title: string;          // "오프닝"
  duration: string;       // "2분"
  hostScript: string;     // 진행자 멘트
  action?: string;        // 📌 액션
  audienceReaction?: string; // 💬 시청자
  extra?: string;         // 추가 노트
  colorKey: 'orange' | 'amber' | 'green' | 'blue' | 'red';
}

export interface LiveScript {
  title: string;           // "DripQ 캡슐 · 30분 라이브 큐시트"
  expectedViewers: string; // "예상 시청 600+"
  items: LiveCueSheetItem[];
}

export interface PerfectPlannerInput {
  productName: string;
  customers: string[];
  strengths: string[];
  offers: string[];
  mode: PlannerMode;
}

export interface PerfectPlannerResult {
  completedAt: string;
  input: PerfectPlannerInput;
  output: {
    detailPage: DetailPagePlan;
    liveScript: LiveScript;
  };
}

// ─── ROAS Simulator (6교시) 타입 ───
// mockup 확정안: 시뮬레이터 → 자가 진단기
// 학생이 직접 광고비/매출 입력 → ROAS 계산은 클라이언트(수식)
// AI는 한 줄 처방 + 오늘 할 일 1개만 (가벼운 호출)

export type ROASStatus = 'loss' | 'breakeven' | 'profit';

export type ROASChannel = 'instagram' | 'naver' | 'kakao' | 'youtube';

export interface ROASInput {
  adSpend: number;
  revenue: number;
  adChannel: ROASChannel;
}

export interface ROASOutput {
  roas: number;       // 매출 ÷ 광고비, 소수점 1자리
  profit: number;     // 매출 - 광고비
  status: ROASStatus; // <1.5 loss, 1.5~2.5 breakeven, >2.5 profit
  prescription: string; // 큰 한 줄 처방 (\n 1개 허용)
  todoOne: string;    // 오늘 할 일 1개
}

/** 시뮬레이션 (6교시 ROAS) 결과 */
export interface SimulationResult {
  completedAt: string;
  input: ROASInput;
  output: ROASOutput;
}

/** 학생의 학교 전체 진행도 (localStorage에 저장) */
export interface SchoolProgress {
  stamps: StampProgress[];
  graduation: GraduationStatus;
  aptitudeResult?: AptitudeResult;
  marketCompassData?: MarketCompassData;
  simulationResult?: SimulationResult;
  enrolledAt: string;        // 입학일
}

// ─── 커리큘럼 상수 ───

export const SCHOOL_CURRICULUM: SchoolPeriod[] = [
  {
    id: 'aptitude-test',
    period: 1,
    nameKey: 'school.periods.aptitudeTest.name',
    descriptionKey: 'school.periods.aptitudeTest.description',
    icon: 'ClipboardCheck',
    color: 'rose',
    toolRoute: '/marketing/school/tools/aptitude-test',
  },
  {
    id: 'market-scanner',
    period: 2,
    nameKey: 'school.periods.marketScanner.name',
    descriptionKey: 'school.periods.marketScanner.description',
    icon: 'Radar',
    color: 'blue',
    toolRoute: '/marketing/school/tools/market-scanner',
  },
  {
    id: 'edge-maker',
    period: 3,
    nameKey: 'school.periods.edgeMaker.name',
    descriptionKey: 'school.periods.edgeMaker.description',
    icon: 'Zap',
    color: 'amber',
    toolRoute: '/marketing/school/tools/edge-maker',
  },
  {
    id: 'viral-card-maker',
    period: 4,
    nameKey: 'school.periods.viralCardMaker.name',
    descriptionKey: 'school.periods.viralCardMaker.description',
    icon: 'Share2',
    color: 'purple',
    toolRoute: '/marketing/school/tools/viral-card-maker',
  },
  {
    id: 'perfect-planner',
    period: 5,
    nameKey: 'school.periods.perfectPlanner.name',
    descriptionKey: 'school.periods.perfectPlanner.description',
    icon: 'CalendarCheck',
    color: 'emerald',
    toolRoute: '/marketing/school/tools/perfect-planner',
  },
  {
    id: 'roas-simulator',
    period: 6,
    nameKey: 'school.periods.roasSimulator.name',
    descriptionKey: 'school.periods.roasSimulator.description',
    icon: 'TrendingUp',
    color: 'orange',
    toolRoute: '/marketing/school/tools/roas-simulator',
  },
];

/** Pro 도구 사용 가능 기간 (일) */
export const PRO_DURATION_DAYS = 30;

/** 총 교시 수 */
export const TOTAL_PERIODS = SCHOOL_CURRICULUM.length;

// ─── 9개 섹션 커리큘럼 표시용 타입 ───

export type SectionType = 'pre-school' | 'period' | 'final-project' | 'after-school';

export interface CurriculumStep {
  stepNumber: number;
  titleKey: string;
  descriptionKey: string;
  isPractice: boolean;
  toolRoute?: string;
  periodId?: PeriodId;
}

export interface CurriculumSection {
  id: string;
  type: SectionType;
  period?: number;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
  steps: CurriculumStep[];
}

export const CURRICULUM_SECTIONS: CurriculumSection[] = [
  // [Pre-School] 입학식
  {
    id: 'entrance',
    type: 'pre-school',
    titleKey: 'school.sections.entrance.title',
    subtitleKey: 'school.sections.entrance.subtitle',
    icon: 'PartyPopper',
    color: 'pink',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.entrance.step1.title', descriptionKey: 'school.sections.entrance.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.entrance.step2.title', descriptionKey: 'school.sections.entrance.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.entrance.step3.title', descriptionKey: 'school.sections.entrance.step3.desc', isPractice: false },
    ],
  },
  // 1교시: 기초 다지기
  {
    id: 'period-1',
    type: 'period',
    period: 1,
    titleKey: 'school.sections.period1.title',
    subtitleKey: 'school.sections.period1.subtitle',
    icon: 'ClipboardCheck',
    color: 'rose',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.period1.step1.title', descriptionKey: 'school.sections.period1.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.period1.step2.title', descriptionKey: 'school.sections.period1.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.period1.step3.title', descriptionKey: 'school.sections.period1.step3.desc', isPractice: true, toolRoute: '/marketing/school/tools/aptitude-test', periodId: 'aptitude-test' },
    ],
  },
  // 2교시: 시장 조사
  {
    id: 'period-2',
    type: 'period',
    period: 2,
    titleKey: 'school.sections.period2.title',
    subtitleKey: 'school.sections.period2.subtitle',
    icon: 'Radar',
    color: 'blue',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.period2.step1.title', descriptionKey: 'school.sections.period2.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.period2.step2.title', descriptionKey: 'school.sections.period2.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.period2.step3.title', descriptionKey: 'school.sections.period2.step3.desc', isPractice: true, toolRoute: '/marketing/school/tools/market-scanner', periodId: 'market-scanner' },
    ],
  },
  // 3교시: 브랜드 기획
  {
    id: 'period-3',
    type: 'period',
    period: 3,
    titleKey: 'school.sections.period3.title',
    subtitleKey: 'school.sections.period3.subtitle',
    icon: 'Zap',
    color: 'amber',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.period3.step1.title', descriptionKey: 'school.sections.period3.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.period3.step2.title', descriptionKey: 'school.sections.period3.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.period3.step3.title', descriptionKey: 'school.sections.period3.step3.desc', isPractice: true, toolRoute: '/marketing/school/tools/edge-maker', periodId: 'edge-maker' },
    ],
  },
  // 4교시: 광고 만들기
  {
    id: 'period-4',
    type: 'period',
    period: 4,
    titleKey: 'school.sections.period4.title',
    subtitleKey: 'school.sections.period4.subtitle',
    icon: 'Share2',
    color: 'purple',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.period4.step1.title', descriptionKey: 'school.sections.period4.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.period4.step2.title', descriptionKey: 'school.sections.period4.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.period4.step3.title', descriptionKey: 'school.sections.period4.step3.desc', isPractice: true, toolRoute: '/marketing/school/tools/viral-card-maker', periodId: 'viral-card-maker' },
    ],
  },
  // 5교시: 설득의 기술
  {
    id: 'period-5',
    type: 'period',
    period: 5,
    titleKey: 'school.sections.period5.title',
    subtitleKey: 'school.sections.period5.subtitle',
    icon: 'CalendarCheck',
    color: 'emerald',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.period5.step1.title', descriptionKey: 'school.sections.period5.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.period5.step2.title', descriptionKey: 'school.sections.period5.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.period5.step3.title', descriptionKey: 'school.sections.period5.step3.desc', isPractice: true, toolRoute: '/marketing/school/tools/perfect-planner', periodId: 'perfect-planner' },
    ],
  },
  // 6교시: 성과 측정
  {
    id: 'period-6',
    type: 'period',
    period: 6,
    titleKey: 'school.sections.period6.title',
    subtitleKey: 'school.sections.period6.subtitle',
    icon: 'TrendingUp',
    color: 'orange',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.period6.step1.title', descriptionKey: 'school.sections.period6.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.period6.step2.title', descriptionKey: 'school.sections.period6.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.period6.step3.title', descriptionKey: 'school.sections.period6.step3.desc', isPractice: true, toolRoute: '/marketing/school/tools/roas-simulator', periodId: 'roas-simulator' },
    ],
  },
  // [Final Step] 졸업 과제
  {
    id: 'final-project',
    type: 'final-project',
    titleKey: 'school.sections.finalProject.title',
    subtitleKey: 'school.sections.finalProject.subtitle',
    icon: 'FileText',
    color: 'violet',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.finalProject.step1.title', descriptionKey: 'school.sections.finalProject.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.finalProject.step2.title', descriptionKey: 'school.sections.finalProject.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.finalProject.step3.title', descriptionKey: 'school.sections.finalProject.step3.desc', isPractice: false },
    ],
  },
  // [After-School] 졸업식
  {
    id: 'graduation-ceremony',
    type: 'after-school',
    titleKey: 'school.sections.graduation.title',
    subtitleKey: 'school.sections.graduation.subtitle',
    icon: 'Award',
    color: 'amber',
    steps: [
      { stepNumber: 1, titleKey: 'school.sections.graduation.step1.title', descriptionKey: 'school.sections.graduation.step1.desc', isPractice: false },
      { stepNumber: 2, titleKey: 'school.sections.graduation.step2.title', descriptionKey: 'school.sections.graduation.step2.desc', isPractice: false },
      { stepNumber: 3, titleKey: 'school.sections.graduation.step3.title', descriptionKey: 'school.sections.graduation.step3.desc', isPractice: false },
    ],
  },
];
