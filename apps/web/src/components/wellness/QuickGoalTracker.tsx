'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuickGoalTrackerProps {
  onTrack: (category: string, amount: number) => Promise<void>;
}

const quickActions = [
  { 
    category: 'exercise', 
    label: 'Exercise', 
    icon: '🏃',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700'
  },
  { 
    category: 'meditation', 
    label: 'Meditate', 
    icon: '🧘',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
  },
  { 
    category: 'water', 
    label: 'Water', 
    icon: '💧',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
  },
];

export default function QuickGoalTracker({ onTrack }: QuickGoalTrackerProps) {
  const [tracking, setTracking] = useState<string | null>(null);

  const handleTrack = async (category: string, amount: number = 1) => {
    setTracking(category);
    try {
      await onTrack(category, amount);
    } finally {
      setTracking(null);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Quick Track</h4>
      <div className="grid grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <motion.button
            key={action.category}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTrack(action.category)}
            disabled={tracking === action.category}
            className={`p-3 rounded-lg border-2 transition-all ${action.color} ${
              tracking === action.category ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <div className="text-xs font-medium">{action.label}</div>
            {tracking === action.category && (
              <div className="mt-1">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
