'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessNotificationProps {
  isVisible: boolean;
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

export function SuccessNotification({
  isVisible,
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
  className = ''
}: SuccessNotificationProps) {
  const [shouldShow, setShouldShow] = useState(isVisible);

  useEffect(() => {
    setShouldShow(isVisible);
    
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        setShouldShow(false);
        onClose?.();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setShouldShow(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-4 right-4 z-50 max-w-md ${className}`}
        >
          <div className="bg-white rounded-lg shadow-lg border border-success-200 overflow-hidden">
            {/* Success indicator bar */}
            <div className="h-1 bg-success-500" />
            
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  <CheckCircle className="w-6 h-6 text-success-500" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <motion.h4
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-sm font-semibold text-success-800"
                  >
                    {title}
                  </motion.h4>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-sm text-success-700 mt-1"
                  >
                    {message}
                  </motion.p>
                </div>
                
                {onClose && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    onClick={handleClose}
                    className="flex-shrink-0 text-success-400 hover:text-success-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Auto-close progress bar */}
            {autoClose && (
              <motion.div
                className="h-1 bg-success-200"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}