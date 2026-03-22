import type { HashtagGroup } from '../../types/marketing';

// 키워드별 연관 해시태그 데이터 (Mock)
export const hashtagDatabase: Record<string, HashtagGroup[]> = {
  '맛집': [
    { keyword: '맛집', hashtags: ['#맛집추천', '#맛집탐방', '#맛있다그램', '#먹스타그램', '#오늘뭐먹지'], category: 'trending' },
    { keyword: '맛집', hashtags: ['#숨은맛집', '#로컬맛집', '#혼밥맛집', '#데이트맛집', '#가성비맛집'], category: 'niche' },
  ],
  '카페': [
    { keyword: '카페', hashtags: ['#카페추천', '#카페스타그램', '#카페투어', '#예쁜카페', '#분위기좋은카페'], category: 'trending' },
    { keyword: '카페', hashtags: ['#디저트카페', '#작업하기좋은카페', '#뷰맛집카페', '#신상카페', '#감성카페'], category: 'niche' },
  ],
  '패션': [
    { keyword: '패션', hashtags: ['#오오티디', '#데일리룩', '#패션스타그램', '#코디추천', '#옷스타그램'], category: 'trending' },
    { keyword: '패션', hashtags: ['#빈티지패션', '#미니멀룩', '#직장인코디', '#캐주얼룩', '#하객룩'], category: 'niche' },
  ],
  '뷰티': [
    { keyword: '뷰티', hashtags: ['#뷰티스타그램', '#메이크업', '#화장품추천', '#스킨케어', '#오늘의화장'], category: 'trending' },
    { keyword: '뷰티', hashtags: ['#데일리메이크업', '#민감성피부', '#쿨톤추천', '#웜톤추천', '#뷰티템추천'], category: 'niche' },
  ],
  '여행': [
    { keyword: '여행', hashtags: ['#여행스타그램', '#여행에미치다', '#국내여행', '#해외여행', '#인생여행'], category: 'trending' },
    { keyword: '여행', hashtags: ['#혼자여행', '#커플여행', '#가족여행', '#감성여행', '#힐링여행'], category: 'niche' },
  ],
  '운동': [
    { keyword: '운동', hashtags: ['#운동스타그램', '#헬스타그램', '#오운완', '#홈트레이닝', '#다이어트'], category: 'trending' },
    { keyword: '운동', hashtags: ['#필라테스', '#크로스핏', '#러닝', '#요가', '#헬스초보'], category: 'niche' },
  ],
  '음식': [
    { keyword: '음식', hashtags: ['#푸드스타그램', '#집밥', '#홈쿡', '#요리스타그램', '#먹방'], category: 'trending' },
    { keyword: '음식', hashtags: ['#간단요리', '#자취요리', '#건강식', '#다이어트식단', '#브런치'], category: 'niche' },
  ],
  '쇼핑': [
    { keyword: '쇼핑', hashtags: ['#쇼핑스타그램', '#득템', '#할인정보', '#쇼핑추천', '#신상품'], category: 'trending' },
    { keyword: '쇼핑', hashtags: ['#가성비템', '#인생템', '#생활용품추천', '#홈데코', '#리빙'], category: 'niche' },
  ],
  '마케팅': [
    { keyword: '마케팅', hashtags: ['#마케팅', '#디지털마케팅', '#SNS마케팅', '#마케터', '#마케팅전략'], category: 'trending' },
    { keyword: '마케팅', hashtags: ['#콘텐츠마케팅', '#퍼포먼스마케팅', '#브랜딩', '#그로스해킹', '#스타트업마케팅'], category: 'niche' },
  ],
  '창업': [
    { keyword: '창업', hashtags: ['#창업', '#스타트업', '#사업자', '#소자본창업', '#1인창업'], category: 'trending' },
    { keyword: '창업', hashtags: ['#사이드프로젝트', '#온라인창업', '#스마트스토어', '#쿠팡창업', '#부업'], category: 'niche' },
  ],
  '인테리어': [
    { keyword: '인테리어', hashtags: ['#인테리어', '#홈스타일링', '#집꾸미기', '#인테리어스타그램', '#셀프인테리어'], category: 'trending' },
    { keyword: '인테리어', hashtags: ['#미니멀인테리어', '#원룸꾸미기', '#빈티지인테리어', '#DIY인테리어', '#렌트리모델링'], category: 'niche' },
  ],
  '교육': [
    { keyword: '교육', hashtags: ['#공부스타그램', '#교육', '#자기계발', '#온라인강의', '#스터디'], category: 'trending' },
    { keyword: '교육', hashtags: ['#독학', '#자격증준비', '#코딩공부', '#어학연수', '#평생학습'], category: 'niche' },
  ],
  '건강': [
    { keyword: '건강', hashtags: ['#건강', '#운동스타그램', '#다이어트', '#헬시라이프', '#건강식단'], category: 'trending' },
    { keyword: '건강', hashtags: ['#비타민', '#명상', '#요가', '#건강검진', '#면역력'], category: 'niche' },
  ],
  '반려동물': [
    { keyword: '반려동물', hashtags: ['#반려동물', '#강아지', '#고양이', '#펫스타그램', '#멍스타그램'], category: 'trending' },
    { keyword: '반려동물', hashtags: ['#강아지산책', '#고양이집사', '#반려동물용품', '#펫카페', '#유기동물'], category: 'niche' },
  ],
  '게임': [
    { keyword: '게임', hashtags: ['#게임', '#겜스타그램', '#모바일게임', '#게임추천', '#e스포츠'], category: 'trending' },
    { keyword: '게임', hashtags: ['#인디게임', '#레트로게임', '#게임리뷰', '#게임개발', '#보드게임'], category: 'niche' },
  ],
};

// 기본 추천 해시태그 (키워드가 DB에 없을 때)
export const defaultHashtags: HashtagGroup[] = [
  {
    keyword: 'default',
    hashtags: ['#일상', '#데일리', '#소통', '#팔로우', '#좋아요'],
    category: 'community',
  },
  {
    keyword: 'default',
    hashtags: ['#인스타그램', '#인스타', '#SNS', '#소셜미디어', '#콘텐츠'],
    category: 'trending',
  },
];

// 해시태그 검색 함수
export function searchHashtags(keyword: string): HashtagGroup[] {
  const normalizedKeyword = keyword.trim();

  // 정확히 일치하는 키워드 찾기
  if (hashtagDatabase[normalizedKeyword]) {
    return hashtagDatabase[normalizedKeyword];
  }

  // 부분 일치 검색
  for (const [key, groups] of Object.entries(hashtagDatabase)) {
    if (key.includes(normalizedKeyword) || normalizedKeyword.includes(key)) {
      return groups;
    }
  }

  // 기본 해시태그 반환
  return defaultHashtags;
}
