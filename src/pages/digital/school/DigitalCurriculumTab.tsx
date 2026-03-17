import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useDigitalSchoolProgress } from '../../../hooks/useDigitalSchoolProgress';
import { getMyTeam } from '../../../services/teamService';
import type { TeamGroup } from '../../../types/team';
import { DIGITAL_CURRICULUM_SECTIONS } from '../../../types/digitalSchool';
import type { DigitalPeriodId, DigitalCurriculumSection, DigitalSectionType } from '../../../types/digitalSchool';
import {
  Sparkles, Trophy, Loader2,
  Smartphone, ShieldCheck, Monitor, FileText, Languages, ShieldAlert,
  PartyPopper, Award, BookOpen, GraduationCap,
} from 'lucide-react';
import GraduationModal from '../../../components/school/GraduationModal';

// ─── 아이콘 맵 ───

const iconMap: Record<string, typeof Smartphone> = {
  Smartphone, ShieldCheck, Monitor, FileText, Languages, ShieldAlert,
  PartyPopper, Award, BookOpen, GraduationCap,
};

// ─── 섹션 유형별 스타일 ───

const sectionStyles: Record<DigitalSectionType, {
  headerBg: string; badge: string; badgeText: string; border: string;
}> = {
  'pre-school': {
    headerBg: 'bg-gradient-to-r from-pink-50 to-rose-50',
    badge: 'bg-pink-100', badgeText: 'text-pink-700', border: 'border-pink-200',
  },
  period: {
    headerBg: 'bg-white',
    badge: 'bg-gray-100', badgeText: 'text-gray-600', border: 'border-gray-200',
  },
  'final-project': {
    headerBg: 'bg-gradient-to-r from-violet-50 to-purple-50',
    badge: 'bg-violet-100', badgeText: 'text-violet-700', border: 'border-violet-200',
  },
  'after-school': {
    headerBg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    badge: 'bg-amber-100', badgeText: 'text-amber-700', border: 'border-amber-200',
  },
};

// ─── 교시별 색상 맵 ───

const periodColorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    iconBg: 'bg-blue-100' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-100' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  iconBg: 'bg-purple-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    iconBg: 'bg-rose-100' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  iconBg: 'bg-orange-100' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    iconBg: 'bg-pink-100' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  iconBg: 'bg-violet-100' },
};

// ─── 섹션 배지 라벨 ───

function getSectionBadge(section: DigitalCurriculumSection, periodLabel: string): string {
  if (section.type === 'period') return `${section.period}${periodLabel}`;
  if (section.id === 'entrance') return 'Pre-School';
  if (section.id === 'final-project') return 'Final Step';
  if (section.id === 'graduation-ceremony') return 'After-School';
  return '';
}

// ─── 섹션 클릭 핸들러 유틸 ───

function getSectionRoute(section: DigitalCurriculumSection): string | null {
  if (section.id === 'entrance') return '/profile';
  if (section.type === 'period') {
    const practiceStep = section.steps.find(s => s.isPractice && s.toolRoute);
    return practiceStep?.toolRoute ?? null;
  }
  return null;
}

// ─── 메인 컴포넌트 ───

export default function DigitalCurriculumTab() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [myTeam, setMyTeam] = useState<TeamGroup | null>(null);

  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then(info => {
      if (info) setMyTeam(info.team);
    });
  }, [user]);

  const { hasAllStamps: allDone, isGraduated: graduated, canGraduate: canGrad, hasStamp, isLoading: schoolLoading } = useDigitalSchoolProgress();

  if (!user || schoolLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-kk-red/40" />
    </div>
  );

  const handleSectionClick = (section: DigitalCurriculumSection) => {
    if (section.id === 'graduation-ceremony') {
      if (canGrad && !graduated) {
        setShowGraduationModal(true);
      }
      return;
    }
    if ((section.type === 'final-project' || section.type === 'after-school') && !allDone) {
      return;
    }
    const route = getSectionRoute(section);
    if (route) navigate(route);
  };

  return (
    <div className="space-y-3" key={refreshKey}>
      {/* 헤더 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
          📋 {t('digitalSchool.curriculum.title', '시간표')}
        </h2>
        <p className="text-sm text-gray-500">{t('digitalSchool.curriculum.subtitle', '디지털 기초 교실 2일 과정')}</p>
      </div>

      {/* 9개 섹션 */}
      {DIGITAL_CURRICULUM_SECTIONS.map((section) => {
        const styles = section.type === 'period'
          ? { ...sectionStyles.period, ...(periodColorMap[section.color] || {}) }
          : sectionStyles[section.type];
        const colors = periodColorMap[section.color] || periodColorMap.blue;
        const Icon = iconMap[section.icon] || BookOpen;

        const practiceStep = section.steps.find(s => s.isPractice);
        const stamped = practiceStep?.periodId
          ? hasStamp(practiceStep.periodId as DigitalPeriodId)
          : false;

        const isLocked = (section.type === 'final-project' || section.type === 'after-school') && !allDone;
        const isClickable = !isLocked && (getSectionRoute(section) !== null || section.id === 'graduation-ceremony');

        return (
          <div
            key={section.id}
            onClick={() => handleSectionClick(section)}
            className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
              stamped ? 'border-green-200' : styles.border
            } ${isLocked ? 'opacity-60' : ''} ${isClickable ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''}`}
          >
            {/* 섹션 헤더 */}
            <div
              className={`w-full p-4 flex items-center gap-3 transition-colors ${
                section.type !== 'period' ? sectionStyles[section.type].headerBg : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg || 'bg-gray-100'}`}>
                <Icon className={`w-5 h-5 ${colors.text || 'text-gray-500'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    stamped ? 'bg-green-100 text-green-700' : `${styles.badge} ${styles.badgeText}`
                  }`}>
                    {getSectionBadge(section, t('digitalSchool.curriculum.period', '교시'))}
                  </span>
                  {stamped && <span className="text-green-500 text-sm">✓</span>}
                  {isLocked && <span className="text-xs text-gray-400">🔒</span>}
                </div>
                <h3 className="text-sm font-bold text-gray-800 mt-1 truncate">
                  {t(section.titleKey)}
                </h3>
              </div>

              {isClickable && (
                <span className="text-gray-300 text-lg shrink-0">›</span>
              )}
            </div>

            {/* 섹션 내용 */}
            <div className="border-t border-gray-100 px-4 pb-4">
              <div className="mt-3 space-y-2">
                {section.steps.map((step) => {
                  const stepKey = `${section.id}-${step.stepNumber}`;

                  return (
                    <div key={stepKey} className="bg-gray-50 rounded-xl overflow-hidden">
                      <div className="w-full flex items-center gap-3 px-3 py-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step.isPractice ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.stepNumber}
                        </span>
                        <span className="text-sm text-gray-700 flex-1 text-left truncate">
                          {t(step.titleKey)}
                        </span>
                        {step.isPractice ? (
                          <span className="text-[10px] text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded-full font-bold shrink-0">
                            실습
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded-full shrink-0">
                            이론
                          </span>
                        )}
                      </div>

                      <div className="px-3 pb-3">
                        <p className="text-xs text-gray-500 mb-2 pl-9">
                          {t(step.descriptionKey)}
                        </p>

                        {/* 실습 step → 도구 버튼 */}
                        {step.isPractice && step.toolRoute && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(step.toolRoute!); }}
                            className="ml-9 flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            실습 도구 열기 →
                          </button>
                        )}

                        {/* 입학식 step3 → 학생증 보기 */}
                        {section.id === 'entrance' && step.stepNumber === 3 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                            className="ml-9 flex items-center gap-2 px-3 py-2 bg-kk-cream text-kk-brown rounded-lg text-xs font-bold hover:bg-kk-warm transition-colors"
                          >
                            {user?.role === 'instructor' ? '교원증 보기' : '학생증 보기'} →
                          </button>
                        )}

                        {/* 졸업식 step1 → 수료장 수여 */}
                        {section.id === 'graduation-ceremony' && step.stepNumber === 1 && (
                          <div className="ml-9 mt-1">
                            {graduated ? (
                              <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5" /> 수료 완료!
                              </p>
                            ) : canGrad ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowGraduationModal(true); }}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                              >
                                🎓 수료하기
                              </button>
                            ) : (
                              <p className="text-xs text-gray-400">모든 교시를 완료해야 합니다</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* 수료 모달 */}
      {showGraduationModal && (
        <GraduationModal
          userId={user.id}
          userName={user.name}
          userOrg={user.organization}
          teamName={myTeam?.name || ''}
          onClose={() => setShowGraduationModal(false)}
          onComplete={() => {
            setShowGraduationModal(false);
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}
