import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, BookOpen, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { glossaryTerms, glossaryCategories } from '../../../data/marketing/glossary';
import { usePortfolio } from '../../../hooks/usePortfolio';

const FAVORITES_KEY = 'kkakdugi-glossary-favorites';
const VIEWED_KEY = 'kkakdugi-glossary-viewed';

export default function GlossaryTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { logActivity } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch { return []; }
  });
  const [viewed, setViewed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed)); }, [viewed]);

  const categoryLabels: Record<string, string> = {
    all: t('marketing.tools.glossary.categoryAll'),
    basic: t('marketing.tools.glossary.categoryBasic'),
    digital: t('marketing.tools.glossary.categoryDigital'),
    sns: t('marketing.tools.glossary.categorySNS'),
    performance: t('marketing.tools.glossary.categoryPerformance'),
    branding: t('marketing.tools.glossary.categoryBranding'),
    ai: t('marketing.tools.glossary.categoryAI'),
  };

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((term) => {
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() ||
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.termKo.includes(searchQuery) ||
        term.easyExplanation.includes(searchQuery);
      const matchesFav = !showFavorites || favorites.includes(term.id);
      return matchesCategory && matchesSearch && matchesFav;
    });
  }, [searchQuery, selectedCategory, showFavorites, favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleTermClick = (termId: string) => {
    setExpandedId(prev => prev === termId ? null : termId);
    if (!viewed.includes(termId)) setViewed(prev => [...prev, termId]);
    logActivity('glossary', 'mk-01', 'Marketing Glossary', { termId }, { viewed: true }, true);
  };

  const progressPercent = Math.round((viewed.length / glossaryTerms.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mt-6 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>{t('marketing.tools.back', '뒤로 가기')}</span>
      </button>

      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-4 md:p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
          <h1 className="text-xl md:text-2xl font-bold">{t('marketing.tools.glossary.title', '마케팅 용어 사전')}</h1>
        </div>
        <p className="text-blue-100">{t('marketing.tools.glossary.description', '마케팅 용어를 쉽게 배워보세요')}</p>
      </div>

      {/* Progress */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-green-700">📚 {viewed.length}/{glossaryTerms.length} {t('marketing.tools.glossary.progressText', '용어 학습 완료')}</span>
          <span className="text-sm font-bold text-green-600">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('marketing.tools.glossary.searchPlaceholder')}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => { setShowFavorites(!showFavorites); setSelectedCategory('all'); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${showFavorites ? 'bg-yellow-400 text-yellow-900' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
          ⭐ {t('marketing.tools.glossary.favorites', '즐겨찾기')} ({favorites.length})
        </button>
        {glossaryCategories.map((cat) => (
          <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setShowFavorites(false); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id && !showFavorites ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {categoryLabels[cat.id] || t(cat.labelKey, cat.id)}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{t('marketing.tools.glossary.termsCount', { count: filteredTerms.length })}</p>

      <div className="space-y-3">
        {filteredTerms.map((term) => {
          const isExpanded = expandedId === term.id;
          const isFav = favorites.includes(term.id);
          const isViewed = viewed.includes(term.id);
          return (
            <div key={term.id} onClick={() => handleTermClick(term.id)}
              className={`bg-white border rounded-xl transition-all cursor-pointer ${isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-blue-200'}`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isViewed && <span className="text-green-500 text-xs flex-shrink-0">✓</span>}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{term.termKo}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">{categoryLabels[term.category] || term.category}</span>
                    </div>
                    <p className="text-sm text-blue-600">{term.term}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button onClick={(e) => toggleFavorite(term.id, e)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-5 h-5 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <p className="text-gray-600 leading-relaxed">{term.easyExplanation}</p>
                  <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">{term.example}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('marketing.tools.glossary.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
