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
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
