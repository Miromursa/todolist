import { NextResponse } from 'next/server';
import { getStreak, updateStreak, resetStreak } from '@/lib/db';

export async function GET() {
  try {
    const streak = getStreak();
    return NextResponse.json(streak);
  } catch (error) {
    console.error('GET /api/streak error:', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'update') {
      updateStreak();
      const streak = getStreak();
      return NextResponse.json(streak);
    }

    if (body.action === 'reset') {
      resetStreak();
      const streak = getStreak();
      return NextResponse.json(streak);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/streak error:', error);
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}
