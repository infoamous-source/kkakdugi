import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Monitor } from 'lucide-react';
import type { PracticeAssignment } from '../../types/digital';

interface Props {
  practices: PracticeAssignment[];
  completedPractices: string[];
  onCompletePractice: (practiceId: string) => void;
  moduleId?: string;
}

export default function PracticeSection({
  practices,
  completedPractices,
  onCompletePractice,
  moduleId,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (practices.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>📝</span>
        {t('digital.common.practiceTitle', '실습 과제')}
      </h2>

      <div className="space-y-4">
        {practices.map((practice) => {
          const isCompleted = completedPractices.includes(practice.id);

          return (
            <div
              key={practice.id}
              className={`border-2 rounded-2xl p-5 transition-all duration-300 ${
                isCompleted
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-orange-200 bg-orange-50/30'
              }`}
            >
              <h3 className="font-bold text-gray-900 mb-1">
                {t(practice.titleKey, '실습')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t(practice.descriptionKey, '')}
              </p>

              {/* Checklist */}
              <div className="space-y-2 mb-4">
                {practice.checklist.map((checkKey, j) => (
                  <div key={j} className="flex items-start gap-3 p-2">
                    <Circle size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{t(checkKey, `체크 ${j + 1}`)}</p>
                  </div>
                ))}
              </div>

              {/* Kkakdugi simulator link for db-02 */}
              {moduleId === 'db-02' && practice.id === 'db-02-practice-1' && (
                <button
                  onClick={() => navigate('/track/digital-basics/kkakdugi-practice')}
                  className="w-full mb-3 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 border-b-4 border-purple-700 active:scale-[0.98]"
                >
                  <Monitor size={18} />
                  {t('kkakdugi.startPractice', '키오스크 연습 시작하기')}
                </button>
              )}

              {/* Complete button */}
              <button
                onClick={() => onCompletePractice(practice.id)}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg active:scale-[0.98] border-b-4 border-orange-700'
                }`}
              >
                {isCompleted
                  ? `✅ ${t('digital.common.completed', '완료됨')}`
                  : t('digital.common.practiceComplete', '실습 완료')}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
