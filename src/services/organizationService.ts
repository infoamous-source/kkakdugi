import { supabase } from '../lib/supabase';
import type { SchoolId } from '../types/enrollment';

// ─── Types ───

export interface OrganizationRow {
  id: string;
  name: string;
  code: string;
  instructor_id: string;
  program_types: SchoolId[];
  created_at: string;
}

// ─── Code generation ───

/** 6자리 자동생성: 3글자 + 3숫자 (헷갈리는 문자 제외) */
function generateOrgCode(): string {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'; // no I, L, O
  const digits = '23456789'; // no 0, 1
  let code = '';
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 3; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

// ─── CRUD ───

/** 기관 생성 (코드 자동생성, 충돌 시 재시도) */
export async function createOrganization(
  instructorId: string,
  name: string,
  programTypes: SchoolId[] = ['marketing'],
): Promise<OrganizationRow | null> {
  let retries = 3;

  while (retries > 0) {
    const code = generateOrgCode();
    const { data, error } = await supabase
      .from('organizations')
      .insert({ instructor_id: instructorId, name, code, program_types: programTypes })
      .select()
      .single();

    if (!error) return data as OrganizationRow;

    // unique constraint violation → 재생성
    if (error.code === '23505') {
      retries--;
      continue;
    }

    console.error('Create organization error:', error.message);
    return null;
  }

  console.error('Failed to generate unique org code after retries');
  return null;
}

/** 강사의 기관 목록 조회 */
export async function getOrganizations(instructorId: string): Promise<OrganizationRow[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get organizations error:', error.message);
    return [];
  }
  return data as OrganizationRow[];
}

/** 기관 삭제 */
export async function deleteOrganization(orgId: string): Promise<boolean> {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId);

  if (error) {
    console.error('Delete organization error:', error.message);
    return false;
  }
  return true;
}

/** 기관코드 검증 (가입 시 사용) */
export async function validateOrgCode(code: string): Promise<{ valid: boolean; orgName: string | null; programTypes: SchoolId[] | null }> {
  const { data, error } = await supabase
    .from('organizations')
    .select('name, program_types')
    .eq('code', code.toUpperCase())
    .limit(1);

  if (error) {
    console.error('Validate org code error:', error.message);
    return { valid: false, orgName: null, programTypes: null };
  }

  if (data && data.length > 0) {
    const programTypes = (data[0].program_types as SchoolId[] | null) || null;
    return { valid: true, orgName: data[0].name, programTypes };
  }
  return { valid: false, orgName: null, programTypes: null };
}

/** 기관코드로 program_types 조회 */
export async function getOrgProgramTypes(orgCode: string): Promise<SchoolId[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('program_types')
    .eq('code', orgCode.toUpperCase())
    .limit(1);

  if (error) {
    console.error('Get org program types error:', error.message);
    return ['marketing'];
  }

  if (data && data.length > 0 && data[0].program_types && (data[0].program_types as SchoolId[]).length > 0) {
    return data[0].program_types as SchoolId[];
  }
  return ['marketing'];
}

/** 기관코드별 학생 수 조회 */
export async function getOrgStudentCount(orgCode: string): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('org_code', orgCode)
    .eq('role', 'student');

  if (error) {
    console.error('Get org student count error:', error.message);
    return 0;
  }
  return count || 0;
}
