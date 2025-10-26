'use client';

import React, { useState, useEffect } from 'react';
import { authAPI } from '@/lib/auth-api';
import { CheckCircle, Clock, AlertCircle, XCircle, Mail } from 'lucide-react';

interface EmailDeliveryStatusProps {
  emailId?: string;
  email: string;
  className?: string;
  showDetails?: boolean;
}

type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'bounced' | 'unknown';

export function EmailDeliveryStatus({ 
  emailId, 
  email, 
  className = '',
  showDetails = true 
}: EmailDeliveryStatusProps) {
  const [status, setStatus] = useState<DeliveryStatus>('unknown');
  const [deliveredAt, setDeliveredAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailId) {
      checkDeliveryStatus();
    }
  }, [emailId]);

  const checkDeliveryStatus = async () => {
    if (!emailId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await authAPI.getEmailDeliveryStatus(emailId);
      
      if (result.success) {
        setStatus(result.status || 'unknown');
        setDeliveredAt(result.deliveredAt || null);
      } else {
        setError(result.error || 'Failed to check delivery status');
        setStatus('unknown');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('unknown');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />;
    }

    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'bounced':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Mail className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'delivered':
        return 'Email delivered successfully';
      case 'pending':
        return 'Email delivery in progress';
      case 'failed':
        return 'Email delivery failed';
      case 'bounced':
        return 'Email bounced';
      default:
        return 'Email status unknown';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'pending':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'bounced':
        return 'text-orange-600';
      default:
        return 'text-gray-500';
    }
  };

  if (!showDetails && status === 'unknown') {
    return null;
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <div>To: {email}</div>
            
            {deliveredAt && (
              <div>
                Delivered: {new Date(deliveredAt).toLocaleString()}
              </div>
            )}
            
            {emailId && (
              <div className="font-mono">
                ID: {emailId.slice(0, 8)}...
              </div>
            )}
            
            {error && (
              <div className="text-red-500">
                Error: {error}
              </div>
            )}
          </div>
        )}
        
        {status === 'failed' && (
          <div className="text-xs text-red-600 mt-2">
            💡 Try checking your spam folder or contact support if the issue persists.
          </div>
        )}
        
        {status === 'bounced' && (
          <div className="text-xs text-orange-600 mt-2">
            💡 Please verify your email address is correct and try again.
          </div>
        )}
      </div>
      
      {emailId && (
        <button
          onClick={checkDeliveryStatus}
          disabled={isLoading}
          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
          title="Refresh status"
        >
          Refresh
        </button>
      )}
    </div>
  );
}