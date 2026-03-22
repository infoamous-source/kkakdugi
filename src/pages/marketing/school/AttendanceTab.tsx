import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../hooks/useSchoolProgress';
import { getMyTeam, getStudentAssignments } from '../../../services/teamService';
import { getInstructorNameByCode } from '../../../services/profileService';
import StudentCard from '../../../components/school/StudentCard';
import StampBoard from '../../../components/school/StampBoard';
import GraduationModal from '../../../components/school/GraduationModal';
import GraduationCertificate from '../../../components/school/GraduationCertificate';
import { GraduationCap, UserCircle, Award } from 'lucide-react';

export default function AttendanceTab() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [myTeam, setMyTeam] = useState<{ name: string } | null>(null);
  const [instructorName, setInstructorName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<{ track: string; classroomName: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then(info => {
      if (info) setMyTeam(info.team);
    }).catch(() => {
      // 팀 조회 실패 — 무시 (팀 없는 유저)
    });
    // 담임 선생님 이름 조회
    if (user.instructorCode) {
      getInstructorNameByCode(user.instructorCode).then(name => {
        if (name) setInstructorName(name);
      }).catch(() => {});
    }
    // 배정 정보 조회
    getStudentAssignments(user.id).then(setAssignments).catch(() => {});
  }, [user]);

  const { progress, isLoading: schoolLoading, isGraduated: graduated, canGraduate: canGrad, aptitudeResult } = useSchoolProgress();
  const personaId = aptitudeResult?.resultType ?? null;

  if (!user) return null; // MarketingSchoolLayout이 이미 auth guard 역할
  if (schoolLoading || !progress) return null;

  const handleGraduationComplete = () => {
    setShowGraduationModal(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-5" key={refreshKey}>
      {/* 학생증 */}
      <StudentCard user={user} isGraduated={graduated} personaId={personaId} instructorName={instructorName} assignments={assignments} />

      {/* 내 학생증 보기 + 졸업증 받기 */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/profile')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-kk-cream text-kk-brown text-sm font-medium rounded-xl hover:bg-kk-warm transition-colors"
        >
          <UserCircle className="w-4 h-4" />
          {user.role === 'instructor' ? '내 교원증 보기' : t('school.attendance.viewStudentCard', '내 학생증 보기')}
        </button>
        {graduated && (
          <button
            onClick={() => setShowCertificate(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity border border-amber-200"
          >
            <Award className="w-4 h-4" />
            {t('school.graduation.certificate.getCertificate', '졸업증 받기')}
          </button>
        )}
      </div>

      {/* 도장판 */}
      <StampBoard stamps={progress.stamps} />

      {/* 졸업 버튼 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-500" />
          {t('school.attendance.graduationSection')}
        </h3>

        {/* 졸업과제 안내 링크 */}
        <button
          onClick={() => navigate('/marketing/school/graduation-project')}
          className="w-full mb-3 py-2.5 text-sm text-purple-600 bg-purple-50 rounded-xl font-medium hover:bg-purple-100 transition-colors"
        >
          {t('school.graduationProject.viewGuide')}
        </button>

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
              🎓 {t('school.attendance.graduateButton')}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">{t('school.attendance.notReady')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('school.attendance.notReadyHint')}</p>
          </div>
        )}
      </div>

      {/* 졸업 모달 */}
      {showGraduationModal && (
        <GraduationModal
          userId={user.id}
          userName={user.name}
          userOrg={user.organization}
          teamName={myTeam?.name || ''}
          onClose={() => setShowGraduationModal(false)}
          onComplete={handleGraduationComplete}
        />
      )}

      {/* 졸업증서 팝업 */}
      {showCertificate && (
        <GraduationCertificate
          userName={user.name}
          userOrg={user.organization}
          teamName={myTeam?.name || ''}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
