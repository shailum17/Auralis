/**
 * Animation System
 * Consistent animations and transitions across the application
 */

import { Variants, Transition } from 'framer-motion';

// Base transition configurations
export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  normal: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 400, damping: 25 },
  springGentle: { type: 'spring', stiffness: 200, damping: 35 },
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

// Modal/Dialog variants
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.fast,
  },
};

// Card hover variants
export const cardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    transition: transitions.normal,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
};

// Button variants
export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
  loading: {
    scale: 1,
    transition: transitions.normal,
  },
};

// Input focus variants
export const inputVariants: Variants = {
  initial: {
    scale: 1,
    borderColor: 'rgb(203 213 225)', // secondary-300
  },
  focus: {
    scale: 1.01,
    borderColor: 'rgb(37 99 235)', // primary-600
    transition: transitions.fast,
  },
  error: {
    borderColor: 'rgb(220 38 38)', // error-600
    transition: transitions.fast,
  },
  success: {
    borderColor: 'rgb(22 163 74)', // success-600
    transition: transitions.fast,
  },
};

// Form step variants
export const stepVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transitions.normal,
  },
};

// Loading spinner variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Toast notification variants
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// Stagger animation for lists
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
};

// Progress indicator variants
export const progressVariants: Variants = {
  initial: {
    scaleX: 0,
  },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: transitions.normal,
  }),
};

// Fade variants
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// Slide variants
export const slideVariants = {
  left: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  right: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  up: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  down: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
} as const;

// Scale variants
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: transitions.fast,
  },
};

// Bounce variants for success states
export const bounceVariants: Variants = {
  initial: {
    scale: 0,
  },
  animate: {
    scale: 1,
    transition: transitions.springBouncy,
  },
};

// Pulse variants for loading states
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Shimmer variants for skeleton loading
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Hover lift variants for interactive elements
export const liftVariants: Variants = {
  initial: {
    y: 0,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  hover: {
    y: -2,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    transition: transitions.normal,
  },
};

// Error shake variants
export const shakeVariants: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Success check variants
export const checkVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Typing animation variants
export const typingVariants: Variants = {
  animate: {
    width: ['0%', '100%'],
    transition: {
      duration: 2,
      ease: 'easeInOut',
    },
  },
};

// Utility functions for creating custom animations
export const createSlideVariant = (direction: 'left' | 'right' | 'up' | 'down', distance = 20) => {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value = direction === 'left' || direction === 'up' ? -distance : distance;
  
  return {
    initial: { opacity: 0, [axis]: value },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: -value },
  };
};

export const createStaggerVariant = (delay = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: delay,
    },
  },
});

export const createBounceVariant = (scale = 1.1) => ({
  animate: {
    scale: [1, scale, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
});

// Animation presets for common use cases
export const animationPresets = {
  // Page transitions
  page: pageVariants,
  modal: modalVariants,
  
  // Component interactions
  button: buttonVariants,
  card: cardVariants,
  input: inputVariants,
  
  // Content animations
  fade: fadeVariants,
  slideUp: slideVariants.up,
  slideDown: slideVariants.down,
  slideLeft: slideVariants.left,
  slideRight: slideVariants.right,
  scale: scaleVariants,
  
  // Loading states
  spinner: spinnerVariants,
  pulse: pulseVariants,
  shimmer: shimmerVariants,
  
  // Feedback animations
  bounce: bounceVariants,
  shake: shakeVariants,
  lift: liftVariants,
  
  // List animations
  stagger: staggerContainer,
  staggerItem: staggerItem,
  
  // Form animations
  step: stepVariants,
  progress: progressVariants,
  
  // Notification animations
  toast: toastVariants,
} as const;

export type AnimationPreset = keyof typeof animationPresets;
export type SlideDirection = 'left' | 'right' | 'up' | 'down';