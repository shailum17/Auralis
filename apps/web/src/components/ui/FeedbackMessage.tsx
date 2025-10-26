'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export type FeedbackType = 'info' | 'success' | 'warning' | 'error';

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface FeedbackMessageProps {
  type: FeedbackType;
  title: string;
  message?: string;
  actions?: FeedbackAction[];
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
  persistent?: boolean;
}

const feedbackConfig = {
  info: {
    icon: Info,
    colorClasses: 'bg-info-50 border-info-200 text-info-800',
    iconColor: 'text-info-600',
    titleColor: 'text-info-900',
    messageColor: 'text-info-700',
  },
  success: {
    icon: CheckCircle,
    colorClasses: 'bg-success-50 border-success-200 text-success-800',
    iconColor: 'text-success-600',
    titleColor: 'text-success-900',
    messageColor: 'text-success-700',
  },
  warning: {
    icon: AlertTriangle,
    colorClasses: 'bg-warning-50 border-warning-200 text-warning-800',
    iconColor: 'text-warning-600',
    titleColor: 'text-warning-900',
    messageColor: 'text-warning-700',
  },
  error: {
    icon: XCircle,
    colorClasses: 'bg-error-50 border-error-200 text-error-800',
    iconColor: 'text-error-600',
    titleColor: 'text-error-900',
    messageColor: 'text-error-700',
  },
};

export function FeedbackMessage({
  type,
  title,
  message,
  actions = [],
  dismissible = true,
  onDismiss,
  className,
  compact = false,
  persistent = false,
}: FeedbackMessageProps) {
  const config = feedbackConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center space-x-3 p-3 rounded-lg border',
          config.colorClasses,
          className
        )}
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', config.titleColor)}>{title}</p>
          {message && (
            <p className={cn('text-xs mt-0.5', config.messageColor)}>{message}</p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex space-x-2">
            {actions.slice(0, 1).map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant="ghost"
                size="xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn('flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity', config.iconColor)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg border p-4',
        config.colorClasses,
        className
      )}
    >
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
            className={cn('text-sm font-semibold', config.titleColor)}
          >
            {title}
          </motion.h4>

          {message && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className={cn('text-sm mt-1', config.messageColor)}
            >
              {message}
            </motion.p>
          )}

          {actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size="sm"
                >
                  {action.label}
                </Button>
              ))}
            </motion.div>
          )}
        </div>

        {dismissible && onDismiss && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            onClick={onDismiss}
            className={cn('flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity', config.iconColor)}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Multi-step feedback component
export interface StepFeedback {
  id: string;
  title: string;
  message?: string;
  type: FeedbackType;
  completed?: boolean;
}

interface MultiStepFeedbackProps {
  steps: StepFeedback[];
  currentStep?: string;
  className?: string;
}

export function MultiStepFeedback({ steps, currentStep, className }: MultiStepFeedbackProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence>
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'transition-all duration-300',
                isActive && 'scale-105',
                !isActive && !isCompleted && 'opacity-60'
              )}
            >
              <FeedbackMessage
                type={isCompleted ? 'success' : step.type}
                title={step.title}
                message={step.message}
                compact
                dismissible={false}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Recovery suggestions component
export interface RecoverySuggestion {
  title: string;
  description: string;
  action?: FeedbackAction;
  priority?: 'high' | 'medium' | 'low';
}

interface RecoverySuggestionsProps {
  suggestions: RecoverySuggestion[];
  title?: string;
  className?: string;
}

export function RecoverySuggestions({ 
  suggestions, 
  title = 'Try these solutions:',
  className 
}: RecoverySuggestionsProps) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedSuggestions = [...suggestions].sort(
    (a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-4', className)}
    >
      <h4 className="text-sm font-semibold text-secondary-900">{title}</h4>
      
      <div className="space-y-3">
        {sortedSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg border border-secondary-200"
          >
            <div className="flex-shrink-0 mt-0.5">
              <div className={cn(
                'w-2 h-2 rounded-full',
                suggestion.priority === 'high' ? 'bg-error-500' :
                suggestion.priority === 'medium' ? 'bg-warning-500' : 'bg-info-500'
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-secondary-900 mb-1">
                {suggestion.title}
              </h5>
              <p className="text-sm text-secondary-600 mb-2">
                {suggestion.description}
              </p>
              
              {suggestion.action && (
                <Button
                  onClick={suggestion.action.onClick}
                  variant={suggestion.action.variant || 'outline'}
                  size="sm"
                  icon={<ArrowRight className="w-3 h-3" />}
                >
                  {suggestion.action.label}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}