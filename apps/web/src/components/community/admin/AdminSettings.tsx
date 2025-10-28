'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CommunitySettings {
  autoModeration: boolean;
  requireApproval: boolean;
  allowAnonymous: boolean;
  maxPostLength: number;
  maxReplyLength: number;
  reportThreshold: number;
  bannedWords: string[];
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
  }>;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<CommunitySettings>({
    autoModeration: true,
    requireApproval: false,
    allowAnonymous: true,
    maxPostLength: 5000,
    maxReplyLength: 2000,
    reportThreshold: 3,
    bannedWords: ['spam', 'inappropriate'],
    categories: [
      { id: 'general', name: 'General Discussion', icon: '💬', enabled: true },
      { id: 'academic', name: 'Academic Help', icon: '📚', enabled: true },
      { id: 'wellness', name: 'Wellness & Mental Health', icon: '💚', enabled: true },
      { id: 'career', name: 'Career & Internships', icon: '💼', enabled: true },
      { id: 'events', name: 'Events & Activities', icon: '🎉', enabled: true },
      { id: 'housing', name: 'Housing & Roommates', icon: '🏠', enabled: true },
      { id: 'marketplace', name: 'Buy & Sell', icon: '🛒', enabled: true },
      { id: 'tech', name: 'Tech & Programming', icon: '💻', enabled: true },
      { id: 'social', name: 'Social & Meetups', icon: '👥', enabled: true }
    ]
  });

  const [newBannedWord, setNewBannedWord] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would save to the backend
    console.log('Saving settings:', settings);
    
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const addBannedWord = () => {
    if (newBannedWord.trim() && !settings.bannedWords.includes(newBannedWord.trim())) {
      setSettings(prev => ({
        ...prev,
        bannedWords: [...prev.bannedWords, newBannedWord.trim()]
      }));
      setNewBannedWord('');
    }
  };

  const removeBannedWord = (word: string) => {
    setSettings(prev => ({
      ...prev,
      bannedWords: prev.bannedWords.filter(w => w !== word)
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Community Settings</h2>
          <p className="text-gray-600">Configure forum settings and moderation rules</p>
        </div>
        
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Auto Moderation</label>
                <p className="text-xs text-gray-500">Automatically moderate posts based on rules</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoModeration}
                onChange={(e) => setSettings(prev => ({ ...prev, autoModeration: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Require Approval</label>
                <p className="text-xs text-gray-500">New posts require admin approval</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApproval}
                onChange={(e) => setSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Allow Anonymous Posts</label>
                <p className="text-xs text-gray-500">Users can post anonymously</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowAnonymous}
                onChange={(e) => setSettings(prev => ({ ...prev, allowAnonymous: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Content Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Limits</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Post Length (characters)
              </label>
              <input
                type="number"
                value={settings.maxPostLength}
                onChange={(e) => setSettings(prev => ({ ...prev, maxPostLength: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="100"
                max="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Reply Length (characters)
              </label>
              <input
                type="number"
                value={settings.maxReplyLength}
                onChange={(e) => setSettings(prev => ({ ...prev, maxReplyLength: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="50"
                max="5000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Threshold
              </label>
              <input
                type="number"
                value={settings.reportThreshold}
                onChange={(e) => setSettings(prev => ({ ...prev, reportThreshold: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of reports before auto-hiding content
              </p>
            </div>
          </div>
        </motion.div>

        {/* Banned Words */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Banned Words</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newBannedWord}
                onChange={(e) => setNewBannedWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBannedWord()}
                placeholder="Add banned word..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addBannedWord}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {settings.bannedWords.map((word, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => removeBannedWord(word)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            
            {settings.bannedWords.length === 0 && (
              <p className="text-sm text-gray-500 italic">No banned words configured</p>
            )}
          </div>
        </motion.div>

        {/* Categories Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          
          <div className="space-y-3">
            {settings.categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <input
                  type="checkbox"
                  checked={category.enabled}
                  onChange={() => toggleCategory(category.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Advanced Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Backup & Export</h4>
            <p className="text-sm text-gray-600 mb-3">Export community data for backup purposes</p>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export Data
            </button>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Reset Statistics</h4>
            <p className="text-sm text-gray-600 mb-3">Reset all community statistics and counters</p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Reset Stats
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}