import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Copy,
  Bookmark,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../lib/userProfile';
import {
  MANNER_SCENARIOS,
  WORKPLACE_TERMS,
  EMAIL_SITUATIONS,
  HONORIFIC_EXERCISES,
} from '../../data/career/workplaceMannerData';
import { generateBusinessEmail } from '../../services/career/businessEmailService';
import { evaluateHonorific } from '../../services/career/honorificService';
import type { HonorificEvaluation } from '../../services/career/honorificService';

// ─── localStorage helpers ─────────────────────────────────────────────────────

interface Cr04Progress {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
}

function loadProgress(userId: string): Cr04Progress {
  try {
    const raw = localStorage.getItem(`career-cr04-progress-${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {/* ignore */}
  return { a: false, b: false, c: false, d: false };
}

function saveProgress(userId: string, p: Cr04Progress) {
  try {
    localStorage.setItem(`career-cr04-progress-${userId}`, JSON.stringify(p));
  } catch {/* ignore */}
}

function loadBestScore(userId: string): number {
  try {
    const raw = localStorage.getItem(`career-cr04-manner-best`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem(`career-cr04-manner-best`, String(score));
  } catch {/* ignore */}
}

// ─── Category definitions ─────────────────────────────────────────────────────

const QUIZ_CATEGORIES = [
  { key: '인사 예절', label: '인사', emoji: '🤝' },
  { key: '회의 매너', label: '회의', emoji: '📋' },
  { key: '식사 자리', label: '식사', emoji: '🍽️' },
  { key: '직장 소통', label: '소통', emoji: '💬' },
];

const TERM_CATEGORIES = [
  { key: '일상', label: '일상' },
  { key: '회의', label: '회의' },
  { key: '식사', label: '식사' },
  { key: '인간관계', label: '인간관계' },
];

// ─── Module A: 비즈니스 매너 퀴즈 ────────────────────────────────────────────

interface QuizState {
  catIdx: number;
  questionIdx: number;
  selected: string | null;
  answered: boolean;
  correct: boolean;
  shaking: boolean;
  catScores: number[];   // score per category (0..40)
  allDone: boolean;
  totalScore: number;
}

function MannerQuiz({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<QuizState>({
    catIdx: 0,
    questionIdx: 0,
    selected: null,
    answered: false,
    correct: false,
    shaking: false,
    catScores: [0, 0, 0, 0],
    allDone: false,
    totalScore: 0,
  });

  // Per-category answered items: { [catKey]: number of answered }
  const [catAnswered, setCatAnswered] = useState<number[]>([0, 0, 0, 0]);
  const [catTab, setCatTab] = useState(0);

  const currentCatKey = QUIZ_CATEGORIES[catTab].key;
  const scenarios = MANNER_SCENARIOS.filter(s => s.category === currentCatKey);
  const questionIdx = catAnswered[catTab];
  const currentScenario = scenarios[questionIdx] ?? null;
  const catDone = questionIdx >= scenarios.length;

  const handleChoice = (choiceId: string) => {
    if (!currentScenario) return;
    if (state.answered && state.catIdx === catTab) return;

    const isCorrect = choiceId === currentScenario.correctId;

    setState(prev => ({
      ...prev,
      catIdx: catTab,
      questionIdx,
      selected: choiceId,
      answered: true,
      correct: isCorrect,
      shaking: !isCorrect,
    }));

    if (!isCorrect) {
      setTimeout(() => {
        setState(prev => ({ ...prev, shaking: false }));
      }, 600);
    }

    if (isCorrect) {
      setState(prev => {
        const newScores = [...prev.catScores];
        newScores[catTab] += currentScenario.points;
        return { ...prev, catScores: newScores };
      });
    }
  };

  const handleNext = () => {
    const newCatAnswered = [...catAnswered];
    newCatAnswered[catTab] = questionIdx + 1;
    setCatAnswered(newCatAnswered);
    setState(prev => ({
      ...prev,
      selected: null,
      answered: false,
      correct: false,
      shaking: false,
    }));

    // Check if all categories done
    const allDone = newCatAnswered.every((count, i) => {
      const catKey = QUIZ_CATEGORIES[i].key;
      return count >= MANNER_SCENARIOS.filter(s => s.category === catKey).length;
    });
    if (allDone) {
      setState(prev => {
        const newTotal = prev.catScores.reduce((a, b) => a + b, 0);
        saveBestScore(newTotal);
        return { ...prev, allDone: true, totalScore: newTotal };
      });
    }
  };

  const getGrade = (score: number) => {
    if (score >= 130) return { label: 'S', text: '한국 직장인 마스터 🏆', color: 'text-yellow-600' };
    if (score >= 100) return { label: 'A', text: '매너 좋은 동료 👍', color: 'text-emerald-600' };
    if (score >= 60)  return { label: 'B', text: '열심히 배우는 중 📚', color: 'text-blue-600' };
    return { label: 'C', text: '아직 서툴지만 괜찮아요 💪', color: 'text-orange-600' };
  };

  const currentAnswered = state.answered && state.catIdx === catTab && state.questionIdx === questionIdx;

  if (state.allDone) {
    const total = state.catScores.reduce((a, b) => a + b, 0);
    const grade = getGrade(total);
    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className={`text-6xl font-black mb-2 ${grade.color}`}>{grade.label}</div>
          <div className="text-2xl font-bold text-gray-800">{total} / 160점</div>
          <div className="text-lg mt-2 text-gray-600">{grade.text}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {QUIZ_CATEGORIES.map((cat, i) => (
            <div key={cat.key} className="bg-emerald-50 rounded-xl p-3 text-center">
              <div className="text-xl">{cat.emoji}</div>
              <div className="font-semibold text-sm text-gray-700">{cat.label}</div>
              <div className="text-emerald-700 font-bold">{state.catScores[i]} / 40</div>
            </div>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          완료 ✓
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUIZ_CATEGORIES.map((cat, i) => {
          const catKey = cat.key;
          const answered = catAnswered[i];
          const total = MANNER_SCENARIOS.filter(s => s.category === catKey).length;
          const done = answered >= total;
          return (
            <button
              key={cat.key}
              onClick={() => setCatTab(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                catTab === i
                  ? 'bg-emerald-600 text-white'
                  : done
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.emoji} {cat.label}
              {done && ' ✓'}
            </button>
          );
        })}
      </div>

      {catDone ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <div className="font-bold text-emerald-700 text-lg">
            {currentCatKey} 완료!
          </div>
          <div className="text-gray-600 mt-1">
            점수: {state.catScores[catTab]} / {scenarios.length * 10}점
          </div>
          <p className="text-sm text-gray-500 mt-3">다른 카테고리를 선택하세요</p>
        </div>
      ) : currentScenario ? (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{currentCatKey}</span>
            <span>{questionIdx + 1} / {scenarios.length}</span>
          </div>

          {/* Situation */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-gray-800 font-medium leading-relaxed">{currentScenario.situationKo}</p>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{currentScenario.situationEn}</p>
          </div>

          {/* Choices */}
          <div className="space-y-2">
            {currentScenario.choices.map(choice => {
              const isSelected = state.selected === choice.id && state.catIdx === catTab;
              const isThisCorrect = choice.id === currentScenario.correctId;
              let btnClass = 'w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ';

              if (currentAnswered) {
                if (isThisCorrect) {
                  btnClass += 'border-emerald-500 bg-emerald-50 text-emerald-800';
                } else if (isSelected) {
                  btnClass += `border-red-400 bg-red-50 text-red-700 ${state.shaking ? 'animate-shake' : ''}`;
                } else {
                  btnClass += 'border-gray-200 bg-gray-50 text-gray-500';
                }
              } else {
                btnClass += 'border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 active:scale-98';
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  disabled={currentAnswered}
                  className={btnClass}
                >
                  <span className="block">{choice.textKo}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{choice.textEn}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {currentAnswered && (
            <div className={`rounded-xl p-4 border ${state.correct ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`font-bold mb-2 ${state.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                {state.correct ? '✅ 정답입니다!' : '❌ 틀렸습니다'}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{currentScenario.explanationKo}</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{currentScenario.explanationEn}</p>
            </div>
          )}

          {currentAnswered && (
            <button
              onClick={handleNext}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              다음 →
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Module B: 직장 용어 사전 ─────────────────────────────────────────────────

function FlipCard({ term, isFlipped, onFlip }: {
  term: typeof WORKPLACE_TERMS[0];
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '1000px', height: '140px' }}
      onClick={onFlip}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
          className="bg-white border-2 border-gray-100 rounded-xl flex flex-col items-center justify-center p-3 shadow-sm"
        >
          <div className="text-2xl mb-1">{term.emoji}</div>
          <div className="font-bold text-gray-800 text-center text-sm">{term.termKo}</div>
          <div className="text-xs text-gray-400 mt-0.5">{term.termEn}</div>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}
          className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3 shadow-sm flex flex-col justify-center"
        >
          <p className="text-xs text-gray-700 font-medium leading-relaxed">{term.definitionKo}</p>
          <div className="mt-2 bg-white rounded-lg p-2 border border-emerald-100">
            <p className="text-xs text-emerald-700 leading-snug">💬 {term.exampleKo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkplaceTermsModule({ onComplete }: { onComplete: () => void }) {
  const [catTab, setCatTab] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const currentCat = TERM_CATEGORIES[catTab].key;
  const terms = WORKPLACE_TERMS.filter(t => t.category === currentCat);

  const handleFlip = (id: string) => {
    setFlipped(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    if (flipped.size >= 20 && !done) {
      setDone(true);
    }
  }, [flipped.size, done]);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TERM_CATEGORIES.map((cat, i) => (
          <button
            key={cat.key}
            onClick={() => setCatTab(i)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              catTab === i ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-500">
        카드를 탭하면 뒤집어서 뜻을 볼 수 있어요.
        <span className="ml-2 font-semibold text-emerald-700">{flipped.size} / 20개 완료</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {terms.map(term => (
          <FlipCard
            key={term.id}
            term={term}
            isFlipped={flipped.has(term.id)}
            onFlip={() => handleFlip(term.id)}
          />
        ))}
      </div>

      {done && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">🎉</div>
          <p className="font-bold text-emerald-700">20개 이상 학습 완료!</p>
          <button
            onClick={onComplete}
            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors"
          >
            완료 ✓
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Module C: 비즈니스 이메일 AI ─────────────────────────────────────────────

function BusinessEmailModule({
  onComplete,
  profile,
}: {
  onComplete: () => void;
  profile: ReturnType<typeof useUserProfile>;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<typeof EMAIL_SITUATIONS[0] | null>(null);
  const [recipientTitle, setRecipientTitle] = useState('');
  const [details, setDetails] = useState('');
  const [senderName, setSenderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  const handleGenerate = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateBusinessEmail(
        {
          situation: selected.nameKo,
          recipientTitle,
          details,
          senderName: senderName || '학생',
        },
        profile,
      );
      if (res) {
        setResult(res);
        setStep(3);
      } else {
        setError('이메일 생성에 실패했어요. 다시 시도해 주세요.');
      }
    } catch {
      setError('오류가 발생했어요. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `제목: ${result.subject}\n\n${result.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <>
          <p className="text-sm text-gray-600">어떤 상황의 이메일을 작성할까요?</p>
          <div className="grid grid-cols-2 gap-3">
            {EMAIL_SITUATIONS.map(sit => (
              <button
                key={sit.id}
                onClick={() => { setSelected(sit); setStep(2); }}
                className="bg-white border-2 border-gray-100 hover:border-emerald-400 rounded-xl p-3 text-left transition-colors"
              >
                <div className="text-2xl mb-1">{sit.emoji}</div>
                <div className="font-semibold text-sm text-gray-800">{sit.nameKo}</div>
                <div className="text-xs text-gray-400">{sit.nameEn}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && selected && (
        <>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-gray-500 flex items-center gap-1 hover:text-emerald-600"
          >
            ← 상황 다시 선택
          </button>
          <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">{selected.emoji}</span>
            <div>
              <div className="font-semibold text-emerald-800">{selected.nameKo}</div>
              <div className="text-xs text-gray-500">{selected.nameEn}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                수신자 직급·호칭 <span className="text-gray-400">(예: 팀장님, 인사담당자님)</span>
              </label>
              <input
                type="text"
                value={recipientTitle}
                onChange={e => setRecipientTitle(e.target.value)}
                placeholder="팀장님"
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                세부 내용 <span className="text-gray-400">(무엇을 전달할지 간단히)</span>
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder={`예: ${selected.exampleSubject}`}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                내 이름 (서명에 사용)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="홍길동"
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={loading || !recipientTitle || !details}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> AI 이메일 생성 중...</>
            ) : (
              '✉️ AI 이메일 생성하기'
            )}
          </button>
        </>
      )}

      {step === 3 && result && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="text-xs text-gray-500 mb-0.5">제목</div>
              <div className="font-semibold text-gray-800 text-sm">{result.subject}</div>
            </div>
            <div className="px-4 py-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {result.body}
              </pre>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-emerald-400 rounded-xl py-2.5 text-sm font-semibold text-gray-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? '복사됨 ✓' : '복사하기'}
            </button>
            {!done && (
              <button
                onClick={() => { setDone(true); onComplete(); }}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                완료 ✓
              </button>
            )}
          </div>

          <button
            onClick={() => { setStep(1); setSelected(null); setResult(null); setRecipientTitle(''); setDetails(''); setSenderName(''); }}
            className="w-full text-sm text-gray-500 hover:text-emerald-600 py-2 transition-colors"
          >
            ← 다른 이메일 작성하기
          </button>
        </>
      )}
    </div>
  );
}

// ─── Module D: 존댓말 변환 연습 ───────────────────────────────────────────────

function HonorificModule({
  onComplete,
  profile,
}: {
  onComplete: () => void;
  profile: ReturnType<typeof useUserProfile>;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<HonorificEvaluation | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const current = HONORIFIC_EXERCISES[idx];
  const total = HONORIFIC_EXERCISES.length;
  const completed = scores.length;
  const runningScore = completed > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / completed)
    : 0;

  const handleSubmit = async () => {
    if (!answer.trim() || !current) return;
    setLoading(true);
    try {
      const result = await evaluateHonorific(
        {
          casual: current.casualKo,
          studentAnswer: answer.trim(),
          correctAnswer: current.correctHonorificKo,
        },
        profile,
      );
      const eval_ = result ?? {
        score: 0,
        corrected: current.correctHonorificKo,
        explanation: '정답을 확인해 주세요.',
      };
      setEvaluation(eval_);
      setScores(prev => [...prev, eval_.score]);
    } catch {
      setEvaluation({
        score: 0,
        corrected: current.correctHonorificKo,
        explanation: '평가 중 오류가 발생했어요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const nextIdx = idx + 1;
    setAnswer('');
    setEvaluation(null);

    if (nextIdx >= total || scores.length >= 7) {
      setDone(true);
      onComplete();
      return;
    }
    setIdx(nextIdx);
  };

  const difficultyStars = (d: 1 | 2 | 3) => '⭐'.repeat(d);
  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500';

  if (done) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="text-4xl">🎓</div>
        <div className="font-bold text-xl text-gray-800">연습 완료!</div>
        <div className="text-gray-600">
          {completed}문제 완료 · 평균 {runningScore}점
        </div>
        <button
          onClick={onComplete}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
        >
          완료 ✓
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{idx + 1} / {total}번</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">{difficultyStars(current.difficulty)}</span>
          {completed > 0 && (
            <span className={`font-semibold ${scoreColor(runningScore)}`}>
              평균 {runningScore}점
            </span>
          )}
        </div>
      </div>

      {/* Casual sentence */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="text-xs text-gray-400 mb-1">반말 (Casual)</div>
        <p className="font-semibold text-gray-800">{current.casualKo}</p>
        <p className="text-xs text-gray-400 mt-1">{current.casualEn}</p>
      </div>

      {/* Hint */}
      <div className="text-xs text-gray-500 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-100">
        💡 힌트: {current.hintKo}
      </div>

      {/* Answer input */}
      {!evaluation && (
        <>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              존댓말로 바꿔보세요
            </label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="여기에 입력하세요..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !answer.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> AI 평가 중...</>
            ) : (
              '제출하기'
            )}
          </button>
        </>
      )}

      {/* Evaluation result */}
      {evaluation && (
        <>
          <div className={`rounded-xl p-4 border ${evaluation.score >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-lg">
                {evaluation.score}점
              </span>
              <span className={`text-sm font-semibold ${scoreColor(evaluation.score)}`}>
                {evaluation.score >= 80 ? '훌륭해요! 🎉' : evaluation.score >= 60 ? '잘했어요 👍' : '더 연습해요 💪'}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100 mb-2">
              <div className="text-xs text-gray-400 mb-0.5">모범 답안</div>
              <p className="text-sm font-medium text-gray-800">{evaluation.corrected}</p>
            </div>
            <p className="text-sm text-gray-600">{evaluation.explanation}</p>
          </div>

          <button
            onClick={handleNext}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {idx + 1 >= total || scores.length >= 6 ? '완료하기 ✓' : '다음 문제 →'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────

interface ModuleCardProps {
  emoji: string;
  titleKo: string;
  titleEn: string;
  duration: string;
  done: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ModuleCard({ emoji, titleKo, titleEn, duration, done, expanded, onToggle, children }: ModuleCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 text-sm">{titleKo}</div>
          <div className="text-xs text-gray-400">{titleEn} · {duration}</div>
        </div>
        {done ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        ) : expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-5 border-t border-gray-50 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkplaceMannerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();

  const userId = user?.id ?? 'guest';

  const [progress, setProgress] = useState<Cr04Progress>(() => loadProgress(userId));
  const [expanded, setExpanded] = useState<'a' | 'b' | 'c' | 'd' | null>('a');

  const markDone = (module: keyof Cr04Progress) => {
    const next = { ...progress, [module]: true };
    setProgress(next);
    saveProgress(userId, next);
  };

  const toggle = (module: 'a' | 'b' | 'c' | 'd') => {
    setExpanded(prev => (prev === module ? null : module));
  };

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <>
      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Back button */}
        <button
          onClick={() => navigate('/track/career')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          커리어 트랙으로
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-xl p-2.5">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-emerald-900">직장 문화</h1>
              <p className="text-sm text-emerald-700">Workplace Culture · cr-04</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 bg-emerald-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-emerald-800">{completedCount} / 4</span>
          </div>
        </div>

        {/* Module Cards */}
        <div className="space-y-3">
          {/* Module A */}
          <ModuleCard
            emoji="🤝"
            titleKo="비즈니스 매너 퀴즈"
            titleEn="Manner Quiz"
            duration="20분"
            done={progress.a}
            expanded={expanded === 'a'}
            onToggle={() => toggle('a')}
          >
            <MannerQuiz onComplete={() => { markDone('a'); }} />
          </ModuleCard>

          {/* Module B */}
          <ModuleCard
            emoji="📖"
            titleKo="직장 용어 사전"
            titleEn="Workplace Terms"
            duration="15분"
            done={progress.b}
            expanded={expanded === 'b'}
            onToggle={() => toggle('b')}
          >
            <WorkplaceTermsModule onComplete={() => { markDone('b'); }} />
          </ModuleCard>

          {/* Module C */}
          <ModuleCard
            emoji="✉️"
            titleKo="비즈니스 이메일 AI"
            titleEn="Business Email AI"
            duration="30분"
            done={progress.c}
            expanded={expanded === 'c'}
            onToggle={() => toggle('c')}
          >
            <BusinessEmailModule
              onComplete={() => { markDone('c'); }}
              profile={profile}
            />
          </ModuleCard>

          {/* Module D */}
          <ModuleCard
            emoji="💬"
            titleKo="존댓말 변환 연습"
            titleEn="Honorific Practice"
            duration="20분"
            done={progress.d}
            expanded={expanded === 'd'}
            onToggle={() => toggle('d')}
          >
            <HonorificModule
              onComplete={() => { markDone('d'); }}
              profile={profile}
            />
          </ModuleCard>
        </div>

        {/* All complete banner */}
        {completedCount === 4 && (
          <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="font-bold text-lg">직장 문화 마스터!</div>
            <p className="text-emerald-100 text-sm mt-1">
              4개 모듈을 모두 완료했어요. 한국 직장 문화 준비 완료!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
