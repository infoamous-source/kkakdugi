import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../lib/userProfile';
import { useResumeBuilderSession } from '../../hooks/useResumeBuilderSession';
import {
  JOB_PLATFORMS,
  VISA_JOB_GUIDE,
  DOCUMENT_CHECKLIST_ROUNDS,
} from '../../data/career/jobSearchData';
import type { PlatformCategory } from '../../data/career/jobSearchData';
import { generateElevatorPitch } from '../../services/career/elevatorPitchService';

// ─── 타입 ───────────────────────────────────────────────────────

interface ModuleProgress {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
}

// ─── 유틸 ───────────────────────────────────────────────────────

function getStorageKey(userId: string | undefined) {
  return `career-cr03-progress-${userId ?? 'guest'}`;
}

function loadProgress(userId: string | undefined): ModuleProgress {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return { a: false, b: false, c: false, d: false };
    return JSON.parse(raw);
  } catch {
    return { a: false, b: false, c: false, d: false };
  }
}

function saveProgress(userId: string | undefined, progress: ModuleProgress) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
}

// ─── 메인 페이지 ────────────────────────────────────────────────

export default function JobSearchGuidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = useUserProfile();
  const { session } = useResumeBuilderSession(user?.id);

  const [progress, setProgress] = useState<ModuleProgress>(() =>
    loadProgress(user?.id),
  );
  const [openModule, setOpenModule] = useState<'a' | 'b' | 'c' | 'd' | null>('a');

  // progress 변경 시 localStorage 저장
  useEffect(() => {
    saveProgress(user?.id, progress);
  }, [user?.id, progress]);

  const markComplete = useCallback(
    (module: keyof ModuleProgress) => {
      setProgress((prev) => ({ ...prev, [module]: true }));
    },
    [],
  );

  const toggleModule = (module: 'a' | 'b' | 'c' | 'd') => {
    setOpenModule((prev) => (prev === module ? null : module));
  };

  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/track/career')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
      </div>

      {/* 헤더 */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 mb-6">
        <Search className="w-6 h-6 text-emerald-600 mb-2" />
        <h1 className="text-xl font-bold text-gray-800 mb-1">취업 정보</h1>
        <p className="text-sm text-gray-500">Job Search Guide</p>
        {completedCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-1.5 bg-emerald-100 rounded-full flex-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
            <span className="text-xs text-emerald-700 font-medium">{completedCount}/4</span>
          </div>
        )}
      </div>

      {/* 모듈 A */}
      <ModuleCard
        id="a"
        emoji="🔍"
        title="취업 플랫폼 탐색"
        titleEn="Job Platforms"
        duration="5분"
        isComplete={progress.a}
        isOpen={openModule === 'a'}
        onToggle={() => toggleModule('a')}
      >
        <ModuleA onComplete={() => markComplete('a')} />
      </ModuleCard>

      {/* 모듈 B */}
      <ModuleCard
        id="b"
        emoji="📋"
        title="비자별 취업 가이드"
        titleEn="Visa Guide"
        duration="5분"
        isComplete={progress.b}
        isOpen={openModule === 'b'}
        onToggle={() => toggleModule('b')}
      >
        <ModuleB
          userVisaType={profile?.visaType ?? null}
          onComplete={() => markComplete('b')}
        />
      </ModuleCard>

      {/* 모듈 C */}
      <ModuleCard
        id="c"
        emoji="🎮"
        title="서류 준비 게임"
        titleEn="Document Checklist Game"
        duration="7분"
        isComplete={progress.c}
        isOpen={openModule === 'c'}
        onToggle={() => toggleModule('c')}
      >
        <ModuleC onComplete={() => markComplete('c')} />
      </ModuleCard>

      {/* 모듈 D */}
      <ModuleCard
        id="d"
        emoji="🤖"
        title="AI 30초 자기소개"
        titleEn="AI Elevator Pitch"
        duration="3분"
        isComplete={progress.d}
        isOpen={openModule === 'd'}
        onToggle={() => toggleModule('d')}
      >
        <ModuleD
          profile={profile}
          session={session}
          onComplete={() => markComplete('d')}
        />
      </ModuleCard>

      {/* 완료 배너 */}
      {completedCount === 4 && (
        <div className="mt-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="font-bold text-emerald-800 mb-1">모든 모듈을 완료했어요!</p>
          <p className="text-xs text-emerald-600">All modules complete! 취업 준비 완성이에요.</p>
        </div>
      )}
    </div>
  );
}

// ─── 모듈 카드 래퍼 ──────────────────────────────────────────────

function ModuleCard({
  emoji,
  title,
  titleEn,
  duration,
  isComplete,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  emoji: string;
  title: string;
  titleEn: string;
  duration: string;
  isComplete: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-800 text-sm leading-tight">{title}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {titleEn} · {duration}
          </div>
        </div>
        {isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        ) : (
          isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── 모듈 A: 취업 플랫폼 탐색 ───────────────────────────────────

const CATEGORY_LABELS: { key: 'all' | PlatformCategory; label: string; labelEn: string }[] = [
  { key: 'government', label: '정부공인', labelEn: 'Government' },
  { key: 'foreigner',  label: '외국인특화', labelEn: 'Foreigner' },
  { key: 'popular',   label: '인기',  labelEn: 'Popular' },
  { key: 'all',       label: '전체',  labelEn: 'All' },
];

function ModuleA({ onComplete }: { onComplete: () => void }) {
  const [activeCategory, setActiveCategory] = useState<'all' | PlatformCategory>('government');
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  const filteredPlatforms =
    activeCategory === 'all'
      ? JOB_PLATFORMS
      : JOB_PLATFORMS.filter((p) => p.category === activeCategory);

  const handleVisit = (id: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setVisitedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= 2) {
        onComplete();
      }
      return next;
    });
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        구직 사이트를 방문해봐요. 2개 이상 방문하면 완료예요!
        <br />
        <span className="text-gray-400">Visit 2+ platforms to complete this module.</span>
      </p>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORY_LABELS.map(({ key, label, labelEn }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCategory(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === key
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            <span className="ml-1 opacity-70">{labelEn}</span>
          </button>
        ))}
      </div>

      {/* 방문 카운트 */}
      {visitedIds.size > 0 && (
        <div className="mb-3 text-xs text-emerald-700 font-medium">
          ✅ {visitedIds.size}개 방문했어요 · {visitedIds.size} visited
        </div>
      )}

      {/* 플랫폼 카드 그리드 */}
      <div className="grid grid-cols-2 gap-2">
        {filteredPlatforms.map((platform) => {
          const visited = visitedIds.has(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => handleVisit(platform.id, platform.url)}
              className={`text-left p-3 rounded-xl border transition-all ${
                visited
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-xl">{platform.emoji}</span>
                <ExternalLink className={`w-3.5 h-3.5 mt-0.5 ${visited ? 'text-emerald-500' : 'text-gray-400'}`} />
              </div>
              <div className="font-semibold text-gray-800 text-xs leading-tight">{platform.name}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{platform.nameEn}</div>
              <p className="text-[10px] text-gray-500 mt-1.5 leading-snug line-clamp-2">
                {platform.description}
              </p>
              {platform.isGovernment && (
                <span className="mt-1.5 inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-medium">
                  공인
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 모듈 B: 비자별 취업 가이드 ─────────────────────────────────

/** VisaType enum ('E7') → VISA_JOB_GUIDE visa string ('E-7') */
function normalizeVisaCode(raw: string | null): string | null {
  if (!raw) return null;
  // Insert dash: E7 → E-7, D2 → D-2, H2 → H-2, F4 → F-4, etc.
  const match = raw.match(/^([A-Z]+)(\d.*)$/);
  if (!match) return null;
  const normalized = `${match[1]}-${match[2]}`;
  const found = VISA_JOB_GUIDE.find((v) => v.visa === normalized);
  return found ? normalized : null;
}

function ModuleB({
  userVisaType,
  onComplete,
}: {
  userVisaType: string | null;
  onComplete: () => void;
}) {
  const [selectedVisa, setSelectedVisa] = useState<string | null>(
    normalizeVisaCode(userVisaType),
  );
  const [completed, setCompleted] = useState(false);

  const selectedInfo = VISA_JOB_GUIDE.find((v) => v.visa === selectedVisa);

  const handleSelect = (visa: string) => {
    setSelectedVisa(visa);
    if (!completed) {
      setCompleted(true);
      onComplete();
    }
  };

  const platformNameById = (id: string) => {
    const p = JOB_PLATFORMS.find((pl) => pl.id === id);
    return p ? `${p.emoji} ${p.name}` : id;
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        내 비자 종류를 선택하면 취업 가능한 직종과 주의사항을 알 수 있어요.
        <br />
        <span className="text-gray-400">Select your visa type to see what jobs you can do.</span>
      </p>

      {/* 비자 선택 pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {VISA_JOB_GUIDE.map((info) => (
          <button
            key={info.visa}
            type="button"
            onClick={() => handleSelect(info.visa)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedVisa === info.visa
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
            }`}
          >
            <span>{info.emoji}</span>
            <span>{info.visa}</span>
          </button>
        ))}
      </div>

      {/* 선택된 비자 정보 */}
      {selectedInfo && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 비자 이름 */}
          <div className="p-3 bg-emerald-50 rounded-xl">
            <div className="text-base font-bold text-emerald-800">
              {selectedInfo.emoji} {selectedInfo.visa} — {selectedInfo.nameKo}
            </div>
            <div className="text-xs text-emerald-600 mt-0.5">{selectedInfo.nameEn}</div>
          </div>

          {/* 가능한 직종 */}
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              ✅ 일할 수 있는 직종 · Allowed Jobs
            </div>
            <ul className="space-y-1">
              {selectedInfo.allowedJobs.map((job, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {job}
                </li>
              ))}
            </ul>
          </div>

          {/* 제한사항 */}
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              ⚠️ 주의사항 · Restrictions
            </div>
            <ul className="space-y-1">
              {selectedInfo.restrictions.map((r, i) => (
                <li key={i} className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">!</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* 추천 플랫폼 */}
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2">
              🔗 추천 구직 사이트 · Recommended Platforms
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedInfo.recommendedPlatforms.map((id) => (
                <span
                  key={id}
                  className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                >
                  {platformNameById(id)}
                </span>
              ))}
            </div>
          </div>

          {/* 팁 */}
          <div>
            <div className="text-xs font-bold text-gray-700 mb-2">
              💡 취업 팁 · Tips
            </div>
            <ul className="space-y-1.5">
              {selectedInfo.tips.map((tip, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!selectedVisa && (
        <div className="text-center py-8 text-gray-400 text-xs">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
          위에서 비자 종류를 선택해주세요
          <br />Select your visa type above
        </div>
      )}
    </div>
  );
}

// ─── 모듈 C: 서류 준비 게임 ──────────────────────────────────────

function ModuleC({ onComplete }: { onComplete: () => void }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);

  const round = DOCUMENT_CHECKLIST_ROUNDS[roundIdx];
  const totalRounds = DOCUMENT_CHECKLIST_ROUNDS.length;

  const toggleDoc = (id: string) => {
    if (revealed) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReveal = () => {
    // 점수 계산: 맞게 선택한 필수 서류 수 / 전체 필수 서류 수
    const requiredSet = new Set(round.requiredDocs);
    const correctlySelected = [...selectedIds].filter((id) => requiredSet.has(id)).length;
    const falsePositives = [...selectedIds].filter((id) => !requiredSet.has(id)).length;
    const score = Math.max(
      0,
      Math.round(((correctlySelected - falsePositives) / requiredSet.size) * 100),
    );
    setScores((prev) => [...prev, score]);
    setRevealed(true);
  };

  const handleNext = () => {
    if (roundIdx < totalRounds - 1) {
      setRoundIdx((i) => i + 1);
      setSelectedIds(new Set());
      setRevealed(false);
    } else {
      setAllDone(true);
      onComplete();
    }
  };

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  if (allDone) {
    return (
      <div className="text-center py-6">
        <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
        <p className="font-bold text-gray-800 mb-1">게임 완료!</p>
        <p className="text-xs text-gray-500 mb-4">All 3 rounds complete!</p>
        <div className="inline-block px-6 py-3 bg-emerald-50 rounded-xl mb-4">
          <div className="text-xs text-emerald-600 mb-1">평균 점수</div>
          <div className="text-3xl font-bold text-emerald-700">{avgScore}점</div>
        </div>
        <div className="flex gap-1.5 justify-center">
          {scores.map((s, i) => (
            <div key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-lg text-gray-600">
              R{i + 1}: {s}점
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 라운드 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{round.emoji}</span>
          <div>
            <div className="text-sm font-bold text-gray-800">{round.jobType}</div>
            <div className="text-xs text-gray-400">{round.jobTypeEn}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          라운드 {roundIdx + 1} / {totalRounds}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        이 직종에 지원할 때 필요한 서류를 선택해요. 어떤 것들이 필요할까요?
        <br />
        <span className="text-gray-400">Select all documents needed for this job type.</span>
      </p>

      {/* 서류 카드 그리드 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {round.allDocs.map((doc) => {
          const isSelected = selectedIds.has(doc.id);
          const isRequired = round.requiredDocs.includes(doc.id);

          let cardClass = 'border-gray-200 bg-white hover:border-emerald-300';
          if (revealed) {
            if (isRequired && isSelected) cardClass = 'border-emerald-400 bg-emerald-50';
            else if (isRequired && !isSelected) cardClass = 'border-red-300 bg-red-50';
            else if (!isRequired && isSelected) cardClass = 'border-orange-300 bg-orange-50';
            else cardClass = 'border-gray-200 bg-gray-50';
          } else if (isSelected) {
            cardClass = 'border-emerald-400 bg-emerald-50';
          }

          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => toggleDoc(doc.id)}
              disabled={revealed}
              className={`text-center p-2.5 rounded-xl border transition-all ${cardClass} disabled:cursor-default`}
            >
              <div className="text-xl mb-1">{doc.emoji}</div>
              <div className="text-[10px] font-medium text-gray-700 leading-tight">
                {doc.name}
              </div>
              {revealed && isRequired && (
                <div className="mt-1 text-[9px] font-bold text-emerald-600">필수</div>
              )}
              {revealed && !isRequired && isSelected && (
                <div className="mt-1 text-[9px] font-bold text-orange-500">불필요</div>
              )}
            </button>
          );
        })}
      </div>

      {/* 버튼 */}
      {!revealed ? (
        <button
          type="button"
          onClick={handleReveal}
          disabled={selectedIds.size === 0}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          정답 확인 · Check Answer
        </button>
      ) : (
        <div>
          {/* 결과 점수 */}
          <div className="mb-3 p-3 bg-gray-50 rounded-xl text-center">
            <div className="text-xs text-gray-500 mb-1">이번 라운드 점수</div>
            <div className={`text-2xl font-bold ${scores[scores.length - 1] >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {scores[scores.length - 1]}점
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              초록 = 필수 서류 ·  빨강 = 빠뜨린 필수 서류 ·  주황 = 불필요한 선택
            </div>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm"
          >
            {roundIdx < totalRounds - 1 ? '다음 라운드 · Next Round' : '결과 보기 · See Results'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 모듈 D: AI 30초 자기소개 ────────────────────────────────────

function ModuleD({
  profile,
  session,
  onComplete,
}: {
  profile: ReturnType<typeof useUserProfile>;
  session: ReturnType<typeof useResumeBuilderSession>['session'];
  onComplete: () => void;
}) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [strength1, setStrength1] = useState('');
  const [strength2, setStrength2] = useState('');

  const [pitch, setPitch] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [completed, setCompleted] = useState(false);

  // 프로필에서 자동 채우기
  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (profile?.country) setCountry(profile.country);
  }, [profile?.name, profile?.country]);

  // 자소서 세션에서 강점 가져오기
  const handleFillFromResume = () => {
    const accepted = session.resultStrengths.filter(
      (r) => !session.rejectedResultIds.includes(r.id),
    );
    if (accepted[0]) setStrength1(accepted[0].nameKo ?? '');
    if (accepted[1]) setStrength2(accepted[1].nameKo ?? '');
  };

  const hasResumeStrengths =
    session.resultStrengths.filter((r) => !session.rejectedResultIds.includes(r.id)).length > 0;

  const canGenerate =
    name.trim().length > 0 &&
    country.trim().length > 0 &&
    targetJob.trim().length > 0 &&
    strength1.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    try {
      const strengths = [strength1, strength2].filter((s) => s.trim().length > 0);
      const result = await generateElevatorPitch(
        { name, country, targetJob, strengths },
        profile,
      );
      if (result) {
        setPitch(result);
        if (!completed) {
          setCompleted(true);
          onComplete();
        }
      } else {
        setError('자기소개를 만들지 못했어요. 다시 시도해주세요.');
      }
    } catch {
      setError('오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!pitch) return;
    try {
      await navigator.clipboard.writeText(pitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 복사 실패 시 무시
    }
  };

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        정보를 입력하면 AI가 30초 자기소개를 만들어줘요.
        <br />
        <span className="text-gray-400">Enter your info and AI will generate a 30-second pitch.</span>
      </p>

      {/* 입력 폼 */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              이름 · Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyen Minh Tuan"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              국적 · Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="베트남 / Vietnam"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            희망 직무 · Target Job
          </label>
          <input
            type="text"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            placeholder="예: IT 개발자, 생산직, 사무직"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-gray-600">
              나의 강점 · Strengths
            </label>
            {hasResumeStrengths && (
              <button
                type="button"
                onClick={handleFillFromResume}
                className="text-[10px] text-emerald-600 font-medium hover:underline"
              >
                자소서에서 가져오기
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={strength1}
              onChange={(e) => setStrength1(e.target.value)}
              placeholder="강점 1 (필수)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="text"
              value={strength2}
              onChange={(e) => setStrength2(e.target.value)}
              placeholder="강점 2 (선택)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* 생성 버튼 */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !canGenerate}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-colors mb-4"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            자기소개 만드는 중...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            AI 자기소개 생성
          </>
        )}
      </button>

      {/* 결과 카드 */}
      {pitch && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-emerald-700">✨ AI 자기소개 완성!</div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  복사
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {pitch}
          </p>
          <p className="text-[10px] text-emerald-600 mt-3">
            💡 연습해보세요! 반복하면 자연스럽게 말할 수 있어요.
            Practice until it feels natural!
          </p>
        </div>
      )}
    </div>
  );
}
