/**
 * Responsive Design Utilities
 * Consistent responsive behavior across all components
 */

import { breakpoints } from './design-system';

// Responsive breakpoint utilities
export const responsive = {
  // Mobile-first breakpoints
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max-width breakpoints
  'max-sm': `@media (max-width: ${breakpoints.sm})`,
  'max-md': `@media (max-width: ${breakpoints.md})`,
  'max-lg': `@media (max-width: ${breakpoints.lg})`,
  'max-xl': `@media (max-width: ${breakpoints.xl})`,
  
  // Range breakpoints
  'sm-md': `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  'md-lg': `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  'lg-xl': `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
} as const;

// Container utilities for consistent max-widths
export const containers = {
  sm: 'max-w-sm mx-auto px-4',
  md: 'max-w-md mx-auto px-4',
  lg: 'max-w-lg mx-auto px-4',
  xl: 'max-w-xl mx-auto px-4',
  '2xl': 'max-w-2xl mx-auto px-4',
  '3xl': 'max-w-3xl mx-auto px-4',
  '4xl': 'max-w-4xl mx-auto px-4',
  '5xl': 'max-w-5xl mx-auto px-4',
  '6xl': 'max-w-6xl mx-auto px-4',
  '7xl': 'max-w-7xl mx-auto px-4',
  full: 'w-full px-4',
  screen: 'min-h-screen',
} as const;

// Grid utilities for consistent layouts
export const grid = {
  // Responsive grid columns
  cols: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
  },
  
  // Gap utilities
  gap: {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
    xl: 'gap-6 sm:gap-8',
  },
} as const;

// Flex utilities for consistent flexbox layouts
export const flex = {
  // Common flex patterns
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  start: 'flex items-center justify-start',
  end: 'flex items-center justify-end',
  col: 'flex flex-col',
  colCenter: 'flex flex-col items-center justify-center',
  
  // Responsive flex direction
  responsive: {
    colToRow: 'flex flex-col sm:flex-row',
    rowToCol: 'flex flex-row sm:flex-col',
  },
} as const;

// Spacing utilities for consistent margins and padding
export const space = {
  // Section spacing
  section: {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-24',
  },
  
  // Component spacing
  component: {
    sm: 'p-4 sm:p-6',
    md: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
  },
  
  // Stack spacing (vertical)
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  
  // Inline spacing (horizontal)
  inline: {
    xs: 'space-x-1',
    sm: 'space-x-2',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
} as const;

// Typography utilities for responsive text
export const text = {
  // Responsive font sizes
  responsive: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
    '2xl': 'text-xl sm:text-2xl',
    '3xl': 'text-2xl sm:text-3xl',
    '4xl': 'text-3xl sm:text-4xl',
  },
  
  // Heading scales
  heading: {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    h4: 'text-base sm:text-lg lg:text-xl font-medium',
    h5: 'text-sm sm:text-base lg:text-lg font-medium',
    h6: 'text-xs sm:text-sm lg:text-base font-medium',
  },
  
  // Body text
  body: {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
  },
} as const;

// Form utilities for consistent form layouts
export const form = {
  // Form containers
  container: 'space-y-4 sm:space-y-6',
  
  // Field groups
  group: 'space-y-2',
  
  // Responsive form layouts
  grid: {
    single: 'grid grid-cols-1 gap-4 sm:gap-6',
    double: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    triple: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  },
  
  // Button groups
  buttons: {
    single: 'flex justify-center',
    double: 'flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between',
    group: 'flex flex-col sm:flex-row gap-3 sm:gap-4',
  },
} as const;

// Animation utilities for consistent motion
export const motion = {
  // Transition classes
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },
  
  // Transform utilities
  transform: {
    hover: 'hover:scale-105 hover:-translate-y-1',
    press: 'active:scale-95',
    focus: 'focus:scale-105',
  },
  
  // Animation classes
  animate: {
    fadeIn: 'animate-fade-in',
    fadeInUp: 'animate-fade-in-up',
    slideInRight: 'animate-slide-in-right',
    shimmer: 'animate-shimmer',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
  },
} as const;

// Utility function to combine responsive classes
export function responsiveClass(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Utility function to create responsive variants
export function createResponsiveVariant<T extends Record<string, string>>(
  variants: T,
  breakpoint: keyof typeof breakpoints = 'sm'
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  
  for (const [key, value] of Object.entries(variants)) {
    result[key as keyof T] = `${value} ${breakpoint}:${value}`;
  }
  
  return result;
}

// Hook for responsive behavior (client-side)
export function useResponsive() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: 'xl' as keyof typeof breakpoints,
    };
  }

  const width = window.innerWidth;
  
  return {
    isMobile: width < parseInt(breakpoints.md),
    isTablet: width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg),
    isDesktop: width >= parseInt(breakpoints.lg),
    breakpoint: width < parseInt(breakpoints.sm) ? 'xs' :
                width < parseInt(breakpoints.md) ? 'sm' :
                width < parseInt(breakpoints.lg) ? 'md' :
                width < parseInt(breakpoints.xl) ? 'lg' :
                width < parseInt(breakpoints['2xl']) ? 'xl' : '2xl' as keyof typeof breakpoints,
  };
}

export type ResponsiveBreakpoint = keyof typeof breakpoints;
export type ResponsiveUtilities = typeof responsive;