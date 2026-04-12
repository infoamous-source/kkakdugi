import { lazy } from 'react';

const CHUNK_RELOAD_KEY = 'chunk-reload';

export function lazyWithRetry(
  factory: () => Promise<{ default: React.ComponentType<unknown> }>,
) {
  return lazy(() =>
    factory().catch(() => {
      if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        // 리로드 중 렌더링 방지
        return new Promise<never>(() => {});
      }
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return factory();
    }),
  );
}
