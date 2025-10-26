'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastProps, ToastType } from './Toast';
import { AnimatePresence } from 'framer-motion';

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id'>) => void;
  showSuccess: (title: string, message?: string, options?: Partial<ToastProps>) => void;
  showError: (title: string, message?: string, options?: Partial<ToastProps>) => void;
  showWarning: (title: string, message?: string, options?: Partial<ToastProps>) => void;
  showInfo: (title: string, message?: string, options?: Partial<ToastProps>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastProvider({ 
  children, 
  maxToasts = 5,
  position = 'top-right' 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = generateId();
    const newToast = { ...toast, id };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
  };

  const showSuccess = (title: string, message?: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'success', title, message, ...options });
  };

  const showError = (title: string, message?: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'error', title, message, persistent: true, ...options });
  };

  const showWarning = (title: string, message?: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'warning', title, message, ...options });
  };

  const showInfo = (title: string, message?: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'info', title, message, ...options });
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
        clearAll,
      }}
    >
      {children}
      
      {/* Toast Container */}
      <div className={`fixed z-50 pointer-events-none ${getPositionClasses()}`}>
        <div className="space-y-2 pointer-events-auto">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                {...toast}
                onRemove={removeToast}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}