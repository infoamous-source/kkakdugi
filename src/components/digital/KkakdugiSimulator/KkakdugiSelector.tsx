import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Lock } from 'lucide-react';
import { kkakdugiConfigs } from './registry';
import type { KkakdugiType, KkakdugiConfig, KkakdugiCategory } from './core/types';

const koNameFallback: Record<string, string> = {
  cafe: '카페',
  fastfood: '패스트푸드',
  hospital: '병원 접수',
  bank: '은행',
  government: '공공기관 서류',
  cinema: '영화관',
  convenience: '편의점',
  airport: '공항 체크인',
};

const koDescFallback: Record<string, string> = {
  cafe: '카페에서 음료 주문하기',
  fastfood: '햄버거 세트 주문하기',
  hospital: '병원 접수 및 수납하기',
  bank: '은행 ATM 및 번호표 발급',
  government: '주민등록등본 등 서류 발급',
  cinema: '영화 예매 및 좌석 선택',
  convenience: '편의점 무인 계산대 이용',
  airport: '비행기 셀프 체크인하기',
};

interface KkakdugiSelectorProps {
  onSelectKkakdugi: (type: KkakdugiType) => void;
  completedKkakdugis?: KkakdugiType[];
}

type FilterCategory = 'all' | KkakdugiCategory;

const categoryFilters: { id: FilterCategory; labelKey: string; fallback: string }[] = [
  { id: 'all', labelKey: 'kkakdugi.selector.filter.all', fallback: '전체' },
  { id: 'food', labelKey: 'kkakdugi.selector.filter.food', fallback: '음식점' },
  { id: 'public', labelKey: 'kkakdugi.selector.filter.public', fallback: '공공서비스' },
  { id: 'entertainment', labelKey: 'kkakdugi.selector.filter.entertainment', fallback: '엔터테인먼트' },
  { id: 'transport', labelKey: 'kkakdugi.selector.filter.transport', fallback: '교통' },
];

function KkakdugiCard({
  config,
  isCompleted,
  onClick,
}: {
  config: KkakdugiConfig;
  isCompleted: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();

  const categoryLabel: Record<string, string> = {
    food: t('kkakdugi.selector.filter.food', '음식점'),
    public: t('kkakdugi.selector.filter.public', '공공서비스'),
    entertainment: t('kkakdugi.selector.filter.entertainment', '엔터테인먼트'),
    transport: t('kkakdugi.selector.filter.transport', '교통'),
  };

  const categoryColorClass: Record<string, string> = {
    food: 'bg-orange-100 text-orange-700',
    public: 'bg-teal-100 text-teal-700',
    entertainment: 'bg-purple-100 text-purple-700',
    transport: 'bg-sky-100 text-sky-700',
  };

  const isDisabled = !!config.comingSoon;

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        'relative flex flex-col items-start text-left w-full',
        'rounded-xl border bg-white transition-all',
        'p-4 gap-3',
        isDisabled
          ? 'opacity-60 cursor-not-allowed border-gray-200'
          : 'border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer active:scale-[0.98]',
        isCompleted && !isDisabled
          ? 'ring-2 ring-green-300 border-green-200'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* 완료 배지 */}
      {isCompleted && (
        <span className="absolute top-2 right-2 bg-green-100 text-green-700 rounded-full p-1">
          <Check size={12} />
        </span>
      )}

      {/* Coming Soon 배지 */}
      {isDisabled && (
        <span className="absolute top-2 right-2 flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
          <Lock size={10} />
          {t('kkakdugi.selector.comingSoon', '준비 중')}
        </span>
      )}

      {/* 아이콘 */}
      <div className="text-4xl leading-none">{config.icon}</div>

      {/* 이름 & 설명 */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-snug mb-1">
          {t(config.nameKey, koNameFallback[config.id] || config.id)}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {t(config.descriptionKey, koDescFallback[config.id] || '')}
        </p>
      </div>

      {/* 하단: 카테고리 */}
      <div className="flex items-center w-full">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColorClass[config.category] ?? 'bg-gray-100 text-gray-600'}`}
        >
          {categoryLabel[config.category] ?? config.category}
        </span>
      </div>
    </button>
  );
}

export default function KkakdugiSelector({ onSelectKkakdugi, completedKkakdugis = [] }: KkakdugiSelectorProps) {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const filteredConfigs =
    activeFilter === 'all'
      ? kkakdugiConfigs
      : kkakdugiConfigs.filter(c => c.category === activeFilter);

  return (
    <div className="w-full">
      {/* 섹션 헤더 */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {t('kkakdugi.selector.title', '연습할 키오스크를 선택하세요')}
        </h2>
        <p className="text-sm text-gray-500">
          {t('kkakdugi.selector.subtitle', '다양한 장소의 키오스크 사용법을 익혀보세요')}
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {categoryFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeFilter === filter.id
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-700',
            ].join(' ')}
          >
            {t(filter.labelKey, filter.fallback)}
          </button>
        ))}
      </div>

      {/* 키오스크 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        {filteredConfigs.map(config => (
          <KkakdugiCard
            key={config.id}
            config={config}
            isCompleted={completedKkakdugis.includes(config.id)}
            onClick={() => onSelectKkakdugi(config.id)}
          />
        ))}
      </div>

      {filteredConfigs.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          {t('kkakdugi.selector.noResults', '해당 카테고리에 키오스크가 없습니다')}
        </div>
      )}
    </div>
  );
}
