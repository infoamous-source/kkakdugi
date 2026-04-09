import { useState } from 'react';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

interface Props {
  initial?: string;
  onComplete: (nickname: string | undefined) => void;
  onBack: () => void;
}

/** Step 0-C: 별명 한 줄 (선택) */
export default function NicknameStep({ initial, onComplete, onBack }: Props) {
  const [nickname, setNickname] = useState(initial ?? '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">나의 별명</h2>
      <p className="text-sm text-gray-500 mb-5">My nickname in one line</p>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        친구들이 본인을 한 마디로 뭐라고 불러요?
        <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
          What do your friends call you in one word?
        </span>
      </label>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="예: 걸어다니는 백과사전 / 분위기 메이커"
        maxLength={40}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2"
      />
      <p className="text-[11px] text-gray-400 mb-6">
        모르겠으면 그냥 건너뛰어도 돼요 · It's okay to skip
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onComplete(undefined)}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 flex items-center gap-1 text-sm"
        >
          <SkipForward className="w-4 h-4" />
          건너뛰기
        </button>
        <button
          type="button"
          onClick={() => onComplete(nickname.trim() || undefined)}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          다음
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
