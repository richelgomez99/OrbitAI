import React from 'react';
import { useTaskList } from '@/hooks/useTaskList';
import { TaskList } from '../task/TaskList';
import type { TaskFormValues } from '../task/TaskForm';
import { TaskForm } from '../task/TaskForm';
import { Button } from '../ui/button';
import { PlusIcon, ChevronDown, ArrowUpDown, Flag, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Task, TaskStatus, Priority } from '@/types/task';

type SortOption = 'priority' | 'dueDate' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const BuildMode: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, loading, error } = useTaskList();
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<SortOption>('priority');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const { toast } = useToast();
  
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a: Task, b: Task) => {
      let comparison = 0;
      
      const priorityOrder: Record<Priority, number> = { 
        URGENT: 4,
        HIGH: 3, 
        MEDIUM: 2, 
        LOW: 1 
      };
      
      const statusOrder: Record<TaskStatus, number> = { 
        DONE: 5, 
        ARCHIVED: 4, 
        IN_PROGRESS: 3, 
        BLOCKED: 2, 
        TODO: 1,
        PENDING: 0 
      };
      
      switch (sortBy) {
        case 'priority':
          comparison = (priorityOrder[a.priority as Priority] || 0) - (priorityOrder[b.priority as Priority] || 0);
          break;
        case 'dueDate':
          comparison = (a.dueDate ? a.dueDate.getTime() : Infinity) - 
                     (b.dueDate ? b.dueDate.getTime() : Infinity);
          break;
        case 'status':
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortBy, sortDirection]);
  
  const getSortLabel = (key: SortOption) => {
    switch (key) {
      case 'priority': return 'Priority';
      case 'dueDate': return 'Due Date';
      case 'status': return 'Status';
      case 'createdAt': return 'Created At';
      default: return key;
    }
  };
  
  const getSortIcon = (key: SortOption) => {
    switch (key) {
      case 'priority': return <Flag className="w-4 h-4 mr-2" />;
      case 'dueDate': return <Calendar className="w-4 h-4 mr-2" />;
      case 'status': return <CheckCircle className="w-4 h-4 mr-2" />;
      case 'createdAt': return <Calendar className="w-4 h-4 mr-2" />;
      default: return <ArrowUpDown className="w-4 h-4 mr-2" />;
    }
  };

  const handleAddTask = async (taskData: TaskFormValues) => {
    try {
      await addTask({
        ...taskData,
        title: taskData.title, // Ensure all required fields from useTaskList.addTask are present
        description: taskData.description,
        status: taskData.status || 'TODO', // Use status from form or default
        priority: taskData.priority || 'MEDIUM', // Use priority from form or default
        mode: taskData.mode || 'BUILD', // Use mode from form or default
        tags: taskData.tags || [], // Use tags from form or default
        dueDate: taskData.dueDate ? taskData.dueDate.toISOString() : undefined,
      });
      setShowTaskForm(false);
      toast({
        title: 'Task added',
        description: 'Your task has been added to the list.',
      });
    } catch (err) {
      console.error('Error adding task:', err);
      toast({
        title: 'Error',
        description: 'Failed to add task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, {
        status: completed ? 'DONE' : 'TODO',
        completedAt: completed ? new Date() : null,
      });
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTask = (task: Task) => {
    // Implement edit functionality
    console.log('Edit task:', task);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: 'Task deleted',
        description: 'The task has been removed.',
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        Error loading tasks: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Build Mode</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Focus on execution and progress</p>
        </div>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort by: {getSortLabel(sortBy)}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {['priority', 'dueDate', 'status', 'createdAt'].map((key) => (
                <DropdownMenuItem 
                  key={key}
                  onClick={() => {
                    if (sortBy === key) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(key as SortOption);
                      setSortDirection('desc');
                    }
                  }}
                  className={`flex items-center px-4 py-2 text-sm ${sortBy === key ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {getSortIcon(key as SortOption)}
                  {getSortLabel(key as SortOption)}
                  {sortBy === key && (
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={() => setShowTaskForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showTaskForm && (
        <div className="p-4 mb-6 bg-muted/50 rounded-lg">
          <TaskForm
            onSubmit={handleAddTask}
            onCancel={() => setShowTaskForm(false)}
            submitLabel="Add Task"
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            <div className="col-span-1">Status</div>
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>
        <TaskList
          tasks={sortedTasks}
          onComplete={handleTaskComplete}
          onDelete={handleTaskDelete}
          emptyMessage={
            <div className="p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <PlusIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks yet</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new task</p>
              <Button 
                onClick={() => setShowTaskForm(true)}
                className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add your first task
              </Button>
            </div>
          }
          showCompleted={false}
        />
      </div>

        <div>
          <h2 className="mb-3 text-lg font-medium">Completed</h2>
          <TaskList
            tasks={tasks.filter((task) => task.status === 'DONE')}
            onComplete={handleTaskComplete}
            onDelete={handleTaskDelete}
            emptyMessage="No completed tasks yet."
            showCompleted
          />
        </div>
    </div>
  );
};

export default BuildMode;
