import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CeoDashboard from '../components/admin/CeoDashboard';
import Sidebar from '../components/common/Sidebar';
import TopHeader from '../components/common/TopHeader';

export default function CeoPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 비로그인 또는 CEO가 아니면 리다이렉트
  if (!isAuthenticated || user?.role !== 'ceo') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* 모바일: ml-0, 태블릿/PC: ml-64 (사이드바 너비). 모바일에서 ml-64면 콘텐츠 폭이 256px만큼 깎여 글자가 한 줄씩 떨어짐 */}
      <div className="ml-0 md:ml-64 transition-all duration-300">
        <TopHeader />
        <main className="p-4 md:p-6">
          <CeoDashboard />
        </main>
      </div>
    </div>
  );
}
