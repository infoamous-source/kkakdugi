import { GoogleGenerativeAI } from '@google/generative-ai';

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

export function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = getStoredApiKey();
  if (!apiKey) return null;

  try {
    return new GoogleGenerativeAI(apiKey);
  } catch {
    return null;
  }
}

export function getGeminiModel(modelName: string = 'gemini-2.5-flash') {
  const client = getGeminiClient();
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
 */
const GENERATE_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

async function generateTextOnce(prompt: string, timeoutMs: number): Promise<string | null> {
  const model = getGeminiModel();
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

export async function generateText(prompt: string): Promise<string | null> {
  if (!getStoredApiKey()) return null;

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await generateTextOnce(prompt, GENERATE_TIMEOUT_MS);
      if (text) return text;
    } catch (err) {
      lastErr = err;
      // 재시도 사이 지수 백오프 (0ms, 500ms, 1500ms)
      if (attempt < MAX_RETRIES) {
        const backoff = 500 * Math.pow(3, attempt) - 500;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  console.error('[Gemini] Text generation failed after retries:', lastErr);
  return null;
}
