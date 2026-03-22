import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Loader2, Gem, Trash2, UsersRound } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import SchoolBottomNav from '../../../components/school/SchoolBottomNav';
import KkakdugiMascot from '../../../components/brand/KkakdugiMascot';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import GraduationModal from '../../../components/school/GraduationModal';
import GraduationCertificate from '../../../components/school/GraduationCertificate';
import { getMyTeam, getTeamIdeas, deleteTeamIdea } from '../../../services/teamService';
import { supabase } from '../../../lib/supabase';
import type { TeamGroup, TeamMember, TeamIdea } from '../../../types/team';

const TOOL_LABELS: Record<string, string> = {
  'aptitude-test': '적성검사',
  'market-scanner': '시장분석',
  'edge-maker': '브랜딩',
  'viral-card-maker': '카드뉴스',
  'perfect-planner': '판매전략',
  'roas-simulator': 'ROAS',
};

export default function GraduationProjectPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { isGraduated: graduated, canGraduate: canGrad, hasAllStamps: allStamps } = useSchoolProgress();
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [myTeam, setMyTeam] = useState<TeamGroup | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamIdeas, setTeamIdeas] = useState<TeamIdea[]>([]);

  // Load team data — hooks must be before any conditional return
  useEffect(() => {
    if (!user) return;
    const loadTeam = async () => {
      try {
        const info = await getMyTeam(user.id);
        if (info) {
          setMyTeam(info.team);
          setTeamMembers(info.members);
          const ideas = await getTeamIdeas(info.team.id);
          setTeamIdeas(ideas);
        }
      } catch {
        // 팀 조회 실패 — 무시 (팀 없는 유저)
      }
    };
    loadTeam();
  }, [user]);

  // Realtime subscription for team ideas
  useEffect(() => {
    if (!myTeam) return;
    const channel = supabase
      .channel(`team-ideas-${myTeam.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_ideas',
        filter: `team_id=eq.${myTeam.id}`,
      }, (payload) => {
        setTeamIdeas(prev => [payload.new as TeamIdea, ...prev]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'team_ideas',
        filter: `team_id=eq.${myTeam.id}`,
      }, (payload) => {
        setTeamIdeas(prev => prev.filter(i => i.id !== (payload.old as TeamIdea).id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [myTeam]);

  // ─── Early returns (after all hooks) ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-kk-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-kk-red" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center p-6">
        <KkakdugiMascot size={48} />
        <p className="mt-4 text-kk-brown font-semibold text-lg">로그인이 필요합니다</p>
        <p className="text-kk-brown/60 text-sm mt-1 mb-6">마케팅 학교는 학생 등록 후 이용할 수 있어요</p>
        <button
          onClick={() => navigate('/login', { state: { redirectTo: '/marketing/hub' } })}
          className="px-6 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors"
        >
          로그인하기
        </button>
      </div>
    );
  }

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteTeamIdea(ideaId);
    setTeamIdeas(prev => prev.filter(i => i.id !== ideaId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="뒤로 가기" className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-500" />
            <h1 className="font-bold text-gray-800">{t('school.graduationProject.title')}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Description */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t('school.graduationProject.description')}</h2>
          <p className="text-sm text-gray-600 mb-2">{t('school.graduationProject.offlineNote')}</p>
          <p className="text-sm text-gray-600">{t('school.graduationProject.presentNote')}</p>
        </div>

        {/* 팀 섹션 */}
        {myTeam ? (
          <>
            {/* 팀원 목록 */}
            <div className="bg-white rounded-2xl border border-purple-200 p-5">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <UsersRound className="w-4 h-4 text-purple-500" />
                졸업 과제에 함께 할 친구들
              </h3>
              <div className="flex flex-wrap gap-2">
                {teamMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                    <span className="text-sm">{m.animal_icon || '👤'}</span>
                    <span className="text-sm font-medium text-purple-700">{m.user_name}</span>
                    {m.aptitude_type && (
                      <span className="text-xs text-purple-400">({m.aptitude_type})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 팀 보석함 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-5">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <Gem className="w-4 h-4 text-amber-500" />
                우리 팀 아이디어 보석함 💎
                <span className="text-xs text-amber-500 font-normal">({teamIdeas.length}개)</span>
              </h3>
              {teamIdeas.length === 0 ? (
                <p className="text-sm text-amber-600/60 text-center py-4">
                  아직 보석함이 비어있어요. AI 도구 결과에서 💎 보석함에 넣기를 눌러보세요!
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {teamIdeas.map(idea => (
                    <div key={idea.id} className="bg-white rounded-xl p-3 border border-amber-100">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{idea.animal_icon || '👤'}</span>
                          <span className="text-xs font-medium text-gray-700">{idea.user_name}</span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {TOOL_LABELS[idea.tool_id] || idea.tool_id}
                          </span>
                        </div>
                        {idea.user_id === user.id && (
                          <button
                            onClick={() => handleDeleteIdea(idea.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{idea.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{idea.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
            <UsersRound className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">아직 팀이 배정되지 않았어요.</p>
            <p className="text-xs text-gray-400 mt-1">선생님에게 문의하세요!</p>
          </div>
        )}

        {/* Writing Tips */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">{t('school.graduationProject.tipsTitle')}</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-purple-400 mt-0.5">&#8226;</span>
                <span>{t(`school.graduationProject.tip${i}`)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Graduation Button */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          {graduated ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-green-600 font-bold text-lg">{t('school.attendance.alreadyGraduated')}</p>
              <button
                onClick={() => navigate('/marketing/pro')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                {t('school.graduation.proGiftButton')}
              </button>
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 font-bold rounded-xl hover:opacity-90 transition-opacity border border-amber-200"
              >
                {t('school.graduation.getCertificateButton')}
              </button>
            </div>
          ) : canGrad ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">{t('school.attendance.readyToGraduate')}</p>
              <button
                onClick={() => setShowGraduationModal(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                {t('school.attendance.graduateButton')}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">{t('school.graduationProject.notReady')}</p>
              {!allStamps && (
                <p className="text-xs text-gray-400 mt-1">{t('school.graduationProject.completeAll')}</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Graduation Modal */}
      {showGraduationModal && (
        <GraduationModal
          userId={user.id}
          userName={user.name}
          userOrg={user.organization}
          teamName={myTeam?.name || ''}
          onClose={() => setShowGraduationModal(false)}
          onComplete={() => {
            setShowGraduationModal(false);
            navigate('/marketing/school/attendance');
          }}
        />
      )}

      {/* Graduation Certificate */}
      {showCertificate && (
        <GraduationCertificate
          userName={user.name}
          userOrg={user.organization}
          teamName={myTeam?.name || ''}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* 하단 탭 네비게이션 */}
      <SchoolBottomNav />
    </div>
  );
}
