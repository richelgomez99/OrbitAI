import React from 'react';
import { Task } from '@/lib/utils';
import TaskCard from './TaskCard'; // Import the TaskCard component

interface StatusColumnProps {
  title: string;
  tasks: Task[];
  // Optionally, add specific status type if needed for styling or logic, e.g., statusKey: 'todo' | 'inProgress' | 'done' | 'blocked';
}

const StatusColumn: React.FC<StatusColumnProps> = ({ title, tasks }) => {
  return (
    <div className="bg-muted/50 p-4 rounded-lg h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-foreground sticky top-0 bg-muted/50 py-2 z-10">{title} ({tasks.length})</h2>
      <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center pt-4">No tasks in this category.</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
};

export default StatusColumn;
