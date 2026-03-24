import { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  GraduationCap,
  BarChart3,
  Settings,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { ProfileRow } from '../../types/database';
import OrganizationManagement from './OrganizationManagement';
import NotificationSender from './NotificationSender';

type CeoTab = 'instructors' | 'organizations' | 'students' | 'analytics' | 'settings';

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
  const [activeTab, setActiveTab] = useState<CeoTab>('instructors');
  const [instructors, setInstructors] = useState<InstructorInfo[]>([]);
  const [allStudents, setAllStudents] = useState<ProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

        // Fetch all students
        const { data: studentProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false });

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
          { id: 'instructors' as CeoTab, icon: GraduationCap, label: '강사 관리' },
          { id: 'organizations' as CeoTab, icon: Building2, label: '기관 관리' },
          { id: 'students' as CeoTab, icon: Users, label: '학생 전체' },
          { id: 'analytics' as CeoTab, icon: BarChart3, label: '학습 데이터' },
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

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">전체 학생 목록 ({totalStudents}명)</h3>
            <button
              onClick={() => {
                const headers = ['이름', '이메일', '기관', '강사코드', 'AI연결', '가입일'];
                const rows = allStudents.map(s => [
                  s.name,
                  s.email,
                  s.organization || '',
                  s.instructor_code || '',
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
            >
              <Download className="w-4 h-4" />
              CSV 다운로드
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">이름</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">이메일</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">기관</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">강사코드</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">AI</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">가입일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allStudents.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{s.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{s.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-700">{s.organization || '-'}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{s.instructor_code}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.gemini_api_key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.gemini_api_key ? '연결' : '미연결'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(s.created_at).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">학습 데이터 요약</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
                <p className="text-sm text-gray-600 mt-1">전체 학생</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">
                  {allStudents.filter(s => s.gemini_api_key).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">AI 비서 연결</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-3xl font-bold text-purple-600">{totalInstructors}</p>
                <p className="text-sm text-gray-600 mt-1">활동 강사</p>
              </div>
            </div>
          </div>

          {/* Instructor-student ratio */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
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
        </div>
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
    </div>
  );
}
