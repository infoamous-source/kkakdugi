import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types/database';

/** 프로필 조회 */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Get profile error:', error.message);
    return null;
  }
  return data as ProfileRow;
}

/** 프로필 업데이트 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<ProfileRow, 'id' | 'email' | 'created_at'>>,
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Update profile error:', error.message);
    return false;
  }
  return true;
}

/** 관리자: 모든 학생 프로필 조회 */
export async function getAllStudents(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get all students error:', error.message);
    return [];
  }
  return data as ProfileRow[];
}

/** 관리자: 학생 검색 (이름 또는 이메일) */
export async function searchStudents(query: string): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Search students error:', error.message);
    return [];
  }
  return data as ProfileRow[];
}

/** 관리자: 특정 강사 코드로 등록한 학생 프로필 조회 */
export async function getStudentsByInstructorCode(instructorCode: string): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .eq('instructor_code', instructorCode)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get students by instructor code error:', error.message);
    return [];
  }
  return data as ProfileRow[];
}

/** 선생님코드 유효성 검증 + 이름 조회 */
export async function validateInstructorCode(code: string): Promise<{ valid: boolean; instructorName: string | null }> {
  const { data, error } = await supabase
    .from('instructors')
    .select('id')
    .eq('instructor_code', code.toUpperCase())
    .limit(1);

  if (error || !data?.length) {
    return { valid: false, instructorName: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', data[0].id)
    .single();

  return { valid: true, instructorName: profile?.name || null };
}

/** 선생님코드로 선생님 이름 조회 */
export async function getInstructorNameByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('instructors')
    .select('id')
    .eq('instructor_code', code.toUpperCase())
    .limit(1);

  if (error || !data?.length) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', data[0].id)
    .single();

  return profile?.name || null;
}

/** Gemini API 키 저장 + 기관 풀에 자동 추가 */
export async function saveGeminiApiKey(userId: string, apiKey: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ gemini_api_key: apiKey, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Save API key error:', error.message);
    return false;
  }

  // 기관 풀에 자동 추가 (학생의 org_code로 기관 찾아서 api_key_pool에 push)
  addKeyToOrgPool(userId, apiKey).catch(() => {});

  return true;
}

/** 강사: 학생 API 키 초기화 + 기관 풀에서 제거 */
export async function resetStudentApiKey(studentId: string): Promise<boolean> {
  // 먼저 기존 키 조회 (풀에서 제거용)
  const oldKey = await getGeminiApiKey(studentId);

  const { error } = await supabase
    .from('profiles')
    .update({ gemini_api_key: null, updated_at: new Date().toISOString() })
    .eq('id', studentId);

  if (error) {
    console.error('Reset student API key error:', error.message);
    return false;
  }

  // 기관 풀에서 제거
  if (oldKey) {
    removeKeyFromOrgPool(studentId, oldKey).catch(() => {});
  }

  return true;
}

/** 학생의 기관 풀에 API 키 추가 (중복 방지) */
async function addKeyToOrgPool(userId: string, apiKey: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_code')
    .eq('id', userId)
    .single();

  const orgCode = profile?.org_code;
  if (!orgCode) return;

  const { data: org } = await supabase
    .from('organizations')
    .select('id, api_key_pool')
    .eq('code', orgCode)
    .maybeSingle();

  if (!org) return;

  const pool: string[] = Array.isArray(org.api_key_pool) ? org.api_key_pool : [];
  if (pool.includes(apiKey)) return; // 이미 있음

  await supabase
    .from('organizations')
    .update({ api_key_pool: [...pool, apiKey] })
    .eq('id', org.id);
}

/** 학생의 기관 풀에서 API 키 제거 */
async function removeKeyFromOrgPool(userId: string, apiKey: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_code')
    .eq('id', userId)
    .single();

  const orgCode = profile?.org_code;
  if (!orgCode) return;

  const { data: org } = await supabase
    .from('organizations')
    .select('id, api_key_pool')
    .eq('code', orgCode)
    .maybeSingle();

  if (!org) return;

  const pool: string[] = Array.isArray(org.api_key_pool) ? org.api_key_pool : [];
  const filtered = pool.filter(k => k !== apiKey);
  if (filtered.length === pool.length) return; // 변경 없음

  await supabase
    .from('organizations')
    .update({ api_key_pool: filtered })
    .eq('id', org.id);
}

/** Gemini API 키 조회 */
export async function getGeminiApiKey(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('gemini_api_key')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Get API key error:', error.message);
    return null;
  }
  return data?.gemini_api_key || null;
}
