// ─── 교실/팀 그룹핑 타입 ───

/** 교실 그룹 (= 한 차수의 수업·계약·학생 그룹을 통합) */
export interface ClassroomGroup {
  id: string;
  org_code: string;
  track: string;
  classroom_name: string;
  instructor_id: string;
  /** 교실/수업 시작일 (YYYY-MM-DD) */
  start_date?: string | null;
  /** 교실/수업 종료일 (YYYY-MM-DD). 이 이후 contract_days가 적용됨 */
  end_date?: string | null;
  /** 종료 후 프로도구 추가 사용 일수 */
  contract_days?: number | null;
  /** 보장 만료일(선택). end_date+contract_days와 비교해 더 늦은 날짜를 적용 */
  contract_until?: string | null;
  created_at: string;
}

/** 교실 멤버 */
export interface ClassroomMember {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  status: string; // 'active' | 'inactive'
  created_at: string;
}

/** 팀 그룹 */
export interface TeamGroup {
  id: string;
  classroom_group_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

/** 팀 멤버 */
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  aptitude_type: string | null;
  animal_icon: string | null;
  joined_at: string;
}

/** 팀 아이디어 보석함 */
export interface TeamIdea {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  animal_icon: string | null;
  tool_id: string;
  title: string;
  content: string;
  created_at: string;
}
