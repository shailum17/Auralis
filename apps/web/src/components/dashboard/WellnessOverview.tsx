'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MoodTrackerModal from '@/components/wellness/MoodTrackerModal';
import StressTrackerModal from '@/components/wellness/StressTrackerModal';

interface WellnessMetric {
  name: string;
  value: number;
  change: string;
  color: string;
}

interface MoodEntry {
  date: string;
  mood: number;
  note: string;
}

interface WellnessData {
  overallScore: number;
  trend: string;
  metrics: WellnessMetric[];
  recentEntries: MoodEntry[];
}

export default function WellnessOverview() {
  // Use actual auth context
  const { user } = useAuth();
  const router = useRouter();
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    overallScore: 0,
    trend: '+0.0',
    metrics: [
      { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
      { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
    ],
    recentEntries: []
  });
  const [loading, setLoading] = useState(true);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showStressModal, setShowStressModal] = useState(false);
  const [quickMood, setQuickMood] = useState<number | undefined>(undefined);

  // Load user-specific wellness data
  const loadWellnessData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          // No token - show empty state
          setWellnessData({
            overallScore: 0,
            trend: '+0.0',
            metrics: [
              { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
              { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
            ],
            recentEntries: []
          });
          setLoading(false);
          return;
        }

        // Fetch both mood and stress data
        const [moodResponse, stressResponse] = await Promise.all([
          fetch('/api/v1/wellness/mood/history?days=7', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          fetch('/api/v1/wellness/stress/history?days=7', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
        ]);

        if (moodResponse.ok) {
          const moodEntries = await moodResponse.json();
          
          // Transform API data to component format
          const recentEntries: MoodEntry[] = moodEntries.slice(0, 5).map((entry: any) => ({
            date: new Date(entry.createdAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            mood: entry.moodScore, // Keep 1-5 scale
            note: entry.notes || 'No notes added'
          }));

          // Calculate metrics from mood entries
          const avgMood = moodEntries.length > 0 
            ? moodEntries.reduce((sum: number, e: any) => sum + e.moodScore, 0) / moodEntries.length
            : 0;

          // Calculate trend
          const trend = moodEntries.length >= 2 
            ? calculateMoodTrend(moodEntries)
            : '+0.0';

          // Get stress data
          let avgStress = 0;
          let stressTrend = '+0.0';
          if (stressResponse.ok) {
            const stressEntries = await stressResponse.json();
            if (stressEntries.length > 0) {
              avgStress = stressEntries.reduce((sum: number, e: any) => sum + e.stressLevel, 0) / stressEntries.length;
              stressTrend = stressEntries.length >= 2 ? calculateMoodTrend(stressEntries.map((e: any) => ({ moodScore: e.stressLevel }))) : '+0.0';
            }
          }

          // Calculate overall wellness score
          // Mood contributes positively (1-5), Stress contributes negatively (inverted: 5-1)
          // Formula: (Mood + (6 - Stress)) / 2 to get average on 1-5 scale
          const invertedStress = avgStress > 0 ? (6 - avgStress) : 0; // Invert stress (5 becomes 1, 1 becomes 5)
          const overallScore = avgMood > 0 && avgStress > 0 
            ? Math.round(((avgMood + invertedStress) / 2) * 10) / 10
            : avgMood > 0 
              ? Math.round(avgMood * 10) / 10
              : 0;

          // Calculate overall trend (average of mood and stress trends)
          const overallTrend = avgMood > 0 && avgStress > 0
            ? calculateCombinedTrend(trend, stressTrend)
            : trend;

          setWellnessData({
            overallScore: overallScore || 0,
            trend: overallTrend,
            metrics: [
              { 
                name: 'Mood', 
                value: Math.round(avgMood * 10) / 10, 
                change: trend, 
                color: 'bg-green-500' 
              },
              { 
                name: 'Stress', 
                value: Math.round(avgStress * 10) / 10, 
                change: stressTrend, 
                color: 'bg-yellow-500' 
              },
            ],
            recentEntries: recentEntries
          });
        } else {
          // API failed - show empty state
          console.error('Failed to load mood history:', moodResponse.status);
          setWellnessData({
            overallScore: 0,
            trend: '+0.0',
            metrics: [
              { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
              { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
            ],
            recentEntries: []
          });
        }
      } catch (error) {
        console.error('Error loading wellness data:', error);
        // Error - show empty state
        setWellnessData({
          overallScore: 0,
          trend: '+0.0',
          metrics: [
            { name: 'Mood', value: 0, change: '+0.0', color: 'bg-green-500' },
            { name: 'Stress', value: 0, change: '+0.0', color: 'bg-yellow-500' },
          ],
          recentEntries: []
        });
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (user) {
      loadWellnessData();
    }
  }, [user]);

  // Helper function to calculate mood trend
  const calculateMoodTrend = (entries: any[]) => {
    if (entries.length < 2) return '+0.0';
    
    const firstHalf = entries.slice(0, Math.floor(entries.length / 2));
    const secondHalf = entries.slice(Math.floor(entries.length / 2));
    
    const firstAvg = firstHalf.reduce((sum: number, e: any) => sum + e.moodScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, e: any) => sum + e.moodScore, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg; // Keep on 1-5 scale
    
    return difference >= 0 ? `+${difference.toFixed(1)}` : difference.toFixed(1);
  };

  // Helper function to calculate combined trend from mood and stress
  const calculateCombinedTrend = (moodTrend: string, stressTrend: string) => {
    const moodValue = parseFloat(moodTrend);
    const stressValue = parseFloat(stressTrend);
    
    // Invert stress trend (lower stress = better, so negative stress trend is positive for wellness)
    const invertedStressTrend = -stressValue;
    
    // Average the two trends
    const combined = (moodValue + invertedStressTrend) / 2;
    
    return combined >= 0 ? `+${combined.toFixed(1)}` : combined.toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        {wellnessData.metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
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
                style={{ width: `${(metric.value / 5) * 100}%` }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Mood Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Mood Entries</h3>
          {wellnessData.recentEntries.length > 0 && (
            <button 
              onClick={() => setShowMoodModal(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add Entry
            </button>
          )}
        </div>
        {wellnessData.recentEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No mood entries yet</h4>
            <p className="text-gray-600 mb-4">Start tracking your wellness by recording your first mood entry.</p>
            <button 
              onClick={() => setShowMoodModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wellnessData.recentEntries.map((entry, index) => {
              // Get mood emoji based on score (1-5 scale)
              const getMoodEmoji = (mood: number) => {
                if (mood >= 5) return '😄';
                if (mood >= 4) return '😊';
                if (mood >= 3) return '😐';
                if (mood >= 2) return '😟';
                return '😢';
              };

              const getMoodLabel = (mood: number) => {
                if (mood >= 5) return 'Excellent';
                if (mood >= 4) return 'Good';
                if (mood >= 3) return 'Okay';
                if (mood >= 2) return 'Low';
                return 'Very Low';
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => router.push('/wellness/mood')}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-white text-xs font-medium ${
                      entry.mood >= 4.5 ? 'bg-gradient-to-br from-green-400 to-green-600' : 
                      entry.mood >= 3.5 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                      entry.mood >= 2.5 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-red-400 to-red-600'
                    }`}>
                      <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                      <span className="text-xs font-bold">{entry.mood}/5</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{getMoodLabel(entry.mood)}</p>
                      <span className="text-xs text-gray-500">•</span>
                      <p className="text-xs text-gray-500">{entry.date}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{entry.note}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Mood Entry */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
        <h4 className="text-sm font-medium text-blue-900 mb-3">How are you feeling today?</h4>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((mood) => (
            <button
              key={mood}
              onClick={() => {
                setQuickMood(mood);
                setShowMoodModal(true);
              }}
              className="py-2 rounded-lg bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center text-sm font-medium text-blue-700 transition-all hover:scale-105"
            >
              <span className="text-xl mb-1">
                {mood === 1 ? '😢' : mood === 2 ? '😟' : mood === 3 ? '😐' : mood === 4 ? '😊' : '😄'}
              </span>
              <span>{mood}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stress Check */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">Feeling stressed?</h4>
            <p className="text-xs text-yellow-700">Track your stress levels and find what helps</p>
          </div>
          <button
            onClick={() => setShowStressModal(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Track Stress</span>
          </button>
        </div>
      </div>

      {/* Mood Tracker Modal */}
      <MoodTrackerModal
        isOpen={showMoodModal}
        onClose={() => {
          setShowMoodModal(false);
          setQuickMood(undefined);
        }}
        onSave={() => {
          loadWellnessData();
        }}
        initialMood={quickMood}
      />

      {/* Stress Tracker Modal */}
      <StressTrackerModal
        isOpen={showStressModal}
        onClose={() => setShowStressModal(false)}
        onSave={() => {
          loadWellnessData();
        }}
      />
    </div>
  );
}