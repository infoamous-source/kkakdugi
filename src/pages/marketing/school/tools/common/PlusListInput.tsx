import { X } from 'lucide-react';

interface Props {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helpText?: string;
  max?: number;
  autoLoadedBadge?: boolean;
  addButtonText?: string;
  minItems?: number;
}

const BULLETS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

/**
 * 마케팅 학과 6개 AI 도구 공통 — +버튼으로 칸 추가하는 리스트 입력
 * mockup 확정안의 1️⃣ + ✖ + ➕ 패턴을 그대로 구현
 */
export function PlusListInput({
  label,
  items,
  onChange,
  placeholder,
  helpText,
  max = 5,
  autoLoadedBadge,
  addButtonText,
  minItems = 1,
}: Props) {
  const displayItems = items.length === 0 ? [''] : items;

  const updateItem = (i: number, value: string) => {
    const next = [...displayItems];
    next[i] = value;
    onChange(next);
  };

  const removeItem = (i: number) => {
    if (displayItems.length <= minItems) {
      const next = [...displayItems];
      next[i] = '';
      onChange(next);
      return;
    }
    onChange(displayItems.filter((_, idx) => idx !== i));
  };

  const addItem = () => {
    if (displayItems.length >= max) return;
    onChange([...displayItems, '']);
  };

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}
        {autoLoadedBadge && (
          <span className="ml-1.5 inline-block bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded font-semibold">
            ✅ 가져옴
          </span>
        )}
        {max > 1 && (
          <span className="ml-1.5 text-gray-400 font-normal">(여러 개 가능)</span>
        )}
      </label>
      {displayItems.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 mb-1.5">
          <span className="text-gray-400 text-xs w-5 shrink-0 text-center">
            {BULLETS[i] || `${i + 1}.`}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className={`flex-1 px-2.5 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kk-red ${
              autoLoadedBadge && item
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200'
            }`}
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="text-red-500 hover:text-red-700 text-sm px-1 shrink-0"
            aria-label="삭제"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {displayItems.length < max && (
        <button
          type="button"
          onClick={addItem}
          className="w-full py-1.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-100"
        >
          {addButtonText || `➕ 추가하기`}
        </button>
      )}
      {helpText && <p className="text-[10px] text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
}
