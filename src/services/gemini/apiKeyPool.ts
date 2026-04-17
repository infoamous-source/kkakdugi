/**
 * Group API Key Pool
 *
 * 같은 기관(organization) 소속 학생들의 Gemini API 키를
 * 풀(pool)로 묶어 라운드 로빈 방식으로 순환 사용한다.
 *
 * - organizations.api_key_pool TEXT[] 컬럼에서 키 목록 조회
 * - sessionStorage에 5분간 캐시
 * - 429/403 에러 시 skipToNextKey()로 다음 키로 이동
 * - 풀이 비었으면 개인 키로 폴백 (geminiClient에서 처리)
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const POOL_CACHE_KEY = 'kkakdugi-api-pool';
const POOL_INDEX_KEY = 'kkakdugi-api-pool-idx';
const ORG_CODE_KEY = 'kkakdugi-user-org-code';
const POOL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface PoolCache {
  keys: string[];
  timestamp: number;
  orgCode: string;
}

// ─── Org code storage (set by auth flow) ────────────────

/** 로그인 시 호출 — orgCode를 sessionStorage + localStorage에 저장 */
export function setPoolOrgCode(orgCode: string): void {
  const upper = orgCode.toUpperCase();
  try { sessionStorage.setItem(ORG_CODE_KEY, upper); } catch { /* ignore */ }
  try { localStorage.setItem(ORG_CODE_KEY, upper); } catch { /* ignore */ }
}

/** 현재 사용자의 orgCode 조회 */
export function getPoolOrgCode(): string | null {
  try {
    return sessionStorage.getItem(ORG_CODE_KEY)
      || localStorage.getItem(ORG_CODE_KEY)
      || null;
  } catch {
    return null;
  }
}

// ─── Pool fetch & cache ─────────────────────────────────

/** DB에서 기관의 api_key_pool 조회, sessionStorage에 캐시 */
async function fetchPool(orgCode: string): Promise<string[]> {
  // Check cache first
  try {
    const cached = sessionStorage.getItem(POOL_CACHE_KEY);
    if (cached) {
      const pool: PoolCache = JSON.parse(cached);
      if (
        pool.orgCode === orgCode &&
        Date.now() - pool.timestamp < POOL_CACHE_TTL &&
        pool.keys.length > 0
      ) {
        return pool.keys;
      }
    }
  } catch { /* cache miss */ }

  // Supabase 미설정 시 빈 배열
  if (!isSupabaseConfigured) return [];

  // Fetch from DB
  const { data } = await supabase
    .from('organizations')
    .select('api_key_pool')
    .eq('code', orgCode)
    .maybeSingle();

  const raw: unknown = data?.api_key_pool;
  const keys: string[] = Array.isArray(raw)
    ? (raw as string[]).filter((k) => typeof k === 'string' && k.startsWith('AIza'))
    : [];

  // Cache result
  try {
    const cache: PoolCache = { keys, timestamp: Date.now(), orgCode };
    sessionStorage.setItem(POOL_CACHE_KEY, JSON.stringify(cache));
  } catch { /* storage full */ }

  return keys;
}

// ─── Round-robin key selection ──────────────────────────

/** 풀에서 라운드 로빈으로 다음 키를 반환. 풀이 비었으면 null. */
export async function getPooledApiKey(): Promise<string | null> {
  const orgCode = getPoolOrgCode();
  if (!orgCode) return null;

  const keys = await fetchPool(orgCode);
  if (keys.length === 0) return null;

  // Round-robin counter
  let idx = 0;
  try {
    idx = parseInt(sessionStorage.getItem(POOL_INDEX_KEY) || '0', 10);
    if (isNaN(idx) || idx < 0) idx = 0;
  } catch { /* default 0 */ }

  const key = keys[idx % keys.length];

  // Advance counter for next call
  try {
    sessionStorage.setItem(POOL_INDEX_KEY, String((idx + 1) % keys.length));
  } catch { /* ignore */ }

  return key;
}

/** 429/403 에러 시 호출 — 카운터를 한 칸 더 전진 */
export function skipToNextKey(): void {
  try {
    const idx = parseInt(sessionStorage.getItem(POOL_INDEX_KEY) || '0', 10);
    sessionStorage.setItem(POOL_INDEX_KEY, String(idx + 1));
  } catch { /* ignore */ }
}

/** 로그아웃 또는 기관 변경 시 캐시 초기화 */
export function clearPoolCache(): void {
  try {
    sessionStorage.removeItem(POOL_CACHE_KEY);
    sessionStorage.removeItem(POOL_INDEX_KEY);
    sessionStorage.removeItem(ORG_CODE_KEY);
  } catch { /* ignore */ }
  try {
    localStorage.removeItem(ORG_CODE_KEY);
  } catch { /* ignore */ }
}
