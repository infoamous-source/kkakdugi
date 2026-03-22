import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AIAssistantConnect from '../../../components/marketing/AIAssistantConnect';
import { isGeminiConnected } from '../../../services/gemini/geminiClient';
import { useEffect, useState } from 'react';

/**
 * AI 비서 연결 페이지
 * - 입학 모드 (fromEnrollment=true): 🎒 입학 준비 UI + 스텝 인디케이터
 * - 기존 사용자 모드: 간결한 AI 연결 UI
 */
export default function AISetupPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const [connected, setConnected] = useState(isGeminiConnected());

  const isEnrollmentMode = (location.state as { fromEnrollment?: boolean })?.fromEnrollment === true;

  // 입학 모드일 때만: 이미 연결됐으면 학교로 바로 이동
  useEffect(() => {
    if (isEnrollmentMode && isGeminiConnected()) {
      navigate('/marketing/school/attendance', { replace: true });
    }
  }, [navigate, isEnrollmentMode]);

  // 연결 상태 변화 감지 (localStorage 이벤트)
  useEffect(() => {
    const checkConnection = () => {
      if (isGeminiConnected() && !connected) {
        setConnected(true);
        // 연결 완료 후 잠시 대기 후 학교로 이동
        setTimeout(() => {
          navigate('/marketing/school/attendance', { replace: true });
        }, 2000);
      }
    };

    const interval = setInterval(checkConnection, 500);
    return () => clearInterval(interval);
  }, [connected, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 헤더 */}
      <header className="py-4 px-4 sm:py-6 sm:px-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">뒤로가기</span>
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-lg mx-auto px-4 pb-12">
        {/* 안내 헤더 */}
        <div className="text-center mb-6 pt-4">
          <div className="text-5xl mb-3">{isEnrollmentMode ? '🎒' : '🤖'}</div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
            {isEnrollmentMode
              ? t('school.aiSetup.title')
              : 'AI 비서 연결'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEnrollmentMode
              ? t('school.aiSetup.subtitle')
              : 'AI 비서를 연결하면 더 스마트하게 학습할 수 있어요'}
          </p>
        </div>

        {/* 스텝 인디케이터 — 입학 모드에서만 */}
        {isEnrollmentMode && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="text-xs font-medium text-purple-600">{t('school.aiSetup.step1')}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                connected ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>2</div>
              <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-gray-400'}`}>
                {t('school.aiSetup.step2')}
              </span>
            </div>
          </div>
        )}

        {/* AI 연결 컴포넌트 */}
        <AIAssistantConnect />

        {/* 하단 버튼 */}
        {!connected && (
          <div className="mt-6 text-center">
            <button
              onClick={() => isEnrollmentMode
                ? navigate('/marketing/school/attendance')
                : navigate(-1)
              }
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              {isEnrollmentMode ? t('school.aiSetup.skip') : '나중에 하기'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
