// ─── Pexels API 서비스 ───
// 4교시 바이럴카드 + 5교시 퍼펙트플래너 공통 무료 이미지 소스
// Free tier: 200 req/hr. sessionStorage 캐싱으로 부하 분산.

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;
const CACHE_KEY_PREFIX = 'pexels:';

// 한국어 → 영어 키워드 변환 (Pexels는 영어 검색이 정확함)
const KR_EN_MAP: Record<string, string> = {
  쿠키:'cookies',커피:'coffee',케이크:'cake',빵:'bread bakery',음식:'food',과자:'snacks',
  초콜릿:'chocolate',차:'tea cup',주스:'juice',아이스크림:'ice cream',떡:'rice cake',
  김치:'kimchi',라면:'ramen noodles',치킨:'fried chicken',피자:'pizza',햄버거:'hamburger',
  샐러드:'salad fresh',샌드위치:'sandwich',디저트:'dessert',음료:'drinks beverage',
  화장품:'cosmetics beauty',스킨케어:'skincare',향수:'perfume bottle',립스틱:'lipstick',
  마스크팩:'face mask sheet',선크림:'sunscreen',로션:'lotion cream',세럼:'serum bottle',
  옷:'fashion clothing',신발:'shoes footwear',가방:'bag handbag',모자:'hat cap',
  시계:'watch accessory',목걸이:'necklace jewelry',반지:'ring jewelry',안경:'glasses eyewear',
  핸드폰:'smartphone phone',노트북:'laptop computer',이어폰:'earphone headphone',
  키보드:'keyboard tech',마우스:'mouse tech',태블릿:'tablet device',
  가구:'furniture interior',쿠션:'cushion pillow',캔들:'candle light',조명:'lamp lighting',
  꽃:'flowers bouquet',식물:'plant green',화분:'plant pot',
  운동:'fitness exercise',요가:'yoga mat',헬스:'gym workout',
  반려동물:'pet animal',강아지:'puppy dog',고양이:'cat kitten',
  여행:'travel adventure',호텔:'hotel room',캠핑:'camping outdoor',
  책:'book reading',문구:'stationery pen',노트:'notebook writing',
  비누:'soap natural',세제:'detergent clean',치약:'toothpaste',
  건강:'health wellness',비타민:'vitamin supplement',프로틴:'protein fitness',
  유기농:'organic natural',친환경:'eco friendly green',핸드메이드:'handmade craft',
};

function toEnglishKeyword(text: string): string {
  // 이미 영어면 그대로
  if (/^[a-zA-Z\s]+$/.test(text.trim())) return text.trim();
  // 매핑 테이블에서 부분 매칭
  for (const [kr, en] of Object.entries(KR_EN_MAP)) {
    if (text.includes(kr)) return en;
  }
  // 못 찾으면 'product' 로 폴백
  return 'product';
}

interface PexelsPhoto {
  src: {
    large: string;
    medium: string;
    original: string;
  };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

export function isPexelsEnabled(): boolean {
  return !!PEXELS_API_KEY && PEXELS_API_KEY !== 'your-pexels-api-key';
}

/**
 * 키워드로 Pexels에서 이미지 검색.
 * 같은 키워드는 sessionStorage 캐싱.
 * 실패 시 null 반환 → 호출자는 fallback 그라데이션 표시.
 */
export async function searchPexelsImage(keyword: string): Promise<string | null> {
  if (!isPexelsEnabled()) return null;
  if (!keyword || !keyword.trim()) return null;

  const englishKeyword = toEnglishKeyword(keyword.trim());
  const cacheKey = `${CACHE_KEY_PREFIX}${englishKeyword}`;

  // sessionStorage 캐시 확인
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    /* noop — sessionStorage 접근 실패 */
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(englishKeyword)}&per_page=15`,
      {
        headers: {
          Authorization: PEXELS_API_KEY!,
        },
      },
    );

    if (!response.ok) {
      console.warn('[Pexels] API failed:', response.status);
      return null;
    }

    const data = (await response.json()) as PexelsSearchResponse;
    if (!data.photos || data.photos.length === 0) return null;

    // 15장 중 랜덤 1장 선택 (같은 수업 30명이 다양한 이미지 받도록)
    const pick = data.photos[Math.floor(Math.random() * data.photos.length)];
    const url = pick.src.large || pick.src.medium || pick.src.original;

    try {
      sessionStorage.setItem(cacheKey, url);
    } catch {
      /* noop */
    }

    return url;
  } catch (err) {
    console.error('[Pexels] fetch failed:', err);
    return null;
  }
}

/**
 * 여러 키워드를 병렬로 검색.
 * 실패한 건 null로 반환.
 */
export async function searchPexelsImages(keywords: string[]): Promise<(string | null)[]> {
  const results = await Promise.allSettled(keywords.map((k) => searchPexelsImage(k)));
  return results.map((r) => (r.status === 'fulfilled' ? r.value : null));
}
