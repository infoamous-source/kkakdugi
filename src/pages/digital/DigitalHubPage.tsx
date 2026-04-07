import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedList from '../../components/common/AnimatedList';
import { useDigitalSchoolProgress } from '../../hooks/useDigitalSchoolProgress';
import KkakdugiCharacter from '../../components/brand/KkakdugiCharacter';
import KkakdugiMascot from '../../components/brand/KkakdugiMascot';
import { DigitalDeptIcon, ChalkboardIcon, SchoolPatternBg } from '../../components/brand/SchoolIllustrations';
import { useSEO } from '../../hooks/useSEO';

export default function DigitalHubPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isGraduated: graduated } = useDigitalSchoolProgress();
  useSEO({
    title: '디지털 학과',
    description: '스마트폰, 카카오톡, 네이버, 키오스크 등 한국 디지털 생활의 기초를 배우는 무료 AI 교육 과정입니다.',
    path: '/digital/hub',
  });

  const handleSchoolClick = () => {
    navigate('/digital/school/attendance');
  };

  const handleKkakdugiClick = () => {
    navigate('/track/digital-basics/kkakdugi-practice');
  };

  return (
    <div className="min-h-screen bg-kk-bg relative overflow-hidden">
      <SchoolPatternBg className="opacity-30" />

      {/* 헤더 */}
      <header className="relative py-4 px-4 sm:py-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kk-brown/60 hover:text-kk-brown transition-colors mb-6 py-2 -ml-2 pl-2 pr-4 min-h-[44px] rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <KkakdugiMascot size={20} />
            <span className="text-sm font-medium">깍두기 학교로 돌아가기</span>
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <KkakdugiCharacter size="icon" animated={false} />
              <DigitalDeptIcon size={40} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4 border border-blue-100">
              <Sparkles className="w-4 h-4" />
              <span>{t('digitalSchool.hub.badge', '디지털 기초 교육')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-kk-brown mb-3">
              {t('digitalSchool.hub.title', '디지털 학과')}
            </h1>
            <p className="text-kk-brown/60 max-w-xl mx-auto">
              {t('digitalSchool.hub.description', '스마트폰 기초부터 키오스크 실습까지, 디지털 세상의 첫걸음!')}
            </p>
          </div>
        </div>
      </header>

      {/* 교실 카드 그리드 */}
      <section className="relative pb-24 px-4 sm:px-8">
        <AnimatedList className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 카드 A: 디지털 교실 */}
          <div className="animate-on-scroll">
          <button
            onClick={handleSchoolClick}
            className="group relative w-full rounded-2xl border-2 border-blue-200 hover:border-blue-400 bg-white overflow-hidden
              transition-all duration-300 ease-out cursor-pointer text-left
              hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-200/30"
          >
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />

            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <ChalkboardIcon size={28} />
                </div>
                {graduated && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                    {t('digitalSchool.hub.graduated', '수료 완료')}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-kk-brown mb-2 flex items-center gap-2">
                {t('digitalSchool.hub.schoolTitle', '디지털 교실')}
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-kk-brown/40" />
              </h2>

              <p className="text-kk-brown/60 text-sm leading-relaxed mb-5">
                {t('digitalSchool.hub.schoolDescription', '6교시 커리큘럼으로 디지털 기초를 배워요. 키오스크 실습과 함께!')}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100">
                <span>📚</span>
                <span>{t('digitalSchool.hub.schoolBadge', '2일 6교시 과정')}</span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/[0.03] group-hover:to-cyan-500/[0.03] transition-all duration-300 pointer-events-none" />
          </button>
          </div>

          {/* 카드 B: 키오스크 연습실 */}
          <div className="animate-on-scroll" style={{ transitionDelay: '80ms' }}>
          <button
            onClick={handleKkakdugiClick}
            className="group relative w-full rounded-2xl border-2 border-purple-200 hover:border-purple-400 bg-white overflow-hidden
              transition-all duration-300 ease-out cursor-pointer text-left
              hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-200/30"
          >
            <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-500" />

            <div className="p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Monitor className="w-7 h-7 text-purple-600" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-kk-brown mb-2 flex items-center gap-2">
                {t('digitalSchool.hub.kkakdugiTitle', '키오스크 연습실')}
                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-kk-brown/40" />
              </h2>

              <p className="text-kk-brown/60 text-sm leading-relaxed mb-5">
                {t('digitalSchool.hub.kkakdugiDescription', '카페, 패스트푸드, 병원 등 8종 키오스크를 자유롭게 연습하세요.')}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-semibold border border-purple-100">
                <span>🖥️</span>
                <span>{t('digitalSchool.hub.kkakdugiBadge', '8종 시뮬레이터')}</span>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-violet-500/0 group-hover:from-purple-500/[0.03] group-hover:to-violet-500/[0.03] transition-all duration-300 pointer-events-none" />
          </button>
          </div>
        </AnimatedList>
      </section>
    </div>
  );
}
