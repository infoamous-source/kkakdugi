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

/** Gemini API 키 저장 */
export async function saveGeminiApiKey(userId: string, apiKey: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ gemini_api_key: apiKey, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Save API key error:', error.message);
    return false;
  }
  return true;
}

/** 강사: 학생 API 키 초기화 (키 값은 노출하지 않음) */
export async function resetStudentApiKey(studentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ gemini_api_key: null, updated_at: new Date().toISOString() })
    .eq('id', studentId);

  if (error) {
    console.error('Reset student API key error:', error.message);
    return false;
  }
  return true;
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
