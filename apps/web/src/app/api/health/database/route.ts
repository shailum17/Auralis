import { NextResponse } from 'next/server';
import { databaseClient } from '@/lib/database-client';

export async function GET() {
  try {
    // Test direct database connection
    const connected = await databaseClient.connect();
    
    if (connected) {
      await databaseClient.disconnect();
      
      return NextResponse.json({
        success: true,
        data: {
          status: 'connected',
          message: 'Direct database connection successful',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        data: {
          status: 'disconnected',
          message: 'Failed to connect to database',
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: {
        status: 'error',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}