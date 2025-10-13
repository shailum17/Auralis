import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'relative overflow-hidden rounded-full bg-secondary-200',
  {
    variants: {
      size: {
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const progressBarVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary-600',
        primary: 'bg-primary-600',
        secondary: 'bg-secondary-600',
        success: 'bg-success-600',
        warning: 'bg-warning-600',
        error: 'bg-error-600',
        info: 'bg-info-600',
        gradient: 'bg-gradient-to-r from-primary-500 to-primary-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    size,
    variant,
    value,
    max = 100,
    showLabel = false,
    label,
    animated = true,
    striped = false,
    indeterminate = false,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = Math.round(percentage);

    return (
      <div className="w-full">
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-secondary-700">
              {label || 'Progress'}
            </span>
            {showLabel && !indeterminate && (
              <span className="text-sm text-secondary-600">
                {displayValue}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          {indeterminate ? (
            <motion.div
              className={cn(
                progressBarVariants({ variant }),
                'absolute inset-y-0 w-1/3'
              )}
              animate={{
                x: ['-100%', '300%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <motion.div
              className={cn(
                progressBarVariants({ variant }),
                striped && 'bg-stripes',
                striped && animated && 'animate-stripes'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut' }}
              style={{
                backgroundImage: striped
                  ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)'
                  : undefined,
                backgroundSize: striped ? '1rem 1rem' : undefined,
              }}
            />
          )}
          
          {/* Shine effect for enhanced visual appeal */}
          {animated && !indeterminate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    variant = 'primary',
    showLabel = true,
    label,
    className,
    animated = true,
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colors = {
      default: '#3b82f6',
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
    };

    return (
      <div ref={ref} className={cn('relative inline-flex', className)}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors[variant]}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset }}
            transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-900">
                {Math.round(percentage)}%
              </div>
              {label && (
                <div className="text-xs text-secondary-600 mt-1">
                  {label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress, progressVariants, progressBarVariants };
export type { ProgressProps, CircularProgressProps };