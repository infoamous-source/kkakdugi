export type UserRole = 'student' | 'instructor' | 'ceo';

// ─── 사용자 타입 (Supabase profiles 테이블 기반) ───

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  instructorCode: string;
  orgCode: string;
  learningPurpose: string;
  createdAt: string;
  // 프로필 추가 정보
  age?: number;
  gender?: 'male' | 'female' | 'other';
  country?: string;
  // 가입 폼 v6 신규 필드 (PRD: docs/prd-signup-form-v5.md)
  koreanLevel?: string | null;    // topik0~topik6
  yearsInKorea?: string | null;   // under6m, 6m_1y, 1y_3y, 3y_5y, 5y_10y, over10y
  visaType?: string | null;       // E7, E9, F2, F4, F5, F6, D2, D4, H2, other, none
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
