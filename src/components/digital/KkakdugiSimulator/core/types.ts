import type { ComponentType, LazyExoticComponent } from 'react';

// ─── Kiosk type identifiers ───

export type KioskCategory = 'food' | 'public' | 'entertainment' | 'transport';

export type KioskType =
  | 'cafe'
  | 'fastfood'
  | 'hospital'
  | 'bank'
  | 'government'
  | 'cinema'
  | 'convenience'
  | 'airport';

// ─── Theme configuration per kiosk ───

export interface KioskTheme {
  /** Tailwind color name prefix (e.g. 'amber', 'blue', 'emerald') */
  primary: string;
  secondary: string;
  accent: string;
  /** CSS class string for background (e.g. 'bg-amber-50') */
  background: string;
  /** CSS class string for header background (e.g. 'bg-amber-600') */
  headerBg: string;
  buttonStyle: 'rounded' | 'square';
}

// ─── Screen definition ───

export interface KioskScreenDef {
  id: string;
  /** i18n key for the screen label shown in the step bar */
  labelKey: string;
  /** i18n key for the helper bubble message */
  helperKey: string;
}

// ─── Kiosk configuration (each kiosk type provides one) ───

export interface KioskConfig {
  id: KioskType;
  /** i18n key for the kiosk display name */
  nameKey: string;
  /** i18n key for the kiosk description */
  descriptionKey: string;
  /** Emoji or icon identifier shown in the selector */
  icon: string;
  /** 1 = easiest, 4 = most complex */
  difficulty: 1 | 2 | 3 | 4;
  category: KioskCategory;
  theme: KioskTheme;
  screens: KioskScreenDef[];
  comingSoon?: boolean;
}

// ─── Order-type kiosks (cafe, fastfood, convenience) ───

export interface OrderMenuItem {
  id: string;
  nameKey: string;
  /** Path to product image (preferred over emoji) */
  image?: string;
  /** Fallback when no image is available */
  emoji?: string;
  price: number;
  category: string;
  description?: string;
  popular?: boolean;
}

export interface OrderOptionGroup {
  id: string;
  titleKey: string;
  required?: boolean;
  multiSelect?: boolean;
  options: OrderOptionItem[];
}

export interface OrderOptionItem {
  id: string;
  nameKey: string;
  image?: string;
  emoji?: string;
  priceAdd: number;
}

export interface OrderCartItem {
  menuItem: OrderMenuItem;
  selectedOptions: OrderOptionItem[];
  quantity: number;
  totalPrice: number;
}

// ─── Service-type kiosks (hospital, bank, government) ───

export interface ServiceItem {
  id: string;
  nameKey: string;
  descriptionKey?: string;
  icon: string;
  subItems?: ServiceItem[];
}

// ─── Payment methods (shared across all ordering kiosks) ───

export interface PaymentMethod {
  id: string;
  nameKey: string;
  subKey?: string;
  /** Image path or emoji */
  icon: string;
}

// ─── Shared utility types ───

/** Maps a screen id to the next screen id, or null if terminal */
export type ScreenFlowMap = Record<string, string | null>;

// ─── Component props ───

export interface KioskComponentProps {
  onClose: () => void;
  onComplete: () => void;
}

// ─── Legacy alias kept for backwards compatibility with KioskSimulator.tsx ───
export type KioskSimulatorProps = KioskComponentProps & {
  config?: KioskConfig;
};

// ─── Registry entry for dynamic kiosk loading ───

export interface KioskRegistryEntry {
  config: KioskConfig;
  component: LazyExoticComponent<ComponentType<KioskComponentProps>>;
}
