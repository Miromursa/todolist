import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'tasks.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    // Ensure the directory exists
    const dir = path.dirname(DB_PATH);
    const fs = require('fs');
    if (!dir.startsWith(':') && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium',
        category TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL
      )
    `);
  }
  return db;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  completed: number;
  createdAt: number;
}

export function getAllTasks(): TaskRow[] {
  return getDb().prepare('SELECT * FROM tasks ORDER BY createdAt ASC').all() as TaskRow[];
}

export function insertTask(task: TaskRow): void {
  getDb().prepare(
    'INSERT INTO tasks (id, title, description, priority, category, completed, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(task.id, task.title, task.description, task.priority, task.category, task.completed, task.createdAt);
}

export function updateTask(id: string, fields: Partial<Omit<TaskRow, 'id'>>): void {
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(fields)) {
    sets.push(`${key} = ?`);
    values.push(value);
  }
  if (sets.length === 0) return;
  values.push(id);
  getDb().prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

export function deleteTask(id: string): void {
  getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

export function bulkInsertTasks(tasks: TaskRow[]): void {
  const insert = getDb().prepare(
    'INSERT INTO tasks (id, title, description, priority, category, completed, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const transaction = getDb().transaction((items: TaskRow[]) => {
    for (const t of items) {
      insert.run(t.id, t.title, t.description, t.priority, t.category, t.completed, t.createdAt);
    }
  });
  transaction(tasks);
}

export function resetDailies(): void {
  getDb().prepare("UPDATE tasks SET completed = 0 WHERE category = 'dailies'").run();
}
