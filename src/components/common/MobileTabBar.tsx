import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isStudentAssignedToTrack } from '../../services/teamService';
import {
  SchoolBellIcon,
  DigitalDeptIcon,
  MarketingDeptIcon,
  CareerDeptIcon,
} from '../brand/SchoolIllustrations';

interface TabDef {
  id: string;
  labelKey: string;
  svgIcon?: React.FC<{ size?: number; className?: string }>;
  lucideIcon?: typeof Settings;
  path: string;
}

const tabs: TabDef[] = [
  { id: 'home', labelKey: 'sidebar.home', svgIcon: SchoolBellIcon, path: '/' },
  { id: 'digital', labelKey: 'sidebar.digitalBasics', svgIcon: DigitalDeptIcon, path: '/track/digital-basics' },
  { id: 'marketing', labelKey: 'sidebar.marketing', svgIcon: MarketingDeptIcon, path: '/marketing/hub' },
  { id: 'career', labelKey: 'sidebar.career', svgIcon: CareerDeptIcon, path: '/track/career' },
  { id: 'settings', labelKey: 'sidebar.settings', lucideIcon: Settings, path: '/settings' },
];

export default function MobileTabBar() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isInstructor = user?.role === 'instructor' || user?.role === 'ceo';

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 bg-kk-brown text-kk-cream px-6 py-3 rounded-xl shadow-lg z-[9999] text-sm font-medium';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  const isActive = (tab: TabDef) => {
    if (tab.path === '/') return location.pathname === '/';
    if (tab.id === 'marketing') return location.pathname.startsWith('/marketing');
    return location.pathname.startsWith(tab.path);
  };

  // 학과 탭 ID 목록
  const trackTabIds: Record<string, string> = {
    digital: 'digital-basics',
    marketing: 'marketing',
    career: 'career',
  };

  const handleTabClick = (tab: TabDef) => {
    const trackId = trackTabIds[tab.id];
    if (trackId) {
      if (!isAuthenticated || !user) {
        navigate('/login', { state: { redirectTo: '/' } });
        return;
      }
      // 로그인된 누구든 학과 진입 허용 (교실 배정 무관)
      navigate(tab.path);
      return;
    }
    navigate(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-kk-bg border-t border-kk-warm md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const SvgIcon = tab.svgIcon;
          const LucideIcon = tab.lucideIcon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[48px] min-h-[48px] transition-colors ${
                active ? 'text-kk-red-deep' : 'text-kk-brown/40'
              }`}
            >
              {SvgIcon ? (
                <SvgIcon size={24} />
              ) : LucideIcon ? (
                <LucideIcon className="w-6 h-6" />
              ) : null}
              <span className="text-[11px] mt-1 font-medium leading-tight">
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
