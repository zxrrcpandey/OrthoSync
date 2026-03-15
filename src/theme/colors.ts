// ==========================================
// OrthoSync - Green Glassmorphism Theme
// ==========================================

export const Colors = {
  // Primary Green Palette
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',  // Main green
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Accent
  accent: {
    light: '#69F0AE',
    main: '#00E676',
    dark: '#00C853',
  },

  // Glass Colors (for glassmorphism)
  glass: {
    white: 'rgba(255, 255, 255, 0.15)',
    whiteMedium: 'rgba(255, 255, 255, 0.25)',
    whiteStrong: 'rgba(255, 255, 255, 0.40)',
    whiteSolid: 'rgba(255, 255, 255, 0.70)',
    dark: 'rgba(0, 0, 0, 0.10)',
    darkMedium: 'rgba(0, 0, 0, 0.20)',
    green: 'rgba(76, 175, 80, 0.15)',
    greenMedium: 'rgba(76, 175, 80, 0.30)',
    greenStrong: 'rgba(76, 175, 80, 0.50)',
    border: 'rgba(255, 255, 255, 0.30)',
    borderLight: 'rgba(255, 255, 255, 0.18)',
  },

  // Background Gradients
  gradient: {
    primary: ['#1B5E20', '#2E7D32', '#43A047'] as const,
    light: ['#E8F5E9', '#C8E6C9', '#A5D6A7'] as const,
    dark: ['#0A3D0A', '#1B5E20', '#2E7D32'] as const,
    accent: ['#00C853', '#00E676', '#69F0AE'] as const,
    card: ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.10)'] as const,
  },

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Status Colors
  status: {
    scheduled: '#2196F3',
    completed: '#4CAF50',
    missed: '#F44336',
    cancelled: '#9E9E9E',
    hold: '#FF9800',
    inProgress: '#00BCD4',
    pending: '#FFC107',
    paid: '#4CAF50',
    overdue: '#F44336',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.80)',
    tertiary: 'rgba(255, 255, 255, 0.60)',
    dark: '#1A1A1A',
    darkSecondary: '#4A4A4A',
    onGlass: '#FFFFFF',
    onLight: '#1B5E20',
  },

  // Background
  background: {
    primary: '#1B5E20',
    secondary: '#E8F5E9',
    card: 'rgba(255, 255, 255, 0.15)',
    input: 'rgba(255, 255, 255, 0.12)',
  },

  // Common
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};
