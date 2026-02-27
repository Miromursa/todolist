"use client"

import { useState, useEffect } from "react"
import { Task, TaskCategory, TaskPriority } from "@/types/task"
import { TaskColumn } from "@/components/task-column"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Plus, 
  RotateCcw, 
  Search, 
  CheckCircle2,
  TrendingUp,
} from "lucide-react"
import { Input } from "@/components/ui/input"

export default function QuestlogDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null)
  const [lastSelectedTaskId, setLastSelectedTaskId] = useState<string | null>(null)

  // Load tasks from API
  useEffect(() => {
    setIsMounted(true)
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(e => console.error('Failed to load tasks', e))
  }, [])

  const addTask = (category: TaskCategory, title = "New Task", description = "") => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      priority: 'medium',
      category,
      completed: false,
      createdAt: Date.now()
    }
    setTasks(prev => [...prev, newTask])
    // Immediately focus and select the new task
    setFocusedTaskId(newTask.id)
    setSelectedTasks(new Set([newTask.id]))
    setLastSelectedTaskId(newTask.id)
    
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    }).catch(e => console.error('Failed to save task', e))
  }

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: task ? !task.completed : true }),
    }).catch(e => console.error('Failed to toggle task', e))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      .catch(e => console.error('Failed to delete task', e))
  }

  const moveTask = (id: string, newCategory: TaskCategory) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, category: newCategory } : t))
    fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory }),
    }).catch(e => console.error('Failed to move task', e))
  }

  const updatePriority = (id: string, priority: TaskPriority) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, priority } : t))
    fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    }).catch(e => console.error('Failed to update priority', e))
  }

  const updateTitle = (id: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title } : t))
    fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }).catch(e => console.error('Failed to update title', e))
  }

  const handleDragStart = (id: string) => {
    setDraggedTaskId(id)
  }

  const handleDrop = (category: TaskCategory) => {
    if (draggedTaskId) {
      moveTask(draggedTaskId, category)
      setDraggedTaskId(null)
    }
  }

  const resetDailies = () => {
    setTasks(prev => prev.map(t => t.category === 'dailies' ? { ...t, completed: false } : t))
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-dailies' }),
    }).catch(e => console.error('Failed to reset dailies', e))
  }

  const addTaskAfterUpdate = (category: TaskCategory) => {
    addTask(category, "", "")
  }

  const handleTaskSelect = (taskId: string, multiSelect = false, rangeSelect = false) => {
    if (rangeSelect && lastSelectedTaskId) {
      // Handle range selection (Shift+Click) - only within the same column
      const currentTask = tasks.find(t => t.id === taskId)
      const lastTask = tasks.find(t => t.id === lastSelectedTaskId)
      
      if (currentTask && lastTask && currentTask.category === lastTask.category) {
        // Only do range selection within the same column
        const columnTasks = tasks
          .filter(t => t.category === currentTask.category)
          .sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 }
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          })
        
        const currentIndex = columnTasks.findIndex(t => t.id === taskId)
        const lastIndex = columnTasks.findIndex(t => t.id === lastSelectedTaskId)
        const start = Math.min(currentIndex, lastIndex)
        const end = Math.max(currentIndex, lastIndex)
        
        const rangeIds = new Set(columnTasks.slice(start, end + 1).map(t => t.id))
        setSelectedTasks(rangeIds)
      } else {
        // Different columns, treat as single selection
        setSelectedTasks(new Set([taskId]))
      }
    } else if (multiSelect) {
      // Handle multi-selection (Ctrl+Click)
      setSelectedTasks(prev => {
        const newSet = new Set(prev)
        if (newSet.has(taskId)) {
          newSet.delete(taskId)
        } else {
          newSet.add(taskId)
        }
        return newSet
      })
    } else {
      // Handle single selection
      setSelectedTasks(new Set([taskId]))
    }
    setLastSelectedTaskId(taskId)
  }

  const handleTaskFocus = (taskId: string) => {
    setFocusedTaskId(taskId)
    // Also select the focused task so it can be operated on
    setSelectedTasks(prev => {
      if (!prev.has(taskId)) {
        return new Set([taskId])
      }
      return prev
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && selectedTasks.size > 0) {
      // Delete all selected tasks
      selectedTasks.forEach(taskId => {
        deleteTask(taskId)
      })
      setSelectedTasks(new Set())
      setFocusedTaskId(null)
    } else if (e.key === 'Escape') {
      // Clear selection with Escape key
      setSelectedTasks(new Set())
      setFocusedTaskId(null)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Handle Tab navigation through columns sequentially
      const categories: TaskCategory[] = ['today', 'tomorrow', 'week', 'dailies']
      const currentColumnTasks = filteredTasks.filter(t => t.category === categories[0])
      const allColumnTasks = categories.map(cat => 
        filteredTasks.filter(t => t.category === cat).sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
      )
      
      if (!focusedTaskId && allColumnTasks[0].length > 0) {
        // Focus first task in first column if no task is focused
        const firstTask = allColumnTasks[0][0]
        handleTaskFocus(firstTask.id)
      } else if (focusedTaskId) {
        // Find current task and navigate
        let found = false
        let nextTask: Task | null = null
        
        for (let colIndex = 0; colIndex < allColumnTasks.length; colIndex++) {
          const columnTasks = allColumnTasks[colIndex]
          const taskIndex = columnTasks.findIndex(t => t.id === focusedTaskId)
          
          if (taskIndex !== -1) {
            found = true
            const nextIndex = e.shiftKey 
              ? taskIndex - 1  // Go to previous task
              : taskIndex + 1  // Go to next task
            
            if (nextIndex >= 0 && nextIndex < columnTasks.length) {
              // Next task is in same column
              nextTask = columnTasks[nextIndex]
            } else if (e.shiftKey && colIndex > 0) {
              // Go to last task of previous column
              const prevColumn = allColumnTasks[colIndex - 1]
              if (prevColumn.length > 0) {
                nextTask = prevColumn[prevColumn.length - 1]
              }
            } else if (!e.shiftKey && colIndex < allColumnTasks.length - 1) {
              // Go to first task of next column
              const nextColumn = allColumnTasks[colIndex + 1]
              if (nextColumn.length > 0) {
                nextTask = nextColumn[0]
              }
            }
            break
          }
        }
        
        if (nextTask) {
          handleTaskFocus(nextTask.id)
        }
      }
    }
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Clear selection when clicking on empty background
    const target = e.target as HTMLElement
    // Check if click is on main content area or empty space (not on tasks, buttons, or interactive elements)
    if (target === e.currentTarget || target.closest('main') && !target.closest('.task-item') && !target.closest('button') && !target.closest('input')) {
      setSelectedTasks(new Set())
      setFocusedTaskId(null)
    }
  }

  // Auto-focus new empty tasks
  useEffect(() => {
    const newEmptyTasks = tasks.filter(task => !task.title.trim())
    if (newEmptyTasks.length > 0) {
      // Find the first new empty task and trigger edit mode
      const newestTask = newEmptyTasks.sort((a, b) => b.createdAt - a.createdAt)[0]
      // This will be handled by the TaskItem component's useEffect
    }
  }, [tasks])


  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    today: tasks.filter(t => t.category === 'today').length,
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-background flex flex-col" onKeyDown={handleKeyDown}>
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary">Questlog</h1>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Adventure Tracker</p>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Find a task..." 
                className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden lg:flex items-center gap-4 mr-4 text-sm font-medium">
              <div className="flex items-center gap-1 text-primary">
                <CheckCircle2 size={16} />
                <span>{stats.completed}/{stats.total} done</span>
              </div>
              <div className="flex items-center gap-1 text-amber-700 dark:text-amber-600">
                <TrendingUp size={16} />
                <span>{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
              </div>
            </div>
            <Button onClick={() => addTask('today')} className="gap-2 shadow-lg shadow-primary/20">
              <Plus size={18} />
              New Task
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-auto" onClick={handleBackgroundClick}>
        <div className="max-w-[1600px] mx-auto h-full min-h-[600px] flex gap-4 sm:gap-6 overflow-x-auto pb-4">
          <TaskColumn 
            title="Today" 
            category="today"
            tasks={filteredTasks.filter(t => t.category === 'today')}
            onAddTask={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onMove={moveTask}
            onUpdatePriority={updatePriority}
            onUpdateTitle={updateTitle}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onAddTaskAfterUpdate={addTaskAfterUpdate}
            selectedTasks={selectedTasks}
            focusedTaskId={focusedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskFocus={handleTaskFocus}
          />
          <TaskColumn 
            title="Tomorrow" 
            category="tomorrow"
            tasks={filteredTasks.filter(t => t.category === 'tomorrow')}
            onAddTask={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onMove={moveTask}
            onUpdatePriority={updatePriority}
            onUpdateTitle={updateTitle}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onAddTaskAfterUpdate={addTaskAfterUpdate}
            selectedTasks={selectedTasks}
            focusedTaskId={focusedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskFocus={handleTaskFocus}
          />
          <TaskColumn 
            title="This Week" 
            category="week"
            tasks={filteredTasks.filter(t => t.category === 'week')}
            onAddTask={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onMove={moveTask}
            onUpdatePriority={updatePriority}
            onUpdateTitle={updateTitle}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onAddTaskAfterUpdate={addTaskAfterUpdate}
            selectedTasks={selectedTasks}
            focusedTaskId={focusedTaskId}
            onTaskSelect={handleTaskSelect}
            onTaskFocus={handleTaskFocus}
          />
          <div className="flex flex-col gap-4 sm:gap-6 min-w-[280px] sm:min-w-[300px] flex-1">
             <div className="flex-1">
              <TaskColumn 
                title="Dailies" 
                category="dailies"
                tasks={filteredTasks.filter(t => t.category === 'dailies')}
                onAddTask={addTask}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onMove={moveTask}
                onUpdatePriority={updatePriority}
                onUpdateTitle={updateTitle}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onAddTaskAfterUpdate={addTaskAfterUpdate}
                selectedTasks={selectedTasks}
                focusedTaskId={focusedTaskId}
                onTaskSelect={handleTaskSelect}
                onTaskFocus={handleTaskFocus}
              />
             </div>
             <Button variant="outline" onClick={resetDailies} className="w-full gap-2 border-dashed border-2 py-6 text-muted-foreground hover:text-primary hover:border-primary">
                <RotateCcw size={16} />
                Reset Daily Routines
             </Button>
          </div>
        </div>
      </main>

      {/* Footer Mobile Stats */}
      <div className="lg:hidden border-t bg-background p-3 flex justify-around text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <div className="flex flex-col items-center">
          <span className="text-primary text-lg">{stats.today}</span>
          <span>Today</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-accent text-lg">{stats.completed}</span>
          <span>Done</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-foreground text-lg">{stats.total}</span>
          <span>Total</span>
        </div>
      </div>
    </div>
  )
}
