import { lazy } from 'react';
import type { KioskType, KioskConfig, KioskRegistryEntry } from './core/types';

// Kiosk configurations
const cafeConfig: KioskConfig = {
  id: 'cafe',
  nameKey: 'kiosk.types.cafe.name',
  descriptionKey: 'kiosk.types.cafe.description',
  icon: '☕',
  difficulty: 1,
  category: 'food',
  theme: {
    primary: 'amber',
    secondary: 'orange',
    accent: 'yellow',
    background: 'bg-amber-50',
    headerBg: 'bg-gradient-to-r from-amber-800 to-amber-900',
    buttonStyle: 'square',
  },
  screens: [
    { id: 'welcome', labelKey: 'kiosk.screens.welcome.title', helperKey: 'kiosk.helper.welcome' },
    { id: 'dineOption', labelKey: 'kiosk.screens.dineOption.title', helperKey: 'kiosk.helper.dineOption' },
    { id: 'menu', labelKey: 'kiosk.screens.menu.title', helperKey: 'kiosk.helper.menu' },
    { id: 'options', labelKey: 'kiosk.screens.options.title', helperKey: 'kiosk.helper.options' },
    { id: 'orderConfirm', labelKey: 'kiosk.screens.orderConfirm.title', helperKey: 'kiosk.helper.orderConfirm' },
    { id: 'payment', labelKey: 'kiosk.screens.payment.title', helperKey: 'kiosk.helper.payment' },
    { id: 'cardPayment', labelKey: 'kiosk.screens.cardPayment.title', helperKey: 'kiosk.helper.card' },
    { id: 'points', labelKey: 'kiosk.screens.points.title', helperKey: 'kiosk.helper.points' },
    { id: 'receipt', labelKey: 'kiosk.screens.receipt.title', helperKey: 'kiosk.helper.receipt' },
    { id: 'complete', labelKey: 'kiosk.screens.complete.title', helperKey: 'kiosk.helper.complete' },
  ],
};

const fastfoodConfig: KioskConfig = {
  id: 'fastfood',
  nameKey: 'kiosk.types.fastfood.name',
  descriptionKey: 'kiosk.types.fastfood.description',
  icon: '🍔',
  difficulty: 2,
  category: 'food',
  theme: {
    primary: 'red',
    secondary: 'yellow',
    accent: 'orange',
    background: 'bg-red-50',
    headerBg: 'bg-gradient-to-r from-red-700 to-red-800',
    buttonStyle: 'square',
  },
  screens: [
    { id: 'welcome', labelKey: 'kiosk.screens.welcome.title', helperKey: 'kiosk.helper.welcome' },
    { id: 'dineOption', labelKey: 'kiosk.screens.dineOption.title', helperKey: 'kiosk.helper.dineOption' },
    { id: 'menu', labelKey: 'kiosk.screens.menu.title', helperKey: 'kiosk.helper.menu' },
    { id: 'options', labelKey: 'kiosk.screens.options.title', helperKey: 'kiosk.helper.options' },
    { id: 'orderConfirm', labelKey: 'kiosk.screens.orderConfirm.title', helperKey: 'kiosk.helper.orderConfirm' },
    { id: 'payment', labelKey: 'kiosk.screens.payment.title', helperKey: 'kiosk.helper.payment' },
    { id: 'cardPayment', labelKey: 'kiosk.screens.cardPayment.title', helperKey: 'kiosk.helper.card' },
    { id: 'points', labelKey: 'kiosk.screens.points.title', helperKey: 'kiosk.helper.points' },
    { id: 'receipt', labelKey: 'kiosk.screens.receipt.title', helperKey: 'kiosk.helper.receipt' },
    { id: 'complete', labelKey: 'kiosk.screens.complete.title', helperKey: 'kiosk.helper.complete' },
  ],
};

const hospitalConfig: KioskConfig = {
  id: 'hospital',
  nameKey: 'kiosk.types.hospital.name',
  descriptionKey: 'kiosk.types.hospital.description',
  icon: '🏥',
  difficulty: 3,
  category: 'public',
  theme: {
    primary: 'teal',
    secondary: 'green',
    accent: 'emerald',
    background: 'bg-teal-50',
    headerBg: 'bg-gradient-to-r from-teal-600 to-teal-700',
    buttonStyle: 'square',
  },
  screens: [
    { id: 'welcome',     labelKey: 'kiosk.screens.welcome.title',           helperKey: 'kiosk.helper.hospital.welcome' },
    { id: 'visitType',   labelKey: 'kiosk.hospital.screens.visitType.title', helperKey: 'kiosk.helper.hospital.visitType' },
    { id: 'department',  labelKey: 'kiosk.hospital.screens.department.title',helperKey: 'kiosk.helper.hospital.department' },
    { id: 'doctor',      labelKey: 'kiosk.hospital.screens.doctor.title',    helperKey: 'kiosk.helper.hospital.doctor' },
    { id: 'identity',    labelKey: 'kiosk.hospital.screens.identity.title',  helperKey: 'kiosk.helper.hospital.identity' },
    { id: 'confirmInfo', labelKey: 'kiosk.hospital.screens.confirm.title',   helperKey: 'kiosk.helper.hospital.confirmInfo' },
    { id: 'payment',     labelKey: 'kiosk.hospital.screens.payment.title',   helperKey: 'kiosk.helper.hospital.payment' },
    { id: 'complete',    labelKey: 'kiosk.hospital.screens.complete.title',  helperKey: 'kiosk.helper.hospital.complete' },
  ],
};

const bankConfig: KioskConfig = {
  id: 'bank',
  nameKey: 'kiosk.types.bank.name',
  descriptionKey: 'kiosk.types.bank.description',
  icon: '🏦',
  difficulty: 3,
  category: 'public',
  theme: {
    primary: 'blue',
    secondary: 'indigo',
    accent: 'sky',
    background: 'bg-blue-50',
    headerBg: 'bg-gradient-to-r from-blue-700 to-blue-800',
    buttonStyle: 'square',
  },
  screens: [],
  comingSoon: true,
};

const governmentConfig: KioskConfig = {
  id: 'government',
  nameKey: 'kiosk.types.government.name',
  descriptionKey: 'kiosk.types.government.description',
  icon: '🏛️',
  difficulty: 3,
  category: 'public',
  theme: {
    primary: 'slate',
    secondary: 'blue',
    accent: 'sky',
    background: 'bg-slate-50',
    headerBg: 'bg-gradient-to-r from-slate-700 to-slate-800',
    buttonStyle: 'square',
  },
  screens: [],
  comingSoon: true,
};

const cinemaConfig: KioskConfig = {
  id: 'cinema',
  nameKey: 'kiosk.types.cinema.name',
  descriptionKey: 'kiosk.types.cinema.description',
  icon: '🎬',
  difficulty: 2,
  category: 'entertainment',
  theme: {
    primary: 'purple',
    secondary: 'indigo',
    accent: 'violet',
    background: 'bg-purple-50',
    headerBg: 'bg-gradient-to-r from-purple-800 to-indigo-900',
    buttonStyle: 'square',
  },
  screens: [],
  comingSoon: true,
};

const convenienceConfig: KioskConfig = {
  id: 'convenience',
  nameKey: 'kiosk.types.convenience.name',
  descriptionKey: 'kiosk.types.convenience.description',
  icon: '🏪',
  difficulty: 2,
  category: 'food',
  theme: {
    primary: 'green',
    secondary: 'emerald',
    accent: 'lime',
    background: 'bg-green-50',
    headerBg: 'bg-gradient-to-r from-green-600 to-green-700',
    buttonStyle: 'square',
  },
  screens: [],
  comingSoon: true,
};

const airportConfig: KioskConfig = {
  id: 'airport',
  nameKey: 'kiosk.types.airport.name',
  descriptionKey: 'kiosk.types.airport.description',
  icon: '✈️',
  difficulty: 4,
  category: 'transport',
  theme: {
    primary: 'sky',
    secondary: 'blue',
    accent: 'cyan',
    background: 'bg-sky-50',
    headerBg: 'bg-gradient-to-r from-sky-700 to-blue-800',
    buttonStyle: 'square',
  },
  screens: [],
  comingSoon: true,
};

// Registry
export const kioskRegistry: Record<KioskType, KioskRegistryEntry> = {
  cafe: {
    config: cafeConfig,
    component: lazy(() => import('./kiosks/cafe/CafeKiosk')),
  },
  fastfood: {
    config: fastfoodConfig,
    component: lazy(() => import('./kiosks/fastfood/FastfoodKiosk')),
  },
  hospital: {
    config: hospitalConfig,
    component: lazy(() => import('./kiosks/hospital/HospitalKiosk')),
  },
  bank: {
    config: bankConfig,
    component: lazy(() => import('./kiosks/cafe/CafeKiosk')), // placeholder
  },
  government: {
    config: governmentConfig,
    component: lazy(() => import('./kiosks/cafe/CafeKiosk')), // placeholder
  },
  cinema: {
    config: cinemaConfig,
    component: lazy(() => import('./kiosks/cafe/CafeKiosk')), // placeholder
  },
  convenience: {
    config: convenienceConfig,
    component: lazy(() => import('./kiosks/cafe/CafeKiosk')), // placeholder
  },
  airport: {
    config: airportConfig,
    component: lazy(() => import('./kiosks/cafe/CafeKiosk')), // placeholder
  },
};

export const kioskConfigs = Object.values(kioskRegistry).map(entry => entry.config);

export function getKioskEntry(type: KioskType): KioskRegistryEntry {
  return kioskRegistry[type];
}
