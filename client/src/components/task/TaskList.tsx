import React from 'react';
import { Check, MoreHorizontal, Flag, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Task, TaskStatus, Priority } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string, completed: boolean) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  emptyMessage?: string;
  showCompleted?: boolean;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onComplete,
  onDelete,
  onEdit,
  emptyMessage = 'No tasks to display',
  showCompleted = false,
  className = '',
}) => {
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 dark:text-red-400 font-medium';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400 font-medium';
      case 'LOW':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-400 dark:text-gray-500';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    return <Flag className={`w-4 h-4 ${getPriorityColor(priority)}`} />;
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            'group flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors',
            {
              'opacity-70': task.status === 'DONE' && !showCompleted,
            }
          )}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => onComplete?.(task.id, task.status !== 'DONE')}
              className={cn(
                'flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center',
                'border border-border hover:border-primary transition-colors',
                {
                  'bg-primary border-primary text-primary-foreground': task.status === 'DONE',
                }
              )}
              aria-label={task.status === 'DONE' ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.status === 'DONE' && <Check className="w-3 h-3" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className={cn('text-sm font-medium truncate', {
                    'line-through text-muted-foreground': task.status === 'DONE',
                  })}
                >
                  {task.title}
                </span>
                {task.priority && task.priority !== 'MEDIUM' && (
                  <span className="flex-shrink-0">
                    {getPriorityIcon(task.priority)}
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-2">
            <span className="text-xs text-muted-foreground">
              {task.status === 'DONE' ? 'Completed' : ''}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Task actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onComplete?.(task.id, task.status !== 'DONE')}
                >
                  {task.status === 'DONE' ? 'Mark as Incomplete' : 'Mark as Complete'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete?.(task.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
