'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityService, AdminReport } from '@/lib/community-service';
import { useAuth } from '@/contexts/AuthContext';

interface ReportButtonProps {
  postId: string;
  postTitle: string;
}

export default function ReportButton({ postId, postTitle }: ReportButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState<AdminReport['type']>('spam');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportTypes = [
    { value: 'spam', label: 'Spam or Advertisement', icon: '🚫' },
    { value: 'harassment', label: 'Harassment or Bullying', icon: '⚠️' },
    { value: 'inappropriate', label: 'Inappropriate Content', icon: '🔞' },
    { value: 'off-topic', label: 'Off-topic or Irrelevant', icon: '📍' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleSubmitReport = async () => {
    if (!user || !reason.trim()) return;

    setSubmitting(true);

    try {
      const report = CommunityService.createReport(
        postId,
        user.id,
        user.fullName || user.username || user.email.split('@')[0],
        reportType,
        reason.trim()
      );

      console.log('Report submitted:', report);
      
      setShowModal(false);
      setReason('');
      setReportType('spam');
      
      alert('Report submitted successfully. Our moderators will review it shortly.');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-500 hover:text-red-600 p-1 rounded transition-colors"
        title="Report this post"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">You are reporting:</p>
                    <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                      "{postTitle}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What's wrong with this post? *
                    </label>
                    <div className="space-y-2">
                      {reportTypes.map((type) => (
                        <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="reportType"
                            value={type.value}
                            checked={reportType === type.value}
                            onChange={(e) => setReportType(e.target.value as AdminReport['type'])}
                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                          <span className="text-lg">{type.icon}</span>
                          <span className="text-sm text-gray-700">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional details *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide more details about why you're reporting this post..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      maxLength={500}
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {reason.length}/500 characters
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> False reports may result in action against your account. 
                      Please only report content that violates our community guidelines.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={submitting || !reason.trim()}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}