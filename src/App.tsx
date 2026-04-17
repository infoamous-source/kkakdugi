import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import { VisibilityProvider } from './contexts/VisibilityContext';
import MainLayout from './components/common/MainLayout';
import GlobalLogoutButton from './components/common/GlobalLogoutButton';
import SirenButton from './components/common/SirenButton';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import PageTransition from './components/common/PageTransition';
import GatewayPage from './pages/GatewayPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { useApiKeyPool } from './hooks/useApiKeyPool';

// Lazy-loaded pages (lazyWithRetry: 청크 404 시 자동 새로고침)
const TrackPage = lazyWithRetry(() => import('./pages/TrackPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'));
const CeoPage = lazyWithRetry(() => import('./pages/CeoPage'));
const OrganizationDetailPage = lazyWithRetry(() => import('./pages/OrganizationDetailPage'));
const KoreaAppsPage = lazyWithRetry(() => import('./pages/KoreaAppsPage'));
const MarketingModuleDetailPage = lazyWithRetry(() => import('./pages/marketing/MarketingModuleDetailPage'));
const MarketingToolRouter = lazyWithRetry(() => import('./pages/marketing/MarketingToolRouter'));
const MarketingHubPage = lazyWithRetry(() => import('./pages/marketing/MarketingHubPage'));
const MarketingSchoolLayout = lazyWithRetry(() => import('./pages/marketing/school/MarketingSchoolLayout'));
const AttendanceTab = lazyWithRetry(() => import('./pages/marketing/school/AttendanceTab'));
const CurriculumTab = lazyWithRetry(() => import('./pages/marketing/school/CurriculumTab'));
const LabTab = lazyWithRetry(() => import('./pages/marketing/school/LabTab'));
const SchoolToolRouter = lazyWithRetry(() => import('./pages/marketing/school/SchoolToolRouter'));
const PeriodDetailPage = lazyWithRetry(() => import('./pages/marketing/school/PeriodDetailPage'));
const ProToolsDashboard = lazyWithRetry(() => import('./pages/marketing/ProToolsDashboard'));
const AISetupPage = lazyWithRetry(() => import('./pages/marketing/school/AISetupPage'));
const GraduationProjectPage = lazyWithRetry(() => import('./pages/marketing/school/GraduationProjectPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const DigitalModulePage = lazyWithRetry(() => import('./pages/DigitalModulePage'));
const KkakdugiPracticePage = lazyWithRetry(() => import('./pages/KkakdugiPracticePage'));
const DigitalHubPage = lazyWithRetry(() => import('./pages/digital/DigitalHubPage'));
const DigitalSchoolLayout = lazyWithRetry(() => import('./pages/digital/school/DigitalSchoolLayout'));
const DigitalAttendanceTab = lazyWithRetry(() => import('./pages/digital/school/DigitalAttendanceTab'));
const DigitalCurriculumTab = lazyWithRetry(() => import('./pages/digital/school/DigitalCurriculumTab'));
const DigitalLabTab = lazyWithRetry(() => import('./pages/digital/school/DigitalLabTab'));
const DigitalChecklistTool = lazyWithRetry(() => import('./pages/digital/school/tools/DigitalChecklistTool'));
const AIWelcomePage = lazyWithRetry(() => import('./pages/AIWelcomePage'));
const RegisterCompletePage = lazyWithRetry(() => import('./pages/RegisterCompletePage'));
const CareerResumeBuilderPage = lazyWithRetry(() => import('./pages/career/ResumeBuilderPage'));
const CareerKResumePage = lazyWithRetry(() => import('./pages/career/KResumePage'));
const CareerInterviewSimulatorPage = lazyWithRetry(() => import('./pages/career/InterviewSimulatorPage'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));
const InquiryPage = lazyWithRetry(() => import('./pages/InquiryPage'));
const ShowcasePage = lazyWithRetry(() => import('./pages/ShowcasePage'));
const AdminInquiryPage = lazyWithRetry(() => import('./pages/AdminInquiryPage'));
const AdminAnnouncementsPage = lazyWithRetry(() => import('./pages/AdminAnnouncementsPage'));
const TermsPage = lazyWithRetry(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazyWithRetry(() => import('./pages/legal/PrivacyPage'));
const MarketResearchTool = lazyWithRetry(() => import('./pages/marketing/pro/MarketResearchTool'));
const BrandKitTool = lazyWithRetry(() => import('./pages/marketing/pro/BrandKitTool'));
const ContentStudioTool = lazyWithRetry(() => import('./pages/marketing/pro/ContentStudioTool'));
const LandingBuilderTool = lazyWithRetry(() => import('./pages/marketing/pro/LandingBuilderTool'));
const MarketingDashboardTool = lazyWithRetry(() => import('./pages/marketing/pro/MarketingDashboardTool'));
const DetailPageTool = lazyWithRetry(() => import('./pages/marketing/pro/DetailPageTool'));

/** Auth 상태에 따라 API 키 풀 초기화 */
function ApiKeyPoolSync() {
  useApiKeyPool();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ApiKeyPoolSync />
      <EnrollmentProvider>
      <VisibilityProvider>
      <BrowserRouter>
        <GlobalLogoutButton />
        <SirenButton />
        <Suspense fallback={<LoadingSkeleton />}>
        <PageTransition>
        <Routes>
          {/* Gateway (첫 페이지 - 트리오 카드) */}
          <Route path="/" element={<GatewayPage />} />

          {/* 깍두기 학교란? 상세 페이지 */}
          <Route path="/about" element={<AboutPage />} />

          {/* 법적 페이지 (P0-3) */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* 1:1 문의 게시판 */}
          <Route path="/inquiry" element={<InquiryPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiryPage />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />

          {/* 조별 발표 쇼케이스 (공개 — 교실 프로젝터용) */}
          <Route path="/showcase" element={<ShowcasePage />} />

          {/* 인증 페이지 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/congrats" element={<Navigate to="/login" replace />} />
          <Route path="/register-complete" element={<RegisterCompletePage />} />
          <Route path="/ai-welcome" element={<AIWelcomePage />} />

          {/* 강사 전용 대시보드 */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/organization/:orgCode" element={<OrganizationDetailPage />} />
          <Route path="/admin/organizations" element={<AdminPage />} />

          {/* CEO 전용 대시보드 */}
          <Route path="/ceo" element={<CeoPage />} />

          {/* 마케팅 허브 (학교 시스템) */}
          <Route path="/marketing/hub" element={<MarketingHubPage />} />
          <Route path="/marketing/pro" element={<ProToolsDashboard />} />
          <Route path="/marketing/pro/studio/market-research" element={<MarketResearchTool />} />
          <Route path="/marketing/pro/studio/brand-kit" element={<BrandKitTool />} />
          <Route path="/marketing/pro/studio/content-studio" element={<ContentStudioTool />} />
          <Route path="/marketing/pro/studio/detail-page" element={<DetailPageTool />} />
          <Route path="/marketing/pro/studio/landing-builder" element={<LandingBuilderTool />} />
          <Route path="/marketing/pro/studio/marketing-dashboard" element={<MarketingDashboardTool />} />
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

            {/* 기존 마케팅 (레거시) → 허브로 리다이렉트 */}
            <Route path="/marketing" element={<Navigate to="/marketing/hub" replace />} />
            <Route path="/marketing/modules/:moduleId" element={<MarketingModuleDetailPage />} />
            <Route path="/marketing/tools/:toolId" element={<MarketingToolRouter />} />

            {/* 커리어학과 — 자소서 빌더 / K-이력서 / 면접 시뮬레이터 */}
            <Route path="/career/resume-builder" element={<CareerResumeBuilderPage />} />
            <Route path="/career/k-resume" element={<CareerKResumePage />} />
            <Route path="/career/interview" element={<CareerInterviewSimulatorPage />} />

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
