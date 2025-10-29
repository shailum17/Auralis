'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeBannerProps {
  onDismiss?: () => void;
}

export default function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);

  useEffect(() => {
    // Check if user just completed onboarding
    const justCompleted = sessionStorage.getItem('justCompletedOnboarding');
    const interests = localStorage.getItem('userInterests');
    
    if (justCompleted && interests) {
      setUserInterests(JSON.parse(interests));
      setIsVisible(true);
      sessionStorage.removeItem('justCompletedOnboarding');
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const forumNames: Record<string, string> = {
    'academic-help': 'Academic Help',
    'career-guidance': 'Career Guidance',
    'mental-wellness': 'Mental Wellness',
    'tech-innovation': 'Tech & Innovation',
    'creative-arts': 'Creative Arts',
    'sports-fitness': 'Sports & Fitness',
    'campus-life': 'Campus Life',
    'study-groups': 'Study Groups'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-6 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎉</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Welcome to Auralis Community!</h3>
                <p className="text-blue-100 mb-4">
                  You're all set! Based on your interests, we've personalized your experience. 
                  You can now explore these forums:
                </p>
                
                {/* Selected Interests */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {userInterests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {forumNames[interest] || interest}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDismiss}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    Start Exploring
                  </button>
                  <span className="text-blue-100 text-sm">
                    You can change your interests anytime in settings
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}