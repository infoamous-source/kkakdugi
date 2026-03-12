import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Monitor, Coffee, CreditCard, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import KioskSelector from '../components/digital/KioskSimulator/KioskSelector';
import { kioskRegistry } from '../components/digital/KioskSimulator/registry';
import { useDigitalProgress } from '../hooks/useDigitalProgress';
import { useDigitalSchoolProgress } from '../hooks/useDigitalSchoolProgress';
import type { KioskType } from '../components/digital/KioskSimulator/core/types';

export default function KioskPracticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeKiosk, setActiveKiosk] = useState<KioskType | null>(null);
  const [completedKiosks, setCompletedKiosks] = useState<KioskType[]>([]);
  const { markPracticeCompleted } = useDigitalProgress();
  const { autoStamp } = useDigitalSchoolProgress();

  const handleSelectKiosk = (type: KioskType) => {
    setActiveKiosk(type);
  };

  const handleComplete = () => {
    if (activeKiosk) {
      setCompletedKiosks(prev =>
        prev.includes(activeKiosk) ? prev : [...prev, activeKiosk]
      );
      markPracticeCompleted('db-02', 'db-02-practice-1');
      // 디지털 학교 3교시(키오스크 도전) 자동 스탬프
      autoStamp('kiosk-challenge');
    }
    setActiveKiosk(null);
  };

  const handleClose = () => {
    setActiveKiosk(null);
  };

  const learningPoints = [
    { icon: Monitor, textKey: 'kiosk.learn.touchScreen', fallback: '화면 터치로 주문 시작하기' },
    { icon: Coffee, textKey: 'kiosk.learn.selectMenu', fallback: '메뉴와 옵션 선택하기' },
    { icon: ShoppingCart, textKey: 'kiosk.learn.cart', fallback: '장바구니 확인 및 수량 조절' },
    { icon: CreditCard, textKey: 'kiosk.learn.payment', fallback: '결제 수단 선택 및 결제하기' },
  ];

  // Render active kiosk simulator as a modal overlay
  const renderActiveKiosk = () => {
    if (!activeKiosk) return null;
    const entry = kioskRegistry[activeKiosk];
    if (!entry) return null;
    const KioskComponent = entry.component;

    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
              <Loader2 size={36} className="text-purple-500 animate-spin" />
              <p className="text-gray-600 font-medium">
                {t('kiosk.loading', '키오스크를 불러오는 중...')}
              </p>
            </div>
          </div>
        }
      >
        <KioskComponent onClose={handleClose} onComplete={handleComplete} />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t('kiosk.backToModule', '돌아가기')}</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Monitor className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('kiosk.title', '키오스크 연습')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('kiosk.subtitleGeneral', '다양한 키오스크 사용법을 익혀보세요')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 완료 축하 메시지 */}
        {completedKiosks.length > 0 && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6 text-center">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-900 mb-2">
              {t('kiosk.screens.complete.congrats', '키오스크 연습 완료!')}
            </h2>
            <p className="text-green-700 mb-4">
              {t(
                'kiosk.completedMessage',
                `${completedKiosks.length}개 키오스크 연습을 완료했어요! 다른 키오스크도 도전해보세요.`
              )}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors"
            >
              {t('kiosk.backToModule', '돌아가기')}
            </button>
          </div>
        )}

        {/* 키오스크란? */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>🖥️</span>
            {t('kiosk.whatIsKiosk', '키오스크란?')}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {t(
              'kiosk.whatIsKioskDesc',
              '키오스크는 카페, 패스트푸드점, 영화관 등에 설치된 터치스크린 주문 기계입니다. 직원에게 말하지 않고도 화면을 터치하여 메뉴를 선택하고, 결제까지 할 수 있습니다.'
            )}
          </p>
        </section>

        {/* 이 연습에서 배울 것 */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📚</span>
            {t('kiosk.whatYouLearn', '이 연습에서 배울 것')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {learningPoints.map(({ icon: Icon, textKey, fallback }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-purple-600" />
                </div>
                <p className="text-sm text-purple-900 font-medium">
                  {t(textKey, fallback)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 키오스크 선택 그리드 */}
        <section className="bg-white rounded-2xl shadow-sm p-6">
          <KioskSelector
            onSelectKiosk={handleSelectKiosk}
            completedKiosks={completedKiosks}
          />
        </section>
      </div>

      {/* 키오스크 시뮬레이터 모달 */}
      {renderActiveKiosk()}
    </div>
  );
}
