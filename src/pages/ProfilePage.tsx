import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getInstructorNameByCode, getStudentsByInstructorCode, resetStudentApiKey, updateProfile } from '../services/profileService';
import { getStudentAssignments } from '../services/teamService';
import { useEnrollments } from '../contexts/EnrollmentContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  GraduationCap,
  School,
  Lightbulb,
  Shield,
  Globe,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bot,
  RefreshCw,
  Link,
  Pencil,
  Check,
  X,
} from 'lucide-react';
const CLASSROOM_DISPLAY: Record<string, string> = {
  'marketing': '예비 마케터 교실',
  'digital-basics': '디지털 기초 교실',
  'career': '취업 준비 교실',
};
import IdeaBox from '../components/profile/IdeaBox';
import KkakdugiMascot from '../components/brand/KkakdugiMascot';
import { useSchoolProgress } from '../hooks/useSchoolProgress';
import { isGeminiConnected, clearGeminiConnection } from '../services/gemini/geminiClient';

type ProfileTab = 'info' | 'ideabox';

export default function ProfilePage() {
  const { t } = useTranslation('common');
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [instructorName, setInstructorName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<{ track: string; classroomName: string }[]>([]);

  // 이름 수정
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // 선생님 전용: 관리 기관
  const [managedOrgs, setManagedOrgs] = useState<{ name: string; code: string; count: number }[]>([]);
  const [orgsExpanded, setOrgsExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'student') {
      if (user.instructorCode) {
        getInstructorNameByCode(user.instructorCode).then(name => {
          if (name) setInstructorName(name);
        }).catch(() => {});
      }
      getStudentAssignments(user.id).then(setAssignments).catch(() => {});
    } else if (user.role === 'instructor') {
      getStudentsByInstructorCode(user.instructorCode).then(profiles => {
        const orgMap: Record<string, { name: string; code: string; count: number }> = {};
        profiles.forEach(p => {
          const code = p.org_code || 'unknown';
          if (!orgMap[code]) {
            orgMap[code] = { name: p.organization || '미지정', code, count: 0 };
          }
          orgMap[code].count++;
        });
        setManagedOrgs(Object.values(orgMap));
      }).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-kk-brown/50 text-lg">{t('profile.loginRequired', '프로필을 보려면 로그인이 필요합니다.')}</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-kk-red hover:underline"
        >
          {t('auth.loginButton')}
        </button>
      </div>
    );
  }

  const isInstructor = user.role === 'instructor';

  const tabs: { id: ProfileTab; labelKey: string; icon: typeof User }[] = [
    { id: 'info', labelKey: 'profile.tabs.info', icon: User },
    { id: 'ideabox', labelKey: 'profile.tabs.ideaBox', icon: Lightbulb },
  ];

  const { enrollments } = useEnrollments();
  const { isGraduated: graduated } = useSchoolProgress();
  const isMarketingEnrolled = enrollments.some(e => e.school_id === 'marketing' && e.status === 'active');

  const handleStartEditName = () => {
    setEditName(user.name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === user.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    const ok = await updateProfile(user.id, { name: trimmed });
    if (ok) {
      await refreshUser();
    }
    setIsSavingName(false);
    setIsEditingName(false);
  };

  const getGenderLabel = () => {
    if (!user.gender) return t('profile.notSet', '미설정');
    const genderMap: Record<string, string> = {
      male: t('profile.gender.male', '남성'),
      female: t('profile.gender.female', '여성'),
      other: t('profile.gender.other', '기타'),
    };
    return genderMap[user.gender] || user.gender;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 프로필 헤더 카드 */}
      <div className="bg-gradient-to-r from-kk-cream via-kk-warm to-kk-peach rounded-2xl p-6 mb-6 shadow-lg border border-kk-warm">
        {/* 제목: 내 학생증 / 내 교원증 */}
        <p className="text-xs font-semibold text-kk-brown/40 mb-3">
          {isInstructor ? '내 교원증' : '내 학생증'}
        </p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-kk-warm flex-shrink-0">
            <KkakdugiMascot size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 min-w-0 text-xl font-bold text-kk-brown bg-white/60 border border-kk-warm rounded-lg px-3 py-1 focus:ring-2 focus:ring-kk-red focus:border-transparent"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-kk-brown truncate">{user.name}</h1>
                  <button
                    onClick={handleStartEditName}
                    className="p-1 text-kk-brown/30 hover:text-kk-brown/60 transition-colors flex-shrink-0"
                    title="이름 수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {isInstructor && user.instructorCode && (
                    <span className="px-2 py-0.5 rounded bg-kk-red/10 text-kk-red-deep text-xs font-mono font-semibold flex-shrink-0">
                      {user.instructorCode}
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-kk-brown/50 truncate">{user.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                isInstructor
                  ? 'bg-kk-red/10 text-kk-red-deep'
                  : 'bg-white/50 text-kk-brown'
              }`}>
                {isInstructor ? t('header.instructor') : t('header.student')}
              </span>
              {!isInstructor && isMarketingEnrolled && (
                <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                  graduated
                    ? 'bg-kk-gold/20 text-kk-brown font-bold'
                    : 'bg-white/50 text-kk-brown'
                }`}>
                  {graduated ? '🎓 졸업' : '📚 재학 중'}
                </span>
              )}
            </div>
          </div>
        </div>

        {!isInstructor && isMarketingEnrolled && (
          <button
            onClick={() => navigate('/marketing/hub')}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 rounded-xl transition-colors text-sm font-medium text-kk-brown"
          >
            <School className="w-4 h-4" />
            <span>{t('profile.goToClassroom', '교실로 이동하기')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isInstructor && (
          <button
            onClick={() => navigate('/admin')}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/60 rounded-xl transition-colors text-sm font-medium text-kk-brown"
          >
            <GraduationCap className="w-4 h-4" />
            <span>대시보드로 이동하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-kk-cream p-1 rounded-xl mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-white text-kk-red-deep shadow-sm'
                  : 'text-kk-brown/50 hover:text-kk-brown'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          {isInstructor ? (
            <div className="bg-white rounded-xl border border-kk-warm p-5">
              <h2 className="text-lg font-semibold text-kk-brown mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-kk-red" />
                교원 정보
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="이름" value={user.name} />
                <InfoRow label="이메일" value={user.email} />
                <InfoRow
                  label="교원 가입일"
                  value={new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  icon={<CalendarDays className="w-4 h-4 text-kk-brown/30" />}
                />
                <InfoRow
                  label="선생님코드"
                  value={user.instructorCode || '-'}
                  icon={<Shield className="w-4 h-4 text-kk-brown/30" />}
                  mono
                />
              </div>

              {/* 관리 기관 (토글) */}
              <div className="mt-4">
                <button
                  onClick={() => setOrgsExpanded(!orgsExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-kk-cream/50 rounded-lg hover:bg-kk-cream transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-kk-brown/50">
                    <Building2 className="w-4 h-4 text-kk-brown/30" />
                    관리 기관
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-kk-brown">총 {managedOrgs.length}곳</span>
                    {orgsExpanded ? (
                      <ChevronUp className="w-4 h-4 text-kk-brown/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-kk-brown/40" />
                    )}
                  </div>
                </button>
                {orgsExpanded && managedOrgs.length > 0 && (
                  <div className="mt-2 space-y-1.5 pl-2">
                    {managedOrgs.map(org => (
                      <div key={org.code} className="flex items-center justify-between p-2 bg-white rounded-lg border border-kk-warm/50">
                        <div>
                          <p className="text-sm font-medium text-kk-brown">{org.name}</p>
                          <p className="text-xs text-kk-brown/40 font-mono">{org.code}</p>
                        </div>
                        <span className="text-xs text-kk-brown/50">{org.count}명</span>
                      </div>
                    ))}
                  </div>
                )}
                {orgsExpanded && managedOrgs.length === 0 && (
                  <p className="text-xs text-kk-brown/30 mt-2 pl-2">등록된 학생이 없습니다.</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-kk-warm p-5">
                <h2 className="text-lg font-semibold text-kk-brown mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-kk-red" />
                  {t('profile.personalInfo', '개인 정보')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label={t('auth.name')} value={user.name} />
                  <InfoRow label={t('auth.email')} value={user.email} />
                  <InfoRow
                    label={t('profile.age', '나이')}
                    value={user.age ? `${user.age}${t('profile.ageSuffix', '세')}` : t('profile.notSet', '미설정')}
                  />
                  <InfoRow
                    label={t('profile.gender.label', '성별')}
                    value={getGenderLabel()}
                  />
                  <InfoRow
                    label={t('profile.country', '국적')}
                    value={user.country || t('profile.notSet', '미설정')}
                    icon={<Globe className="w-4 h-4 text-kk-brown/30" />}
                  />
                  <InfoRow
                    label={t('profile.joinDate', '가입일')}
                    value={new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    icon={<CalendarDays className="w-4 h-4 text-kk-brown/30" />}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-kk-warm p-5">
                <h2 className="text-lg font-semibold text-kk-brown mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-kk-red" />
                  {t('profile.affiliationInfo', '소속 정보')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow
                    label={t('auth.organization')}
                    value={user.organization || t('profile.notSet', '미설정')}
                    icon={<Building2 className="w-4 h-4 text-kk-brown/30" />}
                  />
                  <InfoRow
                    label={t('profile.instructorCode', '선생님코드')}
                    value={user.instructorCode || t('profile.notSet', '미설정')}
                    icon={<GraduationCap className="w-4 h-4 text-kk-brown/30" />}
                    mono
                  />
                  {instructorName && (
                    <InfoRow
                      label="담임 선생님"
                      value={`${instructorName} 선생님`}
                      icon={<GraduationCap className="w-4 h-4 text-kk-brown/30" />}
                    />
                  )}
                  <InfoRow
                    label={t('profile.orgCode', '기관코드')}
                    value={user.orgCode || t('profile.noOrg', '개인')}
                    icon={<Shield className="w-4 h-4 text-kk-brown/30" />}
                    mono
                  />
                  <InfoRow
                    label={t('auth.learningPurpose')}
                    value={user.learningPurpose
                      ? t(`auth.purpose.${user.learningPurpose}`, user.learningPurpose)
                      : t('profile.notSet', '미설정')
                    }
                  />
                </div>
              </div>

              {/* 내 교실 (배정 기반) */}
              <div className="bg-white rounded-xl border border-kk-warm p-5">
                <h2 className="text-lg font-semibold text-kk-brown mb-4 flex items-center gap-2">
                  <School className="w-5 h-5 text-kk-red" />
                  내 교실
                </h2>
                {assignments.length === 0 ? (
                  <p className="text-sm text-kk-brown/30 text-center py-4">배정된 교실이 없습니다. 선생님에게 문의해주세요.</p>
                ) : (
                  <div className="space-y-2">
                    {assignments.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-kk-cream/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <School className="w-5 h-5 text-purple-500" />
                          <p className="text-sm font-medium text-kk-brown">
                            {CLASSROOM_DISPLAY[a.track] || `${a.track} 교실`}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                          배정됨
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI 비서 연결 상태 */}
              <AIConnectionSection userId={user.id} navigate={navigate} />
            </>
          )}
        </div>
      )}

      {activeTab === 'ideabox' && <IdeaBox userId={user.id} />}
    </div>
  );
}

// ─── 보조 컴포넌트 ───

function AIConnectionSection({ userId, navigate }: { userId: string; navigate: (path: string) => void }) {
  const connected = isGeminiConnected();

  const handleReconnect = async () => {
    clearGeminiConnection();
    await resetStudentApiKey(userId);
    navigate('/marketing/school/ai-setup');
  };

  return (
    <div className="bg-white rounded-xl border border-kk-warm p-5">
      <h2 className="text-lg font-semibold text-kk-brown mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-kk-red" />
        AI 비서
      </h2>
      <div className="flex items-center justify-between p-3 bg-kk-cream/50 rounded-lg">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-kk-brown">Gemini AI 비서</p>
            <p className="text-xs text-kk-brown/40">API 연결 상태</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
                연결
              </span>
              <button
                onClick={handleReconnect}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                재연결
              </button>
            </>
          ) : (
            <>
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                미연결
              </span>
              <button
                onClick={() => navigate('/marketing/school/ai-setup')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Link className="w-3 h-3" />
                연결하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-kk-cream/50 rounded-lg">
      <div className="flex items-center gap-2 text-sm text-kk-brown/50">
        {icon}
        {label}
      </div>
      <span className={`text-sm font-medium text-kk-brown ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
