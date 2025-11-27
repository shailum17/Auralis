'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface SocialTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function SocialTrackerModal({ 
  isOpen, 
  onClose, 
  onSave 
}: SocialTrackerModalProps) {
  const { user } = useAuth();
  const [connectionQuality, setConnectionQuality] = useState<number>(3);
  const [selectedInteractions, setSelectedInteractions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const qualityLabels = [
    { score: 1, label: 'Very Isolated', color: 'from-gray-500 to-gray-600' },
    { score: 2, label: 'Somewhat Lonely', color: 'from-orange-500 to-orange-600' },
    { score: 3, label: 'Neutral', color: 'from-yellow-500 to-yellow-600' },
    { score: 4, label: 'Connected', color: 'from-green-500 to-green-600' },
    { score: 5, label: 'Very Connected', color: 'from-emerald-500 to-emerald-600' },
  ];

  const interactions = [
    'In-person', 'Online', 'Phone call', 'Video chat',
    'Text message', 'Social media', 'Email', 'Group chat'
  ];

  const activities = [
    'Study group', 'Hangout', 'Coffee/meal', 'Sports/exercise',
    'Gaming', 'Movie/show', 'Project collaboration', 'Event/party',
    'Club meeting', 'Volunteer work', 'Family time', 'Date'
  ];

  const feelings = [
    'Supported', 'Energized', 'Connected', 'Understood',
    'Lonely', 'Drained', 'Awkward', 'Anxious',
    'Happy', 'Grateful', 'Inspired', 'Comfortable'
  ];

  useEffect(() => {
    if (isOpen) {
      setConnectionQuality(3);
      setSelectedInteractions([]);
      setSelectedActivities([]);
      setSelectedFeelings([]);
      setNotes('');
    }
  }, [isOpen]);

  const handleInteractionToggle = (interaction: string) => {
    setSelectedInteractions(prev =>
      prev.includes(interaction)
        ? prev.filter(i => i !== interaction)
        : [...prev, interaction]
    );
  };

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleFeelingToggle = (feeling: string) => {
    setSelectedFeelings(prev =>
      prev.includes(feeling)
        ? prev.filter(f => f !== feeling)
        : [...prev, feeling]
    );
  };

  const handleSaveEntry = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Please log in to save your social connection entry');
        return;
      }

      const requestData = {
        connectionQuality,
        interactions: selectedInteractions,
        activities: selectedActivities,
        feelings: selectedFeelings,
        notes: notes.trim() || undefined,
      };

      const response = await fetch('/api/v1/wellness/social', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        if (onSave) onSave();
        onClose();
        alert('Social connection entry saved successfully!');
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || 'Failed to save social entry');
      }
    } catch (error) {
      console.error('Error saving social entry:', error);
      alert('An error occurred while saving your social entry.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Track Social Connection</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Connection Quality */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How connected do you feel today?
              </label>
              <div className="grid grid-cols-5 gap-3">
                {qualityLabels.map((quality) => (
                  <button
                    key={quality.score}
                    onClick={() => setConnectionQuality(quality.score)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      connectionQuality === quality.score
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${quality.color} flex items-center justify-center text-white font-bold`}>
                      {quality.score}
                    </div>
                    <div className="text-xs font-medium text-gray-600 text-center">{quality.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Types of interactions <span className="text-red-600">* (Required - Min 2)</span>
              </label>
              {selectedInteractions.length < 2 && (
                <p className="text-sm text-red-600 mb-2">
                  ⚠️ Please select at least 2 interaction types
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {interactions.map(interaction => (
                  <button
                    key={interaction}
                    onClick={() => handleInteractionToggle(interaction)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedInteractions.includes(interaction)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interaction}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Social activities (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {activities.map(activity => (
                  <button
                    key={activity}
                    onClick={() => handleActivityToggle(activity)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedActivities.includes(activity)
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>

            {/* Feelings */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How did you feel? <span className="text-red-600">* (Required - Min 2)</span>
              </label>
              {selectedFeelings.length < 2 && (
                <p className="text-sm text-red-600 mb-2">
                  ⚠️ Please select at least 2 feelings
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {feelings.map(feeling => (
                  <button
                    key={feeling}
                    onClick={() => handleFeelingToggle(feeling)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedFeelings.includes(feeling)
                        ? (feeling === 'Lonely' || feeling === 'Drained' || feeling === 'Awkward' || feeling === 'Anxious'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-green-600 text-white shadow-md')
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other details about your social interactions..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                disabled={saving || !connectionQuality || selectedInteractions.length < 2 || selectedFeelings.length < 2}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
