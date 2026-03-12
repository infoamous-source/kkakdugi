import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackTap, feedbackConfirm } from '../../../core/haptics';
import { AIRPORT_THEME } from '../data';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

type SearchMethod = 'booking' | 'passport' | 'eticket';

export default function BookingSearchScreen({ onNext, onBack }: Props) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<SearchMethod>('booking');
  const [bookingCode, setBookingCode] = useState('');
  const [scanning, setScanning] = useState(false);

  const KEYS_ROW1 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const KEYS_ROW2 = ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  const KEYS_ROW3 = ['U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3'];
  const KEYS_ROW4 = ['4', '5', '6', '7', '8', '9'];

  const handleKey = (key: string) => {
    feedbackTap();
    if (bookingCode.length < 6) {
      setBookingCode(prev => prev + key);
    }
  };

  const handleDelete = () => {
    feedbackTap();
    setBookingCode(prev => prev.slice(0, -1));
  };

  const handleSubmitBooking = () => {
    if (bookingCode.length === 6) {
      feedbackConfirm();
      onNext();
    }
  };

  const handleScan = () => {
    feedbackTap();
    setScanning(true);
    setTimeout(() => {
      feedbackConfirm();
      onNext();
    }, 1200);
  };

  const methods: { id: SearchMethod; label: string; icon: JSX.Element }[] = [
    {
      id: 'booking',
      label: t('airport.search.booking', '예약번호'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 6H14M6 9H14M6 12H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'passport',
      label: t('airport.search.passport', '여권 스캔'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="10" cy="9" r="3" stroke="currentColor" strokeWidth="1" />
          <path d="M6 14H14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'eticket',
      label: t('airport.search.eticket', '항공권 스캔'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <rect key={i} x={5 + i * 1.6} y="8" width={i % 2 === 0 ? 0.8 : 0.5} height="4" fill="currentColor" />
          ))}
        </svg>
      ),
    },
  ];

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
          {t('airport.search.title', '예약 조회')}
        </span>
        <div style={{ width: 52 }} />
      </div>

      {/* Method tabs */}
      <div className="flex px-3 pt-3 gap-2 flex-shrink-0">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => { feedbackTap(); setMethod(m.id); setScanning(false); }}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: method === m.id ? AIRPORT_THEME.primary : 'white',
              color: method === m.id ? 'white' : AIRPORT_THEME.text,
              border: method === m.id ? `1.5px solid ${AIRPORT_THEME.primary}` : '1.5px solid #E2E8F0',
            }}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col">
        {method === 'booking' && (
          <>
            {/* Code display */}
            <div className="flex justify-center gap-1.5 mb-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-12 rounded flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: bookingCode[i] ? AIRPORT_THEME.primary : 'white',
                    color: bookingCode[i] ? 'white' : AIRPORT_THEME.textLight,
                    border: `1.5px solid ${bookingCode[i] ? AIRPORT_THEME.primary : '#CBD5E1'}`,
                  }}
                >
                  {bookingCode[i] || ''}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="flex flex-col gap-1">
              {[KEYS_ROW1, KEYS_ROW2, KEYS_ROW3, KEYS_ROW4].map((row, ri) => (
                <div key={ri} className="flex justify-center gap-1">
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKey(key)}
                      className="rounded font-medium text-sm transition-all active:scale-95"
                      style={{
                        width: 30,
                        height: 32,
                        backgroundColor: 'white',
                        color: AIRPORT_THEME.text,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {key}
                    </button>
                  ))}
                  {ri === 3 && (
                    <button
                      onClick={handleDelete}
                      className="rounded font-medium text-xs transition-all active:scale-95 px-2"
                      style={{
                        height: 32,
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                      }}
                    >
                      {t('airport.search.delete', '삭제')}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitBooking}
              className="mt-3 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
              style={{
                backgroundColor: bookingCode.length === 6 ? AIRPORT_THEME.primary : '#CBD5E1',
                color: 'white',
              }}
            >
              {t('airport.search.submit', '조회')}
            </button>
          </>
        )}

        {method === 'passport' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div
              className="rounded-xl p-6 flex flex-col items-center gap-3"
              style={{ backgroundColor: 'white', border: '1.5px dashed #CBD5E1' }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="10" y="6" width="40" height="48" rx="4" stroke={AIRPORT_THEME.primary} strokeWidth="2" />
                <circle cx="30" cy="26" r="8" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" />
                <path d="M18 42H42" stroke={AIRPORT_THEME.primary} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M18 46H42" stroke={AIRPORT_THEME.primary} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: AIRPORT_THEME.text }}>
                {t('airport.search.passportGuide', '여권을 스캐너에 올려주세요')}
              </p>
              <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
                {t('airport.search.passportSub', '사진 페이지가 아래로 향하게 놓아주세요')}
              </p>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-8 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
              style={{ backgroundColor: scanning ? AIRPORT_THEME.accent : AIRPORT_THEME.primary, color: 'white' }}
            >
              {scanning ? t('airport.search.scanning', '스캔 중...') : t('airport.search.scanBtn', '스캔 시작')}
            </button>
          </div>
        )}

        {method === 'eticket' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div
              className="rounded-xl p-6 flex flex-col items-center gap-3"
              style={{ backgroundColor: 'white', border: '1.5px dashed #CBD5E1' }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <rect x="8" y="14" width="44" height="32" rx="4" stroke={AIRPORT_THEME.primary} strokeWidth="2" />
                {/* Barcode lines */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <rect
                    key={i}
                    x={14 + i * 2.5}
                    y="22"
                    width={i % 3 === 0 ? 1.5 : 0.8}
                    height="16"
                    fill={AIRPORT_THEME.primary}
                    opacity={0.7}
                  />
                ))}
              </svg>
              <p className="text-sm font-semibold" style={{ color: AIRPORT_THEME.text }}>
                {t('airport.search.eticketGuide', '항공권 바코드를 스캔해주세요')}
              </p>
              <p className="text-xs" style={{ color: AIRPORT_THEME.textLight }}>
                {t('airport.search.eticketSub', '모바일 항공권 또는 인쇄된 항공권')}
              </p>
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-8 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.97]"
              style={{ backgroundColor: scanning ? AIRPORT_THEME.accent : AIRPORT_THEME.primary, color: 'white' }}
            >
              {scanning ? t('airport.search.scanning', '스캔 중...') : t('airport.search.scanBtn', '스캔 시작')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
