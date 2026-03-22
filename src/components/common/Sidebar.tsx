import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  UserCircle,
} from 'lucide-react';
import type { TrackId } from '../../types/track';
import { useAuth } from '../../contexts/AuthContext';
import { useEnrollments } from '../../contexts/EnrollmentContext';
import { useSchoolProgress } from '../../hooks/useSchoolProgress';
import { isStudentAssignedToTrack } from '../../services/teamService';
import KkakdugiMascot from '../brand/KkakdugiMascot';
import {
  DigitalDeptIcon,
  MarketingDeptIcon,
  CareerDeptIcon,
  SchoolBellIcon,
  BookIcon,
  NotebookIcon,
  BackpackIcon,
} from '../brand/SchoolIllustrations';

interface SidebarProps {
  currentTrack?: TrackId;
}

interface NavItem {
  id: string;
  labelKey: string;
  svgIcon?: React.FC<{ size?: number; className?: string }>;
  path: string;
  trackId?: TrackId;
  children?: NavItem[];
}

const mainNavItems: NavItem[] = [
  { id: 'home', labelKey: 'sidebar.home', svgIcon: SchoolBellIcon, path: '/' },
  { id: 'digital', labelKey: 'sidebar.digitalBasics', svgIcon: DigitalDeptIcon, path: '/track/digital-basics', trackId: 'digital-basics' },
  {
    id: 'marketing',
    labelKey: 'sidebar.marketing',
    svgIcon: MarketingDeptIcon,
    path: '/marketing/hub',
    trackId: 'marketing',
    children: [
      { id: 'marketing-school', labelKey: 'sidebar.marketingSchool', svgIcon: NotebookIcon, path: '/marketing/hub' },
      { id: 'marketing-pro', labelKey: 'sidebar.marketingPro', svgIcon: BackpackIcon, path: '/marketing/pro' },
    ],
  },
  { id: 'career', labelKey: 'sidebar.career', svgIcon: CareerDeptIcon, path: '/track/career', trackId: 'career' },
];

const bottomNavItems: NavItem[] = [
  { id: 'resources', labelKey: 'sidebar.resources', svgIcon: BookIcon, path: '/resources' },
  { id: 'help', labelKey: 'sidebar.help', svgIcon: NotebookIcon, path: '/help' },
  { id: 'settings', labelKey: 'sidebar.settings', svgIcon: BackpackIcon, path: '/settings' },
];

export default function Sidebar({ currentTrack }: SidebarProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { enrollments } = useEnrollments();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const { isGraduated, isProAccessValid } = useSchoolProgress();

  // 강사인지 확인
  const isInstructor = user?.role === 'instructor';

  // /marketing 경로에 있으면 자동으로 마케팅 메뉴 펼치기
  useEffect(() => {
    if (location.pathname.startsWith('/marketing')) {
      setExpandedMenu('marketing');
    }
  }, [location.pathname]);

  const isActive = (item: NavItem) => {
    if (item.trackId && currentTrack) {
      return item.trackId === currentTrack;
    }
    // 마케팅 하위 경로에서도 활성화
    if (item.path !== '/' && location.pathname.startsWith(item.path)) {
      return true;
    }
    return location.pathname === item.path;
  };

  const isChildActive = (item: NavItem) => {
    if (item.id === 'marketing-school') {
      return location.pathname.startsWith('/marketing/hub') ||
             location.pathname.startsWith('/marketing/school');
    }
    if (item.id === 'marketing-pro') {
      return location.pathname.startsWith('/marketing/pro');
    }
    return location.pathname === item.path;
  };

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

  const handleNavClick = async (item: NavItem) => {
    if (item.children && !collapsed) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id);
      return;
    }

    // 학과 메뉴 → 접근 권한 체크
    if (item.trackId) {
      await handleTrackNavClick(item);
      return;
    }

    navigate(item.path);
  };

  const handleTrackNavClick = async (item: NavItem) => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { redirectTo: '/' } });
      return;
    }
    // 강사는 모든 학과 자유 입장
    if (isInstructor) {
      navigate(item.path);
      return;
    }
    // 학생: 배정 확인
    try {
      const assigned = await isStudentAssignedToTrack(user.id, item.trackId!);
      if (assigned) {
        navigate(item.path);
      } else {
        showToast('학과 배정 대기중이에요! 선생님에게 문의하세요');
      }
    } catch {
      navigate(item.path);
    }
  };

  const handleMarketingSchoolClick = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { redirectTo: '/' } });
      return;
    }
    if (isInstructor) {
      navigate('/marketing/hub');
      return;
    }
    try {
      const assigned = await isStudentAssignedToTrack(user.id, 'marketing');
      if (assigned) {
        navigate('/marketing/hub');
      } else {
        showToast('학과 배정 대기중이에요! 선생님에게 문의하세요');
      }
    } catch {
      navigate('/marketing/hub');
    }
  };

  const handleMarketingProClick = () => {
    if (!user) return;
    if (!isGraduated) {
      alert(t('school.hub.proLocked'));
      return;
    }
    if (!isProAccessValid) {
      alert(t('school.hub.proExpired'));
      return;
    }
    navigate('/marketing/pro');
  };

  const handleChildClick = async (child: NavItem) => {
    if (child.id === 'marketing-school') {
      await handleMarketingSchoolClick();
    } else if (child.id === 'marketing-pro') {
      handleMarketingProClick();
    } else {
      navigate(child.path);
    }
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenu === item.id;
    const SvgIcon = item.svgIcon;

    return (
      <div>
        <button
          onClick={() => handleNavClick(item)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${active
              ? 'bg-kk-cream text-kk-red-deep font-semibold'
              : 'text-kk-brown/60 hover:bg-kk-cream/50 hover:text-kk-brown'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? t(item.labelKey) : undefined}
        >
          {SvgIcon && <SvgIcon size={20} className="shrink-0" />}
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{t(item.labelKey)}</span>
              {hasChildren && (
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              )}
            </>
          )}
        </button>

        {/* 하위 메뉴 */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-kk-cream pl-2">
            {item.children!.map((child) => {
              const childActive = isChildActive(child);
              const ChildSvgIcon = child.svgIcon;
              return (
                <button
                  key={child.id}
                  onClick={() => handleChildClick(child)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                    ${childActive
                      ? 'bg-purple-50 text-purple-600 font-semibold'
                      : 'text-kk-brown/50 hover:bg-kk-cream/40 hover:text-kk-brown/70'
                    }
                  `}
                >
                  {ChildSvgIcon && <ChildSvgIcon size={16} className="shrink-0" />}
                  <span className="truncate">{t(child.labelKey)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-kk-bg border-r border-kk-warm z-40
        transition-all duration-300 ease-out hidden md:flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* 로고 영역 */}
      <div className={`p-4 border-b border-kk-warm flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-10 h-10 bg-kk-cream rounded-xl flex items-center justify-center shadow-sm border border-kk-warm">
          <KkakdugiMascot size={28} />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-kk-brown">깍두기 학교</h1>
            <p className="text-xs text-kk-brown/40">Education School</p>
          </div>
        )}
      </div>

      {/* 메인 내비게이션 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </nav>

      {/* 내 프로필 버튼 (로그인 시 표시) */}
      {user && (
        <div className="px-3">
          <button
            onClick={() => navigate('/profile')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${location.pathname === '/profile'
                ? 'bg-kk-cream text-kk-red-deep font-semibold'
                : 'text-kk-brown/60 hover:bg-kk-cream/50 hover:text-kk-brown'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? t('sidebar.profile') : undefined}
          >
            <UserCircle className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="truncate">{t('sidebar.profile', '내 프로필')}</span>
            )}
          </button>
        </div>
      )}

      {/* 강사 전용 대시보드 버튼 */}
      {isInstructor && (
        <div className="p-3 border-t border-kk-warm">
          <button
            onClick={() => navigate('/admin')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              bg-gradient-to-r from-kk-red to-kk-coral text-white font-semibold
              hover:from-kk-red-deep hover:to-kk-red shadow-md hover:shadow-lg
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? t('sidebar.dashboard') : undefined}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="truncate">{t('sidebar.dashboard')}</span>
            )}
          </button>
        </div>
      )}

      {/* 하단 내비게이션 */}
      <div className="p-3 border-t border-kk-warm space-y-1">
        {bottomNavItems.map((item) => {
          const active = isActive(item);
          const SvgIcon = item.svgIcon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${active
                  ? 'bg-kk-cream text-kk-red-deep font-semibold'
                  : 'text-kk-brown/60 hover:bg-kk-cream/50 hover:text-kk-brown'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              {SvgIcon && <SvgIcon size={20} className="shrink-0" />}
              {!collapsed && (
                <span className="truncate">{t(item.labelKey)}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 접기/펼치기 버튼 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-kk-bg border border-kk-warm rounded-full shadow-sm flex items-center justify-center hover:bg-kk-cream transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-kk-brown/50" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-kk-brown/50" />
        )}
      </button>
    </aside>
  );
}
