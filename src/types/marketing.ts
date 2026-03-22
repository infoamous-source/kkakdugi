// 마케팅 실무 트랙 타입 정의

export type MarketingStage = 'foundation' | 'practice' | 'ai';

export interface MarketingModule {
  id: string;
  stage: MarketingStage;
  titleKey: string;
  descriptionKey: string;
  oneLineKey: string;         // 한 줄 설명 i18n 키
  icon: string;               // lucide-react 아이콘 이름
  duration: string;
  lessons: number;
  toolIds: string[];          // 연결된 툴 ID 배열
  color: string;              // Tailwind 색상
  learningItems: LearningItem[];
}

export interface LearningItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  order: number;
}

export interface MarketingTool {
  id: string;
  nameKey: string;
  descriptionKey: string;
  moduleId: string;
  type: 'static' | 'interactive' | 'ai';
  icon: string;
  route: string;              // 라우트 경로
}

// 용어 사전 (Glossary)
export interface GlossaryTerm {
  id: string;
  term: string;               // 원어 (영어)
  termKo: string;             // 한국어 표기
  easyExplanation: string;    // TOPIK 2-3급 쉬운 설명
  example: string;            // 사용 예시
  category: GlossaryCategory;
}

export type GlossaryCategory = 'basic' | 'digital' | 'sns' | 'performance' | 'branding' | 'ai';

// 페르소나 메이커
export interface PersonaData {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  interests: string[];
  painPoints: string[];
  goals: string[];
  personality: string;
  favoriteChannels: string[];
}

// 감정 → 색상 매핑
export interface ColorEmotion {
  id: string;
  emotion: string;
  emotionKo: string;
  description: string;
  mainColor: ColorInfo;
  subColors: ColorInfo[];
}

export interface ColorInfo {
  hex: string;
  name: string;
  nameKo: string;
}

// 해시태그
export interface HashtagGroup {
  keyword: string;
  hashtags: string[];
  category: 'trending' | 'niche' | 'brand' | 'community';
}

// 2026 트렌드
export interface TrendKeyword {
  id: string;
  keyword: string;
  keywordKo: string;
  titleKo: string;
  descriptionKo: string;
  icon: string;
  color: string;
}

// 포트폴리오 엔트리
export interface PortfolioEntry {
  id: string;
  userId: string;
  toolId: string;
  moduleId: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
  isMockData: boolean;
}

// 모듈 진행 상태
export interface ModuleProgress {
  moduleId: string;
  viewedAt?: string;
  toolUsedAt?: string;
  completedAt?: string;
  toolOutputCount: number;
}

// AI 카피라이터 관련
export interface CopywriterInput {
  productName: string;
  target: string;
  tone: 'emotional' | 'fun' | 'serious' | 'trendy' | 'storytelling';
  length?: 'short' | 'medium' | 'long';
}

export interface CopywriterOutput {
  copies: string[];
  isMockData: boolean;
}

// SNS 광고 메이커 관련
export type AdImageStyle = 'realistic' | 'illustration' | '3d' | 'popart';

export interface AdMakerInput {
  subject: string;
  style: AdImageStyle;
  copyText: string;
}

export interface AdMakerOutput {
  imageUrl: string;
  copyText: string;
  isMockData: boolean;
}
