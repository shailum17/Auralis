'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecurityNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

interface SecurityNotificationsProps {
  notifications: SecurityNotification[];
  onDismiss: (id: string) => void;
  className?: string;
}

const notificationIcons = {
  success: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const notificationStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700',
    button: 'text-green-600 hover:text-green-500'
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    title: 'text-amber-800',
    message: 'text-amber-700',
    button: 'text-amber-600 hover:text-amber-500'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
    button: 'text-blue-600 hover:text-blue-500'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'text-red-600 hover:text-red-500'
  }
};

export function SecurityNotifications({ 
  notifications, 
  onDismiss, 
  className = '' 
}: SecurityNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<SecurityNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);

    // Auto-hide notifications
    notifications.forEach(notification => {
      if (notification.autoHide !== false) {
        const duration = notification.duration || 5000;
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="Security notifications">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification) => {
          const styles = notificationStyles[notification.type];
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                relative p-4 border rounded-lg shadow-sm
                ${styles.container}
              `}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`flex-shrink-0 ${styles.icon}`}>
                  {notificationIcons[notification.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${styles.title}`}>
                    {notification.title}
                  </h4>
                  <p className={`mt-1 text-sm ${styles.message}`}>
                    {notification.message}
                  </p>

                  {/* Action Button */}
                  {notification.action && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={notification.action.onClick}
                        className={`
                          text-sm font-medium underline transition-colors
                          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded
                          ${styles.button}
                        `}
                      >
                        {notification.action.label}
                      </button>
                    </div>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => onDismiss(notification.id)}
                  className={`
                    flex-shrink-0 p-1 rounded-md transition-colors
                    hover:bg-black hover:bg-opacity-10
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${styles.icon}
                  `}
                  aria-label="Dismiss notification"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress Bar for Auto-hide */}
              {notification.autoHide !== false && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: (notification.duration || 5000) / 1000,
                    ease: 'linear'
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing security notifications
export function useSecurityNotifications() {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);

  const addNotification = (notification: Omit<SecurityNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Predefined notification creators
  const showLoginSuccess = (email: string, location?: string) => {
    return addNotification({
      type: 'success',
      title: 'Login Successful',
      message: `Welcome back! You've successfully signed in${location ? ` from ${location}` : ''}.`,
      autoHide: true,
      duration: 4000
    });
  };

  const showSecurityAlert = (message: string, action?: SecurityNotification['action']) => {
    return addNotification({
      type: 'warning',
      title: 'Security Alert',
      message,
      action,
      autoHide: false
    });
  };

  const showOtpSent = (email: string) => {
    return addNotification({
      type: 'info',
      title: 'Verification Code Sent',
      message: `We've sent a 6-digit code to ${email}. Please check your email.`,
      autoHide: true,
      duration: 6000
    });
  };

  const showSessionExtended = (duration: string) => {
    return addNotification({
      type: 'info',
      title: 'Session Extended',
      message: `Your session has been extended for ${duration}.`,
      autoHide: true,
      duration: 3000
    });
  };

  const showLoginError = (message: string) => {
    return addNotification({
      type: 'error',
      title: 'Login Failed',
      message,
      autoHide: true,
      duration: 6000
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showLoginSuccess,
    showSecurityAlert,
    showOtpSent,
    showSessionExtended,
    showLoginError
  };
}

export type { SecurityNotification, SecurityNotificationsProps };