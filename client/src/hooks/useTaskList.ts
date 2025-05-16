import { useState, useEffect, useCallback } from 'react';
import { TaskStatus, Priority } from '@prisma/client';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  mode: 'BUILD' | 'FLOW' | 'RESTORE';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  userId: string;
}

export const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const addTask = async (taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    mode?: 'BUILD' | 'FLOW' | 'RESTORE';
    tags?: string[];
    dueDate?: string; // ISO string format
  }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          mode: taskData.mode || 'BUILD',
          tags: taskData.tags || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      await fetchTasks();
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      throw err;
    }
  };

  // Update a task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await fetchTasks();
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchTasks();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      throw err;
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    return updateTask(taskId, {
      status: completed ? 'DONE' : 'TODO',
      completedAt: completed ? new Date() : null,
    });
  };

  // Move task to a different status
  const moveTask = async (taskId: string, status: TaskStatus) => {
    return updateTask(taskId, {
      status,
      ...(status === 'DONE' && { completedAt: new Date() }),
    });
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    moveTask,
  };
};
