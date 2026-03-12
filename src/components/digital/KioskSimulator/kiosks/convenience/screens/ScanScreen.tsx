import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm, playBeep } from '../../../core/haptics';
import {
  CONVENIENCE_THEME,
  CONVENIENCE_ITEMS,
  CATEGORY_LABELS,
  type ConvenienceItem,
  type ScannedItem,
  formatPrice,
} from '../data';

interface Props {
  scannedItems: ScannedItem[];
  onScanItem: (item: ConvenienceItem) => void;
  onDone: () => void;
  onBack: () => void;
}

export default function ScanScreen({ scannedItems, onScanItem, onDone, onBack }: Props) {
  const { t } = useTranslation();
  const [scanFlash, setScanFlash] = useState<string | null>(null);
  const scanTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Group items by category
  const grouped = CONVENIENCE_ITEMS.reduce<Record<string, ConvenienceItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const totalItems = scannedItems.reduce((sum, s) => sum + s.quantity, 0);
  const totalPrice = scannedItems.reduce((sum, s) => sum + s.item.price * s.quantity, 0);

  const handleScan = (item: ConvenienceItem) => {
    feedbackTap();
    playBeep();
    onScanItem(item);
    setScanFlash(item.id);
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(() => setScanFlash(null), 400);
  };

  useEffect(() => {
    return () => { if (scanTimeout.current) clearTimeout(scanTimeout.current); };
  }, []);

  // Category icon SVGs
  const CategoryIcon = ({ category }: { category: string }) => {
    if (category === 'food') {
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2 L7 1 L11 2 L11 5 Q11 9 7 10 Q3 9 3 5 Z" fill={CONVENIENCE_THEME.primary} opacity="0.6" />
          <rect x="6.5" y="10" width="1" height="3" fill={CONVENIENCE_THEME.primary} opacity="0.6" />
        </svg>
      );
    }
    if (category === 'drink') {
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2 L11 2 L10 12 L4 12 Z" fill={CONVENIENCE_THEME.primary} opacity="0.6" />
          <rect x="2" y="1" width="10" height="2" rx="0.5" fill={CONVENIENCE_THEME.primary} opacity="0.4" />
        </svg>
      );
    }
    if (category === 'snack') {
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="3" y="1" width="8" height="12" rx="2" fill={CONVENIENCE_THEME.primary} opacity="0.6" />
          <rect x="5" y="5" width="4" height="3" rx="1" fill="white" opacity="0.5" />
        </svg>
      );
    }
    if (category === 'daily') {
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="3" y="2" width="8" height="10" rx="1" fill={CONVENIENCE_THEME.primary} opacity="0.6" />
          <rect x="5" y="1" width="4" height="3" rx="0.5" fill={CONVENIENCE_THEME.primary} opacity="0.4" />
        </svg>
      );
    }
    // alcohol
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="4" y="3" width="6" height="9" rx="1" fill="#DC2626" opacity="0.6" />
        <rect x="5" y="1" width="4" height="3" rx="0.5" fill="#DC2626" opacity="0.4" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: CONVENIENCE_THEME.bg }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: CONVENIENCE_THEME.headerBg }}
      >
        <button
          onClick={onBack}
          className="text-xs font-medium px-3 py-1.5 rounded transition-opacity hover:opacity-75"
          style={{ color: CONVENIENCE_THEME.border, border: `1px solid rgba(167,243,208,0.4)` }}
        >
          {t('kiosk.nav.back', '이전')}
        </button>
        <span className="font-bold text-sm tracking-wider" style={{ color: 'white' }}>
          {t('kiosk.convenience.scan.title', '상품 스캔')}
        </span>
        <div style={{ width: 50 }} />
      </div>

      {/* Barcode scanner animation area */}
      <div
        className="flex-shrink-0 relative overflow-hidden flex items-center justify-center"
        style={{
          height: 60,
          backgroundColor: '#0A1F1A',
          borderBottom: `2px solid ${CONVENIENCE_THEME.primary}`,
        }}
      >
        {/* Scanning red line animation */}
        <div
          className="absolute left-4 right-4"
          style={{
            height: 2,
            backgroundColor: '#EF4444',
            boxShadow: '0 0 8px 2px rgba(239,68,68,0.5)',
            animation: 'scanLine 2s ease-in-out infinite',
          }}
        />
        {/* Scan area corners */}
        <svg width="200" height="40" viewBox="0 0 200 40" fill="none" className="relative z-10">
          {/* Top-left corner */}
          <path d="M20 2 L2 2 L2 20" stroke="rgba(167,243,208,0.5)" strokeWidth="2" fill="none" />
          {/* Top-right corner */}
          <path d="M180 2 L198 2 L198 20" stroke="rgba(167,243,208,0.5)" strokeWidth="2" fill="none" />
          {/* Bottom-left corner */}
          <path d="M2 20 L2 38 L20 38" stroke="rgba(167,243,208,0.5)" strokeWidth="2" fill="none" />
          {/* Bottom-right corner */}
          <path d="M198 20 L198 38 L180 38" stroke="rgba(167,243,208,0.5)" strokeWidth="2" fill="none" />
        </svg>
        <style>{`
          @keyframes scanLine {
            0%, 100% { top: 8px; }
            50% { top: 44px; }
          }
        `}</style>
        <p
          className="absolute bottom-1 text-center w-full"
          style={{ color: 'rgba(167,243,208,0.6)', fontSize: 9 }}
        >
          {t('kiosk.convenience.scan.areaHint', '상품의 바코드를 스캔하세요')}
        </p>
      </div>

      {/* Scannable items list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CategoryIcon category={category} />
              <span className="text-xs font-bold" style={{ color: CONVENIENCE_THEME.text }}>
                {CATEGORY_LABELS[category]}
              </span>
              {category === 'alcohol' && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontSize: 9 }}
                >
                  19+
                </span>
              )}
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const scanned = scannedItems.find((s) => s.item.id === item.id);
                const isFlashing = scanFlash === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleScan(item)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded transition-all active:scale-[0.98]"
                    style={{
                      backgroundColor: isFlashing ? 'rgba(16,185,129,0.15)' : 'white',
                      border: `1.5px solid ${isFlashing ? CONVENIENCE_THEME.accent : CONVENIENCE_THEME.border}`,
                      transform: isFlashing ? 'scale(0.98)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Barcode icon */}
                      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" className="flex-shrink-0">
                        <rect x="1" y="1" width="1.5" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="3.5" y="1" width="1" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="5.5" y="1" width="2" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="8.5" y="1" width="1" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="10.5" y="1" width="1.5" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="13" y="1" width="1" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="15" y="1" width="2" height="14" fill={CONVENIENCE_THEME.textLight} />
                        <rect x="18" y="1" width="1" height="14" fill={CONVENIENCE_THEME.textLight} />
                      </svg>
                      <span className="text-xs font-medium truncate" style={{ color: CONVENIENCE_THEME.text }}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: CONVENIENCE_THEME.primary }}>
                        {formatPrice(item.price)}{t('kiosk.currency', '원')}
                      </span>
                      {scanned && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: CONVENIENCE_THEME.accent, color: 'white', fontSize: 10, minWidth: 20, textAlign: 'center' }}
                        >
                          {scanned.quantity}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Running total + done button */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ backgroundColor: 'white', borderTop: `2px solid ${CONVENIENCE_THEME.border}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: CONVENIENCE_THEME.textLight }}>
            {t('kiosk.convenience.scan.itemCount', '스캔 상품')} {totalItems}{t('kiosk.convenience.scan.itemUnit', '개')}
          </span>
          <span className="font-bold text-base" style={{ color: CONVENIENCE_THEME.text }}>
            {formatPrice(totalPrice)}{t('kiosk.currency', '원')}
          </span>
        </div>
        <button
          onClick={() => { feedbackConfirm(); onDone(); }}
          disabled={totalItems === 0}
          className="w-full py-3.5 rounded font-bold text-sm transition-all active:scale-[0.97]"
          style={{
            backgroundColor: totalItems > 0 ? CONVENIENCE_THEME.primary : '#D1D5DB',
            color: 'white',
            opacity: totalItems > 0 ? 1 : 0.6,
          }}
        >
          {t('kiosk.convenience.scan.done', '스캔 완료')}
        </button>
      </div>
    </div>
  );
}
