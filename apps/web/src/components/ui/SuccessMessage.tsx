'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Card } from './Card';

export interface SuccessAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  external?: boolean;
}

export interface SuccessMessageProps {
  title: string;
  message?: string;
  description?: string;
  actions?: SuccessAction[];
  showIcon?: boolean;
  variant?: 'default' | 'celebration' | 'minimal';
  className?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SuccessMessage({
  title,
  message,
  description,
  actions = [],
  showIcon = true,
  variant = 'default',
  className,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
}: SuccessMessageProps) {
  // Auto close functionality
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const renderContent = () => {
    switch (variant) {
      case 'celebration':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center py-8"
          >
            {/* Animated Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <CheckCircle className="w-10 h-10 text-success-600" />
              </motion.div>
            </motion.div>

            {/* Confetti Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-success-400 rounded-full"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.6 + i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="text-2xl font-bold text-secondary-900 mb-3"
            >
              {title}
            </motion.h2>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                className="text-lg text-success-700 mb-2"
              >
                {message}
              </motion.p>
            )}

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="text-secondary-600 mb-6"
              >
                {description}
              </motion.p>
            )}

            {actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant || 'primary'}
                    icon={action.icon}
                  >
                    {action.label}
                    {action.external && <ExternalLink className="w-4 h-4 ml-1" />}
                  </Button>
                ))}
              </motion.div>
            )}
          </motion.div>
        );

      case 'minimal':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-3 p-4"
          >
            {showIcon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-shrink-0"
              >
                <div className="w-6 h-6 bg-success-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-success-800">{title}</h3>
              {message && (
                <p className="text-sm text-success-700 mt-1">{message}</p>
              )}
            </div>

            {actions.length > 0 && (
              <div className="flex space-x-2">
                {actions.slice(0, 2).map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant="ghost"
                    size="sm"
                    icon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        );

      default:
        return (
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {showIcon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                  </div>
                </motion.div>
              )}

              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-lg font-semibold text-secondary-900 mb-2"
                >
                  {title}
                </motion.h3>

                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-success-700 mb-2"
                  >
                    {message}
                  </motion.p>
                )}

                {description && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="text-secondary-600 mb-4"
                  >
                    {description}
                  </motion.p>
                )}

                {actions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="flex flex-wrap gap-3"
                  >
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.onClick}
                        variant={action.variant || (index === 0 ? 'primary' : 'outline')}
                        size="sm"
                        icon={action.icon}
                      >
                        {action.label}
                        {action.external && <ExternalLink className="w-4 h-4 ml-1" />}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'bg-success-50 border border-success-200 rounded-lg',
          className
        )}
      >
        {renderContent()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className={cn(
        'border-success-200 bg-success-50/50',
        variant === 'celebration' && 'relative overflow-hidden'
      )}>
        {renderContent()}
      </Card>
    </motion.div>
  );
}