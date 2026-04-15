import { GraduationCap } from 'lucide-react';

interface Props {
  /** 어떤 학교 데이터가 반영됐는지 요약 */
  summary: string;
  /** 숨기기 */
  onDismiss?: () => void;
}

/** 학교 데이터가 프리필되었을 때 표시하는 배너 */
export default function SchoolDataBanner({ summary, onDismiss }: Props) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-purple-800">
            학교에서 만든 전략이 반영되었어요
          </p>
          <p className="text-xs text-purple-600 mt-0.5">{summary}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-purple-400 hover:text-purple-600"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
