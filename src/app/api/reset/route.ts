import { NextResponse } from 'next/server';
import { performDailyReset } from '@/lib/db';

export async function POST() {
  try {
    performDailyReset();
    return NextResponse.json({ 
      success: true, 
      message: 'Daily reset completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Daily reset error:', error);
    return NextResponse.json({ 
      error: 'Failed to perform daily reset' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Daily reset endpoint. Use POST to trigger reset.',
    schedule: 'Runs daily at 6:00 AM'
  });
}
