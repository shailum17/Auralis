'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthNavigation from '@/components/AuthNavigation';
import { EnhancedRegistrationForm } from '@/components/auth/EnhancedRegistrationForm';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleRegistrationSuccess = (user: any, tokens: { accessToken: string; refreshToken: string }) => {
    login(user, tokens.accessToken, tokens.refreshToken);
    // Since the enhanced registration form already collects comprehensive user data,
    // we can skip the onboarding process and go directly to the dashboard
    router.push('/dashboard');
  };

  const handleRegistrationError = (error: string) => {
    console.error('Registration error:', error);
  };

  const handleSocialSignup = (provider: string) => {
    console.log(`Social signup with ${provider}`);
    // Implement social signup logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AuthNavigation />
      
      <div className="flex items-center justify-center px-4 pt-16 pb-12">
        <div className="max-w-4xl w-full">
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
              className="inline-block px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-full mb-4"
            >
              🚀 Join Community
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Create Your Account
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands of students in our supportive wellbeing community
            </p>
          </motion.div>

        {/* Enhanced Registration Form */}
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
            {/* Enhanced Registration Form */}
            <EnhancedRegistrationForm
              onSuccess={handleRegistrationSuccess}
              onError={handleRegistrationError}
            />

            {/* Social Authentication */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <SocialAuthButtons
                onSocialLogin={handleSocialSignup}
                className="mb-6"
              />

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
}