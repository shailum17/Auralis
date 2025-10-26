'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastComponentProps extends ToastProps {
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    colorClasses: 'bg-success-50 border-success-200 text-success-800',
    iconColor: 'text-success-500',
    progressColor: 'bg-success-500',
  },
  error: {
    icon: XCircle,
    colorClasses: 'bg-error-50 border-error-200 text-error-800',
    iconColor: 'text-error-500',
    progressColor: 'bg-error-500',
  },
  warning: {
    icon: AlertTriangle,
    colorClasses: 'bg-warning-50 border-warning-200 text-warning-800',
    iconColor: 'text-warning-500',
    progressColor: 'bg-warning-500',
  },
  info: {
    icon: Info,
    colorClasses: 'bg-info-50 border-info-200 text-info-800',
    iconColor: 'text-info-500',
    progressColor: 'bg-info-500',
  },
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  persistent = false,
  action,
  onClose,
  onRemove,
}: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (persistent) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(progressInterval);
          handleClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [duration, persistent]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative max-w-sm w-full bg-white rounded-lg shadow-lg border overflow-hidden"
        >
          <div className={cn('p-4', config.colorClasses)}>
            <div className="flex items-start space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-shrink-0"
              >
                <Icon className={cn('w-5 h-5', config.iconColor)} />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h4
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-sm font-semibold"
                >
                  {title}
                </motion.h4>

                {message && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-sm mt-1 opacity-90"
                  >
                    {message}
                  </motion.p>
                )}

                {action && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    onClick={action.onClick}
                    className="text-sm font-medium underline mt-2 hover:no-underline transition-all duration-200"
                  >
                    {action.label}
                  </motion.button>
                )}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                onClick={handleClose}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Progress bar */}
          {!persistent && (
            <div className="h-1 bg-black/10">
              <motion.div
                className={cn('h-full', config.progressColor)}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}