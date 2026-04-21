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
  Megaphone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit3,
  X,
  Save,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { ProfileRow, ClassSessionRow } from '../../types/database';
import {
  getClassSessions,
  createClassSession,
  updateClassSession,
  deleteClassSession,
} from '../../services/classSessionService';
import {
  getActiveAlerts,
  resolveAlert,
  type SystemAlert,
} from '../../services/systemAlertService';
import OrganizationManagement from './OrganizationManagement';
import TeamManagement from './TeamManagement';
import PostClassActivityPanel from './PostClassActivityPanel';
import ClassReport from '../reports/ClassReport';
import DevReport from '../reports/DevReport';

type CeoTab = 'classes' | 'organizations' | 'instructors' | 'announcements' | 'post-class' | 'analytics' | 'settings';

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
  const [activeTab, setActiveTab] = useState<CeoTab>('organizations');
  const [instructors, setInstructors] = useState<InstructorInfo[]>([]);
  const [allStudents, setAllStudents] = useState<ProfileRow[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSessionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClassReport, setSelectedClassReport] = useState<ClassSessionRow | null>(null);
  const [showDevReport, setShowDevReport] = useState(false);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [instructorProfiles, studentResult, sessions] = await Promise.all([
          supabase.from('profiles').select('*').eq('role', 'instructor').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
          getClassSessions(),
        ]);

        if (studentResult.error) {
          console.error('[CeoDashboard] Student fetch error (RLS?):', studentResult.error.message);
        }
        const students = (studentResult.data || []) as ProfileRow[];
        setAllStudents(students);
        setClassSessions(sessions);

        const enriched: InstructorInfo[] = (instructorProfiles.data || []).map((p: ProfileRow) => ({
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

      {/* Alert Panel */}
      <AlertPanel userId={user?.id || ''} />

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
          // 수업 관리는 교실 관리에 통합됨 (2026-04-22). 교실에서 시작·종료·계약일수·보장만료일까지 한 번에 관리.
          { id: 'organizations' as CeoTab, icon: Building2, label: '기관·학생' },
          { id: 'instructors' as CeoTab, icon: GraduationCap, label: '강사 관리' },
          { id: 'announcements' as CeoTab, icon: Megaphone, label: '공지 관리' },
          { id: 'post-class' as CeoTab, icon: Users, label: '수업 후 활동' },
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

      {/* Classes Tab — 수업 관리는 교실(TeamManagement)에 통합됨. ClassSessionManager 함수는 보존(나중에 일정표 분리할 때 재사용 가능) */}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && <OrganizationManagement />}

      {/* Instructors Tab */}
      {activeTab === 'instructors' && (
        <InstructorManager
          instructors={instructors}
          isLoading={isLoading}
          onRefresh={() => window.location.reload()}
        />
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && <AnnouncementManager />}

      {/* Post-class Activity Tab */}
      {activeTab === 'post-class' && <PostClassActivityPanel />}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsPanel
          classSessions={classSessions}
          totalStudents={totalStudents}
          totalInstructors={totalInstructors}
          allStudents={allStudents}
          instructors={instructors}
        />
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
          session={{
            id: selectedClassReport.id,
            orgName: selectedClassReport.org_name,
            orgCode: selectedClassReport.org_code,
            title: selectedClassReport.title,
            startDate: selectedClassReport.start_date,
            endDate: selectedClassReport.end_date,
            instructorName: selectedClassReport.instructor_name,
            studentCount: 0,
            teamCount: 0,
            status: selectedClassReport.status,
            completionRate: 0,
          }}
          onClose={() => setSelectedClassReport(null)}
        />
      )}
      {showDevReport && (
        <DevReport onClose={() => setShowDevReport(false)} />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════
// 긴급 알림 패널
// ═══════════════════════════════════════════════

function AlertPanel({ userId }: { userId: string }) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    getActiveAlerts().then(setAlerts);
    const interval = setInterval(() => {
      getActiveAlerts().then(setAlerts);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string) => {
    await resolveAlert(id, userId);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  const critical = alerts.filter(a => a.severity === 'critical');

  return (
    <div className="mb-6">
      <div className={`rounded-xl border-2 p-4 ${
        critical.length > 0 ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'
      }`}>
        <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
          긴급 알림 ({alerts.length}건)
          {critical.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {critical.length} Critical
            </span>
          )}
        </h3>
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.id} className={`flex items-start justify-between p-3 rounded-lg ${
              a.severity === 'critical' ? 'bg-red-100' : a.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono bg-white/60 px-1.5 py-0.5 rounded">{a.type}</span>
                  <span className="font-medium text-sm">{a.title}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(a.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{a.description}</p>
              </div>
              <button
                onClick={() => handleResolve(a.id)}
                className="text-xs px-3 py-1.5 bg-white rounded-lg hover:bg-gray-50 shrink-0 ml-3 font-medium"
              >
                해결 완료
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════
// 수업 관리 (CRUD)
// ═══════════════════════════════════════════════

function ClassSessionManager({
  sessions,
  onUpdate,
  userId,
  instructors,
  onSelectReport,
  onShowDevReport,
}: {
  sessions: ClassSessionRow[];
  onUpdate: () => Promise<void>;
  userId: string;
  instructors: InstructorInfo[];
  onSelectReport: (s: ClassSessionRow) => void;
  onShowDevReport: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    org_name: '',
    org_code: '',
    title: '',
    start_date: '',
    end_date: '',
    instructor_name: '',
    status: 'upcoming' as ClassSessionRow['status'],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm({ org_name: '', org_code: '', title: '', start_date: '', end_date: '', instructor_name: '', status: 'upcoming', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (s: ClassSessionRow) => {
    setForm({
      org_name: s.org_name,
      org_code: s.org_code,
      title: s.title,
      start_date: s.start_date,
      end_date: s.end_date,
      instructor_name: s.instructor_name,
      status: s.status,
      notes: s.notes || '',
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.org_name.trim()) return;
    setSubmitting(true);

    if (editingId) {
      await updateClassSession(editingId, {
        org_name: form.org_name.trim(),
        org_code: form.org_code.trim(),
        title: form.title.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        instructor_name: form.instructor_name.trim(),
        status: form.status,
        notes: form.notes.trim() || null,
      });
    } else {
      await createClassSession({
        org_name: form.org_name.trim(),
        org_code: form.org_code.trim(),
        title: form.title.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        instructor_name: form.instructor_name.trim(),
        instructor_id: null,
        status: form.status,
        notes: form.notes.trim() || null,
        created_by: userId,
      });
    }

    setSubmitting(false);
    resetForm();
    await onUpdate();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" 수업을 삭제할까요?`)) return;
    await deleteClassSession(id);
    await onUpdate();
  };

  const statusLabel = (s: string) =>
    s === 'completed' ? '완료' : s === 'in-progress' ? '진행 중' : '예정';
  const statusColor = (s: string) =>
    s === 'completed' ? 'bg-green-100 text-green-700' : s === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          수업 관리
        </h3>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 수업 등록
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-blue-800 text-sm">
              {editingId ? '수업 수정' : '새 수업 등록'}
            </h4>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="수업명 (예: 마케터 양성과정)"
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={form.org_name}
              onChange={e => setForm(f => ({ ...f, org_name: e.target.value }))}
              placeholder="기관명 (예: 서울글로벌센터)"
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={form.org_code}
              onChange={e => setForm(f => ({ ...f, org_code: e.target.value }))}
              placeholder="기관코드 (예: HUC454)"
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={form.instructor_name}
              onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))}
              placeholder="강사명"
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as ClassSessionRow['status'] }))}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">예정</option>
              <option value="in-progress">진행 중</option>
              <option value="completed">완료</option>
            </select>
          </div>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="메모 (선택사항)"
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.title.trim() || !form.org_name.trim()}
              className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? '저장 중...' : editingId ? '수정 완료' : '등록'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 수업 목록 */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          등록된 수업이 없습니다
        </div>
      ) : (
        sessions.map(session => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-600">{session.org_name}</span>
                  {session.org_code && (
                    <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{session.org_code}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(session.status)}`}>
                    {statusLabel(session.status)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{session.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {session.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {session.start_date} ~ {session.end_date}
                    </span>
                  )}
                  {session.instructor_name && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {session.instructor_name}
                    </span>
                  )}
                </div>
                {session.notes && (
                  <p className="text-xs text-gray-400 mt-2">{session.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectReport(session)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  보고서
                </button>
                <button
                  onClick={() => onShowDevReport()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  개발
                </button>
                <button
                  onClick={() => startEdit(session)}
                  className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="수정"
                >
                  <Edit3 className="w-4 h-4 text-gray-400 hover:text-yellow-600" />
                </button>
                <button
                  onClick={() => handleDelete(session.id, session.title)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* 팀·프로젝트 관리 */}
      <div className="mt-8">
        <TeamManagement />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════
// 강사 관리 (CRUD)
// ═══════════════════════════════════════════════

function InstructorManager({
  instructors,
  isLoading,
  onRefresh,
}: {
  instructors: InstructorInfo[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (inst: InstructorInfo) => {
    setEditingId(inst.id);
    setEditName(inst.name);
    setEditCode(inst.instructorCode);
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    const updates: Record<string, string> = { name: editName.trim() };
    if (editCode.trim()) updates.instructor_code = editCode.trim();
    await supabase.from('profiles').update(updates).eq('id', id);
    setSaving(false);
    setEditingId(null);
    onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" 강사를 삭제(비활성화)할까요? 해당 강사의 학생 배정은 유지됩니다.`)) return;
    // 강사 role을 제거하는 방식 (완전 삭제 대신 비활성화)
    await supabase.from('profiles').update({ role: 'student' as ProfileRow['role'] }).eq('id', id);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          강사 목록
        </h3>
        <button
          onClick={onRefresh}
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {instructors.map(inst => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    {editingId === inst.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="px-2 py-1 border border-blue-300 rounded text-sm w-full max-w-[150px]"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{inst.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{inst.email}</td>
                  <td className="px-5 py-4">
                    {editingId === inst.id ? (
                      <input
                        type="text"
                        value={editCode}
                        onChange={e => setEditCode(e.target.value)}
                        className="px-2 py-1 border border-blue-300 rounded font-mono text-sm w-full max-w-[120px]"
                      />
                    ) : (
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{inst.instructorCode}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{inst.studentCount}명</td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(inst.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {editingId === inst.id ? (
                        <>
                          <button
                            onClick={() => handleSave(inst.id)}
                            disabled={saving}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="저장"
                          >
                            <Save className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="취소"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(inst)}
                            className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit3 className="w-4 h-4 text-gray-400 hover:text-yellow-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(inst.id, inst.name)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="비활성화"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
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
  );
}


// ═══════════════════════════════════════════════
// 통계 패널
// ═══════════════════════════════════════════════

function AnalyticsPanel({
  classSessions,
  totalStudents,
  totalInstructors,
  allStudents,
  instructors,
}: {
  classSessions: ClassSessionRow[];
  totalStudents: number;
  totalInstructors: number;
  allStudents: ProfileRow[];
  instructors: InstructorInfo[];
}) {
  return (
    <div className="space-y-6">
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
  );
}


// ═══════════════════════════════════════════════
// 공지사항 관리 (CRUD + Edit 추가)
// ═══════════════════════════════════════════════

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
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTargetOrg('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (a: Announcement) => {
    setTitle(a.title);
    setContent(a.content);
    setTargetOrg(a.target_org || '');
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    setSubmitting(true);

    if (editingId) {
      await supabase.from('announcements').update({
        title: title.trim(),
        content: content.trim(),
        target_org: targetOrg || null,
      }).eq('id', editingId);
    } else {
      await supabase.from('announcements').insert({
        title: title.trim(),
        content: content.trim(),
        target_org: targetOrg || null,
        target_role: 'student',
        created_by: user.id,
      });
    }

    resetForm();
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
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 공지 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-purple-800 text-sm">
              {editingId ? '공지 수정' : '새 공지 작성'}
            </h4>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
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
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? '저장 중...' : editingId ? '수정 완료' : '공지 발송'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm">
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
                    onClick={() => startEdit(a)}
                    className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4 text-gray-400 hover:text-yellow-600" />
                  </button>
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
