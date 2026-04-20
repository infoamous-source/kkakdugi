import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import Sidebar from '../components/common/Sidebar';
import TopHeader from '../components/common/TopHeader';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 비로그인 또는 학생이면 리다이렉트
  if (!isAuthenticated || (user?.role !== 'instructor' && user?.role !== 'ceo')) {
    return <Navigate to="/" replace />;
  }

  // CEO는 /ceo 로 통합 (대시보드 2개 운영 금지)
  if (user?.role === 'ceo') {
    return <Navigate to="/ceo" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* 모바일: ml-0, 태블릿/PC: ml-64 (사이드바 너비) */}
      <div className="ml-0 md:ml-64 transition-all duration-300">
        <TopHeader />
        <main className="p-4 md:p-6">
          <AdminDashboard />
        </main>
      </div>
    </div>
  );
}
