/**
 * 사용자 프로필 공통 모듈
 *
 * 가입 폼 v6(PRD: docs/prd-signup-form-v5.md)에서 수집한 사용자 프로필을
 * 커리어·마케팅·디지털 등 모든 AI 도구에서 일관되게 활용하기 위한 공통 인프라.
 *
 * 사용 패턴:
 *   import { useUserProfile, buildSystemPrompt } from '@/lib/userProfile';
 *
 *   function MyAITool() {
 *     const profile = useUserProfile();
 *     if (!profile?.isReady) return <ProfileIncomplete />;
 *
 *     const systemPrompt = buildSystemPrompt(profile, {
 *       toolName: '자소서 빌더',
 *       toolPurpose: '사용자 경험을 한국 자소서 4항목으로 변환',
 *       antiHallucination: 'strict',
 *     });
 *
 *     // AI 호출...
 *   }
 */

export { useUserProfile, type UserProfileView } from './useUserProfile';
export { buildSystemPrompt, type PromptContext } from './promptBuilder';
export { getVocabularyGuide, shouldRecommendTool, type VocabularyGuide } from './topikLevel';
export { getVisaStrategy, type VisaStrategy, type VisaCategory, type ResumeTone } from './visaStrategy';
export { getYearsStrategy, type YearsStrategy } from './yearsInKorea';
