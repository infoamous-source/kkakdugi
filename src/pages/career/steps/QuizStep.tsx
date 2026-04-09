import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizAnswers {
  workStyle?: 'alone' | 'team';
  praiseType?: 'accurate' | 'fast' | 'kind' | 'creative';
  taskType?: 'routine' | 'new';
}

interface Props {
  initial: QuizAnswers;
  onComplete: (answers: QuizAnswers) => void;
  onBack: () => void;
}

const QUESTIONS: Array<{
  id: keyof QuizAnswers;
  labelKo: string;
  labelEn: string;
  options: Array<{ value: string; ko: string; en: string }>;
}> = [
  {
    id: 'workStyle',
    labelKo: '나는 일할 때 어떤 게 더 편해요?',
    labelEn: 'How do I like to work?',
    options: [
      { value: 'alone', ko: '혼자 집중', en: 'Alone' },
      { value: 'team',  ko: '여러 명이 같이', en: 'With others' },
    ],
  },
  {
    id: 'praiseType',
    labelKo: '어떤 칭찬이 가장 기분 좋아요?',
    labelEn: 'Which praise feels best?',
    options: [
      { value: 'accurate', ko: '정확하다',     en: 'Accurate' },
      { value: 'fast',     ko: '빠르다',       en: 'Fast' },
      { value: 'kind',     ko: '친절하다',     en: 'Kind' },
      { value: 'creative', ko: '창의적이다',   en: 'Creative' },
    ],
  },
  {
    id: 'taskType',
    labelKo: '어떤 일이 더 즐거워요?',
    labelEn: 'Which is more fun?',
    options: [
      { value: 'routine', ko: '매일 비슷한 일을 잘 해내는 것', en: 'Doing routine well' },
      { value: 'new',     ko: '매번 새로운 일에 도전하는 것',   en: 'New challenges' },
    ],
  },
];

/** Step 0-D: 스타일 퀴즈 3문항 */
export default function QuizStep({ initial, onComplete, onBack }: Props) {
  const [answers, setAnswers] = useState<QuizAnswers>(initial);
  const [idx, setIdx] = useState(0);

  const q = QUESTIONS[idx];
  const selected = (answers as Record<string, string | undefined>)[q.id];

  const handlePick = (value: string) => {
    const next = { ...answers, [q.id]: value } as QuizAnswers;
    setAnswers(next);
    // 마지막 질문이면 onComplete
    if (idx === QUESTIONS.length - 1) {
      setTimeout(() => onComplete(next), 300);
    } else {
      setTimeout(() => setIdx(idx + 1), 300);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* 진행 점 */}
      <div className="flex items-center gap-1.5 mb-5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === idx ? 'bg-emerald-500 w-6' : i < idx ? 'bg-emerald-300' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-1">{q.labelKo}</h2>
      <p className="text-sm text-gray-500 mb-6">{q.labelEn}</p>

      {/* 선택지 */}
      <div className={`grid gap-3 mb-6 ${q.options.length === 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {q.options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePick(opt.value)}
              className={`p-5 rounded-2xl border-2 text-center transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md'
              }`}
            >
              <div className="font-semibold text-gray-800">{opt.ko}</div>
              <div className="text-[11px] text-gray-400 mt-1">{opt.en}</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (idx === 0) onBack();
            else setIdx(idx - 1);
          }}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
          답을 선택하면 다음으로 넘어가요
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </div>
  );
}
