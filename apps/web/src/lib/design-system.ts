/**
 * Design System Configuration
 * Centralized design tokens and utilities for consistent UI
 */

// Color Palette - Primary Blues
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Spacing Scale
export const spacing = {
  0: '0px',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

// Border Radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  soft: '0 4px 20px rgb(0 0 0 / 0.08)',
  medium: '0 8px 30px rgb(0 0 0 / 0.12)',
  large: '0 20px 40px rgb(0 0 0 / 0.15)',
  elegant: '0 8px 30px rgb(0 0 0 / 0.12)',
  'elegant-hover': '0 20px 40px rgb(0 0 0 / 0.15)',
} as const;

// Animation Durations
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component Variants
export const componentVariants = {
  button: {
    sizes: {
      xs: 'h-6 px-2 text-xs gap-1 rounded-md',
      sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
      md: 'h-10 px-4 text-sm gap-2 rounded-lg',
      lg: 'h-12 px-6 text-base gap-2 rounded-lg',
      xl: 'h-14 px-8 text-lg gap-3 rounded-xl',
    },
    variants: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
      outline: 'border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
      ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
      success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    },
  },
  input: {
    sizes: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-4 text-base',
    },
    variants: {
      default: 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
      filled: 'border-transparent bg-secondary-100 focus:bg-white focus:border-primary-500',
      flushed: 'border-0 border-b-2 border-secondary-300 rounded-none bg-transparent focus:border-primary-500',
    },
    states: {
      default: '',
      error: 'border-error-300 bg-error-50 focus:border-error-500 focus:ring-error-500',
      success: 'border-success-300 bg-success-50 focus:border-success-500 focus:ring-success-500',
      warning: 'border-warning-300 bg-warning-50 focus:border-warning-500 focus:ring-warning-500',
    },
  },
  card: {
    variants: {
      default: 'border-secondary-200 bg-white hover:shadow-xl',
      elevated: 'border-secondary-200 bg-white shadow-xl hover:shadow-2xl',
      outlined: 'border-2 border-secondary-300 bg-white shadow-md hover:border-secondary-400',
      ghost: 'border-transparent bg-white shadow-md hover:bg-secondary-50',
      gradient: 'border-secondary-200 bg-gradient-to-br from-white to-secondary-50 shadow-lg',
      wellness: 'border-primary-200 bg-gradient-to-br from-white via-primary-50/30 to-white shadow-lg',
    },
    sizes: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
} as const;

// Accessibility Helpers
export const accessibility = {
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  screenReaderOnly: 'sr-only',
  skipToContent: 'absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden focus:left-6 focus:top-7 focus:w-auto focus:h-auto focus:overflow-visible',
} as const;

// Motion Presets
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
  buttonHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 },
  },
  cardHover: {
    whileHover: { scale: 1.02, y: -4 },
    transition: { duration: 0.2 },
  },
} as const;

// Utility Functions
export const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  componentVariants,
  accessibility,
  motionPresets,
  
  // Helper functions
  getColor: (color: keyof typeof colors, shade: keyof typeof colors.primary) => {
    return (colors[color] as any)[shade];
  },
  
  getFontSize: (size: keyof typeof typography.fontSize) => {
    return typography.fontSize[size];
  },
  
  getSpacing: (size: keyof typeof spacing) => {
    return spacing[size];
  },
  
  getShadow: (size: keyof typeof shadows) => {
    return shadows[size];
  },
} as const;

export type DesignSystemColors = typeof colors;
export type DesignSystemTypography = typeof typography;
export type DesignSystemSpacing = typeof spacing;
export type ComponentVariants = typeof componentVariants;