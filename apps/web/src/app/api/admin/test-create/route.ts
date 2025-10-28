import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/admin-auth-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing admin creation with simple data...');
    
    const testData = {
      username: 'testadmin',
      email: 'test@admin.com',
      password: 'testpassword123',
      fullName: 'Test Administrator',
      role: 'ADMIN' as const
    };
    
    console.log('📝 Test data prepared:', { ...testData, password: '[REDACTED]' });
    
    const result = await AdminAuthService.createAdminUser(testData);
    
    console.log('✅ Admin creation test result:', { success: result.success, hasUser: !!result.user, error: result.error });
    
    return NextResponse.json({
      success: true,
      message: 'Admin creation test completed',
      result: {
        success: result.success,
        hasUser: !!result.user,
        error: result.error,
        userId: result.user?.id
      }
    });

  } catch (error) {
    console.error('❌ Admin creation test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'TEST_FAILED',
        message: error instanceof Error ? error.message : 'Admin creation test failed',
        details: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}