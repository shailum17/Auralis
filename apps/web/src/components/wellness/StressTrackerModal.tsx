'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface StressTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function StressTrackerModal({ isOpen, onClose, onSave }: StressTrackerModalProps) {
  const { user } = useAuth();
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCoping, setSelectedCoping] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const stressLevels = [
    { level: 1, label: 'Minimal', emoji: '😌', color: 'from-green-400 to-green-600', description: 'Feeling calm and relaxed' },
    { level: 2, label: 'Mild', emoji: '🙂', color: 'from-blue-400 to-blue-600', description: 'Slightly stressed but manageable' },
    { level: 3, label: 'Moderate', emoji: '😐', color: 'from-yellow-400 to-yellow-600', description: 'Noticeably stressed' },
    { level: 4, label: 'High', emoji: '😰', color: 'from-orange-400 to-orange-600', description: 'Very stressed, hard to focus' },
    { level: 5, label: 'Overwhelming', emoji: '😫', color: 'from-red-400 to-red-600', description: 'Extremely stressed, need help' },
  ];

  const triggers = [
    'Work/School Deadlines', 'Exams', 'Financial Concerns', 'Relationships',
    'Health Issues', 'Family Problems', 'Social Situations', 'Future Uncertainty',
    'Time Pressure', 'Conflict', 'Responsibilities', 'Change/Transition'
  ];

  const symptoms = [
    'Headache', 'Muscle Tension', 'Fatigue', 'Difficulty Sleeping',
    'Anxiety', 'Irritability', 'Racing Thoughts', 'Difficulty Concentrating',
    'Stomach Issues', 'Rapid Heartbeat', 'Sweating', 'Restlessness'
  ];

  const copingStrategies = [
    'Deep Breathing', 'Exercise', 'Meditation', 'Talking to Someone',
    'Journaling', 'Music', 'Nature Walk', 'Taking a Break',
    'Healthy Eating', 'Sleep', 'Hobby/Creative Activity', 'Professional Help'
  ];

  const handleToggle = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    if (!stressLevel || !user) return;

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Please log in to save your stress entry');
        return;
      }

      const response = await fetch('/api/v1/wellness/stress', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stressLevel,
          triggers: selectedTriggers,
          symptoms: selectedSymptoms,
          copingUsed: selectedCoping,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        // Reset form
        setStressLevel(null);
        setSelectedTriggers([]);
        setSelectedSymptoms([]);
        setSelectedCoping([]);
        setNotes('');
        
        if (onSave) onSave();
        onClose();
        
        alert('Stress entry saved successfully!');
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to save stress entry:', errorData);
        alert('Failed to save stress entry. Please try again.');
      }
    } catch (error) {
      console.error('Error saving stress entry:', error);
      alert('An error occurred while saving your stress entry.');
    } finally {
      setSaving(false);
    }
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
          className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-900">Track Your Stress</h2>
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
          <div className="p-6 space-y-6">
            {/* Stress Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How stressed are you feeling right now?
              </label>
              <div className="grid grid-cols-5 gap-3">
                {stressLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setStressLevel(level.level)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      stressLevel === level.level
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl shadow-md`}>
                      {level.emoji}
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{level.level}</div>
                      <div className="text-xs font-medium text-gray-600">{level.label}</div>
                    </div>
                  </button>
                ))}
              </div>
              {stressLevel && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {stressLevels.find(l => l.level === stressLevel)?.description}
                </p>
              )}
            </div>

            {/* Triggers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's causing your stress? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {triggers.map(trigger => (
                  <button
                    key={trigger}
                    onClick={() => handleToggle(trigger, selectedTriggers, setSelectedTriggers)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTriggers.includes(trigger)
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What symptoms are you experiencing? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {symptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => handleToggle(symptom, selectedSymptoms, setSelectedSymptoms)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Coping Strategies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What coping strategies have you tried? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {copingStrategies.map(coping => (
                  <button
                    key={coping}
                    onClick={() => handleToggle(coping, selectedCoping, setSelectedCoping)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCoping.includes(coping)
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {coping}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Additional notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional thoughts or context..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private & encrypted
                </div>
                <div>{notes.length} characters</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!stressLevel || saving}
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
