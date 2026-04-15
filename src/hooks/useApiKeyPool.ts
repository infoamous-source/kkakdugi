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
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.orgCode) {
      setPoolOrgCode(user.orgCode);
    } else {
      clearPoolCache();
    }
  }, [isAuthenticated, user?.orgCode]);
}
