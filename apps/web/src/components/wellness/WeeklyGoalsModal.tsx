'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: 'mood' | 'sleep' | 'exercise' | 'social' | 'meditation' | 'water';
  unit: string;
}

interface WeeklyGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goals: Goal[]) => void;
  existingGoals?: Goal[];
}

const goalTemplates = [
  { name: 'Log Mood Daily', category: 'mood' as const, target: 7, unit: 'entries' },
  { name: 'Sleep 8 Hours', category: 'sleep' as const, target: 7, unit: 'nights' },
  { name: 'Exercise', category: 'exercise' as const, target: 3, unit: 'sessions' },
  { name: 'Social Connection', category: 'social' as const, target: 5, unit: 'interactions' },
  { name: 'Meditation', category: 'meditation' as const, target: 5, unit: 'sessions' },
  { name: 'Drink Water', category: 'water' as const, target: 56, unit: 'glasses' },
];

export default function WeeklyGoalsModal({ isOpen, onClose, onSave, existingGoals = [] }: WeeklyGoalsModalProps) {
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalTarget, setCustomGoalTarget] = useState('');

  useEffect(() => {
    if (existingGoals.length > 0) {
      setSelectedGoals(existingGoals);
    }
  }, [existingGoals]);

  const toggleGoal = (template: typeof goalTemplates[0]) => {
    const exists = selectedGoals.find(g => g.name === template.name);
    if (exists) {
      setSelectedGoals(selectedGoals.filter(g => g.name !== template.name));
    } else {
      setSelectedGoals([
        ...selectedGoals,
        {
          id: `goal-${Date.now()}-${Math.random()}`,
          name: template.name,
          target: template.target,
          current: 0,
          category: template.category,
          unit: template.unit,
        },
      ]);
    }
  };

  const updateGoalTarget = (goalName: string, newTarget: number) => {
    setSelectedGoals(
      selectedGoals.map(g =>
        g.name === goalName ? { ...g, target: newTarget } : g
      )
    );
  };

  const addCustomGoal = () => {
    if (customGoalName.trim() && customGoalTarget) {
      const target = parseInt(customGoalTarget);
      if (target > 0) {
        setSelectedGoals([
          ...selectedGoals,
          {
            id: `custom-${Date.now()}`,
            name: customGoalName.trim(),
            target,
            current: 0,
            category: 'mood',
            unit: 'times',
          },
        ]);
        setCustomGoalName('');
        setCustomGoalTarget('');
      }
    }
  };

  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Please log in to save goals');
        return;
      }

      // Save to backend
      const response = await fetch('/api/v1/wellness/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ goals: selectedGoals }),
      });

      if (response.ok) {
        onSave(selectedGoals);
        onClose();
      } else {
        alert('Failed to save goals. Please try again.');
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      alert('Failed to save goals. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Set Weekly Goals</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Choose goals to track your wellness progress this week
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Goal Templates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggested Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalTemplates.map((template) => {
                  const isSelected = selectedGoals.some(g => g.name === template.name);
                  const selectedGoal = selectedGoals.find(g => g.name === template.name);

                  return (
                    <div
                      key={template.name}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGoal(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          {isSelected && selectedGoal && (
                            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                              <label className="text-xs text-gray-600 block mb-1">
                                Target per week:
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={selectedGoal.target}
                                onChange={(e) => updateGoalTarget(template.name, parseInt(e.target.value) || 1)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <span className="text-xs text-gray-600 ml-2">{template.unit}</span>
                            </div>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Goal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add Custom Goal</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Goal name"
                  value={customGoalName}
                  onChange={(e) => setCustomGoalName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Target"
                  min="1"
                  value={customGoalTarget}
                  onChange={(e) => setCustomGoalTarget(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addCustomGoal}
                  disabled={!customGoalName.trim() || !customGoalTarget}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Goals Summary */}
            {selectedGoals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Your Goals ({selectedGoals.length})
                </h3>
                <div className="space-y-2">
                  {selectedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900">{goal.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          {goal.target} {goal.unit}/week
                        </span>
                        <button
                          onClick={() => setSelectedGoals(selectedGoals.filter(g => g.id !== goal.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={selectedGoals.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Goals
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
