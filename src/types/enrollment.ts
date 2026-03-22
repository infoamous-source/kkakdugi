// ─── 학교 ID ───

export type SchoolId = 'digital-basics' | 'marketing' | 'career';

export const SCHOOL_IDS: SchoolId[] = ['digital-basics', 'marketing', 'career'];

export const SCHOOL_NAMES: Record<SchoolId, { ko: string; en: string; labelKey: string }> = {
  'digital-basics': { ko: '디지털 기초', en: 'Digital Basics', labelKey: 'school.digital' },
  'marketing': { ko: '마케팅', en: 'Marketing', labelKey: 'school.marketing' },
  'career': { ko: '취업', en: 'Career', labelKey: 'school.career' },
};

// ─── Enrollment 상태 ───

export type EnrollmentStatus = 'pending_info' | 'active' | 'suspended' | 'completed';

// ─── Enrollment (학생-학교 등록) ───

export interface Enrollment {
  id: string;
  student_id: string;
  school_id: SchoolId;
  instructor_id: string | null;
  status: EnrollmentStatus;
  enrolled_at: string;
  activated_at?: string | null;
  suspended_at?: string | null;
  completed_at?: string | null;
}

// ─── School Profile (학교별 추가 정보) ───

export interface SchoolProfile {
  id: string;
  enrollment_id: string;
  student_id: string;
  school_id: SchoolId;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ─── School Field (폼 필드 정의) ───

export type SchoolFieldType = 'text' | 'select' | 'number' | 'textarea' | 'multiselect';

export interface SchoolFieldOption {
  value: string;
  labelKey: string;
}

export interface SchoolField {
  id: string;
  labelKey: string;
  placeholderKey?: string;
  type: SchoolFieldType;
  required: boolean;
  options?: SchoolFieldOption[];
}
