import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#4338ca', // Indigo
    primaryLight: '#818cf8',
    secondary: '#a855f7', // Purple
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  dark: {
    primary: '#6366f1', // Lighter Indigo for Dark
    primaryLight: '#312e81',
    secondary: '#c084fc', // Lighter Purple
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    text: '#F8FAFC',
    textSecondary: '#94a3b8',
    border: '#334155',
    error: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
  }
};

export const Theme = {
  colors: Colors.light, // Added for backward compatibility
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' as const },
    h2: { fontSize: 24, fontWeight: '700' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
    label: { fontSize: 14, fontWeight: '600' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
  },
  shadows: {
    small: Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' as any }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        },
    medium: Platform.OS === 'web'
      ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' as any }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
  }
};
