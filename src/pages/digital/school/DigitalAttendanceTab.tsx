import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useDigitalSchoolProgress } from '../../../hooks/useDigitalSchoolProgress';
import { getMyTeam, getStudentAssignments } from '../../../services/teamService';
import { getInstructorNameByCode } from '../../../services/profileService';
import StudentCard from '../../../components/school/StudentCard';
import DigitalStampBoard from '../../../components/digital/school/DigitalStampBoard';
import GraduationModal from '../../../components/school/GraduationModal';
import GraduationCertificate from '../../../components/school/GraduationCertificate';
import { GraduationCap, UserCircle, Award, Loader2 } from 'lucide-react';

export default function DigitalAttendanceTab() {
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
    }).catch(() => {});
    if (user.instructorCode) {
      getInstructorNameByCode(user.instructorCode).then(name => {
        if (name) setInstructorName(name);
      }).catch(() => {});
    }
    getStudentAssignments(user.id).then(setAssignments).catch(() => {});
  }, [user]);

  const { progress, isLoading: schoolLoading, isGraduated: graduated, canGraduate: canGrad } = useDigitalSchoolProgress();

  if (!user) return null;
  if (schoolLoading || !progress) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-kk-red/40" />
    </div>
  );

  const handleGraduationComplete = () => {
    setShowGraduationModal(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-5" key={refreshKey}>
      {/* 학생증 */}
      <StudentCard user={user} isGraduated={graduated} personaId={null} instructorName={instructorName} assignments={assignments} />

      {/* 내 학생증 보기 + 수료증 받기 */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/profile')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-kk-cream text-kk-brown text-sm font-medium rounded-xl hover:bg-kk-warm transition-colors"
        >
          <UserCircle className="w-4 h-4" />
          {user.role === 'instructor' ? '내 교원증 보기' : t('digitalSchool.attendance.viewStudentCard', '내 학생증 보기')}
        </button>
        {graduated && (
          <button
            onClick={() => setShowCertificate(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity border border-amber-200"
          >
            <Award className="w-4 h-4" />
            수료증 받기
          </button>
        )}
      </div>

      {/* 도장판 */}
      <DigitalStampBoard stamps={progress.stamps} />

      {/* 수료 버튼 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-500" />
          {t('digitalSchool.attendance.graduationSection', '수료')}
        </h3>

        {graduated ? (
          <div className="text-center py-4 space-y-3">
            <div className="text-4xl mb-2">🎓</div>
            <p className="text-green-600 font-bold text-lg">{t('digitalSchool.attendance.alreadyGraduated', '수료를 축하해요!')}</p>
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full py-3 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 font-bold rounded-xl hover:opacity-90 transition-opacity border border-amber-200"
            >
              수료증 받기
            </button>
          </div>
        ) : canGrad ? (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">{t('digitalSchool.attendance.readyToGraduate', '모든 교시를 완료했어요! 수료할 준비가 되었습니다.')}</p>
            <button
              onClick={() => setShowGraduationModal(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              🎓 {t('digitalSchool.attendance.graduateButton', '수료하기')}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">{t('digitalSchool.attendance.notReady', '아직 수료 조건을 충족하지 못했어요.')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('digitalSchool.attendance.notReadyHint', '모든 교시 실습을 완료해주세요')}</p>
          </div>
        )}
      </div>

      {/* 수료 모달 */}
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

      {/* 수료증서 팝업 */}
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
