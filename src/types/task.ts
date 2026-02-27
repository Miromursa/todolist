export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'today' | 'tomorrow' | 'week' | 'dailies';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: number;
}