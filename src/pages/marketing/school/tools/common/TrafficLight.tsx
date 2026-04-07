import type { ROASStatus } from '../../../../../types/school';

interface Props {
  status: ROASStatus;
}

const ITEMS: { key: ROASStatus; emoji: string; label: string; color: string; ring: string }[] = [
  { key: 'loss', emoji: '📉', label: '손해', color: '#dc2626', ring: 'rgba(220,38,38,.5)' },
  { key: 'breakeven', emoji: '😐', label: '본전', color: '#f59e0b', ring: 'rgba(245,158,11,.5)' },
  { key: 'profit', emoji: '📈', label: '좋아요', color: '#16a34a', ring: 'rgba(22,163,74,.5)' },
];

export function TrafficLight({ status }: Props) {
  return (
    <div className="flex justify-center gap-6 items-center mt-4">
      {ITEMS.map((item) => {
        const active = item.key === status;
        return (
          <div
            key={item.key}
            className="text-center transition-all"
            style={{ opacity: active ? 1 : 0.25 }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto"
              style={{
                background: active ? item.color : '#9ca3af',
                boxShadow: active ? `0 0 20px ${item.ring}` : 'none',
              }}
            >
              {item.emoji}
            </div>
            <div
              className="text-[11px] font-extrabold mt-1.5"
              style={{ color: active ? item.color : '#6b7280' }}
            >
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
