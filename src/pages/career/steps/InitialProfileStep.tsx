import { useState } from 'react';
import { Briefcase, Home, ArrowRight } from 'lucide-react';

interface Props {
  initial: { desiredJob?: string; homeCountryJob?: string };
  onComplete: (data: { desiredJob?: string; homeCountryJob?: string }) => void;
}

/** Step 0-A: 나에 대해 — 희망 직무 + 모국 경력 (선택 입력) */
export default function InitialProfileStep({ initial, onComplete }: Props) {
  const [desiredJob, setDesiredJob] = useState(initial.desiredJob ?? '');
  const [homeCountryJob, setHomeCountryJob] = useState(initial.homeCountryJob ?? '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">시작 전에 조금만 알려주세요</h2>
      <p className="text-sm text-gray-500 mb-6">
        Tell us a little about yourself (optional)
      </p>

      {/* 희망 직무 */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Briefcase className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
          혹시 생각해둔 일이 있어요?
          <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
            Do you have a job in mind? (optional)
          </span>
        </label>
        <input
          type="text"
          value={desiredJob}
          onChange={(e) => setDesiredJob(e.target.value)}
          placeholder="예: 카페 바리스타 / 사무직 / IT / 모르겠어요"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* 모국 경력 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Home className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
          고향에서 무슨 일을 했어요?
          <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
            What did you do in your home country? (optional)
          </span>
        </label>
        <input
          type="text"
          value={homeCountryJob}
          onChange={(e) => setHomeCountryJob(e.target.value)}
          placeholder="예: 베트남 간호사 5년 / 태국 대학교 졸업"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* 안내 */}
      <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
        <p className="text-xs text-emerald-700">
          💡 둘 다 비워도 괜찮아요. 나중에 바꿀 수 있어요.
          <br />
          It's okay to leave both blank — you can change them later.
        </p>
      </div>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={() =>
          onComplete({
            desiredJob: desiredJob.trim() || undefined,
            homeCountryJob: homeCountryJob.trim() || undefined,
          })
        }
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
      >
        카드 고르기 시작
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
