import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  GraduationCap,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  FileText,
  Wrench,
  Bell,
  Megaphone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { ProfileRow } from '../../types/database';
import OrganizationManagement from './OrganizationManagement';
import NotificationSender from './NotificationSender';
import ClassReport from '../reports/ClassReport';
import DevReport from '../reports/DevReport';

type CeoTab = 'classes' | 'organizations' | 'instructors' | 'announcements' | 'analytics' | 'settings';

interface ClassSession {
  id: string;
  orgName: string;
  orgCode: string;
  title: string;
  startDate: string;
  endDate: string;
  instructorName: string;
  studentCount: number;
  teamCount: number;
  status: string;
  completionRate: number;
}

const classSessions: ClassSession[] = [
  {
    id: '1',
    orgName: '서울글로벌센터',
    orgCode: 'HUC454',
    title: '직무역량강화교육 - 예비 마케터 양성과정',
    startDate: '2026-04-09',
    endDate: '2026-04-10',
    instructorName: '유수인',
    studentCount: 25,
    teamCount: 5,
    status: 'completed',
    completionRate: 80,
  },
];

interface InstructorInfo {
  id: string;
  name: string;
  email: string;
  instructorCode: string;
  studentCount: number;
  createdAt: string;
}

export default function CeoDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CeoTab>('classes');
  const [instructors, setInstructors] = useState<InstructorInfo[]>([]);
  const [allStudents, setAllStudents] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassReport, setSelectedClassReport] = useState<ClassSession | null>(null);
  const [showDevReport, setShowDevReport] = useState(false);

  // Load all instructors and students
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all instructors
        const { data: instructorProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'instructor')
          .order('created_at', { ascending: false });

        // Fetch all students (CEO는 전체 조회 가능해야 함 — RLS 정책 확인 필요)
        const { data: studentProfiles, error: studentError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

        if (studentError) {
          console.error('[CeoDashboard] Student fetch error (RLS?):', studentError.message);
        }
        const students = (studentProfiles || []) as ProfileRow[];
        setAllStudents(students);

        // Enrich instructor data with student counts
        const enriched: InstructorInfo[] = (instructorProfiles || []).map((p: ProfileRow) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          instructorCode: p.instructor_code || '',
          studentCount: students.filter(s => s.instructor_code === p.instructor_code).length,
          createdAt: p.created_at,
        }));
        setInstructors(enriched);
      } catch (err) {
        console.error('[CeoDashboard] Failed to load data:', err);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const totalInstructors = instructors.length;
  const totalStudents = allStudents.length;
  const orgSet = new Set(allStudents.map(s => s.org_code).filter(Boolean));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">CEO 대시보드</h1>
        <p className="text-gray-500 mt-1">
          {user?.name}님 환영합니다 &bull; 전체 현황을 관리합니다
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalInstructors}</p>
              <p className="text-xs text-gray-500">강사 수</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
              <p className="text-xs text-gray-500">전체 학생</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{orgSet.size}</p>
              <p className="text-xs text-gray-500">기관 수</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {allStudents.filter(s => s.gemini_api_key).length}
              </p>
              <p className="text-xs text-gray-500">AI 연결</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto scrollbar-hide">
        {([
          { id: 'classes' as CeoTab, icon: Calendar, label: '수업 관리' },
          { id: 'organizations' as CeoTab, icon: Building2, label: '기관·학생' },
          { id: 'instructors' as CeoTab, icon: GraduationCap, label: '강사 관리' },
          { id: 'announcements' as CeoTab, icon: Megaphone, label: '공지 관리' },
          { id: 'analytics' as CeoTab, icon: BarChart3, label: '통계' },
          { id: 'settings' as CeoTab, icon: Settings, label: '설정' },
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

      {/* Instructors Tab */}
      {activeTab === 'instructors' && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">강사 목록</h3>
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-3 animate-spin" />
              <p className="text-gray-500 text-sm">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">이름</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">이메일</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">강사코드</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">학생 수</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">가입일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {instructors.map(inst => (
                    <tr key={inst.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-800">{inst.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{inst.email}</td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{inst.instructorCode}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{inst.studentCount}명</td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(inst.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {instructors.length === 0 && (
                <div className="text-center py-12 text-gray-400">등록된 강사가 없습니다</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && <OrganizationManagement />}

      {/* 학생 탭 제거됨 — 기관 안에서 학생 조회 (OrganizationManagement에 통합) */}

      {/* Analytics → 통계 탭 */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* 전체 요약 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{classSessions.length}</p>
              <p className="text-xs text-gray-500 mt-1">총 수업</p>
            </div>
            <div className="bg-white rounded-xl border p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
              <p className="text-xs text-gray-500 mt-1">총 학생</p>
            </div>
            <div className="bg-white rounded-xl border p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{totalInstructors}</p>
              <p className="text-xs text-gray-500 mt-1">총 강사</p>
            </div>
            <div className="bg-white rounded-xl border p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {allStudents.length > 0 ? Math.round(allStudents.filter(s => s.gemini_api_key).length / allStudents.length * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">AI 연결률</p>
            </div>
          </div>

          {/* 강사별 학생 분포 */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">강사별 학생 분포</h3>
            <div className="space-y-3">
              {instructors.map(inst => (
                <div key={inst.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-32 truncate">{inst.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(5, (inst.studentCount / Math.max(totalStudents, 1)) * 100)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{inst.studentCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API 키 풀 현황 */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">API 사용 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600">AI 연결 학생</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {allStudents.filter(s => s.gemini_api_key).length}명
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-600">미연결 학생</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {allStudents.filter(s => !s.gemini_api_key).length}명
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600">사용 모델</p>
                <p className="text-lg font-bold text-purple-600 mt-1">gemini-2.5-flash-lite</p>
              </div>
            </div>
          </div>

          {/* CSV 다운로드 */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-800 mb-4">데이터 내보내기</h3>
            <button
              onClick={() => {
                const headers = ['이름', '이메일', '기관코드', '국가', '한국어수준', '비자', 'AI연결', '가입일'];
                const rows = allStudents.map(s => [
                  s.name, s.email, s.org_code || '', s.country || '',
                  s.korean_level || '', s.visa_type || '',
                  s.gemini_api_key ? 'Y' : 'N',
                  new Date(s.created_at).toLocaleDateString('ko-KR'),
                ]);
                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `전체학생_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl"
            >
              <Download className="w-4 h-4" />
              전체 학생 CSV 다운로드
            </button>
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {classSessions.map(session => (
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
                        : session.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {session.status === 'completed' ? '완료' : session.status === 'in-progress' ? '진행 중' : '예정'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{session.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {session.startDate} ~ {session.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {session.studentCount}명
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {session.instructorName}
                    </span>
                  </div>
                  {/* Completion progress */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden max-w-xs">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${session.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{session.completionRate}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedClassReport(session)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    수업 보고서
                  </button>
                  <button
                    onClick={() => setShowDevReport(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Wrench className="w-4 h-4" />
                    개발 보고서
                  </button>
                </div>
              </div>
            </div>
          ))}
          {classSessions.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              등록된 수업이 없습니다
            </div>
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <AnnouncementManager />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">설정</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-medium text-gray-700">계정 정보</p>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>이름: {user?.name}</p>
                <p>이메일: {user?.email}</p>
                <p>역할: CEO</p>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="font-medium text-yellow-800">추가 설정</p>
              <p className="text-sm text-yellow-600 mt-1">
                추후 업데이트에서 알림 설정, 보고서 자동화 등의 기능이 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Report Modals */}
      {selectedClassReport && (
        <ClassReport
          session={selectedClassReport}
          onClose={() => setSelectedClassReport(null)}
        />
      )}
      {showDevReport && (
        <DevReport onClose={() => setShowDevReport(false)} />
      )}
    </div>
  );
}

// ═══ 공지사항 관리 컴포넌트 ═══

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_org: string | null;
  target_role: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

function AnnouncementManager() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetOrg, setTargetOrg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAnnouncements(); }, []);

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    setSubmitting(true);
    await supabase.from('announcements').insert({
      title: title.trim(),
      content: content.trim(),
      target_org: targetOrg || null,
      target_role: 'student',
      created_by: user.id,
    });
    setTitle('');
    setContent('');
    setTargetOrg('');
    setShowForm(false);
    setSubmitting(false);
    await loadAnnouncements();
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    await supabase.from('announcements').update({ is_active: !currentActive }).eq('id', id);
    await loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 공지를 삭제할까요?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    await loadAnnouncements();
  };

  if (loading) return <div className="text-center py-12 text-gray-400">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-600" />
          공지사항 관리
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="공지 제목"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="공지 내용"
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <input
            type="text"
            value={targetOrg}
            onChange={e => setTargetOrg(e.target.value)}
            placeholder="대상 기관코드 (비우면 전체)"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
            >
              {submitting ? '발송 중...' : '📢 공지 발송'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          등록된 공지가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`bg-white rounded-xl border p-4 ${a.is_active ? 'border-purple-200' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-800">{a.title}</h4>
                    {a.is_active
                      ? <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">활성</span>
                      : <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">비활성</span>
                    }
                    {a.target_org && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{a.target_org}</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{a.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(a.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => handleToggle(a.id, a.is_active)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title={a.is_active ? '비활성화' : '활성화'}
                  >
                    {a.is_active ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
