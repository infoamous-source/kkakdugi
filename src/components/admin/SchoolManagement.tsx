import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Search,
  Clock,
  Users,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useAdminSchoolProgress } from '../../hooks/useSchoolProgress';
import { TOTAL_PERIODS } from '../../types/school';

export default function SchoolManagement() {
  const { t } = useTranslation('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [extensionDays, setExtensionDays] = useState(30);
  const [resetTarget, setResetTarget] = useState<string | null>(null);

  const { allData: rawData, isLoading, clearStudentProgress, extendProAccess, loadAll } = useAdminSchoolProgress();

  const allData = rawData.map((d) => {
    const stamps = d.progress.stamps.filter((s) => s.completed).length;
    return {
      userId: d.userId,
      studentName: d.studentName,
      studentEmail: d.studentEmail,
      studentOrg: d.studentOrg,
      stamps,
      totalPeriods: TOTAL_PERIODS,
      isGraduated: d.progress.graduation.isGraduated,
      graduatedAt: d.progress.graduation.graduatedAt,
      proExpiresAt: d.progress.graduation.proExpiresAt,
      hasAptitude: !!d.progress.aptitudeResult,
      hasSimulation: !!d.progress.simulationResult,
    };
  });

  const filteredData = allData.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.studentName.toLowerCase().includes(q) ||
      d.studentEmail.toLowerCase().includes(q) ||
      d.studentOrg.toLowerCase().includes(q);
  });

  const graduatedStudents = filteredData.filter((d) => d.isGraduated);

  const handleExtendPro = async (userId: string) => {
    await extendProAccess(userId, extensionDays);
    alert(t('school.admin.extended', { days: extensionDays }));
  };

  const handleResetProgress = async () => {
    if (!resetTarget) return;
    await clearStudentProgress(resetTarget);
    setResetTarget(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{allData.length}</p>
              <p className="text-xs text-gray-500">{t('school.admin.totalEnrolled')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{graduatedStudents.length}</p>
              <p className="text-xs text-gray-500">{t('school.admin.totalGraduated')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 학생 목록 */}
      <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{t('school.admin.enrolledStudents')}</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
                  min={1}
                  max={365}
                />
                <span className="text-xs text-gray-500">{t('school.admin.daysLabel')}</span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('school.admin.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {t('school.admin.noStudents')}
              </div>
            ) : (
              filteredData.map((student) => (
                <div key={student.userId} className="px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{student.studentName || '이름 없음'}</p>
                      <p className="text-xs text-gray-500">{student.studentEmail}{student.studentOrg ? ` · ${student.studentOrg}` : ''}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          🏆 {student.stamps}/{student.totalPeriods}
                        </span>
                        {student.isGraduated && (
                          <span className="text-xs text-green-600 font-medium">🎓 {t('school.admin.graduated')}</span>
                        )}
                        {student.hasAptitude && (
                          <span className="text-xs text-blue-600">📋</span>
                        )}
                        {student.proExpiresAt && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{new Date(student.proExpiresAt).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setResetTarget(student.userId)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        초기화
                      </button>
                      {student.isGraduated && (
                        <button
                          onClick={() => handleExtendPro(student.userId)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          {t('school.admin.extend')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      {/* 초기화 확인 모달 */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">진행상황 초기화</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-mono font-medium">{resetTarget}</span>
            </p>
            <p className="text-sm text-gray-500 mb-5">
              이 학생의 1~6교시 스탬프와 졸업 상태를 모두 초기화합니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
