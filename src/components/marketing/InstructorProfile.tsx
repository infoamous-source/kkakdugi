import { useTranslation } from 'react-i18next';
import { Award, Star } from 'lucide-react';
import { instructorProfile } from '../../data/marketing/modules';

export default function InstructorProfile() {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
        {t('marketing.instructor.sectionTitle', '선생님 소개')}
      </h2>

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
          {instructorProfile.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">
            {instructorProfile.name}
          </h3>
          <p className="text-blue-600 font-medium mb-3">
            {t(instructorProfile.titleKey, '마케팅 역량강화 전문 선생님')}
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            {t(instructorProfile.descriptionKey, '이주민과 유학생의 취업 역량을 키우는 마케팅 실무 교육 전문가입니다.')}
          </p>

          {/* Credentials */}
          <div className="space-y-2">
            {instructorProfile.credentials.map((credKey, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                {index === 0 ? (
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>{t(credKey, 'Credential ' + String(index + 1))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
