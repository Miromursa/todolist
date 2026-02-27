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
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  medium: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  high: "bg-red-100 text-red-700 hover:bg-red-200",
}

export function TaskItem({ 
  task, 
  onToggle, 
  onDelete, 
  onMove, 
  onUpdatePriority, 
  onUpdateTitle,
  onDragStart
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleTitleClick = () => {
    if (!task.completed) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== task.title) {
      onUpdateTitle(task.id, editValue)
    } else {
      setEditValue(task.title)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(task.title)
    }
  }

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation()
    const priorities: TaskPriority[] = ['low', 'medium', 'high']
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
      className={cn(
        "group relative flex items-center gap-3 bg-white p-3 rounded-xl border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/20",
        task.completed && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-primary transition-colors">
        <GripVertical size={18} />
      </div>
      
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 rounded-full border-primary"
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
            onClick={handleTitleClick}
            className={cn(
              "text-sm font-medium transition-all truncate cursor-text",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h4>
        )}
        {task.description && !isEditing && (
          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Badge 
          onClick={cyclePriority}
          variant="outline" 
          className={cn(
            "text-[10px] uppercase font-bold px-1.5 py-0 cursor-pointer transition-colors", 
            priorityColors[task.priority]
          )}
        >
          {task.priority}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'high')}>
              Priority: High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'medium')}>
              Priority: Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdatePriority(task.id, 'low')}>
              Priority: Low
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
