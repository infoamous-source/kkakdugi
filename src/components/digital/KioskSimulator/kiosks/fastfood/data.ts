import type {
  OrderMenuItem,
  OrderOptionGroup,
  OrderCartItem,
  PaymentMethod,
} from '../../core/types';
import { formatPrice, calculateItemPrice, calculateCartTotal, calculateTax } from '../../core/utils';

export type { OrderMenuItem as FastfoodMenuItem, OrderCartItem as FastfoodCartItem };
export { formatPrice, calculateItemPrice, calculateCartTotal, calculateTax };

export type MenuCategory = 'all' | 'burger' | 'set' | 'side' | 'drink' | 'dessert';

export type FastfoodScreen =
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

export const FASTFOOD_SCREEN_ORDER: FastfoodScreen[] = [
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
  { id: 'all',     nameKey: 'kiosk.screens.menu.all',     label: '전체' },
  { id: 'burger',  nameKey: 'kiosk.screens.menu.burger',  label: '버거' },
  { id: 'set',     nameKey: 'kiosk.screens.menu.set',     label: '세트' },
  { id: 'side',    nameKey: 'kiosk.screens.menu.side',    label: '사이드' },
  { id: 'drink',   nameKey: 'kiosk.screens.menu.drink',   label: '음료' },
  { id: 'dessert', nameKey: 'kiosk.screens.menu.dessert', label: '디저트' },
];

// Color palette for placeholder menu item boxes
export const menuItemColors: Record<string, string> = {
  'classic-cheese':        '#D4842F',
  'double-cheese':         '#B86B1D',
  'chicken-burger':        '#C9A04A',
  'bulgogi-burger':        '#8B4513',
  'shrimp-burger':         '#E8956A',
  'spicy-chicken':         '#CC3333',
  'classic-cheese-set':    '#D4842F',
  'double-cheese-set':     '#B86B1D',
  'chicken-set':           '#C9A04A',
  'bulgogi-set':           '#8B4513',
  'fries-m':               '#DAA520',
  'fries-l':               '#DAA520',
  'cheese-stick':          '#E8C44A',
  'nugget-6':              '#C9A04A',
  'onion-ring':            '#B8860B',
  'cola-m':                '#8B0000',
  'cola-l':                '#8B0000',
  'cider-m':               '#2E8B57',
  'icetea-m':              '#CD853F',
  'orange-juice':          '#FF8C00',
  'icecream-cone':         '#F5DEB3',
  'choco-sundae':          '#5C3317',
  'apple-pie':             '#DAA520',
};

export const menuItems: (OrderMenuItem & { category: MenuCategory; color: string })[] = [
  // Burgers
  { id: 'classic-cheese',     nameKey: '클래식 치즈버거',       price: 5500,  category: 'burger',  color: menuItemColors['classic-cheese'] },
  { id: 'double-cheese',      nameKey: '더블 치즈버거',          price: 7800,  category: 'burger',  color: menuItemColors['double-cheese'], popular: true },
  { id: 'chicken-burger',     nameKey: '치킨버거',               price: 6200,  category: 'burger',  color: menuItemColors['chicken-burger'] },
  { id: 'bulgogi-burger',     nameKey: '불고기버거',             price: 5800,  category: 'burger',  color: menuItemColors['bulgogi-burger'] },
  { id: 'shrimp-burger',      nameKey: '새우버거',               price: 6500,  category: 'burger',  color: menuItemColors['shrimp-burger'] },
  { id: 'spicy-chicken',      nameKey: '스파이시 치킨버거',      price: 6800,  category: 'burger',  color: menuItemColors['spicy-chicken'], popular: true },

  // Sets
  { id: 'classic-cheese-set', nameKey: '클래식 치즈버거 세트',   price: 8500,  category: 'set',     color: menuItemColors['classic-cheese-set'] },
  { id: 'double-cheese-set',  nameKey: '더블 치즈버거 세트',     price: 10800, category: 'set',     color: menuItemColors['double-cheese-set'], popular: true },
  { id: 'chicken-set',        nameKey: '치킨버거 세트',          price: 9200,  category: 'set',     color: menuItemColors['chicken-set'] },
  { id: 'bulgogi-set',        nameKey: '불고기버거 세트',        price: 8800,  category: 'set',     color: menuItemColors['bulgogi-set'] },

  // Sides
  { id: 'fries-m',            nameKey: '감자 튀김 (M)',          price: 2500,  category: 'side',    color: menuItemColors['fries-m'] },
  { id: 'fries-l',            nameKey: '감자 튀김 (L)',          price: 3200,  category: 'side',    color: menuItemColors['fries-l'] },
  { id: 'cheese-stick',       nameKey: '치즈스틱 (3pc)',         price: 3000,  category: 'side',    color: menuItemColors['cheese-stick'] },
  { id: 'nugget-6',           nameKey: '너겟 (6pc)',             price: 3500,  category: 'side',    color: menuItemColors['nugget-6'] },
  { id: 'onion-ring',         nameKey: '어니언링',               price: 2800,  category: 'side',    color: menuItemColors['onion-ring'] },

  // Drinks
  { id: 'cola-m',             nameKey: '콜라 (M)',               price: 2000,  category: 'drink',   color: menuItemColors['cola-m'] },
  { id: 'cola-l',             nameKey: '콜라 (L)',               price: 2500,  category: 'drink',   color: menuItemColors['cola-l'] },
  { id: 'cider-m',            nameKey: '사이다 (M)',             price: 2000,  category: 'drink',   color: menuItemColors['cider-m'] },
  { id: 'icetea-m',           nameKey: '아이스티 (M)',           price: 2200,  category: 'drink',   color: menuItemColors['icetea-m'] },
  { id: 'orange-juice',       nameKey: '오렌지 주스',            price: 2800,  category: 'drink',   color: menuItemColors['orange-juice'] },

  // Desserts
  { id: 'icecream-cone',      nameKey: '아이스크림 콘',          price: 1200,  category: 'dessert', color: menuItemColors['icecream-cone'] },
  { id: 'choco-sundae',       nameKey: '초코 선데',              price: 2500,  category: 'dessert', color: menuItemColors['choco-sundae'] },
  { id: 'apple-pie',          nameKey: '애플파이',               price: 2000,  category: 'dessert', color: menuItemColors['apple-pie'] },
];

export const optionGroups: OrderOptionGroup[] = [
  {
    id: 'size-up',
    titleKey: 'kiosk.screens.options.sizeUp',
    required: false,
    multiSelect: false,
    options: [
      { id: 'fries-large',  nameKey: 'kiosk.screens.options.friesLarge',  priceAdd: 800 },
      { id: 'drink-large',  nameKey: 'kiosk.screens.options.drinkLarge',  priceAdd: 700 },
    ],
  },
  {
    id: 'sauce',
    titleKey: 'kiosk.screens.options.sauce',
    required: false,
    multiSelect: true,
    options: [
      { id: 'ketchup',       nameKey: 'kiosk.screens.options.ketchup',       priceAdd: 0 },
      { id: 'mustard',       nameKey: 'kiosk.screens.options.mustard',       priceAdd: 0 },
      { id: 'sweet-chili',   nameKey: 'kiosk.screens.options.sweetChili',   priceAdd: 300 },
      { id: 'garlic-dipping', nameKey: 'kiosk.screens.options.garlicDipping', priceAdd: 300 },
    ],
  },
  {
    id: 'topping',
    titleKey: 'kiosk.screens.options.topping',
    required: false,
    multiSelect: true,
    options: [
      { id: 'add-cheese',  nameKey: 'kiosk.screens.options.addCheese',  priceAdd: 500 },
      { id: 'add-bacon',   nameKey: 'kiosk.screens.options.addBacon',   priceAdd: 1000 },
      { id: 'add-patty',   nameKey: 'kiosk.screens.options.addPatty',   priceAdd: 2500 },
    ],
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'card',      nameKey: 'kiosk.screens.payment.card',      subKey: 'kiosk.screens.payment.cardSub',    icon: 'card' },
  { id: 'app-card',  nameKey: 'kiosk.screens.payment.appCard',   subKey: 'kiosk.screens.payment.appCardSub', icon: 'smartphone' },
  { id: 'kakao-pay', nameKey: 'kiosk.screens.payment.kakaoPay',  icon: 'kakao' },
  { id: 'naver-pay', nameKey: 'kiosk.screens.payment.naverPay',  icon: 'naver' },
];

export const recommendItems = [
  menuItems.find((m) => m.id === 'double-cheese-set')!,
  menuItems.find((m) => m.id === 'spicy-chicken')!,
];

// Fastfood brand theme colors
export const FASTFOOD_THEME = {
  headerBg:     '#8B0000',   // dark red
  primaryBtn:   '#CC0000',   // bright red
  primaryHover: '#AA0000',
  accentGold:   '#FFC107',   // golden yellow
  bgCream:      '#FFF9F0',
  bgCard:       '#FFFFFF',
  borderLight:  '#F0E0D0',
  textDark:     '#1A1A1A',
  textMid:      '#555555',
  textLight:    '#999999',
} as const;
