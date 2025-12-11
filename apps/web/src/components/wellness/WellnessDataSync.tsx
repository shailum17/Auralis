'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWellnessDataSync, WellnessDataSyncStatus } from '@/hooks/useWellnessDataSync';
import { Card, CardContent, Button, Badge, Progress } from '@/components/ui';

interface WellnessDataSyncProps {
  className?: string;
  showDetails?: boolean;
  onSyncComplete?: () => void;
}

export function WellnessDataSync({ 
  className = '', 
  showDetails = false,
  onSyncComplete 
}: WellnessDataSyncProps) {
  const {
    moodEntries,
    wellnessGoals,
    wellnessStats,
    syncStatus,
    syncData,
    clearSyncErrors,
    forceSyncAll,
    getUnsyncedData
  } = useWellnessDataSync();

  const [showDetailedView, setShowDetailedView] = useState(showDetails);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncData();
      onSyncComplete?.();
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    try {
      await forceSyncAll();
      onSyncComplete?.();
    } finally {
      setIsManualSyncing(false);
    }
  };

  const unsyncedData = getUnsyncedData();
  const hasUnsyncedData = unsyncedData.moodEntries.length > 0 || unsyncedData.goals.length > 0;

  const getSyncStatusColor = (status: WellnessDataSyncStatus) => {
    if (!status.isOnline) return 'bg-gray-400';
    if (status.syncInProgress || isManualSyncing) return 'bg-yellow-400 animate-pulse';
    if (status.errors.length > 0) return 'bg-red-400';
    if (hasUnsyncedData) return 'bg-orange-400';
    return 'bg-green-400';
  };

  const getSyncStatusText = (status: WellnessDataSyncStatus) => {
    if (!status.isOnline) return 'Offline';
    if (status.syncInProgress || isManualSyncing) return 'Syncing...';
    if (status.errors.length > 0) return 'Sync Error';
    if (hasUnsyncedData) return 'Pending Changes';
    return 'Synchronized';
  };

  const getSyncStatusBadgeVariant = (status: WellnessDataSyncStatus) => {
    if (!status.isOnline) return 'secondary';
    if (status.syncInProgress || isManualSyncing) return 'warning';
    if (status.errors.length > 0) return 'error';
    if (hasUnsyncedData) return 'warning';
    return 'success';
  };

  if (!showDetailedView) {
    // Compact sync indicator
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getSyncStatusColor(syncStatus)}`}></div>
          <span className="text-sm text-gray-600">
            {getSyncStatusText(syncStatus)}
          </span>
        </div>
        
        {syncStatus.pendingChanges > 0 && (
          <Badge variant="warning" size="sm">
            {syncStatus.pendingChanges} pending
          </Badge>
        )}
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          disabled={syncStatus.syncInProgress || isManualSyncing || !syncStatus.isOnline}
          className="text-xs"
        >
          {isManualSyncing ? 'Syncing...' : 'Sync'}
        </Button>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDetailedView(true)}
          className="text-xs"
        >
          Details
        </Button>
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Data Synchronization</h3>
            <Badge 
              variant={getSyncStatusBadgeVariant(syncStatus)} 
              size="sm"
              className="flex items-center space-x-1"
            >
              <div className={`w-2 h-2 rounded-full ${getSyncStatusColor(syncStatus)}`}></div>
              <span>{getSyncStatusText(syncStatus)}</span>
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={syncStatus.syncInProgress || isManualSyncing || !syncStatus.isOnline}
            >
              {isManualSyncing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing...</span>
                </div>
              ) : (
                'Sync Now'
              )}
            </Button>
            
            {!showDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetailedView(false)}
              >
                Hide Details
              </Button>
            )}
          </div>
        </div>

        {/* Sync Progress */}
        {(syncStatus.syncInProgress || isManualSyncing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-blue-800">
                  Synchronizing wellness data...
                </span>
              </div>
              <Progress value={75} variant="primary" size="sm" />
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {syncStatus.errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">Sync Errors</h4>
                    <ul className="text-sm text-red-600 space-y-1">
                      {syncStatus.errors.map((error, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearSyncErrors}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {moodEntries.length}
                </div>
                <div className="text-sm text-green-700">Mood Entries</div>
              </div>
              <div className="text-green-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            {unsyncedData.moodEntries.length > 0 && (
              <div className="mt-2 text-xs text-orange-600">
                {unsyncedData.moodEntries.length} unsynced
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {wellnessGoals.length}
                </div>
                <div className="text-sm text-blue-700">Wellness Goals</div>
              </div>
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            {unsyncedData.goals.length > 0 && (
              <div className="mt-2 text-xs text-orange-600">
                {unsyncedData.goals.length} unsynced
              </div>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {wellnessStats?.overallScore.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-purple-700">Wellness Score</div>
              </div>
              <div className="text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            {wellnessStats && (
              <div className="mt-2 text-xs text-purple-600">
                Updated {wellnessStats.lastCalculated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Sync Status Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Sync Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <span className={`font-medium ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Sync:</span>
                <span className="font-medium text-gray-900">
                  {syncStatus.lastSync 
                    ? syncStatus.lastSync.toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Changes:</span>
                <span className={`font-medium ${syncStatus.pendingChanges > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {syncStatus.pendingChanges}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sync Status:</span>
                <span className={`font-medium ${
                  syncStatus.syncInProgress ? 'text-blue-600' : 
                  syncStatus.errors.length > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {syncStatus.syncInProgress ? 'In Progress' : 
                   syncStatus.errors.length > 0 ? 'Error' : 'Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {hasUnsyncedData && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-orange-800">Unsynced Changes Detected</h4>
                <p className="text-sm text-orange-600 mt-1">
                  You have {syncStatus.pendingChanges} changes that haven't been synchronized with the server.
                </p>
              </div>
              <Button
                size="sm"
                variant="warning"
                onClick={handleForceSync}
                disabled={!syncStatus.isOnline || syncStatus.syncInProgress || isManualSyncing}
              >
                Sync All Changes
              </Button>
            </div>
          </div>
        )}

        {/* Offline Notice */}
        {!syncStatus.isOnline && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75c0-1.856-.5-3.597-1.372-5.18" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800">Working Offline</h4>
                <p className="text-sm text-gray-600">
                  Your changes are being saved locally and will sync when you're back online.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WellnessDataSync;