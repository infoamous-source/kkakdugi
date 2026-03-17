import type { DigitalModuleContent } from '../../types/digital';

export const digitalModuleContents: DigitalModuleContent[] = [
  // db-01: 필수 앱 세팅 및 초기설정
  {
    moduleId: 'db-01',
    goals: [
      'digital.modules.setup.goals.0',
      'digital.modules.setup.goals.1',
      'digital.modules.setup.goals.2',
      'digital.modules.setup.goals.3',
    ],
    preparation: [
      'digital.modules.setup.preparation.0',
      'digital.modules.setup.preparation.1',
      'digital.modules.setup.preparation.2',
    ],
    steps: [
      {
        id: 'db-01-step-1',
        titleKey: 'digital.modules.setup.steps.naverAccount.title',
        descriptionKey: 'digital.modules.setup.steps.naverAccount.description',
        type: 'guide',
        icon: 'UserPlus',
        substeps: [
          'digital.modules.setup.steps.naverAccount.substeps.0',
          'digital.modules.setup.steps.naverAccount.substeps.1',
          'digital.modules.setup.steps.naverAccount.substeps.2',
          'digital.modules.setup.steps.naverAccount.substeps.3',
          'digital.modules.setup.steps.naverAccount.substeps.4',
        ],
      },
      {
        id: 'db-01-step-2',
        titleKey: 'digital.modules.setup.steps.email.title',
        descriptionKey: 'digital.modules.setup.steps.email.description',
        type: 'guide',
        icon: 'Mail',
        substeps: [
          'digital.modules.setup.steps.email.substeps.0',
          'digital.modules.setup.steps.email.substeps.1',
          'digital.modules.setup.steps.email.substeps.2',
          'digital.modules.setup.steps.email.substeps.3',
        ],
      },
      {
        id: 'db-01-step-3',
        titleKey: 'digital.modules.setup.steps.symbols.title',
        descriptionKey: 'digital.modules.setup.steps.symbols.description',
        type: 'reference',
        icon: 'AtSign',
        substeps: [
          'digital.modules.setup.steps.symbols.substeps.0',
          'digital.modules.setup.steps.symbols.substeps.1',
          'digital.modules.setup.steps.symbols.substeps.2',
          'digital.modules.setup.steps.symbols.substeps.3',
          'digital.modules.setup.steps.symbols.substeps.4',
          'digital.modules.setup.steps.symbols.substeps.5',
          'digital.modules.setup.steps.symbols.substeps.6',
        ],
      },
      {
        id: 'db-01-step-4',
        titleKey: 'digital.modules.setup.steps.naverMap.title',
        descriptionKey: 'digital.modules.setup.steps.naverMap.description',
        type: 'guide',
        icon: 'MapPin',
        substeps: [
          'digital.modules.setup.steps.naverMap.substeps.0',
          'digital.modules.setup.steps.naverMap.substeps.1',
          'digital.modules.setup.steps.naverMap.substeps.2',
          'digital.modules.setup.steps.naverMap.substeps.3',
        ],
      },
    ],
    tips: [
      'digital.modules.setup.tips.0',
      'digital.modules.setup.tips.1',
      'digital.modules.setup.tips.2',
    ],
    practices: [
      {
        id: 'db-01-practice-1',
        titleKey: 'digital.modules.setup.practices.emailAndMap.title',
        descriptionKey: 'digital.modules.setup.practices.emailAndMap.description',
        checklist: [
          'digital.modules.setup.practices.emailAndMap.checklist.0',
          'digital.modules.setup.practices.emailAndMap.checklist.1',
          'digital.modules.setup.practices.emailAndMap.checklist.2',
          'digital.modules.setup.practices.emailAndMap.checklist.3',
        ],
      },
    ],
    relatedAppIds: ['naver', 'naver-map'],
  },

  // db-02: 카카오 인증서 & 키오스크
  {
    moduleId: 'db-02',
    goals: [
      'digital.modules.kakao.goals.0',
      'digital.modules.kakao.goals.1',
      'digital.modules.kakao.goals.2',
      'digital.modules.kakao.goals.3',
    ],
    preparation: [
      'digital.modules.kakao.preparation.0',
      'digital.modules.kakao.preparation.1',
      'digital.modules.kakao.preparation.2',
    ],
    steps: [
      {
        id: 'db-02-step-1',
        titleKey: 'digital.modules.kakao.steps.certificate.title',
        descriptionKey: 'digital.modules.kakao.steps.certificate.description',
        type: 'guide',
        icon: 'ShieldCheck',
        substeps: [
          'digital.modules.kakao.steps.certificate.substeps.0',
          'digital.modules.kakao.steps.certificate.substeps.1',
          'digital.modules.kakao.steps.certificate.substeps.2',
          'digital.modules.kakao.steps.certificate.substeps.3',
          'digital.modules.kakao.steps.certificate.substeps.4',
        ],
      },
      {
        id: 'db-02-step-2',
        titleKey: 'digital.modules.kakao.steps.kakaoPay.title',
        descriptionKey: 'digital.modules.kakao.steps.kakaoPay.description',
        type: 'guide',
        icon: 'CreditCard',
        substeps: [
          'digital.modules.kakao.steps.kakaoPay.substeps.0',
          'digital.modules.kakao.steps.kakaoPay.substeps.1',
          'digital.modules.kakao.steps.kakaoPay.substeps.2',
          'digital.modules.kakao.steps.kakaoPay.substeps.3',
        ],
      },
      {
        id: 'db-02-step-3',
        titleKey: 'digital.modules.kakao.steps.identity.title',
        descriptionKey: 'digital.modules.kakao.steps.identity.description',
        type: 'reference',
        icon: 'AlertTriangle',
        substeps: [
          'digital.modules.kakao.steps.identity.substeps.0',
          'digital.modules.kakao.steps.identity.substeps.1',
          'digital.modules.kakao.steps.identity.substeps.2',
        ],
      },
      {
        id: 'db-02-step-4',
        titleKey: 'digital.modules.kakao.steps.kkakdugiIntro.title',
        descriptionKey: 'digital.modules.kakao.steps.kkakdugiIntro.description',
        type: 'guide',
        icon: 'Monitor',
        substeps: [
          'digital.modules.kakao.steps.kkakdugiIntro.substeps.0',
          'digital.modules.kakao.steps.kkakdugiIntro.substeps.1',
          'digital.modules.kakao.steps.kkakdugiIntro.substeps.2',
          'digital.modules.kakao.steps.kkakdugiIntro.substeps.3',
          'digital.modules.kakao.steps.kkakdugiIntro.substeps.4',
        ],
      },
    ],
    tips: [
      'digital.modules.kakao.tips.0',
      'digital.modules.kakao.tips.1',
      'digital.modules.kakao.tips.2',
    ],
    practices: [
      {
        id: 'db-02-practice-1',
        titleKey: 'digital.modules.kakao.practices.kkakdugi.title',
        descriptionKey: 'digital.modules.kakao.practices.kkakdugi.description',
        checklist: [
          'digital.modules.kakao.practices.kkakdugi.checklist.0',
          'digital.modules.kakao.practices.kkakdugi.checklist.1',
          'digital.modules.kakao.practices.kkakdugi.checklist.2',
          'digital.modules.kakao.practices.kkakdugi.checklist.3',
        ],
      },
    ],
    relatedAppIds: ['kakaotalk', 'kkakdugi-practice'],
  },

  // db-03: 정부24 서류 발급
  {
    moduleId: 'db-03',
    goals: [
      'digital.modules.gov24.goals.0',
      'digital.modules.gov24.goals.1',
      'digital.modules.gov24.goals.2',
      'digital.modules.gov24.goals.3',
    ],
    preparation: [
      'digital.modules.gov24.preparation.0',
      'digital.modules.gov24.preparation.1',
      'digital.modules.gov24.preparation.2',
    ],
    steps: [
      {
        id: 'db-03-step-1',
        titleKey: 'digital.modules.gov24.steps.register.title',
        descriptionKey: 'digital.modules.gov24.steps.register.description',
        type: 'guide',
        icon: 'UserPlus',
        substeps: [
          'digital.modules.gov24.steps.register.substeps.0',
          'digital.modules.gov24.steps.register.substeps.1',
          'digital.modules.gov24.steps.register.substeps.2',
          'digital.modules.gov24.steps.register.substeps.3',
        ],
      },
      {
        id: 'db-03-step-2',
        titleKey: 'digital.modules.gov24.steps.terms.title',
        descriptionKey: 'digital.modules.gov24.steps.terms.description',
        type: 'reference',
        icon: 'BookOpen',
        substeps: [
          'digital.modules.gov24.steps.terms.substeps.0',
          'digital.modules.gov24.steps.terms.substeps.1',
          'digital.modules.gov24.steps.terms.substeps.2',
          'digital.modules.gov24.steps.terms.substeps.3',
          'digital.modules.gov24.steps.terms.substeps.4',
          'digital.modules.gov24.steps.terms.substeps.5',
        ],
      },
      {
        id: 'db-03-step-3',
        titleKey: 'digital.modules.gov24.steps.search.title',
        descriptionKey: 'digital.modules.gov24.steps.search.description',
        type: 'guide',
        icon: 'Search',
        substeps: [
          'digital.modules.gov24.steps.search.substeps.0',
          'digital.modules.gov24.steps.search.substeps.1',
          'digital.modules.gov24.steps.search.substeps.2',
          'digital.modules.gov24.steps.search.substeps.3',
        ],
      },
      {
        id: 'db-03-step-4',
        titleKey: 'digital.modules.gov24.steps.pdf.title',
        descriptionKey: 'digital.modules.gov24.steps.pdf.description',
        type: 'guide',
        icon: 'FileDown',
        substeps: [
          'digital.modules.gov24.steps.pdf.substeps.0',
          'digital.modules.gov24.steps.pdf.substeps.1',
          'digital.modules.gov24.steps.pdf.substeps.2',
        ],
      },
      {
        id: 'db-03-step-5',
        titleKey: 'digital.modules.gov24.steps.emailSend.title',
        descriptionKey: 'digital.modules.gov24.steps.emailSend.description',
        type: 'guide',
        icon: 'Send',
        substeps: [
          'digital.modules.gov24.steps.emailSend.substeps.0',
          'digital.modules.gov24.steps.emailSend.substeps.1',
          'digital.modules.gov24.steps.emailSend.substeps.2',
        ],
      },
    ],
    tips: [
      'digital.modules.gov24.tips.0',
      'digital.modules.gov24.tips.1',
      'digital.modules.gov24.tips.2',
    ],
    practices: [
      {
        id: 'db-03-practice-1',
        titleKey: 'digital.modules.gov24.practices.certificate.title',
        descriptionKey: 'digital.modules.gov24.practices.certificate.description',
        checklist: [
          'digital.modules.gov24.practices.certificate.checklist.0',
          'digital.modules.gov24.practices.certificate.checklist.1',
          'digital.modules.gov24.practices.certificate.checklist.2',
          'digital.modules.gov24.practices.certificate.checklist.3',
        ],
      },
    ],
    relatedAppIds: ['gov24'],
  },

  // db-04: 번역 앱 & 디지털 안전
  {
    moduleId: 'db-04',
    goals: [
      'digital.modules.translation.goals.0',
      'digital.modules.translation.goals.1',
      'digital.modules.translation.goals.2',
      'digital.modules.translation.goals.3',
      'digital.modules.translation.goals.4',
      'digital.modules.translation.goals.5',
    ],
    preparation: [
      'digital.modules.translation.preparation.0',
      'digital.modules.translation.preparation.1',
      'digital.modules.translation.preparation.2',
    ],
    steps: [
      {
        id: 'db-04-step-1',
        titleKey: 'digital.modules.translation.steps.chatgpt.title',
        descriptionKey: 'digital.modules.translation.steps.chatgpt.description',
        type: 'guide',
        icon: 'Camera',
        substeps: [
          'digital.modules.translation.steps.chatgpt.substeps.0',
          'digital.modules.translation.steps.chatgpt.substeps.1',
          'digital.modules.translation.steps.chatgpt.substeps.2',
          'digital.modules.translation.steps.chatgpt.substeps.3',
        ],
      },
      {
        id: 'db-04-step-2',
        titleKey: 'digital.modules.translation.steps.papago.title',
        descriptionKey: 'digital.modules.translation.steps.papago.description',
        type: 'guide',
        icon: 'Languages',
        substeps: [
          'digital.modules.translation.steps.papago.substeps.0',
          'digital.modules.translation.steps.papago.substeps.1',
          'digital.modules.translation.steps.papago.substeps.2',
          'digital.modules.translation.steps.papago.substeps.3',
        ],
      },
      {
        id: 'db-04-step-3',
        titleKey: 'digital.modules.translation.steps.googleTranslate.title',
        descriptionKey: 'digital.modules.translation.steps.googleTranslate.description',
        type: 'guide',
        icon: 'Globe',
        substeps: [
          'digital.modules.translation.steps.googleTranslate.substeps.0',
          'digital.modules.translation.steps.googleTranslate.substeps.1',
          'digital.modules.translation.steps.googleTranslate.substeps.2',
          'digital.modules.translation.steps.googleTranslate.substeps.3',
        ],
      },
      {
        id: 'db-04-step-4',
        titleKey: 'digital.modules.translation.steps.comparison.title',
        descriptionKey: 'digital.modules.translation.steps.comparison.description',
        type: 'reference',
        icon: 'Table',
        substeps: [
          'digital.modules.translation.steps.comparison.substeps.0',
          'digital.modules.translation.steps.comparison.substeps.1',
          'digital.modules.translation.steps.comparison.substeps.2',
        ],
      },
      {
        id: 'db-04-step-5',
        titleKey: 'digital.modules.translation.steps.kakaoGpt.title',
        descriptionKey: 'digital.modules.translation.steps.kakaoGpt.description',
        type: 'guide',
        icon: 'MessageCircle',
        substeps: [
          'digital.modules.translation.steps.kakaoGpt.substeps.0',
          'digital.modules.translation.steps.kakaoGpt.substeps.1',
          'digital.modules.translation.steps.kakaoGpt.substeps.2',
        ],
      },
      {
        id: 'db-04-step-6',
        titleKey: 'digital.modules.translation.steps.permissions.title',
        descriptionKey: 'digital.modules.translation.steps.permissions.description',
        type: 'guide',
        icon: 'Shield',
        substeps: [
          'digital.modules.translation.steps.permissions.substeps.0',
          'digital.modules.translation.steps.permissions.substeps.1',
          'digital.modules.translation.steps.permissions.substeps.2',
          'digital.modules.translation.steps.permissions.substeps.3',
        ],
      },
      {
        id: 'db-04-step-7',
        titleKey: 'digital.modules.translation.steps.spam.title',
        descriptionKey: 'digital.modules.translation.steps.spam.description',
        type: 'guide',
        icon: 'ShieldOff',
        substeps: [
          'digital.modules.translation.steps.spam.substeps.0',
          'digital.modules.translation.steps.spam.substeps.1',
          'digital.modules.translation.steps.spam.substeps.2',
        ],
      },
    ],
    tips: [
      'digital.modules.translation.tips.0',
      'digital.modules.translation.tips.1',
      'digital.modules.translation.tips.2',
      'digital.modules.translation.tips.3',
    ],
    practices: [
      {
        id: 'db-04-practice-1',
        titleKey: 'digital.modules.translation.practices.translate.title',
        descriptionKey: 'digital.modules.translation.practices.translate.description',
        checklist: [
          'digital.modules.translation.practices.translate.checklist.0',
          'digital.modules.translation.practices.translate.checklist.1',
          'digital.modules.translation.practices.translate.checklist.2',
          'digital.modules.translation.practices.translate.checklist.3',
          'digital.modules.translation.practices.translate.checklist.4',
        ],
      },
    ],
    relatedAppIds: ['chatgpt', 'papago', 'google-translate', 'kakaotalk'],
  },
];

export function getModuleContent(moduleId: string): DigitalModuleContent | undefined {
  return digitalModuleContents.find((m) => m.moduleId === moduleId);
}
