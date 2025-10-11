'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthNavigation from '@/components/AuthNavigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { LoginFeatures } from '@/components/auth/LoginFeatures';
import { LoginDemo } from '@/components/auth/LoginDemo';
import { DemoNotice } from '@/components/auth/DemoNotice';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLoginSuccess = (user: any, tokens: { accessToken: string; refreshToken: string }) => {
    login(user, tokens.accessToken, tokens.refreshToken);
    router.push('/dashboard');
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Social login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AuthNavigation />
      
      <div className="flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full mb-4"
            >
              🔐 Secure Login
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">Welcome Back</h1>
            <p className="text-xl text-gray-600 leading-relaxed">Sign in with your email or username</p>
          </motion.div>

        {/* Enhanced Sign In Form */}
        <div className="relative">
          <div className="absolute inset-0 z-0 rounded-2xl blur-[40px] opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-200 z-10"
          >
            {/* Enhanced Login Form */}
            <LoginForm
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />

            {/* Social Authentication */}
            <SocialAuthButtons
              onSocialLogin={handleSocialLogin}
              className="mt-6"
            />

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Forgot Password Link */}
            <div className="mt-3 text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              >
                Forgot your password?
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Login Features */}
        <LoginFeatures className="mt-6" />

        {/* Demo Notice */}
        <DemoNotice className="mt-6" />
        
        {/* Interactive Demo */}
        <LoginDemo className="mt-4" />
        </div>
      </div>
    </div>
  );
}