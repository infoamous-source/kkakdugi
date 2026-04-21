import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, AuthState } from '../types/auth';
import type { ProfileRow } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { updateProfile } from '../services/profileService';
import { getStoredApiKey, restoreGeminiConnection, clearGeminiConnection } from '../services/gemini/geminiClient';
import { createEnrollment } from '../services/enrollmentService';
import { getOrgProgramTypes } from '../services/organizationService';
import { addClassroomMember } from '../services/teamService';
import { redirectToNaverLogin } from '../lib/naverOAuth';

// 자율 가입 허용 기관 — 별도 교실 배정 없이 자동 기본반 배정
// (key: 대문자 org_code, value: classroom_group id)
const AUTO_CLASSROOM_ASSIGN: Record<string, string> = {
  HUC454: '5efa716c-b723-43e6-9778-86cfcee9f0ec', // 서울글로벌센터 · 자율반
};

export type SocialProvider = 'kakao' | 'google' | 'naver';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData, rememberMe?: boolean) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  orgCode: string;
  country: string;
  gender: 'male' | 'female';
  birthYear: number;
  // 가입 폼 v6 신규 필드 (모두 필수)
  koreanLevel: string;   // topik0~topik6
  yearsInKorea: string;  // under6m, 6m_1y, 1y_3y, 3y_5y, 5y_10y, over10y
  visaType: string;      // E7, E9, F2, F4, F5, F6, D2, D4, H2, other, none
  // 강사 자동 매칭 (validateOrgCode 결과)
  instructorId?: string | null;
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
    // 가입 폼 v6 신규 필드
    koreanLevel: p.korean_level ?? null,
    yearsInKorea: p.years_in_korea ?? null,
    visaType: p.visa_type ?? null,
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

/** Supabase에 키가 있고 localStorage에 없으면 복원 */
function syncGeminiKey(profile: ProfileRow | null): void {
  if (!profile?.gemini_api_key) {
    console.warn('[Auth] syncGeminiKey: 프로필에 API 키 없음 (gemini_api_key =', profile?.gemini_api_key === null ? 'null' : 'undefined', ')');
    return;
  }
  if (getStoredApiKey()) return; // 이미 로컬에 있으면 skip
  restoreGeminiConnection(profile.gemini_api_key);
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
        syncGeminiKey(profile);
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
          syncGeminiKey(profile);
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

  const loginWithSocial = useCallback(async (provider: SocialProvider) => {
    if (!isSupabaseConfigured) {
      console.warn('[Auth] Supabase 미설정 — 소셜 로그인 불가');
      return;
    }

    // 네이버는 Supabase 네이티브 미지원 → 수동 OAuth 플로우
    if (provider === 'naver') {
      redirectToNaverLogin();
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === 'kakao' ? { prompt: 'login' } : {},
      },
    });
    if (error) {
      console.error(`Social login error (${provider}):`, error.message);
      throw error;
    }
    // 브라우저가 OAuth 페이지로 리다이렉트되므로, 이후 처리는 /auth/callback에서 수행
  }, []);

  const logout = useCallback(async () => {
    clearGeminiConnection();
    await supabase.auth.signOut();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // P0-5: 무활동 자동 로그아웃
  // - 학생: 15분 (공용 기기·학원 PC 안전 장치)
  // - CEO·강사: 8시간 (본인 기기에서 종일 업무용, 점심·회의로 자리 비워도 세션 유지)
  const role = state.user?.role;
  const IDLE_TIMEOUT_MS = role === 'ceo' || role === 'instructor'
    ? 8 * 60 * 60 * 1000  // 8시간
    : 15 * 60 * 1000;     // 15분
  useEffect(() => {
    if (!state.isAuthenticated) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [state.isAuthenticated, logout]);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      if (profile) {
        setState(prev => ({ ...prev, user: profileToUser(profile) }));
      }
    }
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user, isAuthenticated: !!user }));
  }, []);

  const register = useCallback(async (data: RegisterData, _rememberMe = false): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      throw new Error('supabase_not_configured');
    }

    // 가입 폼 v6: 학생 역할만 가입 가능. CEO/강사는 admin 패널에서 별도 생성.
    const role: 'student' = 'student';

    // 1) Supabase Auth 계정 생성 (트리거가 profiles 자동 생성)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role,
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

    // 2) P0-2: 트리거가 profiles 행을 생성했는지 폴링으로 확인
    // (기존 500ms 고정 대기 → 30명 동시 가입 시 트리거 지연에 안전)
    const userId = authData.user.id;
    let profileReady = false;
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      if (profileRow) {
        profileReady = true;
        break;
      }
    }
    if (!profileReady) {
      console.error('[register] profile row not created by trigger within polling window');
      throw new Error('profile_creation_timeout');
    }

    // 3) 자동 로그인 (세션 생성)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (loginError) {
      console.error('Auto-login error:', loginError.message);
      throw new Error(loginError.message);
    }

    // 4) 추가 프로필 정보 저장 (가입 폼 v6 신규 필드 포함)
    const currentYear = new Date().getFullYear();
    await updateProfile(authData.user.id, {
      country: data.country,
      gender: data.gender,
      age: currentYear - data.birthYear,
      org_code: data.orgCode || '',
      role,
      // v6 신규 필드
      korean_level: data.koreanLevel as never,
      years_in_korea: data.yearsInKorea as never,
      visa_type: data.visaType as never,
    });

    // 5) 기관의 program_types에 따라 enrollment 자동 생성 (즉시 active)
    //    강사 ID는 validateOrgCode 결과에서 자동 매칭됨
    const programTypes = data.orgCode
      ? await getOrgProgramTypes(data.orgCode)
      : ['marketing' as const];
    await Promise.all(
      programTypes.map(schoolId =>
        createEnrollment(authData.user!.id, schoolId, data.instructorId ?? null, true),
      ),
    );

    // 5-b) 자율 가입 기관(HUC454 등)은 기본 교실에 자동 배정
    //      — 선생님의 별도 배정 작업 없이 바로 학과 진입 가능
    const upperOrgCode = (data.orgCode || '').toUpperCase();
    const autoClassroomId = AUTO_CLASSROOM_ASSIGN[upperOrgCode];
    if (autoClassroomId) {
      try {
        await addClassroomMember(autoClassroomId, authData.user.id, data.name);
      } catch (err) {
        console.error('[register] auto classroom assignment failed:', err);
        // 배정 실패해도 가입 자체는 성공 — 나중에 관리자가 수동 배정 가능
      }
    }

    // 6) user 상태가 onAuthStateChange로 자동 업데이트됨
    return true;
  }, []);

  return (
    <AuthContext.Provider value={useMemo(() => ({ ...state, login, loginWithSocial, logout, register, refreshUser, setUser }), [state, login, loginWithSocial, logout, register, refreshUser, setUser])}>
      {children}
    </AuthContext.Provider>
  );
}

/** Supabase에서 프로필 조회 */
async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  // gemini_api_key는 syncGeminiKey에서만 사용 — 별도 조회
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, organization, org_code, instructor_code, country, age, gender, learning_purpose, marketing_persona, korean_level, years_in_korea, visa_type, gemini_api_key, created_at, updated_at')
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
