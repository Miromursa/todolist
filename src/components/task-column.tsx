"use client"

import { Task, TaskCategory, TaskPriority } from "@/types/task"
import { TaskItem } from "./task-item"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TaskColumnProps {
  title: string
  category: TaskCategory
  tasks: Task[]
  onAddTask: (category: TaskCategory) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, newCategory: TaskCategory) => void
  onUpdatePriority: (id: string, priority: TaskPriority) => void
  onUpdateTitle: (id: string, title: string) => void
  onDragStart: (id: string) => void
  onDrop: (category: TaskCategory) => void
  onAddTaskAfterUpdate?: (category: TaskCategory) => void
  selectedTasks?: Set<string>
  focusedTaskId?: string | null
  onTaskSelect?: (id: string, multiSelect?: boolean, rangeSelect?: boolean) => void
  onTaskFocus?: (id: string) => void
}

export function TaskColumn({ 
  title, 
  category, 
  tasks, 
  onAddTask, 
  onToggle, 
  onDelete, 
  onMove, 
  onUpdatePriority,
  onUpdateTitle,
  onDragStart,
  onDrop,
  onAddTaskAfterUpdate,
  selectedTasks = new Set(),
  focusedTaskId,
  onTaskSelect,
  onTaskFocus
}: TaskColumnProps) {
  const [isOver, setIsOver] = useState(false)

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
  })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDropInternal = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    onDrop(category)
  }

  return (
    <div 
      className={cn(
        "flex flex-col h-full rounded-2xl p-3 sm:p-4 min-w-[280px] sm:min-w-[300px] flex-1 transition-colors duration-200",
        isOver ? "bg-primary/10 ring-2 ring-primary ring-inset" : "bg-secondary/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropInternal}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base sm:text-lg text-primary">{title}</h3>
          <span className="text-[10px] sm:text-xs font-semibold bg-card px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm text-muted-foreground border border-border">
            {tasks.length}
          </span>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              onAddTask(category)
            }}
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 pr-2 scroll-area">
        <div className="space-y-3 pb-4 min-h-full">
          {sortedTasks.length === 0 ? (
            <>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <p className="text-sm">No tasks yet</p>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-2 py-2 text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 transition-colors"
                onClick={() => onAddTask(category)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onAddTask(category)
                  }
                }}
              >
                <Plus size={16} className="mr-2" />
                Add Task
              </Button>
            </>
          ) : (
            <>
              {sortedTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onMove={onMove}
                  onUpdatePriority={onUpdatePriority}
                  onUpdateTitle={onUpdateTitle}
                  onDragStart={onDragStart}
                  onAddTaskAfterUpdate={onAddTaskAfterUpdate}
                  isSelected={selectedTasks.has(task.id)}
                  isFocused={focusedTaskId === task.id}
                  onSelect={onTaskSelect}
                  onFocus={onTaskFocus}
                />
              ))}
              <Button 
                variant="ghost" 
                className="w-full mt-2 py-2 text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 transition-colors"
                onClick={() => onAddTask(category)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onAddTask(category)
                  }
                }}
              >
                <Plus size={16} className="mr-2" />
                Add Task
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
