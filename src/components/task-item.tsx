"use client"

import { Task, TaskPriority } from "@/types/task"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, GripVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, newCategory: Task['category']) => void
  onUpdatePriority: (id: string, priority: TaskPriority) => void
  onUpdateTitle: (id: string, title: string) => void
  onDragStart: (id: string) => void
  onAddTaskAfterUpdate?: (category: Task['category']) => void
  isSelected?: boolean
  isFocused?: boolean
  onSelect?: (id: string, multiSelect?: boolean, rangeSelect?: boolean) => void
  onFocus?: (id: string) => void
}

const priorityColors: Record<TaskPriority, string> = {
  A: "border-red-500 text-red-500 hover:bg-red-500 hover:text-background",
  B: "border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-background",
  C: "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-background",
  D: "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-background",
}

const priorityDescriptions: Record<TaskPriority, string> = {
  A: "Main Quest - Urgent and important",
  B: "Main Quest - Important but less urgent", 
  C: "Sidequest - Projects, ideas, minor tasks",
  D: "Sidequest - Unimportant projects or ideas"
}

export function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onMove, 
  onUpdatePriority, 
  onUpdateTitle,
  onDragStart,
  onAddTaskAfterUpdate,
  isSelected = false,
  isFocused = false,
  onSelect,
  onFocus
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const [isDisappearing, setIsDisappearing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Update editValue when task title changes
    setEditValue(task.title)
  }, [task.title])

  useEffect(() => {
    // Auto-enter edit mode for new empty tasks or when focused
    if (!task.title.trim() && !isEditing) {
      setIsEditing(true)
    }
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [task.title, isEditing])

  useEffect(() => {
    // Auto-enter edit mode when focused via keyboard navigation
    if (isFocused && !isEditing && !task.completed) {
      setIsEditing(true)
    }
  }, [isFocused, isEditing, task.completed])

  useEffect(() => {
    // Trigger disappear animation when task is completed and not in done column or dailies
    // Start animation only after 5 seconds
    if (task.completed && task.category !== 'done' && task.category !== 'dailies' && !isDisappearing) {
      const timer = setTimeout(() => {
        setIsDisappearing(true)
      }, 4500) // Start disappearing animation at 4.5 seconds (gives 500ms for fade-out)
      
      return () => clearTimeout(timer)
    } else if (!task.completed || task.category === 'done' || task.category === 'dailies') {
      // Reset disappearing state if task is uncompleted or already in done column or is a daily
      setIsDisappearing(false)
    }
  }, [task.completed, task.category, isDisappearing])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    const multiSelect = e.ctrlKey || e.metaKey
    const rangeSelect = e.shiftKey
    onSelect?.(task.id, multiSelect, rangeSelect)
    onFocus?.(task.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      // Let parent handle navigation
      return
    }
    
    if (e.key === 'Delete' && isSelected && !isEditing) {
      onDelete(task.id)
      return
    }
    
    if (isEditing) {
      if (e.key === 'Enter') {
        const trimmedValue = editValue.trim()
        
        if (!trimmedValue) {
          // Delete empty task and don't create new one
          onDelete(task.id)
        } else {
          // Update title and create new task
          onUpdateTitle(task.id, trimmedValue)
          setIsEditing(false)
          onAddTaskAfterUpdate?.(task.category)
        }
      } else if (e.key === 'Escape') {
        setIsEditing(false)
        setEditValue(task.title)
      }
    } else if (e.key === 'Enter' && !task.completed) {
      // Enter to edit when not editing
      setIsEditing(true)
    }
  }

  const handleTitleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task.completed) {
      setIsEditing(true)
    }
    // Also handle selection when title is clicked
    const multiSelect = e.ctrlKey || e.metaKey
    const rangeSelect = e.shiftKey
    onSelect?.(task.id, multiSelect, rangeSelect)
    onFocus?.(task.id)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const trimmedValue = editValue.trim()
    
    if (!trimmedValue) {
      // Auto-delete empty task
      onDelete(task.id)
    } else if (trimmedValue !== task.title) {
      // Update title only if it changed
      onUpdateTitle(task.id, trimmedValue)
    } else {
      setEditValue(task.title)
    }
  }

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation()
    const priorities: TaskPriority[] = ['A', 'B', 'C', 'D']
    const currentIndex = priorities.indexOf(task.priority)
    const nextPriority = priorities[(currentIndex + 1) % priorities.length]
    onUpdatePriority(task.id, nextPriority)
  }

  const handleDragStartInternal = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id)
    onDragStart(task.id)
  }

  return (
    <div 
      draggable 
      onDragStart={handleDragStartInternal}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn(
        "group relative flex items-center gap-3 bg-transparent p-3 border border-border task-item transition-all duration-500",
        task.completed && "opacity-60 grayscale-[0.5]",
        isSelected && "border-primary bg-primary/10",
        isFocused && "border-primary bg-primary/10",
        isDisappearing && "opacity-0 transform scale-95 -translate-y-1"
      )}
    >
      <div className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-primary transition-colors"
           onMouseDown={(e) => {
             e.stopPropagation()
             // Handle selection when grip is clicked
             const multiSelect = e.ctrlKey || e.metaKey
             const rangeSelect = e.shiftKey
             onSelect?.(task.id, multiSelect, rangeSelect)
             onFocus?.(task.id)
           }}>
        <GripVertical size={18} />
      </div>
      
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => onToggle(task.id)}
        onMouseDown={(e) => {
          e.stopPropagation()
          // Handle selection when checkbox is clicked
          const multiSelect = e.ctrlKey || e.metaKey
          const rangeSelect = e.shiftKey
          onSelect?.(task.id, multiSelect, rangeSelect)
          onFocus?.(task.id)
        }}
        className="h-5 w-5 border-2 border-primary"
      />
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm py-0 bg-secondary/30 border-primary/20 focus-visible:ring-primary/20"
          />
        ) : (
          <h4 
            onMouseDown={handleTitleMouseDown}
            className={cn(
              "text-sm font-medium transition-all cursor-text break-words",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h4>
        )}
        {task.description && !isEditing && (
          <p className="text-xs text-muted-foreground break-words">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.category !== 'dailies' && (
          <Badge 
            onClick={cyclePriority}
            variant="outline" 
            title={priorityDescriptions[task.priority]}
            className={cn(
              "text-[10px] uppercase font-bold px-1.5 py-0 cursor-pointer transition-colors border-2", 
              priorityColors[task.priority]
            )}
          >
            [{task.priority}]
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {task.category !== 'dailies' && (
              <>
                <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'A')}>
                  Priority: A
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'B')}>
                  Priority: B
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'C')}>
                  Priority: C
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'D')}>
                  Priority: D
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => onMove(task.id, 'today')}>
              Move to Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, 'tomorrow')}>
              Move to Tomorrow
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, 'week')}>
              Move to This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, 'dailies')}>
              Make Recurring (Dailies)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, 'done')}>
              Move to Done
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMove(task.id, 'backlog')}>
              Move to Backlog
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
