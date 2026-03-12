export type DigitalPeriodId =
  | 'smartphone-setup'
  | 'kakao-auth'
  | 'kiosk-challenge'
  | 'gov24-docs'
  | 'translation-ai'
  | 'digital-safety';

export interface DigitalSchoolPeriod {
  id: DigitalPeriodId;
  period: number;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  toolRoute: string;
}

export interface DigitalStampProgress {
  periodId: DigitalPeriodId;
  completed: boolean;
  completedAt?: string;
}

export interface DigitalChecklistResult {
  periodId: DigitalPeriodId;
  completedAt: string;
  checkedItems: string[];
  totalItems: number;
}

export interface DigitalSchoolProgress {
  stamps: DigitalStampProgress[];
  graduation: {
    isGraduated: boolean;
    graduatedAt?: string;
    review?: string;
  };
  checklistResults: Record<string, DigitalChecklistResult>;
  enrolledAt: string;
}

export const DIGITAL_SCHOOL_CURRICULUM: DigitalSchoolPeriod[] = [
  {
    id: 'smartphone-setup',
    period: 1,
    nameKey: 'digitalSchool.periods.smartphoneSetup.name',
    descriptionKey: 'digitalSchool.periods.smartphoneSetup.description',
    icon: 'Smartphone',
    color: 'blue',
    toolRoute: '/digital/school/tools/smartphone-setup',
  },
  {
    id: 'kakao-auth',
    period: 2,
    nameKey: 'digitalSchool.periods.kakaoAuth.name',
    descriptionKey: 'digitalSchool.periods.kakaoAuth.description',
    icon: 'ShieldCheck',
    color: 'amber',
    toolRoute: '/digital/school/tools/kakao-auth',
  },
  {
    id: 'kiosk-challenge',
    period: 3,
    nameKey: 'digitalSchool.periods.kioskChallenge.name',
    descriptionKey: 'digitalSchool.periods.kioskChallenge.description',
    icon: 'Monitor',
    color: 'purple',
    toolRoute: '/digital/school/tools/kiosk-challenge',
  },
  {
    id: 'gov24-docs',
    period: 4,
    nameKey: 'digitalSchool.periods.gov24Docs.name',
    descriptionKey: 'digitalSchool.periods.gov24Docs.description',
    icon: 'FileText',
    color: 'emerald',
    toolRoute: '/digital/school/tools/gov24-docs',
  },
  {
    id: 'translation-ai',
    period: 5,
    nameKey: 'digitalSchool.periods.translationAi.name',
    descriptionKey: 'digitalSchool.periods.translationAi.description',
    icon: 'Languages',
    color: 'rose',
    toolRoute: '/digital/school/tools/translation-ai',
  },
  {
    id: 'digital-safety',
    period: 6,
    nameKey: 'digitalSchool.periods.digitalSafety.name',
    descriptionKey: 'digitalSchool.periods.digitalSafety.description',
    icon: 'ShieldAlert',
    color: 'orange',
    toolRoute: '/digital/school/tools/digital-safety',
  },
];

export const DIGITAL_TOTAL_PERIODS = DIGITAL_SCHOOL_CURRICULUM.length;

export type DigitalSectionType = 'pre-school' | 'period' | 'final-project' | 'after-school';

export interface DigitalCurriculumStep {
  stepNumber: number;
  titleKey: string;
  descriptionKey: string;
  isPractice: boolean;
  toolRoute?: string;
  periodId?: DigitalPeriodId;
}

export interface DigitalCurriculumSection {
  id: string;
  type: DigitalSectionType;
  period?: number;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
  steps: DigitalCurriculumStep[];
}

export const DIGITAL_CURRICULUM_SECTIONS: DigitalCurriculumSection[] = [
  {
    id: 'entrance',
    type: 'pre-school',
    titleKey: 'digitalSchool.sections.entrance.title',
    subtitleKey: 'digitalSchool.sections.entrance.subtitle',
    icon: 'GraduationCap',
    color: 'blue',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.entrance.steps.1.title',
        descriptionKey: 'digitalSchool.sections.entrance.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.entrance.steps.2.title',
        descriptionKey: 'digitalSchool.sections.entrance.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.entrance.steps.3.title',
        descriptionKey: 'digitalSchool.sections.entrance.steps.3.description',
        isPractice: false,
      },
    ],
  },
  {
    id: 'period-1',
    type: 'period',
    period: 1,
    titleKey: 'digitalSchool.sections.period-1.title',
    subtitleKey: 'digitalSchool.sections.period-1.subtitle',
    icon: 'Smartphone',
    color: 'blue',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.period-1.steps.1.title',
        descriptionKey: 'digitalSchool.sections.period-1.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.period-1.steps.2.title',
        descriptionKey: 'digitalSchool.sections.period-1.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.period-1.steps.3.title',
        descriptionKey: 'digitalSchool.sections.period-1.steps.3.description',
        isPractice: true,
        toolRoute: '/digital/school/tools/smartphone-setup',
        periodId: 'smartphone-setup',
      },
    ],
  },
  {
    id: 'period-2',
    type: 'period',
    period: 2,
    titleKey: 'digitalSchool.sections.period-2.title',
    subtitleKey: 'digitalSchool.sections.period-2.subtitle',
    icon: 'ShieldCheck',
    color: 'amber',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.period-2.steps.1.title',
        descriptionKey: 'digitalSchool.sections.period-2.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.period-2.steps.2.title',
        descriptionKey: 'digitalSchool.sections.period-2.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.period-2.steps.3.title',
        descriptionKey: 'digitalSchool.sections.period-2.steps.3.description',
        isPractice: true,
        toolRoute: '/digital/school/tools/kakao-auth',
        periodId: 'kakao-auth',
      },
    ],
  },
  {
    id: 'period-3',
    type: 'period',
    period: 3,
    titleKey: 'digitalSchool.sections.period-3.title',
    subtitleKey: 'digitalSchool.sections.period-3.subtitle',
    icon: 'Monitor',
    color: 'purple',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.period-3.steps.1.title',
        descriptionKey: 'digitalSchool.sections.period-3.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.period-3.steps.2.title',
        descriptionKey: 'digitalSchool.sections.period-3.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.period-3.steps.3.title',
        descriptionKey: 'digitalSchool.sections.period-3.steps.3.description',
        isPractice: true,
        toolRoute: '/digital/school/tools/kiosk-challenge',
        periodId: 'kiosk-challenge',
      },
    ],
  },
  {
    id: 'period-4',
    type: 'period',
    period: 4,
    titleKey: 'digitalSchool.sections.period-4.title',
    subtitleKey: 'digitalSchool.sections.period-4.subtitle',
    icon: 'FileText',
    color: 'emerald',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.period-4.steps.1.title',
        descriptionKey: 'digitalSchool.sections.period-4.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.period-4.steps.2.title',
        descriptionKey: 'digitalSchool.sections.period-4.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.period-4.steps.3.title',
        descriptionKey: 'digitalSchool.sections.period-4.steps.3.description',
        isPractice: true,
        toolRoute: '/digital/school/tools/gov24-docs',
        periodId: 'gov24-docs',
      },
    ],
  },
  {
    id: 'period-5',
    type: 'period',
    period: 5,
    titleKey: 'digitalSchool.sections.period-5.title',
    subtitleKey: 'digitalSchool.sections.period-5.subtitle',
    icon: 'Languages',
    color: 'rose',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.period-5.steps.1.title',
        descriptionKey: 'digitalSchool.sections.period-5.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.period-5.steps.2.title',
        descriptionKey: 'digitalSchool.sections.period-5.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.period-5.steps.3.title',
        descriptionKey: 'digitalSchool.sections.period-5.steps.3.description',
        isPractice: true,
        toolRoute: '/digital/school/tools/translation-ai',
        periodId: 'translation-ai',
      },
    ],
  },
  {
    id: 'period-6',
    type: 'period',
    period: 6,
    titleKey: 'digitalSchool.sections.period-6.title',
    subtitleKey: 'digitalSchool.sections.period-6.subtitle',
    icon: 'ShieldAlert',
    color: 'orange',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.period-6.steps.1.title',
        descriptionKey: 'digitalSchool.sections.period-6.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.period-6.steps.2.title',
        descriptionKey: 'digitalSchool.sections.period-6.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.period-6.steps.3.title',
        descriptionKey: 'digitalSchool.sections.period-6.steps.3.description',
        isPractice: true,
        toolRoute: '/digital/school/tools/digital-safety',
        periodId: 'digital-safety',
      },
    ],
  },
  {
    id: 'final-project',
    type: 'final-project',
    titleKey: 'digitalSchool.sections.final-project.title',
    subtitleKey: 'digitalSchool.sections.final-project.subtitle',
    icon: 'ClipboardList',
    color: 'indigo',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.final-project.steps.1.title',
        descriptionKey: 'digitalSchool.sections.final-project.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.final-project.steps.2.title',
        descriptionKey: 'digitalSchool.sections.final-project.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.final-project.steps.3.title',
        descriptionKey: 'digitalSchool.sections.final-project.steps.3.description',
        isPractice: false,
      },
    ],
  },
  {
    id: 'graduation-ceremony',
    type: 'after-school',
    titleKey: 'digitalSchool.sections.graduation-ceremony.title',
    subtitleKey: 'digitalSchool.sections.graduation-ceremony.subtitle',
    icon: 'Award',
    color: 'yellow',
    steps: [
      {
        stepNumber: 1,
        titleKey: 'digitalSchool.sections.graduation-ceremony.steps.1.title',
        descriptionKey: 'digitalSchool.sections.graduation-ceremony.steps.1.description',
        isPractice: false,
      },
      {
        stepNumber: 2,
        titleKey: 'digitalSchool.sections.graduation-ceremony.steps.2.title',
        descriptionKey: 'digitalSchool.sections.graduation-ceremony.steps.2.description',
        isPractice: false,
      },
      {
        stepNumber: 3,
        titleKey: 'digitalSchool.sections.graduation-ceremony.steps.3.title',
        descriptionKey: 'digitalSchool.sections.graduation-ceremony.steps.3.description',
        isPractice: false,
      },
    ],
  },
];
