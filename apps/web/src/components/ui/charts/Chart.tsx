import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string;
}

export function ChartContainer({
  children,
  className,
  title,
  description,
  loading = false,
  error,
}: ChartContainerProps) {
  if (loading) {
    return (
      <div className={cn('p-6 bg-white rounded-lg border border-secondary-200', className)}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            {description && (
              <p className="text-sm text-secondary-600 mt-1">{description}</p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-6 bg-white rounded-lg border border-error-200', className)}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            {description && (
              <p className="text-sm text-secondary-600 mt-1">{description}</p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center h-64 text-error-600">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium">Error loading chart</p>
            <p className="text-xs text-error-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('p-6 bg-white rounded-xl border border-secondary-200 shadow-lg hover:shadow-xl transition-all duration-300', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          {description && (
            <p className="text-sm text-secondary-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}

// Chart color palette based on design tokens
export const chartColors = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  secondary: ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'],
  success: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  error: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  info: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'],
  gradient: [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ],
};

// Common chart configuration
export const chartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#f8fafc',
      borderColor: '#334155',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        size: 14,
        weight: '600',
        family: 'Inter, system-ui, sans-serif',
      },
      bodyFont: {
        size: 13,
        family: 'Inter, system-ui, sans-serif',
      },
    },
  },
  scales: {
    x: {
      grid: {
        color: '#e2e8f0',
        drawBorder: false,
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
      },
    },
    y: {
      grid: {
        color: '#e2e8f0',
        drawBorder: false,
      },
      ticks: {
        color: '#64748b',
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
      },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart' as const,
  },
};

export type ChartColor = keyof typeof chartColors;
export type { ChartContainerProps };