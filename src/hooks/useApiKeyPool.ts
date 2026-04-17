/**
 * useApiKeyPool — Auth 상태에 따라 API 키 풀을 초기화/정리하는 훅
 *
 * App.tsx 등 최상위에서 한 번만 호출하면 된다.
 * AuthContext를 직접 수정하지 않고, useAuth()를 구독하여 동작한다.
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setPoolOrgCode, clearPoolCache } from '../services/gemini/apiKeyPool';

export function useApiKeyPool(): void {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 로딩 중에는 캐시를 건드리지 않음 (초기 렌더 시 orgCode 삭제 방지)
    if (isLoading) return;

    if (isAuthenticated && user?.orgCode) {
      setPoolOrgCode(user.orgCode);
    } else if (!isAuthenticated) {
      // 명시적 로그아웃 시에만 캐시 정리
      clearPoolCache();
    }
  }, [isAuthenticated, isLoading, user?.orgCode]);
}
