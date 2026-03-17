import { formatPrice, calculateTax } from '../../core/utils';

export { formatPrice, calculateTax };

export type ConvenienceScreen =
  | 'welcome'
  | 'scan'
  | 'ageVerify'
  | 'bags'
  | 'orderReview'
  | 'payment'
  | 'receipt'
  | 'complete';

export const CONVENIENCE_SCREEN_ORDER: ConvenienceScreen[] = [
  'welcome', 'scan', 'ageVerify', 'bags',
  'orderReview', 'payment', 'receipt', 'complete',
];

export const CONVENIENCE_THEME = {
  headerBg: '#065F46',
  primary: '#059669',
  accent: '#10B981',
  surface: '#ECFDF5',
  bg: '#F0FDF4',
  text: '#064E3B',
  textLight: '#6B7280',
  border: '#A7F3D0',
  success: '#22C55E',
} as const;

export interface ConvenienceItem {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drink' | 'snack' | 'daily' | 'alcohol';
  ageRestricted: boolean;
  barcode: string;
}

export interface BagOption {
  id: string;
  name: string;
  price: number;
}

export interface ScannedItem {
  item: ConvenienceItem;
  quantity: number;
}

export const CONVENIENCE_ITEMS: ConvenienceItem[] = [
  // Food
  { id: 'item1', name: '삼각김밥 (참치마요)', price: 1200, category: 'food', ageRestricted: false, barcode: '8801234567890' },
  { id: 'item2', name: '컵라면 (신라면)', price: 1500, category: 'food', ageRestricted: false, barcode: '8801234567891' },
  { id: 'item3', name: '도시락 (불고기)', price: 4500, category: 'food', ageRestricted: false, barcode: '8801234567892' },
  { id: 'item4', name: '샌드위치 (에그)', price: 2800, category: 'food', ageRestricted: false, barcode: '8801234567893' },
  // Drinks
  { id: 'item5', name: '생수 500ml', price: 800, category: 'drink', ageRestricted: false, barcode: '8801234567894' },
  { id: 'item6', name: '아이스 아메리카노', price: 1500, category: 'drink', ageRestricted: false, barcode: '8801234567895' },
  { id: 'item7', name: '바나나우유', price: 1200, category: 'drink', ageRestricted: false, barcode: '8801234567896' },
  // Snacks
  { id: 'item8', name: '초코파이', price: 3000, category: 'snack', ageRestricted: false, barcode: '8801234567897' },
  { id: 'item9', name: '감자칩', price: 2000, category: 'snack', ageRestricted: false, barcode: '8801234567898' },
  // Daily
  { id: 'item10', name: '칫솔세트', price: 3500, category: 'daily', ageRestricted: false, barcode: '8801234567899' },
  // Alcohol (age-restricted)
  { id: 'item11', name: '소주', price: 1800, category: 'alcohol', ageRestricted: true, barcode: '8801234567900' },
  { id: 'item12', name: '맥주 500ml', price: 2500, category: 'alcohol', ageRestricted: true, barcode: '8801234567901' },
];

export const BAG_OPTIONS: BagOption[] = [
  { id: 'none', name: '필요 없음', price: 0 },
  { id: 'small', name: '일반 봉투', price: 100 },
  { id: 'large', name: '대형 봉투', price: 200 },
];

export const CATEGORY_LABELS: Record<string, string> = {
  food: '식품',
  drink: '음료',
  snack: '과자',
  daily: '생활용품',
  alcohol: '주류',
};

export function calculateScannedTotal(items: ScannedItem[]): number {
  return items.reduce((sum, s) => sum + s.item.price * s.quantity, 0);
}

export function hasAgeRestrictedItems(items: ScannedItem[]): boolean {
  return items.some((s) => s.item.ageRestricted);
}
