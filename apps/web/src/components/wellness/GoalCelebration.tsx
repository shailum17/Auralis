'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletedGoal {
  id: string;
  name: string;
  category: string;
  target: number;
  unit: string;
  completedAt: string;
}

interface GoalCelebrationProps {
  goals: CompletedGoal[];
  onClose: () => void;
}

export default function GoalCelebration({ goals, onClose }: GoalCelebrationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  if (!show || goals.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Celebration Icon */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              Congratulations!
            </motion.h2>
          </div>

          {/* Completed Goals */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                      {goal.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Completed {goal.target} {goal.unit}!
                    </p>
                  </div>
                  <div className="text-3xl ml-3">
                    ✅
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-gray-600 dark:text-gray-300 mb-6"
          >
            You've completed your weekly goal{goals.length > 1 ? 's' : ''}! 
            Keep up the amazing work! 💪
          </motion.p>

          {/* Close Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95"
          >
            Awesome! 🎊
          </motion.button>

          {/* Auto-close indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3"
          >
            Auto-closing in 5 seconds...
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
