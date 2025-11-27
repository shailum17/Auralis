// SVG Mood Avatars Component
export const MoodAvatars = {
  Happy: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#4ADE80" />
      <circle cx="22" cy="26" r="3" fill="#1F2937" />
      <circle cx="42" cy="26" r="3" fill="#1F2937" />
      <path d="M 20 38 Q 32 48 44 38" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Calm: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#60A5FA" />
      <circle cx="22" cy="28" r="2.5" fill="#1F2937" />
      <circle cx="42" cy="28" r="2.5" fill="#1F2937" />
      <path d="M 22 40 L 42 40" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  
  Content: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#34D399" />
      <circle cx="22" cy="27" r="3" fill="#1F2937" />
      <circle cx="42" cy="27" r="3" fill="#1F2937" />
      <path d="M 22 39 Q 32 44 42 39" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Neutral: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#94A3B8" />
      <circle cx="22" cy="28" r="3" fill="#1F2937" />
      <circle cx="42" cy="28" r="3" fill="#1F2937" />
      <path d="M 22 40 L 42 40" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  
  Stressed: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#EF4444" />
      <path d="M 18 24 L 26 28" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 26 24 L 18 28" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 38 24 L 46 28" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 46 24 L 38 28" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 22 44 Q 32 38 42 44" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Sad: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#64748B" />
      <circle cx="22" cy="26" r="3" fill="#1F2937" />
      <circle cx="42" cy="26" r="3" fill="#1F2937" />
      <path d="M 22 44 Q 32 38 42 44" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 20 24 Q 20 20 22 20" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Tired: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#A78BFA" />
      <path d="M 18 26 L 26 26" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 38 26 L 46 26" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 24 40 Q 32 36 40 40" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Excited: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#FBBF24" />
      <circle cx="22" cy="26" r="4" fill="#1F2937" />
      <circle cx="42" cy="26" r="4" fill="#1F2937" />
      <circle cx="22" cy="26" r="2" fill="#FFFFFF" />
      <circle cx="42" cy="26" r="2" fill="#FFFFFF" />
      <ellipse cx="32" cy="40" rx="8" ry="10" fill="#1F2937" />
      <path d="M 28 16 L 32 10 L 36 16" stroke="#FBBF24" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  Worried: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#F59E0B" />
      <path d="M 18 22 Q 22 20 26 22" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 38 22 Q 42 20 46 22" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="28" r="3" fill="#1F2937" />
      <circle cx="42" cy="28" r="3" fill="#1F2937" />
      <path d="M 24 42 Q 32 38 40 42" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Angry: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#DC2626" />
      <path d="M 18 22 L 26 26" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <path d="M 46 22 L 38 26" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <circle cx="22" cy="28" r="3" fill="#1F2937" />
      <circle cx="42" cy="28" r="3" fill="#1F2937" />
      <path d="M 22 44 L 42 44" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  
  Loved: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#EC4899" />
      <path d="M 18 26 Q 18 22 22 22 Q 24 22 24 24 Q 24 22 26 22 Q 30 22 30 26 L 24 32 Z" fill="#EF4444" />
      <path d="M 34 26 Q 34 22 38 22 Q 40 22 40 24 Q 40 22 42 22 Q 46 22 46 26 L 40 32 Z" fill="#EF4444" />
      <path d="M 20 38 Q 32 48 44 38" stroke="#1F2937" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  
  Down: () => (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="30" fill="#6B7280" />
      <path d="M 18 24 Q 22 22 26 24" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 38 24 Q 42 22 46 24" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="28" r="2.5" fill="#1F2937" />
      <circle cx="42" cy="28" r="2.5" fill="#1F2937" />
      <path d="M 24 44 Q 32 40 40 44" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

// Helper function to get mood avatar by name
export const getMoodAvatar = (moodType: string) => {
  const lowerMood = moodType.toLowerCase();
  
  if (lowerMood.includes('happy') || lowerMood.includes('joyful')) return MoodAvatars.Happy;
  if (lowerMood.includes('calm') || lowerMood.includes('peaceful') || lowerMood.includes('relaxed')) return MoodAvatars.Calm;
  if (lowerMood.includes('content') || lowerMood.includes('satisfied')) return MoodAvatars.Content;
  if (lowerMood.includes('excited') || lowerMood.includes('energetic')) return MoodAvatars.Excited;
  if (lowerMood.includes('stress') || lowerMood.includes('anxious') || lowerMood.includes('overwhelmed')) return MoodAvatars.Stressed;
  if (lowerMood.includes('sad') || lowerMood.includes('lonely')) return MoodAvatars.Sad;
  if (lowerMood.includes('tired') || lowerMood.includes('exhausted')) return MoodAvatars.Tired;
  if (lowerMood.includes('worried') || lowerMood.includes('nervous')) return MoodAvatars.Worried;
  if (lowerMood.includes('angry') || lowerMood.includes('frustrated')) return MoodAvatars.Angry;
  if (lowerMood.includes('loved') || lowerMood.includes('grateful')) return MoodAvatars.Loved;
  if (lowerMood.includes('down') || lowerMood.includes('depressed')) return MoodAvatars.Down;
  
  return MoodAvatars.Neutral;
};

// Metric icons as SVG
export const MetricIcons = {
  Mood: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
    </svg>
  ),
  
  Stress: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  Sleep: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  Social: () => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" strokeWidth="2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
