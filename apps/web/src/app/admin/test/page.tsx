'use client';

import { useState } from 'react';

export default function AdminTest() {
  const [envTest, setEnvTest] = useState<any>(null);
  const [dbTest, setDbTest] = useState<any>(null);
  const [simpleTest, setSimpleTest] = useState<any>(null);
  const [usersTest, setUsersTest] = useState<any>(null);

  const testEnvironment = async () => {
    try {
      const response = await fetch('/api/admin/test-env');
      const data = await response.json();
      setEnvTest(data);
    } catch (error) {
      setEnvTest({ error: 'Failed to test environment' });
    }
  };

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/admin/test-db');
      const data = await response.json();
      setDbTest(data);
    } catch (error) {
      setDbTest({ error: 'Failed to test database connection' });
    }
  };

  const testSimpleConnection = async () => {
    try {
      const response = await fetch('/api/admin/test-simple');
      const data = await response.json();
      setSimpleTest(data);
    } catch (error) {
      setSimpleTest({ error: 'Failed to test simple connection' });
    }
  };

  const testUsersCollection = async () => {
    try {
      const response = await fetch('/api/admin/test-users');
      const data = await response.json();
      setUsersTest(data);
    } catch (error) {
      setUsersTest({ error: 'Failed to test users collection' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Environment Test</h1>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={testEnvironment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Test Environment
              </button>
              <button
                onClick={testSimpleConnection}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Test Connection
              </button>
              <button
                onClick={testUsersCollection}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Test Users Collection
              </button>
              <button
                onClick={testDatabase}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Test Full Database
              </button>
            </div>

            {envTest && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Environment Test Results:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(envTest, null, 2)}
                </pre>
              </div>
            )}

            {simpleTest && (
              <div className={`rounded-lg p-4 ${simpleTest.success ? 'bg-purple-50' : 'bg-red-50'}`}>
                <h3 className={`font-medium mb-2 ${simpleTest.success ? 'text-purple-900' : 'text-red-900'}`}>
                  Simple Connection Test Results:
                </h3>
                <pre className={`text-sm whitespace-pre-wrap ${simpleTest.success ? 'text-purple-700' : 'text-red-700'}`}>
                  {JSON.stringify(simpleTest, null, 2)}
                </pre>
              </div>
            )}

            {usersTest && (
              <div className={`rounded-lg p-4 ${usersTest.success ? 'bg-orange-50' : 'bg-red-50'}`}>
                <h3 className={`font-medium mb-2 ${usersTest.success ? 'text-orange-900' : 'text-red-900'}`}>
                  Users Collection Test Results:
                </h3>
                <pre className={`text-sm whitespace-pre-wrap ${usersTest.success ? 'text-orange-700' : 'text-red-700'}`}>
                  {JSON.stringify(usersTest, null, 2)}
                </pre>
              </div>
            )}

            {dbTest && (
              <div className={`rounded-lg p-4 ${dbTest.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className={`font-medium mb-2 ${dbTest.success ? 'text-green-900' : 'text-red-900'}`}>
                  Full Database Test Results:
                </h3>
                <pre className={`text-sm whitespace-pre-wrap ${dbTest.success ? 'text-green-700' : 'text-red-700'}`}>
                  {JSON.stringify(dbTest, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Credentials Source:</h3>
              <p className="text-sm text-yellow-700">
                Admin credentials are loaded from environment variables:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 mt-2">
                <li><strong>ADMIN_USERNAME</strong> - Admin username</li>
                <li><strong>ADMIN_PASSWORD</strong> - Admin password</li>
                <li><strong>ADMIN_SECRET_KEY</strong> - Admin secret key</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Database Admin:</h3>
              <p className="text-sm text-blue-700">
                <a 
                  href="/admin/setup"
                  className="underline hover:text-blue-900"
                >
                  Create Admin Account
                </a>
                {' | '}
                <a 
                  href="/admin/login"
                  className="underline hover:text-blue-900"
                >
                  Admin Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}