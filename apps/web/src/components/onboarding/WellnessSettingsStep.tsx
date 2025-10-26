'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Heart, Brain, Activity, Bell, Shield, Zap, Moon, Target, AlertTriangle, TrendingUp } from 'lucide-react';

interface WellnessSettingsData {
  trackMood: boolean;
  trackStress: boolean;
  shareWellnessData: boolean;
  crisisAlertsEnabled: boolean;
  allowWellnessInsights: boolean;
}

interface WellnessSettingsStepProps {
  data: WellnessSettingsData;
  onChange: (field: keyof WellnessSettingsData, value: boolean) => void;
  errors: Record<string, string>;
}

const wellnessFeatures = [
  {
    key: 'trackMood' as keyof WellnessSettingsData,
    title: 'Mood Tracking',
    description: 'Log your daily emotions and identify patterns over time',
    icon: Heart,
    color: 'green',
    details: 'Track your emotional wellbeing with simple daily check-ins and see trends over time.',
    benefits: ['Identify mood patterns', 'Track emotional progress', 'Personalized insights'],
    recommended: true,
  },
  {
    key: 'trackStress' as keyof WellnessSettingsData,
    title: 'Stress Monitoring',
    description: 'Monitor stress levels and receive personalized coping strategies',
    icon: Brain,
    color: 'blue',
    details: 'Get help managing academic and personal stress with tailored recommendations.',
    benefits: ['Stress level awareness', 'Coping strategies', 'Early intervention'],
    recommended: true,
  },
  {
    key: 'allowWellnessInsights' as keyof WellnessSettingsData,
    title: 'AI Wellness Insights',
    description: 'Receive AI-powered insights about your wellbeing patterns',
    icon: TrendingUp,
    color: 'purple',
    details: 'Get personalized recommendations based on your wellness data and usage patterns.',
    benefits: ['Personalized recommendations', 'Pattern recognition', 'Proactive support'],
    recommended: true,
  },
  {
    key: 'crisisAlertsEnabled' as keyof WellnessSettingsData,
    title: 'Crisis Support',
    description: 'Enable alerts and immediate access to crisis resources when needed',
    icon: AlertTriangle,
    color: 'red',
    details: 'Automatic detection of concerning patterns with immediate access to professional help.',
    benefits: ['Emergency resources', 'Professional support', 'Safety monitoring'],
    recommended: true,
  },
  {
    key: 'shareWellnessData' as keyof WellnessSettingsData,
    title: 'Anonymous Data Sharing',
    description: 'Share anonymized wellness data to help improve mental health research',
    icon: Shield,
    color: 'orange',
    details: 'Contribute to mental health research while keeping your identity completely private.',
    benefits: ['Support research', 'Help other students', 'Completely anonymous'],
    recommended: false,
  },
];

const wellnessBenefits = [
  {
    icon: Target,
    title: 'Personalized Goals',
    description: 'Set and track wellness goals tailored to your needs'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Gentle reminders for self-care and wellness activities'
  },
  {
    icon: Activity,
    title: 'Progress Tracking',
    description: 'Visual progress tracking and achievement celebrations'
  },
  {
    icon: Moon,
    title: 'Sleep & Habits',
    description: 'Track sleep patterns and build healthy habits'
  }
];

export function WellnessSettingsStep({ data, onChange, errors }: WellnessSettingsStepProps) {
  const getIconColor = (color: string, isEnabled: boolean) => {
    const colors = {
      green: isEnabled ? 'text-green-600' : 'text-secondary-400',
      blue: isEnabled ? 'text-blue-600' : 'text-secondary-400',
      purple: isEnabled ? 'text-purple-600' : 'text-secondary-400',
      red: isEnabled ? 'text-red-600' : 'text-secondary-400',
      orange: isEnabled ? 'text-orange-600' : 'text-secondary-400',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const getBorderColor = (color: string, isEnabled: boolean) => {
    const colors = {
      green: isEnabled ? 'border-green-200 bg-green-50' : 'border-secondary-200 bg-white',
      blue: isEnabled ? 'border-blue-200 bg-blue-50' : 'border-secondary-200 bg-white',
      purple: isEnabled ? 'border-purple-200 bg-purple-50' : 'border-secondary-200 bg-white',
      red: isEnabled ? 'border-red-200 bg-red-50' : 'border-secondary-200 bg-white',
      orange: isEnabled ? 'border-orange-200 bg-orange-50' : 'border-secondary-200 bg-white',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const enabledCount = Object.values(data).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Heart className="w-8 h-8 text-primary-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Wellness Features
        </h2>
        <p className="text-secondary-600">
          Enable wellness tracking features to support your mental health journey
        </p>
      </div>

      {/* Wellness Benefits Overview */}
      <Card variant="gradient" className="border-primary-200">
        <CardContent>
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Why Track Your Wellness?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wellnessBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <benefit.icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-secondary-900 text-sm">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-secondary-600">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wellness Features */}
      <Card variant="outlined" className="border-primary-200">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Choose Your Wellness Features
            </h3>
            {enabledCount > 0 && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {enabledCount} enabled
              </span>
            )}
          </div>

          <div className="space-y-4">
            {wellnessFeatures.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`border-2 rounded-lg p-5 transition-all duration-200 ${
                  getBorderColor(feature.color, data[feature.key])
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      data[feature.key] 
                        ? `bg-${feature.color}-100` 
                        : 'bg-secondary-100'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${getIconColor(feature.color, data[feature.key])}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-secondary-900">
                          {feature.title}
                        </h4>
                        {feature.recommended && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 mb-3">
                        {feature.description}
                      </p>
                      <p className="text-xs text-secondary-500 mb-3">
                        {feature.details}
                      </p>
                      
                      {/* Benefits */}
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className={`px-2 py-1 text-xs rounded-full ${
                              data[feature.key]
                                ? `bg-${feature.color}-100 text-${feature.color}-700`
                                : 'bg-secondary-100 text-secondary-600'
                            }`}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex-shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() => onChange(feature.key, !data[feature.key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        data[feature.key] 
                          ? `bg-${feature.color}-600` 
                          : 'bg-secondary-300'
                      }`}
                      role="switch"
                      aria-checked={data[feature.key]}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          data[feature.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Privacy & Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Your Data is Secure & Private
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All wellness data is encrypted and stored securely</li>
                  <li>• You can export or delete your data at any time</li>
                  <li>• Anonymous data sharing helps improve mental health research</li>
                  <li>• Crisis support connects you with professional resources when needed</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Quick Setup Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="border-t border-secondary-200 pt-6"
          >
            <h4 className="text-sm font-medium text-secondary-900 mb-4">
              Quick Setup
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  onChange('trackMood', true);
                  onChange('trackStress', true);
                  onChange('allowWellnessInsights', true);
                  onChange('crisisAlertsEnabled', true);
                  onChange('shareWellnessData', false);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Enable Recommended
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('trackMood', true);
                  onChange('trackStress', true);
                  onChange('allowWellnessInsights', true);
                  onChange('crisisAlertsEnabled', true);
                  onChange('shareWellnessData', true);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Enable All Features
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('trackMood', false);
                  onChange('trackStress', false);
                  onChange('allowWellnessInsights', false);
                  onChange('crisisAlertsEnabled', true); // Keep crisis alerts enabled for safety
                  onChange('shareWellnessData', false);
                }}
                className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors text-sm font-medium"
              >
                Minimal Setup
              </button>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Completion Message */}
      {enabledCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Great Choice! 🎉
          </h3>
          <p className="text-green-800 text-sm">
            You've enabled {enabledCount} wellness feature{enabledCount !== 1 ? 's' : ''}. 
            You're all set to start your wellness journey with personalized support and insights.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}