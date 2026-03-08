import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, AuthState } from '../types/auth';
import type { ProfileRow } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { updateProfile, validateInstructorCode } from '../services/profileService';
import { createEnrollment } from '../services/enrollmentService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData, rememberMe?: boolean) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  instructorCode: string;
  orgCode: string;
  country: string;
  gender: 'male' | 'female';
  birthYear: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** ProfileRow → User 변환 */
function profileToUser(p: ProfileRow): User {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role,
    organization: p.organization || '',
    instructorCode: p.instructor_code || '',
    orgCode: p.org_code || '',
    learningPurpose: p.learning_purpose || '',
    createdAt: p.created_at,
    age: p.age ?? undefined,
    gender: p.gender ?? undefined,
    country: p.country ?? undefined,
  };
}

/** Supabase session.user → User fallback (RLS 에러 시 사용) */
function sessionToUser(su: SupabaseUser): User {
  const meta = su.user_metadata || {};
  return {
    id: su.id,
    name: meta.name || '',
    email: su.email || '',
    role: meta.role || 'student',
    organization: '',
    instructorCode: meta.instructor_code || '',
    orgCode: meta.org_code || '',
    learningPurpose: '',
    createdAt: su.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // login() 완료를 대기하기 위한 resolve 함수 보관
  const loginResolveRef = useRef<((value: boolean) => void) | null>(null);

  // Supabase 인증 상태 변화 감지
  useEffect(() => {
    // Supabase 미설정 시 오프라인 모드
    if (!isSupabaseConfigured) {
      setState({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // 현재 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        const user = profile ? profileToUser(profile) : sessionToUser(session.user);
        setState({ user, isAuthenticated: true, isLoading: false });
        return;
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          const user = profile ? profileToUser(profile) : sessionToUser(session.user);
          setState({ user, isAuthenticated: true, isLoading: false });
          // 대기 중인 login() Promise를 resolve
          if (loginResolveRef.current) {
            loginResolveRef.current(true);
            loginResolveRef.current = null;
          }
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string, _rememberMe = false): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      console.warn('[Auth] Supabase 미설정 — 로그인 불가');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    // onAuthStateChange + fetchProfile 완료까지 대기
    return new Promise<boolean>((resolve) => {
      loginResolveRef.current = resolve;
      // 안전장치: 5초 후에도 응답 없으면 true 반환 (네트워크 지연 대비)
      setTimeout(() => {
        if (loginResolveRef.current) {
          loginResolveRef.current(true);
          loginResolveRef.current = null;
        }
      }, 5000);
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      if (profile) {
        setState(prev => ({ ...prev, user: profileToUser(profile) }));
      }
    }
  }, []);

  const register = useCallback(async (data: RegisterData, _rememberMe = false): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('supabase_not_configured');
    }

    // 0) 선생님코드 유효성 검증 (이중 안전장치)
    if (data.instructorCode) {
      const result = await validateInstructorCode(data.instructorCode);
      if (!result.valid) {
        throw new Error('invalid_instructor_code');
      }
    }

    // 1) Supabase Auth 계정 생성 (트리거가 profiles 자동 생성)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: 'student',
          instructor_code: data.instructorCode || '',
          org_code: data.orgCode || '',
        },
      },
    });

    if (authError) {
      console.error('Register error:', authError.message);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      console.error('No user returned from signUp');
      throw new Error('register_failed');
    }

    // 2) 트리거가 profiles 행을 자동 생성하도록 대기
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3) 자동 로그인 (세션 생성)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (loginError) {
      console.error('Auto-login error:', loginError.message);
      throw new Error(loginError.message);
    }

    // 4) 추가 프로필 정보 저장 (country, gender, age, instructor_code, org_code)
    const currentYear = new Date().getFullYear();
    await updateProfile(authData.user.id, {
      country: data.country,
      gender: data.gender,
      age: currentYear - data.birthYear,
      instructor_code: data.instructorCode || '',
      org_code: data.orgCode || '',
    });

    // 5) 마케팅 학교 enrollment 자동 생성 (즉시 active)
    await createEnrollment(authData.user.id, 'marketing', null, true);

    // 6) user 상태가 onAuthStateChange로 자동 업데이트됨
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Supabase에서 프로필 조회 */
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Fetch profile error:', error.message);
    return null;
  }
  return data as ProfileRow;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
