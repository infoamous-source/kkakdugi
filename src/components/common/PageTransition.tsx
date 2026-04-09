import { useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * 페이지 전환 시 fade/slide 애니메이션.
 *
 * 2026-04-09 수정: reflow 해킹 제거 + key-based 리마운트 + scroll top
 *   - 기존 reflow + classList 조작이 Suspense 리마운트와 충돌해 빈 화면 유발
 *   - location.pathname을 key로 주면 React가 자동으로 자식을 리마운트 → 애니메이션 자연스럽게 재시작
 *   - 페이지 이동 시 스크롤 최상단 (모바일 UX)
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  useEffect(() => {
    // 라우트 변경 시 스크롤 top (해시 앵커는 브라우저 기본 동작 유지)
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
