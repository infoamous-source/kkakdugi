import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Key } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchoolProgress } from '../../../../hooks/useSchoolProgress';
import {
  calculateRoas,
  getRoasPrescription,
} from '../../../../services/gemini/roasSimulatorService';
import { isGeminiEnabled } from '../../../../services/gemini/geminiClient';
import type { ROASInput, ROASOutput, ROASChannel } from '../../../../types/school';
import { getMyTeam, addTeamIdea } from '../../../../services/teamService';
import { addIdeaBoxItem } from '../../../../services/ideaBoxService';
import { TrafficLight } from './common/TrafficLight';
import { SaveToGemBoxButton } from './common/SaveToGemBoxButton';

type Phase = 'input' | 'loading' | 'result';

const CHANNEL_OPTIONS: { value: ROASChannel; label: string }[] = [
  { value: 'instagram', label: '📷 인스타그램' },
  { value: 'naver', label: '🔍 네이버' },
  { value: 'kakao', label: '💬 카카오톡' },
  { value: 'youtube', label: '▶️ 유튜브' },
];

const STATUS_THEME = {
  loss: {
    bg: 'bg-red-50',
    border: 'border-red-600',
    headText: 'text-red-900',
    subText: 'text-red-600',
  },
  breakeven: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    headText: 'text-amber-900',
    subText: 'text-amber-700',
  },
  profit: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-600',
    headText: 'text-emerald-900',
    subText: 'text-emerald-700',
  },
} as const;

function formatComma(n: number | string): string {
  const num = typeof n === 'string' ? Number(n.replace(/,/g, '')) : n;
  if (!Number.isFinite(num)) return '';
  return num.toLocaleString();
}

export default function ROASSimulatorTool() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasStamp, autoStamp, progress, saveSimulationResult } = useSchoolProgress();
  const completed = hasStamp('roas-simulator');
  const aiEnabled = isGeminiEnabled();

  // Phase
  const [phase, setPhase] = useState<Phase>('input');

  // Input — 3개만 (mockup 확정안)
  const [adSpendStr, setAdSpendStr] = useState('');
  const [revenueStr, setRevenueStr] = useState('');
  const [adChannel, setAdChannel] = useState<ROASChannel>('instagram');

  // Result
  const [output, setOutput] = useState<ROASOutput | null>(null);
  const [isMock, setIsMock] = useState(false);

  // Save to gem box
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [savedToGemBox, setSavedToGemBox] = useState(false);

  // Restore previous simulation
  useEffect(() => {
    if (!user) return;
    const prev = progress?.simulationResult;
    if (prev?.input && prev?.output) {
      setAdSpendStr(String(prev.input.adSpend));
      setRevenueStr(String(prev.input.revenue));
      setAdChannel(prev.input.adChannel);
      setOutput(prev.output);
      setPhase('result');
    }
  }, [user, progress]);

  // Load team
  useEffect(() => {
    if (!user) return;
    getMyTeam(user.id).then((info) => {
      if (info) setMyTeamId(info.team.id);
    });
  }, [user]);

  const adSpend = Number(adSpendStr.replace(/,/g, ''));
  const revenue = Number(revenueStr.replace(/,/g, ''));
  const isInputValid = adSpend > 0 && revenue >= 0;

  const handleSubmit = async () => {
    if (!isInputValid) return;
    setPhase('loading');
    try {
      const input: ROASInput = { adSpend, revenue, adChannel };
      const { output: result, isMock: mock } = await getRoasPrescription(input);
      setOutput(result);
      setIsMock(mock);
      setPhase('result');

      if (user) {
        await saveSimulationResult({
          completedAt: new Date().toISOString(),
          input,
          output: result,
        });
        autoStamp('roas-simulator');
      }
    } catch (err) {
      console.error('[ROASSimulator] Failed:', err);
      // 그래도 진행 — 클라이언트 사이드 계산은 무조건 가능
      const { roas, profit, status } = calculateRoas(adSpend, revenue);
      setOutput({
        roas,
        profit,
        status,
        prescription: '잠시 후 다시 시도해보세요',
        todoOne: '광고 사진을 새 걸로 바꿔보세요',
      });
      setIsMock(true);
      setPhase('result');
    }
  };

  const handleReset = () => {
    setOutput(null);
    setPhase('input');
  };

  const handleSaveToGemBox = async () => {
    if (!user || !output) return;
    const statusKo = output.status === 'loss' ? '손해' : output.status === 'breakeven' ? '본전' : '좋아요';
    const title = `📊 ROAS ${output.roas}× (${statusKo})`;
    const content = [
      `광고비: ${formatComma(adSpend)}원`,
      `매출: ${formatComma(revenue)}원`,
      `이익: ${formatComma(output.profit)}원`,
      `ROAS: ${output.roas}× (${statusKo})`,
      ``,
      `처방: ${output.prescription.replace(/\n/g, ' ')}`,
      `오늘 할 일: ${output.todoOne}`,
    ].join('\n');
    // 개인 보석함에 항상 저장
    await addIdeaBoxItem({
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'tool-result',
      title,
      content,
      toolId: 'roas-simulator',
    });
    // 팀이 있으면 팀 보석함에도
    if (myTeamId) {
      await addTeamIdea(myTeamId, user.id, user.name, '📊', 'roas-simulator', title, content);
    }
    setSavedToGemBox(true);
  };

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-kk-red bg-kk-cream px-2 py-0.5 rounded">
              6{t('school.curriculum.period', '교시')}
            </span>
            <h1 className="font-bold text-kk-brown">내 광고 점수 확인하기 💰</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 현재 위치 */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>📍 6/6 · 마지막 도구 🎓</div>
        </div>

        {/* AI 미연결 안내 */}
        {!aiEnabled && phase === 'input' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">
                  AI 비서가 연결되지 않았어요
                </h3>
                <p className="text-xs text-amber-700 mb-3">
                  ROAS 숫자는 그대로 계산돼요. AI를 연결하면 더 똑똑한 처방을 받을 수 있어요.
                </p>
                <button
                  onClick={() => navigate('/ai-welcome')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700"
                >
                  <Key className="w-3.5 h-3.5" /> API 키 연결하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ INPUT PHASE ══════ */}
        {phase === 'input' && (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-lg font-bold text-kk-brown mb-1">내 광고 점수 확인하기 💰</h2>
              <p className="text-xs text-gray-500 mb-4">
                광고비랑 매출만 넣으면 신호등으로 알려드려요
              </p>

              {/* 1. 광고비 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  1. 광고에 얼마 썼어요?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={adSpendStr ? formatComma(adSpendStr) : ''}
                    onChange={(e) => setAdSpendStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="예: 300,000"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    원
                  </span>
                </div>
              </div>

              {/* 2. 매출 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  2. 매출이 얼마였어요?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={revenueStr ? formatComma(revenueStr) : ''}
                    onChange={(e) => setRevenueStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="예: 540,000"
                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kk-red"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    원
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  💡 광고로 들어온 매출만 적어주세요
                </p>
              </div>

              {/* 3. 채널 */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  3. 어디에 광고했어요?
                </label>
                <select
                  value={adChannel}
                  onChange={(e) => setAdChannel(e.target.value as ROASChannel)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-kk-red"
                >
                  {CHANNEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isInputValid}
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                확인하기 →
              </button>
            </div>
          </>
        )}

        {/* ══════ LOADING PHASE ══════ */}
        {phase === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-kk-cream rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-kk-red animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-600">광고 점수를 계산 중이에요…</p>
          </div>
        )}

        {/* ══════ RESULT PHASE ══════ */}
        {phase === 'result' && output && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">결과</h3>

            {/* 큰 ROAS 숫자 */}
            <div className="text-center py-5 px-3 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold tracking-widest">
                ━━━ ROAS ━━━
              </div>
              <div className="text-[54px] font-black text-gray-900 leading-none mt-2">
                {output.roas}
                <span className="text-[32px]">×</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                광고비 1원 → 매출 <b className="text-gray-900">{output.roas}원</b>
              </div>
            </div>

            {/* 신호등 */}
            <TrafficLight status={output.status} />

            {/* 큰 한 줄 처방 */}
            {(() => {
              const theme = STATUS_THEME[output.status];
              return (
                <div className={`mt-2 ${theme.bg} border-2 ${theme.border} rounded-2xl p-5 text-center`}>
                  <div className={`text-[20px] font-black ${theme.headText} leading-tight whitespace-pre-line`}>
                    {output.status === 'loss' ? '👇 ' : output.status === 'profit' ? '🚀 ' : '✏️ '}
                    {output.prescription.split('\n')[0]}
                  </div>
                  {output.prescription.split('\n')[1] && (
                    <div className={`text-[13px] ${theme.subText} mt-1.5 font-semibold`}>
                      {output.prescription.split('\n').slice(1).join(' ')}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 오늘 할 일 1개 */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <div className="text-[11px] text-amber-800 font-bold">오늘 할 일</div>
                <div className="text-sm text-amber-900 font-bold mt-0.5">{output.todoOne}</div>
              </div>
            </div>

            {/* 자세한 숫자 */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wider">
                📊 자세한 숫자
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="text-[10px] text-gray-500">광고비</div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {formatComma(adSpend)}원
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="text-[10px] text-gray-500">매출</div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {formatComma(revenue)}원
                  </div>
                </div>
                <div
                  className={`p-2 rounded-md ${output.profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}
                >
                  <div
                    className={`text-[10px] ${output.profit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}
                  >
                    남은 돈 (이익)
                  </div>
                  <div
                    className={`text-sm font-extrabold ${output.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}
                  >
                    {formatComma(output.profit)}원
                  </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="text-[10px] text-gray-500">ROAS</div>
                  <div className="text-sm font-extrabold text-gray-900">{output.roas}×</div>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                📝 <b>계산:</b> 매출 {formatComma(revenue)} ÷ 광고비 {formatComma(adSpend)} ={' '}
                <b className="text-gray-900">{output.roas}</b>
                <br />
                광고비 1원 쓸 때마다 매출 {output.roas}원이 들어왔다는 뜻이에요.
                {output.status === 'breakeven' && ' 본전(2.0)에 살짝 못 미쳐요.'}
                {output.status === 'loss' && ' 본전(2.0)보다 낮아서 손해예요.'}
                {output.status === 'profit' && ' 본전(2.0)을 넘었어요!'}
              </div>
            </div>

            {/* AI 실패 안내 */}
            {isMock && aiEnabled && (
              <p className="text-[11px] text-amber-700 text-center">
                ⚠️ AI 처방을 가져오지 못해 예시를 보여드리고 있어요
              </p>
            )}

            {/* 다시 해보기 */}
            <div className="text-center pt-1">
              <button
                onClick={handleReset}
                className="text-[11px] text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
              >
                🔁 숫자 바꿔서 다시 해보기
              </button>
              <p className="text-[11px] text-gray-400 mt-1">
                광고비나 매출을 바꿔보면 신호등이 어떻게 변하는지 직접 느껴보세요
              </p>
            </div>

            {/* 보석함 저장 (개인 보석함, 팀 있으면 팀에도) */}
            <SaveToGemBoxButton
              onSave={handleSaveToGemBox}
              saved={savedToGemBox}
              className="mt-2"
            />

            {/* 졸업 CTA */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-400 rounded-xl p-3 text-center">
              <button
                onClick={() => navigate('/marketing/school/graduation-project')}
                className="text-amber-900 font-bold text-sm"
              >
                🎓 졸업하기 · 최종 과제 제출 →
              </button>
            </div>

            {completed && (
              <div className="text-center text-xs text-emerald-600 font-semibold">
                ✅ 6교시 도장 받았어요
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
