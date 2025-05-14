import { useOrbit } from "@/context/orbit-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRandomQuote, formatDueDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function DashboardView() {
  const { mode, tasks, setShowAddTaskModal } = useOrbit();
  const [sortBy, setSortBy] = useState("priority");
  
  const completedTasks = tasks.filter(task => task.status === "done");
  const activeTasks = tasks.filter(task => task.status === "todo");
  const completionPercentage = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  const moodEmoji = mode === "build" ? "😊" : mode === "recover" ? "😌" : "🧠";
  
  return (
    <div className="page-transition animate-fade-in pb-24 pt-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold mb-4">Your Orbit Dashboard</h1>
        
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">{moodEmoji}</span>
          <span className="text-secondary">in {mode} mode</span>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Task Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Tasks</h3>
            <div className="flex items-center justify-between">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2D3748" strokeWidth="8"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#9F7AEA" 
                    strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * completionPercentage / 100)}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold">{completionPercentage}%</span>
                  <span className="text-xs text-secondary">Completed</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-secondary">
                  {completedTasks.length}/{tasks.length} Tasks Done
                </div>
                <div className="text-sm text-secondary">
                  {activeTasks.length} Remaining
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Task Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-secondary">Completed Today</span>
                  <span className="text-xs text-secondary">{completedTasks.filter(t => 
                    new Date(t.createdAt).toDateString() === new Date().toDateString()
                  ).length}</span>
                </div>
                <div className="w-full bg-surface/50 rounded-full h-2">
                  <div 
                    className="bg-[#9F7AEA] h-2 rounded-full" 
                    style={{ width: `${Math.min(
                      completedTasks.filter(t => 
                        new Date(t.createdAt).toDateString() === new Date().toDateString()
                      ).length * 20, 100
                    )}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-secondary">Focus Score</span>
                  <span className="text-xs text-secondary">7.5/10</span>
                </div>
                <div className="w-full bg-surface/50 rounded-full h-2">
                  <div className="bg-[#9F7AEA] h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-secondary">Streak</span>
                  <span className="text-xs text-secondary">2 days</span>
                </div>
                <div className="w-full bg-surface/50 rounded-full h-2">
                  <div className="bg-[#9F7AEA] h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      
      {/* Active Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-display font-medium mb-4">Active</h2>
        
        {activeTasks.map(task => (
          <Card key={task.id} className="p-4 mb-4 hover:translate-x-1">
            <div className="flex justify-between mb-1">
              <h3 className="font-medium text-primary">{task.title}</h3>
              <span className="text-xs text-secondary">
                {task.dueDate ? formatDueDate(task.dueDate) : "No deadline"}
              </span>
            </div>
            <p className="text-sm text-secondary mb-3">
              {task.description || "No description"}
            </p>
            <div className="w-full bg-surface/50 rounded-full h-2 mb-3">
              <div 
                className="bg-[#9F7AEA] h-2 rounded-full" 
                style={{ 
                  width: task.subtasks && task.subtasks.length > 0 
                    ? `${(task.subtasks.filter(st => st.done).length / task.subtasks.length) * 100}%` 
                    : "0%" 
                }}
              ></div>
            </div>
          </Card>
        ))}
        
        {activeTasks.length === 0 && (
          <Card className="p-6 text-center mb-4">
            <p className="text-secondary">All caught up! Add a new task to continue your momentum.</p>
          </Card>
        )}
      </motion.div>
      
      {/* Sort By */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-between items-center mb-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Sort by:</span>
          <Select 
            value={sortBy} 
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[120px] bg-surface/50 text-primary text-sm border border-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          size="icon" 
          variant="ghost"
          className="bg-[#9F7AEA]/10 border border-[#9F7AEA]/30 w-8 h-8 rounded-full"
          onClick={() => setShowAddTaskModal(true)}
        >
          <Plus className="text-[#9F7AEA] h-4 w-4" />
        </Button>
      </motion.div>
      
      {/* Today's Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-medium mb-2">Today's Focus</h3>
          <p className="text-secondary">
            {completedTasks.filter(t => 
              new Date(t.createdAt).toDateString() === new Date().toDateString()
            ).length}/{tasks.filter(t => 
              new Date(t.createdAt).toDateString() === new Date().toDateString()
            ).length} tasks completed
          </p>
          <p className="text-primary mt-4 italic">"{getRandomQuote()}"</p>
        </Card>
      </motion.div>
    </div>
  );
}
