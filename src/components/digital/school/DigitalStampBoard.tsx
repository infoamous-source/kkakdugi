import { useTranslation } from 'react-i18next';
import { Check, Lock } from 'lucide-react';
import type { StampProgress } from '../../../types/school';
import { DIGITAL_SCHOOL_CURRICULUM } from '../../../types/digitalSchool';

interface DigitalStampBoardProps {
  stamps: StampProgress[];
}

const stampColors = [
  'from-blue-400 to-blue-500',
  'from-amber-400 to-amber-500',
  'from-purple-400 to-purple-500',
  'from-emerald-400 to-emerald-500',
  'from-rose-400 to-rose-500',
  'from-orange-400 to-orange-500',
];

export default function DigitalStampBoard({ stamps }: DigitalStampBoardProps) {
  const { t } = useTranslation('common');
  const completed = stamps.filter((s) => s.completed).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          🏆 {t('digitalSchool.stamps.title', '출석 도장판')}
        </h3>
        <span className="text-sm font-bold text-blue-600">
          {completed}/{DIGITAL_SCHOOL_CURRICULUM.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DIGITAL_SCHOOL_CURRICULUM.map((period, index) => {
          const stamp = stamps.find((s) => (s.periodId as string) === period.id);
          const isCompleted = stamp?.completed ?? false;

          return (
            <div
              key={period.id}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                isCompleted
                  ? `bg-gradient-to-br ${stampColors[index]} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-6 h-6 mb-1" strokeWidth={3} />
                  <span className="text-xs font-bold">{period.period}{t('digitalSchool.stamps.period', '교시')}</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mb-1" />
                  <span className="text-xs">{period.period}{t('digitalSchool.stamps.period', '교시')}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 진행 바 */}
      <div className="mt-4">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed / DIGITAL_SCHOOL_CURRICULUM.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
