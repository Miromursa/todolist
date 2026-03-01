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
    
    // Add lastReset column if it doesn't exist (for existing databases)
    try {
      db.prepare("ALTER TABLE tasks ADD COLUMN lastReset INTEGER DEFAULT NULL").run();
    } catch (error) {
      // Column already exists, ignore error
    }
    
    // Create streak counter table
    db.exec(`
      CREATE TABLE IF NOT EXISTS streak_counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_completed_date INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Initialize streak counter if it doesn't exist
    try {
      db.prepare("INSERT INTO streak_counter (id, current_streak, longest_streak, last_completed_date, created_at) VALUES (1, 0, 0, 0, strftime('%s', 'now'))").run();
    } catch (error) {
      // Row already exists, ignore error
    }
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'B',
        category TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL,
        lastReset INTEGER DEFAULT NULL
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
  lastReset: number | null;
}

export interface StreakRow {
  id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: number;
  created_at: number;
}

export function getAllTasks(): TaskRow[] {
  return getDb().prepare('SELECT * FROM tasks ORDER BY createdAt ASC').all() as TaskRow[];
}

export function insertTask(task: TaskRow): void {
  getDb().prepare(
    'INSERT INTO tasks (id, title, description, priority, category, completed, createdAt, lastReset) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(task.id, task.title, task.description, task.priority, task.category, task.completed, task.createdAt, task.lastReset);
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
    'INSERT INTO tasks (id, title, description, priority, category, completed, createdAt, lastReset) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const transaction = getDb().transaction((items: TaskRow[]) => {
    for (const t of items) {
      insert.run(t.id, t.title, t.description, t.priority, t.category, t.completed, t.createdAt, t.lastReset);
    }
  });
  transaction(tasks);
}

export function resetDailies(): void {
  getDb().prepare("UPDATE tasks SET completed = 0 WHERE category = 'dailies'").run();
}

export function performDailyReset(): void {
  const now = Date.now();
  const db = getDb();
  
  // Move tomorrow tasks to today
  db.prepare("UPDATE tasks SET category = 'today', lastReset = ? WHERE category = 'tomorrow'").run(now);
  
  // Move all today tasks to week (not just old ones)
  db.prepare("UPDATE tasks SET category = 'week' WHERE category = 'today'").run();
  
  // Reset dailies
  db.prepare("UPDATE tasks SET completed = 0 WHERE category = 'dailies'").run();
}

export function getStreak(): StreakRow {
  return getDb().prepare('SELECT * FROM streak_counter WHERE id = 1').get() as StreakRow;
}

export function updateStreak(): void {
  const db = getDb();
  const now = Date.now();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  
  const currentStreak = getStreak();
  const lastCompletedDate = currentStreak.last_completed_date;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTimestamp = yesterday.getTime();
  
  // Check if all dailies are completed
  const allDailiesCompleted = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE category = 'dailies' AND completed = 0").get() as { count: number };
  const totalDailies = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE category = 'dailies'").get() as { count: number };
  
  if (allDailiesCompleted.count === 0 && totalDailies.count > 0) {
    // All dailies completed
    if (lastCompletedDate === yesterdayTimestamp) {
      // Continue streak
      db.prepare("UPDATE streak_counter SET current_streak = current_streak + 1, longest_streak = MAX(longest_streak, current_streak + 1), last_completed_date = ? WHERE id = 1").run(todayTimestamp);
    } else if (lastCompletedDate < todayTimestamp) {
      // Start new streak
      db.prepare("UPDATE streak_counter SET current_streak = 1, longest_streak = MAX(longest_streak, 1), last_completed_date = ? WHERE id = 1").run(todayTimestamp);
    }
  } else if (lastCompletedDate < todayTimestamp && lastCompletedDate !== yesterdayTimestamp) {
    // Streak broken (didn't complete yesterday and not already updated today)
    db.prepare("UPDATE streak_counter SET current_streak = 0 WHERE id = 1").run();
  }
}

export function resetStreak(): void {
  getDb().prepare("UPDATE streak_counter SET current_streak = 0, last_completed_date = 0 WHERE id = 1").run();
}
