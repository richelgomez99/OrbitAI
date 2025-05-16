import React from 'react';
import { Task, Priority, Mode } from '@/lib/utils'; // Assuming Task types are here
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react'; // For a context menu trigger
import { Button } from '@/components/ui/button';
import { useOrbit } from '@/context/orbit-context'; // To open task detail modal

interface TaskCardProps {
  task: Task;
}

const priorityVariant: Record<Priority, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  urgent: 'destructive',
  high: 'secondary', // Or another distinct color
  medium: 'default',
  low: 'outline',
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { setShowTaskDetailModal, setTaskForDetailView } = useOrbit();

  const handleCardClick = () => {
    setTaskForDetailView(task);
    setShowTaskDetailModal(true);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold leading-tight">{task.title}</CardTitle>
          {/* TODO: Add a dropdown menu for quick actions (edit, delete, change status) */}
          {/* <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
            <MoreHorizontal size={20} />
          </Button> */}
        </div>
        {task.priority && (
          <Badge variant={priorityVariant[task.priority]} className="mt-1 w-fit text-xs font-medium">
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3 text-sm text-muted-foreground">
        {task.description && <p className="truncate mb-2">{task.description}</p>}
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        {task.dueDate && (
          <p className="text-xs">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </CardContent>
      {/* Optional Footer for quick actions or subtask count */}
      {/* <CardFooter className="px-4 py-2 border-t">
        <p className="text-xs text-muted-foreground">
          {task.subtasks?.length || 0} subtasks
        </p>
      </CardFooter> */}
    </Card>
  );
};

export default TaskCard;
