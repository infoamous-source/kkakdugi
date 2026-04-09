/**
 * useUserProfile — 사용자 프로필 중앙 훅
 *
 * 모든 AI 도구가 사용자 프로필 + 파생 전략(어휘/비자/체류)을
 * 한 번에 가져올 수 있도록 통합한 훅.
 *
 * 사용 예:
 *   const profile = useUserProfile();
 *   if (!profile) return <div>로그인이 필요해요</div>;
 *   if (!profile.isReady) return <div>프로필을 먼저 완성해주세요</div>;
 *
 *   const systemPrompt = buildSystemPrompt(profile, { ... });
 */

import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type {
  KoreanLevel,
  YearsInKorea,
  VisaType,
} from '../../types/database';
import type { UserRole } from '../../types/auth';
import { getVocabularyGuide, type VocabularyGuide } from './topikLevel';
import { getVisaStrategy, type VisaStrategy } from './visaStrategy';
import { getYearsStrategy, type YearsStrategy } from './yearsInKorea';

export interface UserProfileView {
  // ─── Raw profile (from auth context) ───────────
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;

  // ─── v6 fields ─────────────────────────────────
  koreanLevel: KoreanLevel | null;
  yearsInKorea: YearsInKorea | null;
  visaType: VisaType | null;

  // ─── Derived strategies ────────────────────────
  vocabularyGuide: VocabularyGuide;
  visaStrategy: VisaStrategy;
  yearsStrategy: YearsStrategy;

  // ─── Helper flags ──────────────────────────────
  /** 학생 역할 여부 */
  isStudent: boolean;
  /** v6 필수 필드 3개 모두 채워져 있는지 */
  isReady: boolean;
  /** 어느 필드가 누락됐는지 */
  missing: {
    koreanLevel: boolean;
    yearsInKorea: boolean;
    visaType: boolean;
  };
}

/**
 * 사용자 프로필과 파생 전략을 통합 조회한다.
 * 로그인 안 된 경우 null을 반환.
 */
export function useUserProfile(): UserProfileView | null {
  const { user } = useAuth();

  return useMemo<UserProfileView | null>(() => {
    if (!user) return null;

    const koreanLevel = (user.koreanLevel ?? null) as KoreanLevel | null;
    const yearsInKorea = (user.yearsInKorea ?? null) as YearsInKorea | null;
    const visaType = (user.visaType ?? null) as VisaType | null;

    const vocabularyGuide = getVocabularyGuide(koreanLevel);
    const visaStrategy = getVisaStrategy(visaType);
    const yearsStrategy = getYearsStrategy(yearsInKorea);

    const missing = {
      koreanLevel: !koreanLevel,
      yearsInKorea: !yearsInKorea,
      visaType: !visaType,
    };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.country ?? null,
      age: user.age ?? null,
      gender: user.gender ?? null,
      koreanLevel,
      yearsInKorea,
      visaType,
      vocabularyGuide,
      visaStrategy,
      yearsStrategy,
      isStudent: user.role === 'student',
      isReady: !missing.koreanLevel && !missing.yearsInKorea && !missing.visaType,
      missing,
    };
  }, [user]);
}
