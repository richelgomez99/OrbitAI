import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { cn, formatDueDate, Task } from "@/lib/utils";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: "todo" | "done" | "snoozed") => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  const priorityLabel = {
    low: "Low priority",
    medium: "Medium priority",
    high: "High priority"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 mb-4 hover:translate-x-1">
        <h3 className="font-medium text-primary mb-1">{task.title}</h3>
        <p className="text-sm text-secondary mb-3">
          {task.estimatedTime ? `Est. time: ${task.estimatedTime} mins` : ""}
          {task.dueDate && task.estimatedTime ? " · " : ""}
          {task.dueDate ? formatDueDate(task.dueDate) : ""}
        </p>
        
        {task.description && (
          <div className="bg-surface/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-primary italic">{task.description}</p>
          </div>
        )}
        
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              className={cn(
                "p-2 rounded-full", 
                task.status === "done" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
              )}
              onClick={() => onStatusChange(task.id, "done")}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              className="p-2 rounded-full bg-gray-500/10 text-gray-400"
              onClick={() => onStatusChange(task.id, "snoozed")}
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>
          <span className={cn(
            "text-xs px-3 py-1 rounded-full border",
            priorityColors[task.priority]
          )}>
            {priorityLabel[task.priority]}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
