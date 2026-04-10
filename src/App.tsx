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
import AuthCallbackPage from './pages/AuthCallbackPage';

// Lazy-loaded pages
const TrackPage = lazy(() => import('./pages/TrackPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CeoPage = lazy(() => import('./pages/CeoPage'));
const OrganizationDetailPage = lazy(() => import('./pages/OrganizationDetailPage'));
const KoreaAppsPage = lazy(() => import('./pages/KoreaAppsPage'));
const MarketingModuleDetailPage = lazy(() => import('./pages/marketing/MarketingModuleDetailPage'));
const MarketingToolRouter = lazy(() => import('./pages/marketing/MarketingToolRouter'));
const MarketingHubPage = lazy(() => import('./pages/marketing/MarketingHubPage'));
const MarketingSchoolLayout = lazy(() => import('./pages/marketing/school/MarketingSchoolLayout'));
const AttendanceTab = lazy(() => import('./pages/marketing/school/AttendanceTab'));
const CurriculumTab = lazy(() => import('./pages/marketing/school/CurriculumTab'));
const LabTab = lazy(() => import('./pages/marketing/school/LabTab'));
const SchoolToolRouter = lazy(() => import('./pages/marketing/school/SchoolToolRouter'));
const PeriodDetailPage = lazy(() => import('./pages/marketing/school/PeriodDetailPage'));
const ProToolsDashboard = lazy(() => import('./pages/marketing/ProToolsDashboard'));
const AISetupPage = lazy(() => import('./pages/marketing/school/AISetupPage'));
const GraduationProjectPage = lazy(() => import('./pages/marketing/school/GraduationProjectPage'));
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
const CareerResumeBuilderPage = lazy(() => import('./pages/career/ResumeBuilderPage'));
const CareerKResumePage = lazy(() => import('./pages/career/KResumePage'));
const CareerInterviewSimulatorPage = lazy(() => import('./pages/career/InterviewSimulatorPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const InquiryPage = lazy(() => import('./pages/InquiryPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const AdminInquiryPage = lazy(() => import('./pages/AdminInquiryPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));

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

          {/* 법적 페이지 (P0-3) */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* 1:1 문의 게시판 */}
          <Route path="/inquiry" element={<InquiryPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiryPage />} />

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
