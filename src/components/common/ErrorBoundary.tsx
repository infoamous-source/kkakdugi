import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

/**
 * 전역 에러 바운더리 — lazy 청크 로딩 실패, 컨텍스트 에러 등
 * 빈 화면 대신 에러 메시지 + 새로고침 버튼 표시
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
    import('../../services/systemAlertService').then(({ sendSystemAlert }) => {
      sendSystemAlert('blank_screen', 'warning',
        '앱 에러 발생 (빈 화면)',
        `ErrorBoundary 캐치: ${error.message}`,
        { stack: error.stack?.slice(0, 500) },
      );
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-kk-bg flex flex-col items-center justify-center gap-4 p-6">
          <span className="text-5xl">🥒</span>
          <p className="text-kk-brown font-semibold text-lg">앗, 문제가 생겼어요!</p>
          <p className="text-kk-brown/50 text-sm">페이지를 새로고침해주세요</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-kk-red text-white font-bold rounded-xl hover:bg-kk-red-deep transition-colors"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
