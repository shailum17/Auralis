'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Heart, BookOpen, Users, Briefcase, Activity, Palette, Code, Music, Camera, Globe, Lightbulb, Target } from 'lucide-react';

interface InterestsStepData {
  interests: string[];
  studyPreferences: string[];
  mentalHealthGoals: string[];
}

interface InterestsStepProps {
  data: InterestsStepData;
  onChange: (field: keyof InterestsStepData, values: string[]) => void;
  errors: Record<string, string>;
}

const interestCategories = [
  {
    title: 'Academic & Learning',
    icon: BookOpen,
    color: 'blue',
    options: [
      'Academic Success', 'Research', 'Study Groups', 'Tutoring',
      'Online Learning', 'Library Study', 'Note Taking', 'Test Prep'
    ]
  },
  {
    title: 'Health & Wellness',
    icon: Heart,
    color: 'green',
    options: [
      'Mental Health', 'Physical Wellness', 'Nutrition', 'Sleep Health',
      'Meditation', 'Yoga', 'Fitness', 'Mindfulness'
    ]
  },
  {
    title: 'Social & Community',
    icon: Users,
    color: 'purple',
    options: [
      'Social Connection', 'Community Service', 'Volunteering', 'Leadership',
      'Networking', 'Cultural Events', 'Student Organizations', 'Peer Support'
    ]
  },
  {
    title: 'Career & Professional',
    icon: Briefcase,
    color: 'orange',
    options: [
      'Career Development', 'Internships', 'Professional Skills', 'Entrepreneurship',
      'Job Search', 'Interview Prep', 'Resume Building', 'Industry Networking'
    ]
  },
  {
    title: 'Creative & Arts',
    icon: Palette,
    color: 'pink',
    options: [
      'Creative Arts', 'Music', 'Photography', 'Writing',
      'Design', 'Theater', 'Dance', 'Film'
    ]
  },
  {
    title: 'Technology & Innovation',
    icon: Code,
    color: 'indigo',
    options: [
      'Technology', 'Programming', 'AI/ML', 'Web Development',
      'Mobile Apps', 'Gaming', 'Cybersecurity', 'Data Science'
    ]
  }
];

const studyPreferenceOptions = [
  { id: 'group-study', label: 'Group Study', icon: Users, description: 'Collaborative learning with peers' },
  { id: 'solo-study', label: 'Solo Study', icon: BookOpen, description: 'Independent focused study time' },
  { id: 'library', label: 'Library Environment', icon: BookOpen, description: 'Quiet, structured study spaces' },
  { id: 'coffee-shops', label: 'Coffee Shops', icon: Activity, description: 'Ambient noise and casual atmosphere' },
  { id: 'online-resources', label: 'Online Resources', icon: Globe, description: 'Digital tools and platforms' },
  { id: 'flashcards', label: 'Flashcards', icon: Target, description: 'Spaced repetition and memorization' },
  { id: 'mind-maps', label: 'Mind Maps', icon: Lightbulb, description: 'Visual learning and concept mapping' },
  { id: 'practice-tests', label: 'Practice Tests', icon: Target, description: 'Assessment-based learning' },
];

const mentalHealthGoalOptions = [
  { id: 'stress-management', label: 'Stress Management', icon: Heart, description: 'Techniques for handling academic pressure' },
  { id: 'anxiety-support', label: 'Anxiety Support', icon: Heart, description: 'Coping strategies for anxiety' },
  { id: 'depression-support', label: 'Depression Support', icon: Heart, description: 'Resources for mood support' },
  { id: 'sleep-improvement', label: 'Sleep Improvement', icon: Activity, description: 'Better sleep habits and hygiene' },
  { id: 'social-skills', label: 'Social Skills', icon: Users, description: 'Building connections and communication' },
  { id: 'confidence-building', label: 'Confidence Building', icon: Target, description: 'Self-esteem and self-efficacy' },
  { id: 'time-management', label: 'Time Management', icon: Target, description: 'Productivity and organization skills' },
  { id: 'mindfulness', label: 'Mindfulness', icon: Heart, description: 'Present-moment awareness and meditation' },
];

export function InterestsStep({ data, onChange, errors }: InterestsStepProps) {
  const toggleInterest = (interest: string) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest];
    onChange('interests', newInterests);
  };

  const toggleStudyPreference = (preference: string) => {
    const newPreferences = data.studyPreferences.includes(preference)
      ? data.studyPreferences.filter(p => p !== preference)
      : [...data.studyPreferences, preference];
    onChange('studyPreferences', newPreferences);
  };

  const toggleMentalHealthGoal = (goal: string) => {
    const newGoals = data.mentalHealthGoals.includes(goal)
      ? data.mentalHealthGoals.filter(g => g !== goal)
      : [...data.mentalHealthGoals, goal];
    onChange('mentalHealthGoals', newGoals);
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-secondary-200 hover:border-blue-300 hover:bg-blue-50',
      green: isSelected ? 'border-green-500 bg-green-50 text-green-700' : 'border-secondary-200 hover:border-green-300 hover:bg-green-50',
      purple: isSelected ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-secondary-200 hover:border-purple-300 hover:bg-purple-50',
      orange: isSelected ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-secondary-200 hover:border-orange-300 hover:bg-orange-50',
      pink: isSelected ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-secondary-200 hover:border-pink-300 hover:bg-pink-50',
      indigo: isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-secondary-200 hover:border-indigo-300 hover:bg-indigo-50',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Heart className="w-8 h-8 text-primary-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Interests & Preferences
        </h2>
        <p className="text-secondary-600">
          Help us personalize your experience by selecting your interests and preferences
        </p>
      </div>

      {/* General Interests */}
      <Card variant="outlined" className="border-primary-200">
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              What are you interested in?
            </h3>
            <p className="text-sm text-secondary-600 mb-6">
              Select topics that interest you. We'll use this to recommend relevant content and connect you with like-minded peers.
            </p>
            
            <div className="space-y-6">
              {interestCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <category.icon className="w-5 h-5 text-primary-600" />
                    <h4 className="font-medium text-secondary-800">{category.title}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {category.options.map((option) => (
                      <motion.button
                        key={option}
                        type="button"
                        onClick={() => toggleInterest(option)}
                        className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 text-left ${
                          getColorClasses(category.color, data.interests.includes(option))
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {data.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 bg-primary-50 rounded-lg"
              >
                <p className="text-sm text-primary-700">
                  Selected {data.interests.length} interest{data.interests.length !== 1 ? 's' : ''}
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Preferences */}
      <Card variant="outlined" className="border-green-200">
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Study Preferences
            </h3>
            <p className="text-sm text-secondary-600 mb-6">
              How do you prefer to study? Select all that apply.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPreferenceOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => toggleStudyPreference(option.label)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    data.studyPreferences.includes(option.label)
                      ? 'border-green-500 bg-green-50'
                      : 'border-secondary-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <option.icon className={`w-5 h-5 mt-0.5 ${
                      data.studyPreferences.includes(option.label) ? 'text-green-600' : 'text-secondary-400'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        data.studyPreferences.includes(option.label) ? 'text-green-900' : 'text-secondary-900'
                      }`}>
                        {option.label}
                      </h4>
                      <p className={`text-sm ${
                        data.studyPreferences.includes(option.label) ? 'text-green-700' : 'text-secondary-600'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mental Health Goals */}
      <Card variant="outlined" className="border-purple-200">
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Wellness & Mental Health Goals
            </h3>
            <p className="text-sm text-secondary-600 mb-6">
              What areas of wellness would you like support with? This helps us provide relevant resources.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentalHealthGoalOptions.map((goal, index) => (
                <motion.button
                  key={goal.id}
                  type="button"
                  onClick={() => toggleMentalHealthGoal(goal.label)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    data.mentalHealthGoals.includes(goal.label)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-secondary-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <goal.icon className={`w-5 h-5 mt-0.5 ${
                      data.mentalHealthGoals.includes(goal.label) ? 'text-purple-600' : 'text-secondary-400'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        data.mentalHealthGoals.includes(goal.label) ? 'text-purple-900' : 'text-secondary-900'
                      }`}>
                        {goal.label}
                      </h4>
                      <p className={`text-sm ${
                        data.mentalHealthGoals.includes(goal.label) ? 'text-purple-700' : 'text-secondary-600'
                      }`}>
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      <AnimatePresence>
        {(data.interests.length > 0 || data.studyPreferences.length > 0 || data.mentalHealthGoals.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-6"
          >
            <h4 className="font-medium text-primary-900 mb-3">Your Selections</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-primary-800 mb-1">Interests</p>
                <p className="text-primary-700">{data.interests.length} selected</p>
              </div>
              <div>
                <p className="font-medium text-green-800 mb-1">Study Preferences</p>
                <p className="text-green-700">{data.studyPreferences.length} selected</p>
              </div>
              <div>
                <p className="font-medium text-purple-800 mb-1">Wellness Goals</p>
                <p className="text-purple-700">{data.mentalHealthGoals.length} selected</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}