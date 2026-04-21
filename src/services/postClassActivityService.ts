import { supabase } from '../lib/supabase';
import type { ClassroomGroup, ClassroomMember } from '../types/team';

export interface PostClassStudentActivity {
  studentId: string;
  studentName: string;
  studentEmail: string;
  postClassUsageCount: number;
  lastActivityAt: string | null;
  toolsUsed: string[];
}

export interface PostClassClassroomGroup {
  classroom: ClassroomGroup;
  /** 학생 만료일 (end_date+contract_days, contract_until 중 늦은 것). 둘 다 없으면 null */
  expiryAt: string | null;
  students: PostClassStudentActivity[];
  totalActiveStudents: number;
  totalActivityCount: number;
}

/** 교실의 만료일 계산. end_date+contract_days, contract_until 중 늦은 것. */
function computeClassroomExpiry(c: ClassroomGroup): Date | null {
  const candidates: Date[] = [];
  if (c.end_date && typeof c.contract_days === 'number') {
    const d = new Date(String(c.end_date).slice(0, 10));
    d.setDate(d.getDate() + c.contract_days);
    candidates.push(d);
  }
  if (c.contract_until) {
    candidates.push(new Date(String(c.contract_until).slice(0, 10)));
  }
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a > b ? a : b));
}

/**
 * 종료된 교실(수업) × 그 교실 학생들의 "수업 종료 이후" 도구 사용 이력을 모은다.
 *
 * 종료 판정: end_date가 오늘 이전 OR contract_until이 오늘 이전 (둘 다 없으면 종료 아님)
 * 활동 기준: end_date 이후의 activity_logs.created_at
 */
export async function getPostClassActivity(): Promise<PostClassClassroomGroup[]> {
  const today = new Date().toISOString().slice(0, 10);

  // 1) 모든 활성 교실 가져옴 (보관된 것 제외)
  const { data: classroomData, error: cErr } = await supabase
    .from('classroom_groups')
    .select('*')
    .is('archived_at', null)
    .order('end_date', { ascending: false, nullsFirst: false });
  if (cErr) {
    console.error('[postClassActivity] classroom fetch error:', cErr.message);
    return [];
  }
  const allClassrooms = (classroomData || []) as ClassroomGroup[];

  // 2) 종료 판정 — end_date가 오늘 이전인 교실만
  const endedClassrooms = allClassrooms.filter(c => {
    if (!c.end_date) return false;
    return String(c.end_date).slice(0, 10) < today;
  });
  if (endedClassrooms.length === 0) return [];

  const classroomIds = endedClassrooms.map(c => c.id);

  // 3) 멤버 조회 (활성 상태만)
  const { data: memberData, error: mErr } = await supabase
    .from('classroom_members')
    .select('id, group_id, user_id, user_name, status')
    .in('group_id', classroomIds)
    .eq('status', 'active');
  if (mErr) {
    console.error('[postClassActivity] members fetch error:', mErr.message);
    return [];
  }
  const members = (memberData || []) as ClassroomMember[];
  const studentIds = Array.from(new Set(members.map(m => m.user_id)));

  // 4) 학생 이메일 보강
  let emailMap: Record<string, string> = {};
  if (studentIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', studentIds);
    (profileData || []).forEach(p => {
      if (p.email) emailMap[p.id] = p.email;
    });
  }

  // 5) 활동 로그 조회 (모든 교실 종료일 중 가장 빠른 것 이후)
  const oldestEnd = endedClassrooms
    .map(c => String(c.end_date).slice(0, 10))
    .sort()[0] ?? today;

  let logs: Array<{ user_id: string; created_at: string; metadata: Record<string, unknown> | null }> = [];
  if (studentIds.length > 0) {
    const { data: logData, error: lErr } = await supabase
      .from('activity_logs')
      .select('user_id, action, created_at, metadata')
      .in('user_id', studentIds)
      .gt('created_at', oldestEnd)
      .order('created_at', { ascending: false })
      .limit(10000);
    if (lErr) {
      console.error('[postClassActivity] logs fetch error:', lErr.message);
    } else {
      logs = (logData || []) as typeof logs;
    }
  }

  // 6) 교실별로 묶기
  return endedClassrooms.map(classroom => {
    const sessionEnd = new Date(String(classroom.end_date).slice(0, 10));
    const classroomMembers = members.filter(m => m.group_id === classroom.id);

    const studentRows: PostClassStudentActivity[] = classroomMembers
      .map(member => {
        const studentLogs = logs.filter(l =>
          l.user_id === member.user_id && new Date(l.created_at) > sessionEnd,
        );
        const tools = Array.from(new Set(
          studentLogs
            .map(l => (l.metadata as Record<string, unknown> | null)?.toolId)
            .filter((t): t is string => typeof t === 'string'),
        ));
        return {
          studentId: member.user_id,
          studentName: member.user_name || '(이름 없음)',
          studentEmail: emailMap[member.user_id] || '',
          postClassUsageCount: studentLogs.length,
          lastActivityAt: studentLogs[0]?.created_at ?? null,
          toolsUsed: tools,
        };
      })
      .filter(s => s.postClassUsageCount > 0)
      .sort((a, b) => b.postClassUsageCount - a.postClassUsageCount);

    const expiry = computeClassroomExpiry(classroom);

    return {
      classroom,
      expiryAt: expiry ? expiry.toISOString() : null,
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
