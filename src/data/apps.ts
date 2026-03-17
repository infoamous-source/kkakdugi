import type { AppItem, Category } from '../types/app';

// 교안 기준 카테고리 (6개)
export const categories: Category[] = [
  {
    id: 'essential',
    nameKey: 'categories.essential',
    descriptionKey: 'categories.essentialDesc',
    icon: 'star',
    order: 1,
  },
  {
    id: 'maps-navigation',
    nameKey: 'categories.mapsNavigation',
    descriptionKey: 'categories.mapsNavigationDesc',
    icon: 'maps',
    order: 2,
  },
  {
    id: 'government',
    nameKey: 'categories.government',
    descriptionKey: 'categories.governmentDesc',
    icon: 'safety',
    order: 3,
  },
  {
    id: 'translation-language',
    nameKey: 'categories.translationLanguage',
    descriptionKey: 'categories.translationLanguageDesc',
    icon: 'translation',
    order: 4,
  },
  {
    id: 'ai',
    nameKey: 'categories.ai',
    descriptionKey: 'categories.aiDesc',
    icon: 'ai',
    order: 5,
  },
  {
    id: 'communication',
    nameKey: 'categories.communication',
    descriptionKey: 'categories.communicationDesc',
    icon: 'communication',
    order: 6,
  },
];

// 교안 기준 필수 앱 (8개)
export const apps: AppItem[] = [
  // 1. 네이버 (필수)
  {
    id: 'naver',
    categoryId: 'essential',
    icon: '/app-icons/naver.png',
    nameKey: 'apps.naver.name',
    descriptionKey: 'apps.naver.description',
    taglineKey: 'apps.naver.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id393499958',
      android: 'https://play.google.com/store/apps/details?id=com.nhn.android.search',
    },
    badges: ['local-essential'],
    koreanName: '네이버',
  },

  // 2. 네이버 지도
  {
    id: 'naver-map',
    categoryId: 'maps-navigation',
    icon: '/app-icons/naver-map.png',
    nameKey: 'apps.naverMap.name',
    descriptionKey: 'apps.naverMap.description',
    taglineKey: 'apps.naverMap.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id311867728',
      android: 'https://play.google.com/store/apps/details?id=com.nhn.android.nmap',
    },
    badges: ['local-essential'],
    koreanName: '네이버 지도',
    deepLinks: {
      ios: 'nmap://',
      android: 'nmap://',
      androidPackage: 'com.nhn.android.nmap',
    },
  },

  // 3. 정부24
  {
    id: 'gov24',
    categoryId: 'government',
    icon: '/app-icons/gov24.png',
    nameKey: 'apps.gov24.name',
    descriptionKey: 'apps.gov24.description',
    taglineKey: 'apps.gov24.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id453440550',
      android: 'https://play.google.com/store/apps/details?id=kr.go.mopas.minsimin',
      web: 'https://www.gov.kr',
    },
    badges: ['government'],
    koreanName: '정부24',
  },

  // 4. 파파고
  {
    id: 'papago',
    categoryId: 'translation-language',
    icon: '/app-icons/papago.png',
    nameKey: 'apps.papago.name',
    descriptionKey: 'apps.papago.description',
    taglineKey: 'apps.papago.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id1147874819',
      android: 'https://play.google.com/store/apps/details?id=com.naver.labs.translator',
      web: 'https://papago.naver.com',
    },
    badges: ['local-essential'],
    koreanName: '파파고',
  },

  // 5. 구글 번역
  {
    id: 'google-translate',
    categoryId: 'translation-language',
    icon: '/app-icons/google-translate.png',
    nameKey: 'apps.googleTranslate.name',
    descriptionKey: 'apps.googleTranslate.description',
    taglineKey: 'apps.googleTranslate.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id414706506',
      android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.translate',
    },
    badges: ['foreigner-friendly'],
    koreanName: '구글 번역',
  },

  // 6. ChatGPT
  {
    id: 'chatgpt',
    categoryId: 'ai',
    icon: '/app-icons/chatgpt.png',
    nameKey: 'apps.chatgpt.name',
    descriptionKey: 'apps.chatgpt.description',
    taglineKey: 'apps.chatgpt.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id6448311069',
      android: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
    },
    badges: ['foreigner-friendly'],
    koreanName: 'ChatGPT',
  },

  // 7. 카카오톡
  {
    id: 'kakaotalk',
    categoryId: 'communication',
    icon: '/app-icons/kakaotalk.png',
    nameKey: 'apps.kakaotalk.name',
    descriptionKey: 'apps.kakaotalk.description',
    taglineKey: 'apps.kakaotalk.tagline',
    storeLinks: {
      ios: 'https://apps.apple.com/app/id362057947',
      android: 'https://play.google.com/store/apps/details?id=com.kakao.talk',
    },
    badges: ['local-essential'],
    koreanName: '카카오톡',
  },

  // 8. 키오스크 연습 앱
  {
    id: 'kkakdugi-practice',
    categoryId: 'essential',
    icon: '/app-icons/kkakdugi.png',
    nameKey: 'apps.kkakdugiPractice.name',
    descriptionKey: 'apps.kkakdugiPractice.description',
    taglineKey: 'apps.kkakdugiPractice.tagline',
    storeLinks: {},
    badges: [],
    koreanName: '키오스크 연습',
    internalLink: '/track/digital-basics/kkakdugi-practice',
  },
];
