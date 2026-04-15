import { useState } from 'react';
import { Pencil, RotateCcw, Check, X } from 'lucide-react';

interface Props {
  title: string;
  content: string;
  onSave: (newContent: string) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  /** 편집 불가 (읽기 전용) */
  readOnly?: boolean;
  className?: string;
}

/** 제목 + 내용 + 편집/재생성 버튼을 감싸는 공통 섹션 래퍼 */
export default function EditableSection({
  title,
  content,
  onSave,
  onRegenerate,
  isRegenerating,
  readOnly,
  className,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(content);

  const handleStartEdit = () => {
    setDraft(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(content);
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        {!readOnly && (
          <div className="flex items-center gap-1.5">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                  title="편집"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="p-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 text-purple-500 disabled:opacity-50"
                    title="이 섹션만 재생성"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  title="저장"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                  title="취소"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full min-h-[120px] px-3 py-2 text-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
        />
      ) : (
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {content || <span className="text-gray-400 italic">아직 내용이 없어요</span>}
        </div>
      )}
    </div>
  );
}
