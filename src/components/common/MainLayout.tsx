import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileTabBar from './MobileTabBar';
import PageTransition from './PageTransition';
import type { TrackId } from '../../types/track';

export default function MainLayout() {
  const { trackId } = useParams<{ trackId: string }>();

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
