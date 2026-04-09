import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { STRENGTH_CARDS } from '../../../data/career/strengthCards';
import type { StrengthCategory } from '../../../types/career/strengths';

interface Props {
  initialSelected: string[];
  onComplete: (cardIds: string[]) => void;
}

const CATEGORIES: { id: StrengthCategory; labelKo: string; labelEn: string; emoji: string }[] = [
  { id: 'people', labelKo: '사람', labelEn: 'People', emoji: '🤝' },
  { id: 'work',   labelKo: '일',   labelEn: 'Work',   emoji: '💼' },
  { id: 'head',   labelKo: '머리', labelEn: 'Head',   emoji: '💡' },
  { id: 'heart',  labelKo: '마음', labelEn: 'Heart',  emoji: '❤️' },
  { id: 'hands',  labelKo: '손',   labelEn: 'Hands',  emoji: '🛠️' },
  { id: 'korea',  labelKo: '한국', labelEn: 'Korea',  emoji: '🇰🇷' },
];

const REQUIRED_COUNT = 6;

/** Step 0-B: 카드 픽킹 게임 — 24장 중 6장 선택 */
export default function CardPickingStep({ initialSelected, onComplete }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [activeCategory, setActiveCategory] = useState<StrengthCategory>('people');

  const toggleCard = (cardId: string) => {
    setSelected((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= REQUIRED_COUNT) {
        // 이미 6장 다 골랐으면 경고
        return prev;
      }
      return [...prev, cardId];
    });
  };

  const categoryCards = STRENGTH_CARDS.filter((c) => c.category === activeCategory);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">내가 잘하는 것 6개 고르기</h2>
      <p className="text-sm text-gray-500 mb-4">
        Pick 6 things you're good at
      </p>

      {/* 진행 상황 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            선택: <strong className="text-emerald-600">{selected.length}</strong> / {REQUIRED_COUNT}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: REQUIRED_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-2 rounded-full transition-colors ${
                  i < selected.length ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
              activeCategory === cat.id
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.labelKo}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {categoryCards.map((card) => {
          const isSelected = selected.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleCard(card.id)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all transform ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 scale-95 shadow-inner'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-2">{card.emoji}</div>
              <div className="text-sm font-medium text-gray-800 leading-snug">
                {card.labelKo}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 leading-tight">
                {card.labelEn}
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <button
        type="button"
        disabled={selected.length !== REQUIRED_COUNT}
        onClick={() => onComplete(selected)}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {selected.length === REQUIRED_COUNT ? (
          <>
            다음으로
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          `${REQUIRED_COUNT - selected.length}개 더 골라주세요`
        )}
      </button>
    </div>
  );
}
