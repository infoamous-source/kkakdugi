import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  BookOpen,
  Download,
  Search,
  ChevronDown,
  MoreHorizontal,
  ArrowUpDown,
  Building2,
  Mail,
  User,
  RefreshCw,
  Activity,
  ChevronRight,
  Settings2,
  GraduationCap,
  UserPlus,
  UsersRound,
  Cpu,
  Bell,
  RotateCcw,
  Plus,
  X,
  FileText,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getStudentsByInstructorCode, resetStudentApiKey } from '../../services/profileService';
import { getStudentAssignments, getStudentAssignmentsBatch } from '../../services/teamService';
import { getClassroomGroups, addClassroomMember } from '../../services/teamService';
import { SCHOOL_NAMES, type SchoolId } from '../../types/enrollment';
import type { ProfileRow } from '../../types/database';
import type { ClassroomGroup } from '../../types/team';
import type { ActivityLogRow } from '../../services/activityLogService';
import ContentManager from './ContentManager';
import SchoolManagement from './SchoolManagement';
import StudentEnrollmentManager from './StudentEnrollmentManager';
import TeamManagement from './TeamManagement';
import NotificationSender from './NotificationSender';
import StudentAIUsageView from './StudentAIUsageView';
import OrganizationManagement from './OrganizationManagement';
import ClassReport from '../reports/ClassReport';

// 5-tab consolidated dashboard
type DashboardTab = 'organizations' | 'students' | 'teams' | 'learning' | 'notifications' | 'reports';
type StudentSubTab = 'accounts' | 'enrollment';
type LearningSubTab = 'progress' | 'content' | 'analytics';

// 정렬 타입
type SortType = 'name' | 'email' | 'organization' | 'lastActive';
type SortOrder = 'asc' | 'desc';

// 실시간 학생 데이터 타입
type ApiFilter = 'all' | 'connected' | 'disconnected';

interface StudentAssignment {
  track: string;
  classroomName: string;
  groupId: string;
}

interface RealStudent {
  id: string;
  name: string;
  email: string;
  organization: string;
  orgCode: string;
  instructorCode: string;
  assignments: StudentAssignment[];
  country: string | null;
  createdAt: string;
  hasApiKey: boolean;
}

export default function AdminDashboard() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('organizations');
  const [studentSubTab, setStudentSubTab] = useState<StudentSubTab>('accounts');
  const [learningSubTab, setLearningSubTab] = useState<LearningSubTab>('progress');
  const [activityLogs, setActivityLogs] = useState<ActivityLogRow[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [realtimeStudents, setRealtimeStudents] = useState<RealStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiFilter, setApiFilter] = useState<ApiFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<RealStudent | null>(null);

  // 수업 보고서 모달
  const [selectedClassReport, setSelectedClassReport] = useState<{
    id: string; orgName: string; orgCode: string; title: string;
    startDate: string; endDate: string; instructorName: string;
    studentCount: number; teamCount: number; status: string; completionRate: number;
  } | null>(null);

  // 추가배정 모달
  const [assignModal, setAssignModal] = useState<RealStudent | null>(null);
  const [classrooms, setClassrooms] = useState<ClassroomGroup[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // 실제 Supabase 데이터 로드
  useEffect(() => {
    if (!user?.instructorCode) return;

    const loadStudents = async () => {
      setIsLoading(true);
      try {
        const profiles = await getStudentsByInstructorCode(user.instructorCode);
        const assignmentsMap = await getStudentAssignmentsBatch(profiles.map((p: ProfileRow) => p.id));
        const enriched = profiles.map((p: ProfileRow) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          organization: p.organization || '',
          orgCode: p.org_code || '',
          instructorCode: p.instructor_code || '',
          assignments: assignmentsMap[p.id] || [],
          country: p.country,
          createdAt: p.created_at,
          hasApiKey: !!p.gemini_api_key,
        }));
        setRealtimeStudents(enriched);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('[AdminDashboard] Failed to load students:', err);
      }
      setIsLoading(false);
    };

    loadStudents();
  }, [user]);

  // 강사의 교실 목록 로드 (추가배정 모달용)
  useEffect(() => {
    if (!user?.id) return;
    getClassroomGroups(user.id).then(setClassrooms);
  }, [user?.id]);

  // Supabase Realtime 구독 — 새 학생 가입 시 자동 추가
  useEffect(() => {
    if (!isRealTimeEnabled || !user?.instructorCode) return;

    const channel = supabase
      .channel('instructor-students')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `instructor_code=eq.${user.instructorCode}`,
        },
        (payload) => {
          const updated = payload.new as ProfileRow;
          if (updated.role !== 'student') return;
          setRealtimeStudents(prev =>
            prev.map(s =>
              s.id === updated.id
                ? { ...s, name: updated.name, email: updated.email, organization: updated.organization || '', hasApiKey: !!updated.gemini_api_key }
                : s,
            ),
          );
          setLastUpdate(new Date());
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: `instructor_code=eq.${user.instructorCode}`,
        },
        async (payload) => {
          const newProfile = payload.new as ProfileRow;
          if (newProfile.role !== 'student') return;
          const assignments = await getStudentAssignments(newProfile.id);
          const newStudent: RealStudent = {
            id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            organization: newProfile.organization || '',
            orgCode: newProfile.org_code || '',
            instructorCode: newProfile.instructor_code || '',
            assignments,
            country: newProfile.country,
            createdAt: newProfile.created_at,
            hasApiKey: !!newProfile.gemini_api_key,
          };
          setRealtimeStudents(prev => [newStudent, ...prev]);
          setLastUpdate(new Date());
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRealTimeEnabled, user]);

  // Load activity logs for analytics
  useEffect(() => {
    if (activeTab !== 'learning' || learningSubTab !== 'analytics') return;
    if (!realtimeStudents.length) return;

    const loadLogs = async () => {
      setIsLoadingLogs(true);
      try {
        const studentIds = realtimeStudents.map(s => s.id);
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .in('user_id', studentIds.slice(0, 50)) // limit to 50 students for performance
          .order('created_at', { ascending: false })
          .limit(500);
        if (!error && data) {
          setActivityLogs(data as ActivityLogRow[]);
        }
      } catch (err) {
        console.error('[AdminDashboard] Failed to load activity logs:', err);
      }
      setIsLoadingLogs(false);
    };
    loadLogs();
  }, [activeTab, learningSubTab, realtimeStudents]);

  // 한글 정렬
  const koreanSort = useCallback((a: string, b: string): number => {
    return a.localeCompare(b, 'ko');
  }, []);

  // 필터링
  const filteredStudents = realtimeStudents.filter((student) => {
    // API 필터
    if (apiFilter === 'connected' && !student.hasApiKey) return false;
    if (apiFilter === 'disconnected' && student.hasApiKey) return false;
    // 검색어 필터
    const query = searchQuery.toLowerCase();
    return (
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.organization.toLowerCase().includes(query) ||
      student.orgCode.toLowerCase().includes(query)
    );
  });

  // 정렬
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    switch (sortType) {
      case 'name':
        comparison = koreanSort(a.name, b.name);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'organization':
        comparison = koreanSort(a.organization, b.organization);
        break;
      case 'lastActive':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 기관별 그룹핑
  const organizationGroups = realtimeStudents.reduce(
    (acc, student) => {
      const key = student.orgCode || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          name: student.organization || '미지정',
          orgCode: key,
          students: [],
          assignedCount: 0,
          apiCount: 0,
        };
      }
      acc[key].students.push(student);
      if (student.assignments.length > 0) acc[key].assignedCount++;
      if (student.hasApiKey) acc[key].apiCount++;
      return acc;
    },
    {} as Record<string, { name: string; orgCode: string; students: RealStudent[]; assignedCount: number; apiCount: number }>,
  );

  // CSV Export - student data
  const handleExportCSV = () => {
    const headers = ['이름', '이메일', '기관', '기관코드', 'AI연결', '배정학과', '가입일'];
    const rows = sortedStudents.map(s => [
      s.name,
      s.email,
      s.organization,
      s.orgCode,
      s.hasApiKey ? 'Y' : 'N',
      s.assignments.map(a => `${getTrackName(a.track)}/${a.classroomName}`).join('; ') || '미배정',
      new Date(s.createdAt).toLocaleDateString('ko-KR'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `학생현황_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF Report - student summary
  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text('Student Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString('ko-KR')}`, 14, 30);
      doc.text(`Instructor: ${user?.name || ''} (${user?.instructorCode || ''})`, 14, 36);

      // Summary stats
      doc.setFontSize(12);
      doc.text('Summary', 14, 48);
      doc.setFontSize(10);
      doc.text(`Total Students: ${totalStudents}`, 14, 56);
      doc.text(`Assigned: ${assignedStudents}`, 14, 62);
      doc.text(`Unassigned: ${unassignedCount}`, 14, 68);
      doc.text(`AI Connected: ${apiConnectedCount}`, 14, 74);
      doc.text(`Organizations: ${orgCount}`, 14, 80);

      // Student table
      doc.setFontSize(12);
      doc.text('Student List', 14, 94);
      doc.setFontSize(8);

      let y = 102;
      doc.text('Name', 14, y);
      doc.text('Email', 50, y);
      doc.text('Organization', 110, y);
      doc.text('AI', 160, y);
      doc.text('Date', 175, y);
      y += 6;
      doc.line(14, y - 2, 196, y - 2);

      sortedStudents.forEach(s => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(s.name.slice(0, 15), 14, y);
        doc.text(s.email.slice(0, 30), 50, y);
        doc.text((s.organization || '-').slice(0, 20), 110, y);
        doc.text(s.hasApiKey ? 'Y' : 'N', 160, y);
        doc.text(new Date(s.createdAt).toLocaleDateString('ko-KR'), 175, y);
        y += 6;
      });

      doc.save(`학생리포트_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF 생성에 실패했습니다.');
    }
  };

  // Activity logs CSV export
  const handleExportActivityLogs = () => {
    if (activityLogs.length === 0) {
      alert('다운로드할 활동 로그가 없습니다.');
      return;
    }
    const headers = ['학생ID', '트랙', '모듈', '액션', '날짜'];
    const rows = activityLogs.map(log => [
      log.user_id,
      log.track_id || '',
      log.module_id || '',
      log.action,
      new Date(log.created_at).toLocaleString('ko-KR'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `활동로그_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSortToggle = (type: SortType) => {
    if (sortType === type) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortType(type);
      setSortOrder('asc');
    }
  };

  const handleRefresh = async () => {
    if (!user?.instructorCode) return;
    setIsLoading(true);
    const profiles = await getStudentsByInstructorCode(user.instructorCode);
    const assignmentsMap = await getStudentAssignmentsBatch(profiles.map((p: ProfileRow) => p.id));
    const enriched = profiles.map((p: ProfileRow) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      organization: p.organization || '',
      orgCode: p.org_code || '',
      instructorCode: p.instructor_code || '',
      assignments: assignmentsMap[p.id] || [],
      country: p.country,
      createdAt: p.created_at,
      hasApiKey: !!p.gemini_api_key,
    }));
    setRealtimeStudents(enriched);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  // API 키 초기화
  const handleResetApiKey = async (student: RealStudent) => {
    if (!confirm(`${student.name}님의 AI 비서 API 키를 초기화하시겠습니까?\n학생이 다시 설정해야 합니다.`)) return;
    const ok = await resetStudentApiKey(student.id);
    if (ok) {
      setRealtimeStudents(prev =>
        prev.map(s => (s.id === student.id ? { ...s, hasApiKey: false } : s)),
      );
    }
  };

  // 추가배정 처리
  const handleAssign = async () => {
    if (!assignModal || !selectedClassroomId) return;
    setIsAssigning(true);
    const result = await addClassroomMember(selectedClassroomId, assignModal.id, assignModal.name);
    if (result) {
      // 해당 학생의 assignments 새로고침
      const newAssignments = await getStudentAssignments(assignModal.id);
      setRealtimeStudents(prev =>
        prev.map(s => (s.id === assignModal.id ? { ...s, assignments: newAssignments } : s)),
      );
      setAssignModal(null);
      setSelectedTrack('');
      setSelectedClassroomId('');
    }
    setIsAssigning(false);
  };

  // 학과명 가져오기
  const getTrackName = (track: string) => {
    return SCHOOL_NAMES[track as SchoolId]?.ko || track;
  };

  // 통계
  const totalStudents = realtimeStudents.length;
  const assignedStudents = realtimeStudents.filter(s => s.assignments.length > 0).length;
  const unassignedCount = totalStudents - assignedStudents;
  const orgCount = Object.keys(organizationGroups).length;
  const apiConnectedCount = realtimeStudents.filter(s => s.hasApiKey).length;
  const apiDisconnectedCount = totalStudents - apiConnectedCount;

  // 추가배정 모달에서 선택된 학과의 교실 목록
  const filteredClassrooms = classrooms.filter(c => c.track === selectedTrack);

  return (
    <div className="max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('admin.title')}</h1>
        <p className="text-gray-500 mt-1">
          {t('admin.welcome', { name: user?.name })} • {t('admin.instructorCode')}:{' '}
          <span className="font-mono font-semibold">{user?.instructorCode}</span>
        </p>
      </div>

      {/* 탭 네비게이션 (5 tabs) */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto scrollbar-hide">
        {([
          { id: 'organizations' as DashboardTab, icon: Building2, label: '기관 관리' },
          { id: 'students' as DashboardTab, icon: Users, label: '학생 관리' },
          { id: 'teams' as DashboardTab, icon: UsersRound, label: '팀·프로젝트' },
          { id: 'learning' as DashboardTab, icon: GraduationCap, label: '학습 현황' },
          { id: 'notifications' as DashboardTab, icon: Bell, label: '공지' },
          { id: 'reports' as DashboardTab, icon: FileText, label: '수업 보고서' },
        ]).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 기관 관리 탭 */}
      {activeTab === 'organizations' && <OrganizationManagement />}

      {/* 팀·프로젝트 탭 */}
      {activeTab === 'teams' && <TeamManagement />}

      {/* 공지 탭 */}
      {activeTab === 'notifications' && <NotificationSender students={realtimeStudents} />}

      {/* 학습 현황 탭 (merged: 학습진행 + 콘텐츠관리 + 학습 데이터 분석) */}
      {activeTab === 'learning' && (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-2 mb-6">
            {([
              { id: 'progress' as LearningSubTab, label: '학습 진행' },
              { id: 'content' as LearningSubTab, label: '콘텐츠 관리' },
              { id: 'analytics' as LearningSubTab, label: '학습 데이터' },
            ]).map(sub => (
              <button
                key={sub.id}
                onClick={() => setLearningSubTab(sub.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  learningSubTab === sub.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {learningSubTab === 'progress' && <SchoolManagement />}
          {learningSubTab === 'content' && <ContentManager />}
          {learningSubTab === 'analytics' && (
            <div className="space-y-6">
              {/* Activity logs analytics */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    학습 활동 분석
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportActivityLogs}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      활동로그 CSV
                    </button>
                  </div>
                </div>

                {isLoadingLogs ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 text-gray-300 mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-400">활동 로그를 불러오는 중...</p>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">아직 기록된 학습 활동이 없습니다</p>
                  </div>
                ) : (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{activityLogs.length}</p>
                        <p className="text-xs text-gray-500">전체 활동</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">
                          {new Set(activityLogs.map(l => l.user_id)).size}
                        </p>
                        <p className="text-xs text-gray-500">활동 학생</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <p className="text-2xl font-bold text-purple-600">
                          {new Set(activityLogs.map(l => l.action)).size}
                        </p>
                        <p className="text-xs text-gray-500">활동 유형</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-xl">
                        <p className="text-2xl font-bold text-amber-600">
                          {new Set(activityLogs.filter(l => l.track_id).map(l => l.track_id)).size}
                        </p>
                        <p className="text-xs text-gray-500">활성 트랙</p>
                      </div>
                    </div>

                    {/* Action type distribution */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">활동 유형 분포</h4>
                      <div className="space-y-2">
                        {Object.entries(
                          activityLogs.reduce((acc, log) => {
                            acc[log.action] = (acc[log.action] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 10)
                          .map(([action, count]) => (
                            <div key={action} className="flex items-center gap-3">
                              <span className="text-xs text-gray-600 w-36 truncate">{action}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full"
                                  style={{ width: `${(count / activityLogs.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-12 text-right">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Recent activity logs table */}
                    <h4 className="text-sm font-medium text-gray-700 mb-3">최근 활동 로그</h4>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">학생</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">액션</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">트랙</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">시간</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {activityLogs.slice(0, 50).map(log => {
                            const student = realtimeStudents.find(s => s.id === log.user_id);
                            return (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-gray-700">{student?.name || log.user_id.slice(0, 8)}</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">{log.action}</span>
                                </td>
                                <td className="px-3 py-2 text-gray-500">{log.track_id ? getTrackName(log.track_id) : '-'}</td>
                                <td className="px-3 py-2 text-gray-400 text-xs">
                                  {new Date(log.created_at).toLocaleString('ko-KR')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 학생 관리 탭 (merged: 학생계정 + 등록관리) */}
      {activeTab === 'students' && (
        <>
          {/* Sub-tabs */}
          <div className="flex gap-2 mb-6">
            {([
              { id: 'accounts' as StudentSubTab, label: '학생 계정' },
              { id: 'enrollment' as StudentSubTab, label: '등록 관리' },
            ]).map(sub => (
              <button
                key={sub.id}
                onClick={() => setStudentSubTab(sub.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  studentSubTab === sub.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {studentSubTab === 'enrollment' && <StudentEnrollmentManager />}
          {studentSubTab === 'accounts' && (
            <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
                  <p className="text-xs text-gray-500">{t('admin.totalStudents')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{assignedStudents}</p>
                  <p className="text-xs text-gray-500">학과 배정</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{orgCount}</p>
                  <p className="text-xs text-gray-500">소속 기관</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {apiConnectedCount}<span className="text-sm font-normal text-gray-400">/{totalStudents}</span>
                  </p>
                  <p className="text-xs text-gray-500">AI 연결</p>
                </div>
              </div>
            </div>
          </div>

          {/* 통합 경고 배너: AI 미연결 + 학과 미배정 */}
          {totalStudents > 0 && (apiDisconnectedCount > 0 || unassignedCount > 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {apiDisconnectedCount > 0 && `AI 미연결 ${apiDisconnectedCount}명`}
                    {apiDisconnectedCount > 0 && unassignedCount > 0 && ' · '}
                    {unassignedCount > 0 && `학과 미배정 ${unassignedCount}명`}
                  </p>
                  <p className="text-xs text-amber-600">
                    {apiDisconnectedCount > 0 && 'AI 비서 연결 안내가 필요합니다. '}
                    {unassignedCount > 0 && '팀 관리 탭에서 학과·교실을 배정해주세요.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 기관별 현황 */}
          {orgCount > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-purple-600" />
                {t('admin.organizationOverview')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(organizationGroups).map(org => (
                  <div
                    key={org.orgCode}
                    className="p-4 border border-gray-200 rounded-xl text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{org.name}</span>
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {org.orgCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {org.students.length}명 (배정 {org.assignedCount}명, AI {org.apiCount}명)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 학생 목록 테이블 */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              {/* 상단: 제목 & 실시간 모니터링 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{t('admin.studentList')}</h3>
                <div className="flex items-center gap-3">
                  {/* 실시간 모니터링 토글 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isRealTimeEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Activity
                        className={`w-4 h-4 ${isRealTimeEnabled ? 'text-green-500 animate-pulse' : 'text-gray-400'}`}
                      />
                      {t('admin.realTimeMonitoring')}
                    </span>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="새로고침"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <span className="text-xs text-gray-400">
                    {t('admin.lastUpdate')}: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* 검색 & 필터 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('admin.searchHint')}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full sm:w-72 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">{t('admin.searchHint')}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                  {/* API 필터 */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {([
                      { value: 'all' as ApiFilter, label: '전체' },
                      { value: 'connected' as ApiFilter, label: 'AI 연결' },
                      { value: 'disconnected' as ApiFilter, label: '미연결' },
                    ]).map(f => (
                      <button
                        key={f.value}
                        onClick={() => setApiFilter(f.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          apiFilter === f.value
                            ? 'bg-white text-amber-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* 정렬 버튼 */}
                  <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
                    {(
                      [
                        { type: 'name' as SortType, icon: User, label: t('admin.sortBy.name') },
                        { type: 'email' as SortType, icon: Mail, label: t('admin.sortBy.email') },
                        { type: 'organization' as SortType, icon: Building2, label: t('admin.sortBy.organization') },
                      ] as const
                    ).map(({ type, icon: SortIcon, label }) => (
                      <button
                        key={type}
                        onClick={() => handleSortToggle(type)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          sortType === type
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title={label}
                      >
                        <SortIcon className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">{label.split(' ')[0]}</span>
                        {sortType === type && (
                          <ArrowUpDown
                            className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* CSV 다운로드 */}
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  {/* PDF 리포트 */}
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 로딩 */}
            {isLoading && realtimeStudents.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-3 animate-spin" />
                <p className="text-gray-500 text-sm">학생 데이터를 불러오는 중...</p>
              </div>
            )}

            {/* 학생 목록 */}
            {!isLoading || realtimeStudents.length > 0 ? (
              <>
                {/* 모바일 카드 뷰 */}
                <div className="md:hidden divide-y divide-gray-100">
                  {sortedStudents.map(student => (
                    <div key={student.id} className="p-4 space-y-3">
                      {/* 이름 + AI 상태 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{student.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-400">{student.email}</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            student.hasApiKey
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {student.hasApiKey ? 'AI 연결' : 'AI 미연결'}
                        </span>
                      </div>
                      {/* 기관 + 배정 */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {student.organization && (
                          <span className="text-gray-500">
                            {student.organization}
                            {student.orgCode && <span className="font-mono text-gray-400 ml-1">{student.orgCode}</span>}
                          </span>
                        )}
                        {student.assignments.length > 0 ? (
                          student.assignments.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                              {getTrackName(a.track)}·{a.classroomName}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">미배정</span>
                        )}
                      </div>
                      {/* 가입일 + 액션 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(student.createdAt).toLocaleDateString('ko-KR')} 가입
                        </span>
                        <div className="flex items-center gap-2">
                          {student.hasApiKey && (
                            <button
                              onClick={() => handleResetApiKey(student)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="API 키 초기화"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setAssignModal(student)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                          >
                            추가배정
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            AI 기록
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 데스크톱 테이블 뷰 */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSortToggle('name')}
                        >
                          <div className="flex items-center gap-1">
                            {t('admin.table.name')}
                            {sortType === 'name' && <ArrowUpDown className="w-3 h-3" />}
                          </div>
                        </th>
                        <th
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSortToggle('organization')}
                        >
                          <div className="flex items-center gap-1">
                            {t('admin.table.organization')}
                            {sortType === 'organization' && <ArrowUpDown className="w-3 h-3" />}
                          </div>
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          배정 상태
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          AI 연결
                        </th>
                        <th
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSortToggle('lastActive')}
                        >
                          <div className="flex items-center gap-1">
                            가입일
                            {sortType === 'lastActive' && <ArrowUpDown className="w-3 h-3" />}
                          </div>
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t('admin.table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sortedStudents.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{student.name[0]}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-400">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 font-medium">{student.organization || '-'}</p>
                            {student.orgCode && (
                              <p className="text-xs text-gray-400 font-mono">{student.orgCode}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {student.assignments.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {student.assignments.map((a, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                  >
                                    {getTrackName(a.track)}·{a.classroomName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                미배정
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                  student.hasApiKey
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {student.hasApiKey ? '연결됨' : '미연결'}
                              </span>
                              {student.hasApiKey && (
                                <button
                                  onClick={() => handleResetApiKey(student)}
                                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                  title="API 키 초기화"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-500">
                              {new Date(student.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setAssignModal(student)}
                                className="text-xs text-purple-600 hover:text-purple-800 font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                              >
                                추가배정
                              </button>
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              >
                                AI 기록
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 결과 없음 */}
                {sortedStudents.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t('admin.noResults')}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      선생님 코드 <span className="font-mono font-semibold">{user?.instructorCode}</span>로 등록한
                      학생이 없습니다.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
            </>
          )}
        </>
      )}

      {/* AI 사용 기록 모달 */}
      {selectedStudent && (
        <StudentAIUsageView
          studentId={selectedStudent.id}
          studentName={selectedStudent.name}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Hardcoded class sessions for this instructor */}
          {[
            {
              id: '1',
              orgName: '서울글로벌센터',
              orgCode: 'HUC454',
              title: '직무역량강화교육 - 예비 마케터 양성과정',
              startDate: '2026-04-09',
              endDate: '2026-04-10',
              instructorName: user?.name || '',
              studentCount: realtimeStudents.length || 25,
              teamCount: 5,
              status: 'completed',
              completionRate: 80,
            },
          ].map(session => (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-blue-600">{session.orgName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.status === 'completed' ? '완료' : '진행 중'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{session.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{session.startDate} ~ {session.endDate}</span>
                    <span>{session.studentCount}명</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClassReport(session)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  수업 보고서
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Report Modal */}
      {selectedClassReport && (
        <ClassReport
          session={selectedClassReport}
          onClose={() => setSelectedClassReport(null)}
        />
      )}

      {/* 추가배정 모달 */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">학과·교실 추가 배정</h3>
                <p className="text-xs text-gray-400 mt-0.5">{assignModal.name}님</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 현재 배정 */}
              {assignModal.assignments.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">현재 배정</p>
                  <div className="flex flex-wrap gap-1.5">
                    {assignModal.assignments.map((a, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {getTrackName(a.track)} · {a.classroomName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 학과 선택 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">학과 선택</label>
                <select
                  value={selectedTrack}
                  onChange={e => { setSelectedTrack(e.target.value); setSelectedClassroomId(''); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">학과를 선택하세요</option>
                  {Object.entries(SCHOOL_NAMES).map(([id, info]) => (
                    <option key={id} value={id}>{info.ko}</option>
                  ))}
                </select>
              </div>

              {/* 교실 선택 */}
              {selectedTrack && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">교실 선택</label>
                  {filteredClassrooms.length === 0 ? (
                    <p className="text-xs text-gray-400">해당 학과에 생성된 교실이 없습니다. 팀 관리에서 교실을 먼저 만들어주세요.</p>
                  ) : (
                    <select
                      value={selectedClassroomId}
                      onChange={e => setSelectedClassroomId(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">교실을 선택하세요</option>
                      {filteredClassrooms.map(c => (
                        <option key={c.id} value={c.id}>{c.classroom_name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* 배정 버튼 */}
              <button
                onClick={handleAssign}
                disabled={!selectedClassroomId || isAssigning}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isAssigning ? '배정 중...' : '배정하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
