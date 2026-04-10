import { useState, useEffect } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { searchPexelsImage } from '../services/pexelsService';
import type { DetailPagePlan } from '../types/school';

/**
 * 조별 발표용 상세페이지 — 공개 URL (/showcase)
 * 교실 프로젝터에서 풀스크린 표시
 * 상단 토글로 조 선택
 */
export default function ShowcasePage() {
  const [teams, setTeams] = useState<{ id: string; name: string; itemName?: string }[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [plan, setPlan] = useState<DetailPagePlan | null>(null);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [noContent, setNoContent] = useState(false);
  const [mainImg, setMainImg] = useState<string | null>(null);
  const [subImg, setSubImg] = useState<string | null>(null);

  // 팀 목록 로드
  useEffect(() => {
    supabase
      .from('team_groups')
      .select('id, name')
      .eq('classroom_group_id', '5efa716c-b723-43e6-9778-86cfcee9f0ec')
      .order('name')
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          // 각 팀의 showcase 아이템명 가져오기
          const enriched = await Promise.all(data.map(async (t) => {
            const { data: ideas } = await supabase
              .from('team_ideas')
              .select('content')
              .eq('team_id', t.id)
              .eq('tool_id', 'showcase')
              .order('created_at', { ascending: false })
              .limit(1);
            let itemName: string | undefined;
            if (ideas && ideas[0]) {
              try { itemName = JSON.parse(ideas[0].content).productName; } catch {}
            }
            return { ...t, itemName };
          }));
          setTeams(enriched);
          setSelectedTeam(enriched[0].id);
        }
        setLoading(false);
      });
  }, []);

  // 선택된 팀의 showcase 로드
  useEffect(() => {
    if (!selectedTeam) return;
    setContentLoading(true);
    setNoContent(false);
    setPlan(null);

    supabase
      .from('team_ideas')
      .select('*')
      .eq('team_id', selectedTeam)
      .eq('tool_id', 'showcase')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          try {
            const parsed = JSON.parse(data[0].content);
            setPlan(parsed.plan);
            setProductName(parsed.productName || '');
          } catch {
            setNoContent(true);
          }
        } else {
          setNoContent(true);
        }
        setContentLoading(false);
      });
  }, [selectedTeam]);

  // Pexels 이미지 로드
  useEffect(() => {
    if (!productName) return;
    setMainImg(null);
    setSubImg(null);
    searchPexelsImage(productName).then(u => u && setMainImg(u));
    searchPexelsImage(productName + ' premium').then(u => u && setSubImg(u));
  }, [productName]);

  const currentTeamName = teams.find(t => t.id === selectedTeam)?.name || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">

      {/* 상단 컨트롤 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-white font-bold text-sm flex items-center gap-2">
            🎓 깍두기학교 · 졸업 발표
          </div>

          {/* 조 선택 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {teams.find(t => t.id === selectedTeam)?.itemName || currentTeamName || '조 선택'}
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                {teams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => { setSelectedTeam(team.id); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      team.id === selectedTeam
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {team.itemName ? `${team.itemName} (${team.name})` : team.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="pt-16 flex items-start justify-center py-8 px-4 min-h-screen">

        {contentLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : noContent || !plan ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white text-center">
            <div className="text-7xl mb-6">📋</div>
            <h2 className="text-2xl font-bold mb-2">{currentTeamName}</h2>
            <p className="text-gray-400 text-lg">아직 발표용 상세페이지가 올라오지 않았어요</p>
            <p className="text-gray-600 text-sm mt-3">학생이 5교시 도구에서 "발표용으로 올리기" 버튼을 눌러야 해요</p>
          </div>
        ) : (
          <div
            className="bg-white overflow-y-auto shadow-2xl rounded-t-2xl"
            style={{
              width: 420,
              maxHeight: '85vh',
              fontFamily: "'Pretendard','Noto Sans KR',sans-serif",
            }}
          >
            {/* 조 배지 */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-xs font-bold">
              🎓 {currentTeamName} · 졸업과제 발표
            </div>

            {/* 상단바 */}
            <div className="bg-white border-b border-gray-100 px-3 py-2 flex justify-between items-center text-[11px] text-gray-500">
              <span>← {plan.brandLine?.replace(/\s*(공식|스토어)$/, '') || productName}</span>
              <span>🔍 🛒</span>
            </div>

            {/* 메인 이미지 */}
            <div
              className="w-full flex items-center justify-center"
              style={{
                aspectRatio: '1',
                background: mainImg
                  ? `url('${mainImg}') center/cover`
                  : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #f59e0b 100%)',
              }}
            >
              {!mainImg && (
                <div className="text-center px-6">
                  <div className="text-5xl mb-3">🛍️</div>
                  <div className="text-2xl font-bold text-amber-900">{productName || plan.productTitle}</div>
                </div>
              )}
            </div>

            {/* 가격 */}
            <div className="px-4 py-3.5" style={{ borderBottom: '8px solid #f4f4f5' }}>
              <div className="text-[11px] text-gray-500 mb-0.5">{plan.brandLine}</div>
              <div className="text-[15px] font-semibold text-gray-900 leading-snug mb-2">{plan.productTitle}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 font-bold">{plan.discountPercent}%</span>
                <span className="text-[13px] text-gray-400 line-through">{plan.originalPrice?.toLocaleString()}원</span>
                <span className="text-[18px] font-bold text-gray-900">{plan.salePrice?.toLocaleString()}원</span>
              </div>
            </div>

            {/* 헤드라인 */}
            <div className="px-4 py-4" style={{ borderBottom: '8px solid #f4f4f5' }}>
              <div className="text-[22px] font-black text-gray-900 leading-[1.3] whitespace-pre-line">
                {plan.headline}
              </div>
            </div>

            {/* Pain Points */}
            {plan.painPoints && plan.painPoints.length > 0 && (
              <div className="px-4 py-4" style={{ borderBottom: '8px solid #f4f4f5' }}>
                {plan.painPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="text-red-500 text-lg shrink-0">😫</span>
                    <p className="text-[13px] text-gray-700 leading-relaxed">{typeof p === 'string' ? p : p.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 솔루션 */}
            <div className="bg-black text-white">
              <div className="px-4 pt-6 pb-4 text-center">
                <div className="text-[11px] text-amber-400 font-bold mb-1.5">{plan.solutionPrefix}</div>
                <div className="text-[24px] font-black leading-[1.1] whitespace-pre-line">{plan.solutionHeadline}</div>
              </div>
              {subImg && (
                <div className="w-full" style={{ aspectRatio: '1', background: `url('${subImg}') center/cover` }} />
              )}
            </div>

            {/* 특징 */}
            {plan.features && plan.features.length > 0 && (
              <div className="px-4 py-4" style={{ borderBottom: '8px solid #f4f4f5' }}>
                <h3 className="font-bold text-sm mb-3">✨ 이런 점이 특별해요</h3>
                {plan.features.map((f, i) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 rounded-xl">
                    <div className="font-bold text-sm text-gray-900">{f.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{f.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 리뷰 */}
            {plan.reviews && plan.reviews.length > 0 && (
              <div className="px-4 py-4" style={{ borderBottom: '8px solid #f4f4f5' }}>
                <h3 className="font-bold text-sm mb-3">⭐ 구매 후기</h3>
                {plan.reviews.map((r, i) => (
                  <div key={i} className="mb-2 p-3 bg-yellow-50 rounded-xl">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-yellow-500 text-xs">{r.stars || '⭐⭐⭐⭐⭐'}</span>
                      <span className="text-[10px] text-gray-500">{r.author}</span>
                    </div>
                    <p className="text-xs text-gray-700">{r.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="sticky bottom-0 bg-white border-t px-4 py-3">
              <div className="w-full py-3.5 bg-red-500 text-white font-bold text-center rounded-lg text-sm">
                {plan.stickyCtaText || '지금 구매하기'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
