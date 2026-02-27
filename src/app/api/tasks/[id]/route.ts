import { NextResponse } from 'next/server';
import { updateTask, deleteTask } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const fields: Record<string, unknown> = {};

    if ('title' in body) fields.title = body.title;
    if ('description' in body) fields.description = body.description;
    if ('priority' in body) fields.priority = body.priority;
    if ('category' in body) fields.category = body.category;
    if ('completed' in body) fields.completed = body.completed ? 1 : 0;

    updateTask(id, fields);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
