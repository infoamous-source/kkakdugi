import { lazy } from 'react';
import type { KkakdugiType, KkakdugiConfig, KkakdugiRegistryEntry } from './core/types';

// Kkakdugi configurations
const cafeConfig: KkakdugiConfig = {
  id: 'cafe',
  nameKey: 'kkakdugi.types.cafe.name',
  descriptionKey: 'kkakdugi.types.cafe.description',
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
    { id: 'welcome', labelKey: 'kkakdugi.screens.welcome.title', helperKey: 'kkakdugi.helper.welcome' },
    { id: 'dineOption', labelKey: 'kkakdugi.screens.dineOption.title', helperKey: 'kkakdugi.helper.dineOption' },
    { id: 'menu', labelKey: 'kkakdugi.screens.menu.title', helperKey: 'kkakdugi.helper.menu' },
    { id: 'options', labelKey: 'kkakdugi.screens.options.title', helperKey: 'kkakdugi.helper.options' },
    { id: 'orderConfirm', labelKey: 'kkakdugi.screens.orderConfirm.title', helperKey: 'kkakdugi.helper.orderConfirm' },
    { id: 'payment', labelKey: 'kkakdugi.screens.payment.title', helperKey: 'kkakdugi.helper.payment' },
    { id: 'cardPayment', labelKey: 'kkakdugi.screens.cardPayment.title', helperKey: 'kkakdugi.helper.card' },
    { id: 'points', labelKey: 'kkakdugi.screens.points.title', helperKey: 'kkakdugi.helper.points' },
    { id: 'receipt', labelKey: 'kkakdugi.screens.receipt.title', helperKey: 'kkakdugi.helper.receipt' },
    { id: 'complete', labelKey: 'kkakdugi.screens.complete.title', helperKey: 'kkakdugi.helper.complete' },
  ],
};

const fastfoodConfig: KkakdugiConfig = {
  id: 'fastfood',
  nameKey: 'kkakdugi.types.fastfood.name',
  descriptionKey: 'kkakdugi.types.fastfood.description',
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
    { id: 'welcome', labelKey: 'kkakdugi.screens.welcome.title', helperKey: 'kkakdugi.helper.welcome' },
    { id: 'dineOption', labelKey: 'kkakdugi.screens.dineOption.title', helperKey: 'kkakdugi.helper.dineOption' },
    { id: 'menu', labelKey: 'kkakdugi.screens.menu.title', helperKey: 'kkakdugi.helper.menu' },
    { id: 'options', labelKey: 'kkakdugi.screens.options.title', helperKey: 'kkakdugi.helper.options' },
    { id: 'orderConfirm', labelKey: 'kkakdugi.screens.orderConfirm.title', helperKey: 'kkakdugi.helper.orderConfirm' },
    { id: 'payment', labelKey: 'kkakdugi.screens.payment.title', helperKey: 'kkakdugi.helper.payment' },
    { id: 'cardPayment', labelKey: 'kkakdugi.screens.cardPayment.title', helperKey: 'kkakdugi.helper.card' },
    { id: 'points', labelKey: 'kkakdugi.screens.points.title', helperKey: 'kkakdugi.helper.points' },
    { id: 'receipt', labelKey: 'kkakdugi.screens.receipt.title', helperKey: 'kkakdugi.helper.receipt' },
    { id: 'complete', labelKey: 'kkakdugi.screens.complete.title', helperKey: 'kkakdugi.helper.complete' },
  ],
};

const hospitalConfig: KkakdugiConfig = {
  id: 'hospital',
  nameKey: 'kkakdugi.types.hospital.name',
  descriptionKey: 'kkakdugi.types.hospital.description',
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
    { id: 'welcome',     labelKey: 'kkakdugi.screens.welcome.title',           helperKey: 'kkakdugi.helper.hospital.welcome' },
    { id: 'visitType',   labelKey: 'kkakdugi.hospital.screens.visitType.title', helperKey: 'kkakdugi.helper.hospital.visitType' },
    { id: 'department',  labelKey: 'kkakdugi.hospital.screens.department.title',helperKey: 'kkakdugi.helper.hospital.department' },
    { id: 'doctor',      labelKey: 'kkakdugi.hospital.screens.doctor.title',    helperKey: 'kkakdugi.helper.hospital.doctor' },
    { id: 'identity',    labelKey: 'kkakdugi.hospital.screens.identity.title',  helperKey: 'kkakdugi.helper.hospital.identity' },
    { id: 'confirmInfo', labelKey: 'kkakdugi.hospital.screens.confirm.title',   helperKey: 'kkakdugi.helper.hospital.confirmInfo' },
    { id: 'payment',     labelKey: 'kkakdugi.hospital.screens.payment.title',   helperKey: 'kkakdugi.helper.hospital.payment' },
    { id: 'complete',    labelKey: 'kkakdugi.hospital.screens.complete.title',  helperKey: 'kkakdugi.helper.hospital.complete' },
  ],
};

const bankConfig: KkakdugiConfig = {
  id: 'bank',
  nameKey: 'kkakdugi.types.bank.name',
  descriptionKey: 'kkakdugi.types.bank.description',
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
  screens: [
    { id: 'welcome',            labelKey: 'kkakdugi.screens.welcome.title',               helperKey: 'kkakdugi.helper.bank.welcome' },
    { id: 'serviceSelect',      labelKey: 'kkakdugi.bank.screens.serviceSelect.title',     helperKey: 'kkakdugi.helper.bank.serviceSelect' },
    { id: 'accountVerify',      labelKey: 'kkakdugi.bank.screens.accountVerify.title',      helperKey: 'kkakdugi.helper.bank.accountVerify' },
    { id: 'transaction',        labelKey: 'kkakdugi.bank.screens.transaction.title',        helperKey: 'kkakdugi.helper.bank.transaction' },
    { id: 'confirmTransaction', labelKey: 'kkakdugi.bank.screens.confirmTransaction.title', helperKey: 'kkakdugi.helper.bank.confirmTransaction' },
    { id: 'processing',         labelKey: 'kkakdugi.bank.screens.processing.title',         helperKey: 'kkakdugi.helper.bank.processing' },
    { id: 'receipt',            labelKey: 'kkakdugi.bank.screens.receipt.title',             helperKey: 'kkakdugi.helper.bank.receipt' },
    { id: 'complete',           labelKey: 'kkakdugi.bank.screens.complete.title',            helperKey: 'kkakdugi.helper.bank.complete' },
  ],
};

const governmentConfig: KkakdugiConfig = {
  id: 'government',
  nameKey: 'kkakdugi.types.government.name',
  descriptionKey: 'kkakdugi.types.government.description',
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
  screens: [
    { id: 'welcome',         labelKey: 'kkakdugi.screens.welcome.title',                    helperKey: 'kkakdugi.helper.government.welcome' },
    { id: 'identity',        labelKey: 'kkakdugi.government.screens.identity.title',         helperKey: 'kkakdugi.helper.government.identity' },
    { id: 'documentSelect',  labelKey: 'kkakdugi.government.screens.documentSelect.title',   helperKey: 'kkakdugi.helper.government.documentSelect' },
    { id: 'documentOptions', labelKey: 'kkakdugi.government.screens.documentOptions.title',  helperKey: 'kkakdugi.helper.government.documentOptions' },
    { id: 'confirmDocument', labelKey: 'kkakdugi.government.screens.confirmDocument.title',  helperKey: 'kkakdugi.helper.government.confirmDocument' },
    { id: 'payment',         labelKey: 'kkakdugi.government.screens.payment.title',          helperKey: 'kkakdugi.helper.government.payment' },
    { id: 'processing',      labelKey: 'kkakdugi.government.screens.processing.title',       helperKey: 'kkakdugi.helper.government.processing' },
    { id: 'complete',        labelKey: 'kkakdugi.government.screens.complete.title',         helperKey: 'kkakdugi.helper.government.complete' },
  ],
};

const cinemaConfig: KkakdugiConfig = {
  id: 'cinema',
  nameKey: 'kkakdugi.types.cinema.name',
  descriptionKey: 'kkakdugi.types.cinema.description',
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
  screens: [
    { id: 'welcome',     labelKey: 'cinema.screens.welcome.title',     helperKey: 'kkakdugi.helper.cinema.welcome' },
    { id: 'movieSelect', labelKey: 'cinema.screens.movieSelect.title', helperKey: 'kkakdugi.helper.cinema.movieSelect' },
    { id: 'timeSelect',  labelKey: 'cinema.screens.timeSelect.title',  helperKey: 'kkakdugi.helper.cinema.timeSelect' },
    { id: 'seatSelect',  labelKey: 'cinema.screens.seatSelect.title',  helperKey: 'kkakdugi.helper.cinema.seatSelect' },
    { id: 'personCount', labelKey: 'cinema.screens.personCount.title', helperKey: 'kkakdugi.helper.cinema.personCount' },
    { id: 'snackSelect', labelKey: 'cinema.screens.snackSelect.title', helperKey: 'kkakdugi.helper.cinema.snackSelect' },
    { id: 'payment',     labelKey: 'cinema.screens.payment.title',     helperKey: 'kkakdugi.helper.cinema.payment' },
    { id: 'processing',  labelKey: 'cinema.screens.processing.title',  helperKey: 'kkakdugi.helper.cinema.processing' },
    { id: 'complete',    labelKey: 'cinema.screens.complete.title',    helperKey: 'kkakdugi.helper.cinema.complete' },
  ],
};

const convenienceConfig: KkakdugiConfig = {
  id: 'convenience',
  nameKey: 'kkakdugi.types.convenience.name',
  descriptionKey: 'kkakdugi.types.convenience.description',
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
  screens: [
    { id: 'welcome',     labelKey: 'kkakdugi.convenience.screens.welcome.title',     helperKey: 'kkakdugi.helper.convenience.welcome' },
    { id: 'scan',        labelKey: 'kkakdugi.convenience.screens.scan.title',        helperKey: 'kkakdugi.helper.convenience.scan' },
    { id: 'ageVerify',   labelKey: 'kkakdugi.convenience.screens.ageVerify.title',   helperKey: 'kkakdugi.helper.convenience.ageVerify' },
    { id: 'bags',        labelKey: 'kkakdugi.convenience.screens.bags.title',        helperKey: 'kkakdugi.helper.convenience.bags' },
    { id: 'orderReview', labelKey: 'kkakdugi.convenience.screens.orderReview.title', helperKey: 'kkakdugi.helper.convenience.orderReview' },
    { id: 'payment',     labelKey: 'kkakdugi.convenience.screens.payment.title',     helperKey: 'kkakdugi.helper.convenience.payment' },
    { id: 'receipt',     labelKey: 'kkakdugi.convenience.screens.receipt.title',     helperKey: 'kkakdugi.helper.convenience.receipt' },
    { id: 'complete',    labelKey: 'kkakdugi.convenience.screens.complete.title',    helperKey: 'kkakdugi.helper.convenience.complete' },
  ],
};

const airportConfig: KkakdugiConfig = {
  id: 'airport',
  nameKey: 'kkakdugi.types.airport.name',
  descriptionKey: 'kkakdugi.types.airport.description',
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
  screens: [
    { id: 'welcome',       labelKey: 'airport.screens.welcome.title',       helperKey: 'kkakdugi.helper.airport.welcome' },
    { id: 'bookingSearch', labelKey: 'airport.screens.bookingSearch.title', helperKey: 'kkakdugi.helper.airport.bookingSearch' },
    { id: 'flightInfo',    labelKey: 'airport.screens.flightInfo.title',    helperKey: 'kkakdugi.helper.airport.flightInfo' },
    { id: 'seatSelect',    labelKey: 'airport.screens.seatSelect.title',    helperKey: 'kkakdugi.helper.airport.seatSelect' },
    { id: 'baggage',       labelKey: 'airport.screens.baggage.title',       helperKey: 'kkakdugi.helper.airport.baggage' },
    { id: 'extras',        labelKey: 'airport.screens.extras.title',        helperKey: 'kkakdugi.helper.airport.extras' },
    { id: 'confirmAll',    labelKey: 'airport.screens.confirmAll.title',    helperKey: 'kkakdugi.helper.airport.confirmAll' },
    { id: 'payment',       labelKey: 'airport.screens.payment.title',       helperKey: 'kkakdugi.helper.airport.payment' },
    { id: 'processing',    labelKey: 'airport.screens.processing.title',    helperKey: 'kkakdugi.helper.airport.processing' },
    { id: 'complete',      labelKey: 'airport.screens.complete.title',      helperKey: 'kkakdugi.helper.airport.complete' },
  ],
};

// Registry
export const kkakdugiRegistry: Record<KkakdugiType, KkakdugiRegistryEntry> = {
  cafe: {
    config: cafeConfig,
    component: lazy(() => import('./kkakdugis/cafe/CafeKkakdugi')),
  },
  fastfood: {
    config: fastfoodConfig,
    component: lazy(() => import('./kkakdugis/fastfood/FastfoodKkakdugi')),
  },
  hospital: {
    config: hospitalConfig,
    component: lazy(() => import('./kkakdugis/hospital/HospitalKkakdugi')),
  },
  bank: {
    config: bankConfig,
    component: lazy(() => import('./kkakdugis/bank/BankKkakdugi')),
  },
  government: {
    config: governmentConfig,
    component: lazy(() => import('./kkakdugis/government/GovernmentKkakdugi')),
  },
  cinema: {
    config: cinemaConfig,
    component: lazy(() => import('./kkakdugis/cinema/CinemaKkakdugi')),
  },
  convenience: {
    config: convenienceConfig,
    component: lazy(() => import('./kkakdugis/convenience/ConvenienceKkakdugi')),
  },
  airport: {
    config: airportConfig,
    component: lazy(() => import('./kkakdugis/airport/AirportKkakdugi')),
  },
};

export const kkakdugiConfigs = Object.values(kkakdugiRegistry).map(entry => entry.config);

export function getKkakdugiEntry(type: KkakdugiType): KkakdugiRegistryEntry {
  return kkakdugiRegistry[type];
}
