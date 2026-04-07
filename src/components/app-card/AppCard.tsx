import { useTranslation } from 'react-i18next';
import type { AppItem } from '../../types/app';
import BadgeTag from './BadgeTag';
import DownloadButton from './DownloadButton';

interface AppCardProps {
  app: AppItem;
  isInstalled: boolean;
  onToggleInstalled: () => void;
}

export default function AppCard({ app, isInstalled, onToggleInstalled }: AppCardProps) {
  const { t } = useTranslation('apps');
  const { t: tc } = useTranslation('common');

  return (
    <div
      className={`bg-white rounded-2xl p-5 flex flex-col gap-3 card-hover ${
        isInstalled
          ? 'border-2 border-duo-400 shadow-[0_4px_0_0_theme(colors.duo.200)]'
          : 'border-2 border-sand-200 shadow-[0_4px_0_0_theme(colors.sand.200)]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* App Icon */}
        <div className="w-16 h-16 rounded-2xl bg-sand-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-sand-200">
          <img
            src={app.icon}
            alt={t(app.nameKey)}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-warm-400">${app.koreanName[0]}</span>`;
            }}
          />
        </div>

        {/* App Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-extrabold text-gray-800">
              {t(app.nameKey)}
            </h3>
            <span className="text-sm text-sand-300 font-medium">
              {app.koreanName}
            </span>
          </div>
          <p className="text-xs text-duo-500 font-semibold mt-0.5">
            {t(app.taglineKey)}
          </p>
        </div>

        {/* Installed Toggle */}
        <button
          onClick={onToggleInstalled}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 min-w-[44px] min-h-[44px] rounded-xl text-xs font-bold transition-all btn-bounce ${
            isInstalled
              ? 'bg-duo-100 text-duo-600 border-2 border-duo-300 hover:bg-duo-200'
              : 'bg-sand-100 text-sand-300 border-2 border-sand-200 hover:bg-sand-200 hover:text-warm-500'
          }`}
          title={tc('installed.markInstalled')}
        >
          {isInstalled ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          <span className="hidden sm:inline">
            {isInstalled ? tc('installed.label') : tc('installed.markInstalled')}
          </span>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-warm-500 leading-relaxed">
        {t(app.descriptionKey)}
      </p>

      {/* Badges + Download */}
      <div className="flex flex-col gap-3 mt-auto pt-2">
        <BadgeTag badges={app.badges} />
        <DownloadButton
          storeLinks={app.storeLinks}
          deepLinks={app.deepLinks}
          isInstalled={isInstalled}
          internalLink={app.internalLink}
        />
      </div>
    </div>
  );
}
