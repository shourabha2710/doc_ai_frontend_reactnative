import { useColorScheme } from 'react-native';

// ─── Color Palette ────────────────────────────────────────────────────────────
const palette = {
  // Primary
  indigo: '#6366F1',
  indigoLight: '#818CF8',
  indigoDark: '#4F46E5',

  // Accent
  cyan: '#06B6D4',
  cyanLight: '#22D3EE',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: '#FEE2E2',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Dark surface
  dark800: '#1E1B4B',
  dark900: '#0F0E2A',
  darkCard: '#1E2035',
  darkBorder: '#2E3050',
};

// ─── Light Theme ──────────────────────────────────────────────────────────────
export const lightTheme = {
  background: palette.gray50,
  surface: palette.white,
  card: palette.white,
  border: palette.gray200,
  borderFocus: palette.indigo,

  text: palette.gray900,
  textSecondary: palette.gray500,
  textDisabled: palette.gray300,
  textOnPrimary: palette.white,

  primary: palette.indigo,
  primaryLight: palette.indigoLight,
  primaryDark: palette.indigoDark,
  accent: palette.cyan,

  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  errorBg: palette.errorLight,

  shadow: '#00000020',
  overlay: '#00000050',
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────
export const darkTheme = {
  background: palette.dark900,
  surface: palette.darkCard,
  card: palette.darkCard,
  border: palette.darkBorder,
  borderFocus: palette.indigoLight,

  text: palette.gray50,
  textSecondary: palette.gray400,
  textDisabled: palette.gray600,
  textOnPrimary: palette.white,

  primary: palette.indigoLight,
  primaryLight: '#A5B4FC',
  primaryDark: palette.indigo,
  accent: palette.cyanLight,

  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  errorBg: '#3B0A0A',

  shadow: '#00000060',
  overlay: '#00000080',
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
