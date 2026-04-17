import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 사이렌 버튼 + 블러 오버레이
 *
 * 학생 전용 — 수업 중 도움이 필요할 때 누르면:
 * 1. CEO에게 긴급 알림 자동 발송 (system_alerts)
 * 2. 화면에 블러 오버레이 표시 ("선생님이 곧 도와드릴게요")
 * 3. 학생이 직접 닫기 가능
 */
export default function SirenButton() {
  const { user, isAuthenticated } = useAuth();
  const [showOverlay, setShowOverlay] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // 학생만 표시 (강사/CEO는 불필요)
  if (!isAuthenticated || !user || user.role !== 'student') return null;

  const handleSiren = async () => {
    if (sending || sent) return;
    setSending(true);
    setShowOverlay(true);

    try {
      const { sendSystemAlert } = await import('../../services/systemAlertService');
      await sendSystemAlert('siren', 'warning',
        `도움 요청: ${user.name}`,
        `${user.name}(${user.email})님이 도움을 요청했습니다. 기관: ${user.orgCode || '없음'}`,
        { userId: user.id, userName: user.name, orgCode: user.orgCode },
      );
      setSent(true);
    } catch {
      // 실패해도 오버레이는 표시
    }
    setSending(false);
  };

  const handleClose = () => {
    setShowOverlay(false);
    // 10초 후 다시 보낼 수 있도록 리셋
    setTimeout(() => setSent(false), 10000);
  };

  return (
    <>
      {/* 플로팅 사이렌 버튼 */}
      {!showOverlay && (
        <button
          onClick={handleSiren}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          title="도움이 필요해요!"
          aria-label="도움 요청"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </button>
      )}

      {/* 블러 오버레이 */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
          <div className="text-center px-8 max-w-sm">
            <div className="text-6xl mb-6">
              {sent ? '🙋' : '🔔'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {sent ? '선생님에게 알렸어요!' : '알리는 중...'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {sent
                ? '선생님이 곧 도와드릴 거예요. 잠시만 기다려주세요.'
                : '선생님에게 도움 요청을 보내고 있어요...'
              }
            </p>
            {sent && (
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors text-sm"
              >
                돌아가기
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
