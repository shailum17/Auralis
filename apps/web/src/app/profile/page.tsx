'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import PersonalInfo from '@/components/profile/PersonalInfo';
import PrivacySettings from '@/components/profile/PrivacySettings';
import WellnessData from '@/components/profile/WellnessData';
import ActivityHistory from '@/components/profile/ActivityHistory';
import AccountSettings from '@/components/profile/AccountSettings';
import { ProfileCompletionBanner } from '@/components/profile/ProfileCompletionBanner';



export default function Profile() {
  const [activeTab, setActiveTab] = useState('personal');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfo />;
      case 'privacy':
        return <PrivacySettings />;
      case 'wellness':
        return <WellnessData />;
      case 'activity':
        return <ActivityHistory />;
      case 'account':
        return <AccountSettings />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">

        {/* Profile Header */}
        <ProfileHeader />

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">




          {/* Profile Completion Banner */}
          <ProfileCompletionBanner className="mb-8" />

          {/* Enhanced Profile Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar with Quick Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="font-medium">Edit Profile</span>
                    </div>
                  </button>

                  <button className="w-full text-left px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Wellness Check</span>
                    </div>
                  </button>

                  <button className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">Find Study Groups</span>
                    </div>
                  </button>
                </div>

                {/* Profile Completion */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Completion</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">Dynamic</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: 'Dynamic%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Complete your profile to connect better with the community!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                {/* Enhanced Profile Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {/* Tab Content with Better Padding */}
                <div className="p-8">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}