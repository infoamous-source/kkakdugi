import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lightbulb,
  Trash2,
  Copy,
  Check,
  Search,
  Package,
  ClipboardCopy,
  Download,
  Users,
} from 'lucide-react';
import {
  type IdeaItem,
  type IdeaItemType,
  ideaTypeIcons,
} from '../../types/ideaBox';
import { useIdeaBox } from '../../hooks/useIdeaBox';
import { SCHOOL_CURRICULUM } from '../../types/school';
import { getMyTeam, getTeamIdeas } from '../../services/teamService';
import type { TeamIdea } from '../../types/team';

interface IdeaBoxProps {
  userId: string;
}

// AI 도구별 탭 정의 (SCHOOL_CURRICULUM 기반)
const TOOL_TABS = [
  { id: 'all', label: '전체', emoji: '📋' },
  ...SCHOOL_CURRICULUM.map((period) => ({
    id: period.id,
    label: `${period.period}교시`,
    emoji: period.id === 'aptitude-test' ? '📝' :
           period.id === 'market-scanner' ? '🔍' :
           period.id === 'edge-maker' ? '⚡' :
           period.id === 'viral-card-maker' ? '📱' :
           period.id === 'perfect-planner' ? '📋' :
           period.id === 'roas-simulator' ? '📊' : '📝',
  })),
];

export default function IdeaBox({ userId }: IdeaBoxProps) {
  const { t } = useTranslation('common');
  const { items: rawItems, removeItem } = useIdeaBox();
  const [activeToolTab, setActiveToolTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'personal' | 'team'>('personal');
  const [teamInfo, setTeamInfo] = useState<{ teamId: string; teamName: string } | null>(null);
  const [teamIdeas, setTeamIdeas] = useState<TeamIdea[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    getMyTeam(userId).then(info => {
      if (info) setTeamInfo({ teamId: info.team.id || '', teamName: info.team.name });
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (viewMode === 'team' && teamInfo?.teamId) {
      setTeamLoading(true);
      getTeamIdeas(teamInfo.teamId).then(ideas => {
        setTeamIdeas(ideas);
        setTeamLoading(false);
      }).catch(() => setTeamLoading(false));
    }
  }, [viewMode, teamInfo]);

  // Map Supabase rows to display format
  const items = rawItems.map((r) => ({
    id: r.id,
    type: r.type as IdeaItemType,
    title: r.title,
    content: r.content,
    preview: r.preview ?? undefined,
    toolId: r.tool_id ?? undefined,
    createdAt: r.created_at,
    tags: r.tags ?? undefined,
  }));

  const handleDelete = (itemId: string) => {
    removeItem(itemId);
  };

  const handleCopy = async (item: IdeaItem) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const buildAllText = (itemList: typeof items) => {
    return itemList.map(item =>
      `[${getTypeLabel(item.type)}] ${item.title}\n${item.content}`
    ).join('\n\n---\n\n');
  };

  const handleBulkCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildAllText(filteredItems));
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const dateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const handleExportTxt = () => {
    const text = buildAllText(filteredItems);
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `아이디어보석함_${dateStr()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    try {
      // html2canvas로 보석함 목록을 이미지로 캡처 → PDF (한글 100% 보장)
      const target = document.getElementById('idea-box-list');
      if (!target) { alert('내보낼 항목이 없어요'); return; }
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth() - 20;
      const pageH = pdf.internal.pageSize.getHeight() - 20;
      const imgRatio = canvas.height / canvas.width;
      const imgW = pageW;
      const imgH = imgW * imgRatio;
      const imgData = canvas.toDataURL('image/png');
      // 여러 페이지로 분할
      let srcY = 0;
      const sliceH = (pageH / imgH) * canvas.height;
      let page = 0;
      while (srcY < canvas.height) {
        if (page > 0) pdf.addPage();
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceH, canvas.height - srcY);
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvas.height, 0, 0, canvas.width, sliceCanvas.height);
        const sliceData = sliceCanvas.toDataURL('image/png');
        const sliceImgH = (sliceCanvas.height / canvas.width) * imgW;
        pdf.addImage(sliceData, 'PNG', 10, 10, imgW, sliceImgH);
        srcY += sliceH;
        page++;
      }
      pdf.save(`아이디어보석함_${dateStr()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF 내보내기 실패. TXT로 시도해주세요.');
    }
  };

  const filteredItems = items.filter(item => {
    // 도구별 탭 필터
    if (activeToolTab !== 'all') {
      if (item.toolId !== activeToolTab) return false;
    }
    // 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.preview && item.preview.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // 각 탭의 아이템 개수
  const getTabCount = (tabId: string) => {
    if (tabId === 'all') return items.length;
    return items.filter(i => i.toolId === tabId).length;
  };

  const getTypeLabel = (type: string): string => {
    const labelMap: Record<string, string> = {
      persona: t('profile.ideaBox.typePersona', '페르소나'),
      usp: t('profile.ideaBox.typeUSP', 'USP'),
      copy: t('profile.ideaBox.typeCopy', '카피'),
      hashtag: t('profile.ideaBox.typeHashtag', '해시태그'),
      color: t('profile.ideaBox.typeColor', '컬러'),
      roi: t('profile.ideaBox.typeROI', 'ROI'),
      ad: t('profile.ideaBox.typeAd', '광고'),
      other: t('profile.ideaBox.typeOther', '기타'),
      'tool-result': '도구 결과',
    };
    return labelMap[type] || '기타';
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            {t('profile.ideaBox.title', '아이디어 상자')}
          </h2>
          <span className="text-sm text-gray-400 ml-auto mr-2">
            {items.length}{t('profile.ideaBox.countUnit', '개')}
          </span>
          {items.length > 0 && (
            <div className="flex gap-1">
              <button
                onClick={handleBulkCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                title="전체 복사"
              >
                {bulkCopied ? <Check className="w-3 h-3 text-green-500" /> : <ClipboardCopy className="w-3 h-3" />}
                {bulkCopied ? '복사됨' : '전체 복사'}
              </button>
              <button
                onClick={handleExportTxt}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                title="TXT 내보내기"
              >
                <Download className="w-3 h-3" />
                TXT
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                title="PDF 내보내기"
              >
                <Download className="w-3 h-3" />
                PDF
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {t('profile.ideaBox.description', '마케팅 도구에서 만든 결과물을 모아두는 곳이에요. 나중에 다시 보고 활용할 수 있어요!')}
        </p>
      </div>

      {/* 개인 / 조별 탭 */}
      {teamInfo && (
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('personal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'personal' ? 'bg-white shadow text-kk-brown' : 'text-gray-500'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            내 보석함
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'team' ? 'bg-white shadow text-purple-700' : 'text-gray-500'
            }`}
          >
            <Users className="w-4 h-4" />
            조별 보석함 ({teamInfo.teamName})
          </button>
        </div>
      )}

      {/* 조별 보석함 뷰 */}
      {viewMode === 'team' && teamInfo && (
        <div className="space-y-3">
          {teamLoading ? (
            <div className="text-center py-8 text-gray-400">불러오는 중...</div>
          ) : teamIdeas.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">조별 보석함이 비어있어요.<br/>도구 결과에서 "조별 보석함에 저장"을 눌러보세요!</p>
            </div>
          ) : (
            teamIdeas.map(idea => (
              <div
                key={idea.id}
                className="bg-white border border-purple-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{idea.animal_icon || '💡'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-800 truncate">{idea.title}</h3>
                    <span className="text-[10px] text-purple-500">{idea.user_name} · {new Date(idea.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">{expandedId === idea.id ? '▲' : '▼'}</span>
                </div>
                {expandedId === idea.id && (
                  <pre className="mt-3 text-xs text-gray-600 whitespace-pre-wrap bg-purple-50 rounded-lg p-3 animate-[fadeIn_0.2s]">{idea.content}</pre>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {viewMode === 'personal' && <>
      {/* AI 도구별 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TOOL_TABS.map(tab => {
          const count = getTabCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveToolTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeToolTab === tab.id
                  ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeToolTab === tab.id
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('profile.ideaBox.searchPlaceholder', '검색...')}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* 아이템 목록 */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {items.length === 0
              ? t('profile.ideaBox.empty', '아직 저장된 아이디어가 없어요.\n마케팅 도구를 사용하고 결과를 저장해보세요!')
              : t('profile.ideaBox.noResults', '검색 결과가 없습니다.')
            }
          </p>
        </div>
      ) : (
        <div id="idea-box-list" className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              {/* 아이템 헤더 */}
              <div className="flex items-start gap-3">
                <span className="text-xl">{ideaTypeIcons[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-medium text-gray-800 truncate cursor-pointer hover:text-purple-600"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 shrink-0">
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.preview || item.content.slice(0, 100)}
                  </p>

                  {/* 펼쳐진 내용 */}
                  {expandedId === item.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {item.content}
                      </pre>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(item)}
                    className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                    title={t('profile.ideaBox.copy', '복사')}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('profile.ideaBox.delete', '삭제')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 날짜 + 도구 이름 */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {item.toolId && (
                  <span className="text-xs text-purple-400 bg-purple-50 px-2 py-0.5 rounded">
                    {SCHOOL_CURRICULUM.find(p => p.id === item.toolId)
                      ? `${SCHOOL_CURRICULUM.find(p => p.id === item.toolId)!.period}교시`
                      : item.toolId
                    }
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </>}
    </div>
  );
}
