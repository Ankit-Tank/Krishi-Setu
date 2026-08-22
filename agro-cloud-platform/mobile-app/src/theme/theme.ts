import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// ============================================================================
// Krishi Setu Design System Tokens
// ============================================================================

export const Colors = {
  // Primary Brand Greens (Earthy, lush, agricultural)
  primaryDark: '#134426',    // Deep Forest Green (Hero banners, AI cards, top header)
  primary: '#1E6B2A',        // Lush Field Green (Primary CTAs, active tab icons)
  primaryMedium: '#2E7D32',  // Vibrant Crop Green (Sub-headings, positive highlights)
  primaryLight: '#43A047',   // Light Green (Borders, subtle chips)
  primaryTint: '#E8F5E9',    // Very soft green tint for badges / highlights
  primarySubtle: '#F1F8F1',  // Light background card tint

  // Secondary Earth Tones (Warmth & contrast)
  secondary: '#B25E2B',      // Terracotta Clay (Warm highlights)
  secondaryDark: '#8D431A',  // Deep Clay
  secondaryTint: '#FBE9E7',  // Soft terracotta tint

  // Accents & Highlights
  accent: '#E69500',         // Harvest Gold (badging, price highlights, stars)
  accentDark: '#C77D00',     // Deep Gold
  accentTint: '#FFF8E1',     // Soft gold tint
  textGold: '#FFE082',       // Highlights on dark green/AI backgrounds

  // Neutral Scales (Crisp, modern readability)
  background: '#F5F7F5',     // Modern light greenish-gray background
  surface: '#FFFFFF',        // Pure white card surfaces
  surfaceSubtle: '#F9FBF9',  // Slightly tinted surface
  border: '#E2ECE2',         // Subtle card border line
  borderLight: '#EDF4ED',    // Very light separator line
  borderDark: '#C8D8C8',     // High-contrast border

  // Typography Colors
  textPrimary: '#1B2E1E',    // Dark Forest Slate (main headings & body)
  textSecondary: '#556958',  // Muted sage/slate (subtitles, captions)
  textMuted: '#889A8B',      // Placeholder, disabled text
  textInverse: '#FFFFFF',    // White text on dark backgrounds

  // Semantic / Status Palettes
  status: {
    healthy: {
      main: '#2E7D32',
      bg: '#E8F5E9',
      border: '#A5D6A7',
      text: '#1B5E20',
    },
    warning: {
      main: '#E65100',
      bg: '#FFF3E0',
      border: '#FFCC80',
      text: '#BF360C',
    },
    critical: {
      main: '#C62828',
      bg: '#FFEBEE',
      border: '#FFCDD2',
      text: '#B71C1C',
    },
    info: {
      main: '#1565C0',
      bg: '#E3F2FD',
      border: '#90CAF9',
      text: '#0D47A1',
    },
    waterlogged: {
      main: '#0277BD',
      bg: '#E1F5FE',
      border: '#81D4FA',
      text: '#01579B',
    },
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 20,
  screenPadding: 16,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700' as const,
    lineHeight: 22,
    color: Colors.primaryDark,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  bodySmallBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    color: Colors.textPrimary,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 15,
    color: Colors.textSecondary,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
};

export const Shadows = {
  subtle: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  card: {
    elevation: 2,
    shadowColor: '#134426',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  floating: {
    elevation: 3,
    shadowColor: '#134426',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
};

export const CommonStyles = {
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxxl + 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  heroCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Shadows.floating,
  },
  primaryButton: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    borderRadius: BorderRadius.md,
    borderColor: Colors.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
};

// ============================================================================
// React Native Paper Theme Provider configuration
// ============================================================================
export const AgroTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    tertiary: Colors.accent,
    accent: Colors.accent,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.status.critical.main,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: Colors.textPrimary,
  },
};

export const MonsoonEarthTheme = AgroTheme;
