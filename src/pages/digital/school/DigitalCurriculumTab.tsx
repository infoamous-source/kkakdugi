import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useDigitalSchoolProgress } from '../../../hooks/useDigitalSchoolProgress';
import { DIGITAL_CURRICULUM_SECTIONS, DIGITAL_TOTAL_PERIODS } from '../../../types/digitalSchool';
import type { DigitalPeriodId, DigitalCurriculumSection } from '../../../types/digitalSchool';
import {
  Sparkles, Trophy, Loader2, ChevronDown,
  Smartphone, ShieldCheck, Monitor, FileText, Languages, ShieldAlert,
  PartyPopper, Award, BookOpen, GraduationCap, ClipboardList,
} from 'lucide-react';
import GraduationModal from '../../../components/school/GraduationModal';
import { getMyTeam } from '../../../services/teamService';
import type { TeamGroup } from '../../../types/team';

// ─── 아이콘 맵 ───

const iconMap: Record<string, typeof Smartphone> = {
  Smartphone, ShieldCheck, Monitor, FileText, Languages, ShieldAlert,
  PartyPopper, Award, BookOpen, GraduationCap, ClipboardList,
};

// ─── 교시별 색상 ───

const colorMap: Record<string, { bg: string; text: string; iconBg: string; border: string; borderActive: string; ring: string; badgeBg: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    iconBg: 'bg-blue-50',    border: 'border-blue-200',    borderActive: 'border-blue-300',    ring: 'ring-blue-100',    badgeBg: 'bg-blue-500' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-50',   border: 'border-amber-200',   borderActive: 'border-amber-300',   ring: 'ring-amber-100',   badgeBg: 'bg-amber-500' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  iconBg: 'bg-purple-50',  border: 'border-purple-200',  borderActive: 'border-purple-300',  ring: 'ring-purple-100',  badgeBg: 'bg-purple-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-50', border: 'border-emerald-200', borderActive: 'border-emerald-300', ring: 'ring-emerald-100', badgeBg: 'bg-emerald-500' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    iconBg: 'bg-rose-50',    border: 'border-rose-200',    borderActive: 'border-rose-300',    ring: 'ring-rose-100',    badgeBg: 'bg-rose-500' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  iconBg: 'bg-orange-50',  border: 'border-orange-200',  borderActive: 'border-orange-300',  ring: 'ring-orange-100',  badgeBg: 'bg-orange-500' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    iconBg: 'bg-pink-50',    border: 'border-pink-200',    borderActive: 'border-pink-300',    ring: 'ring-pink-100',    badgeBg: 'bg-pink-500' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  iconBg: 'bg-indigo-50',  border: 'border-indigo-200',  borderActive: 'border-indigo-300',  ring: 'ring-indigo-100',  badgeBg: 'bg-indigo-500' },
  yellow:  { bg: 'bg-amber-50',   text: 'text-amber-600',   iconBg: 'bg-amber-50',   border: 'border-amber-200',   borderActive: 'border-amber-300',   ring: 'ring-amber-100',   badgeBg: 'bg-amber-500' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  iconBg: 'bg-violet-50',  border: 'border-violet-200',  borderActive: 'border-violet-300',  ring: 'ring-violet-100',  badgeBg: 'bg-violet-500' },
};

// ─── 배지 라벨 ───

function getBadge(section: DigitalCurriculumSection, periodLabel: string): string {
  if (section.type === 'period') return `${section.period}${periodLabel}`;
  if (section.id === 'entrance') return 'Pre-School';
  if (section.id === 'final-project') return 'Final Step';
  if (section.id === 'graduation-ceremony') return 'After-School';
  return '';
}

// ─── 1일차/2일차 분류 ───
// entrance + period 1~3 = 1일차, period 4~6 + finalProject + graduation = 2일차
const DAY1_IDS = new Set(['entrance', 'period-1', 'period-2', 'period-3']);

// ─── 메인 컴포넌트 ───

export default function DigitalCurriculumTab() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [myTeam, setMyTeam] = useState<TeamGroup | null>(null);
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then(info => {
      if (info) setMyTeam(info.team);
    });
  }, [user]);

  const {
    hasAllStamps: allDone, isGraduated: graduated, canGraduate: canGrad,
    hasStamp, completedStampCount, isLoading: schoolLoading,
  } = useDigitalSchoolProgress();

  // 현재 진행 중인 교시 찾기 → 자동 펼침
  const currentPeriodId = useMemo(() => {
    for (const section of DIGITAL_CURRICULUM_SECTIONS) {
      if (section.type !== 'period') continue;
      const practiceStep = section.steps.find(s => s.isPractice);
      if (practiceStep?.periodId && !hasStamp(practiceStep.periodId as DigitalPeriodId)) {
        return section.id;
      }
    }
    return null;
  }, [hasStamp]);

  // 현재 진행 중인 교시가 속한 일차로 자동 전환
  useMemo(() => {
    if (currentPeriodId) {
      const isDay1 = DAY1_IDS.has(currentPeriodId);
      setActiveDay(isDay1 ? 1 : 2);
      setOpenSections(new Set([currentPeriodId]));
    }
  }, [currentPeriodId]);

  if (!user || schoolLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-kk-red/40" />
    </div>
  );

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const daySections = DIGITAL_CURRICULUM_SECTIONS.filter(s =>
    activeDay === 1 ? DAY1_IDS.has(s.id) : !DAY1_IDS.has(s.id)
  );

  const handleSectionClick = (section: DigitalCurriculumSection) => {
    if (section.id === 'graduation-ceremony') {
      if (canGrad && !graduated) setShowGraduationModal(true);
      return;
    }
    if ((section.type === 'final-project' || section.type === 'after-school') && !allDone) return;
    if (section.id === 'entrance') { navigate('/profile'); return; }
    if (section.type === 'period') {
      const practiceStep = section.steps.find(s => s.isPractice && s.toolRoute);
      if (practiceStep?.toolRoute) navigate(practiceStep.toolRoute);
    }
  };

  return (
    <div className="space-y-4" key={refreshKey}>
      {/* ── 진행률 요약 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📋 {t('digitalSchool.curriculum.title', '시간표')}
          </h2>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {completedStampCount}/{DIGITAL_TOTAL_PERIODS} {t('digitalSchool.curriculum.completed', '완료')}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-600"
            style={{ width: `${(completedStampCount / DIGITAL_TOTAL_PERIODS) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{t('digitalSchool.curriculum.subtitle', '디지털 기초 교실 2일 과정')}</p>
      </div>

      {/* ── 1일차/2일차 탭 ── */}
      <div className="flex bg-white rounded-2xl border border-gray-200 p-1 relative">
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-sm transition-all duration-300"
          style={{ left: activeDay === 1 ? '4px' : 'calc(50%)', width: 'calc(50% - 4px)' }}
        />
        <button
          onClick={() => setActiveDay(1)}
          className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${activeDay === 1 ? 'text-orange-700' : 'text-gray-400'}`}
        >
          📅 1일차
          <span className={`ml-1 text-[10px] font-normal ${activeDay === 1 ? 'text-orange-500' : 'text-gray-400'}`}>
            입학식 + 3교시
          </span>
        </button>
        <button
          onClick={() => setActiveDay(2)}
          className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${activeDay === 2 ? 'text-orange-700' : 'text-gray-400'}`}
        >
          📅 2일차
          <span className={`ml-1 text-[10px] font-normal ${activeDay === 2 ? 'text-orange-500' : 'text-gray-400'}`}>
            3교시 + 졸업
          </span>
        </button>
      </div>

      {/* ── 섹션 목록 ── */}
      <div className="space-y-3">
        {daySections.map((section) => {
          const colors = colorMap[section.color] || colorMap.blue;
          const Icon = iconMap[section.icon] || BookOpen;
          const practiceStep = section.steps.find(s => s.isPractice);
          const stamped = practiceStep?.periodId ? hasStamp(practiceStep.periodId as DigitalPeriodId) : false;
          const isLocked = (section.type === 'final-project' || section.type === 'after-school') && !allDone;
          const isCurrent = section.id === currentPeriodId;
          const isOpen = openSections.has(section.id);
          const isSpecial = section.type === 'pre-school' || section.type === 'final-project' || section.type === 'after-school';

          // 잠금 상태 → 아코디언 없이 표시
          if (isLocked) {
            return (
              <div key={section.id} className={`rounded-2xl border overflow-hidden opacity-60 ${
                isSpecial ? `bg-gradient-to-br ${section.type === 'final-project' ? 'from-violet-50 to-purple-50 border-violet-200' : 'from-amber-50 to-yellow-50 border-amber-200'}` : ''
              }`}>
                <div className={`p-4 flex items-center gap-3 ${isSpecial ? '' : 'bg-white'}`}>
                  <div className="w-11 h-11 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center shadow-sm">
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        section.type === 'final-project' ? 'text-violet-600 bg-violet-100' : 'text-amber-600 bg-amber-100'
                      }`}>
                        {getBadge(section, t('digitalSchool.curriculum.period', '교시'))}
                      </span>
                      <span className="text-xs text-gray-400">🔒</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 mt-0.5">{t(section.titleKey)}</h3>
                    <p className="text-[11px] text-gray-500">모든 교시를 완료하면 열려요</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={section.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
                isCurrent ? `border-2 ${colors.borderActive} shadow-md ring-2 ${colors.ring}` :
                stamped ? 'border-green-200' : colors.border
              } ${isSpecial ? `bg-gradient-to-br ${
                section.type === 'pre-school' ? 'from-pink-50 to-rose-50' :
                section.type === 'final-project' ? 'from-violet-50 to-purple-50' :
                'from-amber-50 to-yellow-50'
              }` : 'bg-white'}`}
            >
              {/* 헤더 (클릭 → 아코디언 토글) */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
                  background: isSpecial ? 'rgba(255,255,255,0.8)' : undefined,
                  ...(isSpecial ? { border: '1px solid rgba(0,0,0,0.06)' } : {}),
                }}>
                  <div className={`w-full h-full rounded-xl flex items-center justify-center ${isSpecial ? '' : colors.iconBg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  {stamped && <span className="absolute -top-1 -right-1 text-sm">✅</span>}
                  {isCurrent && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 ${colors.badgeBg} rounded-full flex items-center justify-center`}>
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      stamped ? 'bg-green-100 text-green-700' :
                      section.type === 'period' ? `text-white ${colors.badgeBg}` :
                      section.type === 'pre-school' ? 'text-pink-600 bg-pink-100' :
                      section.type === 'final-project' ? 'text-violet-600 bg-violet-100' :
                      'text-amber-600 bg-amber-100'
                    }`}>
                      {getBadge(section, t('digitalSchool.curriculum.period', '교시'))}
                    </span>
                    {stamped && <span className="text-green-500 text-xs font-bold">{t('digitalSchool.curriculum.completed', '완료')}</span>}
                    {isCurrent && <span className={`${colors.text} text-xs font-bold animate-pulse`}>진행 중</span>}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mt-0.5 truncate">{t(section.titleKey)}</h3>
                  {isSpecial && !isOpen && (
                    <p className="text-[11px] text-gray-500 truncate">{t(section.subtitleKey)}</p>
                  )}
                </div>

                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                } ${isCurrent ? colors.text.replace('text-', 'text-') : 'text-gray-300'}`} />
              </button>

              {/* 아코디언 본문 */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? '600px' : '0', opacity: isOpen ? 1 : 0 }}
              >
                <div className={`px-4 pb-4 space-y-2 ${!isSpecial ? 'border-t ' + colors.border + ' pt-3' : ''}`}>
                  {section.steps.map((step) => {
                    const isPractice = step.isPractice;
                    return (
                      <div key={`${section.id}-${step.stepNumber}`} className={`rounded-xl px-3 py-2.5 ${
                        isPractice ? colors.bg : isSpecial ? 'bg-white/70' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isPractice ? `${colors.iconBg} ${colors.text}`.replace('bg-', 'bg-').replace('/50', '/100') : isSpecial ? 'bg-pink-100 text-pink-600' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.stepNumber}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isPractice ? colors.text.replace('600', '700') : 'text-gray-700'}`}>
                              {t(step.titleKey)}
                            </p>
                            <p className={`text-[11px] ${isPractice ? colors.text + '/70' : 'text-gray-400'}`}>
                              {t(step.descriptionKey)}
                            </p>
                          </div>
                          {!isPractice && !isSpecial && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">이론</span>
                          )}
                          {isPractice && step.toolRoute && (
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(step.toolRoute!); }}
                              className={`text-[10px] font-bold text-white ${colors.badgeBg} px-2.5 py-1 rounded-lg whitespace-nowrap`}
                            >
                              실습 →
                            </button>
                          )}
                        </div>

                        {/* 실습 step: 큰 버튼 (현재 진행 중인 교시만) */}
                        {isPractice && step.toolRoute && isCurrent && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(step.toolRoute!); }}
                            className={`mt-2 ml-9 flex items-center gap-2 px-3 py-2 ${colors.badgeBg} text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            실습 도구 열기 →
                          </button>
                        )}

                        {/* 입학식 step3 → 학생증 */}
                        {section.id === 'entrance' && step.stepNumber === 3 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                            className="mt-2 ml-9 text-[10px] font-bold text-pink-600 bg-pink-100 px-2.5 py-1 rounded-lg"
                          >
                            {user?.role === 'instructor' ? '교원증 보기' : '학생증 보기'} →
                          </button>
                        )}

                        {/* 졸업식 step1 */}
                        {section.id === 'graduation-ceremony' && step.stepNumber === 1 && (
                          <div className="ml-9 mt-2">
                            {graduated ? (
                              <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5" /> 수료 완료!
                              </p>
                            ) : canGrad ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowGraduationModal(true); }}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs font-bold"
                              >
                                🎓 수료하기
                              </button>
                            ) : (
                              <p className="text-xs text-gray-400">모든 교시를 완료해야 합니다</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 졸업 모달 */}
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
