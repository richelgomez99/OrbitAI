import React from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Task } from '@/lib/utils'; // Import Task type

const TasksPage: React.FC = () => {
  const { tasks, isLoadingTasks, updateTaskStatus } = useOrbit(); // Added isLoadingTasks

  if (isLoadingTasks) {
    return <div className="p-8 text-center text-neutral-400">Loading tasks...</div>;
  }

  // If tasks is explicitly null or undefined after loading, it might indicate an issue, but typically it would be an empty array.
  // For robustness, we can check for tasks being falsy, though an empty array is not falsy.
  // The primary check is isLoadingTasks. After that, tasks will be an array (possibly empty).

  return (
    <div className="p-6 bg-neutral-900 min-h-screen text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">My Tasks</h1>
        <p className="text-neutral-400 mt-1">View and manage all your current tasks.</p>
      </header>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-neutral-500">You have no tasks yet!</p>
          <p className="text-neutral-600 mt-2">Click the '+' button to add your first task.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task: Task) => (
            <li 
              key={task.id} 
              className="bg-neutral-800 p-5 rounded-lg shadow-lg border border-neutral-700 transition-all hover:border-purple-500/70"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-100">{task.title}</h2>
                  {task.description && <p className="text-sm text-neutral-400 mt-1 mb-2">{task.description}</p>}
                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-white 
                      ${task.priority === 'high' ? 'bg-red-500/80' : task.priority === 'medium' ? 'bg-yellow-500/80' : 'bg-green-500/80'}
                    `}>
                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                    </span>
                    {task.mode && <span className="px-2 py-0.5 rounded-full bg-sky-700/80 text-sky-100">{task.mode}</span>}
                    {task.estimatedTime && <span className="text-neutral-500">Est: {task.estimatedTime} min</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <select 
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as 'todo' | 'done' | 'snoozed')}
                    className={`text-sm p-1.5 rounded-md bg-neutral-700 border border-neutral-600 focus:ring-purple-500 focus:border-purple-500 
                      ${task.status === 'done' ? 'text-green-400' : task.status === 'snoozed' ? 'text-yellow-400' : 'text-neutral-300'}
                    `}
                  >
                    <option value="todo">To Do</option>
                    <option value="done">Done</option>
                    <option value="snoozed">Snoozed</option>
                  </select>
                  {task.dueDate && <p className="text-xs text-neutral-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-700/60">
                  <h3 className="text-xs font-semibold text-neutral-400 mb-1.5">Subtasks:</h3>
                  <ul className="space-y-1">
                    {task.subtasks.map(subtask => (
                      <li key={subtask.id} className={`text-sm flex items-center ${subtask.done ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>
                        <input type="checkbox" checked={subtask.done} readOnly className="mr-2 h-3.5 w-3.5 rounded bg-neutral-600 border-neutral-500 text-purple-500 focus:ring-purple-600" />
                        {subtask.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TasksPage;
