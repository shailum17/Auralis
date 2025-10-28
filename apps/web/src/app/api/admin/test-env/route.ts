import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get admin credentials from environment variables
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
        const ADMIN_ACCESS_TOKEN = process.env.NEXT_PUBLIC_ADMIN_ACCESS_TOKEN;

        return NextResponse.json({
            success: true,
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                hasAdminUsername: !!ADMIN_USERNAME,
                adminUsername: ADMIN_USERNAME || 'NOT_SET',
                hasAdminPassword: !!ADMIN_PASSWORD,
                adminPasswordLength: ADMIN_PASSWORD?.length || 0,
                hasAdminSecretKey: !!ADMIN_SECRET_KEY,
                adminSecretKeyLength: ADMIN_SECRET_KEY?.length || 0,
                hasAccessToken: !!ADMIN_ACCESS_TOKEN,
                accessToken: ADMIN_ACCESS_TOKEN || 'NOT_SET',
            },
            message: 'Environment variables loaded successfully'
        });

    } catch (error) {
        console.error('Environment test error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to test environment variables',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}