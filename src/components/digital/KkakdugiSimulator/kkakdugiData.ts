export type MenuCategory = 'all' | 'coffee' | 'decaf' | 'smoothie' | 'tea' | 'dessert';

export interface MenuItem {
  id: string;
  nameKey: string;
  emoji: string;
  price: number;
  category: MenuCategory;
}

export interface OptionGroup {
  id: string;
  titleKey: string;
  options: OptionItem[];
}

export interface OptionItem {
  id: string;
  nameKey: string;
  emoji: string;
  priceAdd: number;
}

export interface CartItem {
  menuItem: MenuItem;
  selectedOptions: OptionItem[];
  quantity: number;
  totalPrice: number;
}

export interface PaymentMethod {
  id: string;
  nameKey: string;
  subKey?: string;
  emoji: string;
}

export const categories: { id: MenuCategory; nameKey: string }[] = [
  { id: 'all', nameKey: 'kkakdugi.screens.menu.all' },
  { id: 'coffee', nameKey: 'kkakdugi.screens.menu.coffee' },
  { id: 'decaf', nameKey: 'kkakdugi.screens.menu.decaf' },
  { id: 'smoothie', nameKey: 'kkakdugi.screens.menu.smoothie' },
  { id: 'tea', nameKey: 'kkakdugi.screens.menu.tea' },
  { id: 'dessert', nameKey: 'kkakdugi.screens.menu.dessert' },
];

export const menuItems: MenuItem[] = [
  { id: 'americano-ice', nameKey: '아메리카노 (ICE)', emoji: '🧊☕', price: 4000, category: 'coffee' },
  { id: 'hazelnut-ice', nameKey: '헤이즐넛 아메리카노 (ICE)', emoji: '🌰☕', price: 6000, category: 'coffee' },
  { id: 'vanilla-ice', nameKey: '바닐라 아메리카노 (ICE)', emoji: '🍦☕', price: 6000, category: 'coffee' },
  { id: 'espresso-s', nameKey: '에스프레소(소)', emoji: '☕', price: 6000, category: 'coffee' },
  { id: 'espresso-m', nameKey: '에스프레소(중)', emoji: '☕☕', price: 7000, category: 'coffee' },
  { id: 'hazelnut-hot', nameKey: '헤이즐넛 아메리카노 (HOT)', emoji: '🔥🌰', price: 8000, category: 'coffee' },
  { id: 'decaf-americano', nameKey: '디카페인 아메리카노', emoji: '💚☕', price: 4500, category: 'decaf' },
  { id: 'decaf-latte', nameKey: '디카페인 카페라떼', emoji: '💚🥛', price: 5500, category: 'decaf' },
  { id: 'strawberry-smoothie', nameKey: '딸기 스무디', emoji: '🍓', price: 8000, category: 'smoothie' },
  { id: 'pear-smoothie', nameKey: '배꿀 스무디', emoji: '🍐🍯', price: 8000, category: 'smoothie' },
  { id: 'green-tea', nameKey: '그린티 라떼', emoji: '🍵', price: 5500, category: 'tea' },
  { id: 'chamomile', nameKey: '캐모마일 티', emoji: '🌼', price: 5000, category: 'tea' },
  { id: 'macaron', nameKey: '딸기크림 바사삭 마카롱', emoji: '🧁', price: 6000, category: 'dessert' },
  { id: 'cookie', nameKey: '초코칩 쿠키', emoji: '🍪', price: 3500, category: 'dessert' },
];

export const optionGroups: OptionGroup[] = [
  {
    id: 'tumbler',
    titleKey: 'kkakdugi.screens.options.tumbler',
    options: [
      { id: 'personal-cup', nameKey: 'kkakdugi.screens.options.personalCup', emoji: '🥤', priceAdd: 0 },
    ],
  },
  {
    id: 'shot',
    titleKey: 'kkakdugi.screens.options.shot',
    options: [
      { id: 'extra-shot', nameKey: 'kkakdugi.screens.options.addShot', emoji: '☕', priceAdd: 500 },
      { id: 'double-shot', nameKey: 'kkakdugi.screens.options.addDoubleShot', emoji: '☕☕', priceAdd: 1000 },
    ],
  },
  {
    id: 'sweetness',
    titleKey: 'kkakdugi.screens.options.sweetness',
    options: [
      { id: 'vanilla-syrup', nameKey: 'kkakdugi.screens.options.vanillaSyrup', emoji: '🍶', priceAdd: 700 },
      { id: 'caramel-syrup', nameKey: 'kkakdugi.screens.options.caramelSyrup', emoji: '🍮', priceAdd: 700 },
      { id: 'hazelnut-syrup', nameKey: 'kkakdugi.screens.options.hazelnutSyrup', emoji: '🌰', priceAdd: 700 },
    ],
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'card', nameKey: 'kkakdugi.screens.payment.card', subKey: 'kkakdugi.screens.payment.cardSub', emoji: '💳' },
  { id: 'app-card', nameKey: 'kkakdugi.screens.payment.appCard', subKey: 'kkakdugi.screens.payment.appCardSub', emoji: '📱' },
  { id: 'kakao-pay', nameKey: 'kkakdugi.screens.payment.kakaoPay', emoji: '💛' },
  { id: 'naver-pay', nameKey: 'kkakdugi.screens.payment.naverPay', emoji: '💚' },
];

export const recommendItems: MenuItem[] = [
  menuItems.find((m) => m.id === 'macaron')!,
  menuItems.find((m) => m.id === 'strawberry-smoothie')!,
];

export type KkakdugiScreen =
  | 'welcome'
  | 'menu'
  | 'options'
  | 'orderConfirm'
  | 'payment'
  | 'cardPayment'
  | 'points'
  | 'receipt'
  | 'complete';

export const SCREEN_ORDER: KkakdugiScreen[] = [
  'welcome',
  'menu',
  'options',
  'orderConfirm',
  'payment',
  'cardPayment',
  'points',
  'receipt',
  'complete',
];

export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function calculateItemPrice(item: MenuItem, options: OptionItem[]): number {
  return item.price + options.reduce((sum, opt) => sum + opt.priceAdd, 0);
}

export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
}

export function calculateTax(total: number): { amount: number; tax: number } {
  const tax = Math.round(total / 11);
  return { amount: total - tax, tax };
}
