'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface SleepTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function SleepTrackerModal({ 
  isOpen, 
  onClose, 
  onSave 
}: SleepTrackerModalProps) {
  const { user } = useAuth();
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [hoursSlept, setHoursSlept] = useState<number>(7);
  const [bedTime, setBedTime] = useState<string>('');
  const [wakeTime, setWakeTime] = useState<string>('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const qualityLabels = [
    { score: 1, label: 'Very Poor', color: 'from-red-500 to-red-600' },
    { score: 2, label: 'Poor', color: 'from-orange-500 to-orange-600' },
    { score: 3, label: 'Fair', color: 'from-yellow-500 to-yellow-600' },
    { score: 4, label: 'Good', color: 'from-green-500 to-green-600' },
    { score: 5, label: 'Excellent', color: 'from-emerald-500 to-emerald-600' },
  ];

  const sleepIssues = [
    'Insomnia', 'Nightmares', 'Restless', 'Woke up frequently',
    'Difficulty falling asleep', 'Woke up too early', 'Sleep apnea', 'Snoring'
  ];

  const sleepFactors = [
    'Caffeine', 'Stress', 'Screen time', 'Exercise',
    'Alcohol', 'Late meal', 'Noise', 'Temperature',
    'Medication', 'Anxiety', 'Pain', 'Work pressure'
  ];

  useEffect(() => {
    if (isOpen) {
      setSleepQuality(3);
      setHoursSlept(7);
      setBedTime('');
      setWakeTime('');
      setSelectedIssues([]);
      setSelectedFactors([]);
      setNotes('');
    }
  }, [isOpen]);

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues(prev =>
      prev.includes(issue)
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleFactorToggle = (factor: string) => {
    setSelectedFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSaveEntry = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Please log in to save your sleep entry');
        return;
      }

      const requestData = {
        sleepQuality,
        hoursSlept,
        bedTime: bedTime || undefined,
        wakeTime: wakeTime || undefined,
        sleepIssues: selectedIssues,
        factors: selectedFactors,
        notes: notes.trim() || undefined,
      };

      const response = await fetch('/api/v1/wellness/sleep', {
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
        alert('Sleep entry saved successfully!');
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.message || 'Failed to save sleep entry');
      }
    } catch (error) {
      console.error('Error saving sleep entry:', error);
      alert('An error occurred while saving your sleep entry.');
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
            <h2 className="text-xl font-bold text-gray-900">Track Your Sleep</h2>
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
            {/* Sleep Quality */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How was your sleep quality?
              </label>
              <div className="grid grid-cols-5 gap-3">
                {qualityLabels.map((quality) => (
                  <button
                    key={quality.score}
                    onClick={() => setSleepQuality(quality.score)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      sleepQuality === quality.score
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

            {/* Hours Slept */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hours of sleep: {hoursSlept}h
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={hoursSlept}
                onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>

            {/* Bed Time & Wake Time */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bed Time <span className="text-red-600">* (Required)</span>
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wake Time <span className="text-red-600">* (Required)</span>
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sleep Issues */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Any sleep issues? (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {sleepIssues.map(issue => (
                  <button
                    key={issue}
                    onClick={() => handleIssueToggle(issue)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedIssues.includes(issue)
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>

            {/* Factors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Factors affecting sleep (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {sleepFactors.map(factor => (
                  <button
                    key={factor}
                    onClick={() => handleFactorToggle(factor)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedFactors.includes(factor)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {factor}
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
                placeholder="Any other details about your sleep..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Validation Messages */}
            {(!bedTime || !wakeTime) && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  ⚠️ Please fill in all required fields:
                </p>
                <ul className="text-sm text-orange-700 mt-2 space-y-1">
                  {!bedTime && <li>• Bed time is required</li>}
                  {!wakeTime && <li>• Wake time is required</li>}
                </ul>
              </div>
            )}

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
                disabled={saving || !sleepQuality || !hoursSlept || !bedTime || !wakeTime}
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
