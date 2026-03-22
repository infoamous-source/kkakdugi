import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Hash, Copy, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchHashtags } from '../../../data/marketing/hashtagMocks';
import type { HashtagGroup } from '../../../types/marketing';
import { usePortfolio } from '../../../hooks/usePortfolio';

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

  const handleSearch = () => {
    if (!keyword.trim()) return;
    const found = searchHashtags(keyword.trim());
    setResults(found);
    setHasSearched(true);
    setSelectedTags([]);

    logActivity(
      'hashtag-generator', 'mk-05', 'Hashtag Generator',
      { keyword: keyword.trim() },
      { groups: found.length, totalHashtags: found.reduce((a, g) => a + g.hashtags.length, 0) },
      true
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
    // 개별 태그 복사 피드백
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
        </div>
        <p className="text-blue-100">{t('marketing.tools.hashtagGenerator.description', '키워드에 맞는 해시태그를 추천받으세요')}</p>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={t('marketing.tools.hashtagGenerator.inputPlaceholder')}
          className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={!keyword.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            keyword.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Keywords */}
      {!hasSearched && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">{t('marketing.tools.hashtagGenerator.suggestedKeywords')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setKeyword(kw);
                  const found = searchHashtags(kw);
                  setResults(found);
                  setHasSearched(true);
                  setSelectedTags([]);
                  logActivity(
                    'hashtag-generator', 'mk-05', 'Hashtag Generator',
                    { keyword: kw },
                    { groups: found.length },
                    true
                  );
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
      {hasSearched && results.length > 0 && (
        <div>
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
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  group.category === 'trending'
                    ? 'bg-red-50 text-red-600'
                    : group.category === 'niche'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-gray-50 text-gray-600'
                }`}>
                  {group.category === 'trending' ? t('marketing.tools.hashtagGenerator.popular') : group.category === 'niche' ? t('marketing.tools.hashtagGenerator.niche') : t('marketing.tools.hashtagGenerator.general')}
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
