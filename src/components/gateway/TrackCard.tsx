import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import type { Track } from '../../types/track';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useAuth } from '../../contexts/AuthContext';
import { DigitalDeptIcon, MarketingDeptIcon, CareerDeptIcon } from '../brand/SchoolIllustrations';

const deptIconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'digital-basics': DigitalDeptIcon,
  marketing: MarketingDeptIcon,
  career: CareerDeptIcon,
};

// 학과별 허브 경로
const trackHubPath: Record<string, string> = {
  marketing: '/marketing/hub',
  'digital-basics': '/digital/hub',
  career: '/track/career',
};

interface TrackCardProps {
  track: Track;
  delay?: number;
}

export default function TrackCard({ track, delay = 0 }: TrackCardProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { logActivity } = useActivityLog();
  const DeptIcon = deptIconMap[track.id] || DigitalDeptIcon;

  const handleClick = () => {
    logActivity('click', track.id, undefined, { source: 'gateway' });

    // 미로그인 → 학생 로그인 페이지로 이동
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { redirectTo: '/' } });
      return;
    }

    // 로그인된 누구든 학과 진입 허용 (교실 배정 무관)
    navigate(trackHubPath[track.id] || `/track/${track.id}`);
  };

  const colorThemes: Record<string, {
    border: string;
    ribbon: string;
    hoverBg: string;
    textAccent: string;
  }> = {
    blue: {
      border: 'border-blue-200 hover:border-blue-400',
      ribbon: 'bg-blue-500',
      hoverBg: 'group-hover:from-blue-500/5 group-hover:to-blue-400/5',
      textAccent: 'text-blue-600',
    },
    purple: {
      border: 'border-purple-200 hover:border-purple-400',
      ribbon: 'bg-purple-500',
      hoverBg: 'group-hover:from-purple-500/5 group-hover:to-purple-400/5',
      textAccent: 'text-purple-600',
    },
    green: {
      border: 'border-emerald-200 hover:border-emerald-400',
      ribbon: 'bg-emerald-500',
      hoverBg: 'group-hover:from-emerald-500/5 group-hover:to-emerald-400/5',
      textAccent: 'text-emerald-600',
    },
  };

  const theme = colorThemes[track.color] || colorThemes.blue;

  return (
    <button
      onClick={handleClick}
      className={`
        group relative w-full rounded-2xl border-2 bg-white overflow-hidden
        transition-all duration-300 ease-out text-left
        hover:-translate-y-2 hover:shadow-xl
        animate-card-enter cursor-pointer
        ${theme.border}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 상단 색띠 (교과서 느낌) */}
      <div className={`h-2 ${theme.ribbon}`} />

      {/* 공책 줄 텍스처 */}
      <div className="notebook-lines p-6 pb-5">
        {/* 학과 아이콘 */}
        <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
          <DeptIcon size={52} />
        </div>

        {/* 학과명 */}
        <h2 className="text-xl font-bold text-kk-brown mb-2 flex items-center gap-2">
          {t(track.nameKey)}
          <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-kk-brown/40" />
        </h2>

        {/* 설명 */}
        <p className="text-sm text-kk-brown/60 leading-relaxed">
          {t(track.descriptionKey)}
        </p>
      </div>

      {/* 호버 그라데이션 오버레이 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-transparent ${theme.hoverBg} transition-all duration-300 pointer-events-none`} />
    </button>
  );
}
