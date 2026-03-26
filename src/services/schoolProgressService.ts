import { supabase } from '../lib/supabase';
import type { SchoolProgressRow } from '../types/database';
import type {
  SchoolProgress,
  StampProgress,
  GraduationStatus,
  AptitudeResult,
  MarketCompassData,
  SimulationResult,
} from '../types/school';
import { SCHOOL_CURRICULUM } from '../types/school';

// ─── DB Row → App Type 변환 ───

function rowToProgress(row: SchoolProgressRow): SchoolProgress {
  return {
    stamps: (row.stamps as StampProgress[]) ?? SCHOOL_CURRICULUM.map((p) => ({
      periodId: p.id,
      completed: false,
    })),
    graduation: (row.graduation as GraduationStatus) ?? { isGraduated: false },
    aptitudeResult: row.aptitude_result as AptitudeResult | undefined,
    marketCompassData: row.market_compass_data as MarketCompassData | undefined,
    simulationResult: row.simulation_result as SimulationResult | undefined,
    enrolledAt: row.enrolled_at ?? new Date().toISOString(),
  };
}

// ─── App Type → DB columns 변환 ───

function progressToRow(progress: SchoolProgress): Record<string, unknown> {
  return {
    stamps: progress.stamps,
    graduation: progress.graduation,
    aptitude_result: progress.aptitudeResult ?? null,
    simulation_result: progress.simulationResult ?? null,
    market_compass_data: progress.marketCompassData ?? null,
    enrolled_at: progress.enrolledAt,
  };
}

// ─── CRUD ───

/** 학생의 school_progress 조회 */
export async function fetchSchoolProgress(userId: string): Promise<SchoolProgress | null> {
  const { data, error } = await supabase
    .from('school_progress')
    .select('*')
    .eq('student_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Fetch school progress error:', error.message);
    return null;
  }
  if (!data) return null;
  return rowToProgress(data as SchoolProgressRow);
}

/** school_progress upsert (enrollment_id 기준) */
export async function upsertSchoolProgress(
  userId: string,
  progress: SchoolProgress,
  enrollmentId: string,
  schoolId: string,
): Promise<boolean> {
  const columns = progressToRow(progress);

  const { error } = await supabase
    .from('school_progress')
    .upsert(
      {
        student_id: userId,
        enrollment_id: enrollmentId,
        school_id: schoolId,
        ...columns,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'enrollment_id' },
    );

  if (error) {
    console.error('Upsert school progress error:', error.message);
    return false;
  }
  return true;
}

/** 관리자: 모든 school_progress 조회 (프로필 포함) */
export async function fetchAllSchoolProgress(): Promise<Array<{ userId: string; enrollmentId: string; schoolId: string; progress: SchoolProgress; studentName: string; studentEmail: string; studentOrg: string }>> {
  const { data, error } = await supabase
    .from('school_progress')
    .select('*, profiles:student_id(name, email, organization)')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Fetch all school progress error:', error.message);
    return [];
  }

  return (data as (SchoolProgressRow & { profiles: { name: string; email: string; organization: string } | null })[]).map((row) => ({
    userId: row.student_id,
    enrollmentId: row.enrollment_id,
    schoolId: row.school_id,
    progress: rowToProgress(row),
    studentName: row.profiles?.name ?? '',
    studentEmail: row.profiles?.email ?? '',
    studentOrg: row.profiles?.organization ?? '',
  }));
}

/** 관리자: 학생 진행상황 삭제(리셋) */
export async function deleteSchoolProgress(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('school_progress')
    .delete()
    .eq('student_id', userId);

  if (error) {
    console.error('Delete school progress error:', error.message);
    return false;
  }
  return true;
}
