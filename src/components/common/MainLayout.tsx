import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileTabBar from './MobileTabBar';
import PageTransition from './PageTransition';
import ProfileGapModal, { computeProfileGap } from '../auth/ProfileGapModal';
import { useAuth } from '../../contexts/AuthContext';
import type { TrackId } from '../../types/track';

export default function MainLayout() {
  const { trackId } = useParams<{ trackId: string }>();
  const { user } = useAuth();

  // 가입 폼 v6: 기존 사용자 프로필 누락 강제 보강
  // 학생 전용 (CEO/강사는 admin 패널에서 생성되므로 제외)
  const gap = user && user.role === 'student'
    ? computeProfileGap({
        korean_level: user.koreanLevel,
        years_in_korea: user.yearsInKorea,
        visa_type: user.visaType,
      })
    : { hasGap: false, missing: { koreanLevel: false, yearsInKorea: false, visaType: false } };

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

      {/* 가입 폼 v6: 기존 사용자 강제 보강 모달 (PRD: docs/prd-signup-form-v5.md) */}
      {gap.hasGap && <ProfileGapModal missing={gap.missing} />}
    </div>
  );
}
