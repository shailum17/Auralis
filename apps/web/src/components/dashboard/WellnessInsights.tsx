'use client';

import { motion } from 'framer-motion';

export default function WellnessInsights() {
  const insights = [
    {
      title: 'Stress Pattern Detected',
      description: 'Your stress levels tend to peak on Mondays. Consider scheduling lighter activities.',
      type: 'warning',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      title: 'Great Progress!',
      description: 'Your mood scores have improved by 15% this week. Keep up the good work!',
      type: 'success',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      title: 'Sleep Recommendation',
      description: 'Try to maintain consistent sleep schedule. Your mood is 20% better with 7+ hours.',
      type: 'info',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      ),
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    }
  ];

  const weeklyGoals = [
    { name: 'Daily Mood Check-in', progress: 85, target: 7 },
    { name: 'Study Group Participation', progress: 60, target: 3 },
    { name: 'Wellness Activities', progress: 40, target: 5 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Insights</h3>
      
      {/* AI Insights */}
      <div className="space-y-3 mb-6">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${insight.color}`}
          >
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs mt-1 opacity-90">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Goals */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Weekly Goals</h4>
        <div className="space-y-3">
          {weeklyGoals.map((goal, index) => (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{goal.name}</span>
                <span className="text-xs text-gray-500">{Math.round((goal.progress / 100) * goal.target)}/{goal.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`h-2 rounded-full ${
                    goal.progress >= 80 ? 'bg-green-500' : 
                    goal.progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Ready for your daily check-in?</p>
            <p className="text-xs text-blue-700">Track your mood and get personalized insights</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
            Start
          </button>
        </div>
      </div>
    </div>
  );
}