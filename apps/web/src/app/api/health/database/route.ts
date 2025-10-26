import { NextResponse } from 'next/server';
import { databaseServer } from '@/lib/database-server';

export async function GET() {
  try {
    // Test direct database connection
    const connected = await databaseServer.connect();
    
    if (connected) {
      await databaseServer.disconnect();
      
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