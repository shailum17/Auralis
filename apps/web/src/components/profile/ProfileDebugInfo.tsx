'use client';

import { getProfileCompletionStatus, formatUserData } from '@/lib/profile-utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function ProfileDebugInfo() {
  // Mock user since auth is removed
  const user = {
    id: 'mock-user-id',
    email: 'guest@example.com',
    username: 'guest',
    fullName: 'Guest User',
    bio: 'This is a mock user profile',
    interests: ['Technology', 'Learning'],
    academicInfo: {
      institution: 'Mock University',
      major: 'Computer Science'
    },
    privacySettings: {
      allowDirectMessages: true,
      showOnlineStatus: true
    },
    wellnessSettings: {
      trackMood: false,
      trackStress: false
    }
  };

  if (!user) {
    return (
      <Card className="mb-4 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Debug: No User Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">No user is currently logged in.</p>
        </CardContent>
      </Card>
    );
  }

  const status = getProfileCompletionStatus(user);
  const userData = formatUserData(user);

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Debug: Profile Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">Completion Status:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete: {status.isComplete ? 'Yes' : 'No'}</li>
            <li>• Percentage: {status.completionPercentage}%</li>
            <li>• Missing: {status.missingFields.join(', ') || 'None'}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-blue-900 mb-2">Sections:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Personal: {status.sections.personal ? '✅' : '❌'} (Has fullName: {user.fullName ? 'Yes' : 'No'})</li>
            <li>• Academic: {status.sections.academic ? '✅' : '❌'} (Has institution/major: {user.academicInfo?.institution || user.academicInfo?.major ? 'Yes' : 'No'})</li>
            <li>• Interests: {status.sections.interests ? '✅' : '❌'} (Count: {user.interests?.length || 0})</li>
            <li>• Privacy: {status.sections.privacy ? '✅' : '❌'} (Has settings: {user.privacySettings ? 'Yes' : 'No'})</li>
            <li>• Wellness: {status.sections.wellness ? '✅' : '❌'} (Has settings: {user.wellnessSettings ? 'Yes' : 'No'})</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-blue-900 mb-2">User Data:</h4>
          <pre className="text-xs text-blue-800 bg-blue-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify({
              id: user.id,
              email: user.email,
              username: user.username,
              fullName: user.fullName,
              bio: user.bio,
              interests: user.interests,
              academicInfo: user.academicInfo,
              privacySettings: user.privacySettings,
              wellnessSettings: user.wellnessSettings,
            }, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}