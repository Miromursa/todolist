import { NextResponse } from 'next/server';
import { getAllTasks, insertTask, bulkInsertTasks, resetDailies, performDailyReset } from '@/lib/db';

export async function GET() {
  try {
    const rows = getAllTasks();
    const tasks = rows.map(r => ({
      ...r,
      completed: Boolean(r.completed),
    }));
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Bulk insert
    if (Array.isArray(body)) {
      const rows = body.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        priority: t.priority,
        category: t.category,
        completed: t.completed ? 1 : 0,
        createdAt: t.createdAt,
        lastReset: t.lastReset || null,
      }));
      bulkInsertTasks(rows);
      return NextResponse.json({ ok: true });
    }

    // Special action: reset dailies
    if (body.action === 'reset-dailies') {
      resetDailies();
      return NextResponse.json({ ok: true });
    }

    // Special action: perform daily reset
    if (body.action === 'daily-reset') {
      performDailyReset();
      return NextResponse.json({ ok: true });
    }

    // Single insert
    insertTask({
      id: body.id,
      title: body.title,
      description: body.description || '',
      priority: body.priority,
      category: body.category,
      completed: body.completed ? 1 : 0,
      createdAt: body.createdAt,
      lastReset: body.lastReset || null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
