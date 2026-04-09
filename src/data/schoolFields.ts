import type { SchoolField } from '../types/enrollment';

/**
 * @deprecated 가입 폼 v6 (2026-04-08) 이후 폐지됨.
 * PRD: docs/prd-signup-form-v5.md
 *
 * 학과별 추가 정보 입력 폼은 사용자 경험 문제로 폐지되었다.
 * - 공통 정보(한국어 수준, 체류 기간, 비자)는 가입 폼(profiles)에서 수집
 * - 도구별 특수 정보(마케팅 SNS, 디지털 기기 등)는 그냥 폐지
 * - 학과 등록 = 1클릭으로 단순화
 *
 * 이 상수는 기존 코드 참조 호환성을 위해 빈 배열로 유지된다.
 * 향후 도구 온보딩에서 재활용할 경우 참고용 이력으로 남겨둠 (주석 처리).
 */
export const SCHOOL_ADDITIONAL_FIELDS: Record<string, SchoolField[]> = {
  'digital-basics': [],
  'marketing': [],
  'career': [],
};

/* 이전 필드 정의 (참고용 보존, 사용 금지)
const _LEGACY_SCHOOL_ADDITIONAL_FIELDS: Record<string, SchoolField[]> = {
  'digital-basics': [
    {
      id: 'computer_experience',
      labelKey: 'enrollment.fields.computerExperience',
      type: 'select',
      required: true,
      options: [
        { value: 'none', labelKey: 'enrollment.fields.expNone' },
        { value: 'basic', labelKey: 'enrollment.fields.expBasic' },
        { value: 'intermediate', labelKey: 'enrollment.fields.expIntermediate' },
      ],
    },
    {
      id: 'has_own_device',
      labelKey: 'enrollment.fields.hasOwnDevice',
      type: 'select',
      required: true,
      options: [
        { value: 'smartphone_only', labelKey: 'enrollment.fields.smartphoneOnly' },
        { value: 'has_computer', labelKey: 'enrollment.fields.hasComputer' },
        { value: 'no_device', labelKey: 'enrollment.fields.noDevice' },
      ],
    },
    {
      id: 'digital_goals',
      labelKey: 'enrollment.fields.digitalGoals',
      type: 'textarea',
      required: false,
    },
  ],

  'marketing': [
    {
      id: 'sns_accounts',
      labelKey: 'enrollment.fields.snsAccounts',
      type: 'multiselect',
      required: true,
      options: [
        { value: 'instagram', labelKey: 'Instagram' },
        { value: 'youtube', labelKey: 'YouTube' },
        { value: 'tiktok', labelKey: 'TikTok' },
        { value: 'facebook', labelKey: 'Facebook' },
        { value: 'naver_blog', labelKey: 'Naver Blog' },
        { value: 'none', labelKey: 'enrollment.fields.noSNS' },
      ],
    },
    {
      id: 'business_type',
      labelKey: 'enrollment.fields.businessType',
      type: 'select',
      required: true,
      options: [
        { value: 'none', labelKey: 'enrollment.fields.noBusiness' },
        { value: 'planning', labelKey: 'enrollment.fields.planningBusiness' },
        { value: 'running', labelKey: 'enrollment.fields.runningBusiness' },
      ],
    },
    {
      id: 'marketing_experience',
      labelKey: 'enrollment.fields.marketingExperience',
      type: 'select',
      required: true,
      options: [
        { value: 'none', labelKey: 'enrollment.fields.expNone' },
        { value: 'basic', labelKey: 'enrollment.fields.expBasic' },
        { value: 'experienced', labelKey: 'enrollment.fields.expExperienced' },
      ],
    },
  ],

  'career': [
    {
      id: 'visa_type',
      labelKey: 'enrollment.fields.visaType',
      type: 'select',
      required: true,
      options: [
        { value: 'E7', labelKey: 'E-7' },
        { value: 'E9', labelKey: 'E-9' },
        { value: 'F2', labelKey: 'F-2' },
        { value: 'F4', labelKey: 'F-4' },
        { value: 'F5', labelKey: 'F-5' },
        { value: 'F6', labelKey: 'F-6' },
        { value: 'D2', labelKey: 'D-2 (유학)' },
        { value: 'other', labelKey: 'enrollment.fields.otherVisa' },
      ],
    },
    {
      id: 'work_experience_korea',
      labelKey: 'enrollment.fields.workExperienceKorea',
      type: 'select',
      required: true,
      options: [
        { value: 'none', labelKey: 'enrollment.fields.expNone' },
        { value: 'under1year', labelKey: 'enrollment.fields.under1year' },
        { value: '1to3years', labelKey: 'enrollment.fields.1to3years' },
        { value: 'over3years', labelKey: 'enrollment.fields.over3years' },
      ],
    },
    {
      id: 'desired_industry',
      labelKey: 'enrollment.fields.desiredIndustry',
      type: 'text',
      required: false,
    },
    {
      id: 'korean_level',
      labelKey: 'enrollment.fields.koreanLevel',
      type: 'select',
      required: true,
      options: [
        { value: 'topik0', labelKey: 'TOPIK 0 (없음)' },
        { value: 'topik1', labelKey: 'TOPIK 1' },
        { value: 'topik2', labelKey: 'TOPIK 2' },
        { value: 'topik3', labelKey: 'TOPIK 3' },
        { value: 'topik4', labelKey: 'TOPIK 4' },
        { value: 'topik5', labelKey: 'TOPIK 5' },
        { value: 'topik6', labelKey: 'TOPIK 6' },
      ],
    },
  ],
};
*/
