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
    // P0-7: console.debug 제거 — 디버그 로그에서 키 상태가 노출될 수 있음
    return localStorage.getItem(CONNECTED_STORAGE) === 'true' && !!getStoredApiKey();
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

async function generateTextOnce(prompt: string, timeoutMs: number, apiKey?: string): Promise<string | null> {
  const model = getGeminiModel(undefined, apiKey);
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
async function tryWithKey(prompt: string, apiKey: string): Promise<string | null> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await generateTextOnce(prompt, GENERATE_TIMEOUT_MS, apiKey);
      if (text) return text;
    } catch (err) {
      lastErr = err;
      // quota 에러면 이 키로 재시도해도 무의미 — 즉시 포기
      if (isQuotaError(err)) throw err;
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

const MAX_POOL_ATTEMPTS = 3; // 풀에서 최대 3개 키까지 시도

export async function generateText(prompt: string): Promise<string | null> {
  // 1) 풀 키로 시도 (최대 MAX_POOL_ATTEMPTS개 키)
  for (let i = 0; i < MAX_POOL_ATTEMPTS; i++) {
    let poolKey: string | null = null;
    try {
      poolKey = await getPooledApiKey();
    } catch { /* pool fetch 실패 — 무시 */ }

    if (!poolKey) break; // 풀이 비었으면 개인 키로 폴백

    try {
      const text = await tryWithKey(prompt, poolKey);
      if (text) return text;
    } catch (err) {
      if (isQuotaError(err)) {
        // 이 키는 quota 소진 — 다음 키로 전환
        skipToNextKey();
        continue;
      }
      // quota 아닌 에러면 개인 키로 폴백
      break;
    }
  }

  // 2) 개인 키로 폴백
  const personalKey = getStoredApiKey();
  if (!personalKey) return null;

  try {
    return await tryWithKey(prompt, personalKey);
  } catch (err) {
    console.error('[Gemini] Text generation failed after retries:', err);
    return null;
  }
}
