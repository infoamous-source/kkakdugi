import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, CheckCircle2, Loader2 } from 'lucide-react';
import { useDigitalSchoolProgress } from '../../../../hooks/useDigitalSchoolProgress';
import { DIGITAL_SCHOOL_CURRICULUM } from '../../../../types/digitalSchool';
import type { DigitalPeriodId } from '../../../../types/digitalSchool';
import KkakdugiMascot from '../../../../components/brand/KkakdugiMascot';
import { DigitalDeptIcon } from '../../../../components/brand/SchoolIllustrations';

export default function DigitalChecklistTool() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { autoStamp, hasStamp, saveChecklistResult, getChecklistResult } = useDigitalSchoolProgress();

  const periodId = toolId as DigitalPeriodId;
  const period = DIGITAL_SCHOOL_CURRICULUM.find(p => p.id === periodId);

  // Redirect kkakdugi-challenge to the kkakdugi practice page
  useEffect(() => {
    if (toolId === 'kkakdugi-challenge') {
      navigate('/track/digital-basics/kkakdugi-practice', { replace: true });
    }
  }, [toolId, navigate]);

  // Get checklist items from i18n
  const toolKeyMap: Record<string, string> = {
    'smartphone-setup': 'smartphoneSetup',
    'kakao-auth': 'kakaoAuth',
    'kkakdugi-challenge': 'kkakdugiChallenge',
    'gov24-docs': 'gov24Docs',
    'translation-ai': 'translationAi',
    'digital-safety': 'digitalSafety',
  };

  const toolKey = toolKeyMap[toolId || ''] || '';
  const title = t(`digitalSchool.tools.${toolKey}.title`, '체크리스트');
  const items: string[] = t(`digitalSchool.tools.${toolKey}.items`, { returnObjects: true, defaultValue: [] }) as string[];

  // Restore previous state
  const previousResult = getChecklistResult(periodId);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(
    new Set(previousResult?.checkedItems?.map(Number) || [])
  );
  const [stamped, setStamped] = useState(hasStamp(periodId));

  if (toolId === 'kkakdugi-challenge') return null;

  if (!period || !toolKey || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center p-6">
        <KkakdugiMascot size={48} />
        <p className="mt-4 text-kk-brown font-semibold">도구를 찾을 수 없어요</p>
        <button
          onClick={() => navigate('/digital/school/curriculum')}
          className="mt-4 px-4 py-2 bg-kk-red text-white rounded-xl text-sm font-bold"
        >
          시간표로 돌아가기
        </button>
      </div>
    );
  }

  const toggleItem = (index: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allChecked = checkedItems.size >= items.length;
  const progress = `${checkedItems.size}/${items.length}`;

  const handleEarnStamp = async () => {
    // Save checklist result
    await saveChecklistResult({
      periodId,
      completedAt: new Date().toISOString(),
      checkedItems: Array.from(checkedItems).map(String),
      totalItems: items.length,
    });
    // Earn stamp
    await autoStamp(periodId);
    setStamped(true);
  };

  return (
    <div className="min-h-screen bg-kk-bg">
      {/* 헤더 */}
      <header className="bg-kk-bg border-b border-kk-warm sticky top-0 z-40">
        <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/digital/school/curriculum')}
            className="p-1.5 hover:bg-kk-cream rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-kk-brown/60" />
          </button>
          <div className="flex items-center gap-2">
            <KkakdugiMascot size={20} />
            <DigitalDeptIcon size={20} />
            <h1 className="font-bold text-kk-brown text-sm truncate">{period.period}교시 실습</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg md:max-w-2xl mx-auto px-4 py-6">
        {/* 타이틀 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{title}</h2>
          <p className="text-sm text-gray-500">
            {t('digitalSchool.checklist.progress', { done: checkedItems.size, total: items.length })}
          </p>
          {/* 진행 바 */}
          <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${(checkedItems.size / items.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 체크리스트 */}
        <div className="space-y-2 mb-6">
          {items.map((item, index) => {
            const isChecked = checkedItems.has(index);
            return (
              <button
                key={index}
                onClick={() => !stamped && toggleItem(index)}
                disabled={stamped}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  isChecked
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                } ${stamped ? 'opacity-80' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isChecked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isChecked && <Check className="w-4 h-4" strokeWidth={3} />}
                </div>
                <span className={`text-sm ${isChecked ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                  {item}
                </span>
              </button>
            );
          })}
        </div>

        {/* 스탬프 받기 / 완료 상태 */}
        {stamped ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-700 font-bold text-lg mb-1">
              {t('digitalSchool.checklist.completed', '완료됨')}
            </p>
            <p className="text-green-600 text-sm mb-4">이 교시의 도장을 받았어요!</p>
            <button
              onClick={() => navigate('/digital/school/attendance')}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors"
            >
              출석부로 돌아가기
            </button>
          </div>
        ) : allChecked ? (
          <button
            onClick={handleEarnStamp}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity text-lg"
          >
            🏆 {t('digitalSchool.checklist.earnStamp', '도장 받기')}
          </button>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              {t('digitalSchool.checklist.allDone', '모든 항목을 체크하면 도장을 받을 수 있어요')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
