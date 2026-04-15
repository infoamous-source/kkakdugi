import { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Users,
  Calendar,
  BookOpen,
  Award,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

interface ClassReportProps {
  session: ClassSession;
  onClose: () => void;
}

interface ToolCompletion {
  toolId: string;
  toolName: string;
  completedCount: number;
  totalStudents: number;
}

interface TopStudent {
  userId: string;
  name: string;
  itemCount: number;
}

interface TeamActivity {
  id: string;
  name: string;
  memberCount: number;
  ideaCount: number;
}

// Tool ID to Korean name mapping
const TOOL_NAMES: Record<string, string> = {
  'persona-test': '1교시 적성검사',
  'idea-box': '2교시 아이디어함',
  'market-lab': '3교시 시장조사',
  'brand-naming': '4교시 브랜드 네이밍',
  'brand-story': '5교시 브랜드 스토리',
  'perfect-planner': '6교시 퍼펙트플래너',
  'graduation': '졸업 프로젝트',
};

export default function ClassReport({ session, onClose }: ClassReportProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [toolCompletions, setToolCompletions] = useState<ToolCompletion[]>([]);
  const [toolPopularity, setToolPopularity] = useState<{ toolId: string; count: number }[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReportData();
  }, [session.id]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Get student IDs for this org
      const { data: students } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'student')
        .eq('org_code', session.orgCode);

      const studentIds = (students || []).map(s => s.id);
      const studentMap = new Map((students || []).map(s => [s.id, s.name]));

      if (studentIds.length > 0) {
        // Tool completion from school_progress stamps
        const { data: progressData } = await supabase
          .from('school_progress')
          .select('stamps')
          .in('student_id', studentIds);

        // Aggregate stamp completion
        const stampCounts: Record<string, number> = {};
        (progressData || []).forEach(row => {
          const stamps = (row.stamps as Record<string, boolean>) || {};
          Object.entries(stamps).forEach(([key, value]) => {
            if (value) {
              stampCounts[key] = (stampCounts[key] || 0) + 1;
            }
          });
        });

        const completions: ToolCompletion[] = Object.entries(TOOL_NAMES).map(([toolId, toolName]) => ({
          toolId,
          toolName,
          completedCount: stampCounts[toolId] || 0,
          totalStudents: studentIds.length,
        }));
        setToolCompletions(completions);

        // Idea box popularity by tool_id
        const { data: ideaData } = await supabase
          .from('idea_box_items')
          .select('tool_id, user_id')
          .in('user_id', studentIds);

        const toolCounts: Record<string, number> = {};
        const userCounts: Record<string, number> = {};
        (ideaData || []).forEach(item => {
          const tid = item.tool_id || 'unknown';
          toolCounts[tid] = (toolCounts[tid] || 0) + 1;
          userCounts[item.user_id] = (userCounts[item.user_id] || 0) + 1;
        });

        setToolPopularity(
          Object.entries(toolCounts)
            .map(([toolId, count]) => ({ toolId, count }))
            .sort((a, b) => b.count - a.count),
        );

        // Top 5 students
        const top5 = Object.entries(userCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([userId, itemCount]) => ({
            userId,
            name: studentMap.get(userId) || '(unknown)',
            itemCount,
          }));
        setTopStudents(top5);

        // Team activities
        const { data: teams } = await supabase
          .from('team_groups')
          .select('id, name, members, classroom_group_id');

        if (teams && teams.length > 0) {
          const teamIds = teams.map(t => t.id);
          const { data: ideas } = await supabase
            .from('team_ideas')
            .select('team_group_id')
            .in('team_group_id', teamIds);

          const ideaCounts: Record<string, number> = {};
          (ideas || []).forEach(i => {
            ideaCounts[i.team_group_id] = (ideaCounts[i.team_group_id] || 0) + 1;
          });

          setTeamActivities(
            teams.map(t => ({
              id: t.id,
              name: t.name || '(unnamed)',
              memberCount: Array.isArray(t.members) ? t.members.length : 0,
              ideaCount: ideaCounts[t.id] || 0,
            })),
          );
        }
      }
    } catch (err) {
      console.error('[ClassReport] Failed to load data:', err);
    }
    setIsLoading(false);
  };

  const handlePdfDownload = async () => {
    if (!reportRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`수업보고서_${session.orgName}_${session.startDate}.pdf`);
    } catch (err) {
      console.error('[ClassReport] PDF generation failed:', err);
    }
  };

  const maxPopularity = Math.max(...toolPopularity.map(t => t.count), 1);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">수업 보고서</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePdfDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF 다운로드
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-3 text-gray-500">보고서 데이터를 불러오는 중...</span>
          </div>
        ) : (
          <div ref={reportRef} className="p-6 space-y-8 print:p-4">
            {/* Section 1: Overview */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                수업 개요
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">교육 기관</p>
                  <p className="font-semibold text-gray-800">{session.orgName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">과정명</p>
                  <p className="font-semibold text-gray-800 text-sm">{session.title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">교육 일자</p>
                  <p className="font-semibold text-gray-800">
                    {session.startDate} ~ {session.endDate}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">강사</p>
                  <p className="font-semibold text-gray-800">{session.instructorName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">학생 수</p>
                  <p className="font-semibold text-gray-800">{session.studentCount}명</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">팀 수</p>
                  <p className="font-semibold text-gray-800">{session.teamCount}개</p>
                </div>
              </div>
            </section>

            {/* Section 2: Tool Completion */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                학생 완료율 (도구별)
              </h3>
              <div className="space-y-3">
                {toolCompletions.map(tc => {
                  const pct = tc.totalStudents > 0
                    ? Math.round((tc.completedCount / tc.totalStudents) * 100)
                    : 0;
                  return (
                    <div key={tc.toolId} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-40 truncate">{tc.toolName}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">
                        {tc.completedCount}/{tc.totalStudents} ({pct}%)
                      </span>
                    </div>
                  );
                })}
                {toolCompletions.length === 0 && (
                  <p className="text-gray-400 text-sm">완료 데이터가 없습니다</p>
                )}
              </div>
            </section>

            {/* Section 3: Tool Popularity */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                도구별 인기도 (아이디어함 아이템 수)
              </h3>
              <div className="space-y-2">
                {toolPopularity.map(tp => (
                  <div key={tp.toolId} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-40 truncate">
                      {TOOL_NAMES[tp.toolId] || tp.toolId}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${Math.max((tp.count / maxPopularity) * 100, 5)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{tp.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {toolPopularity.length === 0 && (
                  <p className="text-gray-400 text-sm">아이디어함 데이터가 없습니다</p>
                )}
              </div>
            </section>

            {/* Section 4: Top 5 Students */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                참여 우수 학생 TOP 5
              </h3>
              {topStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">순위</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">이름</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">아이디어 수</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topStudents.map((student, idx) => (
                        <tr key={student.userId} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                              idx === 1 ? 'bg-gray-200 text-gray-700' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{student.itemCount}개</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">참여 데이터가 없습니다</p>
              )}
            </section>

            {/* Section 5: Team Activity */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                조별 활동
              </h3>
              {teamActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamActivities.map(team => (
                    <div key={team.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800">{team.name}</p>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {team.memberCount}명
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        제출 아이디어: <span className="font-medium text-gray-700">{team.ideaCount}개</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">팀 데이터가 없습니다</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
