'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function UserManagementPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [email, setEmail] = useState('');

  const checkMigrationStatus = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/migrate-users');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/admin/migrate-users', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!email) {
      setResult({
        success: false,
        error: 'Please enter an email address'
      });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/auth/user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const listAllUsers = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/debug/list-users');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management & Migration</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Migration Tools */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Migration Tools</h2>
            <p className="text-gray-600 mb-4">
              Manage user email verification status and migrate existing users.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={checkMigrationStatus}
                loading={loading}
                className="w-full"
              >
                Check Migration Status
              </Button>
              
              <Button
                onClick={runMigration}
                loading={loading}
                variant="secondary"
                className="w-full"
              >
                Run User Migration
              </Button>
            </div>
          </Card>

          {/* User Status Check */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">User Status Check</h2>
            
            <div className="space-y-4 mb-4">
              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to check"
                type="email"
              />
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={checkUserStatus}
                loading={loading}
                className="w-full"
              >
                Check User Status
              </Button>
              
              <Button
                onClick={listAllUsers}
                loading={loading}
                variant="ghost"
                className="w-full"
              >
                List All Users
              </Button>
            </div>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Result: 
              <span className={`ml-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </h2>
            
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Migration Guide</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">Issue:</h3>
              <p className="text-gray-600">
                Existing users registered before email verification was implemented have `emailVerified: false` 
                in the database, causing login failures.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Solution:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>Check Status:</strong> See how many users need migration</li>
                <li><strong>Run Migration:</strong> Auto-verify all existing users</li>
                <li><strong>Verify Results:</strong> Check that users can now login</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">What the Migration Does:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Sets `emailVerified: true` for all existing users</li>
                <li>Allows existing users to login without email verification</li>
                <li>New users still require email verification</li>
                <li>Maintains backward compatibility</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Auto-Verification:</h3>
              <p className="text-gray-600">
                The auth service now automatically verifies existing users who can successfully 
                login with their password, eliminating the need for manual migration in most cases.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}