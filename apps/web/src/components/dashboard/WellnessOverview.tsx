'use client';

import { motion } from 'framer-motion';

export default function WellnessOverview() {
  const wellnessData = {
    overallScore: 8.2,
    trend: '+0.5',
    metrics: [
      { name: 'Mood', value: 8.5, change: '+0.3', color: 'bg-green-500' },
      { name: 'Stress', value: 6.8, change: '-0.2', color: 'bg-yellow-500' },
      { name: 'Sleep', value: 7.9, change: '+0.8', color: 'bg-blue-500' },
      { name: 'Social', value: 9.1, change: '+1.2', color: 'bg-purple-500' },
    ],
    recentEntries: [
      { date: 'Today', mood: 8, note: 'Feeling good after study group session' },
      { date: 'Yesterday', mood: 7, note: 'Stressed about upcoming exam' },
      { date: '2 days ago', mood: 9, note: 'Great day with friends!' },
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Wellness Overview</h2>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600">{wellnessData.overallScore}</span>
          <div className="flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            {wellnessData.trend}
          </div>
        </div>
      </div>

      {/* Wellness Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {wellnessData.metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.name}</span>
              <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">{metric.value}</span>
              <span className={`text-xs ${
                metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metric.color}`}
                style={{ width: `${(metric.value / 10) * 100}%` }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Mood Entries */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Mood Entries</h3>
        <div className="space-y-3">
          {wellnessData.recentEntries.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  entry.mood >= 8 ? 'bg-green-500' : entry.mood >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {entry.mood}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{entry.date}</p>
                <p className="text-sm text-gray-600 truncate">{entry.note}</p>
              </div>
              <div className="flex-shrink-0">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Mood Entry */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-3">How are you feeling today?</h4>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
            <button
              key={mood}
              className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 hover:border-blue-400 flex items-center justify-center text-sm font-medium text-blue-700 transition-colors"
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}