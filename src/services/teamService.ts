import { supabase } from '../lib/supabase';
import type {
  ClassroomGroup,
  ClassroomMember,
  TeamGroup,
  TeamMember,
  TeamIdea,
} from '../types/team';

// ─────────────────────────────────
// 교실 그룹 CRUD
// ─────────────────────────────────

/** 교실 생성 */
export async function createClassroomGroup(
  instructorId: string,
  orgCode: string,
  track: string,
  classroomName: string,
): Promise<ClassroomGroup | null> {
  const { data, error } = await supabase
    .from('classroom_groups')
    .insert({
      instructor_id: instructorId,
      org_code: orgCode,
      track,
      classroom_name: classroomName,
    })
    .select()
    .single();

  if (error) {
    console.error('Create classroom group error:', error.message, error.details, error.hint, error.code);
    return null;
  }
  return data as ClassroomGroup;
}

/** 강사의 교실 목록 조회 */
export async function getClassroomGroups(instructorId: string): Promise<ClassroomGroup[]> {
  const { data, error } = await supabase
    .from('classroom_groups')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get classroom groups error:', error.message);
    return [];
  }
  return data as ClassroomGroup[];
}

/** 교실 삭제 */
export async function deleteClassroomGroup(groupId: string): Promise<boolean> {
  const { error } = await supabase
    .from('classroom_groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    console.error('Delete classroom group error:', error.message);
    return false;
  }
  return true;
}

// ─────────────────────────────────
// 교실 멤버 CRUD
// ─────────────────────────────────

/** 교실에 학생 추가 */
export async function addClassroomMember(
  groupId: string,
  userId: string,
  userName: string,
): Promise<ClassroomMember | null> {
  const { data, error } = await supabase
    .from('classroom_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      user_name: userName,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Add classroom member error:', error.message);
    return null;
  }
  return data as ClassroomMember;
}

/** 교실 멤버 조회 */
export async function getClassroomMembers(groupId: string): Promise<ClassroomMember[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Get classroom members error:', error.message);
    return [];
  }
  return data as ClassroomMember[];
}

/** 교실에서 학생 제거 */
export async function removeClassroomMember(memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Remove classroom member error:', error.message);
    return false;
  }
  return true;
}

// ─────────────────────────────────
// 팀 CRUD
// ─────────────────────────────────

/** 팀 생성 */
export async function createTeam(
  classroomGroupId: string,
  name: string,
  createdBy: string,
): Promise<TeamGroup | null> {
  const { data, error } = await supabase
    .from('team_groups')
    .insert({
      classroom_group_id: classroomGroupId,
      name,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Create team error:', error.message);
    return null;
  }
  return data as TeamGroup;
}

/** 교실의 팀 목록 조회 */
export async function getTeams(classroomGroupId: string): Promise<TeamGroup[]> {
  const { data, error } = await supabase
    .from('team_groups')
    .select('*')
    .eq('classroom_group_id', classroomGroupId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Get teams error:', error.message);
    return [];
  }
  return data as TeamGroup[];
}

/** 팀 삭제 */
export async function deleteTeam(teamId: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_groups')
    .delete()
    .eq('id', teamId);

  if (error) {
    console.error('Delete team error:', error.message);
    return false;
  }
  return true;
}

// ─────────────────────────────────
// 팀 멤버 CRUD
// ─────────────────────────────────

/** 팀에 멤버 추가 */
export async function addTeamMember(
  teamId: string,
  userId: string,
  userName: string,
  aptitudeType?: string | null,
  animalIcon?: string | null,
): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userId,
      user_name: userName,
      aptitude_type: aptitudeType || null,
      animal_icon: animalIcon || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Add team member error:', error.message);
    return null;
  }
  return data as TeamMember;
}

/** 팀 멤버 조회 */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Get team members error:', error.message);
    return [];
  }
  return data as TeamMember[];
}

/** 팀에서 멤버 제거 */
export async function removeTeamMember(memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    console.error('Remove team member error:', error.message);
    return false;
  }
  return true;
}

/** 학생이 자기 팀 조회 (소속된 팀 + 교실 + 팀원) */
export async function getMyTeam(userId: string): Promise<{
  team: TeamGroup;
  classroom: ClassroomGroup;
  members: TeamMember[];
} | null> {
  // 1. team_members에서 내가 속한 팀 찾기 (가장 최근 배정된 팀 우선)
  const { data: myMembership, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (memberError || !myMembership) {
    if (memberError) console.error('Get my team error:', memberError.message);
    return null;
  }

  // 2. 팀 정보 조회
  const { data: team, error: teamError } = await supabase
    .from('team_groups')
    .select('*')
    .eq('id', myMembership.team_id)
    .single();

  if (teamError || !team) {
    return null;
  }

  // 3. 교실 정보 조회 (실패해도 팀 정보는 반환)
  const { data: classroom } = await supabase
    .from('classroom_groups')
    .select('*')
    .eq('id', (team as TeamGroup).classroom_group_id)
    .single();

  // 4. 팀원 목록 조회
  const members = await getTeamMembers(myMembership.team_id);

  return {
    team: team as TeamGroup,
    classroom: (classroom as ClassroomGroup) ?? {
      id: (team as TeamGroup).classroom_group_id,
      org_code: '',
      track: 'marketing',
      classroom_name: '',
      instructor_id: '',
      created_at: '',
    },
    members,
  };
}

// ─────────────────────────────────
// 팀 아이디어 보석함 CRUD
// ─────────────────────────────────

/** 보석함에 아이디어 추가 */
export async function addTeamIdea(
  teamId: string,
  userId: string,
  userName: string,
  animalIcon: string | null,
  toolId: string,
  title: string,
  content: string,
): Promise<TeamIdea | null> {
  const { data, error } = await supabase
    .from('team_ideas')
    .insert({
      team_id: teamId,
      user_id: userId,
      user_name: userName,
      animal_icon: animalIcon,
      tool_id: toolId,
      title,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Add team idea error:', error.message);
    return null;
  }
  return data as TeamIdea;
}

/** 팀 보석함 조회 */
export async function getTeamIdeas(teamId: string): Promise<TeamIdea[]> {
  const { data, error } = await supabase
    .from('team_ideas')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get team ideas error:', error.message);
    return [];
  }
  return data as TeamIdea[];
}

/** 보석함 아이디어 삭제 (본인만) */
export async function deleteTeamIdea(ideaId: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_ideas')
    .delete()
    .eq('id', ideaId);

  if (error) {
    console.error('Delete team idea error:', error.message);
    return false;
  }
  return true;
}

/** 학생이 특정 학과(track)의 교실에 배정되어 있는지 확인 */
export async function isStudentAssignedToTrack(
  userId: string,
  track: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_student_track_assignment', { p_user_id: userId, p_track: track });

  if (error) {
    console.error('Check student assignment error:', error.message);
    throw new Error(error.message);
  }
  return data === true;
}

/** 학생의 전체 배정 정보 조회 (학과별 교실) */
export async function getStudentAssignments(userId: string): Promise<
  { track: string; classroomName: string; groupId: string }[]
> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('group_id, classroom_groups!inner(id, track, classroom_name)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Get student assignments error:', error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const cg = row.classroom_groups as Record<string, string>;
    return {
      track: cg.track,
      classroomName: cg.classroom_name,
      groupId: cg.id,
    };
  });
}

/** 여러 학생의 배정 정보를 한 번에 조회 (N+1 방지) */
export async function getStudentAssignmentsBatch(
  userIds: string[],
): Promise<Record<string, { track: string; classroomName: string; groupId: string }[]>> {
  if (userIds.length === 0) return {};

  const { data, error } = await supabase
    .from('classroom_members')
    .select('user_id, group_id, classroom_groups!inner(id, track, classroom_name)')
    .in('user_id', userIds)
    .eq('status', 'active');

  if (error) {
    console.error('Get student assignments batch error:', error.message);
    return {};
  }

  const result: Record<string, { track: string; classroomName: string; groupId: string }[]> = {};
  for (const uid of userIds) {
    result[uid] = [];
  }

  (data ?? []).forEach((row: Record<string, unknown>) => {
    const userId = row.user_id as string;
    const cg = row.classroom_groups as Record<string, string>;
    if (!result[userId]) result[userId] = [];
    result[userId].push({
      track: cg.track,
      classroomName: cg.classroom_name,
      groupId: cg.id,
    });
  });

  return result;
}
