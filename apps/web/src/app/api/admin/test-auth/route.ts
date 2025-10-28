import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/admin-auth-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing admin auth service...');
    
    // Test 1: Check if admin users exist
    const hasAdmins = await AdminAuthService.hasAdminUsers();
    console.log('📊 Has admin users:', hasAdmins);
    
    // Test 2: List existing admins
    const adminList = await AdminAuthService.listAdmins();
    console.log('📋 Admin list count:', adminList.length);
    
    return NextResponse.json({
      success: true,
      message: 'Admin auth service test successful',
      results: {
        hasAdmins,
        adminCount: adminList.length,
        admins: adminList.map(admin => ({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin auth service test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'AUTH_SERVICE_TEST_FAILED',
        message: error instanceof Error ? error.message : 'Auth service test failed',
        details: {
          errorName: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}