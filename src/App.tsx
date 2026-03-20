import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import { VisibilityProvider } from './contexts/VisibilityContext';
import MainLayout from './components/common/MainLayout';
import GlobalLogoutButton from './components/common/GlobalLogoutButton';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import PageTransition from './components/common/PageTransition';
import GatewayPage from './pages/GatewayPage';
import LoginPage from './pages/LoginPage';

// Lazy-loaded pages
const TrackPage = lazy(() => import('./pages/TrackPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const OrganizationDetailPage = lazy(() => import('./pages/OrganizationDetailPage'));
const KoreaAppsPage = lazy(() => import('./pages/KoreaAppsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DigitalModulePage = lazy(() => import('./pages/DigitalModulePage'));
const KkakdugiPracticePage = lazy(() => import('./pages/KkakdugiPracticePage'));
const DigitalHubPage = lazy(() => import('./pages/digital/DigitalHubPage'));
const DigitalSchoolLayout = lazy(() => import('./pages/digital/school/DigitalSchoolLayout'));
const DigitalAttendanceTab = lazy(() => import('./pages/digital/school/DigitalAttendanceTab'));
const DigitalCurriculumTab = lazy(() => import('./pages/digital/school/DigitalCurriculumTab'));
const DigitalLabTab = lazy(() => import('./pages/digital/school/DigitalLabTab'));
const DigitalChecklistTool = lazy(() => import('./pages/digital/school/tools/DigitalChecklistTool'));
const AIWelcomePage = lazy(() => import('./pages/AIWelcomePage'));
const RegisterCompletePage = lazy(() => import('./pages/RegisterCompletePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export default function App() {
  return (
    <AuthProvider>
      <EnrollmentProvider>
      <VisibilityProvider>
      <BrowserRouter>
        <GlobalLogoutButton />
        <Suspense fallback={<LoadingSkeleton />}>
        <PageTransition>
        <Routes>
          {/* Gateway (첫 페이지 - 트리오 카드) */}
          <Route path="/" element={<GatewayPage />} />

          {/* 깍두기 학교란? 상세 페이지 */}
          <Route path="/about" element={<AboutPage />} />

          {/* 인증 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/congrats" element={<Navigate to="/login" replace />} />
          <Route path="/register-complete" element={<RegisterCompletePage />} />
          <Route path="/ai-welcome" element={<AIWelcomePage />} />

          {/* 강사 전용 대시보드 */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/organization/:orgCode" element={<OrganizationDetailPage />} />
          <Route path="/admin/organizations" element={<AdminPage />} />

          {/* 디지털 허브 (학교 시스템) */}
          <Route path="/digital/hub" element={<DigitalHubPage />} />

          {/* 디지털 학교 (Bottom Tab 레이아웃) */}
          <Route path="/digital/school" element={<DigitalSchoolLayout />}>
            <Route path="attendance" element={<DigitalAttendanceTab />} />
            <Route path="curriculum" element={<DigitalCurriculumTab />} />
            <Route path="lab" element={<DigitalLabTab />} />
          </Route>

          {/* 디지털 학교 실습 도구 (독립 페이지) */}
          <Route path="/digital/school/tools/:toolId" element={<DigitalChecklistTool />} />

          {/* 트랙 내부 페이지 (사이드바 레이아웃) */}
          <Route element={<MainLayout />}>
            <Route path="/track/:trackId" element={<TrackPage />} />
            <Route path="/track/digital-basics" element={<Navigate to="/digital/hub" replace />} />
            <Route path="/track/digital-basics/module/:moduleId" element={<DigitalModulePage />} />
            <Route path="/track/digital-basics/kkakdugi-practice" element={<KkakdugiPracticePage />} />
            <Route path="/track/digital-basics/korea-apps" element={<KoreaAppsPage />} />

            {/* 내 프로필 */}
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/resources" element={<div className="text-gray-500">Resources page (Coming soon)</div>} />
            <Route path="/help" element={<div className="text-gray-500">Help page (Coming soon)</div>} />
            <Route path="/settings" element={<div className="text-gray-500">Settings page (Coming soon)</div>} />
          </Route>
        </Routes>
        </PageTransition>
        </Suspense>
      </BrowserRouter>
      </VisibilityProvider>
      </EnrollmentProvider>
    </AuthProvider>
  );
}
