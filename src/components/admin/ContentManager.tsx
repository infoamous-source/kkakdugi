import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Package,
  Wrench,
  Info,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useVisibility } from '../../contexts/VisibilityContext';
import { tracks } from '../../data/tracks';
import { marketingTools } from '../../data/marketing/modules';
import type { TrackId } from '../../types/track';

// ─── 토글 스위치 컴포넌트 ───

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        disabled
          ? 'bg-gray-200 cursor-not-allowed'
          : checked
            ? 'bg-green-500'
            : 'bg-gray-300 hover:bg-gray-400'
      }`}
      aria-label={checked ? 'ON' : 'OFF'}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── 메인 컴포넌트 ───

export default function ContentManager() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const {
    isTrackVisible,
    isModuleVisible,
    isToolVisible,
    setTrackVisible,
    setModuleVisible,
    setToolVisible,
  } = useVisibility();

  // 트랙별 펼침/접힘 상태
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({
    'digital-basics': false,
    marketing: true,
    career: false,
  });

  const toggleTrackExpand = (trackId: string) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  // 트랙 색상 매핑
  const trackColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'digital-basics': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
    marketing: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
    },
    career: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  // 해당 트랙에 연결된 툴 목록 가져오기
  const getToolsForTrack = (trackId: string) => {
    if (trackId === 'marketing') {
      return marketingTools;
    }
    // 다른 트랙은 아직 툴이 없음
    return [];
  };

  // ON/OFF 개수 카운트
  const getTrackStats = (trackId: TrackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return { totalModules: 0, offModules: 0, totalTools: 0, offTools: 0 };

    const offModules = track.modules.filter(
      (m) => !isModuleVisible(trackId, m.id),
    ).length;

    const tools = getToolsForTrack(trackId);
    const offTools = tools.filter((tool) => !isToolVisible(trackId, tool.id)).length;

    return {
      totalModules: track.modules.length,
      offModules,
      totalTools: tools.length,
      offTools,
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 안내 배너 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">
            {t('admin.contentManager.infoTitle')}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {t('admin.contentManager.infoDescription')}
          </p>
        </div>
      </div>

      {/* 기관 표시 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {t('admin.contentManager.title')}
        </h3>
        <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">
          {user?.instructorCode}
        </span>
      </div>

      {/* 트랙 목록 */}
      <div className="space-y-4">
        {tracks.map((track) => {
          const trackId = track.id;
          const isExpanded = expandedTracks[trackId] ?? false;
          const trackOn = isTrackVisible(trackId);
          const colors = trackColors[trackId] || trackColors['digital-basics'];
          const stats = getTrackStats(trackId);
          const tools = getToolsForTrack(trackId);

          return (
            <div
              key={trackId}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                trackOn ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* 트랙 헤더 */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => toggleTrackExpand(trackId)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                  <span className="font-semibold text-gray-800">
                    {t(track.nameKey)}
                  </span>
                  {/* 상태 뱃지 */}
                  {(stats.offModules > 0 || stats.offTools > 0) && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {stats.offModules + stats.offTools}
                      {t('admin.contentManager.offCount')}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {trackOn ? t('admin.contentManager.allOn') : t('admin.contentManager.allOff')}
                  </span>
                  <ToggleSwitch
                    checked={trackOn}
                    onChange={(v) => setTrackVisible(trackId, v)}
                  />
                </div>
              </div>

              {/* 트랙 내용 (펼쳐졌을 때) */}
              {isExpanded && trackOn && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  {/* 모듈 섹션 */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">
                        {t('admin.contentManager.modules')} ({stats.totalModules})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {track.modules.map((module) => {
                        const moduleOn = isModuleVisible(trackId, module.id);
                        return (
                          <div
                            key={module.id}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                              moduleOn ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {moduleOn ? (
                                <Eye className="w-4 h-4 text-green-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                              <span
                                className={`text-sm ${
                                  moduleOn ? 'text-gray-700' : 'text-gray-400 line-through'
                                }`}
                              >
                                {t(module.titleKey)}
                              </span>
                              {module.stage && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    module.stage === 'foundation'
                                      ? 'bg-blue-100 text-blue-600'
                                      : module.stage === 'practice'
                                        ? 'bg-purple-100 text-purple-600'
                                        : 'bg-red-100 text-red-600'
                                  }`}
                                >
                                  {t(`marketing.stages.${module.stage}_label`)}
                                </span>
                              )}
                            </div>
                            <ToggleSwitch
                              checked={moduleOn}
                              onChange={(v) =>
                                setModuleVisible(trackId, module.id, v)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 툴 섹션 (있을 때만) */}
                  {tools.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {t('admin.contentManager.tools')} ({stats.totalTools})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {tools.map((tool) => {
                          const toolOn = isToolVisible(trackId, tool.id);
                          return (
                            <div
                              key={tool.id}
                              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                                toolOn ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {toolOn ? (
                                  <Eye className="w-4 h-4 text-green-500" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                                <span
                                  className={`text-sm ${
                                    toolOn ? 'text-gray-700' : 'text-gray-400 line-through'
                                  }`}
                                >
                                  {t(tool.nameKey)}
                                </span>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    tool.type === 'ai'
                                      ? 'bg-red-100 text-red-600'
                                      : tool.type === 'interactive'
                                        ? 'bg-purple-100 text-purple-600'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {tool.type === 'ai'
                                    ? 'AI'
                                    : tool.type === 'interactive'
                                      ? t('admin.contentManager.interactive')
                                      : t('admin.contentManager.static')}
                                </span>
                              </div>
                              <ToggleSwitch
                                checked={toolOn}
                                onChange={(v) =>
                                  setToolVisible(trackId, tool.id, v)
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 트랙 OFF일 때 안내 */}
              {isExpanded && !trackOn && (
                <div className="border-t border-gray-100 px-4 py-6 text-center">
                  <EyeOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {t('admin.contentManager.trackOff')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <p className="text-xs text-gray-400 text-center mt-6">
        {t('admin.contentManager.note')}
      </p>
    </div>
  );
}
