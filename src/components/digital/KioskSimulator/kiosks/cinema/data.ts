import { formatPrice } from '../../core/utils';

export { formatPrice };

export type CinemaScreen =
  | 'welcome'
  | 'movieSelect'
  | 'timeSelect'
  | 'seatSelect'
  | 'personCount'
  | 'snackSelect'
  | 'payment'
  | 'processing'
  | 'complete';

export const CINEMA_SCREEN_ORDER: CinemaScreen[] = [
  'welcome', 'movieSelect', 'timeSelect', 'seatSelect',
  'personCount', 'snackSelect', 'payment', 'processing', 'complete',
];

export const CINEMA_THEME = {
  headerBg: '#1A0A2E',
  primary: '#4C1D95',
  accent: '#7C3AED',
  gold: '#FDE68A',
  surface: '#F5F3FF',
  bg: '#0F0A1A',
  text: '#F8FAFC',
  textDark: '#1E1B4B',
  success: '#10B981',
} as const;

export type MovieRating = 'ALL' | '12' | '15' | '18';

export interface Movie {
  id: string;
  title: string;
  rating: MovieRating;
  genre: string;
  duration: number;
  color: string;
}

export interface Showtime {
  id: string;
  time: string;
  theater: number;
  format: '2D' | '3D';
  availableSeats: number;
  totalSeats: number;
}

export interface SnackItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Seat {
  row: string;
  col: number;
  taken: boolean;
}

export const MOVIES: Movie[] = [
  { id: 'movie1', title: '별빛 여행자', rating: 'ALL', genre: '애니메이션', duration: 108, color: '#3B82F6' },
  { id: 'movie2', title: '마지막 전사', rating: '15', genre: '액션', duration: 132, color: '#EF4444' },
  { id: 'movie3', title: '사랑의 계절', rating: '12', genre: '로맨스', duration: 118, color: '#EC4899' },
  { id: 'movie4', title: '어둠 속의 빛', rating: '15', genre: '스릴러', duration: 125, color: '#1F2937' },
  { id: 'movie5', title: '웃음 특급', rating: 'ALL', genre: '코미디', duration: 98, color: '#F59E0B' },
  { id: 'movie6', title: '시간의 문', rating: '12', genre: 'SF', duration: 141, color: '#8B5CF6' },
];

export const SHOWTIMES: Record<string, Showtime[]> = {
  movie1: [
    { id: 'st1', time: '10:30', theater: 3, format: '2D', availableSeats: 42, totalSeats: 120 },
    { id: 'st2', time: '13:00', theater: 5, format: '2D', availableSeats: 28, totalSeats: 120 },
    { id: 'st3', time: '15:30', theater: 3, format: '3D', availableSeats: 55, totalSeats: 120 },
    { id: 'st4', time: '18:00', theater: 7, format: '2D', availableSeats: 15, totalSeats: 120 },
    { id: 'st5', time: '20:30', theater: 5, format: '2D', availableSeats: 8, totalSeats: 120 },
  ],
  movie2: [
    { id: 'st6', time: '11:00', theater: 1, format: '2D', availableSeats: 60, totalSeats: 150 },
    { id: 'st7', time: '14:00', theater: 2, format: '3D', availableSeats: 35, totalSeats: 120 },
    { id: 'st8', time: '17:00', theater: 1, format: '2D', availableSeats: 22, totalSeats: 150 },
    { id: 'st9', time: '19:30', theater: 4, format: '3D', availableSeats: 10, totalSeats: 120 },
  ],
  movie3: [
    { id: 'st10', time: '10:00', theater: 6, format: '2D', availableSeats: 70, totalSeats: 120 },
    { id: 'st11', time: '12:30', theater: 6, format: '2D', availableSeats: 45, totalSeats: 120 },
    { id: 'st12', time: '15:00', theater: 8, format: '2D', availableSeats: 30, totalSeats: 120 },
    { id: 'st13', time: '19:00', theater: 6, format: '2D', availableSeats: 18, totalSeats: 120 },
  ],
  movie4: [
    { id: 'st14', time: '11:30', theater: 2, format: '2D', availableSeats: 50, totalSeats: 120 },
    { id: 'st15', time: '14:30', theater: 4, format: '2D', availableSeats: 38, totalSeats: 120 },
    { id: 'st16', time: '18:30', theater: 2, format: '2D', availableSeats: 12, totalSeats: 120 },
    { id: 'st17', time: '21:00', theater: 4, format: '2D', availableSeats: 25, totalSeats: 120 },
  ],
  movie5: [
    { id: 'st18', time: '10:00', theater: 7, format: '2D', availableSeats: 80, totalSeats: 120 },
    { id: 'st19', time: '13:30', theater: 7, format: '2D', availableSeats: 55, totalSeats: 120 },
    { id: 'st20', time: '16:00', theater: 3, format: '2D', availableSeats: 40, totalSeats: 120 },
    { id: 'st21', time: '19:00', theater: 7, format: '2D', availableSeats: 20, totalSeats: 120 },
  ],
  movie6: [
    { id: 'st22', time: '10:30', theater: 8, format: '3D', availableSeats: 65, totalSeats: 120 },
    { id: 'st23', time: '13:30', theater: 1, format: '2D', availableSeats: 48, totalSeats: 150 },
    { id: 'st24', time: '16:30', theater: 8, format: '3D', availableSeats: 32, totalSeats: 120 },
    { id: 'st25', time: '19:30', theater: 1, format: '2D', availableSeats: 14, totalSeats: 150 },
    { id: 'st26', time: '22:00', theater: 8, format: '3D', availableSeats: 50, totalSeats: 120 },
  ],
};

export const TICKET_PRICES = {
  adult: 13000,
  youth: 10000,
  senior: 9000,
};

export const SNACKS: SnackItem[] = [
  { id: 'popcorn_s', name: '팝콘 (소)', price: 4000, description: '바삭한 오리지널 팝콘' },
  { id: 'popcorn_m', name: '팝콘 (중)', price: 5500, description: '넉넉한 중간 사이즈' },
  { id: 'popcorn_l', name: '팝콘 (대)', price: 7000, description: '대용량 팝콘' },
  { id: 'drink_s', name: '음료 (소)', price: 3000, description: '콜라/사이다 선택' },
  { id: 'drink_m', name: '음료 (중)', price: 4000, description: '콜라/사이다 선택' },
  { id: 'drink_l', name: '음료 (대)', price: 5000, description: '콜라/사이다 선택' },
  { id: 'combo1', name: '커플 콤보', price: 12000, description: '팝콘(대) + 음료(중) 2개' },
  { id: 'combo2', name: '싱글 콤보', price: 8000, description: '팝콘(중) + 음료(중) 1개' },
];

export function generateSeatLayout(): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seats: Seat[] = [];
  rows.forEach(row => {
    for (let col = 1; col <= 8; col++) {
      seats.push({ row, col, taken: Math.random() < 0.3 });
    }
  });
  return seats;
}

export const RATING_COLORS: Record<MovieRating, { bg: string; text: string }> = {
  ALL: { bg: '#22C55E', text: '#FFFFFF' },
  '12': { bg: '#3B82F6', text: '#FFFFFF' },
  '15': { bg: '#F59E0B', text: '#1F2937' },
  '18': { bg: '#EF4444', text: '#FFFFFF' },
};

export const RATING_LABELS: Record<MovieRating, string> = {
  ALL: '전체',
  '12': '12세',
  '15': '15세',
  '18': '18세',
};
