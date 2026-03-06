import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import { VisibilityProvider } from './contexts/VisibilityContext';
import MainLayout from './components/common/MainLayout';
import GlobalLogoutButton from './components/common/GlobalLogoutButton';
import GatewayPage from './pages/GatewayPage';
import TrackPage from './pages/TrackPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import KoreaAppsPage from './pages/KoreaAppsPage';
// MarketingLandingPage 제거됨 — /marketing은 /marketing/hub로 리다이렉트
import MarketingModuleDetailPage from './pages/marketing/MarketingModuleDetailPage';
import MarketingToolRouter from './pages/marketing/MarketingToolRouter';
import MarketingHubPage from './pages/marketing/MarketingHubPage';
import MarketingSchoolLayout from './pages/marketing/school/MarketingSchoolLayout';
import AttendanceTab from './pages/marketing/school/AttendanceTab';
import CurriculumTab from './pages/marketing/school/CurriculumTab';
import LabTab from './pages/marketing/school/LabTab';
import SchoolToolRouter from './pages/marketing/school/SchoolToolRouter';
import PeriodDetailPage from './pages/marketing/school/PeriodDetailPage';
import ProToolsDashboard from './pages/marketing/ProToolsDashboard';
import AISetupPage from './pages/marketing/school/AISetupPage';
import GraduationProjectPage from './pages/marketing/school/GraduationProjectPage';
import ProfilePage from './pages/ProfilePage';
import DigitalModulePage from './pages/DigitalModulePage';
import KioskPracticePage from './pages/KioskPracticePage';
import AIWelcomePage from './pages/AIWelcomePage';
import RegisterCompletePage from './pages/RegisterCompletePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <AuthProvider>
      <EnrollmentProvider>
      <VisibilityProvider>
      <BrowserRouter>
        <GlobalLogoutButton />
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

          {/* 마케팅 허브 (학교 시스템) */}
          <Route path="/marketing/hub" element={<MarketingHubPage />} />
          <Route path="/marketing/pro" element={<ProToolsDashboard />} />
          <Route path="/marketing/school/ai-setup" element={<AISetupPage />} />

          {/* 마케팅 학교 (Bottom Tab 레이아웃) */}
          <Route path="/marketing/school" element={<MarketingSchoolLayout />}>
            <Route path="attendance" element={<AttendanceTab />} />
            <Route path="curriculum" element={<CurriculumTab />} />
            <Route path="lab" element={<LabTab />} />
          </Route>

          {/* 교시 상세 페이지 (독립 페이지) */}
          <Route path="/marketing/school/periods/:periodId" element={<PeriodDetailPage />} />

          {/* 졸업과제 안내 페이지 */}
          <Route path="/marketing/school/graduation-project" element={<GraduationProjectPage />} />

          {/* 학교 툴 (독립 페이지) */}
          <Route path="/marketing/school/tools/:toolId" element={<SchoolToolRouter />} />

          {/* 트랙 내부 페이지 (사이드바 레이아웃) */}
          <Route element={<MainLayout />}>
            <Route path="/track/:trackId" element={<TrackPage />} />
            <Route path="/track/digital-basics/module/:moduleId" element={<DigitalModulePage />} />
            <Route path="/track/digital-basics/kiosk-practice" element={<KioskPracticePage />} />
            <Route path="/track/digital-basics/korea-apps" element={<KoreaAppsPage />} />

            {/* 기존 마케팅 (레거시) → 허브로 리다이렉트 */}
            <Route path="/marketing" element={<Navigate to="/marketing/hub" replace />} />
            <Route path="/marketing/modules/:moduleId" element={<MarketingModuleDetailPage />} />
            <Route path="/marketing/tools/:toolId" element={<MarketingToolRouter />} />

            {/* 내 프로필 */}
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/resources" element={<div className="text-gray-500">Resources page (Coming soon)</div>} />
            <Route path="/help" element={<div className="text-gray-500">Help page (Coming soon)</div>} />
            <Route path="/settings" element={<div className="text-gray-500">Settings page (Coming soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      </VisibilityProvider>
      </EnrollmentProvider>
    </AuthProvider>
  );
}
