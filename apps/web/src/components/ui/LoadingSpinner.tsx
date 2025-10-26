'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin rounded-full border-solid',
  {
    variants: {
      size: {
        xs: 'w-3 h-3 border-[1.5px]',
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-[3px]',
        xl: 'w-12 h-12 border-4',
      },
      variant: {
        primary: 'border-primary-200 border-t-primary-600',
        secondary: 'border-secondary-200 border-t-secondary-600',
        white: 'border-white/30 border-t-white',
        success: 'border-success-200 border-t-success-600',
        error: 'border-error-200 border-t-error-600',
        warning: 'border-warning-200 border-t-warning-600',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size, variant, className, label }: LoadingSpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-center"
      role="status"
      aria-label={label || 'Loading'}
    >
      <div className={cn(spinnerVariants({ size, variant }), className)} />
      {label && (
        <span className="ml-2 text-sm text-secondary-600">{label}</span>
      )}
    </motion.div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  size?: VariantProps<typeof spinnerVariants>['size'];
  variant?: VariantProps<typeof spinnerVariants>['variant'];
  backdrop?: boolean;
}

export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  size = 'lg',
  variant = 'primary',
  backdrop = true 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-black/20 backdrop-blur-sm'
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4"
      >
        <LoadingSpinner size={size} variant={variant} />
        <p className="text-secondary-700 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  size?: VariantProps<typeof spinnerVariants>['size'];
  variant?: VariantProps<typeof spinnerVariants>['variant'];
  className?: string;
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback,
  size = 'md',
  variant = 'primary',
  className 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        {fallback || <LoadingSpinner size={size} variant={variant} />}
      </div>
    );
  }

  return <>{children}</>;
}