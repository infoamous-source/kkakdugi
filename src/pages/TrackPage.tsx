import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Laptop,
  Globe,
  Smartphone,
  AppWindow,
  Share2,
  PenTool,
  ShoppingBag,
  BarChart2,
  FileText,
  MessageSquare,
  Search,
  Users,
  Clock,
  BookOpen,
  Play,
} from 'lucide-react';
import { tracks } from '../data/tracks';
import { getModuleContent } from '../data/digital/modules';
import RollingBanner from '../components/common/RollingBanner';
import { useActivityLog } from '../hooks/useActivityLog';
import { useVisibility } from '../contexts/VisibilityContext';
import { useDigitalProgress } from '../hooks/useDigitalProgress';
import type { TrackId, TrackModule } from '../types/track';

const iconMap: Record<string, typeof Laptop> = {
  Laptop,
  Globe,
  Smartphone,
  AppWindow,
  Share2,
  PenTool,
  ShoppingBag,
  BarChart2,
  FileText,
  MessageSquare,
  Search,
  Users,
};

interface ModuleCardProps {
  module: TrackModule;
  trackId: TrackId;
  trackColor: string;
  completionRate?: number;
}

function ModuleCard({ module, trackId, trackColor, completionRate = 0 }: ModuleCardProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logActivity } = useActivityLog();
  const Icon = iconMap[module.icon] || BookOpen;

  const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:border-blue-300' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'hover:border-purple-300' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:border-emerald-300' },
  };

  const colors = colorClasses[trackColor] || colorClasses.blue;

  const handleClick = () => {
    logActivity('click', trackId, module.id, { action: 'module_click' });

    // 한국 필수 앱 모듈은 별도 페이지로 이동
    if (module.id === 'db-04') {
      navigate('/track/digital-basics/korea-apps');
      return;
    }

    // 디지털 기초 모듈 상세 페이지
    if (trackId === 'digital-basics') {
      navigate(`/track/digital-basics/module/${module.id}`);
      return;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full bg-white rounded-xl border-2 border-gray-100 p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${colors.hover}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
          {completionRate >= 100 ? (
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <Icon className={`w-6 h-6 ${colors.text}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 mb-1">{t(module.titleKey)}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{t(module.descriptionKey)}</p>

          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {module.duration}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              {module.lessons} lessons
            </span>
            {completionRate > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                completionRate >= 100
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {completionRate}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          {completionRate > 0 && (
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionRate >= 100
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          )}
        </div>

        <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center shrink-0`}>
          <Play className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
    </button>
  );
}

export default function TrackPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const { t } = useTranslation('common');
  const { isModuleVisible } = useVisibility();
  const { getModuleCompletionRate } = useDigitalProgress();
  const { logActivity: logPageActivity } = useActivityLog();

  const track = tracks.find((tr) => tr.id === trackId);

  const getDigitalModuleCompletion = (moduleId: string): number => {
    const content = getModuleContent(moduleId);
    if (!content) return 0;
    return getModuleCompletionRate(moduleId, content.steps.length, content.practices.length);
  };

  if (!track) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Track not found</p>
      </div>
    );
  }

  // 페이지 뷰 로깅
  logPageActivity('view', track.id, undefined, { page: 'track_detail' });

  return (
    <div className="max-w-4xl mx-auto">
      <RollingBanner />

      {/* 트랙 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className={`text-${track.color}-600 font-medium`}>{t(track.nameKey)}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">{t(track.nameKey)}</h1>
        <p className="text-gray-500 text-lg">{t(track.descriptionKey)}</p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            {track.modules.length} {t('track.modules')}
          </span>
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {track.modules.reduce((sum, m) => sum + parseFloat(m.duration), 0).toFixed(1)}h {t('track.totalTime')}
          </span>
        </div>
      </div>

      {/* 모듈 리스트 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">{t('track.curriculum')}</h2>

        {track.modules
          .filter((module) => isModuleVisible(track.id, module.id))
          .map((module, index) => (
          <div key={module.id} className="flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${track.gradient} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <ModuleCard
                module={module}
                trackId={track.id}
                trackColor={track.color}
                completionRate={track.id === 'digital-basics' ? getDigitalModuleCompletion(module.id) : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
