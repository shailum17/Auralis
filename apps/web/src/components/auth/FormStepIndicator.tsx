'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FormStep {
  id: string;
  title: string;
  description: string;
}

interface FormStepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  className?: string;
}

export function FormStepIndicator({ steps, currentStep, className = '' }: FormStepIndicatorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Step Numbers */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                index < currentStep
                  ? 'bg-success-500 text-white'
                  : index === currentStep
                  ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                  : 'bg-secondary-200 text-secondary-500'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: index === currentStep ? 1.1 : 1,
                backgroundColor: index < currentStep ? '#10b981' : index === currentStep ? '#2563eb' : '#e5e7eb'
              }}
              transition={{ duration: 0.3 }}
            >
              {index < currentStep ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={16} />
                </motion.div>
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            
            {/* Step Title (Hidden on mobile) */}
            <motion.span
              className={`hidden sm:block text-xs font-medium mt-2 text-center max-w-20 ${
                index <= currentStep ? 'text-secondary-700' : 'text-secondary-500'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {step.title}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <motion.div
            className="bg-primary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Progress Percentage */}
        <motion.div
          className="absolute -top-8 right-0 text-xs font-medium text-primary-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {Math.round(((currentStep + 1) / steps.length) * 100)}%
        </motion.div>
      </div>

      {/* Current Step Description */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-secondary-900 mb-1">
          {steps[currentStep]?.title}
        </h3>
        <p className="text-sm text-secondary-600">
          {steps[currentStep]?.description}
        </p>
      </motion.div>
    </div>
  );
}