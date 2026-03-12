import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  NotebookIcon,
  ChalkboardIcon,
  BackpackIcon,
} from '../../brand/SchoolIllustrations';

const tabs = [
  { id: 'attendance', path: '/digital/school/attendance', svgIcon: NotebookIcon, labelKey: 'digitalSchool.nav.attendance' },
  { id: 'curriculum', path: '/digital/school/curriculum', svgIcon: ChalkboardIcon, labelKey: 'digitalSchool.nav.curriculum' },
  { id: 'lab', path: '/digital/school/lab', svgIcon: BackpackIcon, labelKey: 'digitalSchool.nav.lab' },
] as const;

export default function DigitalBottomNav() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.id || 'attendance';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-kk-bg border-t border-kk-warm z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const SvgIcon = tab.svgIcon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-kk-brown/40 hover:text-kk-brown/60'
              }`}
            >
              <SvgIcon size={20} />
              <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                {t(tab.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
