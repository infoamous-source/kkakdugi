import { supabase } from '../lib/supabase';
import type { ClassSessionRow } from '../types/database';

export interface PostClassStudentActivity {
  studentId: string;
  studentName: string;
  studentEmail: string;
  postClassUsageCount: number;
  lastActivityAt: string | null;
  toolsUsed: string[];
}

export interface PostClassSessionGroup {
  session: ClassSessionRow;
  students: PostClassStudentActivity[];
  totalActiveStudents: number;
  totalActivityCount: number;
}

/**
 * 종료된 수업별로 "수업 종료 이후" 도구 사용 학생 명단을 모은다.
 *
 * 1. end_date가 오늘 이전인 class_sessions를 모두 가져옴
 * 2. 각 session.org_code에 속한 profiles(학생)을 가져옴
 * 3. 그 학생들의 activity_logs 중 created_at > session.end_date 인 것만 집계
 *
 * 활동이 0인 학생은 제외, 활동이 0인 수업은 결과에 포함하되 students=[]
 */
export async function getPostClassActivity(): Promise<PostClassSessionGroup[]> {
  const today = new Date().toISOString().slice(0, 10);

  // 모든 수업을 가져와서 JS에서 "종료" 판정 (end_date 형식·NULL·status 다양성 대응)
  const { data: sessionsData, error: sessionErr } = await supabase
    .from('class_sessions')
    .select('*')
    .order('end_date', { ascending: false, nullsFirst: false });

  if (sessionErr) {
    console.error('[postClassActivity] sessions fetch error:', sessionErr.message);
    return [];
  }

  const allSessions = (sessionsData || []) as ClassSessionRow[];
  // 종료 판정: status === 'completed' OR end_date가 오늘 이전
  const sessions = allSessions.filter(s => {
    if (s.status === 'completed') return true;
    if (!s.end_date) return false;
    const endDate = String(s.end_date).slice(0, 10); // ISO timestamp 대응
    return endDate < today;
  });

  if (sessions.length === 0) return [];

  const orgCodes = Array.from(
    new Set(sessions.map(s => s.org_code).filter((c): c is string => !!c).map(c => c.toUpperCase())),
  );
  if (orgCodes.length === 0) return [];

  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('id, name, email, org_code, role')
    .in('org_code', orgCodes)
    .eq('role', 'student');

  if (profileErr) {
    console.error('[postClassActivity] profiles fetch error:', profileErr.message);
    return [];
  }
  const profiles = (profileData || []) as Array<{ id: string; name: string | null; email: string | null; org_code: string | null }>;

  const studentIds = profiles.map(p => p.id);
  if (studentIds.length === 0) {
    return sessions.map(session => ({
      session,
      students: [],
      totalActiveStudents: 0,
      totalActivityCount: 0,
    }));
  }

  // 모든 종료 시점 중 가장 빠른 것을 기준으로 logs 가져옴 (end_date 또는 updated_at)
  const sessionEndTimes = sessions
    .map(s => {
      if (s.end_date) return String(s.end_date).slice(0, 10);
      if (s.updated_at) return String(s.updated_at).slice(0, 10);
      return null;
    })
    .filter((d): d is string => !!d);
  const oldestEnd = sessionEndTimes.length > 0
    ? sessionEndTimes.sort()[0]
    : today;
  const { data: logData, error: logErr } = await supabase
    .from('activity_logs')
    .select('user_id, action, created_at, metadata')
    .in('user_id', studentIds)
    .gt('created_at', oldestEnd)
    .order('created_at', { ascending: false })
    .limit(10000);

  if (logErr) {
    console.error('[postClassActivity] logs fetch error:', logErr.message);
    return [];
  }
  const logs = (logData || []) as Array<{ user_id: string; action: string; created_at: string; metadata: Record<string, unknown> | null }>;

  return sessions.map(session => {
    const orgCode = (session.org_code || '').toUpperCase();
    // end_date가 없고 status=completed인 수업은 session.updated_at 기준 (강사가 수동 종료한 시점)
    const sessionEnd = session.end_date
      ? new Date(String(session.end_date).slice(0, 10))
      : session.updated_at
        ? new Date(session.updated_at)
        : null;

    const sessionStudents = profiles.filter(p => (p.org_code || '').toUpperCase() === orgCode);

    const studentRows: PostClassStudentActivity[] = sessionStudents
      .map(student => {
        const studentLogs = logs.filter(l =>
          l.user_id === student.id &&
          (sessionEnd ? new Date(l.created_at) > sessionEnd : true),
        );
        const tools = Array.from(new Set(
          studentLogs
            .map(l => (l.metadata as Record<string, unknown> | null)?.toolId)
            .filter((t): t is string => typeof t === 'string'),
        ));
        return {
          studentId: student.id,
          studentName: student.name || '(이름 없음)',
          studentEmail: student.email || '',
          postClassUsageCount: studentLogs.length,
          lastActivityAt: studentLogs[0]?.created_at ?? null,
          toolsUsed: tools,
        };
      })
      .filter(s => s.postClassUsageCount > 0)
      .sort((a, b) => b.postClassUsageCount - a.postClassUsageCount);

    return {
      session,
      students: studentRows,
      totalActiveStudents: studentRows.length,
      totalActivityCount: studentRows.reduce((sum, s) => sum + s.postClassUsageCount, 0),
    };
  });
}

/** 기관 코드의 모든 학생 이메일을 한 번에 가져온다 (이메일 일괄 복사용) */
export async function getStudentEmailsByOrg(orgCode: string): Promise<{ name: string; email: string }[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('org_code', orgCode.toUpperCase())
    .eq('role', 'student');

  if (error) {
    console.error('[getStudentEmailsByOrg] error:', error.message);
    return [];
  }
  return (data || [])
    .filter((row): row is { name: string | null; email: string } =>
      typeof row.email === 'string' && row.email.length > 0,
    )
    .map(row => ({ name: row.name || '', email: row.email }));
}
