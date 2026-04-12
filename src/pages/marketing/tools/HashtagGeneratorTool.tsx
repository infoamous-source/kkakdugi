import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Hash, Copy, CheckCircle, Search, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchHashtags } from '../../../data/marketing/hashtagMocks';
import type { HashtagGroup } from '../../../types/marketing';
import { usePortfolio } from '../../../hooks/usePortfolio';
import { generateText, isGeminiEnabled } from '../../../services/gemini/geminiClient';

// AI 응답을 HashtagGroup[]으로 파싱
function parseAIHashtags(text: string, keyword: string): HashtagGroup[] {
  const groups: HashtagGroup[] = [];
  const categoryMap: Record<string, HashtagGroup['category']> = {
    '인기': 'trending',
    '트렌드': 'trending',
    '니치': 'niche',
    '브랜딩': 'brand',
    '커뮤니티': 'community',
  };

  const lines = text.split('\n').filter((l) => l.trim());
  let currentCategory: HashtagGroup['category'] = 'trending';

  for (const line of lines) {
    // 카테고리 헤더 감지
    for (const [label, cat] of Object.entries(categoryMap)) {
      if (line.includes(label) && !line.startsWith('#')) {
        currentCategory = cat;
        break;
      }
    }

    // 해시태그 추출
    const tags = line.match(/#[^\s#,]+/g);
    if (tags && tags.length > 0) {
      const existing = groups.find((g) => g.category === currentCategory);
      if (existing) {
        existing.hashtags.push(...tags.filter((t) => !existing.hashtags.includes(t)));
      } else {
        groups.push({ keyword, hashtags: [...tags], category: currentCategory });
      }
    }
  }

  return groups.length > 0 ? groups : [];
}

export default function HashtagGeneratorTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logActivity } = usePortfolio();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<HashtagGroup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copiedSelected, setCopiedSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAIResult, setIsAIResult] = useState(false);

  const aiEnabled = isGeminiEnabled();

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSelectedTags([]);
    setIsAIResult(false);

    let found: HashtagGroup[] = [];
    let usedAI = false;

    if (aiEnabled) {
      try {
        const prompt = `당신은 한국 SNS 마케팅 전문가입니다.
키워드: "${keyword.trim()}"

이 키워드에 관련된 한국어 마케팅 해시태그를 15~20개 생성해주세요.
반드시 아래 4개 카테고리로 분류해서 작성하세요:

**인기** (대중적이고 검색량 많은 해시태그 5개)
#태그1 #태그2 #태그3 #태그4 #태그5

**니치** (타겟층에 특화된 해시태그 5개)
#태그1 #태그2 #태그3 #태그4 #태그5

**브랜딩** (브랜드 이미지 구축용 해시태그 3~5개)
#태그1 #태그2 #태그3

**트렌드** (2026년 최신 트렌드 해시태그 3~5개)
#태그1 #태그2 #태그3

규칙:
- 모든 해시태그는 #으로 시작
- 한국어로 작성 (영어 혼용 가능)
- 실제 인스타그램/틱톡에서 사용 가능한 형태
- 각 카테고리 제목은 **인기**, **니치**, **브랜딩**, **트렌드**로 표시`;

        const aiResult = await generateText(prompt);
        if (aiResult) {
          const parsed = parseAIHashtags(aiResult, keyword.trim());
          if (parsed.length > 0) {
            found = parsed;
            usedAI = true;
          }
        }
      } catch {
        // AI 실패 → mock fallback
      }
    }

    // AI 실패 또는 미연결 시 mock fallback
    if (found.length === 0) {
      found = searchHashtags(keyword.trim());
    }

    setResults(found);
    setHasSearched(true);
    setIsAIResult(usedAI);
    setLoading(false);

    logActivity(
      'hashtag-generator', 'mk-05', 'Hashtag Generator',
      { keyword: keyword.trim(), aiEnabled: usedAI },
      { groups: found.length, totalHashtags: found.reduce((a, g) => a + g.hashtags.length, 0) },
      !usedAI
    );
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else if (prev.length < 30) {
        return [...prev, tag];
      }
      return prev;
    });
    navigator.clipboard.writeText(tag).then(() => {
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 1500);
    }).catch(() => { /* ignore */ });
  };

  const handleCopySelected = async () => {
    if (selectedTags.length === 0) return;
    try {
      await navigator.clipboard.writeText(selectedTags.join(' '));
      setCopiedSelected(true);
      setTimeout(() => setCopiedSelected(false), 2000);
    } catch {
      // ignore
    }
  };

  const allHashtags = results.flatMap((g) => g.hashtags);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(allHashtags.join(' '));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // ignore
    }
  };

  const suggestedKeywords = ['맛집', '카페', '패션', '뷰티', '여행', '마케팅', '창업', '인테리어', '교육', '건강', '반려동물', '게임'];

  const categoryLabel = (cat: HashtagGroup['category']) => {
    switch (cat) {
      case 'trending': return t('marketing.tools.hashtagGenerator.popular', '인기');
      case 'niche': return t('marketing.tools.hashtagGenerator.niche', '니치');
      case 'brand': return '브랜딩';
      case 'community': return t('marketing.tools.hashtagGenerator.general', '커뮤니티');
      default: return cat;
    }
  };

  const categoryStyle = (cat: HashtagGroup['category']) => {
    switch (cat) {
      case 'trending': return 'bg-red-50 text-red-600';
      case 'niche': return 'bg-purple-50 text-purple-600';
      case 'brand': return 'bg-amber-50 text-amber-600';
      case 'community': return 'bg-gray-50 text-gray-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  // Strategy analysis
  const strategyAnalysis = () => {
    if (selectedTags.length === 0) return null;

    const trendingCount = selectedTags.filter((tag) => {
      return results.some((g) => g.category === 'trending' && g.hashtags.includes(tag));
    }).length;

    const nicheCount = selectedTags.filter((tag) => {
      return results.some((g) => g.category === 'niche' && g.hashtags.includes(tag));
    }).length;

    const trendingRatio = selectedTags.length > 0 ? (trendingCount / selectedTags.length) * 100 : 0;
    const nicheRatio = selectedTags.length > 0 ? (nicheCount / selectedTags.length) * 100 : 0;

    let recommendation = '';
    if (trendingRatio > 60) {
      recommendation = '트렌딩 해시태그가 많습니다. 노출은 많지만 경쟁이 치열할 수 있어요.';
    } else if (nicheRatio > 60) {
      recommendation = '니치 해시태그가 많습니다. 타겟층에 정확히 도달할 수 있어요.';
    } else {
      recommendation = '트렌딩과 니치의 균형이 좋습니다. 이상적인 조합이에요!';
    }

    return { trendingCount, nicheCount, trendingRatio, nicheRatio, recommendation };
  };

  const analysis = strategyAnalysis();

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('marketing.tools.back', '뒤로 가기')}</span>
      </button>

      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-4 md:p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Hash className="w-6 h-6 md:w-8 md:h-8" />
          <h1 className="text-xl md:text-2xl font-bold">{t('marketing.tools.hashtagGenerator.title', '해시태그 생성기')}</h1>
          {aiEnabled && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI
            </span>
          )}
        </div>
        <p className="text-blue-100">{t('marketing.tools.hashtagGenerator.description', '키워드에 맞는 해시태그를 추천받으세요')}</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
          placeholder={t('marketing.tools.hashtagGenerator.inputPlaceholder')}
          className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={!keyword.trim() || loading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            keyword.trim() && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">AI가 해시태그를 분석하고 있어요...</p>
        </div>
      )}

      {/* Suggested Keywords */}
      {!hasSearched && !loading && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">{t('marketing.tools.hashtagGenerator.suggestedKeywords')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setKeyword(kw);
                  // trigger search with the suggested keyword
                  setTimeout(async () => {
                    setLoading(true);
                    setSelectedTags([]);
                    setIsAIResult(false);
                    let found: HashtagGroup[] = [];
                    let usedAI = false;

                    if (aiEnabled) {
                      try {
                        const prompt = `당신은 한국 SNS 마케팅 전문가입니다. 키워드: "${kw}"에 관련된 한국어 마케팅 해시태그를 15~20개 생성해주세요.
**인기** (5개) **니치** (5개) **브랜딩** (3~5개) **트렌드** (3~5개). 모든 해시태그는 #으로 시작, 한국어로 작성.`;
                        const aiResult = await generateText(prompt);
                        if (aiResult) {
                          const parsed = parseAIHashtags(aiResult, kw);
                          if (parsed.length > 0) { found = parsed; usedAI = true; }
                        }
                      } catch { /* fallback */ }
                    }
                    if (found.length === 0) found = searchHashtags(kw);
                    setResults(found);
                    setHasSearched(true);
                    setIsAIResult(usedAI);
                    setLoading(false);
                    logActivity('hashtag-generator', 'mk-05', 'Hashtag Generator', { keyword: kw }, { groups: found.length }, !usedAI);
                  }, 0);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && !loading && results.length > 0 && (
        <div>
          {/* AI Badge */}
          {isAIResult && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">AI가 생성한 맞춤 해시태그입니다</span>
            </div>
          )}

          {/* Selection Counter and Progress Bar */}
          {selectedTags.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">선택: {selectedTags.length}/30</p>
                <button
                  onClick={handleCopySelected}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  {copiedSelected ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      선택한 해시태그 복사
                    </>
                  )}
                </button>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${(selectedTags.length / 30) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Copy All Button */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{t('marketing.tools.hashtagGenerator.hashtagCount', { count: allHashtags.length })}</p>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {copiedAll ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('marketing.tools.hashtagGenerator.copyAllSuccess')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('marketing.tools.hashtagGenerator.copyAll')}
                </>
              )}
            </button>
          </div>

          {/* Hashtag Groups */}
          {results.map((group, gIdx) => (
            <div key={gIdx} className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryStyle(group.category)}`}>
                  {categoryLabel(group.category)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.hashtags.map((tag, tIdx) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tIdx}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : copiedTag === tag
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : copiedTag === tag ? `✓ ${t('marketing.tools.hashtagGenerator.copied')}` : tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Strategy Analysis */}
          {analysis && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 md:p-5 mb-4">
              <h3 className="text-sm font-bold text-gray-800 mb-3">전략 분석</h3>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">트렌딩 해시태그</span>
                  <span className="font-semibold text-red-600">{analysis.trendingCount}개 ({analysis.trendingRatio.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">니치 해시태그</span>
                  <span className="font-semibold text-purple-600">{analysis.nicheCount}개 ({analysis.nicheRatio.toFixed(0)}%)</span>
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-purple-100">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 추천: </span>
                  {analysis.recommendation}
                </p>
              </div>
            </div>
          )}

          {/* Usage Tip */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-yellow-800">
              {t('marketing.tools.hashtagGenerator.tip')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
