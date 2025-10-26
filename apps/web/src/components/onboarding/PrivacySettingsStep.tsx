'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Shield, Eye, MessageCircle, Users, Database, Bell, Lock, Info } from 'lucide-react';

interface PrivacySettingsData {
  allowDirectMessages: boolean;
  showOnlineStatus: boolean;
  allowProfileViewing: boolean;
  dataCollection: boolean;
}

interface PrivacySettingsStepProps {
  data: PrivacySettingsData;
  onChange: (field: keyof PrivacySettingsData, value: boolean) => void;
  errors: Record<string, string>;
}

const privacySettings = [
  {
    key: 'allowDirectMessages' as keyof PrivacySettingsData,
    title: 'Direct Messages',
    description: 'Allow other students to send you private messages',
    icon: MessageCircle,
    color: 'blue',
    details: 'You can always block specific users or change this setting later.',
    recommended: true,
  },
  {
    key: 'showOnlineStatus' as keyof PrivacySettingsData,
    title: 'Online Status',
    description: 'Show when you\'re online and active on the platform',
    icon: Eye,
    color: 'green',
    details: 'This helps friends know when you\'re available for study sessions.',
    recommended: true,
  },
  {
    key: 'allowProfileViewing' as keyof PrivacySettingsData,
    title: 'Profile Visibility',
    description: 'Allow other students to view your profile information',
    icon: Users,
    color: 'purple',
    details: 'Your basic info and interests will be visible to help you connect with peers.',
    recommended: true,
  },
  {
    key: 'dataCollection' as keyof PrivacySettingsData,
    title: 'Analytics & Insights',
    description: 'Allow us to collect usage data to provide personalized insights',
    icon: Database,
    color: 'orange',
    details: 'This helps us improve your experience and provide better wellness recommendations.',
    recommended: false,
  },
];

export function PrivacySettingsStep({ data, onChange, errors }: PrivacySettingsStepProps) {
  const getIconColor = (color: string, isEnabled: boolean) => {
    const colors = {
      blue: isEnabled ? 'text-blue-600' : 'text-secondary-400',
      green: isEnabled ? 'text-green-600' : 'text-secondary-400',
      purple: isEnabled ? 'text-purple-600' : 'text-secondary-400',
      orange: isEnabled ? 'text-orange-600' : 'text-secondary-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBorderColor = (color: string, isEnabled: boolean) => {
    const colors = {
      blue: isEnabled ? 'border-blue-200 bg-blue-50' : 'border-secondary-200 bg-white',
      green: isEnabled ? 'border-green-200 bg-green-50' : 'border-secondary-200 bg-white',
      purple: isEnabled ? 'border-purple-200 bg-purple-50' : 'border-secondary-200 bg-white',
      orange: isEnabled ? 'border-orange-200 bg-orange-50' : 'border-secondary-200 bg-white',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

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
          <Shield className="w-8 h-8 text-primary-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Privacy Settings
        </h2>
        <p className="text-secondary-600">
          Control your privacy and how you interact with other students
        </p>
      </div>

      <Card variant="outlined" className="border-primary-200">
        <CardContent className="space-y-6">
          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Your Privacy Matters
                </h4>
                <p className="text-sm text-blue-800">
                  You have full control over your privacy settings. You can change any of these preferences at any time in your account settings.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            {privacySettings.map((setting, index) => (
              <motion.div
                key={setting.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                  getBorderColor(setting.color, data[setting.key])
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      data[setting.key] 
                        ? `bg-${setting.color}-100` 
                        : 'bg-secondary-100'
                    }`}>
                      <setting.icon className={`w-5 h-5 ${getIconColor(setting.color, data[setting.key])}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-secondary-900">
                          {setting.title}
                        </h4>
                        {setting.recommended && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary-600 mb-2">
                        {setting.description}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {setting.details}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex-shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() => onChange(setting.key, !data[setting.key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        data[setting.key] 
                          ? `bg-${setting.color}-600` 
                          : 'bg-secondary-300'
                      }`}
                      role="switch"
                      aria-checked={data[setting.key]}
                      aria-labelledby={`${setting.key}-label`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          data[setting.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Data Usage Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-secondary-50 border border-secondary-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-secondary-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-secondary-900 mb-2">
                  How We Use Your Information
                </h4>
                <ul className="text-sm text-secondary-700 space-y-1">
                  <li>• Connect you with study groups and peers with similar interests</li>
                  <li>• Provide personalized wellness recommendations and resources</li>
                  <li>• Improve our platform based on usage patterns (anonymized data)</li>
                  <li>• Send relevant notifications about platform features and updates</li>
                </ul>
                <p className="text-xs text-secondary-600 mt-3">
                  We never sell your personal information to third parties. Read our{' '}
                  <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                    Privacy Policy
                  </a>{' '}
                  for more details.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Setup Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="border-t border-secondary-200 pt-6"
          >
            <h4 className="text-sm font-medium text-secondary-900 mb-4">
              Quick Setup
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  onChange('allowDirectMessages', true);
                  onChange('showOnlineStatus', true);
                  onChange('allowProfileViewing', true);
                  onChange('dataCollection', true);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Enable All (Recommended)
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('allowDirectMessages', true);
                  onChange('showOnlineStatus', false);
                  onChange('allowProfileViewing', true);
                  onChange('dataCollection', false);
                }}
                className="flex-1 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
              >
                Balanced Privacy
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('allowDirectMessages', false);
                  onChange('showOnlineStatus', false);
                  onChange('allowProfileViewing', false);
                  onChange('dataCollection', false);
                }}
                className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors text-sm font-medium"
              >
                Maximum Privacy
              </button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}