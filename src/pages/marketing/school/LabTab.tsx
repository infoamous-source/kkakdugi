import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { SCHOOL_CURRICULUM } from '../../../types/school';
import ToolCard from '../../../components/school/ToolCard';
import { FlaskConical, GraduationCap } from 'lucide-react';

export default function LabTab() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { progress, isLoading: schoolLoading } = useSchoolProgress();

  if (!user) return null; // MarketingSchoolLayout이 이미 auth guard 역할
  if (schoolLoading || !progress) return null;

  // 6개 AI 도구 모두 표시 (1~6교시, ROAS 예측기 포함)
  const allTools = SCHOOL_CURRICULUM;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-500" />
            {t('school.lab.title')}
          </h2>
        </div>
        <p className="text-sm text-gray-500">
          {t('school.lab.subtitle')}
        </p>
      </div>

      {/* 도구 그리드: 6개 AI 도구 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTools.map((period) => {
          const stamp = progress.stamps.find((s) => s.periodId === period.id);
          return (
            <ToolCard
              key={period.id}
              period={period}
              isCompleted={stamp?.completed ?? false}
            />
          );
        })}
      </div>

      {/* 졸업과제 안내 버튼 */}
      <button
        onClick={() => navigate('/marketing/school/graduation-project')}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
      >
        <GraduationCap className="w-4 h-4" />
        {t('school.graduationProject.viewGuide')}
      </button>
    </div>
  );
}
