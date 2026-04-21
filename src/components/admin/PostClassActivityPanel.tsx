import { useEffect, useState } from 'react';
import { Calendar, Users, Activity, ChevronDown, ChevronUp, Copy, Check, RefreshCw, Loader2, Mail } from 'lucide-react';
import {
  getPostClassActivity,
  type PostClassSessionGroup,
} from '../../services/postClassActivityService';

function formatDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function daysSince(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  return `${diff}일 전`;
}

export default function PostClassActivityPanel() {
  const [groups, setGroups] = useState<PostClassSessionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openSessionIds, setOpenSessionIds] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getPostClassActivity();
    setGroups(data);
    // 기본: 학생이 있는 수업만 펼침
    setOpenSessionIds(new Set(data.filter(g => g.students.length > 0).map(g => g.session.id)));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggle = (id: string) => {
    setOpenSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyEmails = async (key: string, emails: string[]) => {
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      alert('클립보드 복사에 실패했어요.');
    }
  };

  const activeGroups = groups.filter(g => g.students.length > 0);
  const emptyGroups = groups.filter(g => g.students.length === 0);
  const grandTotal = activeGroups.reduce((sum, g) => sum + g.totalActivityCount, 0);
  const grandStudents = activeGroups.reduce((sum, g) => sum + g.totalActiveStudents, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 상단 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{groups.length}</p>
              <p className="text-xs text-gray-500">종료된 수업</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{grandStudents}</p>
              <p className="text-xs text-gray-500">종료 후 사용 학생(누적)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{grandTotal}</p>
              <p className="text-xs text-gray-500">총 도구 사용 횟수</p>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 바 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          수업 종료일 이후의 도구 사용 이력입니다. 졸업생 케어·재등록 안내에 활용하세요.
        </p>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 새로고침
        </button>
      </div>

      {/* 활동 있는 수업 */}
      {activeGroups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <p className="text-sm text-gray-500">수업 종료 이후 도구를 사용한 학생이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeGroups.map(group => {
            const isOpen = openSessionIds.has(group.session.id);
            const emails = group.students.map(s => s.studentEmail).filter(Boolean);
            return (
              <div key={group.session.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggle(group.session.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {group.session.org_code || '-'}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {group.session.org_name || '기관 미지정'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {group.session.title || '(제목 없음)'}
                      {' · '}
                      종료: {group.session.end_date || '-'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">{group.totalActiveStudents}<span className="text-xs text-gray-400 ml-0.5">명</span></p>
                      <p className="text-[10px] text-gray-400">사용 {group.totalActivityCount}회</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-xs">
                      <span className="text-gray-500">{group.students.length}명 활동 중</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyEmails(`session-${group.session.id}`, emails); }}
                        disabled={emails.length === 0}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-50"
                      >
                        {copiedKey === `session-${group.session.id}`
                          ? <><Check className="w-3 h-3" /> 복사됨</>
                          : <><Mail className="w-3 h-3" /> 이 수업 학생 이메일 전체 복사</>}
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.students.map(s => (
                        <div key={s.studentId} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">{s.studentName}</p>
                            <p className="text-xs text-gray-400 truncate">{s.studentEmail}</p>
                            {s.toolsUsed.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {s.toolsUsed.slice(0, 6).map(t => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">{t}</span>
                                ))}
                                {s.toolsUsed.length > 6 && (
                                  <span className="text-[10px] text-gray-400">+{s.toolsUsed.length - 6}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-sm font-bold text-gray-800">{s.postClassUsageCount}회</p>
                            <p className="text-[10px] text-gray-400">{daysSince(s.lastActivityAt)}</p>
                            <p className="text-[10px] text-gray-300">{formatDate(s.lastActivityAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 종료됐지만 활동 없는 수업 (접어둠) */}
      {emptyGroups.length > 0 && (
        <details className="bg-white rounded-xl border border-gray-100 p-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            종료 이후 활동이 없는 수업 {emptyGroups.length}개 보기
          </summary>
          <div className="mt-3 divide-y divide-gray-100">
            {emptyGroups.map(group => (
              <div key={group.session.id} className="py-2 text-xs text-gray-500">
                <span className="font-medium text-gray-600">{group.session.org_code || '-'}</span>
                <span className="mx-1.5">·</span>
                <span>{group.session.title || '(제목 없음)'}</span>
                <span className="mx-1.5">·</span>
                <span className="text-gray-400">종료 {group.session.end_date}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
