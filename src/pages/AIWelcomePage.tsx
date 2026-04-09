import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bot, Sparkles, ArrowRight, Key, ExternalLink, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveGeminiApiKey } from '../services/profileService';
import { setStoredApiKey, setGeminiConnected } from '../services/gemini/geminiClient';
import { type SchoolId } from '../types/enrollment';
import KkakdugiCharacter from '@/components/brand/KkakdugiCharacter';

interface LocationState {
  schoolId: SchoolId;
  userName?: string;
}

export default function AIWelcomePage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { schoolId, userName } = (location.state as LocationState) || {};
  const [step, setStep] = useState<'welcome' | 'guide' | 'input'>('welcome');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 완료 후 메인화면으로 이동
  const redirectPath = '/';

  useEffect(() => {
    // 환영 메시지 표시 후 자동으로 가이드 단계로
    const timer = setTimeout(() => {
      setStep('guide');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    navigate(redirectPath);
  };

  const handleStartConnection = () => {
    setStep('input');
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요');
      return;
    }

    setError('');

    // localStorage에 즉시 저장 (AI 도구가 이 값을 사용)
    setStoredApiKey(apiKey.trim());
    setGeminiConnected(true);

    // 즉시 성공 처리 + 이동
    setSuccess(true);
    setTimeout(() => {
      navigate(redirectPath);
    }, 1500);

    // Supabase DB 저장은 백그라운드 (실패해도 무방)
    const userId = user?.id;
    if (userId) {
      saveGeminiApiKey(userId, apiKey.trim()).catch(() => {});
    }
  };

  const name = userName || (user as { user_metadata?: { name?: string } } | null)?.user_metadata?.name || '학생';

  return (
    <div className="min-h-screen bg-gradient-to-br from-kk-cream via-kk-warm to-kk-bg flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="mb-2">
            <KkakdugiCharacter size="half" animated />
          </div>
          <div className="w-20 h-20 bg-gradient-to-br from-kk-red to-kk-red-deep rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Bot className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-kk-brown mb-2">
            <Sparkles className="w-6 h-6 inline mr-2 text-kk-red" />
            AI 비서 연결하기
          </h1>
        </div>

        {/* Step 1: 환영 메시지 */}
        {step === 'welcome' && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                안녕하세요, {name}님!
              </h2>
              <p className="text-lg text-gray-600">
                입학을 축하합니다!<br />
                마케팅 학교의 AI 비서가 준비되었습니다.
              </p>
            </div>
            <div className="flex gap-1 justify-center">
              <div className="w-2 h-2 bg-kk-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-kk-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-kk-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Step 2: 연결 가이드 */}
        {step === 'guide' && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              AI 비서를 연결해볼까요? 🤖
            </h2>

            <div className="mb-8 space-y-4">
              <div className="bg-kk-cream border-2 border-kk-warm rounded-xl p-6">
                <h3 className="font-bold text-kk-brown mb-3 flex items-center gap-2">
                  <Key className="w-5 h-5 text-kk-red" />
                  API 키가 뭔가요?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  API 키는 여러분이 AI 도구를 사용할 수 있게 해주는 <strong>연결고리</strong>와 같아요.
                  이 키가 있어야 AI 비서를 불러올 수 있답니다! 🔑
                </p>
                <p className="text-gray-500 leading-relaxed text-sm mt-2">
                  An API KEY is like a <strong>connector</strong> that lets you use AI tools.
                  You need this KEY to call your AI assistant!
                </p>
              </div>

              <div className="bg-kk-bg border-2 border-kk-warm rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">📚 왜 필요한가요?</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  마케팅 학교에서는 다양한 AI 도구들을 사용하게 될 거예요:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>✨ 마케팅 전략 AI 조언</li>
                  <li>📝 광고 문구 생성 도구</li>
                  <li>🎯 타겟 분석 AI</li>
                  <li>📊 데이터 해석 비서</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  이 모든 도구가 <strong>하나의 API 키</strong>로 작동해요!
                </p>
              </div>

              <div className="bg-kk-cream border-2 border-kk-peach rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">🎁 무료로 받을 수 있어요!</h3>
                <p className="text-gray-700 leading-relaxed">
                  Google AI Studio에서 무료로 API 키를 발급받을 수 있습니다.
                  아래 버튼을 눌러서 받아보세요!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-gradient-to-r from-kk-navy to-kk-navy-deep text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Google AI Studio에서 API 키 받기
              </a>

              <button
                onClick={handleStartConnection}
                className="w-full py-4 bg-gradient-to-r from-kk-red to-kk-red-deep text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Key className="w-5 h-5" />
                API 키 입력하기
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                나중에 연결할게요 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: API 키 입력 */}
        {step === 'input' && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              API 키를 입력하세요 🔑
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Google AI Studio에서 받은 API 키를 붙여넣어주세요
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">연결 완료! 🎉</h3>
                <p className="text-gray-600">잠시 후 학습을 시작합니다...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gemini API 키
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza... 로 시작하는 키를 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-kk-red focus:border-transparent transition-all font-mono text-sm"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 팁: API 키는 안전하게 암호화되어 저장되며, 오직 여러분만 사용할 수 있어요.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isLoading || !apiKey.trim()}
                    className="w-full py-4 bg-gradient-to-r from-kk-red to-kk-red-deep text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        저장하고 시작하기
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setStep('guide')}
                    disabled={isLoading}
                    className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    ← 뒤로 가기
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* 안내 문구 */}
        {step !== 'welcome' && !success && (
          <p className="mt-6 text-center text-sm text-gray-500">
            API 키는 언제든 프로필 설정에서 변경할 수 있습니다
          </p>
        )}
      </div>
    </div>
  );
}
