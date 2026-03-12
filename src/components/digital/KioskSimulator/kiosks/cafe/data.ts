import type {
  OrderMenuItem,
  OrderOptionGroup,
  OrderCartItem,
  PaymentMethod,
} from '../../core/types';
import { formatPrice, calculateItemPrice, calculateCartTotal, calculateTax } from '../../core/utils';

export type { OrderMenuItem as CafeMenuItem, OrderCartItem as CafeCartItem };
export { formatPrice, calculateItemPrice, calculateCartTotal, calculateTax };

export type MenuCategory = 'all' | 'coffee' | 'decaf' | 'smoothie' | 'tea' | 'dessert';

export type CafeScreen =
  | 'welcome'
  | 'dineOption'
  | 'menu'
  | 'options'
  | 'orderConfirm'
  | 'payment'
  | 'cardPayment'
  | 'points'
  | 'receipt'
  | 'complete';

export const CAFE_SCREEN_ORDER: CafeScreen[] = [
  'welcome',
  'dineOption',
  'menu',
  'options',
  'orderConfirm',
  'payment',
  'cardPayment',
  'points',
  'receipt',
  'complete',
];

export const categories: { id: MenuCategory; nameKey: string; label: string }[] = [
  { id: 'all', nameKey: 'kiosk.screens.menu.all', label: '전체' },
  { id: 'coffee', nameKey: 'kiosk.screens.menu.coffee', label: '커피' },
  { id: 'decaf', nameKey: 'kiosk.screens.menu.decaf', label: '디카페인' },
  { id: 'smoothie', nameKey: 'kiosk.screens.menu.smoothie', label: '스무디' },
  { id: 'tea', nameKey: 'kiosk.screens.menu.tea', label: '티' },
  { id: 'dessert', nameKey: 'kiosk.screens.menu.dessert', label: '디저트' },
];

// Color palette for placeholder menu item boxes
export const menuItemColors: Record<string, string> = {
  'americano-ice':      '#5B8DB8',  // icy blue
  'hazelnut-ice':       '#8B6914',  // hazelnut brown
  'vanilla-ice':        '#C9A84C',  // vanilla gold
  'espresso-s':         '#3D1C0A',  // dark espresso
  'espresso-m':         '#5C2C10',  // medium espresso
  'hazelnut-hot':       '#7A4B1A',  // warm hazelnut
  'decaf-americano':    '#6A9E6A',  // muted green
  'decaf-latte':        '#8EB88E',  // light sage
  'strawberry-smoothie':'#D9506B',  // berry pink
  'pear-smoothie':      '#B8C96A',  // pear yellow-green
  'green-tea':          '#4A8C5A',  // matcha green
  'chamomile':          '#D4A845',  // chamomile gold
  'macaron':            '#E88CA0',  // macaron pink
  'cookie':             '#A0693A',  // cookie brown
};

export const menuItems: (OrderMenuItem & { category: MenuCategory; color: string })[] = [
  { id: 'americano-ice',       nameKey: '아메리카노 (ICE)',            price: 4000, category: 'coffee',   color: menuItemColors['americano-ice'] },
  { id: 'hazelnut-ice',        nameKey: '헤이즐넛 아메리카노 (ICE)',   price: 6000, category: 'coffee',   color: menuItemColors['hazelnut-ice'] },
  { id: 'vanilla-ice',         nameKey: '바닐라 아메리카노 (ICE)',     price: 6000, category: 'coffee',   color: menuItemColors['vanilla-ice'] },
  { id: 'espresso-s',          nameKey: '에스프레소 (소)',              price: 6000, category: 'coffee',   color: menuItemColors['espresso-s'] },
  { id: 'espresso-m',          nameKey: '에스프레소 (중)',              price: 7000, category: 'coffee',   color: menuItemColors['espresso-m'] },
  { id: 'hazelnut-hot',        nameKey: '헤이즐넛 아메리카노 (HOT)',   price: 8000, category: 'coffee',   color: menuItemColors['hazelnut-hot'] },
  { id: 'decaf-americano',     nameKey: '디카페인 아메리카노',          price: 4500, category: 'decaf',    color: menuItemColors['decaf-americano'] },
  { id: 'decaf-latte',         nameKey: '디카페인 카페라떼',            price: 5500, category: 'decaf',    color: menuItemColors['decaf-latte'] },
  { id: 'strawberry-smoothie', nameKey: '딸기 스무디',                  price: 8000, category: 'smoothie', color: menuItemColors['strawberry-smoothie'] },
  { id: 'pear-smoothie',       nameKey: '배꿀 스무디',                  price: 8000, category: 'smoothie', color: menuItemColors['pear-smoothie'] },
  { id: 'green-tea',           nameKey: '그린티 라떼',                  price: 5500, category: 'tea',      color: menuItemColors['green-tea'] },
  { id: 'chamomile',           nameKey: '캐모마일 티',                  price: 5000, category: 'tea',      color: menuItemColors['chamomile'] },
  { id: 'macaron',             nameKey: '딸기크림 바사삭 마카롱',       price: 6000, category: 'dessert',  color: menuItemColors['macaron'], popular: true },
  { id: 'cookie',              nameKey: '초코칩 쿠키',                  price: 3500, category: 'dessert',  color: menuItemColors['cookie'] },
];

export const optionGroups: OrderOptionGroup[] = [
  {
    id: 'tumbler',
    titleKey: 'kiosk.screens.options.tumbler',
    required: false,
    multiSelect: false,
    options: [
      { id: 'personal-cup', nameKey: 'kiosk.screens.options.personalCup', priceAdd: 0 },
    ],
  },
  {
    id: 'shot',
    titleKey: 'kiosk.screens.options.shot',
    required: false,
    multiSelect: false,
    options: [
      { id: 'extra-shot',  nameKey: 'kiosk.screens.options.addShot',       priceAdd: 500 },
      { id: 'double-shot', nameKey: 'kiosk.screens.options.addDoubleShot', priceAdd: 1000 },
    ],
  },
  {
    id: 'sweetness',
    titleKey: 'kiosk.screens.options.sweetness',
    required: false,
    multiSelect: false,
    options: [
      { id: 'vanilla-syrup',  nameKey: 'kiosk.screens.options.vanillaSyrup',  priceAdd: 700 },
      { id: 'caramel-syrup',  nameKey: 'kiosk.screens.options.caramelSyrup',  priceAdd: 700 },
      { id: 'hazelnut-syrup', nameKey: 'kiosk.screens.options.hazelnutSyrup', priceAdd: 700 },
    ],
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'card',       nameKey: 'kiosk.screens.payment.card',      subKey: 'kiosk.screens.payment.cardSub',    icon: 'card' },
  { id: 'app-card',   nameKey: 'kiosk.screens.payment.appCard',   subKey: 'kiosk.screens.payment.appCardSub', icon: 'smartphone' },
  { id: 'kakao-pay',  nameKey: 'kiosk.screens.payment.kakaoPay',  icon: 'kakao' },
  { id: 'naver-pay',  nameKey: 'kiosk.screens.payment.naverPay',  icon: 'naver' },
];

export const recommendItems = [
  menuItems.find((m) => m.id === 'macaron')!,
  menuItems.find((m) => m.id === 'strawberry-smoothie')!,
];

// Cafe brand theme colors
export const CAFE_THEME = {
  headerBg:    '#3D2B1F',   // dark brown
  primaryBtn:  '#9C6B3C',   // warm amber-brown
  primaryHover:'#7A5230',
  accentGold:  '#C89B3C',
  bgCream:     '#FFF8F0',
  bgCard:      '#FFFFFF',
  borderLight: '#E8D5C0',
  textDark:    '#2C1A0E',
  textMid:     '#6B4E35',
  textLight:   '#9E7E6A',
} as const;
