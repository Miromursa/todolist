export type TaskPriority = 'A' | 'B' | 'C' | 'D';

export type TaskCategory = 'today' | 'tomorrow' | 'week' | 'dailies' | 'done' | 'backlog';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: number;
}