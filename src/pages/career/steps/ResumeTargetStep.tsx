import { useState } from 'react';
import { ArrowLeft, Sparkles, Building2, Briefcase } from 'lucide-react';
import type { ResumeTarget } from '../../../hooks/useResumeBuilderSession';

interface Props {
  initial?: ResumeTarget;
  desiredJobFromProfile?: string;
  onComplete: (target: ResumeTarget) => void;
  onBack: () => void;
}

/** Step 3: 자소서 타깃 입력 — 회사/직무/글자수 */
export default function ResumeTargetStep({
  initial,
  desiredJobFromProfile,
  onComplete,
  onBack,
}: Props) {
  const [company, setCompany] = useState(initial?.company ?? '');
  const [jobTitle, setJobTitle] = useState(initial?.jobTitle ?? desiredJobFromProfile ?? '');
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [growth, setGrowth] = useState(initial?.wordLimits?.growth ?? 800);
  const [personality, setPersonality] = useState(initial?.wordLimits?.personality ?? 500);
  const [motivation, setMotivation] = useState(initial?.wordLimits?.motivation ?? 800);
  const [aspiration, setAspiration] = useState(initial?.wordLimits?.aspiration ?? 500);

  const canSubmit = company.trim().length > 0 && jobTitle.trim().length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        어디에 낼 자소서예요?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Where are you applying to?
      </p>

      {/* 회사 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Building2 className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
          회사 이름 <span className="text-red-500">*</span>
          <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
            Company name
          </span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="예: 삼성전자, 동네 카페, 일반 기업 (모르면 '일반'이라고 써요)"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* 직무 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Briefcase className="w-4 h-4 inline mr-1 -mt-0.5 text-gray-400" />
          직무 <span className="text-red-500">*</span>
          <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
            Job title
          </span>
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="예: 바리스타, 사무 보조, 생산직"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* 산업 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          산업 (선택)
          <span className="block text-[11px] text-gray-400 font-normal mt-0.5">
            Industry (optional)
          </span>
        </label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder="예: 식음료, 제조, IT"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* 글자수 */}
      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <p className="text-sm font-medium text-emerald-800 mb-3">
          📝 항목별 글자 수 (회사가 정해줘요)
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: '성장 과정', value: growth, set: setGrowth },
            { label: '성격 장단점', value: personality, set: setPersonality },
            { label: '지원 동기', value: motivation, set: setMotivation },
            { label: '입사 후 포부', value: aspiration, set: setAspiration },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-gray-600 mb-1">{item.label}</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.value}
                  onChange={(e) => item.set(parseInt(e.target.value, 10) || 0)}
                  min={100}
                  max={3000}
                  step={100}
                  className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center"
                />
                <span className="text-gray-400">자</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 버튼 */}
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
          disabled={!canSubmit}
          onClick={() =>
            onComplete({
              company: company.trim(),
              jobTitle: jobTitle.trim(),
              industry: industry.trim() || undefined,
              wordLimits: { growth, personality, motivation, aspiration },
            })
          }
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          자소서 만들기
        </button>
      </div>
    </div>
  );
}
