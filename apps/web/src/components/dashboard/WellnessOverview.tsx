'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MoodTrackerModal from '@/components/wellness/MoodTrackerModal';
import StressTrackerModal from '@/components/wellness/StressTrackerModal';
import SleepTrackerModal from '@/components/wellness/SleepTrackerModal';
import SocialTrackerModal from '@/components/wellness/SocialTrackerModal';
import { getMoodAvatar, MetricIcons } from '@/components/wellness/MoodAvatars';

interface WellnessMetric {
  name: string;
  value: number;
  change: string;
  color: string;
  icon: string;
}

interface WellnessEntry {
  date: string;
  type: 'mood' | 'stress' | 'sleep' | 'social';
  value: number;
  label: string;
  note: string;
  icon?: string;
}

interface WellnessData {
  overallScore: number;
  trend: string;
  metrics: WellnessMetric[];
  recentEntries: WellnessEntry[];
  moodDistribution: { [key: string]: number };
}

export default function WellnessOverview() {
  // Use actual auth context
  const { user } = useAuth();
  const router = useRouter();
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    overallScore: 0,
    trend: '+0.0',
    metrics: [
      { name: 'Average Mood', value: 0, change: '+0.0', color: 'bg-green-500', icon: 'mood' },
      { name: 'Stress Level', value: 0, change: '+0.0', color: 'bg-yellow-500', icon: 'stress' },
      { name: 'Sleep Quality', value: 0, change: '+0.0', color: 'bg-blue-500', icon: 'sleep' },
      { name: 'Social Connection', value: 0, change: '+0.0', color: 'bg-purple-500', icon: 'social' },
    ],
    recentEntries: [],
    moodDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showStressModal, setShowStressModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
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
              { name: 'Average Mood', value: 0, change: '+0.0', color: 'bg-green-500', icon: 'mood' },
              { name: 'Stress Level', value: 0, change: '+0.0', color: 'bg-yellow-500', icon: 'stress' },
              { name: 'Sleep Quality', value: 0, change: '+0.0', color: 'bg-blue-500', icon: 'sleep' },
              { name: 'Social Connection', value: 0, change: '+0.0', color: 'bg-purple-500', icon: 'social' },
            ],
            recentEntries: [],
            moodDistribution: {}
          });
          setLoading(false);
          return;
        }

        // Fetch all wellness data
        const [moodResponse, stressResponse, sleepResponse, socialResponse] = await Promise.all([
          fetch('/api/v1/wellness/mood/history?days=7', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          fetch('/api/v1/wellness/stress/history?days=7', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          fetch('/api/v1/wellness/sleep/history?days=7', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
          fetch('/api/v1/wellness/social/history?days=7', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }),
        ]);

        // Parse all responses
        const moodEntries = moodResponse.ok ? await moodResponse.json() : [];
        const stressEntries = stressResponse.ok ? await stressResponse.json() : [];
        const sleepEntries = sleepResponse.ok ? await sleepResponse.json() : [];
        const socialEntries = socialResponse.ok ? await socialResponse.json() : [];

        if (moodResponse.ok || stressResponse.ok || sleepResponse.ok || socialResponse.ok) {
          // Calculate wellness patterns from all sources
          const wellnessDistribution: { [key: string]: number } = {};
          
          // Add mood tags
          moodEntries.forEach((entry: any) => {
            const tags = entry.tags || [];
            tags.forEach((tag: string) => {
              wellnessDistribution[tag] = (wellnessDistribution[tag] || 0) + 1;
            });
          });
          
          // Combine all entries from different sources
          const allEntries: WellnessEntry[] = [];
          
          // Add mood entries
          moodEntries.forEach((entry: any) => {
            const tags = entry.tags || [];
            const primaryMood = tags.length > 0 ? tags[0] : 'Neutral';
            allEntries.push({
              date: new Date(entry.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'mood',
              value: entry.moodScore,
              label: primaryMood,
              note: entry.notes || 'No notes added'
            });
          });
          
          // Add stress entries
          stressEntries.forEach((entry: any) => {
            const triggers = entry.triggers || [];
            const primaryTrigger = triggers.length > 0 ? triggers[0] : 'General stress';
            allEntries.push({
              date: new Date(entry.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'stress',
              value: entry.stressLevel,
              label: `Stress: ${primaryTrigger}`,
              note: entry.notes || `Stress level ${entry.stressLevel}/5`
            });
            
            // Add stress triggers to patterns
            triggers.forEach((trigger: string) => {
              wellnessDistribution[trigger] = (wellnessDistribution[trigger] || 0) + 1;
            });
          });
          
          // Add sleep entries
          sleepEntries.forEach((entry: any) => {
            allEntries.push({
              date: new Date(entry.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'sleep',
              value: entry.sleepQuality,
              label: `Sleep: ${entry.hoursSlept}h`,
              note: `Quality ${entry.sleepQuality}/5, ${entry.hoursSlept} hours`
            });
            
            // Add sleep issues to patterns
            const issues = entry.sleepIssues || [];
            issues.forEach((issue: string) => {
              wellnessDistribution[issue] = (wellnessDistribution[issue] || 0) + 1;
            });
          });
          
          // Add social entries
          socialEntries.forEach((entry: any) => {
            const feelings = entry.feelings || [];
            const primaryFeeling = feelings.length > 0 ? feelings[0] : 'Neutral';
            allEntries.push({
              date: new Date(entry.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              type: 'social',
              value: entry.connectionQuality,
              label: `Social: ${primaryFeeling}`,
              note: `Connection quality ${entry.connectionQuality}/5`
            });
            
            // Add feelings to patterns
            feelings.forEach((feeling: string) => {
              wellnessDistribution[feeling] = (wellnessDistribution[feeling] || 0) + 1;
            });
          });
          
          // Sort all entries by date (most recent first)
          allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Take top 10 most recent entries
          const recentEntries = allEntries.slice(0, 10);

          // Calculate metrics from mood entries
          const avgMood = moodEntries.length > 0 
            ? moodEntries.reduce((sum: number, e: any) => sum + e.moodScore, 0) / moodEntries.length
            : 0;

          // Calculate trend
          const trend = moodEntries.length >= 2 
            ? calculateMoodTrend(moodEntries)
            : '+0.0';

          // Calculate stress metrics
          let avgStress = 0;
          let stressTrend = '+0.0';
          if (stressEntries.length > 0) {
            avgStress = stressEntries.reduce((sum: number, e: any) => sum + e.stressLevel, 0) / stressEntries.length;
            stressTrend = stressEntries.length >= 2 ? calculateMoodTrend(stressEntries.map((e: any) => ({ moodScore: e.stressLevel }))) : '+0.0';
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

          // Calculate sleep metrics
          let avgSleep = 0;
          let sleepTrend = '+0.0';
          if (sleepEntries.length > 0) {
            avgSleep = sleepEntries.reduce((sum: number, e: any) => sum + e.sleepQuality, 0) / sleepEntries.length;
            sleepTrend = sleepEntries.length >= 2 ? calculateMoodTrend(sleepEntries.map((e: any) => ({ moodScore: e.sleepQuality }))) : '+0.0';
          }
          
          // Calculate social connection metrics
          let avgSocial = 0;
          let socialTrend = '+0.0';
          if (socialEntries.length > 0) {
            avgSocial = socialEntries.reduce((sum: number, e: any) => sum + e.connectionQuality, 0) / socialEntries.length;
            socialTrend = socialEntries.length >= 2 ? calculateMoodTrend(socialEntries.map((e: any) => ({ moodScore: e.connectionQuality }))) : '+0.0';
          }

          setWellnessData({
            overallScore: overallScore || 0,
            trend: overallTrend,
            metrics: [
              { 
                name: 'Average Mood', 
                value: Math.round(avgMood * 10) / 10, 
                change: trend, 
                color: 'bg-green-500',
                icon: 'mood'
              },
              { 
                name: 'Stress Level', 
                value: Math.round(avgStress * 10) / 10, 
                change: stressTrend, 
                color: 'bg-yellow-500',
                icon: 'stress'
              },
              { 
                name: 'Sleep Quality', 
                value: Math.round(avgSleep * 10) / 10, 
                change: sleepTrend, 
                color: 'bg-blue-500',
                icon: 'sleep'
              },
              { 
                name: 'Social Connection', 
                value: Math.round(avgSocial * 10) / 10, 
                change: socialTrend, 
                color: 'bg-purple-500',
                icon: 'social'
              },
            ],
            recentEntries: recentEntries,
            moodDistribution: wellnessDistribution
          });
        } else {
          // API failed - show empty state
          console.error('Failed to load mood history:', moodResponse.status);
          setWellnessData({
            overallScore: 0,
            trend: '+0.0',
            metrics: [
              { name: 'Average Mood', value: 0, change: '+0.0', color: 'bg-green-500', icon: 'mood' },
              { name: 'Stress Level', value: 0, change: '+0.0', color: 'bg-yellow-500', icon: 'stress' },
              { name: 'Sleep Quality', value: 0, change: '+0.0', color: 'bg-blue-500', icon: 'sleep' },
              { name: 'Social Connection', value: 0, change: '+0.0', color: 'bg-purple-500', icon: 'social' },
            ],
            recentEntries: [],
            moodDistribution: {}
          });
        }
      } catch (error) {
        console.error('Error loading wellness data:', error);
        // Error - show empty state
        setWellnessData({
          overallScore: 0,
          trend: '+0.0',
          metrics: [
            { name: 'Average Mood', value: 0, change: '+0.0', color: 'bg-green-500', icon: 'mood' },
            { name: 'Stress Level', value: 0, change: '+0.0', color: 'bg-yellow-500', icon: 'stress' },
            { name: 'Sleep Quality', value: 0, change: '+0.0', color: 'bg-blue-500', icon: 'sleep' },
            { name: 'Social Connection', value: 0, change: '+0.0', color: 'bg-purple-500', icon: 'social' },
          ],
          recentEntries: [],
          moodDistribution: {}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {wellnessData.metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => {
              if (metric.name === 'Average Mood') setShowMoodModal(true);
              else if (metric.name === 'Stress Level') setShowStressModal(true);
              else if (metric.name === 'Sleep Quality') setShowSleepModal(true);
              else if (metric.name === 'Social Connection') setShowSocialModal(true);
            }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">{metric.name}</span>
              <div className="w-6 h-6 text-gray-600">
                {metric.icon === 'mood' && <MetricIcons.Mood />}
                {metric.icon === 'stress' && <MetricIcons.Stress />}
                {metric.icon === 'sleep' && <MetricIcons.Sleep />}
                {metric.icon === 'social' && <MetricIcons.Social />}
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className="text-sm text-gray-500">/5</span>
              <span className={`text-xs font-medium ${
                metric.change.startsWith('+') && parseFloat(metric.change) > 0 ? 'text-green-600' : 
                metric.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${metric.color} transition-all duration-500`}
                style={{ width: `${Math.min((metric.value / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Wellness Patterns */}
      {Object.keys(wellnessData.moodDistribution).length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Wellness Patterns</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(wellnessData.moodDistribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([mood, count]) => {
                const getMoodColor = (moodType: string) => {
                  const lowerMood = moodType.toLowerCase();
                  if (lowerMood.includes('happy') || lowerMood.includes('joyful') || lowerMood.includes('excited')) return 'bg-green-100 text-green-700 border-green-200';
                  if (lowerMood.includes('calm') || lowerMood.includes('peaceful') || lowerMood.includes('relaxed')) return 'bg-blue-100 text-blue-700 border-blue-200';
                  if (lowerMood.includes('stress') || lowerMood.includes('anxious') || lowerMood.includes('worried')) return 'bg-red-100 text-red-700 border-red-200';
                  if (lowerMood.includes('sad') || lowerMood.includes('down') || lowerMood.includes('lonely')) return 'bg-gray-100 text-gray-700 border-gray-200';
                  if (lowerMood.includes('energetic') || lowerMood.includes('motivated')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                  return 'bg-purple-100 text-purple-700 border-purple-200';
                };
                
                return (
                  <div
                    key={mood}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getMoodColor(mood)} flex items-center space-x-1`}
                  >
                    <span>{mood}</span>
                    <span className="font-bold">×{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
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
            <h4 className="text-lg font-medium text-gray-900 mb-2">No wellness entries yet</h4>
            <p className="text-gray-600 mb-4">Start tracking your wellness by recording your first entry.</p>
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
              // Get appropriate icon/avatar based on entry type
              const getEntryIcon = () => {
                if (entry.type === 'mood') {
                  const MoodAvatar = getMoodAvatar(entry.label);
                  return (
                    <div className="w-14 h-14 rounded-full shadow-md overflow-hidden relative">
                      <MoodAvatar />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-0.5">
                        {entry.value}/5
                      </div>
                    </div>
                  );
                }
                
                // For other types, show colored circle with SVG icon
                const colors = {
                  stress: 'from-red-400 to-red-600',
                  sleep: 'from-blue-400 to-blue-600',
                  social: 'from-purple-400 to-purple-600'
                };
                
                const icons = {
                  stress: <MetricIcons.Stress />,
                  sleep: <MetricIcons.Sleep />,
                  social: <MetricIcons.Social />
                };
                
                return (
                  <div className={`w-14 h-14 rounded-full shadow-md bg-gradient-to-br ${colors[entry.type]} flex flex-col items-center justify-center text-white p-2`}>
                    <div className="w-6 h-6 mb-0.5">
                      {icons[entry.type]}
                    </div>
                    <span className="text-[10px] font-bold">{entry.value}/5</span>
                  </div>
                );
              };
              
              const getTypeColor = () => {
                const colors = {
                  mood: 'text-green-600',
                  stress: 'text-red-600',
                  sleep: 'text-blue-600',
                  social: 'text-purple-600'
                };
                return colors[entry.type];
              };
              
              const getTypeBadge = () => {
                const badges = {
                  mood: 'bg-green-100 text-green-700',
                  stress: 'bg-red-100 text-red-700',
                  sleep: 'bg-blue-100 text-blue-700',
                  social: 'bg-purple-100 text-purple-700'
                };
                const labels = {
                  mood: 'Mood',
                  stress: 'Stress',
                  sleep: 'Sleep',
                  social: 'Social'
                };
                return (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badges[entry.type]}`}>
                    {labels[entry.type]}
                  </span>
                );
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    const routes = {
                      mood: '/wellness/mood',
                      stress: '/wellness/stress',
                      sleep: '/wellness/sleep',
                      social: '/wellness/social'
                    };
                    router.push(routes[entry.type]);
                  }}
                >
                  <div className="flex-shrink-0">
                    {getEntryIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTypeBadge()}
                      <p className="text-sm font-semibold text-gray-900">{entry.label}</p>
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
      <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">How are you feeling today?</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { avatar: 'Happy', label: 'Happy', score: 5 },
            { avatar: 'Calm', label: 'Calm', score: 4 },
            { avatar: 'Content', label: 'Content', score: 4 },
            { avatar: 'Neutral', label: 'Neutral', score: 3 },
            { avatar: 'Stressed', label: 'Stressed', score: 2 },
            { avatar: 'Sad', label: 'Sad', score: 2 },
            { avatar: 'Tired', label: 'Tired', score: 3 },
            { avatar: 'Excited', label: 'Excited', score: 5 },
            { avatar: 'Worried', label: 'Worried', score: 2 },
            { avatar: 'Angry', label: 'Angry', score: 2 },
            { avatar: 'Loved', label: 'Loved', score: 5 },
            { avatar: 'Down', label: 'Down', score: 2 },
          ].map((mood) => {
            const MoodAvatar = getMoodAvatar(mood.avatar);
            return (
              <button
                key={mood.label}
                onClick={() => {
                  setQuickMood(mood.score);
                  setShowMoodModal(true);
                }}
                className="py-2 px-1 rounded-lg bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center text-xs font-medium text-blue-700 transition-all hover:scale-105 hover:shadow-md"
              >
                <div className="w-12 h-12 mb-1">
                  <MoodAvatar />
                </div>
                <span className="text-[10px] leading-tight">{mood.label}</span>
              </button>
            );
          })}
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

      {/* Sleep Tracker Modal */}
      <SleepTrackerModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={() => {
          loadWellnessData();
        }}
      />

      {/* Social Tracker Modal */}
      <SocialTrackerModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        onSave={() => {
          loadWellnessData();
        }}
      />
    </div>
  );
}