'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    allowDirectMessages: true,
    showOnlineStatus: true,
    allowProfileViewing: true,
    dataCollection: true,
    anonymousPosting: false,
    shareWellnessData: false,
    publicProfile: true,
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const privacyOptions = [
    {
      category: 'Profile Privacy',
      options: [
        {
          key: 'publicProfile',
          title: 'Public Profile',
          description: 'Allow other students to view your profile and posts',
          value: settings.publicProfile
        },
        {
          key: 'allowProfileViewing',
          title: 'Profile Viewing',
          description: 'Let others see your profile information',
          value: settings.allowProfileViewing
        },
        {
          key: 'showOnlineStatus',
          title: 'Online Status',
          description: 'Show when you\'re active on the platform',
          value: settings.showOnlineStatus
        }
      ]
    },
    {
      category: 'Communication',
      options: [
        {
          key: 'allowDirectMessages',
          title: 'Direct Messages',
          description: 'Allow other students to send you private messages',
          value: settings.allowDirectMessages
        },
        {
          key: 'anonymousPosting',
          title: 'Anonymous Posting by Default',
          description: 'Make all your posts anonymous unless specified',
          value: settings.anonymousPosting
        }
      ]
    },
    {
      category: 'Data & Wellness',
      options: [
        {
          key: 'dataCollection',
          title: 'Data Collection',
          description: 'Allow collection of usage data to improve your experience',
          value: settings.dataCollection
        },
        {
          key: 'shareWellnessData',
          title: 'Share Wellness Insights',
          description: 'Share anonymized wellness data to help improve platform features',
          value: settings.shareWellnessData
        }
      ]
    },
    {
      category: 'Notifications',
      options: [
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive important updates via email',
          value: settings.emailNotifications
        },
        {
          key: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Get real-time notifications on your device',
          value: settings.pushNotifications
        },
        {
          key: 'marketingEmails',
          title: 'Marketing Emails',
          description: 'Receive newsletters and promotional content',
          value: settings.marketingEmails
        }
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
          <p className="text-gray-600 mt-1">Control how your information is shared and used</p>
        </div>
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          Privacy Protected
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Your Privacy Matters</h3>
            <p className="text-sm text-blue-700 mt-1">
              We're committed to protecting your privacy. You have full control over your data and can change these settings anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-8">
        {privacyOptions.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
            <div className="space-y-4">
              {category.options.map((option, optionIndex) => (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: optionIndex * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{option.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(option.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      option.value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        option.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data Export & Deletion */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export My Data</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Account</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          You can export all your data or permanently delete your account at any time. 
          These actions are irreversible, so please consider carefully.
        </p>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Save Privacy Settings
        </button>
      </div>
    </motion.div>
  );
}