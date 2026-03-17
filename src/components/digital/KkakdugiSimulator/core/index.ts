// ─── Types ───
export type {
  KkakdugiType,
  KkakdugiCategory,
  KkakdugiTheme,
  KkakdugiScreenDef,
  KkakdugiConfig,
  OrderMenuItem,
  OrderOptionGroup,
  OrderOptionItem,
  OrderCartItem,
  ServiceItem,
  PaymentMethod,
  ScreenFlowMap,
  KkakdugiComponentProps,
  KkakdugiSimulatorProps,
  KkakdugiRegistryEntry,
} from './types';

// ─── Components ───
export { default as KkakdugiFrame } from './KkakdugiFrame';
export { default as KkakdugiHelper } from './KkakdugiHelper';

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
