import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const MonsoonEarthTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#C1502E',       // Terracotta Clay (CTAs, primary buttons)
    secondary: '#2B3A67',     // Monsoon Indigo (headers, advisory cards)
    tertiary: '#E8A63A',      // Turmeric Gold (badges, highlights, confidence)
    accent: '#E8A63A',        // Turmeric Gold accent
    background: '#F7F1E8',    // Warm Ivory soft background
    surface: '#FFFFFF',       // Card surface white
    error: '#D32F2F',         // Urgent alert red
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#2E2A26',     // Charcoal Soil text
  },
};

export const AgroTheme = MonsoonEarthTheme;
