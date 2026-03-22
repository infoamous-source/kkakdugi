import type { MarketingModule, MarketingTool } from '../../types/marketing';

// ─── 7개 마케팅 모듈 데이터 ───

export const marketingModules: MarketingModule[] = [
  // ── 🟦 기초를 다져요 (Foundation) ──
  {
    id: 'mk-01',
    stage: 'foundation',
    titleKey: 'marketing.modules.basics.title',
    descriptionKey: 'marketing.modules.basics.description',
    oneLineKey: 'marketing.modules.basics.oneLine',
    icon: 'BookOpen',
    duration: '1.5h',
    lessons: 5,
    toolIds: ['glossary'],
    color: 'blue',
    learningItems: [
      {
        id: 'mk-01-01',
        titleKey: 'marketing.modules.basics.learning.whatIsMarketing',
        descriptionKey: 'marketing.modules.basics.learning.whatIsMarketingDesc',
        order: 1,
      },
      {
        id: 'mk-01-02',
        titleKey: 'marketing.modules.basics.learning.trend2026',
        descriptionKey: 'marketing.modules.basics.learning.trend2026Desc',
        order: 2,
      },
      {
        id: 'mk-01-03',
        titleKey: 'marketing.modules.basics.learning.marketerJobs',
        descriptionKey: 'marketing.modules.basics.learning.marketerJobsDesc',
        order: 3,
      },
    ],
  },
  {
    id: 'mk-02',
    stage: 'foundation',
    titleKey: 'marketing.modules.research.title',
    descriptionKey: 'marketing.modules.research.description',
    oneLineKey: 'marketing.modules.research.oneLine',
    icon: 'Search',
    duration: '2h',
    lessons: 6,
    toolIds: ['persona-maker'],
    color: 'blue',
    learningItems: [
      {
        id: 'mk-02-01',
        titleKey: 'marketing.modules.research.learning.howToResearch',
        descriptionKey: 'marketing.modules.research.learning.howToResearchDesc',
        order: 1,
      },
      {
        id: 'mk-02-02',
        titleKey: 'marketing.modules.research.learning.findTarget',
        descriptionKey: 'marketing.modules.research.learning.findTargetDesc',
        order: 2,
      },
      {
        id: 'mk-02-03',
        titleKey: 'marketing.modules.research.learning.competitor',
        descriptionKey: 'marketing.modules.research.learning.competitorDesc',
        order: 3,
      },
    ],
  },
  {
    id: 'mk-03',
    stage: 'foundation',
    titleKey: 'marketing.modules.concept.title',
    descriptionKey: 'marketing.modules.concept.description',
    oneLineKey: 'marketing.modules.concept.oneLine',
    icon: 'Lightbulb',
    duration: '1.5h',
    lessons: 5,
    toolIds: ['usp-finder'],
    color: 'blue',
    learningItems: [
      {
        id: 'mk-03-01',
        titleKey: 'marketing.modules.concept.learning.usp',
        descriptionKey: 'marketing.modules.concept.learning.uspDesc',
        order: 1,
      },
      {
        id: 'mk-03-02',
        titleKey: 'marketing.modules.concept.learning.brandStory',
        descriptionKey: 'marketing.modules.concept.learning.brandStoryDesc',
        order: 2,
      },
      {
        id: 'mk-03-03',
        titleKey: 'marketing.modules.concept.learning.slogan',
        descriptionKey: 'marketing.modules.concept.learning.sloganDesc',
        order: 3,
      },
    ],
  },

  // ── 🟪 실무를 배워요 (Practice) ──
  {
    id: 'mk-04',
    stage: 'practice',
    titleKey: 'marketing.modules.branding.title',
    descriptionKey: 'marketing.modules.branding.description',
    oneLineKey: 'marketing.modules.branding.oneLine',
    icon: 'Palette',
    duration: '2h',
    lessons: 6,
    toolIds: ['color-picker'],
    color: 'purple',
    learningItems: [
      {
        id: 'mk-04-01',
        titleKey: 'marketing.modules.branding.learning.brandColor',
        descriptionKey: 'marketing.modules.branding.learning.brandColorDesc',
        order: 1,
      },
      {
        id: 'mk-04-02',
        titleKey: 'marketing.modules.branding.learning.logoFont',
        descriptionKey: 'marketing.modules.branding.learning.logoFontDesc',
        order: 2,
      },
      {
        id: 'mk-04-03',
        titleKey: 'marketing.modules.branding.learning.detailPage',
        descriptionKey: 'marketing.modules.branding.learning.detailPageDesc',
        order: 3,
      },
    ],
  },
  {
    id: 'mk-05',
    stage: 'practice',
    titleKey: 'marketing.modules.content.title',
    descriptionKey: 'marketing.modules.content.description',
    oneLineKey: 'marketing.modules.content.oneLine',
    icon: 'Share2',
    duration: '2.5h',
    lessons: 8,
    toolIds: ['hashtag-generator'],
    color: 'purple',
    learningItems: [
      {
        id: 'mk-05-01',
        titleKey: 'marketing.modules.content.learning.channels',
        descriptionKey: 'marketing.modules.content.learning.channelsDesc',
        order: 1,
      },
      {
        id: 'mk-05-02',
        titleKey: 'marketing.modules.content.learning.cardNews',
        descriptionKey: 'marketing.modules.content.learning.cardNewsDesc',
        order: 2,
      },
      {
        id: 'mk-05-03',
        titleKey: 'marketing.modules.content.learning.hashtag',
        descriptionKey: 'marketing.modules.content.learning.hashtagDesc',
        order: 3,
      },
    ],
  },
  {
    id: 'mk-06',
    stage: 'practice',
    titleKey: 'marketing.modules.performance.title',
    descriptionKey: 'marketing.modules.performance.description',
    oneLineKey: 'marketing.modules.performance.oneLine',
    icon: 'DollarSign',
    duration: '2h',
    lessons: 6,
    toolIds: ['roi-calculator'],
    color: 'purple',
    learningItems: [
      {
        id: 'mk-06-01',
        titleKey: 'marketing.modules.performance.learning.whatIs',
        descriptionKey: 'marketing.modules.performance.learning.whatIsDesc',
        order: 1,
      },
      {
        id: 'mk-06-02',
        titleKey: 'marketing.modules.performance.learning.adTypes',
        descriptionKey: 'marketing.modules.performance.learning.adTypesDesc',
        order: 2,
      },
      {
        id: 'mk-06-03',
        titleKey: 'marketing.modules.performance.learning.readData',
        descriptionKey: 'marketing.modules.performance.learning.readDataDesc',
        order: 3,
      },
    ],
  },

  // ── 🟥 AI로 실습해요 (AI Practice) ──
  {
    id: 'mk-07',
    stage: 'ai',
    titleKey: 'marketing.modules.aiPractice.title',
    descriptionKey: 'marketing.modules.aiPractice.description',
    oneLineKey: 'marketing.modules.aiPractice.oneLine',
    icon: 'Sparkles',
    duration: '3h',
    lessons: 8,
    toolIds: ['k-copywriter', 'sns-ad-maker'],
    color: 'red',
    learningItems: [
      {
        id: 'mk-07-01',
        titleKey: 'marketing.modules.aiPractice.learning.aiWorkflow',
        descriptionKey: 'marketing.modules.aiPractice.learning.aiWorkflowDesc',
        order: 1,
      },
      {
        id: 'mk-07-02',
        titleKey: 'marketing.modules.aiPractice.learning.promptEngineering',
        descriptionKey: 'marketing.modules.aiPractice.learning.promptEngineeringDesc',
        order: 2,
      },
      {
        id: 'mk-07-03',
        titleKey: 'marketing.modules.aiPractice.learning.practiceAd',
        descriptionKey: 'marketing.modules.aiPractice.learning.practiceAdDesc',
        order: 3,
      },
    ],
  },
];

// ─── 8개 실무 툴 데이터 ───

export const marketingTools: MarketingTool[] = [
  {
    id: 'glossary',
    nameKey: 'marketing.tools.glossary.title',
    descriptionKey: 'marketing.tools.glossary.description',
    moduleId: 'mk-01',
    type: 'static',
    icon: 'BookOpen',
    route: '/marketing/tools/glossary',
  },
  {
    id: 'persona-maker',
    nameKey: 'marketing.tools.personaMaker.title',
    descriptionKey: 'marketing.tools.personaMaker.description',
    moduleId: 'mk-02',
    type: 'interactive',
    icon: 'UserCircle',
    route: '/marketing/tools/persona-maker',
  },
  {
    id: 'usp-finder',
    nameKey: 'marketing.tools.uspFinder.title',
    descriptionKey: 'marketing.tools.uspFinder.description',
    moduleId: 'mk-03',
    type: 'interactive',
    icon: 'Target',
    route: '/marketing/tools/usp-finder',
  },
  {
    id: 'color-picker',
    nameKey: 'marketing.tools.colorPicker.title',
    descriptionKey: 'marketing.tools.colorPicker.description',
    moduleId: 'mk-04',
    type: 'interactive',
    icon: 'Palette',
    route: '/marketing/tools/color-picker',
  },
  {
    id: 'hashtag-generator',
    nameKey: 'marketing.tools.hashtagGenerator.title',
    descriptionKey: 'marketing.tools.hashtagGenerator.description',
    moduleId: 'mk-05',
    type: 'interactive',
    icon: 'Hash',
    route: '/marketing/tools/hashtag-generator',
  },
  {
    id: 'roi-calculator',
    nameKey: 'marketing.tools.roiCalculator.title',
    descriptionKey: 'marketing.tools.roiCalculator.description',
    moduleId: 'mk-06',
    type: 'interactive',
    icon: 'Calculator',
    route: '/marketing/tools/roi-calculator',
  },
  {
    id: 'k-copywriter',
    nameKey: 'marketing.tools.kCopywriter.title',
    descriptionKey: 'marketing.tools.kCopywriter.description',
    moduleId: 'mk-07',
    type: 'ai',
    icon: 'PenTool',
    route: '/marketing/tools/k-copywriter',
  },
  {
    id: 'sns-ad-maker',
    nameKey: 'marketing.tools.snsAdMaker.title',
    descriptionKey: 'marketing.tools.snsAdMaker.description',
    moduleId: 'mk-07',
    type: 'ai',
    icon: 'Image',
    route: '/marketing/tools/sns-ad-maker',
  },
];

// ─── 스테이지 설정 ───

export const marketingStages = [
  {
    id: 'foundation',
    nameKey: 'marketing.stages.foundation',
    emoji: '🟦',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  {
    id: 'practice',
    nameKey: 'marketing.stages.practice',
    emoji: '🟪',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
  },
  {
    id: 'ai',
    nameKey: 'marketing.stages.ai',
    emoji: '🟥',
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
  },
] as const;

// ─── 강사 프로필 ───

export const instructorProfile = {
  name: '유수인',
  nameEn: 'Yoo Suin',
  titleKey: 'marketing.instructor.title',
  descriptionKey: 'marketing.instructor.description',
  credentials: [
    'marketing.instructor.credential1',
    'marketing.instructor.credential2',
    'marketing.instructor.credential3',
  ],
};

// ─── 추천 대상 ───

export const recommendTargets = [
  {
    icon: 'GraduationCap',
    textKey: 'marketing.recommend.target1',
  },
  {
    icon: 'Briefcase',
    textKey: 'marketing.recommend.target2',
  },
  {
    icon: 'Rocket',
    textKey: 'marketing.recommend.target3',
  },
  {
    icon: 'Globe',
    textKey: 'marketing.recommend.target4',
  },
];
