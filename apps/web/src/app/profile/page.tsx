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
      <div className="min-h-screen bg-gray-50">
        
        {/* Profile Header */}
        <ProfileHeader />

        {/* Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm">
            
            {/* Profile Tabs */}
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <div className="p-6">
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
    </DashboardLayout>
  );
}