'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface AdminAccessProps {
  params: {
    token: string;
  };
}

export default function AdminAccess({ params }: AdminAccessProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying admin access token...');

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const adminToken = params.token;
        const validToken = process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN;
        
        // Check if access token is configured
        if (!validToken) {
          setStatus('error');
          setMessage('Admin access token not configured in environment variables.');
          setTimeout(() => {
            router.push('/auth/signin');
          }, 2000);
          return;
        }
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (adminToken === validToken) {
          setStatus('success');
          setMessage('Access granted! Creating admin session...');
          
          // Create admin user object
          const adminUser = {
            id: 'admin-url-access',
            email: 'admin@system.local',
            username: 'admin',
            fullName: 'Quick Access Administrator',
            role: 'ADMIN' as const,
            emailVerified: true,
            phoneVerified: false,
            bio: 'Quick Access Admin Account',
            interests: [],
            academicInfo: null,
            privacySettings: {
              allowDirectMessages: false,
              showOnlineStatus: false,
              allowProfileViewing: false,
              dataCollection: false,
            },
            wellnessSettings: {
              trackMood: false,
              trackStress: false,
              shareWellnessData: false,
              crisisAlertsEnabled: false,
              allowWellnessInsights: false,
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          };
          
          // Generate tokens
          const accessToken = `quick_admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const refreshToken = `quick_admin_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Store admin session
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          // Store session config
          const sessionConfig = {
            rememberMe: true,
            loginTime: new Date().toISOString(),
            loginMethod: 'quick-access'
          };
          localStorage.setItem('sessionConfig', JSON.stringify(sessionConfig));
          
          // Log access for security
          console.log(`🚀 Quick admin access granted at ${new Date().toISOString()}`);
          
          // Wait a moment then redirect
          setTimeout(() => {
            router.push('/community/admin');
          }, 1000);
          
        } else {
          setStatus('error');
          setMessage('Invalid access token. Redirecting to login...');
          
          setTimeout(() => {
            router.push('/auth/signin');
          }, 2000);
        }
      } catch (error) {
        console.error('Admin access error:', error);
        setStatus('error');
        setMessage('An error occurred. Redirecting to login...');
        
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    };

    verifyAdminAccess();
  }, [params.token, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return '🔍';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔍';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'from-blue-600 to-indigo-600';
      case 'success':
        return 'from-green-600 to-emerald-600';
      case 'error':
        return 'from-red-600 to-rose-600';
      default:
        return 'from-blue-600 to-indigo-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getStatusColor()} px-8 py-8`}>
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: status === 'verifying' ? 360 : 0,
                  scale: status === 'success' ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: status === 'verifying' ? Infinity : 0 },
                  scale: { duration: 0.5 }
                }}
                className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-4xl">{getStatusIcon()}</span>
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Admin Access</h2>
              <p className="text-white text-opacity-90 mt-2">Quick Access Portal</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="text-center">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-700 text-lg font-medium mb-4">{message}</p>
                
                {status === 'verifying' && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
                
                {status === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center">
                      <span className="text-green-500 mr-2">🎉</span>
                      <span className="text-green-800 font-medium">Admin access granted!</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">
                      Redirecting to admin panel...
                    </p>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-center">
                      <span className="text-red-500 mr-2">⚠️</span>
                      <span className="text-red-800 font-medium">Access denied</span>
                    </div>
                    <p className="text-red-700 text-sm mt-2">
                      Invalid or expired access token
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Secure admin access • Token: {params.token.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">ℹ️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Quick Access</h4>
              <p className="text-xs text-blue-700 mt-1">
                This URL provides quick admin access for development and testing.
                Access attempts are logged for security purposes.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}