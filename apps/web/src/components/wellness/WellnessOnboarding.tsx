'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';

interface WellnessOnboardingProps {
  onComplete?: () => void;
}

export function WellnessOnboarding({ onComplete }: WellnessOnboardingProps) {
  // Use actual auth context
  const { user } = useAuth();
  
  // Fallback data if user doesn't have wellness settings yet
  const fallbackUser = {
    wellnessSettings: {
      trackMood: false,
      trackStress: false,
      allowWellnessInsights: false
    }
  };
  const { updateWellnessSettings, loading, error } = useUserProfile();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const wellnessFeatures = [
    {
      id: 'trackMood',
      title: 'Mood Tracking',
      description: 'Log your daily emotions and identify patterns',
      icon: '😊',
      color: 'bg-green-100 text-green-700',
    },
    {
      id: 'trackStress',
      title: 'Stress Monitoring',
      description: 'Track stress levels and get personalized tips',
      icon: '🧘‍♀️',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'allowWellnessInsights',
      title: 'Wellness Insights',
      description: 'Get AI-powered insights about your wellbeing',
      icon: '📊',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'crisisAlertsEnabled',
      title: 'Crisis Support',
      description: 'Receive alerts and resources when needed',
      icon: '🆘',
      color: 'bg-red-100 text-red-700',
    },
  ];

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleEnableWellness = async () => {
    if (selectedFeatures.length === 0) return;

    const wellnessSettings = {
      trackMood: selectedFeatures.includes('trackMood'),
      trackStress: selectedFeatures.includes('trackStress'),
      allowWellnessInsights: selectedFeatures.includes('allowWellnessInsights'),
      crisisAlertsEnabled: selectedFeatures.includes('crisisAlertsEnabled'),
      shareWellnessData: false, // Default to false for privacy
    };

    const success = await updateWellnessSettings(wellnessSettings);
    if (success && onComplete) {
      onComplete();
    }
  };

  const isWellnessEnabled = !!(
    user?.wellnessSettings?.trackMood || 
    user?.wellnessSettings?.trackStress ||
    user?.wellnessSettings?.allowWellnessInsights
  );

  if (isWellnessEnabled) {
    return null; // Don't show onboarding if already enabled
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <Card variant="wellness">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🌱</div>
          <CardTitle className="text-2xl">Welcome to Wellness Tracking</CardTitle>
          <CardDescription className="text-lg">
            Choose the wellness features you'd like to enable to start your journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wellnessFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => handleFeatureToggle(feature.id)}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                    selectedFeatures.includes(feature.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${feature.color}`}>
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedFeatures.includes(feature.id)
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedFeatures.includes(feature.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Your Privacy Matters
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your wellness data is private and secure. You can change these settings anytime in your profile.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleEnableWellness}
              loading={loading}
              loadingText="Enabling..."
              disabled={selectedFeatures.length === 0}
              className="min-w-[200px]"
            >
              Enable Wellness Tracking
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Maybe Later
            </Button>
          </div>

          {selectedFeatures.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              Select at least one feature to get started
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}