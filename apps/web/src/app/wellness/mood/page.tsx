'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface MoodEntry {
  id: string;
  moodScore: number;
  notes: string;
  tags: string[];
  createdAt: string;
  journalStressScore?: number;
  stressKeywords?: string[];
  discrepancyFlag?: boolean;
}

export default function MoodTrackerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quickMood = searchParams?.get('quick');

  const [selectedMood, setSelectedMood] = useState<number | null>(
    quickMood ? parseInt(quickMood) : null
  );
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadMoodEntries();
  }, [user]);

  useEffect(() => {
    if (quickMood && selectedMood) {
      setShowJournalModal(true);
    }
  }, [quickMood, selectedMood]);

  const loadMoodEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/wellness/mood/history?days=30', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const entries = await response.json();
        setMoodEntries(entries);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (score: number) => {
    setSelectedMood(score);
    setShowJournalModal(true);
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

      const response = await fetch('/api/v1/wellness/mood', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodScore: selectedMood,
          notes: journalText.trim() || undefined,
          tags: selectedTags,
        }),
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

        // Reset form and reload entries
        setSelectedMood(null);
        setJournalText('');
        setSelectedTags([]);
        setShowJournalModal(false);
        await loadMoodEntries();

        // Show success message
        alert('Mood entry saved successfully!');
      } else {
        alert('Failed to save mood entry. Please try again.');
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
      alert('An error occurred while saving your mood entry.');
    } finally {
      setSaving(false);
    }
  };

  const getMoodColor = (score: number) => {
    const mood = moodLabels.find(m => m.score === score);
    return mood?.color || 'from-gray-500 to-gray-600';
  };

  const getMoodEmoji = (score: number) => {
    const mood = moodLabels.find(m => m.score === score);
    return mood?.emoji || '😐';
  };

  const getMoodLabel = (score: number) => {
    const mood = moodLabels.find(m => m.score === score);
    return mood?.label || 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood Tracker & Journal</h1>
            <p className="text-gray-600">
              Track your emotional well-being privately and securely. Your entries are completely private.
            </p>
          </div>

          {/* Mood Selection */}
          {!showJournalModal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How are you feeling today?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {moodLabels.map((mood, index) => (
                  <motion.button
                    key={mood.score}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleMoodSelect(mood.score)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      selectedMood === mood.score
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center text-4xl shadow-lg`}>
                      {mood.emoji}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{mood.score}</div>
                      <div className="text-sm font-medium text-gray-600">{mood.label}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 text-center text-sm text-gray-500">
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your mood entries are completely private and encrypted
              </div>
            </motion.div>
          )}

          {/* Journal Modal */}
          <AnimatePresence>
            {showJournalModal && selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl p-8 mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getMoodColor(selectedMood)} flex items-center justify-center text-3xl shadow-lg`}>
                      {getMoodEmoji(selectedMood)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {getMoodLabel(selectedMood)} ({selectedMood}/5)
                      </h2>
                      <p className="text-gray-600">Add your private journal entry</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowJournalModal(false);
                      setSelectedMood(null);
                      setJournalText('');
                      setSelectedTags([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowJournalModal(false);
                      setSelectedMood(null);
                      setJournalText('');
                      setSelectedTags([]);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEntry}
                    disabled={saving}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Entries */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Mood Entries</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your entries...</p>
              </div>
            ) : moodEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No mood entries yet</h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your wellness by recording your first mood entry above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {moodEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getMoodColor(entry.moodScore)} flex flex-col items-center justify-center text-white flex-shrink-0 shadow-md`}>
                        <span className="text-2xl">{getMoodEmoji(entry.moodScore)}</span>
                        <span className="text-xs font-bold">{entry.moodScore}/5</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getMoodLabel(entry.moodScore)}
                            </h3>
                            {entry.discrepancyFlag && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                                ⚠️ Discrepancy Detected
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {entry.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {entry.notes && (
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {entry.notes}
                          </p>
                        )}

                        {entry.journalStressScore !== null && entry.journalStressScore !== undefined && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Stress Analysis
                              </span>
                              <span className={`text-sm font-semibold ${
                                entry.journalStressScore >= 0.7 ? 'text-red-600' :
                                entry.journalStressScore >= 0.4 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {entry.journalStressScore >= 0.7 ? 'High' :
                                 entry.journalStressScore >= 0.4 ? 'Medium' :
                                 entry.journalStressScore > 0 ? 'Low' : 'None'}
                              </span>
                            </div>
                            {entry.stressKeywords && entry.stressKeywords.length > 0 && (
                              <div className="text-xs text-gray-600">
                                Detected indicators: {entry.stressKeywords.slice(0, 5).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
