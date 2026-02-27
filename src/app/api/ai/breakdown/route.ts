import { NextResponse } from 'next/server';
import { breakDownWeeklyTasks } from '@/lib/ai';
import { getAllTasks } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Get current week tasks from database
    const allTasks = getAllTasks();
    const weeklyTasks = allTasks
      .filter(task => task.category === 'week' && !task.completed)
      .map(task => task.title);

    if (weeklyTasks.length === 0) {
      return NextResponse.json({ 
        error: 'No weekly tasks found to break down' 
      }, { status: 400 });
    }

    // Use AI to break down the tasks
    const breakdownTasks = await breakDownWeeklyTasks(weeklyTasks);

    return NextResponse.json({ 
      success: true,
      tasks: breakdownTasks,
      originalWeeklyTasks: weeklyTasks
    });
  } catch (error) {
    console.error('AI breakdown error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('connect to vLLM')) {
        return NextResponse.json({ 
          error: 'Cannot connect to vLLM. Please make sure vLLM is running on localhost:8000' 
        }, { status: 503 });
      }
      if (error.message.includes('No models available')) {
        return NextResponse.json({ 
          error: 'No AI models available. Please make sure vLLM is running with the correct model' 
        }, { status: 503 });
      }
      if (error.message.includes('Failed to break down tasks')) {
        return NextResponse.json({ 
          error: 'AI failed to break down tasks. Please try again or check your weekly tasks.' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'An unexpected error occurred while breaking down tasks' 
    }, { status: 500 });
  }
}
