import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock, MoreHorizontal, Tag, Cpu, RefreshCcw, Zap, Edit } from "lucide-react";
import { cn, formatDueDate, Task, Mode } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useOrbit } from "@/context/orbit-context";
import { useLocation } from "wouter"; // Import useLocation for navigation
import { EditTaskDialog } from "@/components/edit-task-dialog";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: "todo" | "done" | "snoozed") => void;
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [, navigate] = useLocation(); // Get navigate function
  const { sendMessage, updateTask } = useOrbit();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const priorityColors = {
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  const priorityLabel = {
    low: "Low",
    medium: "Medium",
    high: "High"
  };
  
  const modeColors: Record<Mode, string> = {
    build: "bg-[#9F7AEA]/10 text-[#9F7AEA] border-[#9F7AEA]/20", // Purple
    restore: "bg-[#FC8181]/10 text-[#FC8181] border-[#FC8181]/20", // Red
    flow: "bg-green-500/10 text-green-400 border-green-500/20" // Green
  };
  
  const handleReframeTask = () => {
    sendMessage(`Reframe task: ${task.title}`);
    navigate("/chat"); // Navigate to the chat page
  };
  
  const handleEditTask = () => {
    setIsEditDialogOpen(true);
  };
  
  const handleSaveTask = (updatedTask: Task) => {
    updateTask(updatedTask);
    setIsEditDialogOpen(false);
  };
  
  const getFrictionIndicator = () => {
    if (!task.friction) return null;
    
    let frictionText = "";
    let frictionColor = "";
    
    if (task.friction >= 3) {
      frictionText = "High friction";
      frictionColor = "bg-red-500/10 text-red-400 border-red-500/20";
    } else if (task.friction >= 1) {
      frictionText = "Some friction";
      frictionColor = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    } else {
      return null;
    }
    
    return (
      <Badge variant="outline" className={cn("text-xs mr-2", frictionColor)}>
        {frictionText}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <EditTaskDialog 
        task={task} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveTask}
      />
      <Card className={`p-4 mb-4 hover:translate-x-1 border-l-2 ${task.mode ? modeColors[task.mode as Mode].split(' ')[1] : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-primary">{task.title}</h3>
          <div className="flex items-center">
            {task.isAiGenerated && (
              <Badge variant="outline" className="bg-[#9F7AEA]/10 text-[#9F7AEA] text-xs mr-2 flex gap-1 items-center">
                <Cpu className="h-3 w-3" />
                <span>AI</span>
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Task Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEditTask}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReframeTask}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  <span>Reframe Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "done")}>
                  <Check className="mr-2 h-4 w-4" />
                  <span>Mark as Done</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "snoozed")}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Snooze</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
            {priorityLabel[task.priority]}
          </Badge>
          
          {task.estimatedTime && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimatedTime} min
            </Badge>
          )}
          
          {task.mode && (
            <Badge className={cn("text-xs", modeColors[task.mode as Mode])}>
              <Zap className="h-3 w-3 mr-1" />
              {task.mode}
            </Badge>
          )}
          
          {getFrictionIndicator()}
          
          {task.tags && task.tags.length > 0 && task.tags.map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        {task.dueDate && (
          <p className="text-xs text-secondary mb-2">
            Due: {formatDueDate(task.dueDate)}
          </p>
        )}
        
        {task.description && (
          <div className="bg-surface/50 rounded-xl p-3 mb-3">
            <p className="text-sm text-primary italic">{task.description}</p>
          </div>
        )}
        
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-secondary mb-1">Subtasks:</p>
            {task.subtasks.map((subtask, index) => (
              <div key={subtask.id} className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={subtask.done}
                  className="rounded text-primary" 
                  readOnly
                />
                <span className={subtask.done ? "line-through text-secondary" : "text-primary"}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between mt-3">
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
            <Button 
              size="icon" 
              variant="ghost"
              className="p-2 rounded-full bg-purple-500/10 text-purple-400"
              onClick={handleReframeTask}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
