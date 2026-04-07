// ─── Pexels API 서비스 ───
// 4교시 바이럴카드 + 5교시 퍼펙트플래너 공통 무료 이미지 소스
// Free tier: 200 req/hr. sessionStorage 캐싱으로 부하 분산.

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;
const CACHE_KEY_PREFIX = 'pexels:';

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

  const cleanKeyword = keyword.trim().toLowerCase();
  const cacheKey = `${CACHE_KEY_PREFIX}${cleanKeyword}`;

  // sessionStorage 캐시 확인
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    /* noop — sessionStorage 접근 실패 */
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanKeyword)}&per_page=15`,
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
