'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { GraduationCap, School, BookOpen, Award } from 'lucide-react';

interface AcademicInfoData {
  institution: string;
  major: string;
  year: string;
  gpa: string;
}

interface AcademicInfoStepProps {
  data: AcademicInfoData;
  onChange: (field: keyof AcademicInfoData, value: string) => void;
  errors: Record<string, string>;
}

export function AcademicInfoStep({ data, onChange, errors }: AcademicInfoStepProps) {
  const yearOptions = [
    { value: '', label: 'Select academic year' },
    { value: 'freshman', label: 'Freshman (1st Year)' },
    { value: 'sophomore', label: 'Sophomore (2nd Year)' },
    { value: 'junior', label: 'Junior (3rd Year)' },
    { value: 'senior', label: 'Senior (4th Year)' },
    { value: 'graduate', label: 'Graduate Student' },
    { value: 'phd', label: 'PhD Student' },
    { value: 'postdoc', label: 'Postdoctoral' },
    { value: 'other', label: 'Other' },
  ];

  const popularMajors = [
    'Computer Science', 'Psychology', 'Business Administration', 'Biology',
    'Engineering', 'English', 'Mathematics', 'Pre-Med', 'Economics',
    'Political Science', 'Communications', 'Art', 'History', 'Chemistry'
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
          <GraduationCap className="w-8 h-8 text-primary-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Academic Background
        </h2>
        <p className="text-secondary-600">
          Help us understand your academic journey and goals
        </p>
      </div>

      <Card variant="outlined" className="border-primary-200">
        <CardContent className="space-y-6">
          {/* Institution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Input
              label="University/College"
              type="text"
              value={data.institution}
              onChange={(e) => onChange('institution', e.target.value)}
              placeholder="e.g., University of California, Berkeley"
              error={errors.institution}
              icon={<School size={16} />}
              iconPosition="left"
              helperText="Enter the full name of your educational institution"
            />
          </motion.div>

          {/* Major */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div>
              <Input
                label="Major/Field of Study"
                type="text"
                value={data.major}
                onChange={(e) => onChange('major', e.target.value)}
                placeholder="e.g., Computer Science"
                error={errors.major}
                icon={<BookOpen size={16} />}
                iconPosition="left"
                helperText="Your primary area of study or intended major"
              />
              
              {/* Popular majors suggestions */}
              {data.major.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-3"
                >
                  <p className="text-xs text-secondary-600 mb-2">Popular majors:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularMajors.slice(0, 8).map((major) => (
                      <button
                        key={major}
                        type="button"
                        onClick={() => onChange('major', major)}
                        className="px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors"
                      >
                        {major}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Academic Year and GPA Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Year */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Academic Year
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none z-10" />
                  <select
                    value={data.year}
                    onChange={(e) => onChange('year', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white appearance-none"
                  >
                    {yearOptions.map((option) => (
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
                {errors.year && (
                  <p className="text-sm text-error-600 mt-1">{errors.year}</p>
                )}
              </div>
            </motion.div>

            {/* GPA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Input
                label="GPA"
                type="text"
                value={data.gpa}
                onChange={(e) => {
                  // Only allow numbers and decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = value.split('.');
                  if (parts.length > 2) return;
                  // Limit to 2 decimal places
                  if (parts[1] && parts[1].length > 2) return;
                  // Limit GPA to reasonable range (0-4.0 or 0-100 depending on scale)
                  const numValue = parseFloat(value);
                  if (numValue > 4.0 && numValue <= 100) {
                    // Assume 100-point scale, convert to 4.0 scale for display
                    onChange('gpa', value);
                  } else if (numValue <= 4.0) {
                    onChange('gpa', value);
                  } else if (value === '') {
                    onChange('gpa', '');
                  }
                }}
                placeholder="e.g., 3.5"
                error={errors.gpa}
                icon={<Award size={16} />}
                iconPosition="left"
                helperText="Optional - Enter on 4.0 scale (e.g., 3.5) or percentage"
              />
            </motion.div>
          </div>

          {/* Academic Goals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-primary-900 mb-1">
                  Academic Success
                </h4>
                <p className="text-sm text-primary-800">
                  We'll use this information to connect you with relevant study groups, resources, and academic support tailored to your field and level.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Skip Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="text-center pt-4 border-t border-secondary-200"
          >
            <p className="text-sm text-secondary-600">
              Don't worry if you're not sure about some details - you can always update this information later in your profile settings.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}