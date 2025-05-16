import React, { useEffect } from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Task, TaskStatus, normalizeTaskStatus } from '@/lib/utils';

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'inprogress': 'In Progress',
  'done': 'Done',
  'blocked': 'Blocked',
  'pending': 'Pending'
};

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-blue-100 text-blue-800',
  'inprogress': 'bg-yellow-100 text-yellow-800',
  'done': 'bg-green-100 text-green-800',
  'blocked': 'bg-red-100 text-red-800',
  'pending': 'bg-purple-100 text-purple-800'
};

const priorityColors: Record<string, string> = {
  'LOW': 'bg-blue-100 text-blue-800',
  'MEDIUM': 'bg-yellow-100 text-yellow-800',
  'HIGH': 'bg-red-100 text-red-800'
};

const TasksPage: React.FC = () => {
  const { tasks, isLoadingTasks, updateTaskStatus } = useOrbit();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const renderTaskCard = (task: Task) => {
    const normalizedStatus = normalizeTaskStatus(task.status);
    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        className={`p-3 mb-2 rounded-lg shadow-sm border ${statusColors[normalizedStatus]} cursor-move`}
      >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p className="text-sm mt-1 text-gray-700 line-clamp-2">{task.description}</p>
      )}
      {task.estimatedTime && (
        <div className="mt-2 text-xs text-gray-500">
          ⏱️ {task.estimatedTime} min
        </div>
      )}
      </div>
    );
  };

  const statuses: TaskStatus[] = ['todo', 'inprogress', 'done', 'blocked', 'pending'];

  if (isLoadingTasks) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Tasks Overview</h1>
        <p className="text-muted-foreground">Manage your tasks in a Kanban board</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statuses.map((status) => {
          const filteredTasks = tasks.filter(task => normalizeTaskStatus(task.status) === status);
          return (
            <div 
              key={status}
              className="bg-muted/50 p-4 rounded-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold">{statusLabels[status]}</h2>
                <span className="text-xs bg-background px-2 py-1 rounded-full">
                  {filteredTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => renderTaskCard(task))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No {statusLabels[status].toLowerCase()} tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default TasksPage;
