// ==========================================
// OrthoSync - Multi-Theme System
// 6 Themes: Glass White, Green Glass, Ocean Blue, Dark Neon, Purple Haze, Light Green
// ==========================================

export type ThemeName = 'glass_white' | 'green_glass' | 'ocean_blue' | 'dark_neon' | 'purple_haze' | 'light_green';

export interface ThemeColors {
  // Primary palette
  primary: {
    50: string; 100: string; 200: string; 300: string; 400: string;
    500: string; 600: string; 700: string; 800: string; 900: string;
  };
  accent: { light: string; main: string; dark: string };

  // Glass
  glass: {
    white: string; whiteMedium: string; whiteStrong: string; whiteSolid: string;
    dark: string; darkMedium: string;
    tint: string; tintMedium: string; tintStrong: string;
    border: string; borderLight: string;
  };

  // Gradients
  gradient: {
    primary: readonly [string, string, string];
    light: readonly [string, string, string];
    accent: readonly [string, string, string];
  };

  // Semantic
  success: string; warning: string; error: string; info: string;

  // Status
  status: {
    scheduled: string; completed: string; missed: string;
    cancelled: string; hold: string; inProgress: string;
    pending: string; paid: string; overdue: string;
  };

  // Text
  text: {
    primary: string; secondary: string; tertiary: string;
    dark: string; darkSecondary: string;
    onGlass: string; onLight: string;
  };

  // Background
  background: { primary: string; secondary: string; card: string; input: string };

  white: string; black: string; transparent: string;

  // Tab bar
  tabBar: { background: string; active: string; inactive: string };

  // Blur tint
  blurTint: 'light' | 'dark' | 'default';
}

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  labelHi: string;
  emoji: string;
  description: string;
  colors: ThemeColors;
}

// ─── 1. GLASS WHITE (Default) ────────────────────────────

const glassWhite: ThemeConfig = {
  name: 'glass_white',
  label: 'Glass White',
  labelHi: 'ग्लास व्हाइट',
  emoji: '🤍',
  description: 'Clean frosted glass with soft neutrals',
  colors: {
    primary: {
      50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD',
      500: '#9E9E9E', 600: '#757575', 700: '#616161', 800: '#424242', 900: '#212121',
    },
    accent: { light: '#B2EBF2', main: '#26C6DA', dark: '#00ACC1' },
    glass: {
      white: 'rgba(255,255,255,0.55)', whiteMedium: 'rgba(255,255,255,0.70)',
      whiteStrong: 'rgba(255,255,255,0.85)', whiteSolid: 'rgba(255,255,255,0.95)',
      dark: 'rgba(0,0,0,0.03)', darkMedium: 'rgba(0,0,0,0.06)',
      tint: 'rgba(38,198,218,0.10)', tintMedium: 'rgba(38,198,218,0.18)', tintStrong: 'rgba(38,198,218,0.30)',
      border: 'rgba(255,255,255,0.70)', borderLight: 'rgba(255,255,255,0.50)',
    },
    gradient: {
      primary: ['#E8EAF0', '#DEE2E8', '#D5DAE1'] as const,
      light: ['#FAFAFA', '#F5F5F5', '#EEEEEE'] as const,
      accent: ['#00ACC1', '#26C6DA', '#B2EBF2'] as const,
    },
    success: '#2E7D32', warning: '#E65100', error: '#C62828', info: '#1565C0',
    status: {
      scheduled: '#1565C0', completed: '#2E7D32', missed: '#C62828',
      cancelled: '#757575', hold: '#E65100', inProgress: '#00838F',
      pending: '#F9A825', paid: '#2E7D32', overdue: '#C62828',
    },
    text: {
      primary: '#1A1A2E', secondary: 'rgba(26,26,46,0.65)', tertiary: 'rgba(26,26,46,0.45)',
      dark: '#1A1A2E', darkSecondary: '#424242', onGlass: '#1A1A2E', onLight: '#1A1A2E',
    },
    background: {
      primary: '#E8EAF0', secondary: '#F5F5F5',
      card: 'rgba(255,255,255,0.60)', input: 'rgba(255,255,255,0.50)',
    },
    white: '#FFFFFF', black: '#000000', transparent: 'transparent',
    tabBar: { background: 'rgba(255,255,255,0.85)', active: '#00ACC1', inactive: 'rgba(26,26,46,0.40)' },
    blurTint: 'default',
  },
};

// ─── 2. GREEN GLASS ──────────────────────────────────────

const greenGlass: ThemeConfig = {
  name: 'green_glass',
  label: 'Green Glass',
  labelHi: 'हरा ग्लास',
  emoji: '🟢',
  description: 'Dark green gradient with frosted glass',
  colors: {
    primary: {
      50: '#E8F5E9', 100: '#C8E6C9', 200: '#A5D6A7', 300: '#81C784', 400: '#66BB6A',
      500: '#4CAF50', 600: '#43A047', 700: '#388E3C', 800: '#2E7D32', 900: '#1B5E20',
    },
    accent: { light: '#69F0AE', main: '#00E676', dark: '#00C853' },
    glass: {
      white: 'rgba(255,255,255,0.15)', whiteMedium: 'rgba(255,255,255,0.25)',
      whiteStrong: 'rgba(255,255,255,0.40)', whiteSolid: 'rgba(255,255,255,0.70)',
      dark: 'rgba(0,0,0,0.10)', darkMedium: 'rgba(0,0,0,0.20)',
      tint: 'rgba(76,175,80,0.15)', tintMedium: 'rgba(76,175,80,0.30)', tintStrong: 'rgba(76,175,80,0.50)',
      border: 'rgba(255,255,255,0.30)', borderLight: 'rgba(255,255,255,0.18)',
    },
    gradient: {
      primary: ['#1B5E20', '#2E7D32', '#43A047'] as const,
      light: ['#E8F5E9', '#C8E6C9', '#A5D6A7'] as const,
      accent: ['#00C853', '#00E676', '#69F0AE'] as const,
    },
    success: '#4CAF50', warning: '#FF9800', error: '#F44336', info: '#2196F3',
    status: {
      scheduled: '#2196F3', completed: '#4CAF50', missed: '#F44336',
      cancelled: '#9E9E9E', hold: '#FF9800', inProgress: '#00BCD4',
      pending: '#FFC107', paid: '#4CAF50', overdue: '#F44336',
    },
    text: {
      primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.80)', tertiary: 'rgba(255,255,255,0.60)',
      dark: '#1A1A1A', darkSecondary: '#4A4A4A', onGlass: '#FFFFFF', onLight: '#1B5E20',
    },
    background: {
      primary: '#1B5E20', secondary: '#E8F5E9',
      card: 'rgba(255,255,255,0.15)', input: 'rgba(255,255,255,0.12)',
    },
    white: '#FFFFFF', black: '#000000', transparent: 'transparent',
    tabBar: { background: 'rgba(27,94,32,0.95)', active: '#00E676', inactive: 'rgba(255,255,255,0.60)' },
    blurTint: 'light',
  },
};

// ─── 2. OCEAN BLUE ───────────────────────────────────────

const oceanBlue: ThemeConfig = {
  name: 'ocean_blue',
  label: 'Ocean Blue',
  labelHi: 'समुद्री नीला',
  emoji: '🔵',
  description: 'Light blue glassmorphism with gradient cards',
  colors: {
    primary: {
      50: '#E3F2FD', 100: '#BBDEFB', 200: '#90CAF9', 300: '#64B5F6', 400: '#42A5F5',
      500: '#2196F3', 600: '#1E88E5', 700: '#1976D2', 800: '#1565C0', 900: '#0D47A1',
    },
    accent: { light: '#80D8FF', main: '#40C4FF', dark: '#0091EA' },
    glass: {
      white: 'rgba(255,255,255,0.18)', whiteMedium: 'rgba(255,255,255,0.28)',
      whiteStrong: 'rgba(255,255,255,0.45)', whiteSolid: 'rgba(255,255,255,0.75)',
      dark: 'rgba(0,0,0,0.08)', darkMedium: 'rgba(0,0,0,0.15)',
      tint: 'rgba(33,150,243,0.15)', tintMedium: 'rgba(33,150,243,0.30)', tintStrong: 'rgba(33,150,243,0.50)',
      border: 'rgba(255,255,255,0.35)', borderLight: 'rgba(255,255,255,0.20)',
    },
    gradient: {
      primary: ['#0D47A1', '#1565C0', '#1E88E5'] as const,
      light: ['#E3F2FD', '#BBDEFB', '#90CAF9'] as const,
      accent: ['#0091EA', '#40C4FF', '#80D8FF'] as const,
    },
    success: '#4CAF50', warning: '#FF9800', error: '#F44336', info: '#2196F3',
    status: {
      scheduled: '#2196F3', completed: '#4CAF50', missed: '#F44336',
      cancelled: '#9E9E9E', hold: '#FF9800', inProgress: '#00BCD4',
      pending: '#FFC107', paid: '#4CAF50', overdue: '#F44336',
    },
    text: {
      primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.82)', tertiary: 'rgba(255,255,255,0.62)',
      dark: '#0D47A1', darkSecondary: '#1565C0', onGlass: '#FFFFFF', onLight: '#0D47A1',
    },
    background: {
      primary: '#0D47A1', secondary: '#E3F2FD',
      card: 'rgba(255,255,255,0.15)', input: 'rgba(255,255,255,0.12)',
    },
    white: '#FFFFFF', black: '#000000', transparent: 'transparent',
    tabBar: { background: 'rgba(13,71,161,0.95)', active: '#40C4FF', inactive: 'rgba(255,255,255,0.60)' },
    blurTint: 'light',
  },
};

// ─── 3. DARK NEON ────────────────────────────────────────

const darkNeon: ThemeConfig = {
  name: 'dark_neon',
  label: 'Dark Neon',
  labelHi: 'डार्क नियॉन',
  emoji: '🌑',
  description: 'Dark background with colorful neon accents',
  colors: {
    primary: {
      50: '#F3E5F5', 100: '#E1BEE7', 200: '#CE93D8', 300: '#BA68C8', 400: '#AB47BC',
      500: '#9C27B0', 600: '#8E24AA', 700: '#7B1FA2', 800: '#6A1B9A', 900: '#4A148C',
    },
    accent: { light: '#FF80AB', main: '#FF4081', dark: '#F50057' },
    glass: {
      white: 'rgba(255,255,255,0.08)', whiteMedium: 'rgba(255,255,255,0.15)',
      whiteStrong: 'rgba(255,255,255,0.25)', whiteSolid: 'rgba(255,255,255,0.60)',
      dark: 'rgba(0,0,0,0.30)', darkMedium: 'rgba(0,0,0,0.50)',
      tint: 'rgba(156,39,176,0.20)', tintMedium: 'rgba(156,39,176,0.35)', tintStrong: 'rgba(156,39,176,0.55)',
      border: 'rgba(255,255,255,0.15)', borderLight: 'rgba(255,255,255,0.08)',
    },
    gradient: {
      primary: ['#1A0A2E', '#2D1B4E', '#4A148C'] as const,
      light: ['#F3E5F5', '#E1BEE7', '#CE93D8'] as const,
      accent: ['#F50057', '#FF4081', '#FF80AB'] as const,
    },
    success: '#69F0AE', warning: '#FFD740', error: '#FF5252', info: '#448AFF',
    status: {
      scheduled: '#448AFF', completed: '#69F0AE', missed: '#FF5252',
      cancelled: '#757575', hold: '#FFD740', inProgress: '#18FFFF',
      pending: '#FFAB40', paid: '#69F0AE', overdue: '#FF5252',
    },
    text: {
      primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.75)', tertiary: 'rgba(255,255,255,0.50)',
      dark: '#1A0A2E', darkSecondary: '#4A148C', onGlass: '#FFFFFF', onLight: '#4A148C',
    },
    background: {
      primary: '#1A0A2E', secondary: '#F3E5F5',
      card: 'rgba(255,255,255,0.08)', input: 'rgba(255,255,255,0.06)',
    },
    white: '#FFFFFF', black: '#000000', transparent: 'transparent',
    tabBar: { background: 'rgba(26,10,46,0.95)', active: '#FF4081', inactive: 'rgba(255,255,255,0.50)' },
    blurTint: 'dark',
  },
};

// ─── 4. PURPLE HAZE ──────────────────────────────────────

const purpleHaze: ThemeConfig = {
  name: 'purple_haze',
  label: 'Purple Haze',
  labelHi: 'बैंगनी धुंध',
  emoji: '💜',
  description: 'Purple/pink gradient with soft glass',
  colors: {
    primary: {
      50: '#EDE7F6', 100: '#D1C4E9', 200: '#B39DDB', 300: '#9575CD', 400: '#7E57C2',
      500: '#673AB7', 600: '#5E35B1', 700: '#512DA8', 800: '#4527A0', 900: '#311B92',
    },
    accent: { light: '#B388FF', main: '#7C4DFF', dark: '#651FFF' },
    glass: {
      white: 'rgba(255,255,255,0.15)', whiteMedium: 'rgba(255,255,255,0.25)',
      whiteStrong: 'rgba(255,255,255,0.40)', whiteSolid: 'rgba(255,255,255,0.70)',
      dark: 'rgba(0,0,0,0.10)', darkMedium: 'rgba(0,0,0,0.20)',
      tint: 'rgba(103,58,183,0.15)', tintMedium: 'rgba(103,58,183,0.30)', tintStrong: 'rgba(103,58,183,0.50)',
      border: 'rgba(255,255,255,0.28)', borderLight: 'rgba(255,255,255,0.16)',
    },
    gradient: {
      primary: ['#311B92', '#4527A0', '#5E35B1'] as const,
      light: ['#EDE7F6', '#D1C4E9', '#B39DDB'] as const,
      accent: ['#651FFF', '#7C4DFF', '#B388FF'] as const,
    },
    success: '#4CAF50', warning: '#FFA726', error: '#EF5350', info: '#42A5F5',
    status: {
      scheduled: '#42A5F5', completed: '#66BB6A', missed: '#EF5350',
      cancelled: '#BDBDBD', hold: '#FFA726', inProgress: '#26C6DA',
      pending: '#FFCA28', paid: '#66BB6A', overdue: '#EF5350',
    },
    text: {
      primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.80)', tertiary: 'rgba(255,255,255,0.58)',
      dark: '#311B92', darkSecondary: '#4527A0', onGlass: '#FFFFFF', onLight: '#311B92',
    },
    background: {
      primary: '#311B92', secondary: '#EDE7F6',
      card: 'rgba(255,255,255,0.14)', input: 'rgba(255,255,255,0.10)',
    },
    white: '#FFFFFF', black: '#000000', transparent: 'transparent',
    tabBar: { background: 'rgba(49,27,146,0.95)', active: '#7C4DFF', inactive: 'rgba(255,255,255,0.58)' },
    blurTint: 'light',
  },
};

// ─── 5. LIGHT GREEN ──────────────────────────────────────

const lightGreen: ThemeConfig = {
  name: 'light_green',
  label: 'Light Green',
  labelHi: 'हल्का हरा',
  emoji: '🌿',
  description: 'Light green background with clean glass',
  colors: {
    primary: {
      50: '#F1F8E9', 100: '#DCEDC8', 200: '#C5E1A5', 300: '#AED581', 400: '#9CCC65',
      500: '#8BC34A', 600: '#7CB342', 700: '#689F38', 800: '#558B2F', 900: '#33691E',
    },
    accent: { light: '#B9F6CA', main: '#69F0AE', dark: '#00E676' },
    glass: {
      white: 'rgba(255,255,255,0.45)', whiteMedium: 'rgba(255,255,255,0.60)',
      whiteStrong: 'rgba(255,255,255,0.75)', whiteSolid: 'rgba(255,255,255,0.90)',
      dark: 'rgba(0,0,0,0.05)', darkMedium: 'rgba(0,0,0,0.10)',
      tint: 'rgba(139,195,74,0.15)', tintMedium: 'rgba(139,195,74,0.25)', tintStrong: 'rgba(139,195,74,0.40)',
      border: 'rgba(255,255,255,0.60)', borderLight: 'rgba(255,255,255,0.40)',
    },
    gradient: {
      primary: ['#C8E6C9', '#A5D6A7', '#81C784'] as const,
      light: ['#F1F8E9', '#DCEDC8', '#C5E1A5'] as const,
      accent: ['#00E676', '#69F0AE', '#B9F6CA'] as const,
    },
    success: '#388E3C', warning: '#F57C00', error: '#D32F2F', info: '#1976D2',
    status: {
      scheduled: '#1976D2', completed: '#388E3C', missed: '#D32F2F',
      cancelled: '#757575', hold: '#F57C00', inProgress: '#0097A7',
      pending: '#F9A825', paid: '#388E3C', overdue: '#D32F2F',
    },
    text: {
      primary: '#1B5E20', secondary: 'rgba(27,94,32,0.75)', tertiary: 'rgba(27,94,32,0.55)',
      dark: '#1B5E20', darkSecondary: '#33691E', onGlass: '#1B5E20', onLight: '#1B5E20',
    },
    background: {
      primary: '#E8F5E9', secondary: '#F1F8E9',
      card: 'rgba(255,255,255,0.50)', input: 'rgba(255,255,255,0.40)',
    },
    white: '#FFFFFF', black: '#000000', transparent: 'transparent',
    tabBar: { background: 'rgba(200,230,201,0.95)', active: '#2E7D32', inactive: 'rgba(27,94,32,0.50)' },
    blurTint: 'default',
  },
};

// ─── Exports ─────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemeConfig> = {
  glass_white: glassWhite,
  green_glass: greenGlass,
  ocean_blue: oceanBlue,
  dark_neon: darkNeon,
  purple_haze: purpleHaze,
  light_green: lightGreen,
};

export const THEME_LIST: ThemeConfig[] = Object.values(THEMES);

export const DEFAULT_THEME: ThemeName = 'glass_white';
