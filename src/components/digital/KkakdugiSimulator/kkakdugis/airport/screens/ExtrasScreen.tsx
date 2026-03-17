import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { AIRPORT_THEME, MEAL_OPTIONS, EXTRA_SERVICES, formatPrice } from '../data';

interface Props {
  selectedMeal: string;
  selectedServices: string[];
  onMealChange: (mealId: string) => void;
  onServiceToggle: (serviceId: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function ExtrasScreen({
  selectedMeal, selectedServices,
  onMealChange, onServiceToggle,
  onNext, onSkip, onBack,
}: Props) {
  const { t } = useTranslation();

  const extrasTotal = EXTRA_SERVICES
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: AIRPORT_THEME.surface }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: AIRPORT_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {t('airport.common.back', '뒤로')}
        </button>
        <span className="font-bold text-sm tracking-wide" style={{ color: 'white' }}>
          {t('airport.extras.title', '부가 서비스')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Meal selection */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'white', border: '1.5px solid #E2E8F0' }}
        >
          <div className="px-4 py-2.5" style={{ backgroundColor: '#E0F2FE', borderBottom: '1px solid #BAE6FD' }}>
            <span className="text-xs font-semibold tracking-wide" style={{ color: AIRPORT_THEME.text }}>
              {t('airport.extras.mealTitle', '기내식 사전주문')}
            </span>
          </div>
          {MEAL_OPTIONS.map((meal) => (
            <button
              key={meal.id}
              onClick={() => { feedbackTap(); onMealChange(meal.id); }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all"
              style={{ borderBottom: '1px solid #F1F5F9' }}
            >
              {/* Radio button */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  border: `2px solid ${selectedMeal === meal.id ? AIRPORT_THEME.primary : '#CBD5E1'}`,
                }}
              >
                {selectedMeal === meal.id && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AIRPORT_THEME.primary }} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: AIRPORT_THEME.text }}>{meal.name}</p>
                {meal.description && (
                  <p className="text-xs mt-0.5" style={{ color: AIRPORT_THEME.textLight }}>{meal.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Extra services */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'white', border: '1.5px solid #E2E8F0' }}
        >
          <div className="px-4 py-2.5" style={{ backgroundColor: '#E0F2FE', borderBottom: '1px solid #BAE6FD' }}>
            <span className="text-xs font-semibold tracking-wide" style={{ color: AIRPORT_THEME.text }}>
              {t('airport.extras.servicesTitle', '추가 서비스')}
            </span>
          </div>
          {EXTRA_SERVICES.map((service) => {
            const checked = selectedServices.includes(service.id);
            return (
              <button
                key={service.id}
                onClick={() => { feedbackTap(); onServiceToggle(service.id); }}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all"
                style={{ borderBottom: '1px solid #F1F5F9' }}
              >
                {/* Checkbox */}
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: checked ? AIRPORT_THEME.primary : 'white',
                    border: `2px solid ${checked ? AIRPORT_THEME.primary : '#CBD5E1'}`,
                  }}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium" style={{ color: AIRPORT_THEME.text }}>{service.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: AIRPORT_THEME.textLight }}>{service.description}</p>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: AIRPORT_THEME.primary }}>
                  {formatPrice(service.price)}{t('airport.common.won', '원')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Total extras */}
        {extrasTotal > 0 && (
          <div
            className="rounded-lg px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}
          >
            <span className="text-xs font-medium" style={{ color: AIRPORT_THEME.text }}>
              {t('airport.extras.total', '부가 서비스 합계')}
            </span>
            <span className="text-sm font-bold" style={{ color: AIRPORT_THEME.primary }}>
              {formatPrice(extrasTotal)}{t('airport.common.won', '원')}
            </span>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="flex-shrink-0 p-4 flex gap-3" style={{ borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={() => { feedbackTap(); onSkip(); }}
          className="py-3.5 rounded-lg font-bold text-sm transition-opacity hover:opacity-75"
          style={{ backgroundColor: '#E2E8F0', color: AIRPORT_THEME.textLight, width: '35%' }}
        >
          {t('airport.extras.skip', '건너뛰기')}
        </button>
        <button
          onClick={() => { feedbackConfirm(); onNext(); }}
          className="flex-1 py-3.5 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
          style={{ backgroundColor: AIRPORT_THEME.primary, color: 'white' }}
        >
          {t('airport.extras.confirm', '선택 완료')}
        </button>
      </div>
    </div>
  );
}
