import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileTabBar from './MobileTabBar';
import PageTransition from './PageTransition';
import type { TrackId } from '../../types/track';

export default function MainLayout() {
  const { trackId } = useParams<{ trackId: string }>();

  // 2026-04-09 D-Day: 추가 정보 입력 강제 모달 비활성화
  // (가입 폼 v6의 korean_level/years_in_korea/visa_type 보강 모달)
  // 학생이 학과 입장 시마다 뜨는 게 부담된다는 피드백으로 제거.
  // 관련 코드는 ProfileGapModal.tsx에 남아있음 — 나중에 재활성화 가능.

  return (
    <div className="min-h-screen bg-kk-bg">
      <Sidebar currentTrack={trackId as TrackId} />

      {/* 모바일: ml-0, 태블릿/PC: ml-64 (사이드바 너비) */}
      <div className="ml-0 md:ml-64 transition-all duration-300">
        <TopHeader />

        <main className="p-3 sm:p-4 md:p-6 pb-24 md:pb-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* 모바일 하단 탭 바 */}
      <MobileTabBar />
    </div>
  );
}
