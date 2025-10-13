'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestEmail = async () => {
    if (!email) {
      setResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setResult({
        success: data.success,
        message: data.success ? data.data.message : data.error
      });
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            label="Test Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Button
            onClick={handleTestEmail}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Note:</strong> This page tests the email configuration.</p>
            <p>If emails aren't working, check:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>SMTP credentials in .env.local</li>
              <li>Gmail app password (not regular password)</li>
              <li>Network connectivity</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}