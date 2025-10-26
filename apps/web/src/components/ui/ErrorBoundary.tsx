'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    // In a real app, this would open a bug report form or send to error tracking
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.log('Bug report data:', errorDetails);
    // You could send this to your error tracking service
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="text-center">
              <div className="p-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4"
                >
                  <AlertTriangle className="w-8 h-8 text-error-600" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-xl font-semibold text-secondary-900 mb-2"
                >
                  Something went wrong
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-secondary-600 mb-6"
                >
                  We encountered an unexpected error. Please try refreshing the page or go back to the homepage.
                </motion.p>

                {this.props.showDetails && this.state.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="mb-6 p-4 bg-secondary-100 rounded-lg text-left"
                  >
                    <h3 className="text-sm font-medium text-secondary-900 mb-2">Error Details:</h3>
                    <p className="text-xs text-secondary-700 font-mono break-all">
                      {this.state.error.message}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={this.handleRetry}
                    variant="primary"
                    fullWidth
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Try Again
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      size="sm"
                      icon={<Home className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Go Home
                    </Button>

                    <Button
                      onClick={this.handleReportBug}
                      variant="ghost"
                      size="sm"
                      icon={<Bug className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Report Bug
                    </Button>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  return (error: Error) => {
    throw error;
  };
}