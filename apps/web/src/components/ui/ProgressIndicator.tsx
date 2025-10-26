'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';

export interface Step {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
  optional?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Circle,
    iconColor: 'text-secondary-400',
    bgColor: 'bg-secondary-100',
    borderColor: 'border-secondary-300',
    textColor: 'text-secondary-600',
  },
  current: {
    icon: Circle,
    iconColor: 'text-primary-600',
    bgColor: 'bg-primary-100',
    borderColor: 'border-primary-500',
    textColor: 'text-primary-700',
  },
  completed: {
    icon: CheckCircle,
    iconColor: 'text-success-600',
    bgColor: 'bg-success-100',
    borderColor: 'border-success-500',
    textColor: 'text-success-700',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-error-600',
    bgColor: 'bg-error-100',
    borderColor: 'border-error-500',
    textColor: 'text-error-700',
  },
};

export function ProgressIndicator({ 
  steps, 
  orientation = 'horizontal', 
  showLabels = true,
  className 
}: ProgressIndicatorProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'items-center space-x-4' : 'flex-col space-y-4',
      className
    )}>
      {steps.map((step, index) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center',
              isHorizontal ? 'flex-row' : 'flex-col',
              !isLast && !isHorizontal && 'pb-4'
            )}
          >
            {/* Step Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                config.bgColor,
                config.borderColor
              )}
            >
              <Icon className={cn('w-4 h-4', config.iconColor)} />
              
              {step.optional && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 text-white text-xs rounded-full flex items-center justify-center">
                  ?
                </span>
              )}
            </motion.div>

            {/* Step Content */}
            {showLabels && (
              <motion.div
                initial={{ opacity: 0, x: isHorizontal ? -10 : 0, y: isHorizontal ? 0 : -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                className={cn(
                  isHorizontal ? 'ml-3' : 'mt-2 text-center'
                )}
              >
                <h3 className={cn('text-sm font-medium', config.textColor)}>
                  {step.title}
                  {step.optional && (
                    <span className="text-xs text-secondary-500 ml-1">(optional)</span>
                  )}
                </h3>
                {step.description && (
                  <p className="text-xs text-secondary-600 mt-1">
                    {step.description}
                  </p>
                )}
              </motion.div>
            )}

            {/* Connector Line */}
            {!isLast && (
              <motion.div
                initial={{ scaleX: isHorizontal ? 0 : 1, scaleY: isHorizontal ? 1 : 0 }}
                animate={{ scaleX: 1, scaleY: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                className={cn(
                  'bg-secondary-300',
                  isHorizontal 
                    ? 'h-0.5 flex-1 mx-4' 
                    : 'w-0.5 h-8 mx-auto'
                )}
                style={{
                  transformOrigin: isHorizontal ? 'left' : 'top'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface LinearProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LinearProgress({ 
  value, 
  max = 100, 
  label,
  showPercentage = false,
  variant = 'primary',
  size = 'md',
  className 
}: LinearProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-secondary-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-secondary-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-secondary-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          className={cn('h-full rounded-full', variantClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function CircularProgressIndicator({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  label,
  showPercentage = true,
  variant = 'primary',
  className
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantClasses = {
    primary: 'stroke-primary-600',
    success: 'stroke-success-600',
    warning: 'stroke-warning-600',
    error: 'stroke-error-600',
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
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
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-secondary-200"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={variantClasses[variant]}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              strokeDasharray,
            }}
          />
        </svg>
        
        {/* Center content */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-secondary-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-sm text-secondary-600 mt-2">{label}</span>
      )}
    </div>
  );
}