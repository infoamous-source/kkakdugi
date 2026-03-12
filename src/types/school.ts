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

export type ViralTone = 'spicy' | 'emotional' | 'informative';
export type ImageStyle = 'illustration' | 'realistic' | 'minimal' | 'popart' | 'custom';

export interface ViralCardSlide {
  step: 'hook' | 'empathy' | 'solution' | 'action';
  stepLabel: string;
  copyText: string;
  imagePrompt: string;
  imageBase64?: string;
  colorScheme: { primary: string; secondary: string; gradient: string };
  designTip: string;
}

export interface ViralCardResult {
  completedAt: string;
  input: {
    productName: string;
    targetPersona: string;
    usp: string;
    tone: ViralTone;
    imageStyle: ImageStyle;
  };
  output: {
    slides: ViralCardSlide[];
    overallStrategy: string;
  };
}

// ─── Perfect Planner (5교시) 타입 ───

export type PlannerMode = 'landing' | 'liveCommerce';

export interface LandingPagePlan {
  headline: string;
  subheadline: string;
  problemSection: { title: string; painPoints: string[] };
  features: { title: string; description: string; benefit: string }[];
  trustSignals: { type: 'review' | 'certification' | 'stats'; content: string }[];
  closingCTA: { mainCopy: string; buttonText: string; urgency: string };
  checklist: string[];
}

export interface LiveCommerceScript {
  opening: { greeting: string; hook: string; todaysOffer: string };
  demoPoints: { timestamp: string; action: string; talkingPoint: string }[];
  qnaHandling: { commonQuestion: string; answer: string }[];
  closing: { finalOffer: string; urgencyTactic: string; farewell: string };
  checklist: string[];
}

export interface PerfectPlannerResult {
  completedAt: string;
  input: {
    productName: string;
    coreTarget: string;
    usp: string;
    strongOffer: string;
  };
  output: {
    landingPage: LandingPagePlan;
    liveCommerce: LiveCommerceScript;
    salesLogic: string;
  };
}

// ─── ROAS Simulator (6교시) 타입 ───

export interface ROASSimulationInput {
  productName: string;
  productPrice: number;
  adBudget: number;
  adChannel: 'instagram' | 'naver' | 'kakao' | 'youtube';
  targetAge: string;
  duration: 7 | 14 | 30;
}

export interface ROASSimulationOutput {
  estimatedImpressions: number;
  estimatedClicks: number;
  estimatedCTR: number;
  estimatedConversions: number;
  estimatedCVR: number;
  estimatedRevenue: number;
  estimatedROAS: number;
  costPerClick: number;
  costPerConversion: number;
  roasGrade: 'excellent' | 'good' | 'average' | 'poor';
  advice: string[];
  channelTip: string;
  analysisReport?: string;
}

/** 시뮬레이션 (6교시 ROAS) 결과 */
export interface SimulationResult {
  completedAt: string;
  input?: ROASSimulationInput;
  output?: ROASSimulationOutput;
  roas?: number;
  budget?: number;
  revenue?: number;
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
