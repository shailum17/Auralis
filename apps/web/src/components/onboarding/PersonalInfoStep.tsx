'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { User, Calendar, FileText, Users } from 'lucide-react';

interface PersonalInfoData {
  fullName: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
}

interface PersonalInfoStepProps {
  data: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string) => void;
  errors: Record<string, string>;
}

export function PersonalInfoStep({ data, onChange, errors }: PersonalInfoStepProps) {
  const genderOptions = [
    { value: '', label: 'Select gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <User className="w-8 h-8 text-primary-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Personal Information
        </h2>
        <p className="text-secondary-600">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>

      <Card variant="outlined" className="border-primary-200">
        <CardContent className="space-y-6">
          {/* Full Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Input
              label="Full Name"
              type="text"
              value={data.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              error={errors.fullName}
              required
              icon={<User size={16} />}
              iconPosition="left"
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Bio
                <span className="text-secondary-500 ml-1">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
                <textarea
                  value={data.bio}
                  onChange={(e) => onChange('bio', e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                  placeholder="Tell us about yourself, your interests, or what you're studying..."
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-sm text-error-600">{errors.bio}</p>
                )}
                <p className="text-xs text-secondary-500 ml-auto">
                  {data.bio.length}/500 characters
                </p>
              </div>
            </div>
          </motion.div>

          {/* Date of Birth and Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Birth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Input
                label="Date of Birth"
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => onChange('dateOfBirth', e.target.value)}
                error={errors.dateOfBirth}
                icon={<Calendar size={16} />}
                iconPosition="left"
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
            </motion.div>

            {/* Gender */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Gender
                  <span className="text-secondary-500 ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none z-10" />
                  <select
                    value={data.gender}
                    onChange={(e) => onChange('gender', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white appearance-none"
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.gender && (
                  <p className="text-sm text-error-600 mt-1">{errors.gender}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Privacy & Security
                </h4>
                <p className="text-sm text-blue-800">
                  Your personal information is secure and private. You can control what information is visible to others in your privacy settings.
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}