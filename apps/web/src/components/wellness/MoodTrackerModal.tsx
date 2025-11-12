'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface MoodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  initialMood?: number;
}

export default function MoodTrackerModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialMood 
}: MoodTrackerModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'mood' | 'journal'>('mood');
  const [selectedMood, setSelectedMood] = useState<number | null>(initialMood || null);
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const moodLabels = [
    { score: 1, label: 'Very Low', emoji: '😢', color: 'from-red-500 to-red-600' },
    { score: 2, label: 'Low', emoji: '😟', color: 'from-orange-500 to-orange-600' },
    { score: 3, label: 'Okay', emoji: '😐', color: 'from-yellow-500 to-yellow-600' },
    { score: 4, label: 'Good', emoji: '😊', color: 'from-green-500 to-green-600' },
    { score: 5, label: 'Excellent', emoji: '😄', color: 'from-emerald-500 to-emerald-600' },
  ];

  const availableTags = [
    'Anxious', 'Stressed', 'Happy', 'Sad', 'Tired', 'Energized',
    'Overwhelmed', 'Calm', 'Frustrated', 'Grateful', 'Lonely', 'Connected'
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(initialMood ? 'journal' : 'mood');
      setSelectedMood(initialMood || null);
      setJournalText('');
      setSelectedTags([]);
    }
  }, [isOpen, initialMood]);

  const handleMoodSelect = (score: number) => {
    setSelectedMood(score);
    setStep('journal');
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSaveEntry = async () => {
    if (!selectedMood || !user) return;

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Please log in to save your mood entry');
        return;
      }

      const requestData = {
        moodScore: selectedMood,
        notes: journalText.trim() || undefined,
        tags: selectedTags,
      };

      console.log('Saving mood entry:', requestData);

      const response = await fetch('/api/v1/wellness/mood', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const savedEntry = await response.json();
        
        // Log analysis results (simulated ML workflow)
        if (savedEntry.analysis) {
          console.log('='.repeat(50));
          console.log('MOOD ENTRY SAVED - ANALYSIS RESULTS');
          console.log('='.repeat(50));
          console.log('Self-Reported Mood:', selectedMood, '/5');
          console.log('Journal Stress Score:', savedEntry.analysis.stressScore);
          console.log('Stress Intensity:', savedEntry.analysis.intensity);
          console.log('Detected Keywords:', savedEntry.analysis.detectedKeywords.join(', '));
          console.log('Discrepancy Detected:', savedEntry.analysis.discrepancyDetected);
          console.log('='.repeat(50));
          console.log('Backend ML Workflow: Correlating self-report with linguistic analysis...');
          console.log('='.repeat(50));
        }

        // Reset and close
        setSelectedMood(null);
        setJournalText('');
        setSelectedTags([]);
        setStep('mood');
        
        // Call onSave callback to refresh data
        if (onSave) onSave();
        
        onClose();
        
        // Show success message
        alert('Mood entry saved successfully!');
      } else {
        // Log detailed error information
        const errorData = await response.json().catch(() => null);
        console.error('Failed to save mood entry:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        const errorMessage = errorData?.message || 'Failed to save mood entry. Please try again.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('An error occurred while saving your mood entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step === 'journal') {
      setStep('mood');
    }
  };

  const getMoodData = (score: number) => {
    return moodLabels.find(m => m.score === score) || moodLabels[2];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center space-x-3">
              {step === 'journal' && (
                <button
                  onClick={handleBack}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {step === 'mood' ? 'How are you feeling?' : 'Add Journal Entry'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'mood' ? (
              /* Mood Selection Step */
              <div>
                <p className="text-gray-600 mb-6 text-center">
                  Select your current mood level
                </p>
                
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moodLabels.map((mood, index) => (
                    <motion.button
                      key={mood.score}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleMoodSelect(mood.score)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        selectedMood === mood.score
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center text-3xl shadow-md`}>
                        {mood.emoji}
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 mb-1">{mood.score}</div>
                        <div className="text-xs font-medium text-gray-600">{mood.label}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your entries are completely private and encrypted
                </div>
              </div>
            ) : (
              /* Journal Entry Step */
              <div>
                {/* Selected Mood Display */}
                {selectedMood && (
                  <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getMoodData(selectedMood).color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                      {getMoodData(selectedMood).emoji}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {getMoodData(selectedMood).label}
                      </div>
                      <div className="text-sm text-gray-600">
                        Mood Score: {selectedMood}/5
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How are you feeling? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Journal Text Area */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Write about your day (Optional but recommended)
                  </label>
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="What's on your mind? This is a private space for your thoughts..."
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Private & encrypted
                    </div>
                    <div>{journalText.length} characters</div>
                  </div>
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
                    disabled={saving}
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
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
