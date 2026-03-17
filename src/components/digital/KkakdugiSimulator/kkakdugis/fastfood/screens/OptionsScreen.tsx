import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hapticTap, feedbackConfirm } from '../../../core/haptics';
import { Minus, Plus } from 'lucide-react';
import { optionGroups, formatPrice, calculateItemPrice, type MenuCategory } from '../data';
import type { OrderMenuItem, OrderOptionItem } from '../../../core/types';

interface Props {
  item: OrderMenuItem & { category: MenuCategory; color: string };
  onAdd: (options: OrderOptionItem[], quantity: number) => void;
  onBack: () => void;
}

export default function OptionsScreen({ item, onAdd, onBack }: Props) {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<OrderOptionItem[]>([]);
  const [quantity, setQuantity] = useState(1);

  const unitPrice = calculateItemPrice(item, selectedOptions);
  const totalPrice = unitPrice * quantity;

  const toggleOption = (opt: OrderOptionItem, groupId: string) => {
    hapticTap();
    const group = optionGroups.find((g) => g.id === groupId);
    if (!group) return;

    const isSelected = selectedOptions.some((o) => o.id === opt.id);
    if (isSelected) {
      setSelectedOptions((prev) => prev.filter((o) => o.id !== opt.id));
    } else {
      if (!group.multiSelect) {
        const groupOptionIds = group.options.map((o) => o.id);
        setSelectedOptions((prev) => [
          ...prev.filter((o) => !groupOptionIds.includes(o.id)),
          opt,
        ]);
      } else {
        setSelectedOptions((prev) => [...prev, opt]);
      }
    }
  };

  const optionLabelMap: Record<string, string> = {
    'kkakdugi.screens.options.sizeUp':        '사이즈업',
    'kkakdugi.screens.options.sauce':         '소스 추가',
    'kkakdugi.screens.options.topping':       '추가 토핑',
    'kkakdugi.screens.options.friesLarge':    '감자 라지로 변경',
    'kkakdugi.screens.options.drinkLarge':    '음료 라지로 변경',
    'kkakdugi.screens.options.ketchup':       '케첩',
    'kkakdugi.screens.options.mustard':       '머스타드',
    'kkakdugi.screens.options.sweetChili':    '스위트칠리',
    'kkakdugi.screens.options.garlicDipping': '갈릭디핑',
    'kkakdugi.screens.options.addCheese':     '치즈 추가',
    'kkakdugi.screens.options.addBacon':      '베이컨 추가',
    'kkakdugi.screens.options.addPatty':      '패티 추가',
  };

  const label = (key: string) => t(key, optionLabelMap[key] ?? key);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FFF9F0' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: '#8B0000' }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: '#FFC107', border: '1px solid rgba(255,193,7,0.4)' }}
        >
          {t('kkakdugi.nav.back', '취소')}
        </button>
        <span className="font-bold text-sm tracking-widest" style={{ color: 'white' }}>
          옵션 선택
        </span>
        <div style={{ width: 60 }} />
      </div>

      {/* Selected item info */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: 'white', borderBottom: '1px solid #F0E0D0' }}
      >
        <div
          className="rounded flex items-center justify-center flex-shrink-0"
          style={{ width: 56, height: 56, backgroundColor: item.color }}
        >
          <span className="font-bold select-none" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>
            {item.nameKey.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: '#1A1A1A', fontSize: 14 }}>
            {item.nameKey}
          </p>
          <p style={{ color: '#999999', fontSize: 12 }}>
            기본 {formatPrice(item.price)}원
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold" style={{ color: '#CC0000', fontSize: 16 }}>
            {formatPrice(unitPrice)}원
          </p>
          {selectedOptions.length > 0 && (
            <p style={{ color: '#999999', fontSize: 10 }}>
              +{formatPrice(unitPrice - item.price)}원
            </p>
          )}
        </div>
      </div>

      {/* Options list */}
      <div className="flex-1 overflow-y-auto">
        {optionGroups.map((group) => (
          <div key={group.id}>
            {/* Group header */}
            <div
              className="flex items-center px-4 py-2"
              style={{ backgroundColor: '#FFF0E8', borderBottom: '1px solid #F0E0D0' }}
            >
              <span className="font-bold" style={{ color: '#555555', fontSize: 12 }}>
                {label(group.titleKey)}
              </span>
              <span
                className="ml-2 text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: group.required ? '#CC0000' : '#F0E0D0',
                  color: group.required ? 'white' : '#999999',
                  fontSize: 9,
                }}
              >
                {group.required ? '필수' : '선택'}
              </span>
              {group.multiSelect && (
                <span
                  className="ml-1 text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#FFC107', color: '#1A1A1A', fontSize: 9 }}
                >
                  중복가능
                </span>
              )}
            </div>

            {/* Options */}
            {group.options.map((opt, i) => {
              const isSelected = selectedOptions.some((o) => o.id === opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt, group.id)}
                  className="w-full flex items-center px-4 py-3 transition-colors text-left"
                  style={{
                    backgroundColor: isSelected ? '#FFF9F0' : 'white',
                    borderBottom: i < group.options.length - 1 ? '1px solid #FFF0E8' : '1px solid #F0E0D0',
                  }}
                >
                  {/* Radio/checkbox indicator */}
                  <div
                    className="flex-shrink-0 rounded-full mr-3 flex items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      border: `2px solid ${isSelected ? '#CC0000' : '#DDD'}`,
                      backgroundColor: isSelected ? '#CC0000' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: 'white' }} />
                    )}
                  </div>

                  <span
                    className="flex-1 text-sm"
                    style={{ color: isSelected ? '#1A1A1A' : '#555555', fontWeight: isSelected ? 600 : 400 }}
                  >
                    {label(opt.nameKey)}
                  </span>

                  <span
                    className="font-medium text-sm"
                    style={{ color: opt.priceAdd > 0 ? '#CC0000' : '#999999' }}
                  >
                    {opt.priceAdd > 0 ? `+${formatPrice(opt.priceAdd)}원` : '무료'}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Selected options summary */}
        {selectedOptions.length > 0 && (
          <div className="mx-4 my-3 px-3 py-2 rounded" style={{ backgroundColor: '#FFF0E8' }}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ color: '#555555', fontSize: 11, fontWeight: 600 }}>선택된 옵션</span>
              <button
                onClick={() => setSelectedOptions([])}
                style={{ color: '#CC0000', fontSize: 10 }}
              >
                초기화
              </button>
            </div>
            <p style={{ color: '#999999', fontSize: 11 }}>
              {selectedOptions.map((o) => label(o.nameKey)).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Bottom: quantity + add button */}
      <div
        className="flex-shrink-0 p-4"
        style={{ backgroundColor: 'white', borderTop: '2px solid #F0E0D0' }}
      >
        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>수량</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex items-center justify-center rounded transition-colors"
              style={{
                width: 32,
                height: 32,
                border: '1.5px solid #DDD',
                backgroundColor: quantity <= 1 ? '#FFF0E8' : 'white',
                color: quantity <= 1 ? '#DDD' : '#555555',
              }}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span
              className="font-bold"
              style={{ color: '#1A1A1A', fontSize: 18, minWidth: 28, textAlign: 'center' }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex items-center justify-center rounded transition-colors"
              style={{ width: 32, height: 32, border: '1.5px solid #CC0000', backgroundColor: 'white', color: '#CC0000' }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 rounded font-bold text-sm transition-opacity hover:opacity-75"
            style={{ backgroundColor: '#FFF0E8', color: '#555555' }}
          >
            {t('kkakdugi.screens.options.cancel', '취소')}
          </button>
          <button
            onClick={() => { feedbackConfirm(); onAdd(selectedOptions, quantity); }}
            className="flex-1 py-3.5 rounded font-bold text-sm transition-all active:scale-[0.97]"
            style={{ backgroundColor: '#8B0000', color: 'white' }}
          >
            <span style={{ color: '#FFC107' }}>{formatPrice(totalPrice)}원 </span>
            {t('kkakdugi.screens.options.addToCart', '담기')}
          </button>
        </div>
      </div>
    </div>
  );
}
