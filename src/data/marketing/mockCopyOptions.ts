// AI 카피라이터 Mock 데이터 (Gemini API 연동 전 사용)

export interface MockCopySet {
  tone: string;
  copies: string[];
}

const emotionalCopies: Record<string, string[]> = {
  default: [
    '당신의 일상에 작은 행복을 더해요',
    '한 번 써보면 다시 돌아갈 수 없어요',
    '소중한 당신을 위한 특별한 선택',
  ],
  food: [
    '한 입 먹으면 엄마 생각나는 그 맛',
    '매일 먹어도 질리지 않는 비밀이 있어요',
    '입 안에서 춤추는 행복, 지금 만나보세요',
  ],
  fashion: [
    '오늘도 나답게, 당신만의 스타일로',
    '거울 앞에서 한 번 더 웃게 되는 옷',
    '입는 순간, 자신감이 올라가요',
  ],
  beauty: [
    '피부가 먼저 말해주는 아름다움',
    '매일 아침 거울이 기다려지는 이유',
    '자연스러운 아름다움, 그게 진짜예요',
  ],
};

const funCopies: Record<string, string[]> = {
  default: [
    '이거 안 사면 후회할걸요? (진심)',
    '친구한테 추천했더니 절교 위기... 왜냐면 너무 좋아서!',
    '세상에 이런 가격에 이런 퀄리티라니!',
  ],
  food: [
    '배고프면 화나잖아요. 이걸로 해결!',
    '다이어트는 내일부터... 오늘은 이거 먹자!',
    '맛있어서 눈물이 나는 건 처음이에요',
  ],
  fashion: [
    '오픈런 각입니다. 진심으로요.',
    '룸메가 물어봐요. "그거 어디 거야?" (뿌듯)',
    '택배 올 때마다 심장이 쿵!',
  ],
  beauty: [
    '"무슨 화장품 써?" 라는 질문 받고 싶으면 이거!',
    'Before After가 이렇게 다를 수 있나요?!',
    '꿀피부 비결? 여기 있잖아요~',
  ],
};

const seriousCopies: Record<string, string[]> = {
  default: [
    '10년의 연구가 만든 프리미엄 품질',
    '전문가가 인정한 No.1 브랜드',
    '까다로운 기준으로 선별한 최상의 결과물',
  ],
  food: [
    '산지 직송, 신선함의 기준을 새로 쓰다',
    '엄격한 품질 관리로 매일 안전한 먹거리',
    '자연에서 온 건강, 식탁 위의 믿음',
  ],
  fashion: [
    '장인의 손끝에서 탄생한 프리미엄 라인',
    '트렌드를 넘어선 클래식의 가치',
    '소재부터 다른 프리미엄 퀄리티',
  ],
  beauty: [
    '피부과학 기반의 검증된 효과',
    '민감한 피부도 안심할 수 있는 성분 설계',
    '임상 테스트 완료, 신뢰할 수 있는 결과',
  ],
};

const trendyCopies: Record<string, string[]> = {
  default: [
    '찐으로 미쳤다... 이건 사야 됨 🔥',
    '요즘 힙한 사람들은 다 이거 쓴다던데?',
    '이거 모르면 손해! 알잘딱깔센 아이템',
  ],
  food: [
    '맛잘알이 추천하는 그 맛집, 여기임 📍',
    '이거 먹고 리뷰 안 남기는 사람 없음 ㅋㅋ',
    '찐 맛집러들 사이에서 난리 난 그곳',
  ],
  fashion: [
    '이번 시즌 잇템은 이거라고요? 맞아요 ✨',
    '인스타에서 본 그 옷, 여기서 살 수 있음',
    '코디 고민? 이 한 벌이면 끝!',
  ],
  beauty: [
    '요즘 올영에서 1등 하는 거 이거래 🏆',
    '피부 좋아졌다고? 비밀은 이거였음',
    '언니들 사이에서 입소문 난 그 템!',
  ],
};

const storytellingCopies: Record<string, string[]> = {
  default: [
    '처음엔 반신반의했어요. 그런데 한 달 뒤, 모든 게 달라졌습니다.',
    '작은 가게에서 시작한 이야기. 지금은 수천 명이 찾는 브랜드가 되었어요.',
    '고객 한 분이 이런 말을 해주셨어요. "이건 정말 다르다"고요.',
  ],
  food: [
    '할머니의 레시피를 지키면서도, 새로운 맛을 만들어갑니다.',
    '새벽 4시에 시작되는 하루. 그만큼 신선한 재료만 고집합니다.',
    '처음 이 맛을 본 날, 저는 이 일을 평생 하겠다고 결심했어요.',
  ],
  fashion: [
    '옷장 정리를 하다 깨달았어요. 정말 좋은 옷 하나면 충분하다는 것을.',
    '디자이너가 100번 수정한 끝에 완성된 이 실루엣.',
    '첫 출근날, 이 옷을 입고 거울 앞에 섰을 때의 그 자신감.',
  ],
  beauty: [
    '피부 고민으로 밤잠을 설치던 날들이 있었어요.',
    '연구원이 3년간 개발한 성분, 드디어 세상에 나왔습니다.',
    '내 피부를 이해해주는 화장품을 만나기까지 10년이 걸렸어요.',
  ],
};

export function getMockCopyOptions(
  tone: 'emotional' | 'fun' | 'serious' | 'trendy' | 'storytelling',
  productKeyword?: string
): string[] {
  const key = detectCategory(productKeyword || '');

  switch (tone) {
    case 'emotional':
      return emotionalCopies[key] || emotionalCopies.default;
    case 'fun':
      return funCopies[key] || funCopies.default;
    case 'serious':
      return seriousCopies[key] || seriousCopies.default;
    case 'trendy':
      return trendyCopies[key] || trendyCopies.default;
    case 'storytelling':
      return storytellingCopies[key] || storytellingCopies.default;
    default:
      return emotionalCopies.default;
  }
}

function detectCategory(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();

  const foodKeywords = ['음식', '맛', '먹', '카페', '커피', '빵', '과일', '고기', '밥', '주스', '망고', 'food', 'cafe'];
  const fashionKeywords = ['옷', '패션', '신발', '가방', '악세', '코디', 'fashion', 'clothes'];
  const beautyKeywords = ['화장', '뷰티', '스킨', '피부', '메이크업', 'beauty', 'skin'];

  if (foodKeywords.some(k => lowerKeyword.includes(k))) return 'food';
  if (fashionKeywords.some(k => lowerKeyword.includes(k))) return 'fashion';
  if (beautyKeywords.some(k => lowerKeyword.includes(k))) return 'beauty';

  return 'default';
}
