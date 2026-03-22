import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot, KeyRound, HelpCircle, CheckCircle, AlertCircle, Loader2,
  Sparkles, ArrowRight, Eye, EyeOff, ExternalLink,
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import confetti from 'canvas-confetti';
import {
  getStoredApiKey, setStoredApiKey, setGeminiConnected,
  isGeminiConnected as checkGeminiConnected, clearGeminiConnection,
} from '../../services/gemini/geminiClient';
import { useAuth } from '../../contexts/AuthContext';
import { saveGeminiApiKey } from '../../services/profileService';

type ConnectionState = 'idle' | 'loading' | 'success' | 'error';

export default function AIAssistantConnect() {
  const { t } = useTranslation('common');
  const { user } = useAuth();

  // 저장된 키/상태 로드 (geminiClient 중앙화 함수 사용)
  const [apiKey, setApiKey] = useState(() => getStoredApiKey() || '');
  const [isConnected, setIsConnected] = useState(() => checkGeminiConnected());

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    isConnected ? 'success' : 'idle'
  );
  const [showKey, setShowKey] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);

  // 연결 확인 함수
  const handleConnect = useCallback(async () => {
    if (!apiKey.trim()) {
      setErrorMessage(t('marketing.aiConnect.errorEmpty', 'API 키를 입력해주세요'));
      setConnectionState('error');
      return;
    }

    setConnectionState('loading');
    setErrorMessage('');
    setAiMessage('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // 짧은 프롬프트로 빠르게 검증
      const result = await model.generateContent('안녕하세요');

      // 응답이 오면 성공!
      const response = result.response;
      response.text(); // 텍스트 추출 (에러 체크용)

      // 성공 메시지
      setAiMessage('반갑습니다! 이제 제가 당신의 마케팅 비서입니다. 우리 함께 멋진 홍보를 시작해봐요! 🚀');
      setConnectionState('success');
      setIsConnected(true);

      // localStorage에 저장 (geminiClient 중앙화 함수 — base64 인코딩 포함)
      setStoredApiKey(apiKey.trim());
      setGeminiConnected(true);

      // Supabase DB에도 동기화 (선생님 대시보드에서 API 연결 상태 조회용)
      if (user?.id) {
        saveGeminiApiKey(user.id, apiKey.trim()).catch(() => { /* ignore */ });
      }

      // 폭죽 애니메이션!
      fireConfetti();

    } catch (err: unknown) {
      setConnectionState('error');
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[AI Connect] Error:', errorMsg);

      if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('401') || errorMsg.includes('400')) {
        setErrorMessage(
          '❌ API 키가 올바르지 않아요.\n\n' +
          '【해결 방법】\n' +
          '1. Google AI Studio에서 새 키를 발급받아보세요\n' +
          '2. 키를 복사할 때 앞뒤 공백이 없는지 확인하세요\n' +
          '3. AIza로 시작하는지 확인해주세요'
        );
      } else if (errorMsg.includes('QUOTA') || errorMsg.includes('429')) {
        setErrorMessage(
          '⏰ API 사용량이 초과되었어요.\n\n' +
          '【무료 제한】\n' +
          '• 하루 1,500번까지 무료로 사용 가능해요\n' +
          '• 분당 15번까지만 요청할 수 있어요\n\n' +
          '【해결 방법】\n' +
          '1. 10초 후 다시 시도해보세요 (아래 버튼)\n' +
          '2. Google AI Studio에서 새 API 키를 발급받으세요\n' +
          '3. 잠시 후 (몇 분 뒤) 다시 시도해보세요'
        );
      } else {
        setErrorMessage(
          '🤔 연결에 실패했어요.\n\n' +
          '【에러 내용】\n' + errorMsg + '\n\n' +
          '【해결 방법】\n' +
          '1. API 키를 다시 확인해주세요\n' +
          '2. Google AI Studio에서 새 키를 발급받으세요\n' +
          '3. 잠시 후 다시 시도해보세요'
        );
      }
    }
  }, [apiKey, t]);

  // 연결 해제
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionState('idle');
    setAiMessage('');
    setApiKey('');
    clearGeminiConnection();
  }, []);

  // 재시도 카운트다운
  const handleRetryWithDelay = useCallback(() => {
    setRetryCountdown(10);
    setErrorMessage('');

    const interval = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleConnect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleConnect]);

  // confetti 애니메이션
  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <div className="mx-4 mt-6">
      <div className={`rounded-2xl border-2 transition-all duration-500 ${
        isConnected
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
          : 'border-blue-200 bg-gradient-to-br from-white to-blue-50'
      } p-6 md:p-8`}>

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🤖</span>
          <h2 className="text-xl font-bold text-gray-800">
            {t('marketing.aiConnect.title', '내 마케팅 AI 비서 연결하기')}
          </h2>
          <span className="text-2xl">🔑</span>
        </div>
        <p className="text-gray-500 mb-6 leading-relaxed">
          {t('marketing.aiConnect.description', 'AI 비서를 연결하면 광고 카피 작성, 이미지 생성 등 더 많은 기능을 사용할 수 있어요!')}
        </p>

        {/* 연결 성공 상태 */}
        {isConnected && connectionState === 'success' && (
          <div className="mb-6">
            {/* AI 인사 메시지 */}
            {aiMessage && (
              <div className="bg-white rounded-xl border border-green-200 p-4 md:p-5 mb-4 flex items-start gap-3 md:gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium leading-relaxed">{aiMessage}</p>
                  <p className="text-xs text-gray-400 mt-2">Gemini AI</p>
                </div>
              </div>
            )}

            {/* 연결됨 뱃지 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-700">
                    {t('marketing.aiConnect.connected', 'AI 비서 연결 완료!')}
                  </p>
                  <p className="text-sm text-green-600">
                    {t('marketing.aiConnect.connectedHint', '이제 모든 AI 기능을 사용할 수 있어요')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1"
                >
                  {t('marketing.aiConnect.disconnect', '연결 해제')}
                </button>
              </div>
            </div>

            {/* 시작하기 버튼 */}
            <button
              onClick={() => {
                const el = document.getElementById('marketing-modules');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full mt-4 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white font-bold py-3 px-4 md:py-4 md:px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t('marketing.aiConnect.startLearning', '마케팅 학습 시작하기')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 미연결 상태 - API 키 입력 폼 */}
        {(!isConnected || connectionState !== 'success') && (
          <div>
            {/* 도움말 링크 */}
            <div className="mb-4">
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                {t('marketing.aiConnect.helpLink', '키를 어디서 받나요?')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 안내 박스 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-700 leading-relaxed">
                {t('marketing.aiConnect.guide', '💡 Google AI Studio에서 무료로 API 키를 받을 수 있어요. "Get API Key" 버튼을 클릭하면 됩니다. 키는 내 컴퓨터에만 저장되고, 다른 사람에게 보이지 않아요.')}
              </p>
            </div>

            {/* API 키 입력 */}
            <div className="relative mb-4">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-600">
                  {t('marketing.aiConnect.keyLabel', 'Gemini API 키')}
                </label>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (connectionState === 'error') setConnectionState('idle');
                  }}
                  placeholder={t('marketing.aiConnect.keyPlaceholder', 'AIza...')}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none transition-colors text-sm ${
                    connectionState === 'error'
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-gray-200 focus:border-blue-400 bg-white'
                  }`}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {connectionState === 'error' && errorMessage && (
              <div className="mb-4">
                <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 whitespace-pre-line leading-relaxed">{errorMessage}</p>
                </div>

                {/* 에러 발생 시 재시도 버튼 */}
                <div className="mt-3">
                  <button
                    onClick={handleRetryWithDelay}
                    disabled={retryCountdown > 0}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {retryCountdown > 0 ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {retryCountdown}초 후 자동 재시도...
                      </>
                    ) : (
                      <>
                        🔄 10초 후 다시 시도하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 연결 확인 버튼 */}
            <button
              onClick={handleConnect}
              disabled={connectionState === 'loading' || !apiKey.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                connectionState === 'loading' || !apiKey.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] hover:shadow-lg hover:shadow-blue-200'
              }`}
            >
              {connectionState === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('marketing.aiConnect.connecting', '연결 확인 중...')}
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  {t('marketing.aiConnect.connectButton', '연결 확인')}
                </>
              )}
            </button>

            {/* 건너뛰기 */}
            <p className="text-center text-xs text-gray-400 mt-3">
              {t('marketing.aiConnect.skipHint', 'API 키가 없어도 기본 학습은 할 수 있어요')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export from geminiClient for backward compatibility
export { isGeminiConnected } from '../../services/gemini/geminiClient';
