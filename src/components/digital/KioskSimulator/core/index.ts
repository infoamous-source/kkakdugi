// ─── Types ───
export type {
  KioskType,
  KioskCategory,
  KioskTheme,
  KioskScreenDef,
  KioskConfig,
  OrderMenuItem,
  OrderOptionGroup,
  OrderOptionItem,
  OrderCartItem,
  ServiceItem,
  PaymentMethod,
  ScreenFlowMap,
  KioskComponentProps,
  KioskSimulatorProps,
  KioskRegistryEntry,
} from './types';

// ─── Components ───
export { default as KioskFrame } from './KioskFrame';
export { default as KioskHelper } from './KioskHelper';

// ─── Utilities ───
export {
  formatPrice,
  calculateItemPrice,
  calculateCartTotal,
  calculateTax,
} from './utils';

// ─── Haptic & Audio Feedback ───
export {
  feedbackTap,
  feedbackConfirm,
  feedbackSuccess,
  hapticTap,
  hapticMedium,
  hapticHeavy,
  playTouchSound,
  playBeep,
  playCancel,
} from './haptics';
