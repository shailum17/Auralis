'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { DynamicProfileService } from '@/lib/dynamic-profile-service';

export default function DynamicDataInfo() {
  const { user } = useAuth();
  const hasUserData = DynamicProfileService.hasUserData(user);
  const welcomeMessage = DynamicProfileService.getWelcomeMessage(user);
  const suggestions = DynamicProfileService.getSuggestedActions(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dynamic Profile System Active ✨
          </h3>
          
          <p className="text-gray-700 mb-4">
            {welcomeMessage}
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">What's Changed:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Profile completion is now calculated dynamically</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>User stats reflect actual activity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Wellness data shows real user entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Activity history displays actual user actions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Badges are earned through real engagement</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Dashboard shows personalized insights</span>
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Suggested Next Steps:</h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-500' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <span className="font-medium text-gray-900">{suggestion.title}</span>
                      <span className="text-gray-600 ml-2">- {suggestion.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <strong>Technical Note:</strong> All hardcoded data has been replaced with dynamic data loading. 
            The system now fetches user-specific information from the database and displays empty states 
            when no data is available, encouraging real user engagement.
          </div>
        </div>
      </div>
    </motion.div>
  );
}