// ─── Supabase DB row types ───

// 가입 폼 v6 신규 필드 타입 (PRD: docs/prd-signup-form-v5.md)
export type KoreanLevel = 'topik0' | 'topik1' | 'topik2' | 'topik3' | 'topik4' | 'topik5' | 'topik6';
export type YearsInKorea = 'under6m' | '6m_1y' | '1y_3y' | '3y_5y' | '5y_10y' | 'over10y';
export type VisaType = 'E7' | 'E9' | 'F2' | 'F4' | 'F5' | 'F6' | 'D2' | 'D4' | 'H2' | 'other' | 'none';

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'ceo';
  organization: string;
  org_code: string;
  instructor_code: string;
  country: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  learning_purpose: string;
  gemini_api_key: string | null;
  marketing_persona: string | null; // 1교시 적성검사 결과 (PersonaId)
  // 가입 폼 v6 신규 필드
  korean_level: KoreanLevel | null;
  years_in_korea: YearsInKorea | null;
  visa_type: VisaType | null;
  created_at: string;
  updated_at: string;
}

export interface InstructorRow {
  id: string;
  instructor_code: string;
  assigned_schools: string[];
  created_at: string;
}

export interface EnrollmentRow {
  id: string;
  student_id: string;
  school_id: string;
  instructor_id: string | null;
  status: string;
  enrolled_at: string;
  activated_at: string | null;
  suspended_at: string | null;
  completed_at: string | null;
}

export interface SchoolProfileRow {
  id: string;
  enrollment_id: string;
  student_id: string;
  school_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SchoolProgressRow {
  id: string;
  enrollment_id: string;
  student_id: string;
  school_id: string;
  stamps: unknown;
  graduation: unknown;
  aptitude_result: unknown;
  simulation_result: unknown;
  market_compass_data: unknown;
  enrolled_at: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioEntryRow {
  id: string;
  user_id: string;
  tool_id: string;
  module_id: string;
  tool_name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  is_mock_data: boolean;
  created_at: string;
}

export interface ActivityLogRow {
  id: string;
  user_id: string;
  track_id: string | null;
  module_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface IdeaBoxItemRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  preview: string | null;
  tool_id: string | null;
  tags: string[];
  created_at: string;
}

export interface DigitalProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  completed_steps: string[];
  completed_practices: string[];
  completed_at: string | null;
  updated_at: string;
}

export interface MarketingProgressRow {
  id: string;
  user_id: string;
  module_id: string;
  viewed_at: string | null;
  tool_used_at: string | null;
  tool_output_count: number;
  completed_at: string | null;
  updated_at: string;
}

export interface InstructorSettingsRow {
  id: string;
  instructor_id: string;
  settings: Record<string, unknown>;
  updated_at: string;
}
