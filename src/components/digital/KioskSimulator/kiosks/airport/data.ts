import { formatPrice } from '../../core/utils';

export { formatPrice };

export type AirportScreen =
  | 'welcome'
  | 'bookingSearch'
  | 'flightInfo'
  | 'seatSelect'
  | 'baggage'
  | 'extras'
  | 'confirmAll'
  | 'payment'
  | 'processing'
  | 'complete';

export const AIRPORT_SCREEN_ORDER: AirportScreen[] = [
  'welcome', 'bookingSearch', 'flightInfo', 'seatSelect',
  'baggage', 'extras', 'confirmAll', 'payment', 'processing', 'complete',
];

export const AIRPORT_THEME = {
  headerBg: '#0C4A6E',
  primary: '#0369A1',
  accent: '#0EA5E9',
  gold: '#FCD34D',
  surface: '#F0F9FF',
  bg: '#FFFFFF',
  text: '#0C4A6E',
  textLight: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  departure: { code: string; city: string };
  arrival: { code: string; city: string };
  date: string;
  time: string;
  passenger: string;
  class: string;
  gate: string;
  boardingTime: string;
}

export const MOCK_FLIGHT: FlightInfo = {
  flightNumber: 'KE1234',
  airline: '대한항공',
  departure: { code: 'ICN', city: '인천' },
  arrival: { code: 'NRT', city: '도쿄 나리타' },
  date: '2026-03-12',
  time: '14:30',
  passenger: '홍길동',
  class: '이코노미',
  gate: 'B12',
  boardingTime: '14:00',
};

export interface SeatInfo {
  row: number;
  col: string;
  available: boolean;
  type: 'regular' | 'emergency' | 'front';
  price: number;
}

export const SEAT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function generateAirplaneSeatLayout(): SeatInfo[] {
  const seats: SeatInfo[] = [];
  for (let row = 1; row <= 15; row++) {
    const type = row <= 3 ? 'front' : row === 11 ? 'emergency' : 'regular';
    const price = type === 'front' ? 10000 : type === 'emergency' ? 20000 : 0;
    for (const col of SEAT_COLS) {
      seats.push({
        row,
        col,
        available: Math.random() > 0.35,
        type,
        price,
      });
    }
  }
  return seats;
}

export const EXTRA_BAG_PRICE = 50000;

export interface MealOption {
  id: string;
  name: string;
  description: string;
}

export const MEAL_OPTIONS: MealOption[] = [
  { id: 'none', name: '선택 안함', description: '' },
  { id: 'korean', name: '한식', description: '불고기 비빔밥 + 김치' },
  { id: 'western', name: '양식', description: '치킨 파스타 + 샐러드' },
];

export interface ExtraService {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const EXTRA_SERVICES: ExtraService[] = [
  { id: 'lounge', name: '라운지 이용권', price: 30000, description: '출발 전 비즈니스 라운지 이용' },
  { id: 'insurance', name: '여행자 보험', price: 15000, description: '해외여행 기본 보험' },
];
