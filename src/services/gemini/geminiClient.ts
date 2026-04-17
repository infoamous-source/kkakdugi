import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPooledApiKey, skipToNextKey } from './apiKeyPool';

const API_KEY_STORAGE = 'kkakdugi-gemini-api-key';
const CONNECTED_STORAGE = 'kkakdugi-gemini-connected';

/**
 * Gemini API 클라이언트
 * localStorage에 저장된 사용자 키를 사용
 */

// NOTE: btoa/atob은 암호화가 아닌 난독화(obfuscation)입니다.
// XSS 공격 시 평문 노출을 방지하는 최소한의 조치입니다.
export function getStoredApiKey(): string | null {
  try {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (!stored) return null;

    // 1) base64 디코딩 시도
    try {
      const decoded = atob(stored);
      if (decoded.startsWith('AIza')) return decoded;
    } catch {
      // base64가 아닌 raw 키 — 아래 fallback으로
    }

    // 2) raw 키 fallback (AIAssistantConnect에서 base64 없이 저장한 경우)
    if (stored.startsWith('AIza')) {
      // 자동 마이그레이션: raw → base64로 재저장
      try { localStorage.setItem(API_KEY_STORAGE, btoa(stored)); } catch { /* ignore */ }
      return stored;
    }

    return null;
  } catch {
    return null;
  }
}

export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE, btoa(key));
  } catch {
    // storage full 등 무시
  }
}

export function setGeminiConnected(value: boolean): void {
  try {
    localStorage.setItem(CONNECTED_STORAGE, String(value));
  } catch {
    // storage full 등 무시
  }
}

export function isGeminiConnected(): boolean {
  try {
    return localStorage.getItem(CONNECTED_STORAGE) === 'true';
  } catch {
    return false;
  }
}

export function restoreGeminiConnection(apiKey: string): void {
  setStoredApiKey(apiKey);
  setGeminiConnected(true);
}

export function clearGeminiConnection(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(CONNECTED_STORAGE);
  } catch {
    // ignore
  }
}

export function isGeminiEnabled(): boolean {
  try {
    // 1) 개인 키가 있으면 OK
    if (localStorage.getItem(CONNECTED_STORAGE) === 'true' && !!getStoredApiKey()) return true;
    // 2) 기관 풀 키가 있으면 OK (orgCode가 설정돼 있으면 풀 키 사용 가능)
    const orgCode = sessionStorage.getItem('kkakdugi-user-org-code')
      || localStorage.getItem('kkakdugi-user-org-code');
    if (orgCode) return true;
    return false;
  } catch {
    return false;
  }
}

export function getGeminiClient(overrideKey?: string): GoogleGenerativeAI | null {
  const apiKey = overrideKey || getStoredApiKey();
  if (!apiKey) return null;

  try {
    return new GoogleGenerativeAI(apiKey);
  } catch {
    return null;
  }
}

/**
 * 모델 fallback 체인 — 첫 번째 모델이 차단되면 다음 모델로 자동 전환
 * 4/9 gemini-2.5-flash 무예고 차단 사고 재발 방지
 */
export const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const MODEL_CACHE_KEY = 'kkakdugi-gemini-working-model';

/** 마지막으로 작동한 모델을 기억 (세션 동안 유지) */
export function getCachedModel(): string {
  try {
    const cached = sessionStorage.getItem(MODEL_CACHE_KEY);
    if (cached && MODEL_FALLBACK_CHAIN.includes(cached)) return cached;
  } catch { /* ignore */ }
  return MODEL_FALLBACK_CHAIN[0];
}

function cacheModel(model: string): void {
  try { sessionStorage.setItem(MODEL_CACHE_KEY, model); } catch { /* ignore */ }
}

/** 모델 자체가 존재하지 않거나 비활성화된 에러인지 판별 */
function isModelUnavailableError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return (
    msg.includes('not found') ||
    msg.includes('not available') ||
    msg.includes('deprecated') ||
    msg.includes('does not exist') ||
    (msg.includes('404') && !msg.includes('quota') && !msg.includes('rate'))
  );
}

export function getGeminiModel(modelName: string = 'gemini-2.5-flash-lite', overrideKey?: string) {
  const client = getGeminiClient(overrideKey);
  if (!client) return null;

  try {
    return client.getGenerativeModel({ model: modelName });
  } catch {
    return null;
  }
}

/**
 * Gemini API로 텍스트 생성
 * P0-6: timeout 30초 + 지수 백오프 재시도 2회
 * 모든 재시도 실패 시 null 반환 (호출부에서 Mock 폴백 처리)
 *
 * Pool 통합: 기관 풀 키 → 개인 키 순으로 시도.
 * 429/403 에러 시 풀의 다음 키로 자동 전환.
 */
const GENERATE_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

async function generateTextOnce(prompt: string, timeoutMs: number, apiKey?: string, modelName?: string): Promise<string | null> {
  const model = getGeminiModel(modelName, apiKey);
  if (!model) return null;

  return await Promise.race<string | null>([
    (async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    })(),
    new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('gemini_timeout')), timeoutMs),
    ),
  ]);
}

/** 에러가 429 또는 403 (quota/rate limit)인지 확인 */
function isQuotaError(err: unknown): boolean {
  if (!err) return false;
  const msg = String(err);
  return msg.includes('429') || msg.includes('403') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
}

/** 단일 키로 재시도 로직 (지수 백오프) */
async function tryWithKey(prompt: string, apiKey: string, modelName?: string): Promise<string | null> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await generateTextOnce(prompt, GENERATE_TIMEOUT_MS, apiKey, modelName);
      if (text) return text;
    } catch (err) {
      lastErr = err;
      // quota 에러면 이 키로 재시도해도 무의미 — 즉시 포기
      if (isQuotaError(err)) throw err;
      // 모델 자체 문제면 키 바꿔도 무의미 — 즉시 상위로 던짐
      if (isModelUnavailableError(err)) throw err;
      // 그 외 에러는 지수 백오프 후 재시도
      if (attempt < MAX_RETRIES) {
        const backoff = 500 * Math.pow(3, attempt) - 500;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  if (lastErr) throw lastErr;
  return null;
}

/** 특정 모델로 풀 키 → 개인 키 순으로 시도 */
const MAX_POOL_ATTEMPTS = 3;

async function tryWithAllKeys(prompt: string, modelName: string): Promise<string | null> {
  // 1) 풀 키로 시도 (최대 MAX_POOL_ATTEMPTS개 키)
  for (let i = 0; i < MAX_POOL_ATTEMPTS; i++) {
    let poolKey: string | null = null;
    try {
      poolKey = await getPooledApiKey();
    } catch { /* pool fetch 실패 — 무시 */ }

    if (!poolKey) break;

    try {
      const text = await tryWithKey(prompt, poolKey, modelName);
      if (text) return text;
    } catch (err) {
      if (isModelUnavailableError(err)) throw err; // 모델 문제 → 상위로
      if (isQuotaError(err)) {
        skipToNextKey();
        continue;
      }
      break;
    }
  }

  // 2) 개인 키로 폴백
  const personalKey = getStoredApiKey();
  if (!personalKey) return null;

  return await tryWithKey(prompt, personalKey, modelName);
}

/**
 * Gemini API로 텍스트 생성 (모델 fallback 포함)
 *
 * 작동 순서:
 * 1. 마지막으로 성공한 모델부터 시작
 * 2. 풀 키 → 개인 키 순으로 시도
 * 3. 모델 자체가 차단/삭제되면 다음 모델로 자동 전환
 * 4. 모든 모델·모든 키 실패 시 null 반환 → 호출부에서 Mock 폴백
 */
export async function generateText(prompt: string): Promise<string | null> {
  const startModel = getCachedModel();
  const startIdx = MODEL_FALLBACK_CHAIN.indexOf(startModel);

  for (let mi = startIdx; mi < MODEL_FALLBACK_CHAIN.length; mi++) {
    const modelName = MODEL_FALLBACK_CHAIN[mi];

    try {
      const text = await tryWithAllKeys(prompt, modelName);
      if (text) {
        if (mi !== startIdx) {
          console.warn(`[Gemini] 모델 전환: ${startModel} → ${modelName}`);
        }
        cacheModel(modelName);
        return text;
      }
    } catch (err) {
      if (isModelUnavailableError(err)) {
        console.warn(`[Gemini] ${modelName} 사용 불가, 다음 모델 시도...`);
        continue;
      }
      console.error(`[Gemini] ${modelName} 실패:`, err);
      break;
    }
  }

  console.error('[Gemini] 모든 모델 실패 — Mock 폴백으로 전환');

  // CEO 긴급 알림: 모든 모델 실패 시 자동 보고
  import('../systemAlertService').then(({ sendSystemAlert }) => {
    sendSystemAlert('api_quota', 'critical',
      'Gemini API 전체 실패',
      `모든 모델(${MODEL_FALLBACK_CHAIN.join(' → ')}) 실패. Mock 폴백 전환됨.`,
      { models: MODEL_FALLBACK_CHAIN, startModel },
    );
  }).catch(() => {});

  return null;
}
