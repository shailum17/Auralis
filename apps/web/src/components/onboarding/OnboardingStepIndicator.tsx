'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
}

interface OnboardingStepIndicatorProps {
  steps: OnboardingStep[];
  currentStep: number;
  completedSteps: Set<number>;
  className?: string;
}

export function OnboardingStepIndicator({ 
  steps, 
  currentStep, 
  completedSteps, 
  className = '' 
}: OnboardingStepIndicatorProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-secondary-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-secondary-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-secondary-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-primary-600 to-primary-700 h-3 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            {/* Step Circle */}
            <motion.div
              className={`relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold transition-all duration-300 ${
                completedSteps.has(index)
                  ? 'bg-success-500 text-white shadow-lg'
                  : index === currentStep
                  ? 'bg-primary-600 text-white ring-4 ring-primary-200 shadow-lg'
                  : 'bg-secondary-200 text-secondary-500'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: index === currentStep ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {completedSteps.has(index) ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <Check size={18} />
                </motion.div>
              ) : (
                <span>{index + 1}</span>
              )}
              
              {/* Required indicator */}
              {step.isRequired && !completedSteps.has(index) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full border-2 border-white" />
              )}
            </motion.div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="hidden sm:block absolute top-6 left-1/2 w-full h-0.5 bg-secondary-200 -z-10">
                <motion.div
                  className="h-full bg-primary-600"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: completedSteps.has(index) ? '100%' : index < currentStep ? '100%' : '0%' 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
            
            {/* Step Title */}
            <motion.div
              className="text-center mt-3 max-w-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <span
                className={`text-xs font-medium block ${
                  completedSteps.has(index) || index === currentStep 
                    ? 'text-secondary-700' 
                    : 'text-secondary-500'
                }`}
              >
                {step.title}
              </span>
              {step.isRequired && (
                <span className="text-xs text-warning-600 block mt-1">
                  Required
                </span>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Current Step Description */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center bg-primary-50 rounded-lg p-4"
      >
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          {steps[currentStep]?.title}
        </h3>
        <p className="text-sm text-primary-700">
          {steps[currentStep]?.description}
        </p>
      </motion.div>
    </div>
  );
}