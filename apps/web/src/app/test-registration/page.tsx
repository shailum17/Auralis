'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function TestRegistrationPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testRegistrationFlow = async () => {
    setTesting(true);
    setResults(null);

    try {
      // Test database connection
      const dbHealthResponse = await fetch('/api/health/database');
      const dbHealth = await dbHealthResponse.json();

      // Test registration flow
      const registrationResponse = await fetch('/api/test/registration-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `test_${Date.now()}@example.com` })
      });
      const registrationTest = await registrationResponse.json();

      // Test backend status
      const backendStatusResponse = await fetch('/api/debug/database-status');
      const backendStatus = await backendStatusResponse.json();

      setResults({
        databaseHealth: dbHealth,
        registrationTest: registrationTest,
        backendStatus: backendStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      setResults({
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Registration System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button
                onClick={testRegistrationFlow}
                disabled={testing}
                className="px-8 py-3"
              >
                {testing ? 'Testing...' : 'Test Registration & Database Saving'}
              </Button>
            </div>

            {results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results:</h3>
                
                {/* Database Health */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Database Connection:</h4>
                  <div className={`p-2 rounded ${
                    results.databaseHealth?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {results.databaseHealth?.success ? '✅ Connected' : '❌ Failed'}
                    <br />
                    Message: {results.databaseHealth?.data?.message || results.databaseHealth?.error}
                  </div>
                </div>

                {/* Registration Test */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Registration Flow:</h4>
                  <div className={`p-2 rounded ${
                    results.registrationTest?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {results.registrationTest?.success ? '✅ Success' : '❌ Failed'}
                    <br />
                    Method: {results.registrationTest?.data?.summary?.registrationMethod || 'Unknown'}
                    <br />
                    Saved to Database: {results.registrationTest?.data?.summary?.savedToDatabase ? '✅ Yes' : '❌ No'}
                    <br />
                    Email Verified: {results.registrationTest?.data?.summary?.emailVerified ? '✅ Yes' : '❌ No'}
                  </div>
                </div>

                {/* Backend Status */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Backend Status:</h4>
                  <div className="p-2 rounded bg-blue-100 text-blue-800">
                    Backend: {results.backendStatus?.data?.backend?.status || 'Unknown'}
                    <br />
                    Pending Users: {results.backendStatus?.data?.memory?.pendingUsers || 0}
                    <br />
                    Active OTPs: {results.backendStatus?.data?.memory?.activeOtps || 0}
                  </div>
                </div>

                {/* Raw Results */}
                <details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="font-medium cursor-pointer">Raw Test Results</summary>
                  <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>What this test does:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Tests direct database connection</li>
                <li>Simulates complete user registration</li>
                <li>Verifies data saving to MongoDB</li>
                <li>Tests email verification process</li>
                <li>Checks backend API connectivity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}